import { useEffect, useReducer, useState } from "react"
import { createPortal } from "react-dom"
import { type Editor } from "@tiptap/core"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InsertRowUpIcon,
  InsertRowDownIcon,
  InsertColumnLeftIcon,
  InsertColumnRightIcon,
  RowDeleteIcon,
  ColumnDeleteIcon,
  DeleteThrowIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TableAction {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  action: (editor: Editor) => void
  destructive?: boolean
  dividerBefore?: boolean
}

const TABLE_ACTIONS: TableAction[] = [
  {
    icon: InsertRowUpIcon,
    label: "Add row above",
    action: (e) => e.chain().focus().addRowBefore().run(),
  },
  {
    icon: InsertRowDownIcon,
    label: "Add row below",
    action: (e) => e.chain().focus().addRowAfter().run(),
  },
  {
    icon: InsertColumnLeftIcon,
    label: "Add column left",
    action: (e) => e.chain().focus().addColumnBefore().run(),
  },
  {
    icon: InsertColumnRightIcon,
    label: "Add column right",
    action: (e) => e.chain().focus().addColumnAfter().run(),
  },
  {
    icon: RowDeleteIcon,
    label: "Delete row",
    action: (e) => e.chain().focus().deleteRow().run(),
    destructive: true,
    dividerBefore: true,
  },
  {
    icon: ColumnDeleteIcon,
    label: "Delete column",
    action: (e) => e.chain().focus().deleteColumn().run(),
    destructive: true,
  },
  {
    icon: DeleteThrowIcon,
    label: "Delete table",
    action: (e) => e.chain().focus().deleteTable().run(),
    destructive: true,
  },
]

function getTableRect(editor: Editor): DOMRect | null {
  if (!editor.isActive("table")) return null
  const { $from } = editor.state.selection
  for (let d = $from.depth; d >= 0; d--) {
    if ($from.node(d).type.name === "table") {
      const pos = $from.before(d)
      const dom = editor.view.nodeDOM(pos)
      if (dom instanceof HTMLElement) return dom.getBoundingClientRect()
      break
    }
  }
  return null
}

interface TableBubbleMenuProps {
  editor: Editor
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const [menuWidth, setMenuWidth] = useState(0)

  useEffect(() => {
    const handler = () => forceUpdate()
    editor.on("selectionUpdate", handler)
    editor.on("transaction", handler)
    window.addEventListener("scroll", handler, true)
    return () => {
      editor.off("selectionUpdate", handler)
      editor.off("transaction", handler)
      window.removeEventListener("scroll", handler, true)
    }
  }, [editor])

  const tableRect = getTableRect(editor)
  if (!tableRect) return null

  // Center the menu above the table; flip below if not enough space
  const MENU_HEIGHT = 36
  const OFFSET = 8
  const topAbove = tableRect.top - MENU_HEIGHT - OFFSET
  const top = topAbove < 8 ? tableRect.bottom + OFFSET : topAbove
  const idealLeft = tableRect.left + tableRect.width / 2 - menuWidth / 2
  const left = Math.max(
    8,
    Math.min(idealLeft, window.innerWidth - menuWidth - 8)
  )

  return createPortal(
    <div
      ref={(el) => {
        if (el && el.offsetWidth !== menuWidth) setMenuWidth(el.offsetWidth)
      }}
      className="fixed z-40 flex animate-in items-center gap-0.5 rounded-lg border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm duration-100 fade-in-0 zoom-in-95"
      style={{ left, top }}
    >
      {TABLE_ACTIONS.map((item) => (
        <div key={item.label} className="flex items-center">
          {item.dividerBefore && <div className="mx-0.5 h-4 w-px bg-border" />}
          <Tooltip delayDuration={600}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onMouseDown={(e) => {
                  e.preventDefault()
                  item.action(editor)
                }}
                className={cn(
                  item.destructive &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive"
                )}
              >
                <HugeiconsIcon icon={item.icon} size={14} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>,
    document.body
  )
}
