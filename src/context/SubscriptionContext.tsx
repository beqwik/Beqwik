import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import { useOrganizationContext } from "./OrganizationContext";

import type { OrganizationSubscriptionRow } from "../types/subscription";

interface SubscriptionContextType {
  subscription: OrganizationSubscriptionRow | null;
  loading: boolean;
  reloadSubscription: () => Promise<void>;
}

const SubscriptionContext =
  createContext<SubscriptionContextType>({
    subscription: null,
    loading: true,
    reloadSubscription: async () => {},
  });

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationId, loading: organizationLoading } =
    useOrganizationContext();

  const [subscription, setSubscription] =
    useState<OrganizationSubscriptionRow | null>(null);

  const [loading, setLoading] = useState(true);

  // Tracks which organization id the current state was fetched
  // for, so re-renders of the provider don't trigger a refetch.
  const loadedForOrganizationId = useRef<string | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!organizationId) {
      loadedForOrganizationId.current = null;
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from("organization_subscriptions")
      .select(
        `
        *,
        subscription_plans(*)
      `
      )
      .eq("organization_id", organizationId)
      .maybeSingle();

    loadedForOrganizationId.current = organizationId;
    setSubscription(data);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    if (organizationLoading) return;

    if (loadedForOrganizationId.current === organizationId) {
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [organizationLoading, organizationId, loadSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        reloadSubscription: loadSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  return useContext(SubscriptionContext);
}
