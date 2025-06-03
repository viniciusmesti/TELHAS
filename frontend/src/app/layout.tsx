import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardProvider } from "@/contexts/dashboard-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinDocs - Sistema Financeiro",
  description: "Sistema de gerenciamento de documentos financeiros",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full bg-background dark:bg-dark-primary`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}