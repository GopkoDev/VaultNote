import { observer } from "mobx-react-lite"
import { treeStore } from "@/store/tree-store"
import { FileIcon, FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarMenuItem } from "@/components/ui/sidebar"
import { SideBarInput } from "@/components/own-ui/side-bar-input"

export const SideBarNewItem = observer(() => {
  const { creatingIn } = treeStore
  const type = creatingIn?.type
  const placeholder = type === "file" ? "file.md" : "folder"
  const icon = type === "file" ? FileIcon : FolderIcon

  const onSubmit = (name: string) => treeStore.submitCreate(name)
  const onCancel = () => treeStore.startCreate(null)

  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-1.5 px-2 py-0.5">
        <HugeiconsIcon
          icon={icon}
          size={14}
          strokeWidth={2}
          className="shrink-0 text-sidebar-foreground/50"
        />
        <SideBarInput
          placeholder={placeholder}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </SidebarMenuItem>
  )
})
