import { useEffect } from "react"
import Editor from "@/views/editor"
import PageLayout from "@/components/page-layout/page-layout"
import { treeStore } from "@/store/tree-store"
import { bookmarksStore } from "@/store/bookmarks-store"

export default function App() {
  useEffect(() => {
    treeStore.init()
    bookmarksStore.load()

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
