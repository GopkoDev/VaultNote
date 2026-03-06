import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileIcon,
  FolderIcon,
  ArrowRight01Icon,
  Add01Icon,
  FolderAddIcon,
  Loading03Icon,
  RefreshIcon,
  ArrowShrink01Icon,
} from "@hugeicons/core-free-icons"

import { filesApi } from "@/api/files"
import type { FileItem } from "@/types/files"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  onNewFile: () => void
  onNewFolder: () => void
  onRefresh: () => void
  onCollapseAll: () => void
  loading: boolean
}

function SidebarToolbar({
  onNewFile,
  onNewFolder,
  onRefresh,
  onCollapseAll,
  loading,
}: ToolbarProps) {
  const actions = [
    { icon: Add01Icon, label: "New file", onClick: onNewFile },
    { icon: FolderAddIcon, label: "New folder", onClick: onNewFolder },
    { icon: RefreshIcon, label: "Refresh", onClick: onRefresh, spin: loading },
    { icon: ArrowShrink01Icon, label: "Collapse all", onClick: onCollapseAll },
  ]

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">
        Files
      </span>
      <div className="flex items-center gap-1">
        {actions.map(({ icon, label, onClick, spin }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                onClick={onClick}
                disabled={spin}
                className="rounded p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-40"
              >
                <HugeiconsIcon
                  icon={icon}
                  size={15}
                  strokeWidth={2}
                  className={spin ? "animate-spin" : undefined}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// ─── Tree node ────────────────────────────────────────────────────────────────

function FileTreeNode({ item }: { item: FileItem }) {
  if (item.type === "file") {
    return (
      <SidebarMenuButton className="data-[active=true]:bg-sidebar-accent">
        <HugeiconsIcon icon={FileIcon} size={15} strokeWidth={2} />
        <span className="truncate">{item.name}</span>
      </SidebarMenuButton>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={2}
              className="transition-transform"
            />
            <HugeiconsIcon icon={FolderIcon} size={15} strokeWidth={2} />
            <span className="truncate">{item.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <FileTreeNode key={child.path} item={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [tree, setTree] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [collapseKey, setCollapseKey] = React.useState(0)

  async function loadTree() {
    setLoading(true)
    setError(null)
    const res = await filesApi.getTree()
    if (res.ok) {
      setTree(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    loadTree()
  }, [])

  function handleNewFile() {
    // TODO: open dialog
  }

  function handleNewFolder() {
    // TODO: open dialog
  }

  function handleCollapseAll() {
    setCollapseKey((k) => k + 1)
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel asChild>
            <SidebarToolbar
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onRefresh={loadTree}
              onCollapseAll={handleCollapseAll}
              loading={loading}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/50">
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={14}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                  Loading...
                </div>
              )}
              {error && (
                <div className="px-3 py-2 text-sm text-red-500">{error}</div>
              )}
              {!loading &&
                !error &&
                tree.map((item) => (
                  <FileTreeNode
                    key={`${collapseKey}-${item.path}`}
                    item={item}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
