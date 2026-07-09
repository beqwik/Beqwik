import { create } from "zustand";

import type { Member } from "../types/member";
import type { MemberSubscription } from "../types/memberSubscription";
import type { MemberNotification } from "../types/memberNotification";

interface MemberStore {
  member: Member | null;

  subscription: MemberSubscription | null;

  notifications: MemberNotification[];

  isAuthenticated: boolean;

  loading: boolean;

  setMember: (member: Member | null) => void;

  setSubscription: (
    subscription: MemberSubscription | null
  ) => void;

  setNotifications: (
    notifications: MemberNotification[]
  ) => void;

  setLoading: (loading: boolean) => void;

  logout: () => void;
}

export const useMemberStore =
  create<MemberStore>((set) => ({
    member: null,

    subscription: null,

    notifications: [],

    isAuthenticated: false,

    loading: false,

    setMember: (member) =>
      set({
        member,
        isAuthenticated: !!member,
      }),

    setSubscription: (subscription) =>
      set({
        subscription,
      }),

    setNotifications: (notifications) =>
      set({
        notifications,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),

    logout: () =>
      set({
        member: null,
        subscription: null,
        notifications: [],
        isAuthenticated: false,
      }),
  }));