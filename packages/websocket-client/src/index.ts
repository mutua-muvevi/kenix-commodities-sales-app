// WebSocket Client for Real-time Updates - Kenix Commodities
import { io, Socket } from 'socket.io-client';
import type {
  WebSocketEvent,
  RiderLocationUpdate,
  DeliveryStatusUpdate,
  OrderStatusUpdate,
  PaymentConfirmation,
} from '@kenix/shared-types';

// ============================================================================
// TYPES
// ============================================================================

export interface WebSocketConfig {
  url?: string;
  getToken?: () => string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export type EventHandler<T = any> = (data: T) => void;

// ============================================================================
// WEBSOCKET CLIENT CLASS
// ============================================================================

export class KenixWebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
      reconnectionAttempts: config.reconnectionAttempts || 5,
      reconnectionDelay: config.reconnectionDelay || 3000,
      ...config,
    };
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  connect(): void {
    if (this.socket?.connected) {
      console.warn('WebSocket already connected');
      return;
    }

    const token = this.config.getToken?.();

    this.socket = io(this.config.url!, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.config.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.config.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.config.onError?.(error);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.config.onError?.(error);
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.config.onError?.(new Error('Failed to reconnect to server'));
    });
  }

  // ============================================================================
  // EVENT SUBSCRIPTION
  // ============================================================================

  on<T = any>(event: WebSocketEvent | string, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);

    // Subscribe to socket event if this is the first handler
    if (handlers.size === 1 && this.socket) {
      this.socket.on(event, (data: T) => {
        handlers.forEach((h) => h(data));
      });
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<T = any>(event: WebSocketEvent | string, handler?: EventHandler<T>): void {
    if (!handler) {
      // Remove all handlers for this event
      this.eventHandlers.delete(event);
      this.socket?.off(event);
      return;
    }

    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);

      // If no more handlers, unsubscribe from socket event
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
        this.socket?.off(event);
      }
    }
  }

  // ============================================================================
  // EMIT EVENTS
  // ============================================================================

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('Cannot emit event: WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // ============================================================================
  // TYPED EVENT SUBSCRIPTIONS (Convenience Methods)
  // ============================================================================

  onRiderLocationUpdate(handler: EventHandler<RiderLocationUpdate>): () => void {
    return this.on(WebSocketEvent.RIDER_LOCATION_UPDATED, handler);
  }

  onDeliveryStatusChange(handler: EventHandler<DeliveryStatusUpdate>): () => void {
    return this.on(WebSocketEvent.DELIVERY_STATUS_CHANGED, handler);
  }

  onOrderStatusChange(handler: EventHandler<OrderStatusUpdate>): () => void {
    return this.on(WebSocketEvent.ORDER_STATUS_CHANGED, handler);
  }

  onPaymentConfirmed(handler: EventHandler<PaymentConfirmation>): () => void {
    return this.on(WebSocketEvent.PAYMENT_CONFIRMED, handler);
  }

  // ============================================================================
  // ROOM MANAGEMENT (for targeted updates)
  // ============================================================================

  joinRoom(roomName: string): void {
    this.emit('join-room', { room: roomName });
  }

  leaveRoom(roomName: string): void {
    this.emit('leave-room', { room: roomName });
  }

  // Join rider-specific room (for rider app)
  joinRiderRoom(riderId: string): void {
    this.joinRoom(`rider:${riderId}`);
  }

  // Join shop-specific room (for shop app)
  joinShopRoom(shopId: string): void {
    this.joinRoom(`shop:${shopId}`);
  }

  // Join route-specific room (for admin & rider)
  joinRouteRoom(routeId: string): void {
    this.joinRoom(`route:${routeId}`);
  }

  // Join admin room (for all admin updates)
  joinAdminRoom(): void {
    this.joinRoom('admin');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let wsClientInstance: KenixWebSocketClient | null = null;

export const createWebSocketClient = (config?: WebSocketConfig): KenixWebSocketClient => {
  if (!wsClientInstance) {
    wsClientInstance = new KenixWebSocketClient(config);
  }
  return wsClientInstance;
};

export const getWebSocketClient = (): KenixWebSocketClient => {
  if (!wsClientInstance) {
    throw new Error('WebSocket client not initialized. Call createWebSocketClient first.');
  }
  return wsClientInstance;
};

// ============================================================================
// REACT HOOK (for convenience in React apps)
// ============================================================================

export interface UseWebSocketOptions<T = any> {
  event: WebSocketEvent | string;
  handler: EventHandler<T>;
  enabled?: boolean;
}

// Note: This is a basic implementation. For Next.js/React, we'll create proper hooks
// in the web app that use useEffect
export const createWebSocketHook = <T = any>(options: UseWebSocketOptions<T>) => {
  return () => {
    const client = getWebSocketClient();

    // In actual React hook, this would be in useEffect
    if (options.enabled !== false) {
      const unsubscribe = client.on(options.event, options.handler);
      return unsubscribe;
    }

    return () => {};
  };
};

export default KenixWebSocketClient;
