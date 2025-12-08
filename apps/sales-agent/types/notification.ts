/**
 * Notification Type Definitions
 * Defines types for push notifications, in-app notifications, and alerts
 */

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  priority: NotificationPriority;
  actionable: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export type NotificationType =
  | 'shop_approved'
  | 'shop_rejected'
  | 'order_status'
  | 'order_confirmed'
  | 'order_delivered'
  | 'order_cancelled'
  | 'route_assigned'
  | 'route_reminder'
  | 'target_reminder'
  | 'target_achieved'
  | 'commission_update'
  | 'commission_paid'
  | 'inventory_update'
  | 'price_update'
  | 'promotion'
  | 'system'
  | 'announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationData {
  entityId?: string; // shop, order, route, etc.
  entityType?: 'shop' | 'order' | 'route' | 'commission' | 'target';
  metadata?: Record<string, any>;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: string;
  badge?: number;
  priority?: NotificationPriority;
  channelId?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  categories: {
    [key in NotificationType]?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export interface NotificationSettings {
  userId: string;
  preferences: NotificationPreferences;
  updatedAt: string;
}

export interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  text1: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  onPress?: () => void;
}

export interface InAppAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  dismissible: boolean;
  autoHide?: boolean;
  duration?: number; // milliseconds
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface NotificationBadge {
  count: number;
  categories: {
    [key in NotificationType]?: number;
  };
}

export interface NotificationGroup {
  type: NotificationType;
  notifications: Notification[];
  count: number;
  latestDate: string;
  allRead: boolean;
}
