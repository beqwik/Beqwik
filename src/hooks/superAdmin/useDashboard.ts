import { useCallback, useEffect, useState } from "react";

import { getDashboardStats } from "../../services/superAdmin/dashboardService";
import type { DashboardStats } from "../../types/superAdmin/dashboard";

const initialDashboardState: DashboardStats = {
  organizations: 0,
  members: 0,
  revenue: 0,
  subscriptions: 0,

  organizationTypes: [],

  revenueTrend: [],
  memberGrowth: [],
  organizationGrowth: [],

  kpis: {
    trialOrganizations: 0,
    activeOrganizations: 0,
    expiredOrganizations: 0,
    pendingPayments: 0,
  },

  recentOrganizations: [],
  recentPayments: [],
  recentSubscriptions: [],
  activityLogs: [],
};

export function useDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>(initialDashboardState);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardStats();

      setStats({
        ...initialDashboardState,
        ...data,
      });
    } catch (err) {
      console.error(err);

      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    stats,
    loading,
    error,
    refreshDashboard,
  };
}