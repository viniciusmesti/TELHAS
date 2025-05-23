import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" subheading="Visão geral do sistema financeiro" />
      <div className="grid gap-6">
        <StatsCards />
        <RecentActivity />
      </div>
    </DashboardShell>
  )
}
