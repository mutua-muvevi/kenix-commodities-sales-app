import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import type { PaymentConfirmation } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://192.168.1.100:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers();

      return this.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyListeners('connect', {});
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.notifyListeners('disconnect', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyListeners('max_reconnect', {});
      }
    });

    // Payment confirmation event
    this.socket.on('payment:confirmed', (data: PaymentConfirmation) => {
      console.log('Payment confirmed:', data);
      this.notifyListeners('payment:confirmed', data);
    });

    // Route update event
    this.socket.on('route:updated', (data: any) => {
      console.log('Route updated:', data);
      this.notifyListeners('route:updated', data);
    });

    // Delivery assignment event
    this.socket.on('delivery:assigned', (data: any) => {
      console.log('Delivery assigned:', data);
      this.notifyListeners('delivery:assigned', data);
    });

    // Delivery status changed event
    this.socket.on('delivery:status-changed', (data: any) => {
      console.log('Delivery status changed:', data);
      this.notifyListeners('delivery:status-changed', data);
    });

    // Route assigned event
    this.socket.on('route:assigned', (data: any) => {
      console.log('Route assigned:', data);
      this.notifyListeners('route:assigned', data);
    });

    // Wallet updated event
    this.socket.on('wallet:updated', (data: any) => {
      console.log('Wallet updated:', data);
      this.notifyListeners('wallet:updated', data);
    });

    // Payment failed event
    this.socket.on('payment:failed', (data: any) => {
      console.log('Payment failed:', data);
      this.notifyListeners('payment:failed', data);
    });

    // Admin shop unlock event
    this.socket.on('admin:shop-unlocked', (data: any) => {
      console.log('Admin unlocked shop:', data);
      this.notifyListeners('admin:shop-unlocked', data);
    });

    // Skip request acknowledgment
    this.socket.on('rider:skip-request-received', (data: any) => {
      console.log('Skip request received by admin:', data);
      this.notifyListeners('rider:skip-request-received', data);
    });

    // Skip approval/rejection from admin
    this.socket.on('admin:skip-approved', (data: any) => {
      console.log('Skip approved by admin:', data);
      this.notifyListeners('admin:skip-approved', data);
    });

    this.socket.on('admin:skip-rejected', (data: any) => {
      console.log('Skip rejected by admin:', data);
      this.notifyListeners('admin:skip-rejected', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Emit events
  emitLocation(location: { lat: number; lng: number }): void {
    if (this.socket?.connected) {
      this.socket.emit('rider:update-location', { location });
    }
  }

  emitDeliveryStatus(deliveryId: string, status: string): void {
    if (this.socket?.connected) {
      this.socket.emit('delivery:status-update', { deliveryId, status });
    }
  }

  requestShopUnlock(deliveryId: string, reason: string): void {
    if (this.socket?.connected) {
      this.socket.emit('rider:request-unlock', { deliveryId, reason });
      console.log('Shop unlock requested:', { deliveryId, reason });
    }
  }

  requestShopSkip(skipRequest: {
    deliveryId: string;
    shopId: string;
    reason: string;
    notes: string;
    photo?: string;
    location?: { lat: number; lng: number };
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('rider:request-skip', {
        ...skipRequest,
        timestamp: new Date().toISOString(),
      });
      console.log('Shop skip requested:', skipRequest);
    }
  }

  // Emit generic event
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Emit route deviation alert
  emitRouteDeviation(deviationData: {
    routeId: string;
    currentLocation: { lat: number; lng: number };
    expectedRoute: Array<{ lat: number; lng: number }>;
    deviationDistance: number;
    severity: string;
    currentDeliveryId?: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('rider:route-deviation', deviationData);
      console.log('Route deviation reported:', deviationData);
    }
  }
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Hook for easy usage in React components
export const useWebSocketEvent = (
  event: string,
  callback: Function
): (() => void) => {
  websocketService.on(event, callback);

  // Cleanup on unmount
  return () => {
    websocketService.off(event, callback);
  };
};
