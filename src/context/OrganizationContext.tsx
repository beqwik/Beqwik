import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import useAuth from "../hooks/useAuth";

import type {
  OrganizationRow,
  OrganizationUserRow,
} from "../types/organization";

interface OrganizationContextType {
  organization: OrganizationRow | null;
  organizationUser: OrganizationUserRow | null;
  organizationId: string | null;
  loading: boolean;
  reloadOrganization: () => Promise<void>;
}

const OrganizationContext =
  createContext<OrganizationContextType>({
    organization: null,
    organizationUser: null,
    organizationId: null,
    loading: true,
    reloadOrganization: async () => {},
  });

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();

  const [organization, setOrganization] =
    useState<OrganizationRow | null>(null);

  const [organizationUser, setOrganizationUser] =
    useState<OrganizationUserRow | null>(null);

  const [loading, setLoading] = useState(true);

  // Tracks which user id the current state was fetched for,
  // so token refreshes (which hand us a new `user` object
  // reference for the same account) don't trigger a refetch.
  const loadedForUserId = useRef<string | null>(null);

  const loadOrganization = useCallback(async () => {
    if (!user) {
      loadedForUserId.current = null;
      setOrganization(null);
      setOrganizationUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: orgUser, error } = await supabase
      .from("organization_users")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !orgUser) {
      loadedForUserId.current = user.id;
      setOrganization(null);
      setOrganizationUser(null);
      setLoading(false);
      return;
    }

    const { data: organizationData } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgUser.organization_id)
      .single();

    loadedForUserId.current = user.id;
    setOrganizationUser(orgUser);
    setOrganization(organizationData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (loadedForUserId.current === (user?.id ?? null)) {
      setLoading(false);
      return;
    }

    loadOrganization();
  }, [authLoading, user, loadOrganization]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizationUser,
        organizationId: organization?.id ?? null,
        loading,
        reloadOrganization: loadOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  return useContext(OrganizationContext);
}
