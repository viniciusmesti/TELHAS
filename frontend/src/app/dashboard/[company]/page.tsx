import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { CompanyFileManager } from "@/components/company/file-manager";

// Aqui você mapeia a rota (mapa, np, telhas, telhaco) PARA:
// 1) O texto que aparece no header (displayName)
// 2) O código que está no seu banco (codigoSistema)
const companyMap: Record<string, { displayName: string; codigoSistema: string }> = {
  mapa:    { displayName: "MAPA",    codigoSistema: "999" },
  np:      { displayName: "N&P",     codigoSistema: "000" },
  telhas:  { displayName: "TELHAS",  codigoSistema: "222" },
  telhaco: { displayName: "TELHAÇO", codigoSistema: "111" },
  metro:   { displayName: "METRO",   codigoSistema: "333" }, // ✅ ATIVADO
};


export default function CompanyPage({
  params,
}: {
  params: { company: string };
}) {
  const key = params.company.toLowerCase();
  const companyInfo = companyMap[key];

  if (!companyInfo) {
    notFound();
  }

  const { displayName, codigoSistema } = companyInfo;

  return (
    <DashboardShell>
      <DashboardHeader
        heading={displayName}
        subheading="Gerenciamento de arquivos financeiros"
      />
      {/* Agora você passa exatamente o código que o Prisma espera */}
      <CompanyFileManager
        company={{
          id: key,
          nome: displayName,
          codigoSistema,  // ex: '999', '000', '222' ou '111'
        }}
      />
    </DashboardShell>
  );
}
