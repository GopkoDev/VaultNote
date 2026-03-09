import { observer } from "mobx-react-lite"
import { Button } from "@/components/ui/button"
import { contentTabsStore } from "@/store/content-tabs-store"
import { treeStore } from "@/store/tree-store"

function buildFileName(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const dd = pad(now.getDate())
  const mm = pad(now.getMonth() + 1)
  const yyyy = now.getFullYear()
  const hh = pad(now.getHours())
  const min = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  return `${dd}-${mm}-${yyyy}-${hh}-${min}-${ss}.md`
}

export default observer(function EmptyTabContent() {
  const { activeTab, removeOpenedTab, openedTabs, updateTabData } =
    contentTabsStore
  const { startCreate, submitCreate } = treeStore
  const isOnlyTab = Object.keys(openedTabs).length === 1

  const handleCreateFile = async () => {
    const name = buildFileName()
    startCreate("file", true)
    const path = await submitCreate(name)
    if (path) updateTabData({ path, name })
  }

  const handleClose = () => {
    if (activeTab) removeOpenedTab(activeTab.id)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
      <p className="text-lg text-muted-foreground">
        Select a file from the left menu or:
      </p>
      <Button
        size="xs"
        variant="link"
        className="text-lg"
        onClick={handleCreateFile}
      >
        Create a new file
      </Button>

      {!isOnlyTab && (
        <Button
          size="xs"
          variant="link"
          className="text-lg"
          onClick={handleClose}
        >
          Close tab
        </Button>
      )}
    </div>
  )
})
