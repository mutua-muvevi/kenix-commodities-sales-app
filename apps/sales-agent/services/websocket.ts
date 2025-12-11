import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const WS_URL = 'http://192.168.100.6:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async connect() {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        console.log('No auth token, skipping WebSocket connection');
        return;
      }

      if (this.socket?.connected) {
        console.log('WebSocket already connected');
        return;
      }

      this.socket = io(WS_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();

      console.log('WebSocket connection initiated');
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);

      if (reason === 'io server disconnect') {
        // Server disconnected, attempt manual reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    });

    // Shop approval notification
    this.socket.on('shop:approved', async (data) => {
      console.log('Shop approved:', data);
      await this.showNotification(
        'Shop Approved!',
        `${data.shopName} has been approved. You can now place orders!`,
        { shopId: data.shopId }
      );
    });

    // Shop rejection notification
    this.socket.on('shop:rejected', async (data) => {
      console.log('Shop rejected:', data);
      await this.showNotification(
        'Shop Rejected',
        `${data.shopName} was rejected. Reason: ${data.reason}`,
        { shopId: data.shopId }
      );
    });

    // Order status update notification
    this.socket.on('order:update', async (data) => {
      console.log('Order updated:', data);
      await this.showNotification(
        'Order Update',
        `Order #${data.orderNumber} is now ${data.status}`,
        { orderId: data.orderId }
      );
    });

    // Order approved notification
    this.socket.on('order:approved', async (data) => {
      console.log('Order approved:', data);
      await this.showNotification(
        'Order Approved!',
        `Order #${data.orderNumber} has been approved and is being processed`,
        { orderId: data.orderId }
      );
    });

    // Order delivered notification
    this.socket.on('order:delivered', async (data) => {
      console.log('Order delivered:', data);
      await this.showNotification(
        'Order Delivered!',
        `Order #${data.orderNumber} has been delivered. You've earned ${data.commission}!`,
        { orderId: data.orderId }
      );
    });

    // Commission payment notification
    this.socket.on('commission:paid', async (data) => {
      console.log('Commission paid:', data);
      await this.showNotification(
        'Commission Paid!',
        `You've received KES ${data.amount} in commission payments`,
        { }
      );
    });

    // Generic notification
    this.socket.on('notification', async (data) => {
      console.log('Generic notification:', data);
      await this.showNotification(
        data.title || 'Notification',
        data.message || 'You have a new notification',
        data.data || {}
      );
    });

    // Location update acknowledgment
    this.socket.on('location:updated', (data) => {
      console.log('Location update acknowledged:', data);
    });

    // Location tracking error
    this.socket.on('location:error', (data) => {
      console.error('Location tracking error from server:', data);
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.socket?.connect();
    }, delay);
  }

  private async showNotification(title: string, body: string, data: any = {}) {
    try {
      // Request permissions if not already granted
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn('WebSocket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.reconnectAttempts = 0;
    console.log('WebSocket disconnected');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
