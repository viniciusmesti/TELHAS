import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { AddCompanyForm } from "@/components/company/add-company-form"

export default function AddCompanyPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Adicionar Empresa" subheading="Cadastre uma nova empresa no sistema" />
      <AddCompanyForm />
    </DashboardShell>
  )
}
