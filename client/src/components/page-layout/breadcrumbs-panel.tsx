import { Fragment } from "react"
import { observer } from "mobx-react-lite"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "../ui/button"
import { contentTabsStore } from "@/store/content-tabs-store"
import { bookmarksStore } from "@/store/bookmarks-store"
import { modalStore } from "@/store/modal-store"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit02Icon,
  BookOpen01Icon,
  BookmarkIcon,
} from "@hugeicons/core-free-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

const MAX_VISIBLE = 3

export default observer(function BreadcrumbsPanel() {
  const { activeTab, currentTabMode, toggleMode } = contentTabsStore

  const segments = activeTab?.path
    ? activeTab.path.split("/").filter(Boolean)
    : []

  const activeBookmarks = activeTab?.path
    ? bookmarksStore.bookmarksForPath(activeTab.path)
    : []
  const isBookmarked = activeBookmarks.length > 0

  // first + ellipsis + tail (MAX_VISIBLE - 1 last segments)
  const hasEllipsis = segments.length > MAX_VISIBLE
  const firstSegment = segments[0]
  const tailSegments = hasEllipsis
    ? segments.slice(-(MAX_VISIBLE - 1))
    : segments.slice(1)

  const handleBookmarkClick = () => {
    const bookmark = activeBookmarks[0]
    if (!bookmark) return

    modalStore.updateModalProps({
      confirm: true,
      title: "Remove bookmark?",
      description: `Remove "${bookmark.name}" from bookmarks. This cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        await bookmarksStore.remove(bookmark.id)
        modalStore.resetModalProps()
      },
      onCancel: () => modalStore.resetModalProps(),
      onClose: () => modalStore.resetModalProps(),
    })
  }

  return (
    <>
      <section className="flex items-center justify-between gap-2 px-4">
        <section className="h-8 w-8"></section>

        <Breadcrumb>
          <BreadcrumbList>
            {segments.length <= 1 ? (
              <BreadcrumbItem>
                <BreadcrumbPage
                  className={
                    segments.length === 0 ? "text-muted-foreground" : ""
                  }
                >
                  {segments.length === 0 ? activeTab?.title : firstSegment}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                {segments.length > 1 && (
                  <Fragment key="first">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <p>{firstSegment}</p>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                )}

                {hasEllipsis && (
                  <Fragment key="ellipsis">
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                )}

                {tailSegments.slice(0, -1).map((segment, i) => (
                  <Fragment key={segment + i}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <p>{segment}</p>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                ))}

                <BreadcrumbItem>
                  <BreadcrumbPage>{tailSegments.at(-1)}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={2000}>
            {isBookmarked && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBookmarkClick}
                  >
                    <HugeiconsIcon
                      icon={BookmarkIcon}
                      size={18}
                      strokeWidth={2}
                      primaryColor="var(--sidebar-primary)"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Remove bookmark &ldquo;{activeBookmarks[0].name}&rdquo;
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMode}
                  disabled={activeTab?.path === null}
                >
                  <HugeiconsIcon
                    primaryColor={"var(--sidebar-primary)"}
                    icon={
                      currentTabMode === "edit" ? Edit02Icon : BookOpen01Icon
                    }
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {currentTabMode === "edit" ? "Edit" : "View"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>
    </>
  )
})
