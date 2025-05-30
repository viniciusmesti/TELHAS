"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, ChevronRight, Cog, FileUp, Home, Plus, BarChart3, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const companies = [
  { id: "mapa", name: "MAPA" },
  { id: "np", name: "N&P" },
  { id: "telhas", name: "TELHAS" },
  { id: "telhaco", name: "TELHAÇO" },
  { id: "metro", name: "METRO" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [companiesOpen, setCompaniesOpen] = React.useState(true)

  return (
    <Sidebar className="border-r border-border/40 backdrop-blur-sm bg-sidebar/80">
      <SidebarHeader className="flex h-16 items-center border-b border-border/40 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <FileUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg bg-clip-text text-transparent bg-gradient-primary">Contabilizza</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  className="transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary/30 data-[active=true]:shadow-glow"
                >
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="transition-all duration-300 hover:bg-primary/20">
                  <Link href="/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={companiesOpen} onOpenChange={setCompaniesOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex cursor-pointer items-center justify-between text-primary/80">
                <span>Empresas</span>
                <ChevronRight className={cn("h-4 w-4 transition-transform", companiesOpen && "rotate-90")} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {companies.map((company) => (
                    <SidebarMenuItem key={company.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/dashboard/${company.id}`}
                        className="transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary/30 data-[active=true]:shadow-glow"
                      >
                        <Link href={`/dashboard/${company.id}`}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{company.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/80">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/add-company"}
                  className="transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary/30 data-[active=true]:shadow-glow"
                >
                  <Link href="/dashboard/add-company">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Adicionar Empresa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/settings"}
                  className="transition-all duration-300 hover:bg-primary/20 data-[active=true]:bg-primary/30 data-[active=true]:shadow-glow"
                >
                  <Link href="/dashboard/settings">
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
              <SidebarGroupLabel className="text-primary/80">Histórico</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/dashboard/history"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Histórico de Downloads
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
