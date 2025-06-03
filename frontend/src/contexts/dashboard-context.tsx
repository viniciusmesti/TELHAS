"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface DashboardContextType {
  shouldRefreshStats: boolean;
  triggerStatsRefresh: () => void;
  resetRefreshFlag: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [shouldRefreshStats, setShouldRefreshStats] = useState(false);

  const triggerStatsRefresh = useCallback(() => {
    setShouldRefreshStats(true);
  }, []);

  const resetRefreshFlag = useCallback(() => {
    setShouldRefreshStats(false);
  }, []);

  return (
    <DashboardContext.Provider value={{
      shouldRefreshStats,
      triggerStatsRefresh,
      resetRefreshFlag
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}