import {
  Archive01Icon,
  Search01Icon,
  Bookmark02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import { type SideHeaderButtonType } from "@/store/types/side-bar-store.types"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"

interface SideHeaderButtonProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "type"
> {
  type: SideHeaderButtonType
  isActive?: boolean
}

const iconMap: Record<SideHeaderButtonType, HugeiconsIconProps["icon"]> = {
  archive: Archive01Icon,
  search: Search01Icon,
  bookmark: Bookmark02Icon,
}

export const SideHeaderButton = forwardRef<
  HTMLButtonElement,
  SideHeaderButtonProps
>(({ type, isActive = false, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="sidebar-tab"
      size="icon"
      aria-pressed={isActive}
      {...props}
    >
      <HugeiconsIcon icon={iconMap[type]} size={20} />
    </Button>
  )
})

SideHeaderButton.displayName = "SideHeaderButton"
