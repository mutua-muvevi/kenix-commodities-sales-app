import { io, Socket } from "socket.io-client";
import { WEBSOCKET_URL } from "../store/constants/api-endpoints";
import * as SecureStore from "expo-secure-store";

let socket: Socket | null = null;
let isConnecting = false;

interface RiderLocationUpdate {
	routeId: string;
	location: {
		latitude: number;
		longitude: number;
	};
	timestamp: string;
}

interface DeliveryStatusUpdate {
	orderId: string;
	status: string;
	timestamp: string;
}

interface PaymentConfirmation {
	orderId: string;
	transactionId: string;
	amount: number;
	phoneNumber: string;
	status: "success" | "failed";
	timestamp: string;
}

export const connectWebSocket = async (): Promise<Socket> => {
	if (socket?.connected) {
		return socket;
	}

	if (isConnecting) {
		// Wait for existing connection attempt
		return new Promise((resolve, reject) => {
			const checkInterval = setInterval(() => {
				if (socket?.connected) {
					clearInterval(checkInterval);
					resolve(socket);
				} else if (!isConnecting) {
					clearInterval(checkInterval);
					reject(new Error("Connection failed"));
				}
			}, 100);

			// Timeout after 10 seconds
			setTimeout(() => {
				clearInterval(checkInterval);
				reject(new Error("Connection timeout"));
			}, 10000);
		});
	}

	isConnecting = true;

	try {
		const token = await SecureStore.getItemAsync("accessToken");

		socket = io(WEBSOCKET_URL, {
			auth: { token },
			transports: ["websocket"],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
		});

		socket.on("connect", () => {
			console.log("[WebSocket] Connected to server");
			isConnecting = false;
		});

		socket.on("disconnect", (reason) => {
			console.log("[WebSocket] Disconnected:", reason);
		});

		socket.on("connect_error", (error) => {
			console.error("[WebSocket] Connection error:", error.message);
			isConnecting = false;
		});

		socket.on("error", (error) => {
			console.error("[WebSocket] Error:", error);
		});

		// Wait for connection to be established
		await new Promise<void>((resolve, reject) => {
			if (!socket) {
				reject(new Error("Socket initialization failed"));
				return;
			}

			socket.once("connect", () => resolve());
			socket.once("connect_error", (err) => reject(err));

			setTimeout(() => reject(new Error("Connection timeout")), 10000);
		});

		isConnecting = false;
		return socket;
	} catch (error) {
		isConnecting = false;
		console.error("[WebSocket] Failed to connect:", error);
		throw error;
	}
};

export const disconnectWebSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

export const getSocket = (): Socket => {
	if (!socket || !socket.connected) {
		throw new Error("WebSocket not connected. Call connectWebSocket() first.");
	}
	return socket;
};

export const isSocketConnected = (): boolean => {
	return socket?.connected || false;
};

// Typed event listeners
export const onRiderLocationUpdate = (callback: (data: RiderLocationUpdate) => void) => {
	const sock = getSocket();
	sock.on("rider:location-updated", callback);
	return () => sock.off("rider:location-updated", callback);
};

export const onDeliveryStatusChange = (callback: (data: DeliveryStatusUpdate) => void) => {
	const sock = getSocket();
	sock.on("delivery:status-changed", callback);
	return () => sock.off("delivery:status-changed", callback);
};

export const onPaymentConfirmation = (callback: (data: PaymentConfirmation) => void) => {
	const sock = getSocket();
	sock.on("payment:confirmed", callback);
	return () => sock.off("payment:confirmed", callback);
};

export const onPaymentFailed = (callback: (data: { orderId: string; reason: string }) => void) => {
	const sock = getSocket();
	sock.on("payment:failed", callback);
	return () => sock.off("payment:failed", callback);
};

export const onOrderUpdate = (callback: (data: any) => void) => {
	const sock = getSocket();
	sock.on("order:updated", callback);
	return () => sock.off("order:updated", callback);
};
