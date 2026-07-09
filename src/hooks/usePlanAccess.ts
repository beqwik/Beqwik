import useSubscription from "./useSubscription";

export type FeatureTab =
  | "overview"
  | "members"
  | "subscriptions"
  | "settings"
  | "notifications"
  | "slots"
  | "equipment"
  | "menu"
  | "meals"
  | "classes";

const ACCESS_RULES: Record<FeatureTab, string[]> = {
  overview: ["Trial", "Basic", "Pro", "Enterprise"],
  members: ["Basic", "Pro", "Enterprise"],
  subscriptions: ["Basic", "Pro", "Enterprise"],
  settings: ["Basic", "Pro", "Enterprise"],
  notifications: ["Pro", "Enterprise"],
  slots: ["Pro", "Enterprise"],
  equipment: ["Pro", "Enterprise"],
  menu: ["Pro", "Enterprise"],
  meals: ["Pro", "Enterprise"],
  classes: ["Pro", "Enterprise"],
};

export default function usePlanAccess() {
  const { subscription, loading } = useSubscription();
  const planName = subscription?.subscription_plans?.name || "Trial";

  const hasAccess = (tab: FeatureTab | string): boolean => {
    const allowedPlans = ACCESS_RULES[tab as FeatureTab];
    return allowedPlans ? allowedPlans.includes(planName) : false;
  };

  return { planName, hasAccess, loading };
}
