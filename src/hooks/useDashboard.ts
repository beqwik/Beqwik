import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { dashboardService } from "../services/dashboard/dashboardService";

import useOrganization from "./useOrganization";

export function useDashboard() {
  const {
    organization,
    organizationId,
    loading: organizationLoading,
  } = useOrganization();

  const [loading, setLoading] =
    useState(true);

  const [
    organizationSubscription,
    setOrganizationSubscription,
  ] = useState<any>(null);

  const [members, setMembers] =
    useState<any[]>([]);

  const [
    subscriptions,
    setSubscriptions,
  ] = useState<any[]>([]);

  const [
    notifications,
    setNotifications,
  ] = useState<any[]>([]);

  const loadDashboard =
    useCallback(async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await dashboardService.getDashboardData(
            organizationId
          );

        setOrganizationSubscription(
          data.organizationSubscription
        );

        setMembers(data.members);

        setSubscriptions(
          data.subscriptions
        );

        setNotifications(
          data.notifications
        );
      } catch (err) {
        console.error(
          "Dashboard Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    }, [organizationId]);

  useEffect(() => {
    if (!organizationLoading) {
      loadDashboard();
    }
  }, [
    organizationLoading,
    loadDashboard,
  ]);

  return {
    loading,

    organization,

    organizationSubscription,

    members,

    subscriptions,

    notifications,

    reloadDashboard:
      loadDashboard,

    setOrganizationSubscription,

    setMembers,

    setSubscriptions,

    setNotifications,
  };
}