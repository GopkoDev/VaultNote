import { useMemo } from "react"
import { observer } from "mobx-react-lite"
import { sideBarStore } from "@/store/side-bar-store"
import type { SideHeaderButtonType } from "@/store/types/side-bar-store.types"
import { SidebarContent } from "@/components/ui/sidebar"

import SideBarFilesTree from "./side-bar-files-tree"
import SideBarSearch from "./side-bar-search"
import SideBarBookmarks from "./side-bar-bookmarks"

const sideBarMenuButtonList: Record<SideHeaderButtonType, React.FC> = {
  archive: SideBarFilesTree,
  search: SideBarSearch,
  bookmark: SideBarBookmarks,
}

export default observer(function SideBarMenuSwitcher() {
  const { activeSideBarTab } = sideBarStore

  const Component = useMemo(() => {
    return sideBarMenuButtonList[activeSideBarTab]
  }, [activeSideBarTab])

  return (
    <SidebarContent>
      <Component />
    </SidebarContent>
  )
})
