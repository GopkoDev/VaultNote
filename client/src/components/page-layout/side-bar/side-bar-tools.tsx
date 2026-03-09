import { useState } from "react"
import { SidebarGroupLabel } from "@/components/ui/sidebar"
import {
  Add01Icon,
  FolderAddIcon,
  Refresh01Icon,
  CollapseIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { treeStore } from "@/store/tree-store"

export default function SideBarTools() {
  const [loading, setLoading] = useState(false)
  const {
    isAutoRevealActiveFile,
    loadTree,
    startCreate,
    collapseAll,
    toggleAutoRevealActiveFile,
  } = treeStore

  const onNewFile = () => startCreate("file")
  const onNewFolder = () => startCreate("directory")
  const onAutoRevealActiveFile = () => toggleAutoRevealActiveFile()
  const onCollapseAll = () => collapseAll()
  const onRefresh = async () => {
    try {
      setLoading(true)
      await loadTree()
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    { icon: Add01Icon, label: "New file", onClick: onNewFile },
    { icon: FolderAddIcon, label: "New folder", onClick: onNewFolder },
    {
      icon: Refresh01Icon,
      label: "Refresh",
      onClick: onRefresh,
      spin: loading,
    },
    {
      icon: Target01Icon,
      label: "Auto Reveal Active File",
      onClick: onAutoRevealActiveFile,
      checked: isAutoRevealActiveFile,
    },
    { icon: CollapseIcon, label: "Collapse all", onClick: onCollapseAll },
  ]
  return (
    <SidebarGroupLabel asChild>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs tracking-wider text-sidebar-foreground/70 uppercase">
          Files
        </span>
        <div className="flex items-center gap-1">
          {actions.map(({ icon, label, onClick, spin, checked }) => (
            <Tooltip key={label} delayDuration={2000}>
              <TooltipTrigger asChild>
                <Button
                  onClick={onClick}
                  disabled={spin}
                  variant="ghost"
                  size="icon-sm"
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={15}
                    strokeWidth={2}
                    className={spin ? "animate-spin" : undefined}
                    primaryColor={
                      checked ? "var(--sidebar-primary)" : undefined
                    }
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </SidebarGroupLabel>
  )
}
