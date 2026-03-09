import { observer } from "mobx-react-lite"
import { treeStore } from "@/store/tree-store"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"

import SideBarTools from "./side-bar-tools"
import SideBarFileTreeNode from "./side-bar-file-tree-node"
import { SideBarNewItem } from "./side-bar-new-item"
import {
  SideBarRootDropArea,
  useSideBarTreeDnd,
  DndWrapper,
} from "./side-bar-tree-dnd"

export default observer(function SideBarFilesTree() {
  const { tree, creatingIn } = treeStore
  const { dndWrapperProps } = useSideBarTreeDnd()

  const onMenuClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation()
  }

  return (
    <SidebarGroup className="flex flex-1 flex-col p-0">
      <SideBarTools />

      <SidebarGroupContent className="flex flex-1 flex-col p-0">
        <DndWrapper {...dndWrapperProps}>
          <SideBarRootDropArea>
            <SidebarMenu className="gap-0.5 px-2 py-1" onClick={onMenuClick}>
              {tree.map((item) => (
                <SideBarFileTreeNode key={item.path} item={item} />
              ))}

              {creatingIn?.parentPath === null && <SideBarNewItem />}
            </SidebarMenu>
          </SideBarRootDropArea>
        </DndWrapper>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})
