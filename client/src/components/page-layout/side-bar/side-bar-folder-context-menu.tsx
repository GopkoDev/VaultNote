import {
  DeleteThrowIcon,
  PencilIcon,
  Add01Icon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons"
import type { FileItem } from "@/types/files"
import { ContextMenuConstructor } from "@/components/own-ui/context-menu-constructor"
import { treeStore } from "@/store/tree-store"
import { modalStore } from "@/store/modal-store"

interface SideBarFolderContextMenuProps {
  children: React.ReactNode
  item: FileItem
}

export default function SideBarFolderContextMenu({
  children,
  item,
}: SideBarFolderContextMenuProps) {
  const { startRename, startCreate, setSelectedFolderPath } = treeStore
  const { updateModalProps, resetModalProps } = modalStore

  const onRename = () => startRename(item.path)
  const onStartCreate = (type: "file" | "directory") => {
    setSelectedFolderPath(item.path)
    startCreate(type)
  }

  const onRequestDelete = () => {
    updateModalProps({
      confirm: true,
      title: `Delete "${item.name}"?`,
      description:
        "Are you sure you want to delete permanently and all its contents? This action cannot be undone.",
      onConfirm: () => {
        treeStore.submitDelete(item)
        resetModalProps()
      },
    })
  }

  const menuItems = [
    [
      {
        label: "New file",
        icon: Add01Icon,
        onClick: () => onStartCreate("file"),
        destructive: false,
      },
      {
        label: "New folder",
        icon: FolderAddIcon,
        onClick: () => onStartCreate("directory"),
        destructive: false,
      },
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
        onClick: onRequestDelete,
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
