import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for recent activity
const recentActivity = [
  {
    id: 1,
    type: "upload",
    company: "MAPA",
    category: "Recebimentos",
    fileName: "recebimentos-maio-2023.xlsx",
    date: "2023-05-22T10:30:00Z",
    user: "João Silva",
  },
  {
    id: 2,
    type: "download",
    company: "TELHAS",
    category: "Pagamentos",
    fileName: "pagamentos-abril-2023.pdf",
    date: "2023-05-21T15:45:00Z",
    user: "Maria Oliveira",
  },
  {
    id: 3,
    type: "upload",
    company: "N&P",
    category: "Regra 289",
    fileName: "regra289-maio-2023.csv",
    date: "2023-05-20T09:15:00Z",
    user: "Carlos Santos",
  },
  {
    id: 4,
    type: "download",
    company: "METRO",
    category: "Regra 326",
    fileName: "regra326-maio-2023.xlsx",
    date: "2023-05-19T14:20:00Z",
    user: "Ana Pereira",
  },
  {
    id: 5,
    type: "upload",
    company: "TELHAÇO",
    category: "Pagamentos",
    fileName: "pagamentos-maio-2023.pdf",
    date: "2023-05-18T11:10:00Z",
    user: "Pedro Costa",
  },
]

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function RecentActivity() {
  return (
    <div className="futuristic-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
        <CardDescription>Últimas 5 atividades realizadas no sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="futuristic-border flex items-start space-x-4 p-3 bg-background/50 dark:bg-muted/20"
            >
              <div
                className={`rounded-full p-2 ${
                  activity.type === "upload" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                }`}
              >
                {activity.type === "upload" ? (
                  <ArrowUpFromLine className="h-4 w-4" />
                ) : (
                  <ArrowDownToLine className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {activity.type === "upload" ? "Upload" : "Download"}: {activity.fileName}
                  </p>
                  <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{activity.company}</span>
                  <span className="mx-1">•</span>
                  <span>{activity.category}</span>
                  <span className="mx-1">•</span>
                  <span>por {activity.user}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  )
}
