import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell }  from "@/components/dashboard/shell";
import { DownloadHistory } from "@/components/dashboard/DownloadHistory";

export default function DownloadHistoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Histórico de Downloads"
        subheading="Confira seus downloads recentes e gerencie-os"
      />
      <DownloadHistory />
    </DashboardShell>
  );
}