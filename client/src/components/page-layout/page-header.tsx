import { SidebarTrigger } from "@/components/ui/sidebar"
import PageOpenedTabs from "./page-opened-tabs"
import { Separator } from "../ui/separator"

export default function PageHeader() {
  return (
    <>
      <header className="flex h-12 items-center gap-2 bg-sidebar px-4 text-sidebar-foreground">
        <SidebarTrigger
          variant="sidebar-tab"
          size="icon"
          className="self-center"
        />

        <PageOpenedTabs />
      </header>
      <Separator />
    </>
  )
}
