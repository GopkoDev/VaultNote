import { useRef } from "react"
import { observer } from "mobx-react-lite"
import { useVirtualizer } from "@tanstack/react-virtual"
import { treeStore } from "@/store/tree-store"
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"

import SideBarTools from "./side-bar-tools"
import SideBarFileTreeRow, { INDENT_PX } from "./side-bar-file-tree-node"
import { SideBarNewItem } from "./side-bar-new-item"
import {
  SideBarRootDropArea,
  useSideBarTreeDnd,
  DndWrapper,
} from "./side-bar-tree-dnd"

const ROW_HEIGHT = 32

export default observer(function SideBarFilesTree() {
  const { flatVisibleNodes } = treeStore
  const { dndWrapperProps } = useSideBarTreeDnd()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: flatVisibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    paddingStart: 4,
    paddingEnd: 4,
    getItemKey: (index) => {
      const node = flatVisibleNodes[index]
      return node.kind === "item" ? node.item.path : "new"
    },
  })

  return (
    <SidebarGroup className="flex flex-1 flex-col p-0">
      <SideBarTools />

      <SidebarGroupContent className="flex min-h-0 flex-1 flex-col p-0">
        <DndWrapper {...dndWrapperProps}>
          <SideBarRootDropArea>
            <div
              ref={parentRef}
              className="min-h-0 flex-1 overflow-y-auto px-2"
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((vItem) => {
                  const node = flatVisibleNodes[vItem.index]
                  const isSelectedFolder =
                    node.kind === "item" &&
                    node.item.type === "directory" &&
                    treeStore.isFolderSelected(node.item.path)
                  return (
                    <div
                      key={vItem.key}
                      data-sidebar="menu-item"
                      className="group/menu-item relative"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${vItem.size}px`,
                        transform: `translateY(${vItem.start}px)`,
                        zIndex: isSelectedFolder ? 1 : undefined,
                      }}
                    >
                      {node.kind === "new" ? (
                        <div style={{ paddingLeft: node.depth * INDENT_PX }}>
                          <SideBarNewItem />
                        </div>
                      ) : (
                        <SideBarFileTreeRow
                          item={node.item}
                          depth={node.depth}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </SideBarRootDropArea>
        </DndWrapper>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})
