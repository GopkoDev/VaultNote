import { Sidebar, SidebarRail } from "@/components/ui/sidebar"

import SideBarHeader from "./side-bar-header"
import SideBarFooterContent from "./side-bar-footer-content"
import SideBarMenuSwitcher from "./side-bar-menu-swither"

export default function SideBar() {
  return (
    <Sidebar>
      <SideBarHeader />
      <SideBarMenuSwitcher />
      <SideBarFooterContent />

      <SidebarRail />
    </Sidebar>
  )
}
