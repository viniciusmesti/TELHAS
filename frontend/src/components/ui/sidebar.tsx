"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

interface SidebarContextValue {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  toggleExpanded: () => void
  // Adicionando propriedades que estavam faltando
  isMobile?: boolean
  state?: string
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function SidebarProvider({ children, defaultExpanded = true }: SidebarProviderProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [isMobile, setIsMobile] = React.useState(false)

  // Detectar se é mobile
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleExpanded = React.useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const value = React.useMemo(
    () => ({
      expanded,
      setExpanded,
      toggleExpanded,
      isMobile,
      state: expanded ? "expanded" : "collapsed",
    }),
    [expanded, toggleExpanded, isMobile],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { expanded } = useSidebar()

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        expanded ? "w-64" : "w-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("flex h-14 items-center border-b px-4", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, children, ...props }: SidebarGroupProps) {
  return (
    <div className={cn("px-2 py-2", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({ className, children, ...props }: SidebarGroupLabelProps) {
  const { expanded } = useSidebar()

  if (!expanded) {
    return null
  }

  return (
    <div className={cn("mb-2 px-2 text-xs font-semibold text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({ className, children, ...props }: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, children, ...props }: SidebarMenuItemProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  asChild?: boolean
}

export function SidebarMenuButton({
  className,
  children,
  isActive = false,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const { expanded } = useSidebar()

  if (asChild) {
    return (
      <Slot
        className={cn(
          "flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive && "bg-accent text-accent-foreground",
          !expanded && "justify-center",
          className,
        )}
        data-active={isActive}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-accent text-accent-foreground",
        !expanded && "justify-center",
        className,
      )}
      data-active={isActive}
      {...props}
    >
      {children}
    </button>
  )
}

interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarRail({ className, ...props }: SidebarRailProps) {
  return (
    <div
      className={cn("absolute inset-y-0 left-0 w-1 bg-primary/10 transition-all duration-300", className)}
      {...props}
    />
  )
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { toggleExpanded } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleExpanded}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({ className, children, ...props }: SidebarInsetProps) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  )
}

// Removendo os componentes antigos que estavam causando erros
