import { observer } from "mobx-react-lite"
import { EditorContent } from "@tiptap/react"

import { contentStore } from "@/store/content-store"
import EmptyTabContent from "@/components/page-layout/empty-tab-content"
import { ScrollArea } from "@/components/ui/scroll-area"

// Ensure side effects (mermaid, console.error filter) are initialized
import "@/lib/editor-extensions"

export default observer(function Editor() {
  const { currentPath, activeEditor } = contentStore

  if (!currentPath) return <EmptyTabContent />
  if (!activeEditor) return null

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-[800px] px-6 py-4">
        <EditorContent editor={activeEditor} />
      </div>
    </ScrollArea>
  )
})
