import { Separator } from "@/components/ui/separator"
import { SidebarFooter } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function SideBarFooterContent() {
  return (
    <>
      <Separator />
      <SidebarFooter>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <a
              href="https://github.com/GopkoDev/VaultNote"
              target="_blank"
              rel="noopener noreferrer"
            >
              VaultNote v1.0.0 &copy; {new Date().getFullYear()}
            </a>
          </p>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </>
  )
}
