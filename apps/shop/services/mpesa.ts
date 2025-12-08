import { apiClient, parseApiError } from "../store/utils/api-utils";
import { API_ENDPOINTS } from "../store/constants/api-endpoints";
import { getSocket, onPaymentConfirmation, onPaymentFailed } from "./websocket";

interface MpesaInitiateResponse {
	success: boolean;
	data?: {
		transactionId: string;
		checkoutRequestId: string;
		merchantRequestId: string;
		message: string;
	};
	error?: string;
	message?: string;
}

interface MpesaStatusResponse {
	success: boolean;
	data?: {
		transactionId: string;
		status: "pending" | "success" | "failed" | "cancelled";
		mpesaReceiptNumber?: string;
		amount: number;
		phoneNumber: string;
		resultDesc?: string;
	};
	error?: string;
	message?: string;
}

export interface MpesaPaymentResult {
	success: boolean;
	transactionId?: string;
	mpesaReceiptNumber?: string;
	error?: string;
}

/**
 * Initiates an M-Pesa STK push payment
 */
export const initiateMpesaPayment = async (
	orderId: string,
	phoneNumber: string,
	amount: number,
	token: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
	try {
		// Format phone number (ensure it starts with 254)
		const formattedPhone = formatPhoneNumber(phoneNumber);

		const response = await apiClient.post<MpesaInitiateResponse>(
			API_ENDPOINTS.MPESA_INITIATE,
			{
				orderId,
				phoneNumber: formattedPhone,
				amount,
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!response.data.success) {
			return {
				success: false,
				error: response.data.error || response.data.message || "Payment initiation failed",
			};
		}

		return {
			success: true,
			transactionId: response.data.data?.transactionId,
		};
	} catch (error: any) {
		return {
			success: false,
			error: parseApiError(error).message,
		};
	}
};

/**
 * Checks the status of an M-Pesa payment
 */
export const checkMpesaPaymentStatus = async (
	transactionId: string,
	token: string,
): Promise<MpesaStatusResponse["data"]> => {
	try {
		const response = await apiClient.get<MpesaStatusResponse>(
			API_ENDPOINTS.MPESA_STATUS(transactionId),
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (!response.data.success) {
			throw new Error(response.data.error || "Failed to check payment status");
		}

		return response.data.data!;
	} catch (error: any) {
		throw parseApiError(error);
	}
};

/**
 * Listens for M-Pesa payment confirmation via WebSocket
 * @param orderId - The order ID to listen for
 * @param onSuccess - Callback when payment is successful
 * @param onFailure - Callback when payment fails
 * @param timeoutMs - Timeout in milliseconds (default 120000 = 2 minutes)
 * @returns Cleanup function to remove listeners
 */
export const listenForPaymentConfirmation = (
	orderId: string,
	onSuccess: (data: {
		transactionId: string;
		mpesaReceiptNumber?: string;
		amount: number;
	}) => void,
	onFailure: (error: string) => void,
	timeoutMs: number = 120000,
): (() => void) => {
	try {
		const socket = getSocket();

		// Payment confirmed handler
		const handlePaymentConfirmed = (data: any) => {
			if (data.orderId === orderId && data.status === "success") {
				onSuccess({
					transactionId: data.transactionId,
					mpesaReceiptNumber: data.mpesaReceiptNumber,
					amount: data.amount,
				});
			}
		};

		// Payment failed handler
		const handlePaymentFailed = (data: any) => {
			if (data.orderId === orderId) {
				onFailure(data.reason || "Payment failed");
			}
		};

		// Register listeners
		const unsubConfirmed = onPaymentConfirmation(handlePaymentConfirmed);
		const unsubFailed = onPaymentFailed(handlePaymentFailed);

		// Timeout handler
		const timeoutId = setTimeout(() => {
			cleanup();
			onFailure("Payment timeout - please try again");
		}, timeoutMs);

		// Cleanup function
		const cleanup = () => {
			clearTimeout(timeoutId);
			unsubConfirmed();
			unsubFailed();
		};

		return cleanup;
	} catch (error: any) {
		onFailure(error.message || "Failed to listen for payment confirmation");
		return () => {};
	}
};

/**
 * Poll for payment status (alternative to WebSocket)
 * @param transactionId - The transaction ID to poll
 * @param token - Authorization token
 * @param onSuccess - Callback when payment is successful
 * @param onFailure - Callback when payment fails
 * @param intervalMs - Polling interval in milliseconds (default 3000 = 3 seconds)
 * @param timeoutMs - Total timeout in milliseconds (default 120000 = 2 minutes)
 * @returns Cleanup function to stop polling
 */
export const pollPaymentStatus = (
	transactionId: string,
	token: string,
	onSuccess: (data: { mpesaReceiptNumber?: string; amount: number }) => void,
	onFailure: (error: string) => void,
	intervalMs: number = 3000,
	timeoutMs: number = 120000,
): (() => void) => {
	const startTime = Date.now();
	let isActive = true;

	const poll = async () => {
		if (!isActive) return;

		try {
			const status = await checkMpesaPaymentStatus(transactionId, token);

			if (status.status === "success") {
				isActive = false;
				onSuccess({
					mpesaReceiptNumber: status.mpesaReceiptNumber,
					amount: status.amount,
				});
			} else if (status.status === "failed" || status.status === "cancelled") {
				isActive = false;
				onFailure(status.resultDesc || "Payment failed");
			} else if (Date.now() - startTime > timeoutMs) {
				isActive = false;
				onFailure("Payment timeout - please try again");
			} else {
				// Continue polling
				setTimeout(poll, intervalMs);
			}
		} catch (error: any) {
			if (Date.now() - startTime > timeoutMs) {
				isActive = false;
				onFailure("Payment timeout - please try again");
			} else {
				// Retry on error
				setTimeout(poll, intervalMs);
			}
		}
	};

	// Start polling
	poll();

	// Return cleanup function
	return () => {
		isActive = false;
	};
};

/**
 * Format phone number to Kenya format (254...)
 */
export const formatPhoneNumber = (phone: string): string => {
	// Remove all non-digit characters
	let cleaned = phone.replace(/\D/g, "");

	// Handle different formats
	if (cleaned.startsWith("254")) {
		return cleaned;
	} else if (cleaned.startsWith("0")) {
		return "254" + cleaned.substring(1);
	} else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
		return "254" + cleaned;
	}

	return cleaned;
};

/**
 * Validate Kenya phone number
 */
export const validatePhoneNumber = (phone: string): boolean => {
	const formatted = formatPhoneNumber(phone);
	// Kenya phone numbers: 254 7XX XXX XXX or 254 1XX XXX XXX
	const regex = /^254[71]\d{8}$/;
	return regex.test(formatted);
};
