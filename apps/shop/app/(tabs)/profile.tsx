// app/(tabs)/profile.tsx - Polished profile screen competing with Twiga Foods & Wasoko
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
	FadeInUp,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	interpolate
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useAuth, useCart, useFavorites, useThemeStore } from "../../store";

const ProfileScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { user, authenticated, logout } = useAuth();
	const { totalItems, totalPrice } = useCart();
	const { favoriteCount } = useFavorites();
	const { themeMode, toggleTheme } = useThemeStore();

	const handleLogout = () => {
		logout();
	};

	const getThemeDisplayName = () => {
		switch (themeMode) {
			case "light":
				return "Light";
			case "dark":
				return "Dark";
			case "auto":
				return "Auto";
			default:
				return "Auto";
		}
	};

	const handleNavigate = (path: string) => {
		router.push(path as any);
	};

	// Animated menu item component with press feedback
	const ProfileMenuItem = ({
		icon,
		title,
		subtitle,
		onPress,
		showArrow = true,
		iconBgColor,
	}: {
		icon: string;
		title: string;
		subtitle?: string;
		onPress: () => void;
		showArrow?: boolean;
		iconBgColor?: string;
	}) => {
		const scale = useSharedValue(1);
		const backgroundColor = useSharedValue(0);

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
			backgroundColor: interpolate(
				backgroundColor.value,
				[0, 1],
				[
					theme.palette.mode === "dark" ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)",
					theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"
				]
			) as any,
		}));

		const handlePressIn = () => {
			scale.value = withSpring(0.98);
			backgroundColor.value = withTiming(1, { duration: 150 });
		};

		const handlePressOut = () => {
			scale.value = withSpring(1);
			backgroundColor.value = withTiming(0, { duration: 200 });
		};

		const handlePress = () => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			onPress();
		};

		return (
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				accessibilityRole="button"
				accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}`}
				accessibilityHint={`Double tap to ${title.toLowerCase()}`}
			>
				<Animated.View style={[styles.menuItem, animatedStyle]}>
					<View style={styles.menuItemContent}>
						<View style={[
							styles.menuIconContainer,
							{ backgroundColor: iconBgColor || `${theme.palette.primary.main}15` }
						]}>
							<Ionicons name={icon as any} size={22} color={iconBgColor ? theme.palette.common.white : theme.palette.primary.main} />
						</View>
						<View style={styles.menuItemText}>
							<Text style={styles.menuItemTitle}>{title}</Text>
							{subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
						</View>
						{showArrow && (
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.palette.text.disabled}
							/>
						)}
					</View>
				</Animated.View>
			</Pressable>
		);
	};

	const { width } = useWindowDimensions();
	const isTablet = width >= 768;

	const styles = StyleSheet.create({
		header: {
			paddingVertical: theme.spacing.lg,
			paddingHorizontal: theme.spacing.md,
		},
		title: {
			...theme.typography.h2,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		userCard: {
			marginBottom: theme.spacing.lg,
			overflow: "visible",
			padding: 0,
		},
		userInfo: {
			alignItems: "center",
			paddingTop: theme.spacing.xxl,
			paddingBottom: theme.spacing.lg,
			paddingHorizontal: theme.spacing.lg,
		},
		avatarContainer: {
			marginBottom: theme.spacing.md,
		},
		avatarGradientBorder: {
			width: 108,
			height: 108,
			borderRadius: 54,
			padding: 4,
			alignItems: "center",
			justifyContent: "center",
		},
		avatar: {
			width: 100,
			height: 100,
			borderRadius: 50,
			backgroundColor: theme.palette.background.paper,
			alignItems: "center",
			justifyContent: "center",
		},
		avatarInner: {
			width: 92,
			height: 92,
			borderRadius: 46,
			alignItems: "center",
			justifyContent: "center",
		},
		avatarText: {
			...theme.typography.h3,
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		userName: {
			...theme.typography.h4,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
			textAlign: "center",
		},
		userEmail: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
		statsContainer: {
			flexDirection: "row",
			marginTop: theme.spacing.lg,
			paddingTop: theme.spacing.lg,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			gap: theme.spacing.xs,
		},
		statItem: {
			flex: 1,
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			borderRadius: theme.borderRadius.md,
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
		},
		statIconContainer: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xs,
		},
		statValue: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginTop: theme.spacing.xs,
		},
		statLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: 4,
			fontSize: 11,
		},
		menuSection: {
			marginBottom: theme.spacing.lg,
		},
		sectionTitle: {
			...theme.typography.subtitle2,
			color: theme.palette.text.secondary,
			fontWeight: "600",
			marginBottom: theme.spacing.md,
			paddingHorizontal: theme.spacing.md,
			textTransform: "uppercase",
			letterSpacing: 0.5,
			fontSize: 12,
		},
		menuCard: {
			padding: theme.spacing.xs,
			marginBottom: theme.spacing.md,
		},
		menuItem: {
			borderRadius: theme.borderRadius.md,
			marginBottom: theme.spacing.xs,
			overflow: "hidden",
		},
		menuItemContent: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.md,
		},
		menuIconContainer: {
			width: 44,
			height: 44,
			borderRadius: theme.borderRadius.md,
			alignItems: "center",
			justifyContent: "center",
		},
		menuItemText: {
			flex: 1,
			marginLeft: theme.spacing.md,
		},
		menuItemTitle: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: 2,
		},
		menuItemSubtitle: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			fontSize: 12,
		},
		sectionDivider: {
			height: 8,
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
			marginVertical: theme.spacing.md,
		},
		logoutButton: {
			marginTop: theme.spacing.md,
			marginBottom: theme.spacing.xxl,
		},
		logoutGradient: {
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.lg,
			borderRadius: theme.borderRadius.lg,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			minHeight: 52,
		},
		logoutText: {
			...theme.typography.button,
			color: theme.palette.common.white,
			fontWeight: "700",
			marginLeft: theme.spacing.sm,
		},
		guestState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		guestIcon: {
			fontSize: 64,
			marginBottom: theme.spacing.lg,
		},
		guestTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
		},
		guestDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
			paddingHorizontal: theme.spacing.lg,
			marginBottom: theme.spacing.xl,
		},
	});

	// For unauthenticated users, show a simple message without sign-in buttons
	// since we assume users should already be logged in to use the app
	if (!authenticated || !user) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<Text style={styles.title}>Profile</Text>
					</View>
					<Animated.View entering={FadeInUp.springify()} style={styles.guestState}>
						<Text style={styles.guestIcon}>👤</Text>
						<Text style={styles.guestTitle}>Profile Unavailable</Text>
						<Text style={styles.guestDescription}>
							Your profile information will be available once you're properly authenticated with the app.
						</Text>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<SafeArea>
			<Container>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.header}>
						<Text style={styles.title}>Profile</Text>
					</View>

					{/* User Info Card with Gradient Avatar */}
					<Animated.View entering={FadeInUp.springify()}>
						<Card style={styles.userCard}>
							<View style={styles.userInfo}>
								<View style={styles.avatarContainer}>
									<LinearGradient
										colors={[theme.palette.primary.main, theme.palette.primary.dark, theme.palette.secondary.main]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={styles.avatarGradientBorder}
									>
										<View style={styles.avatar}>
											<LinearGradient
												colors={[theme.palette.primary.light, theme.palette.primary.main]}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												style={styles.avatarInner}
											>
												<Text style={styles.avatarText}>{getInitials(user.name)}</Text>
											</LinearGradient>
										</View>
									</LinearGradient>
								</View>
								<Text style={styles.userName}>{user.name}</Text>
								<Text style={styles.userEmail}>{user.email}</Text>

								{/* Enhanced Stats with Icons */}
								<View style={styles.statsContainer}>
									<View style={styles.statItem}>
										<View style={[styles.statIconContainer, { backgroundColor: `${theme.palette.info.main}20` }]}>
											<Ionicons name="cart" size={20} color={theme.palette.info.main} />
										</View>
										<Text style={styles.statValue}>{totalItems}</Text>
										<Text style={styles.statLabel}>Cart Items</Text>
									</View>
									<View style={styles.statItem}>
										<View style={[styles.statIconContainer, { backgroundColor: `${theme.palette.success.main}20` }]}>
											<Ionicons name="cash" size={20} color={theme.palette.success.main} />
										</View>
										<Text style={styles.statValue}>${totalPrice.toFixed(0)}</Text>
										<Text style={styles.statLabel}>Cart Value</Text>
									</View>
									<View style={styles.statItem}>
										<View style={[styles.statIconContainer, { backgroundColor: `${theme.palette.error.main}20` }]}>
											<Ionicons name="heart" size={20} color={theme.palette.error.main} />
										</View>
										<Text style={styles.statValue}>{favoriteCount}</Text>
										<Text style={styles.statLabel}>Favorites</Text>
									</View>
								</View>
							</View>
						</Card>
					</Animated.View>

					{/* Account Section */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Account</Text>
							<Card style={styles.menuCard}>
								<ProfileMenuItem
									icon="person-outline"
									title="Edit Profile"
									subtitle="Update your personal information"
									onPress={() => handleNavigate("/account/edit-profile")}
								/>

								<ProfileMenuItem
									icon="location-outline"
									title="Addresses"
									subtitle="Manage delivery addresses"
									onPress={() => handleNavigate("/account/addresses")}
								/>

								<ProfileMenuItem
									icon="card-outline"
									title="Payment Methods"
									subtitle="Manage payment options"
									onPress={() => console.log("Payment Methods")}
								/>
							</Card>
						</View>
					</Animated.View>

					{/* Shopping Section */}
					<Animated.View entering={FadeInUp.delay(200).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Shopping</Text>
							<Card style={styles.menuCard}>
								<ProfileMenuItem
									icon="receipt-outline"
									title="Order History"
									subtitle="View your past orders"
									onPress={() => router.push("/orders")}
								/>

								<ProfileMenuItem
									icon="heart-outline"
									title="Favorites"
									subtitle={`${favoriteCount} saved items`}
									onPress={() => handleNavigate("/account/favorites")}
									iconBgColor={theme.palette.error.main}
								/>

								<ProfileMenuItem
									icon="notifications-outline"
									title="Notifications"
									subtitle="Manage your preferences"
									onPress={() => handleNavigate("/account/notifications")}
								/>
							</Card>
						</View>
					</Animated.View>

					{/* Subtle Divider */}
					<View style={styles.sectionDivider} />

					{/* Financial Services Section */}
					<Animated.View entering={FadeInUp.delay(250).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Financial Services</Text>
							<Card style={styles.menuCard}>
								<ProfileMenuItem
									icon="cash-outline"
									title="Kenix Duka Loans"
									subtitle="Apply for business loans"
									onPress={() => router.push("/loans")}
									iconBgColor={theme.palette.success.main}
								/>

								<ProfileMenuItem
									icon="phone-portrait-outline"
									title="Airtime Services"
									subtitle="Buy and sell airtime"
									onPress={() => router.push("/airtime")}
									iconBgColor={theme.palette.info.main}
								/>
							</Card>
						</View>
					</Animated.View>

					{/* Subtle Divider */}
					<View style={styles.sectionDivider} />

					{/* Settings Section */}
					<Animated.View entering={FadeInUp.delay(300).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Settings & Support</Text>
							<Card style={styles.menuCard}>
								<ProfileMenuItem
									icon={themeMode === "dark" ? "moon" : "sunny"}
									title="Theme"
									subtitle={`Current: ${getThemeDisplayName()}`}
									onPress={toggleTheme}
									iconBgColor={theme.palette.warning.main}
								/>

								<ProfileMenuItem
									icon="language-outline"
									title="Language"
									subtitle="English"
									onPress={() => console.log("Language")}
								/>

								<ProfileMenuItem
									icon="help-circle-outline"
									title="Help & Support"
									subtitle="Get help with your account"
									onPress={() => console.log("Help")}
								/>

								<ProfileMenuItem
									icon="information-circle-outline"
									title="About"
									subtitle="App version and info"
									onPress={() => console.log("About")}
								/>
							</Card>
						</View>
					</Animated.View>

					{/* Logout Button with Gradient */}
					<Animated.View entering={FadeInUp.delay(400).springify()}>
						<Pressable
							onPress={() => {
								Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
								handleLogout();
							}}
							style={styles.logoutButton}
							accessibilityRole="button"
							accessibilityLabel="Sign out"
							accessibilityHint="Double tap to sign out of your account"
						>
							<LinearGradient
								colors={[theme.palette.error.main, theme.palette.error.dark]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.logoutGradient}
							>
								<Ionicons name="log-out-outline" size={22} color={theme.palette.common.white} />
								<Text style={styles.logoutText}>Sign Out</Text>
							</LinearGradient>
						</Pressable>
					</Animated.View>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default ProfileScreen;
