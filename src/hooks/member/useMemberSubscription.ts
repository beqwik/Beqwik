import {
  getMemberSubscriptions,
  getActiveSubscription,
  getCurrentSubscription,
  purchaseSubscription,
  cancelSubscription,
  renewSubscription,
} from "../../services/member/memberSubscriptionService";

export function useMemberSubscription() {
  return {
    getMemberSubscriptions,
    getActiveSubscription,
    getCurrentSubscription,
    purchaseSubscription,
    cancelSubscription,
    renewSubscription,
  };
}