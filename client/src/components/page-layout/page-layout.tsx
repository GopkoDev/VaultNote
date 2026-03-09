import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
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
          <div className="flex-1 overflow-hidden">{children}</div>
        </main>
      </SidebarInset>

      <Toaster position="bottom-left" richColors />
      <ModalsContainer />
    </SidebarProvider>
  )
}
