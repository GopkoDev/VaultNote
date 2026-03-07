import { useEffect } from "react"
import { filesStore } from "@/store/files-store"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Editor from "@/views/editor/editor"

export default function App() {
  useEffect(() => {
    filesStore.loadTree()

    return () => {
      filesStore.destroy()
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Editor />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
