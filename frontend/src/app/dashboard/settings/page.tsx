import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { SettingsForm } from "@/components/settings/settings-form"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Configurações" subheading="Gerencie as configurações do sistema" />
      <SettingsForm />
    </DashboardShell>
  )
}
