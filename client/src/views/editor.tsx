import { useRef } from "react"
import { observer } from "mobx-react-lite"
import { EditorContent } from "@tiptap/react"

import { contentStore } from "@/store/content-store"
import { contentTabsStore } from "@/store/content-tabs-store"
import EmptyTabContent from "@/components/page-layout/empty-tab-content"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FloatingToolbar } from "@/components/editor/floating-toolbar"
import { TableBubbleMenu } from "@/components/editor/table-bubble-menu"

// Ensure side effects (mermaid, console.error filter) are initialized
import "@/lib/editor-extensions"

export default observer(function Editor() {
  const { currentPath, activeEditor } = contentStore
  const { currentTabMode } = contentTabsStore
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (!currentPath) return <EmptyTabContent />
  if (!activeEditor) return null

  return (
    <div ref={wrapperRef} className="relative h-full">
      <ScrollArea className="h-full">
        <div ref={containerRef} className="mx-auto max-w-[800px] px-6 py-4">
          <EditorContent editor={activeEditor} />
        </div>
      </ScrollArea>

      {currentTabMode === "edit" && <TableBubbleMenu editor={activeEditor} />}

      {currentTabMode === "edit" && (
        <FloatingToolbar
          editor={activeEditor}
          anchorRef={wrapperRef}
          containerRef={containerRef}
        />
      )}
    </div>
  )
})
