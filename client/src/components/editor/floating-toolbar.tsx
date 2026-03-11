import { useCallback, useEffect, useReducer, useState } from "react"
import { createPortal } from "react-dom"
import { type Editor } from "@tiptap/core"
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import {
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  SourceCodeIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Heading04Icon,
  Heading05Icon,
  Heading06Icon,
  ListViewIcon,
  LeftToRightListNumberIcon,
  CheckListIcon,
  QuoteDownIcon,
  CodeSquareIcon,
  FlowSquareIcon,
  Table01Icon,
  Link01Icon,
  Image01Icon,
  MinusSignIcon,
  HighlighterIcon,
  Undo02Icon,
  Redo02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ToolIcon = HugeiconsIconProps["icon"]

interface ToolDef {
  id: string
  label: string
  icon: ToolIcon
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  canRun?: (editor: Editor) => boolean
  separator?: boolean
  /** When true, clicking this tool opens the URL input panel instead of running action. */
  hasUrlPanel?: boolean
}

const TOOLS: ToolDef[] = [
  // History
  {
    id: "undo",
    label: "Undo",
    icon: Undo02Icon,
    action: (e) => e.chain().focus().undo().run(),
    canRun: (e) => e.can().chain().undo().run(),
  },
  {
    id: "redo",
    label: "Redo",
    icon: Redo02Icon,
    action: (e) => e.chain().focus().redo().run(),
    canRun: (e) => e.can().chain().redo().run(),
  },
  // Formatting
  {
    id: "bold",
    label: "Bold",
    icon: TextBoldIcon,
    action: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
    separator: true,
  },
  {
    id: "italic",
    label: "Italic",
    icon: TextItalicIcon,
    action: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    id: "strike",
    label: "Strikethrough",
    icon: TextStrikethroughIcon,
    action: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive("strike"),
  },
  {
    id: "code",
    label: "Inline Code",
    icon: SourceCodeIcon,
    action: (e) => e.chain().focus().toggleCode().run(),
    isActive: (e) => e.isActive("code"),
  },
  {
    id: "highlight",
    label: "Highlight",
    icon: HighlighterIcon,
    action: (e) => e.chain().focus().toggleHighlight().run(),
    isActive: (e) => e.isActive("highlight"),
  },
  // Headings
  {
    id: "h1",
    label: "Heading 1",
    icon: Heading01Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive("heading", { level: 1 }),
    separator: true,
  },
  {
    id: "h2",
    label: "Heading 2",
    icon: Heading02Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive("heading", { level: 2 }),
  },
  {
    id: "h3",
    label: "Heading 3",
    icon: Heading03Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
  },
  {
    id: "h4",
    label: "Heading 4",
    icon: Heading04Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),
    isActive: (e) => e.isActive("heading", { level: 4 }),
  },
  {
    id: "h5",
    label: "Heading 5",
    icon: Heading05Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 5 }).run(),
    isActive: (e) => e.isActive("heading", { level: 5 }),
  },
  {
    id: "h6",
    label: "Heading 6",
    icon: Heading06Icon,
    action: (e) => e.chain().focus().toggleHeading({ level: 6 }).run(),
    isActive: (e) => e.isActive("heading", { level: 6 }),
  },
  // Lists
  {
    id: "bulletList",
    label: "Bullet List",
    icon: ListViewIcon,
    action: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
    separator: true,
  },
  {
    id: "orderedList",
    label: "Numbered List",
    icon: LeftToRightListNumberIcon,
    action: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive("orderedList"),
  },
  {
    id: "taskList",
    label: "Task List",
    icon: CheckListIcon,
    action: (e) => e.chain().focus().toggleTaskList().run(),
    isActive: (e) => e.isActive("taskList"),
  },
  // Blocks
  {
    id: "blockquote",
    label: "Blockquote",
    icon: QuoteDownIcon,
    action: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive("blockquote"),
    separator: true,
  },
  {
    id: "codeBlock",
    label: "Code Block",
    icon: CodeSquareIcon,
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
    isActive: (e) =>
      e.isActive("codeBlock") &&
      !e.isActive("codeBlock", { language: "mermaid" }),
  },
  {
    id: "mermaid",
    label: "Mermaid Diagram",
    icon: FlowSquareIcon,
    action: (e) =>
      e.chain().focus().setCodeBlock({ language: "mermaid" }).run(),
    isActive: (e) => e.isActive("codeBlock", { language: "mermaid" }),
  },
  {
    id: "table",
    label: "Insert Table",
    icon: Table01Icon,
    action: (e) =>
      e
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
    isActive: (e) => e.isActive("table"),
  },
  // Insert
  {
    id: "link",
    label: "Link",
    icon: Link01Icon,
    action: () => {},
    isActive: (e) => e.isActive("link"),
    separator: true,
    hasUrlPanel: true,
  },
  {
    id: "image",
    label: "Insert Image",
    icon: Image01Icon,
    action: () => {},
    hasUrlPanel: true,
  },
  {
    id: "hr",
    label: "Horizontal Rule",
    icon: MinusSignIcon,
    action: (e) => e.chain().focus().setHorizontalRule().run(),
  },
]

const BUTTON_H = 28 // size-7
const GAP = 4 // gap-1
const ITEM_STEP = BUTTON_H + GAP // 32px per item
const TOOLBAR_V_PADDING = 8 // p-1 top + bottom
const TOOLBAR_WIDTH = 44 // approx rendered width
const URL_PANEL_WIDTH = 224 // fixed width of the URL input panel

interface FloatingToolbarProps {
  editor: Editor
  anchorRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}

// ─── URL Input Panel ──────────────────────────────────────────────────────────

interface UrlInputPanelProps {
  type: "link" | "image"
  editor: Editor
  position: { left: number; top: number }
  onClose: () => void
}

function UrlInputPanel({
  type,
  editor,
  position,
  onClose,
}: UrlInputPanelProps) {
  const defaultUrl =
    type === "link" ? ((editor.getAttributes("link").href as string) ?? "") : ""
  const [url, setUrl] = useState(defaultUrl)
  const isLinkActive = type === "link" && editor.isActive("link")

  const handleSubmit = () => {
    if (type === "link") {
      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run()
      }
    } else {
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
    onClose()
  }

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    onClose()
  }

  return createPortal(
    <>
      {/* Click-outside backdrop */}
      <div className="fixed inset-0 z-40" onMouseDown={onClose} />

      <div
        className="fixed z-50 flex animate-in flex-col gap-2 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm duration-100 fade-in-0 zoom-in-95"
        style={{ left: position.left - URL_PANEL_WIDTH - 8, top: position.top }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={type === "link" ? "https://" : "Image URL"}
          className="h-7 text-sm"
          style={{ width: URL_PANEL_WIDTH }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSubmit()
            }
            if (e.key === "Escape") {
              e.preventDefault()
              onClose()
            }
          }}
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="h-6 px-2 text-xs"
            onMouseDown={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            {type === "link" ? "Set Link" : "Insert"}
          </Button>
          {isLinkActive && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onMouseDown={(e) => {
                e.preventDefault()
                handleRemove()
              }}
            >
              Remove
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onMouseDown={(e) => {
              e.preventDefault()
              onClose()
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ─── Tool Button ──────────────────────────────────────────────────────────────

function ToolButton({
  tool,
  editor,
  onOpenPanel,
}: {
  tool: ToolDef
  editor: Editor
  onOpenPanel?: () => void
}) {
  const active = tool.isActive?.(editor) ?? false
  const canRun = tool.canRun ? tool.canRun(editor) : true

  return (
    <Tooltip delayDuration={600}>
      <TooltipTrigger asChild>
        <Button
          variant="sidebar-tab"
          aria-pressed={active}
          size="icon-sm"
          disabled={!canRun}
          onMouseDown={(e) => {
            e.preventDefault()
            if (onOpenPanel) {
              onOpenPanel()
            } else {
              tool.action(editor)
            }
          }}
        >
          <HugeiconsIcon
            icon={tool.icon}
            size={14}
            strokeWidth={active ? 2.5 : 2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{tool.label}</TooltipContent>
    </Tooltip>
  )
}

// ─── Floating Toolbar ─────────────────────────────────────────────────────────

export function FloatingToolbar({
  editor,
  anchorRef,
  containerRef,
}: FloatingToolbarProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const [position, setPosition] = useState<{
    left: number
    top: number
  } | null>(null)
  const [visibleCount, setVisibleCount] = useState(TOOLS.length)
  const [openPanel, setOpenPanel] = useState<"link" | "image" | null>(null)

  // Re-render on editor state changes to reflect active/disabled states
  useEffect(() => {
    const handler = () => forceUpdate()
    editor.on("selectionUpdate", handler)
    editor.on("transaction", handler)
    return () => {
      editor.off("selectionUpdate", handler)
      editor.off("transaction", handler)
    }
  }, [editor])

  // Close panel when editor selection moves away
  useEffect(() => {
    if (!openPanel) return
    const handler = () => {
      if (openPanel === "link" && !editor.isActive("link")) setOpenPanel(null)
    }
    editor.on("selectionUpdate", handler)
    return () => {
      editor.off("selectionUpdate", handler)
    }
  }, [editor, openPanel])

  const updateLayout = useCallback(() => {
    if (!containerRef.current || !anchorRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const anchorRect = anchorRef.current.getBoundingClientRect()

    const toolbarTop = anchorRect.top + 8
    const availableH = anchorRect.height - 32
    const count = Math.max(
      1,
      Math.floor((availableH - TOOLBAR_V_PADDING + GAP) / ITEM_STEP)
    )

    const rawLeft = containerRect.right + 16
    const left =
      rawLeft + TOOLBAR_WIDTH > window.innerWidth
        ? window.innerWidth - TOOLBAR_WIDTH - 4
        : rawLeft

    setPosition({ left, top: toolbarTop })
    setVisibleCount(count)
  }, [containerRef, anchorRef])

  useEffect(() => {
    updateLayout()
    const observer = new ResizeObserver(updateLayout)
    if (containerRef.current) observer.observe(containerRef.current)
    if (anchorRef.current) observer.observe(anchorRef.current)
    window.addEventListener("resize", updateLayout)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateLayout)
    }
  }, [updateLayout, containerRef, anchorRef])

  if (!position) return null

  const hasOverflow = TOOLS.length > visibleCount
  const displayCount = hasOverflow
    ? Math.max(1, visibleCount - 1)
    : TOOLS.length
  const visibleTools = TOOLS.slice(0, displayCount)
  const overflowTools = TOOLS.slice(displayCount)

  const openPanelFor = (type: "link" | "image") => setOpenPanel(type)

  return (
    <>
      {createPortal(
        <div
          className="fixed z-50 flex animate-in flex-col gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-lg backdrop-blur-sm duration-150 fade-in-0 slide-in-from-right-2"
          style={{ left: position.left, top: position.top }}
        >
          {visibleTools.map((tool, index) => (
            <div key={tool.id}>
              {tool.separator && index > 0 && (
                <div className="-mx-1 my-0.5 h-px bg-border" />
              )}
              <ToolButton
                tool={tool}
                editor={editor}
                onOpenPanel={
                  tool.hasUrlPanel
                    ? () => openPanelFor(tool.id as "link" | "image")
                    : undefined
                }
              />
            </div>
          ))}

          {overflowTools.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <HugeiconsIcon
                    icon={MoreHorizontalIcon}
                    size={14}
                    strokeWidth={2}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left" align="end">
                {overflowTools.map((tool, index) => {
                  const active = tool.isActive?.(editor) ?? false
                  const showSeparator =
                    tool.separator &&
                    index > 0 &&
                    !overflowTools[index - 1]?.separator
                  return (
                    <div key={tool.id}>
                      {showSeparator && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onMouseDown={(e) => {
                          e.preventDefault()
                          if (tool.hasUrlPanel) {
                            openPanelFor(tool.id as "link" | "image")
                          } else {
                            tool.action(editor)
                          }
                        }}
                        className={cn(active && "bg-muted")}
                      >
                        <HugeiconsIcon
                          icon={tool.icon}
                          size={14}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        {tool.label}
                      </DropdownMenuItem>
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>,
        document.body
      )}

      {openPanel && (
        <UrlInputPanel
          type={openPanel}
          editor={editor}
          position={position}
          onClose={() => setOpenPanel(null)}
        />
      )}
    </>
  )
}
