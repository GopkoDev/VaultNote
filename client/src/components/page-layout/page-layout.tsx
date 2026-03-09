import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import ModalsContainer from "@/components/modals/modals-continer"
import SideBar from "./side-bar/side-bar"
import PageHeader from "./page-header"
import BreadcrumbsPanel from "./breadcrumbs-panel"

export default function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="h-full overflow-hidden">
      <SideBar />
      <SidebarInset className="overflow-hidden">
        <PageHeader />
        <main className="flex flex-1 flex-col gap-2 overflow-hidden py-1">
          <BreadcrumbsPanel />
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-6 py-4">{children}</div>
          </ScrollArea>
        </main>
      </SidebarInset>

      <Toaster position="top-center" richColors />
      <ModalsContainer />
    </SidebarProvider>
  )
}
