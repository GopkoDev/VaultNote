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

const MAX_VISIBLE = 2

export default observer(function BreadcrumbsPanel() {
  const { activeTab, mode, toggleMode } = contentTabsStore

  const segments = activeTab?.path
    ? activeTab.path.split("/").filter(Boolean)
    : []

  const hasEllipsis = segments.length > MAX_VISIBLE + 1
  const visibleSegments = hasEllipsis
    ? segments.slice(-(MAX_VISIBLE + 1))
    : segments

  return (
    <section className="flex items-center justify-between gap-2 px-4">
      <section className="h-8 w-8"></section>
      <Breadcrumb>
        <BreadcrumbList>
          {segments.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-muted-foreground">
                {activeTab?.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              {hasEllipsis && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}

              {visibleSegments.slice(0, -1).map((segment, i) => (
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
                <BreadcrumbPage>{visibleSegments.at(-1)}</BreadcrumbPage>
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
