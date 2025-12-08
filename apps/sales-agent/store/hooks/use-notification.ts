/**
 * Notification Store Hooks
 * Custom hooks for accessing notification state and actions
 */

import { useNotificationStore } from '../slices/notification/notification-store';
import { Notification, NotificationType, NotificationPriority } from '../../types/notification';

/**
 * Get entire notification state
 */
export const useNotification = () => useNotificationStore((state) => state);

/**
 * Get all notifications
 */
export const useNotifications = (): Notification[] => useNotificationStore((state) => state.notifications);

/**
 * Get unread count
 */
export const useUnreadCount = (): number => useNotificationStore((state) => state.unreadCount);

/**
 * Get notification loading state
 */
export const useNotificationLoading = (): boolean => useNotificationStore((state) => state.isLoading);

/**
 * Get notification error
 */
export const useNotificationError = (): string | null => useNotificationStore((state) => state.error);

/**
 * Get notification actions
 */
export const useNotificationActions = () => ({
  fetchNotifications: useNotificationStore((state) => state.fetchNotifications),
  addNotification: useNotificationStore((state) => state.addNotification),
  markAsRead: useNotificationStore((state) => state.markAsRead),
  markAllAsRead: useNotificationStore((state) => state.markAllAsRead),
  deleteNotification: useNotificationStore((state) => state.deleteNotification),
  clearAllNotifications: useNotificationStore((state) => state.clearAllNotifications),
  refreshNotifications: useNotificationStore((state) => state.refreshNotifications),
});

/**
 * Get unread notifications only
 */
export const useUnreadNotifications = (): Notification[] => {
  const notifications = useNotificationStore((state) => state.notifications);
  return notifications.filter((n) => !n.read);
};

/**
 * Get read notifications only
 */
export const useReadNotifications = (): Notification[] => {
  const notifications = useNotificationStore((state) => state.notifications);
  return notifications.filter((n) => n.read);
};

/**
 * Get notifications by type
 */
export const useNotificationsByType = (type: NotificationType): Notification[] => {
  const getNotificationsByType = useNotificationStore((state) => state.getNotificationsByType);
  return getNotificationsByType(type);
};

/**
 * Get notifications by priority
 */
export const useNotificationsByPriority = (priority: NotificationPriority): Notification[] => {
  const getNotificationsByPriority = useNotificationStore((state) => state.getNotificationsByPriority);
  return getNotificationsByPriority(priority);
};

/**
 * Get urgent notifications
 */
export const useUrgentNotifications = (): Notification[] => {
  const notifications = useNotificationStore((state) => state.notifications);
  return notifications.filter((n) => n.priority === 'urgent' && !n.read);
};

/**
 * Get high priority notifications
 */
export const useHighPriorityNotifications = (): Notification[] => {
  const notifications = useNotificationStore((state) => state.notifications);
  return notifications.filter((n) => n.priority === 'high' && !n.read);
};

/**
 * Get notification count by type
 */
export const useNotificationCountByType = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  return {
    shopApproved: notifications.filter((n) => n.type === 'shop_approved').length,
    shopRejected: notifications.filter((n) => n.type === 'shop_rejected').length,
    orderStatus: notifications.filter((n) => n.type === 'order_status').length,
    orderConfirmed: notifications.filter((n) => n.type === 'order_confirmed').length,
    orderDelivered: notifications.filter((n) => n.type === 'order_delivered').length,
    routeAssigned: notifications.filter((n) => n.type === 'route_assigned').length,
    targetAchieved: notifications.filter((n) => n.type === 'target_achieved').length,
    commissionUpdate: notifications.filter((n) => n.type === 'commission_update').length,
    inventoryUpdate: notifications.filter((n) => n.type === 'inventory_update').length,
    promotion: notifications.filter((n) => n.type === 'promotion').length,
    system: notifications.filter((n) => n.type === 'system').length,
    announcement: notifications.filter((n) => n.type === 'announcement').length,
  };
};

/**
 * Check if there are unread notifications
 */
export const useHasUnreadNotifications = (): boolean => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  return unreadCount > 0;
};

/**
 * Get today's notifications
 */
export const useTodaysNotifications = (): Notification[] => {
  const notifications = useNotificationStore((state) => state.notifications);
  const today = new Date().toISOString().split('T')[0];
  return notifications.filter((n) => n.createdAt.split('T')[0] === today);
};
