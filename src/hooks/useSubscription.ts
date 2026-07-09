import { useSubscriptionContext } from "../context/SubscriptionContext";

export default function useSubscription() {
  return useSubscriptionContext();
}
