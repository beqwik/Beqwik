import { create } from "zustand";

interface SuperAdmin {
  id: string;
  email: string;
  full_name: string;
}

interface SuperAdminStore {
  admin: SuperAdmin | null;
  isAuthenticated: boolean;
  loading: boolean;

  setAdmin: (admin: SuperAdmin | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useSuperAdminStore =
  create<SuperAdminStore>((set) => ({
    admin: null,

    isAuthenticated: false,

    loading: false,

    setAdmin: (admin) =>
      set({
        admin,
        isAuthenticated: !!admin,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),

    logout: () =>
      set({
        admin: null,
        isAuthenticated: false,
      }),
  }));