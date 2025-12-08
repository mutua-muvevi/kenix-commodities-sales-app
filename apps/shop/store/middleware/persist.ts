// store/middleware/persist.ts - Complete persistence middleware
import * as SecureStore from "expo-secure-store";

export const secureStorage = {
	getItem: async (name: string): Promise<string | null> => {
		try {
			const value = await SecureStore.getItemAsync(name);
			return value;
		} catch (error) {
			console.error("Error getting item from secure storage:", error);
			return null;
		}
	},
	setItem: async (name: string, value: string): Promise<void> => {
		try {
			await SecureStore.setItemAsync(name, value);
		} catch (error) {
			console.error("Error setting item in secure storage:", error);
		}
	},
	removeItem: async (name: string): Promise<void> => {
		try {
			await SecureStore.deleteItemAsync(name);
		} catch (error) {
			console.error("Error removing item from secure storage:", error);
		}
	},
};
