import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileIcon,
  FolderIcon,
  ArrowRight01Icon,
  Add01Icon,
  FolderAddIcon,
  Loading03Icon,
  RefreshIcon,
  ArrowShrink01Icon,
  DeleteThrowIcon,
  PencilIcon,
} from "@hugeicons/core-free-icons"
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

import type { FileItem } from "@/types/files"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { filesStore } from "@/store/files-store"
import { contentStore } from "@/store/content-store"
import { observer } from "mobx-react-lite"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Sidebar context ──────────────────────────────────────────────────────────

interface CreatingState {
  parentPath: string | null
  type: "file" | "directory"
}

interface SidebarCtxValue {
  selectedFolderPath: string | null
  openFolders: Set<string>
  creatingIn: CreatingState | null
  renamingPath: string | null
  setSelectedFolderPath: (path: string | null) => void
  openFolder: (path: string) => void
  toggleFolder: (path: string) => void
  startCreate: (parentPath: string | null, type: "file" | "directory") => void
  startRename: (path: string) => void
  requestDelete: (item: FileItem) => void
  submitCreate: (name: string) => void
  submitRename: (path: string, newName: string) => void
  cancelEdit: () => void
  onFileClick: (item: FileItem) => void
}

const SidebarCtx = React.createContext<SidebarCtxValue | null>(null)

function useSidebarCtx() {
  const ctx = React.useContext(SidebarCtx)
  if (!ctx) throw new Error("SidebarCtx not found")
  return ctx
}

// ─── Inline input ─────────────────────────────────────────────────────────────

interface InlineInputProps {
  defaultValue?: string
  placeholder: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

function InlineInput({
  defaultValue = "",
  placeholder,
  onSubmit,
  onCancel,
}: InlineInputProps) {
  const [value, setValue] = React.useState(defaultValue)
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    if (defaultValue) {
      const dot = defaultValue.lastIndexOf(".")
      el.setSelectionRange(0, dot > 0 ? dot : defaultValue.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (value.trim()) onSubmit(value.trim())
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  function handleBlur() {
    if (value.trim()) onSubmit(value.trim())
    else onCancel()
  }

  return (
    <Input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="h-6 rounded-sm px-1.5 py-0 text-xs"
    />
  )
}

// ─── New item row (inline input with icon) ────────────────────────────────────

function NewItemRow({
  type,
  onSubmit,
  onCancel,
}: {
  type: "file" | "directory"
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-1.5 px-2 py-0.5">
        <HugeiconsIcon
          icon={type === "file" ? FileIcon : FolderIcon}
          size={14}
          strokeWidth={2}
          className="shrink-0 text-sidebar-foreground/50"
        />
        <InlineInput
          placeholder={type === "file" ? "file.md" : "folder"}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </SidebarMenuItem>
  )
}

// ─── Collision detection: specific folder droppables beat root ────────────────

const customCollision: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  const folders = within.filter(({ id }) => String(id) !== "drop:")
  if (folders.length > 0) return [folders[0]]
  if (within.length > 0) return [within[0]]
  return closestCenter(args)
}

// ─── Root drop area ───────────────────────────────────────────────────────────

function RootDropArea({ children }: { children: React.ReactNode }) {
  const ctx = useSidebarCtx()
  const { setNodeRef, isOver } = useDroppable({ id: "drop:" })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-1 flex-col rounded-md transition-colors",
        isOver && "bg-primary/5"
      )}
      onClick={() => ctx.setSelectedFolderPath(null)}
    >
      {children}
      {/* Fills remaining height so click-to-deselect and DnD-to-root work anywhere */}
      <div className="flex-1" />
    </div>
  )
}

// ─── Tree node ────────────────────────────────────────────────────────────────

// Uses sidebar-primary which has correct contrast in both light and dark modes
const FOLDER_SELECTED =
  "bg-sidebar-primary/15 ring-1 ring-sidebar-primary/60 text-sidebar-primary font-medium"
const FOLDER_DND_HOVER =
  "ring-1 ring-inset ring-sidebar-primary/60 bg-sidebar-primary/10"

function FileTreeNode({ item }: { item: FileItem }) {
  const ctx = useSidebarCtx()

  const isSelected = ctx.selectedFolderPath === item.path
  const isRenaming = ctx.renamingPath === item.path
  const isOpen = item.type === "directory" && ctx.openFolders.has(item.path)
  const isCreatingHere = ctx.creatingIn?.parentPath === item.path

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

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node)
      if (item.type === "directory") setDropRef(node)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setDragRef, setDropRef]
  )

  // Auto-open folder after hovering over it during DnD
  React.useEffect(() => {
    if (!isOver || item.type !== "directory" || isOpen) return
    const id = setTimeout(() => ctx.openFolder(item.path), 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOver])

  if (item.type === "file") {
    return (
      <SidebarMenuItem className="mb-0.5 last:mb-0">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={setRef}
              style={{ opacity: isDragging ? 0.4 : 1 }}
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              {isRenaming ? (
                <div className="px-2 py-0.5">
                  <InlineInput
                    defaultValue={item.name}
                    placeholder="File name..."
                    onSubmit={(name) => ctx.submitRename(item.path, name)}
                    onCancel={ctx.cancelEdit}
                  />
                </div>
              ) : (
                <SidebarMenuButton onClick={() => ctx.onFileClick(item)}>
                  <HugeiconsIcon icon={FileIcon} size={15} strokeWidth={2} />
                  <span className="truncate">{item.name}</span>
                </SidebarMenuButton>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => ctx.startRename(item.path)}>
              <HugeiconsIcon
                icon={PencilIcon}
                size={14}
                strokeWidth={2}
                className="mr-2"
              />
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onSelect={() => ctx.requestDelete(item)}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon
                icon={DeleteThrowIcon}
                size={14}
                strokeWidth={2}
                className="mr-2"
              />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </SidebarMenuItem>
    )
  }

  // Folder
  return (
    <SidebarMenuItem className="mb-0.5 last:mb-0">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setRef}
            style={{ opacity: isDragging ? 0.4 : 1 }}
            className={cn(
              "rounded-md transition-all",
              // Ring wraps the ENTIRE folder zone (button + children) during DnD hover
              isOver && FOLDER_DND_HOVER
            )}
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <Collapsible
              open={isOpen}
              onOpenChange={() => ctx.toggleFolder(item.path)}
              className="group/collapsible"
            >
              {isRenaming ? (
                <div className="px-2 py-0.5">
                  <InlineInput
                    defaultValue={item.name}
                    placeholder="Folder name..."
                    onSubmit={(name) => ctx.submitRename(item.path, name)}
                    onCancel={ctx.cancelEdit}
                  />
                </div>
              ) : (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      "transition-all",
                      "hover:bg-sidebar-primary/10 hover:ring-1 hover:ring-sidebar-primary/30",
                      isSelected && FOLDER_SELECTED
                    )}
                    onClick={() => ctx.setSelectedFolderPath(item.path)}
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={2}
                      className={cn(
                        "shrink-0 transition-transform",
                        isOpen && "rotate-90"
                      )}
                    />
                    <HugeiconsIcon
                      icon={FolderIcon}
                      size={15}
                      strokeWidth={2}
                      className="shrink-0"
                    />
                    <span className="truncate">{item.name}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              )}

              <CollapsibleContent>
                {/* Only render sub-menu when there's content — prevents empty indent */}
                {((item.children?.length ?? 0) > 0 ||
                  (isCreatingHere && !!ctx.creatingIn)) && (
                  <SidebarMenuSub className="gap-0.5">
                    {item.children?.map((child) => (
                      <FileTreeNode key={child.path} item={child} />
                    ))}
                    {isCreatingHere && ctx.creatingIn && (
                      <NewItemRow
                        type={ctx.creatingIn.type}
                        onSubmit={ctx.submitCreate}
                        onCancel={ctx.cancelEdit}
                      />
                    )}
                  </SidebarMenuSub>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onSelect={() => ctx.startCreate(item.path, "file")}>
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              strokeWidth={2}
              className="mr-2"
            />
            New file
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => ctx.startCreate(item.path, "directory")}
          >
            <HugeiconsIcon
              icon={FolderAddIcon}
              size={14}
              strokeWidth={2}
              className="mr-2"
            />
            New folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => ctx.startRename(item.path)}>
            <HugeiconsIcon
              icon={PencilIcon}
              size={14}
              strokeWidth={2}
              className="mr-2"
            />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => ctx.requestDelete(item)}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon
              icon={DeleteThrowIcon}
              size={14}
              strokeWidth={2}
              className="mr-2"
            />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuItem>
  )
}

// ─── Drag overlay ghost ───────────────────────────────────────────────────────

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

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  onNewFile: () => void
  onNewFolder: () => void
  onRefresh: () => void
  onCollapseAll: () => void
  loading: boolean
}

function SidebarToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
  onCollapseAll,
  loading,
}: ToolbarProps) {
  const actions = [
    { icon: Add01Icon, label: "New file", onClick: onNewFile },
    { icon: FolderAddIcon, label: "New folder", onClick: onNewFolder },
    { icon: RefreshIcon, label: "Refresh", onClick: onRefresh, spin: loading },
    { icon: ArrowShrink01Icon, label: "Collapse all", onClick: onCollapseAll },
  ]

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">
        Files
      </span>
      <div className="flex items-center gap-1">
        {actions.map(({ icon, label, onClick, spin }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                onClick={onClick}
                disabled={spin}
                className="rounded p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-40"
              >
                <HugeiconsIcon
                  icon={icon}
                  size={15}
                  strokeWidth={2}
                  className={spin ? "animate-spin" : undefined}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export const AppSidebar = observer(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const [selectedFolderPath, setSelectedFolderPath] = React.useState<
      string | null
    >(null)
    const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set())
    const [creatingIn, setCreatingIn] = React.useState<CreatingState | null>(
      null
    )
    const [renamingPath, setRenamingPath] = React.useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = React.useState<FileItem | null>(
      null
    )
    const [activeDragItem, setActiveDragItem] = React.useState<FileItem | null>(
      null
    )

    const tree = filesStore.tree
    const loading = filesStore.loading
    const error = filesStore.error

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      })
    )

    function openFolder(path: string) {
      setOpenFolders((prev) => new Set([...prev, path]))
    }

    function toggleFolder(path: string) {
      const isCurrentlyOpen = openFolders.has(path)

      setOpenFolders((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })

      // Deselect if the selected folder is inside the one being collapsed
      if (
        isCurrentlyOpen &&
        selectedFolderPath &&
        (selectedFolderPath === path ||
          selectedFolderPath.startsWith(path + "/"))
      ) {
        setSelectedFolderPath(null)
      }
    }

    function startCreate(
      parentPath: string | null,
      type: "file" | "directory"
    ) {
      setCreatingIn({ parentPath, type })
      if (parentPath) openFolder(parentPath)
    }

    function startRename(path: string) {
      setRenamingPath(path)
    }

    function requestDelete(item: FileItem) {
      setDeleteTarget(item)
    }

    async function submitCreate(name: string) {
      if (!creatingIn) return
      const { parentPath, type } = creatingIn
      const fullPath = parentPath ? `${parentPath}/${name}` : name
      setCreatingIn(null)
      const res = await filesStore.createItem(fullPath, type)
      if (!res.ok) toast.error(res.error)
    }

    async function submitRename(path: string, newName: string) {
      setRenamingPath(null)
      const res = await filesStore.renameFile(path, newName)
      if (!res.ok) toast.error(res.error)
    }

    function cancelEdit() {
      setCreatingIn(null)
      setRenamingPath(null)
    }

    async function handleDeleteConfirm() {
      if (!deleteTarget) return
      const target = deleteTarget
      setDeleteTarget(null)
      const res = await filesStore.deleteFile(target.path)
      if (!res.ok) toast.error(res.error)
    }

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

      const res = await filesStore.moveFile(draggedPath, newPath)
      if (!res.ok) toast.error(res.error)
    }

    const ctxValue: SidebarCtxValue = {
      selectedFolderPath,
      openFolders,
      creatingIn,
      renamingPath,
      setSelectedFolderPath,
      openFolder,
      toggleFolder,
      startCreate,
      startRename,
      requestDelete,
      submitCreate,
      submitRename,
      cancelEdit,
      onFileClick: (item) => contentStore.openFile(item),
    }

    return (
      <SidebarCtx.Provider value={ctxValue}>
        <DndContext
          sensors={sensors}
          collisionDetection={customCollision}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Sidebar {...props}>
            <SidebarContent className="flex flex-col">
              <SidebarGroup className="flex flex-1 flex-col p-0">
                <SidebarGroupLabel asChild>
                  <SidebarToolbar
                    onNewFile={() => startCreate(selectedFolderPath, "file")}
                    onNewFolder={() =>
                      startCreate(selectedFolderPath, "directory")
                    }
                    onRefresh={() => filesStore.loadTree()}
                    onCollapseAll={() => {
                      setOpenFolders(new Set())
                      setSelectedFolderPath(null)
                    }}
                    loading={loading}
                  />
                </SidebarGroupLabel>

                <SidebarGroupContent className="flex flex-1 flex-col p-0">
                  <RootDropArea>
                    <SidebarMenu className="gap-0.5 px-2 py-1">
                      {loading && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/50">
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={14}
                            strokeWidth={2}
                            className="animate-spin"
                          />
                          Loading...
                        </div>
                      )}

                      {error && (
                        <div className="px-3 py-2 text-sm text-red-500">
                          {error}
                        </div>
                      )}

                      {!loading && !error && (
                        <>
                          {tree.map((item) => (
                            <FileTreeNode key={item.path} item={item} />
                          ))}

                          {creatingIn?.parentPath === null && (
                            <NewItemRow
                              type={creatingIn.type}
                              onSubmit={submitCreate}
                              onCancel={cancelEdit}
                            />
                          )}
                        </>
                      )}
                    </SidebarMenu>
                  </RootDropArea>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>

          <DragOverlay dropAnimation={null}>
            {activeDragItem && <DragGhost item={activeDragItem} />}
          </DragOverlay>
        </DndContext>

        {/* Delete confirmation */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete &ldquo;{deleteTarget?.name}&rdquo;?
              </DialogTitle>
              <DialogDescription>
                {deleteTarget?.type === "directory"
                  ? "This will permanently delete the folder and all its contents."
                  : "This will permanently delete the file."}{" "}
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarCtx.Provider>
    )
  }
)
