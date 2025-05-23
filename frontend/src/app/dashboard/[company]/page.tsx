import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { CompanyFileManager } from "@/components/company/file-manager"

// List of valid companies
const companies = ["mapa", "np", "telhas", "telhaco", "metro"]

export default function CompanyPage({ params }: { params: { company: string } }) {
  const company = params.company.toLowerCase()

  // Check if the company is valid
  if (!companies.includes(company)) {
    notFound()
  }

  // Format company name for display
  const companyNames: Record<string, string> = {
    mapa: "MAPA",
    np: "N&P",
    telhas: "TELHAS",
    telhaco: "TELHAÇO",
    metro: "METRO",
  }

  const displayName = companyNames[company] || company.toUpperCase()

  return (
    <DashboardShell>
      <DashboardHeader heading={displayName} subheading="Gerenciamento de arquivos financeiros" />
      <CompanyFileManager company={displayName} />
    </DashboardShell>
  )
}
