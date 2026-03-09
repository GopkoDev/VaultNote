import { useEffect } from "react"
import Editor from "@/views/editor/editor"
import PageLayout from "@/components/page-layout/page-layout"
import { treeStore } from "@/store/tree-store"

export default function App() {
  useEffect(() => {
    treeStore.loadTree()

    return () => {
      treeStore.destroy()
    }
  }, [])

  return (
    <PageLayout>
      <Editor />
    </PageLayout>
  )
}
