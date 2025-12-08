import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiClient } from "../store/utils/api-utils";
import { API_ENDPOINTS } from "../store/constants/api-endpoints";

// Configure notification handler
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export interface NotificationPermissionStatus {
	granted: boolean;
	canAskAgain?: boolean;
	status: string;
}

/**
 * Request notification permissions and get push token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
	try {
		// Check if running on physical device
		if (!Device.isDevice) {
			console.warn("Push notifications only work on physical devices");
			return null;
		}

		// Get existing permissions
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		// Request permissions if not granted
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		// Check if permissions were granted
		if (finalStatus !== "granted") {
			console.warn("Failed to get push token - permissions not granted");
			return null;
		}

		// Get the push token
		const tokenData = await Notifications.getExpoPushTokenAsync({
			projectId: "your-project-id", // TODO: Replace with actual Expo project ID
		});

		// Configure notification channel for Android
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C",
			});
		}

		return tokenData.data;
	} catch (error) {
		console.error("Error registering for push notifications:", error);
		return null;
	}
};

/**
 * Send push token to backend
 */
export const sendPushTokenToBackend = async (token: string, authToken: string): Promise<boolean> => {
	try {
		await apiClient.post(
			API_ENDPOINTS.UPDATE_PUSH_TOKEN,
			{ pushToken: token },
			{
				headers: { Authorization: `Bearer ${authToken}` },
			},
		);
		return true;
	} catch (error) {
		console.error("Error sending push token to backend:", error);
		return false;
	}
};

/**
 * Get current notification permissions status
 */
export const getNotificationPermissions = async (): Promise<NotificationPermissionStatus> => {
	const { status, canAskAgain } = await Notifications.getPermissionsAsync();

	return {
		granted: status === "granted",
		canAskAgain,
		status,
	};
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (
	handler: (notification: Notifications.Notification) => void,
) => {
	return Notifications.addNotificationReceivedListener(handler);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (
	handler: (response: Notifications.NotificationResponse) => void,
) => {
	return Notifications.addNotificationResponseReceivedListener(handler);
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
	title: string,
	body: string,
	data?: any,
	seconds?: number,
) => {
	try {
		const trigger = seconds ? { seconds } : null;

		await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data,
				sound: true,
			},
			trigger,
		});
	} catch (error) {
		console.error("Error scheduling notification:", error);
	}
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
	await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
	return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number) => {
	await Notifications.setBadgeCountAsync(count);
};

/**
 * Clear all notifications
 */
export const dismissAllNotifications = async () => {
	await Notifications.dismissAllNotificationsAsync();
};
