import { useEffect } from "react"
import Editor from "@/views/editor"
import PageLayout from "@/components/page-layout/page-layout"
import { treeStore } from "@/store/tree-store"

export default function App() {
  useEffect(() => {
    treeStore.init()

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
