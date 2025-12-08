// src/lib/websocket/client.ts
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../api/client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export interface RiderLocationUpdate {
  riderId: string;
  location: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  timestamp: string;
}

export interface DeliveryStatusUpdate {
  deliveryId: string;
  shopId: string;
  status: string;
  riderId: string;
  timestamp: string;
}

export interface OrderUpdate {
  orderId: string;
  shopId: string;
  status: string;
  message: string;
}

export interface RouteAssignment {
  routeId: string;
  riderId: string;
  routeName: string;
  shopCount: number;
}

/**
 * Connect to WebSocket server
 */
export const connectWebSocket = (token?: string): Socket => {
  if (socket && socket.connected) {
    console.log('WebSocket already connected');
    return socket;
  }

  const authToken = token || getAuthToken();

  if (!authToken) {
    throw new Error('No authentication token available');
  }

  socket = io(WS_URL, {
    auth: {
      token: authToken,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('WebSocket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.on('connected', (data) => {
    console.log('WebSocket authenticated:', data);
  });

  return socket;
};

/**
 * Get existing socket instance
 */
export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    throw new Error('WebSocket not connected. Call connectWebSocket() first.');
  }
  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('WebSocket disconnected');
  }
};

/**
 * Listen for rider location updates
 */
export const onRiderLocationUpdate = (callback: (data: RiderLocationUpdate) => void): void => {
  const ws = getSocket();
  ws.on('rider:location-updated', callback);
};

/**
 * Listen for delivery status changes
 */
export const onDeliveryStatusChange = (callback: (data: DeliveryStatusUpdate) => void): void => {
  const ws = getSocket();
  ws.on('delivery:status-changed', callback);
};

/**
 * Listen for order updates
 */
export const onOrderUpdate = (callback: (data: OrderUpdate) => void): void => {
  const ws = getSocket();
  ws.on('order:updated', callback);
};

/**
 * Listen for route assignments
 */
export const onRouteAssigned = (callback: (data: RouteAssignment) => void): void => {
  const ws = getSocket();
  ws.on('route:assigned-to-you', callback);
};

/**
 * Emit rider location update (for riders)
 */
export const emitRiderLocation = (location: { lat: number; lng: number }, accuracy: number): void => {
  const ws = getSocket();
  ws.emit('rider:update-location', {
    location,
    accuracy,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Remove event listener
 */
export const removeListener = (event: string, callback?: (...args: any[]) => void): void => {
  const ws = getSocket();
  if (callback) {
    ws.off(event, callback);
  } else {
    ws.off(event);
  }
};

export default {
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
  getSocket,
  onRiderLocationUpdate,
  onDeliveryStatusChange,
  onOrderUpdate,
  onRouteAssigned,
  emitRiderLocation,
  removeListener,
};
