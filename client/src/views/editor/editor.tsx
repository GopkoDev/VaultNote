import { useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { CodeBlockLowlightMermaid } from "tiptap-extension-mermaid"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Highlight } from "@tiptap/extension-highlight"
import { Typography } from "@tiptap/extension-typography"
import { Placeholder } from "@tiptap/extension-placeholder"
import { common, createLowlight } from "lowlight"
import mermaid from "mermaid"

import { contentStore } from "@/store/content-store"

const lowlight = createLowlight(common)

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "dark",
})

// prosemirror-mermaid calls console.error on every incomplete parse during typing.
// We filter those out to keep the console clean.
const _originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  const msg = args[0]
  if (msg instanceof Error && /Parse error|Lexical error/i.test(msg.message))
    return
  if (typeof msg === "string" && /Parse error|Lexical error/i.test(msg)) return
  _originalConsoleError(...args)
}

export default observer(function Editor() {
  const [isEditable, setIsEditable] = useState(false)
  const [saving, setSaving] = useState(false)

  const { content, currentPath } = contentStore

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Markdown.configure({ html: false, tightLists: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      CodeBlockLowlightMermaid.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: true, autolink: true }),
      Image,
      Highlight.configure({ multicolor: false }),
      Typography,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content,
    editable: isEditable,
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none outline-none",
      },
    },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const current = editor.storage.markdown.getMarkdown()
    if (current !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleSave = useCallback(async () => {
    if (!currentPath || !editor) return
    const markdown = editor.storage.markdown.getMarkdown()
    setSaving(true)
    await contentStore.saveContent(currentPath, markdown)
    setSaving(false)
  }, [editor, currentPath])

  const toggleEditable = useCallback(async () => {
    const next = !isEditable
    setIsEditable(next)
    editor?.setEditable(next)
    if (!next) await handleSave()
  }, [editor, isEditable, handleSave])

  if (!currentPath) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a file to open
      </div>
    )
  }

  if (!editor) return null

  return (
    <div className="mx-auto max-w-[800px]">
      <EditorContent editor={editor} />
    </div>
  )
})
