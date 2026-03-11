import { SidebarMenuButton } from "@/components/ui/sidebar"
import { treeStore } from "@/store/tree-store"
import type { FileItem } from "@/types/files"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  FileIcon,
  FolderIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { observer } from "mobx-react-lite"
import { contentTabsStore } from "@/store/content-tabs-store"
import SideBarFileContextMenu from "./side-bar-file-context-menu"
import SideBarFolderContextMenu from "./side-bar-folder-context-menu"
import { SideBarInput } from "@/components/own-ui/side-bar-input"
import { useSideBarFileTreeNode, DndItemWrapper } from "./side-bar-tree-dnd"

export const INDENT_PX = 10
const ARROW_OFFSET = 14
const RENAME_OFSFSET = ARROW_OFFSET + 26

const FOLDER_SELECTED =
  "bg-sidebar-primary/15 ring-1 ring-sidebar-primary/60 text-sidebar-primary font-medium"
const FILE_ACTIVE =
  "bg-sidebar-accent text-sidebar-accent-foreground border border-border "

export default observer(function SideBarFileTreeRow({
  item,
  depth,
}: {
  item: FileItem
  depth: number
}) {
  const {
    isFolderOpen,
    isFolderSelected,
    isRenaming,
    toggleFolder,
    setSelectedFolderPath,
    startRename,
    submitRename,
  } = treeStore

  const dndProps = useSideBarFileTreeNode(
    item,
    isFolderOpen(item.path),
    toggleFolder
  )

  const isSelected = isFolderSelected(item.path)
  const isNodeRenaming = isRenaming(item.path)
  const isActiveFile =
    item.type === "file" && contentTabsStore.activeTab?.path === item.path
  const paddingLeft = depth * INDENT_PX

  const onFileClick = () => {
    contentTabsStore.updateTabData({ path: item.path, name: item.name })
  }

  const onFolderClick = () => {
    toggleFolder(item.path)
    setSelectedFolderPath(item.path)
  }

  const onRenameAction = (name?: string) => {
    if (!name) startRename(null)
    else submitRename(item.path, name)
  }

  if (item.type === "file") {
    return (
      <SideBarFileContextMenu item={item}>
        <DndItemWrapper type="file" {...dndProps}>
          {isNodeRenaming ? (
            <div
              className="px-2 py-0.5"
              style={{ paddingLeft: paddingLeft + RENAME_OFSFSET }}
            >
              <SideBarInput
                defaultValue={item.name}
                placeholder="File name..."
                onSubmit={onRenameAction}
                onCancel={onRenameAction}
              />
            </div>
          ) : (
            <div style={{ marginLeft: paddingLeft + ARROW_OFFSET }}>
              <SidebarMenuButton
                onClick={onFileClick}
                className={cn(
                  "border border-transparent",
                  isActiveFile && FILE_ACTIVE
                )}
              >
                <HugeiconsIcon icon={FileIcon} size={15} strokeWidth={2} />
                <span className="truncate">{item.name}</span>
              </SidebarMenuButton>
            </div>
          )}
        </DndItemWrapper>
      </SideBarFileContextMenu>
    )
  }

  return (
    <SideBarFolderContextMenu item={item}>
      <DndItemWrapper type="directory" {...dndProps}>
        {isNodeRenaming ? (
          <div
            className="px-2 py-0.5"
            style={{ paddingLeft: paddingLeft + RENAME_OFSFSET }}
          >
            <SideBarInput
              defaultValue={item.name}
              placeholder="Folder name..."
              onSubmit={onRenameAction}
              onCancel={onRenameAction}
            />
          </div>
        ) : (
          <SidebarMenuButton
            onClick={onFolderClick}
            style={{ paddingLeft: paddingLeft }}
            className={cn(
              "transition-colors",
              "hover:bg-sidebar-primary/10 hover:ring-1 hover:ring-sidebar-primary/30",
              isSelected && FOLDER_SELECTED
            )}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={2}
              className={cn(
                "shrink-0 transition-transform",
                isFolderOpen(item.path) && "rotate-90"
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
        )}
      </DndItemWrapper>
    </SideBarFolderContextMenu>
  )
})
