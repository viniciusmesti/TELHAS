import { ArrowUpRight, FileUp, FileDown, Clock, Users } from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="futuristic-card p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total de Uploads</h3>
          <div className="rounded-full bg-primary/20 p-2">
            <FileUp className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold">1,284</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
          <span className="text-green-500 font-medium">+12.5%</span> desde o último mês
        </p>
      </div>

      <div className="futuristic-card p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Total de Downloads</h3>
          <div className="rounded-full bg-secondary/20 p-2">
            <FileDown className="h-4 w-4 text-secondary" />
          </div>
        </div>
        <div className="text-2xl font-bold">892</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
          <span className="text-green-500 font-medium">+8.2%</span> desde o último mês
        </p>
      </div>

      <div className="futuristic-card p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Empresas Ativas</h3>
          <div className="rounded-full bg-accent/20 p-2">
            <Users className="h-4 w-4 text-accent" />
          </div>
        </div>
        <div className="text-2xl font-bold">5</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <span>Total de empresas no sistema</span>
        </p>
      </div>

      <div className="futuristic-card p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Último Upload</h3>
          <div className="rounded-full bg-primary/20 p-2">
            <Clock className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="text-2xl font-bold">Hoje</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <span>Há 2 horas atrás</span>
        </p>
      </div>
    </div>
  )
}
