import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { OpenedTab } from "@/store/types/content-tabs-store.types"

interface PageOpenedTabsItemProps {
  tab: OpenedTab
  hasCloseButton: boolean
  onTabClick: (id: number) => void
  onTabRemove: (id: number, e?: React.MouseEvent<HTMLButtonElement>) => void
}

export default function PageOpenedTabsItem({
  tab,
  hasCloseButton,
  onTabClick,
  onTabRemove,
}: PageOpenedTabsItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      e.preventDefault()
      onTabRemove(tab.id)
      return
    }
    listeners?.onMouseDown?.(e)
  }

  return (
    <div
      key={tab.id}
      className="group/tab @container relative min-w-0 flex-1 basis-0"
      {...attributes}
      ref={setNodeRef}
      style={{ ...style, maxWidth: "12rem" }}
      onMouseDown={onMouseDown}
      onClick={() => onTabClick(tab.id)}
    >
      <div
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-1.5 px-3 py-2 pr-1 pb-2.25 text-sm select-none hover:bg-sidebar-primary/10 @max-[50px]:px-1",
          "relative z-10 rounded-md border border-b-0 border-transparent text-muted-foreground hover:text-foreground",
          tab.isActive &&
            "page-tab-active-border rounded-b-none border-border bg-background text-foreground hover:bg-background"
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left @max-[50px]:hidden">
          {tab.title}
        </span>

        {hasCloseButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-5 opacity-0 transition-opacity group-hover/tab:opacity-100",
              tab.isActive && "opacity-100"
            )}
            onClick={(e) => onTabRemove(tab.id, e)}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </Button>
        )}
      </div>

      {tab.isActive && (
        <>
          <div className="page-tab-active" />
          <div className="page-tab-active_left-corner" />
          <div className="page-tab-active_right-corner" />
        </>
      )}
    </div>
  )
}
