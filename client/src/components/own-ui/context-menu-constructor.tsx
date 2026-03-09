import { Fragment } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface ContextMenuItem {
  label: string
  icon: HugeiconsIconProps["icon"]
  onClick: () => void
  destructive?: boolean
}

interface ContextMenuConstructorProps {
  children: React.ReactNode
  menuItems: ContextMenuItem[][]
}

export function ContextMenuConstructor({
  children,
  menuItems,
}: ContextMenuConstructorProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {menuItems.map((group, groupIndex) => (
          <Fragment key={groupIndex}>
            {group.map((menuItem) => (
              <ContextMenuItem
                key={menuItem.label}
                onSelect={menuItem.onClick}
                className={cn(
                  menuItem.destructive &&
                    "text-destructive focus:text-destructive"
                )}
              >
                <HugeiconsIcon icon={menuItem.icon} size={14} strokeWidth={2} />
                {menuItem.label}
              </ContextMenuItem>
            ))}

            {groupIndex < menuItems.length - 1 && <ContextMenuSeparator />}
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
