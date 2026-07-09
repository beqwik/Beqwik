import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../services/member/memberNotificationService";

export function useMemberNotifications() {
  return {
    getNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  };
}