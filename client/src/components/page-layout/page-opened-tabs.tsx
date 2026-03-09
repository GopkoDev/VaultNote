import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "../ui/button"
import { observer } from "mobx-react-lite"
import { contentTabsStore } from "@/store/content-tabs-store"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import PageOpenedTabsItem from "./page-opened-tabs-item"

export default observer(function PageOpenedTabs() {
  const {
    openedTabs,
    addOpenedTab,
    setOpenedTabActive,
    removeOpenedTab,
    reorderOpenedTabs,
  } = contentTabsStore

  const openedTabsList = Object.values(openedTabs)

  const addNewTab = () => addOpenedTab()
  const setTabActive = (id: number) => setOpenedTabActive(id)
  const removeTab = (id: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation()
    removeOpenedTab(id)
  }

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      reorderOpenedTabs(Number(active.id), Number(over?.id))
    }
  }

  return (
    <section className="flex flex-1 items-center gap-1.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={openedTabsList.map((tab) => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          {openedTabsList.map((tab) => {
            return (
              <PageOpenedTabsItem
                key={tab.id}
                tab={tab}
                onTabClick={setTabActive}
                onTabRemove={removeTab}
                hasCloseButton={openedTabsList.length > 1}
              />
            )
          })}

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={addNewTab}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
          </Button>
        </SortableContext>
      </DndContext>
    </section>
  )
})
