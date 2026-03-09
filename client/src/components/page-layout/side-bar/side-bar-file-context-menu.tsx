import { DeleteThrowIcon, PencilIcon } from "@hugeicons/core-free-icons"
import type { FileItem } from "@/types/files"
import { ContextMenuConstructor } from "@/components/own-ui/context-menu-constructor"
import { treeStore } from "@/store/tree-store"
import { modalStore } from "@/store/modal-store"

interface SideBarFileContextMenuProps {
  children: React.ReactNode
  item: FileItem
}

export default function SideBarFileContextMenu({
  children,
  item,
}: SideBarFileContextMenuProps) {
  const { startRename } = treeStore
  const { updateModalProps, resetModalProps } = modalStore

  const onRename = () => startRename(item.path)

  const onDelete = () => {
    updateModalProps({
      confirm: true,
      title: `Delete "${item.name}"?`,
      description:
        "Are you sure you want to delete permanently ? This action cannot be undone.",
      onConfirm: () => {
        treeStore.submitDelete(item)
        resetModalProps()
      },
    })
  }

  const menuItems = [
    [
      {
        label: "Rename",
        icon: PencilIcon,
        onClick: onRename,
        destructive: false,
      },
    ],
    [
      {
        label: "Delete",
        icon: DeleteThrowIcon,
        onClick: onDelete,
        destructive: true,
      },
    ],
  ]

  return (
    <ContextMenuConstructor menuItems={menuItems}>
      {children}
    </ContextMenuConstructor>
  )
}
