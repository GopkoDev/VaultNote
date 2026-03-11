import { observer } from "mobx-react-lite"
import { SidebarGroupLabel } from "@/components/ui/sidebar"
import { BookmarkAdd02Icon, Refresh01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { bookmarksStore } from "@/store/bookmarks-store"
import { contentTabsStore } from "@/store/content-tabs-store"
import { toast } from "sonner"

interface SideBarBookmarksToolsProps {
  onAddBookmark: () => void
}

export default observer(function SideBarBookmarksTools({
  onAddBookmark,
}: SideBarBookmarksToolsProps) {
  const { load } = bookmarksStore

  const handleAdd = () => {
    const tab = contentTabsStore.activeTab
    if (!tab?.path) {
      toast.info("Open a file to bookmark it")
      return
    }
    onAddBookmark()
  }

  const actions = [
    {
      icon: BookmarkAdd02Icon,
      label: "Add bookmark",
      onClick: handleAdd,
    },
    {
      icon: Refresh01Icon,
      label: "Refresh",
      onClick: load,
    },
  ]

  return (
    <SidebarGroupLabel asChild>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs tracking-wider text-sidebar-foreground/70 uppercase">
          Bookmarks
        </span>
        <div className="flex items-center gap-1">
          {actions.map(({ icon, label, onClick }) => (
            <Tooltip key={label} delayDuration={2000}>
              <TooltipTrigger asChild>
                <Button
                  onClick={onClick}
                  disabled={false}
                  variant="ghost"
                  size="icon-sm"
                >
                  <HugeiconsIcon icon={icon} size={15} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </SidebarGroupLabel>
  )
})
