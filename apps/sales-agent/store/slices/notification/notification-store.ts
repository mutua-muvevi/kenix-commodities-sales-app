/**
 * Notification Store Slice
 * Manages in-app notifications and alerts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationType, NotificationPriority } from '../../../types/notification';
import { asyncStorage } from '../../middleware/persist';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: (userId: string) => Promise<void>;
  getUnreadCount: () => number;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  clearError: () => void;
  refreshNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial State
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      // Fetch Notifications
      fetchNotifications: async (userId: string) => {
        actionLogger('NotificationStore', 'fetchNotifications', userId);
        try {
          set({ isLoading: true, error: null });

          const notifications = await apiService.getNotifications(userId);

          const unreadCount = notifications.filter((n: Notification) => !n.read).length;

          set({
            notifications,
            unreadCount,
            isLoading: false,
            error: null,
          });

          actionLogger('NotificationStore', 'fetchNotifications', `Loaded ${notifications.length} notifications`);
        } catch (error: any) {
          errorLogger('NotificationStore', 'fetchNotifications', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch notifications',
            isLoading: false,
          });
          throw error;
        }
      },

      // Add Notification
      addNotification: (notification: Notification) => {
        actionLogger('NotificationStore', 'addNotification', notification._id);

        const { notifications } = get();
        const updatedNotifications = [notification, ...notifications];
        const unreadCount = updatedNotifications.filter((n) => !n.read).length;

        set({
          notifications: updatedNotifications,
          unreadCount,
        });
      },

      // Mark As Read
      markAsRead: async (notificationId: string) => {
        actionLogger('NotificationStore', 'markAsRead', notificationId);
        try {
          set({ isLoading: true, error: null });

          await apiService.markNotificationAsRead(notificationId);

          const { notifications } = get();
          const updatedNotifications = notifications.map((n) =>
            n._id === notificationId
              ? { ...n, read: true, readAt: new Date().toISOString() }
              : n
          );

          const unreadCount = updatedNotifications.filter((n) => !n.read).length;

          set({
            notifications: updatedNotifications,
            unreadCount,
            isLoading: false,
            error: null,
          });

          actionLogger('NotificationStore', 'markAsRead', 'Success');
        } catch (error: any) {
          errorLogger('NotificationStore', 'markAsRead', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to mark as read',
            isLoading: false,
          });
          throw error;
        }
      },

      // Mark All As Read
      markAllAsRead: async (userId: string) => {
        actionLogger('NotificationStore', 'markAllAsRead', userId);
        try {
          set({ isLoading: true, error: null });

          await apiService.markAllNotificationsAsRead(userId);

          const { notifications } = get();
          const updatedNotifications = notifications.map((n) => ({
            ...n,
            read: true,
            readAt: n.readAt || new Date().toISOString(),
          }));

          set({
            notifications: updatedNotifications,
            unreadCount: 0,
            isLoading: false,
            error: null,
          });

          actionLogger('NotificationStore', 'markAllAsRead', 'Success');
        } catch (error: any) {
          errorLogger('NotificationStore', 'markAllAsRead', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to mark all as read',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete Notification
      deleteNotification: async (notificationId: string) => {
        actionLogger('NotificationStore', 'deleteNotification', notificationId);
        try {
          set({ isLoading: true, error: null });

          await apiService.deleteNotification(notificationId);

          const { notifications } = get();
          const updatedNotifications = notifications.filter((n) => n._id !== notificationId);
          const unreadCount = updatedNotifications.filter((n) => !n.read).length;

          set({
            notifications: updatedNotifications,
            unreadCount,
            isLoading: false,
            error: null,
          });

          actionLogger('NotificationStore', 'deleteNotification', 'Success');
        } catch (error: any) {
          errorLogger('NotificationStore', 'deleteNotification', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete notification',
            isLoading: false,
          });
          throw error;
        }
      },

      // Clear All Notifications
      clearAllNotifications: async (userId: string) => {
        actionLogger('NotificationStore', 'clearAllNotifications', userId);
        try {
          set({ isLoading: true, error: null });

          await apiService.clearAllNotifications(userId);

          set({
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            error: null,
          });

          actionLogger('NotificationStore', 'clearAllNotifications', 'Success');
        } catch (error: any) {
          errorLogger('NotificationStore', 'clearAllNotifications', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to clear notifications',
            isLoading: false,
          });
          throw error;
        }
      },

      // Get Unread Count
      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter((n) => !n.read).length;
      },

      // Get Notifications By Type
      getNotificationsByType: (type: NotificationType) => {
        const { notifications } = get();
        return notifications.filter((n) => n.type === type);
      },

      // Get Notifications By Priority
      getNotificationsByPriority: (priority: NotificationPriority) => {
        const { notifications } = get();
        return notifications.filter((n) => n.priority === priority);
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Refresh Notifications
      refreshNotifications: async (userId: string) => {
        actionLogger('NotificationStore', 'refreshNotifications', userId);
        await get().fetchNotifications(userId);
      },
    }),
    {
      name: 'sales-agent-notifications',
      storage: asyncStorage,
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
