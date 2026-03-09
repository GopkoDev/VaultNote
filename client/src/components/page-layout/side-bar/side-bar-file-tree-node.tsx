import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import { treeStore } from "@/store/tree-store"
import type { FileItem } from "@/types/files"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  FileIcon,
  FolderIcon,
} from "@hugeicons/core-free-icons"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { observer } from "mobx-react-lite"
import { contentTabsStore } from "@/store/content-tabs-store"
import SideBarFileContextMenu from "./side-bar-file-context-menu"
import SideBarFolderContextMenu from "./side-bar-folder-context-menu"
import { SideBarInput } from "@/components/own-ui/side-bar-input"
import { SideBarNewItem } from "./side-bar-new-item"
import { useSideBarFileTreeNode, DndItemWrapper } from "./side-bar-tree-dnd"

const FOLDER_SELECTED =
  "bg-sidebar-primary/15 ring-1 ring-sidebar-primary/60 text-sidebar-primary font-medium"

export default observer(function SideBarFileTreeNode({
  item,
}: {
  item: FileItem
}) {
  const {
    isFolderOpen,
    isFolderSelected,
    isRenaming,
    isCreatingHere,
    toggleFolder,
    setSelectedFolderPath,
    startRename,
    submitRename,
    creatingIn,
  } = treeStore

  const dndProps = useSideBarFileTreeNode(
    item,
    isFolderOpen(item.path),
    toggleFolder
  )

  const isSelected = isFolderSelected(item.path)
  const isNodeRenaming = isRenaming(item.path)
  const isCreatingInNode = isCreatingHere(item.path)

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
      <SidebarMenuItem>
        <SideBarFileContextMenu item={item}>
          <DndItemWrapper type="file" {...dndProps}>
            {isNodeRenaming ? (
              <div className="px-2 py-0.5">
                <SideBarInput
                  defaultValue={item.name}
                  placeholder="File name..."
                  onSubmit={onRenameAction}
                  onCancel={onRenameAction}
                />
              </div>
            ) : (
              <SidebarMenuButton onClick={onFileClick}>
                <HugeiconsIcon icon={FileIcon} size={15} strokeWidth={2} />
                <span className="truncate">{item.name}</span>
              </SidebarMenuButton>
            )}
          </DndItemWrapper>
        </SideBarFileContextMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem className="mb-0.5 last:mb-0">
      <SideBarFolderContextMenu item={item}>
        <DndItemWrapper type="directory" {...dndProps}>
          <Collapsible
            open={isFolderOpen(item.path)}
            onOpenChange={onFolderClick}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              {isNodeRenaming ? (
                <div className="px-2 py-0.5">
                  <SideBarInput
                    defaultValue={item.name}
                    placeholder="Folder name..."
                    onSubmit={onRenameAction}
                    onCancel={onRenameAction}
                  />
                </div>
              ) : (
                <SidebarMenuButton
                  className={cn(
                    "transition-all",
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
            </CollapsibleTrigger>

            <CollapsibleContent>
              {((item.children?.length ?? 0) > 0 ||
                (isCreatingInNode && !!creatingIn)) && (
                <SidebarMenuSub className="gap-0.5">
                  {item.children?.map((child) => (
                    <SideBarFileTreeNode key={child.path} item={child} />
                  ))}
                  {isCreatingInNode && creatingIn && <SideBarNewItem />}
                </SidebarMenuSub>
              )}
            </CollapsibleContent>
          </Collapsible>
        </DndItemWrapper>
      </SideBarFolderContextMenu>
    </SidebarMenuItem>
  )
})
