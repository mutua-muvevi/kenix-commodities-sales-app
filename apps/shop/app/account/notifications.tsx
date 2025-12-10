// app/account/notifications.tsx - Notification Settings Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import Toast from "react-native-toast-message";

interface NotificationSetting {
	id: string;
	title: string;
	description: string;
	icon: string;
	enabled: boolean;
}

const NotificationsScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();

	const [settings, setSettings] = useState<NotificationSetting[]>([
		{
			id: "order_updates",
			title: "Order Updates",
			description: "Get notified about your order status, delivery updates, and confirmations",
			icon: "notifications",
			enabled: true,
		},
		{
			id: "promotions",
			title: "Promotions & Offers",
			description: "Receive notifications about special deals, discounts, and exclusive offers",
			icon: "pricetag",
			enabled: true,
		},
		{
			id: "new_products",
			title: "New Products",
			description: "Be the first to know when new products are added to our catalog",
			icon: "sparkles",
			enabled: false,
		},
		{
			id: "price_drops",
			title: "Price Drops",
			description: "Get alerts when prices drop on products you've viewed or favorited",
			icon: "trending-down",
			enabled: true,
		},
		{
			id: "stock_alerts",
			title: "Stock Alerts",
			description: "Know when out-of-stock items you want are back in inventory",
			icon: "cube",
			enabled: false,
		},
		{
			id: "payment_reminders",
			title: "Payment Reminders",
			description: "Reminders for pending payments and invoice due dates",
			icon: "card",
			enabled: true,
		},
		{
			id: "marketing",
			title: "Marketing Communications",
			description: "Newsletters, product recommendations, and marketing emails",
			icon: "mail",
			enabled: false,
		},
		{
			id: "app_updates",
			title: "App Updates",
			description: "Information about new features, improvements, and app updates",
			icon: "rocket",
			enabled: true,
		},
	]);

	const [hasChanges, setHasChanges] = useState(false);

	const handleToggle = (id: string) => {
		setSettings((prev) =>
			prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
		);
		setHasChanges(true);
	};

	const handleSavePreferences = () => {
		// TODO: Save to backend
		Toast.show({
			type: "success",
			text1: "Preferences Saved",
			text2: "Your notification preferences have been updated successfully",
			position: "bottom",
		});
		setHasChanges(false);
	};

	const handleEnableAll = () => {
		setSettings((prev) => prev.map((setting) => ({ ...setting, enabled: true })));
		setHasChanges(true);
		Toast.show({
			type: "info",
			text1: "All Enabled",
			text2: "All notification types have been enabled",
			position: "bottom",
		});
	};

	const handleDisableAll = () => {
		setSettings((prev) => prev.map((setting) => ({ ...setting, enabled: false })));
		setHasChanges(true);
		Toast.show({
			type: "info",
			text1: "All Disabled",
			text2: "All notification types have been disabled",
			position: "bottom",
		});
	};

	const NotificationSettingCard = ({ item, index }: { item: NotificationSetting; index: number }) => {
		const styles = createStyles(theme);

		return (
			<Animated.View entering={FadeInUp.delay(index * 50).springify()}>
				<Card style={styles.settingCard}>
					<View style={styles.settingContent}>
						<View style={styles.iconContainer}>
							<Ionicons name={item.icon as any} size={24} color={theme.palette.primary.main} />
						</View>

						<View style={styles.settingInfo}>
							<Text style={styles.settingTitle}>{item.title}</Text>
							<Text style={styles.settingDescription}>{item.description}</Text>
						</View>

						<Switch
							value={item.enabled}
							onValueChange={() => handleToggle(item.id)}
							trackColor={{
								false: theme.palette.background.surface,
								true: theme.palette.primary.light,
							}}
							thumbColor={item.enabled ? theme.palette.primary.main : theme.palette.text.disabled}
							ios_backgroundColor={theme.palette.background.surface}
						/>
					</View>
				</Card>
			</Animated.View>
		);
	};

	const styles = createStyles(theme);

	const enabledCount = settings.filter((s) => s.enabled).length;
	const totalCount = settings.length;

	return (
		<SafeArea>
			<View style={{ flex: 1, backgroundColor: theme.palette.background.default }}>
				{/* Header */}
				<Animated.View entering={FadeInUp.springify()}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Notifications</Text>
					</View>
				</Animated.View>

				<ScrollView showsVerticalScrollIndicator={false}>
					<Container>
						{/* Summary Card */}
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Card style={styles.summaryCard}>
								<View style={styles.summaryContent}>
									<View>
										<Text style={styles.summaryTitle}>Notification Preferences</Text>
										<Text style={styles.summaryDescription}>
											{enabledCount} of {totalCount} notification types enabled
										</Text>
									</View>
									<View style={styles.summaryIcon}>
										<Ionicons name="notifications" size={32} color={theme.palette.primary.main} />
									</View>
								</View>

								<View style={styles.quickActions}>
									<TouchableOpacity style={styles.quickActionButton} onPress={handleEnableAll}>
										<Text style={styles.quickActionText}>Enable All</Text>
									</TouchableOpacity>
									<View style={styles.quickActionDivider} />
									<TouchableOpacity style={styles.quickActionButton} onPress={handleDisableAll}>
										<Text style={styles.quickActionText}>Disable All</Text>
									</TouchableOpacity>
								</View>
							</Card>
						</Animated.View>

						{/* Info Card */}
						<Animated.View entering={FadeInUp.delay(150).springify()}>
							<Card style={styles.infoCard}>
								<Text style={styles.infoText}>
									Control which notifications you receive. You can always change these settings later.
								</Text>
							</Card>
						</Animated.View>

						{/* Settings List */}
						<View style={styles.settingsList}>
							{settings.map((setting, index) => (
								<NotificationSettingCard key={setting.id} item={setting} index={index + 2} />
							))}
						</View>

						{/* Save Button */}
						{hasChanges && (
							<Animated.View entering={FadeInUp.springify()}>
								<Button
									title="Save Preferences"
									variant="gradient"
									fullWidth
									onPress={handleSavePreferences}
									style={styles.saveButton}
									icon={<Ionicons name="checkmark-circle" size={20} color={theme.palette.common.white} />}
								/>
							</Animated.View>
						)}

						{/* Additional Info */}
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.additionalInfoCard}>
								<View style={styles.additionalInfoHeader}>
									<Ionicons name="information-circle" size={20} color={theme.palette.info.main} />
									<Text style={styles.additionalInfoTitle}>About Notifications</Text>
								</View>
								<Text style={styles.additionalInfoText}>
									• Push notifications require permission from your device settings{"\n"}• Some critical
									notifications (like security alerts) cannot be disabled{"\n"}• You can manage email
									notification frequency in your email preferences
								</Text>
							</Card>
						</Animated.View>
					</Container>
				</ScrollView>
			</View>
		</SafeArea>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		backButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.background.surface,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.md,
		},
		headerTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			flex: 1,
		},
		summaryCard: {
			marginVertical: theme.spacing.lg,
		},
		summaryContent: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		summaryTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		summaryDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		summaryIcon: {
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: theme.palette.primary.light,
			alignItems: "center",
			justifyContent: "center",
		},
		quickActions: {
			flexDirection: "row",
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			paddingTop: theme.spacing.md,
			marginTop: theme.spacing.md,
		},
		quickActionButton: {
			flex: 1,
			alignItems: "center",
			paddingVertical: theme.spacing.sm,
		},
		quickActionDivider: {
			width: 1,
			backgroundColor: theme.palette.divider,
		},
		quickActionText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		infoCard: {
			backgroundColor: theme.palette.info.light,
			marginBottom: theme.spacing.lg,
		},
		infoText: {
			...theme.typography.body2,
			color: theme.palette.info.dark,
			lineHeight: 20,
		},
		settingsList: {
			marginBottom: theme.spacing.lg,
		},
		settingCard: {
			marginBottom: theme.spacing.md,
		},
		settingContent: {
			flexDirection: "row",
			alignItems: "center",
		},
		iconContainer: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.primary.light,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.md,
		},
		settingInfo: {
			flex: 1,
			marginRight: theme.spacing.md,
		},
		settingTitle: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		settingDescription: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			lineHeight: 16,
		},
		saveButton: {
			marginBottom: theme.spacing.lg,
		},
		additionalInfoCard: {
			backgroundColor: theme.palette.background.surface,
			marginBottom: theme.spacing.xxl,
		},
		additionalInfoHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		additionalInfoTitle: {
			...theme.typography.subtitle2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginLeft: theme.spacing.sm,
		},
		additionalInfoText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			lineHeight: 20,
		},
	});

export default NotificationsScreen;
