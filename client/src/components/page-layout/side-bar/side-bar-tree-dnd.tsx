import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useCallback, useEffect, useState } from "react"
import type { FileItem } from "@/types/files"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileIcon, FolderIcon } from "@hugeicons/core-free-icons"
import { observer } from "mobx-react-lite"
import { treeStore } from "@/store/tree-store"
import { cn } from "@/lib/utils"

const FOLDER_DND_HOVER =
  "ring-1 ring-inset ring-sidebar-primary/60 bg-sidebar-primary/10"

const customCollision: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  const folders = within.filter(({ id }) => String(id) !== "drop:")
  if (folders.length > 0) return [folders[0]]
  if (within.length > 0) return [within[0]]
  return closestCenter(args)
}

interface DndWrapperProps {
  children: React.ReactNode
  sensors: ReturnType<typeof useSensors>
  activeDragItem: FileItem | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => Promise<void>
}

function DndWrapper({
  children,
  sensors,
  activeDragItem,
  onDragStart,
  onDragEnd,
}: DndWrapperProps) {
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollision}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeDragItem && <DragGhost item={activeDragItem} />}
        </DragOverlay>
      </DndContext>
    </>
  )
}

function useSideBarTreeDnd() {
  const [activeDragItem, setActiveDragItem] = useState<FileItem | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const item = event.active.data.current?.item as FileItem | undefined
    if (item) setActiveDragItem(item)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragItem(null)
    const { active, over } = event
    if (!over) return

    const draggedPath = String(active.id)
    const overId = String(over.id)

    if (!overId.startsWith("drop:")) return

    const targetFolderPath = overId.slice(5)

    // Prevent dropping onto itself or its own descendants
    if (draggedPath === targetFolderPath) return
    if (targetFolderPath.startsWith(draggedPath + "/")) return

    // API expects full new path including filename (e.g. "folder/file.md")
    const filename = draggedPath.split("/").pop()!
    const newPath = targetFolderPath
      ? `${targetFolderPath}/${filename}`
      : filename

    // Already in target — nothing to do
    if (newPath === draggedPath) return

    await treeStore.moveFile(draggedPath, newPath)
  }

  return {
    DndWrapper,
    dndWrapperProps: {
      sensors,
      activeDragItem,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  }
}

function useSideBarFileTreeNode(
  item: FileItem,
  isOpen: boolean,
  openFolder: (path: string) => void
) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: item.path, data: { item } })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${item.path}`,
    data: { item },
    disabled: item.type !== "directory",
  })

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node)
      if (item.type === "directory") setDropRef(node)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDragRef, setDropRef]
  )

  // Auto-open folder after hovering over it during DnD
  useEffect(() => {
    if (!isOver || item.type !== "directory" || isOpen) return
    const id = setTimeout(() => openFolder(item.path), 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOver])

  return {
    setRef,
    isDragging,
    isOver,
    attributes,
    listeners,
  }
}

function DndItemWrapper({
  type,
  setRef,
  isDragging,
  isOver,
  attributes,
  listeners,
  children,
}: {
  type: "file" | "directory"
  setRef: (node: HTMLElement | null) => void
  isDragging: boolean
  isOver: boolean
  attributes: ReturnType<typeof useDraggable>["attributes"]
  listeners: ReturnType<typeof useDraggable>["listeners"]
  children: React.ReactNode
}) {
  const isNeedStyles = type === "directory" && isOver
  return (
    <div
      ref={setRef}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={
        isNeedStyles
          ? cn(
              "rounded-md transition-all",
              // Ring wraps the ENTIRE folder zone (button + children) during DnD hover
              isOver && FOLDER_DND_HOVER
            )
          : ""
      }
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

function DragGhost({ item }: { item: FileItem }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border bg-sidebar px-2 py-1 text-sm shadow-lg">
      <HugeiconsIcon
        icon={item.type === "file" ? FileIcon : FolderIcon}
        size={14}
        strokeWidth={2}
      />
      <span>{item.name}</span>
    </div>
  )
}

const SideBarRootDropArea = observer(function SideBarRootDropArea({
  children,
}: {
  children: React.ReactNode
}) {
  const { setSelectedFolderPath } = treeStore
  const { setNodeRef, isOver } = useDroppable({ id: "drop:" })

  const onRootClick = () => {
    setSelectedFolderPath(null)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-1 flex-col rounded-md transition-colors",
        isOver && "bg-primary/5"
      )}
      onClick={onRootClick}
    >
      {children}
      {/* Fills remaining height so click-to-deselect and DnD-to-root work anywhere */}
      <div className="flex-1" />
    </div>
  )
})

export {
  useSideBarTreeDnd,
  DndWrapper,
  useSideBarFileTreeNode,
  DndItemWrapper,
  SideBarRootDropArea,
}
