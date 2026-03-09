import { observer } from "mobx-react-lite"
import { SidebarHeader } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SideHeaderButton } from "@/components/own-ui/side-header-button"
import { type SideHeaderButtonType } from "@/store/types/side-bar-store.types"
import { sideBarStore } from "@/store/side-bar-store"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sideHeaderButtonList: SideHeaderButtonType[] = [
  "archive",
  "search",
  "bookmark",
]

const sideHeaderButtonTooltipList: Record<SideHeaderButtonType, string> = {
  archive: "Catalog",
  search: "Search",
  bookmark: "Bookmark",
}

export default observer(function SideBarHeader() {
  const { activeSideBarTab, setActiveSideBarTab } = sideBarStore
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {sideHeaderButtonList.map((tab) => (
            <Tooltip
              key={sideHeaderButtonTooltipList[tab]}
              delayDuration={2000}
            >
              <TooltipTrigger asChild>
                <SideHeaderButton
                  key={tab}
                  type={tab}
                  isActive={activeSideBarTab === tab}
                  onClick={() => setActiveSideBarTab(tab)}
                />
              </TooltipTrigger>

              <TooltipContent side="bottom">
                {sideHeaderButtonTooltipList[tab]}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </SidebarHeader>

      <Separator />
    </>
  )
})
