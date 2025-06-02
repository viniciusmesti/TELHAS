"use client"

import React, { useEffect, useState } from "react"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, Trash2 } from "lucide-react"
import { api, getDownloadUrl } from '@/services/api';

interface HistoryItem {
  id: string
  filename: string
  company: string
  category: string
  createdAt: string
  user: string
}

export function DownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchHistory = async () => {
    try {
      const { data } = await api.get<HistoryItem[]>('/api/downloads/history')
      setHistory(data)
    } catch (err) {
      console.error('Erro ao carregar histórico', err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteOne = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return
    try {
      await api.delete(`/api/downloads/history/${id}`)
      fetchHistory()
    } catch (err) {
      console.error('Erro ao excluir registro', err)
    }
  }

  const deleteMany = async () => {
    if (selected.size === 0) return
    if (!confirm("Deseja excluir todos os selecionados?")) return

    try {
      const ids = Array.from(selected)
      await api.delete(`/api/downloads/history?ids=${ids.join(',')}`)
      setSelected(new Set())
      fetchHistory()
    } catch (err) {
      console.error('Erro ao excluir registros', err)
    }
  }

  const hasSelection = selected.size > 0

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))

  return (
    <div className="futuristic-card">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
        <div>
          <CardTitle>Histórico de Downloads</CardTitle>
          <CardDescription>
            Gerencie os últimos downloads realizados.
          </CardDescription>
        </div>
        <Button variant="destructive" disabled={!hasSelection} onClick={deleteMany}>
          Excluir Selecionados
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {history.map(item => (
            <div
              key={item.id}
              className="futuristic-border flex items-center justify-between p-3 bg-background/50 dark:bg-muted/20"
            >
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggleSelect(item.id)}
              />

              <div className="flex-1 ml-3 space-y-1">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-muted-foreground flex flex-wrap gap-1">
                  <span className="font-medium">{item.company}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{formatDate(item.createdAt)}</span>
                  <span>•</span>
                  <span>por {item.user}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <a href={getDownloadUrl(item.company, item.filename)}
                     target="_blank"
                     rel="noopener noreferrer"
                     download={item.filename}
                  >
                    <ArrowDownToLine className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" onClick={() => deleteOne(item.id)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  )
}
