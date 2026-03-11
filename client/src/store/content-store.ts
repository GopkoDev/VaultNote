import {
  makeAutoObservable,
  observable,
  reaction,
  runInAction,
  comparer,
} from "mobx"
import { Editor } from "@tiptap/core"
import { filesApi } from "@/api/files"
import { contentTabsStore } from "./content-tabs-store"
import { toast } from "sonner"
import { createEditorExtensions, EDITOR_CLASS } from "@/lib/editor-extensions"

interface TabEditorState {
  editor: Editor
  path: string
  autoSaveTimer: ReturnType<typeof setTimeout> | null
  disposeUpdateListener: () => void
}

class ContentStore {
  currentPath: string | null = null
  private _activeEditorRef: Editor | null = null
  private _tabEditors: Map<number, TabEditorState> = new Map()

  constructor() {
    makeAutoObservable(
      this,
      {
        _activeEditorRef: observable.ref,
        _tabEditors: false,
      } as object,
      { autoBind: true }
    )

    // Watch tab switches
    reaction(
      () => ({
        tabId: contentTabsStore.activeTab?.id ?? null,
        path: contentTabsStore.activeTab?.path ?? null,
      }),
      ({ tabId, path }, prev) => {
        // Flush pending save before leaving the previous context:
        // - switching to a different tab
        // - opening a different file within the same tab
        if (prev?.tabId != null) {
          if (prev.tabId !== tabId) {
            this._flushSave(prev.tabId)
          } else if (prev.path !== path) {
            this._flushSave(tabId)
          }
        }

        runInAction(() => {
          this.currentPath = path
          this._activeEditorRef =
            tabId != null ? (this._tabEditors.get(tabId)?.editor ?? null) : null
        })

        if (tabId != null && path) {
          this._loadContentForTab(tabId, path)
        }
      },
      { fireImmediately: true, equals: comparer.structural }
    )

    // Sync mode changes to the active editor
    reaction(
      () => contentTabsStore.currentTabMode,
      (mode) => {
        const editor = this._activeEditorRef
        if (editor && !editor.isDestroyed) {
          editor.setEditable(mode === "edit")
        }
      }
    )

    // Destroy editors for closed tabs
    reaction(
      () => Object.keys(contentTabsStore.openedTabs).map(Number),
      (tabIds) => {
        const tabIdSet = new Set(tabIds)
        for (const tabId of this._tabEditors.keys()) {
          if (!tabIdSet.has(tabId)) {
            this._destroyTabEditor(tabId)
          }
        }
      }
    )
  }

  get activeEditor(): Editor | null {
    return this._activeEditorRef
  }

  private _createTabEditor(tabId: number, path: string): TabEditorState {
    // Use a ref so the task-item toggle callback can access the editor
    // after it is fully constructed.
    const editorRef = { current: null as Editor | null }

    const extensions = createEditorExtensions({
      onTaskItemToggle: (node, checked) => {
        const editor = editorRef.current
        if (!editor || editor.isDestroyed) return
        editor.state.doc.descendants((n, pos) => {
          if (n !== node) return
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, {
              ...n.attrs,
              checked,
            })
          )
          return false
        })
      },
    })

    const editor = new Editor({
      extensions,
      editorProps: { attributes: { class: EDITOR_CLASS } },
    })

    editorRef.current = editor

    const handleUpdate = () => {
      const state = this._tabEditors.get(tabId)
      if (!state) return
      if (state.autoSaveTimer) clearTimeout(state.autoSaveTimer)
      state.autoSaveTimer = setTimeout(() => {
        state.autoSaveTimer = null
        this._saveForState(state)
      }, 500)
    }

    editor.on("update", handleUpdate)

    const state: TabEditorState = {
      editor,
      path,
      autoSaveTimer: null,
      disposeUpdateListener: () => editor.off("update", handleUpdate),
    }

    this._tabEditors.set(tabId, state)
    return state
  }

  private _flushSave(tabId: number) {
    const state = this._tabEditors.get(tabId)
    if (!state?.autoSaveTimer) return
    clearTimeout(state.autoSaveTimer)
    state.autoSaveTimer = null
    this._saveForState(state)
  }

  private _saveForState(state: TabEditorState) {
    if (state.editor.isDestroyed) return
    const markdown = state.editor.storage.markdown.getMarkdown()
    filesApi.update(state.path, markdown)
  }

  private _destroyTabEditor(tabId: number) {
    const state = this._tabEditors.get(tabId)
    if (!state) return
    this._flushSave(tabId)
    state.disposeUpdateListener()
    state.editor.destroy()
    this._tabEditors.delete(tabId)
  }

  private async _loadContentForTab(tabId: number, path: string) {
    const res = await filesApi.getContent(path)

    runInAction(() => {
      // Ignore stale responses if the tab changed while loading
      if (this.currentPath !== path) return

      if (res.ok) {
        let state = this._tabEditors.get(tabId)
        if (!state) {
          state = this._createTabEditor(tabId, path)
        } else if (state.path !== path) {
          // Same tab editor, but a different file was opened.
          // Update the path so any subsequent autosave targets the correct file.
          state.path = path
        }

        const mode = contentTabsStore.activeTab?.mode ?? "view"
        state.editor.setEditable(mode === "edit")
        state.editor.commands.setContent(res.data.content)
        // clearHistory is provided by the History extension (part of StarterKit)
        ;(
          state.editor.commands as unknown as Record<string, () => void>
        ).clearHistory?.()

        // setContent fires the "update" event and queues an autosave timer.
        // Cancel it — the content was just loaded from disk, nothing to save yet.
        if (state.autoSaveTimer) {
          clearTimeout(state.autoSaveTimer)
          state.autoSaveTimer = null
        }

        this._activeEditorRef = state.editor
      } else {
        toast.error(`Failed to load file: ${path}`)
        console.warn(res.error)
      }
    })
  }
}

export const contentStore = new ContentStore()
