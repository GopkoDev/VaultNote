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
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon, BookOpen01Icon } from "@hugeicons/core-free-icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

const MAX_VISIBLE = 3

export default observer(function BreadcrumbsPanel() {
  const { activeTab, mode, toggleMode } = contentTabsStore

  const segments = activeTab?.path
    ? activeTab.path.split("/").filter(Boolean)
    : []

  // first + ellipsis + tail (MAX_VISIBLE - 1 last segments)
  const hasEllipsis = segments.length > MAX_VISIBLE
  const firstSegment = segments[0]
  const tailSegments = hasEllipsis
    ? segments.slice(-(MAX_VISIBLE - 1))
    : segments.slice(1)

  return (
    <section className="flex items-center justify-between gap-2 px-4">
      <section className="h-8 w-8"></section>
      <Breadcrumb>
        <BreadcrumbList>
          {segments.length <= 1 ? (
            <BreadcrumbItem>
              <BreadcrumbPage
                className={segments.length === 0 ? "text-muted-foreground" : ""}
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

      <div>
        <TooltipProvider delayDuration={2000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleMode}>
                <HugeiconsIcon
                  icon={mode === "edit" ? Edit02Icon : BookOpen01Icon}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {mode === "edit" ? "Edit" : "View"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </section>
  )
})
