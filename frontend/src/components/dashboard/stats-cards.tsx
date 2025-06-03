"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, FileUp, FileDown, Clock, Users, RefreshCw } from "lucide-react";
import { getDashboardStats } from "@/services/api";
import { useDashboard } from "@/contexts/dashboard-context";

interface DashboardStats {
  totalUploads: number;
  totalDownloads: number;
  empresasAtivas: number;
  ultimoUpload: {
    processedAt: string;
    empresa: string;
    filename: string;
  } | null;
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shouldRefreshStats, resetRefreshFlag } = useDashboard();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Escuta mudanças no contexto para atualizar automaticamente
  useEffect(() => {
    if (shouldRefreshStats) {
      fetchStats();
      resetRefreshFlag();
    }
  }, [shouldRefreshStats, resetRefreshFlag]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) return "Hoje";
    
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) return "Ontem";
    
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 rounded-md">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="futuristic-card p-6 animate-pulse">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="rounded-full bg-gray-300 p-2 h-8 w-8"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="futuristic-card p-6">
              <div className="text-center text-red-500">
                <p className="text-sm">Erro ao carregar dados</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Uploads */}
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

        {/* Total de Downloads */}
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

        {/* Empresas Ativas */}
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

        {/* Último Upload */}
        <div className="futuristic-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Último Upload</h3>
            <div className="rounded-full bg-primary/20 p-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            {stats?.ultimoUpload ? formatDateDisplay(stats.ultimoUpload.processedAt) : "Nenhum"}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {stats?.ultimoUpload ? (
              <span 
                title={`${stats.ultimoUpload.empresa} - ${stats.ultimoUpload.filename}`}
                className="truncate"
              >
                {formatTimeAgo(stats.ultimoUpload.processedAt)} - {stats.ultimoUpload.empresa}
              </span>
            ) : (
              <span>Nenhum upload realizado</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}