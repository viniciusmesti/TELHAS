import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-light dark:bg-gradient-futuristic transition-colors duration-300">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center px-4 header-gradient shadow-lg">
            <div className="flex items-center w-full">
              <SidebarTrigger className="mr-4 h-9 w-9 rounded-lg hover:bg-primary/20 transition-all duration-200 border border-border/40" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <span className="font-bold text-white text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient-primary">FinDocs</h1>
                  <p className="text-xs text-muted-foreground">Sistema Financeiro</p>
                </div>
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="grid-pattern flex-1 space-y-6 p-6 md:p-8 min-h-[calc(100vh-4rem)] bg-background/50 dark:bg-dark-primary/50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
