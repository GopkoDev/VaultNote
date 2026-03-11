import { useState } from "react"
import { observer } from "mobx-react-lite"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookmarkIcon,
  DragDropVerticalIcon,
  Delete02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { bookmarksStore } from "@/store/bookmarks-store"
import { contentTabsStore } from "@/store/content-tabs-store"
import { modalStore } from "@/store/modal-store"
import type { Bookmark } from "@/types/bookmarks"
import { SideBarInput } from "@/components/own-ui/side-bar-input"
import SideBarBookmarksTools from "./side-bar-bookmarks-tools"

// ─── Add bookmark form ────────────────────────────────────────────────────────

function AddBookmarkForm({
  defaultName,
  onSubmit,
  onCancel,
}: {
  defaultName: string
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  return (
    <div className="mx-2 my-1 flex flex-col gap-1 rounded-md border border-sidebar-border bg-sidebar-accent px-2 py-2">
      <p className="text-xs text-muted-foreground">Bookmark name:</p>
      <SideBarInput
        defaultValue={defaultName}
        placeholder="Bookmark name…"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  )
}

// ─── Sortable bookmark item ───────────────────────────────────────────────────

function BookmarkItem({
  bookmark,
  isDragOverlay = false,
  onDelete,
}: {
  bookmark: Bookmark
  isDragOverlay?: boolean
  onDelete: (bookmark: Bookmark) => void
}) {
  const [isRenaming, setIsRenaming] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id })

  const style = isDragOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      }

  const openFile = () => {
    const name = bookmark.path.split("/").pop() ?? bookmark.name
    contentTabsStore.updateTabData({ path: bookmark.path, name })
  }

  const handleRenameSubmit = async (name: string) => {
    setIsRenaming(false)
    await bookmarksStore.rename(bookmark.id, name)
  }

  const folder = bookmark.path.split("/").slice(0, -1).join(" / ")

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
    >
      {isRenaming ? (
        <div className="px-2 py-0.5">
          <SideBarInput
            defaultValue={bookmark.name}
            placeholder="Bookmark name…"
            onSubmit={handleRenameSubmit}
            onCancel={() => setIsRenaming(false)}
          />
        </div>
      ) : (
        <div className="group/bookmark flex items-center gap-0 rounded-md">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex shrink-0 cursor-grab items-center justify-center px-1.5 py-1 text-muted-foreground/40 opacity-0 transition-opacity group-hover/bookmark:opacity-100 active:cursor-grabbing"
          >
            <HugeiconsIcon
              icon={DragDropVerticalIcon}
              size={13}
              strokeWidth={2}
            />
          </div>

          {/* Main clickable area */}
          <SidebarMenuButton
            onClick={openFile}
            className="h-auto flex-1 flex-col items-start gap-0.5 overflow-hidden py-1.5 pr-1 pl-0"
          >
            <div className="flex w-full items-center gap-1">
              <HugeiconsIcon
                icon={BookmarkIcon}
                size={13}
                strokeWidth={2}
                className="shrink-0 text-sidebar-primary"
              />
              <span className="truncate text-sm leading-tight font-medium">
                {bookmark.name}
              </span>
            </div>
            {folder && (
              <p className="w-full truncate pl-4 text-xs leading-tight text-muted-foreground">
                {folder}
              </p>
            )}
          </SidebarMenuButton>

          {/* Actions (rename + delete) */}
          <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover/bookmark:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsRenaming(true)
              }}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                size={13}
                strokeWidth={2}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bookmark)
              }}
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </SidebarMenuItem>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default observer(function SideBarBookmarks() {
  const { bookmarks } = bookmarksStore
  const [isAdding, setIsAdding] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  const handleAddBookmark = () => {
    setIsAdding(true)
  }

  const handleAddSubmit = async (name: string) => {
    const tab = contentTabsStore.activeTab
    if (!tab?.path) return
    setIsAdding(false)
    await bookmarksStore.create(name, tab.path)
  }

  const handleAddCancel = () => setIsAdding(false)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIds = bookmarks.map((b) => b.id)
    const oldIndex = oldIds.indexOf(Number(active.id))
    const newIndex = oldIds.indexOf(Number(over.id))
    const newIds = arrayMove(oldIds, oldIndex, newIndex)
    await bookmarksStore.reorder(newIds)
  }

  const handleDelete = (bookmark: Bookmark) => {
    modalStore.updateModalProps({
      confirm: true,
      title: "Remove bookmark?",
      description: `Remove "${bookmark.name}" from bookmarks. This cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        await bookmarksStore.remove(bookmark.id)
        modalStore.resetModalProps()
      },
      onCancel: () => modalStore.resetModalProps(),
      onClose: () => modalStore.resetModalProps(),
    })
  }

  const defaultAddName = (() => {
    const path = contentTabsStore.activeTab?.path ?? ""
    const filename = path.split("/").pop() ?? ""
    return filename.replace(/\.md$/, "")
  })()

  const activeBookmark = activeId
    ? bookmarks.find((b) => b.id === activeId)
    : null

  return (
    <>
      <SidebarGroup className="flex flex-1 flex-col gap-0 p-0">
        <SideBarBookmarksTools onAddBookmark={handleAddBookmark} />

        {/* New bookmark input */}
        {isAdding && (
          <AddBookmarkForm
            defaultName={defaultAddName}
            onSubmit={handleAddSubmit}
            onCancel={handleAddCancel}
          />
        )}

        <SidebarGroupContent className="flex flex-1 flex-col overflow-y-auto">
          {bookmarks.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-muted-foreground">
              <HugeiconsIcon
                icon={BookmarkIcon}
                size={32}
                strokeWidth={1.5}
                className="opacity-30"
              />
              <p className="text-sm">No bookmarks yet</p>
              <p className="text-xs">
                Open a file and click{" "}
                <span className="font-medium text-foreground">
                  Add bookmark
                </span>
              </p>
            </div>
          )}

          {/* Sortable list */}
          {bookmarks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={bookmarks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <SidebarMenu className="gap-0 px-2 py-1">
                  {bookmarks.map((bookmark) => (
                    <BookmarkItem
                      key={bookmark.id}
                      bookmark={bookmark}
                      onDelete={handleDelete}
                    />
                  ))}
                </SidebarMenu>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeBookmark && (
                  <div className="flex items-center gap-1.5 rounded-md border bg-sidebar px-2 py-1.5 text-sm shadow-lg">
                    <HugeiconsIcon
                      icon={BookmarkIcon}
                      size={13}
                      strokeWidth={2}
                      className="text-sidebar-primary"
                    />
                    <span>{activeBookmark.name}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
})
