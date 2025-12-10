// app/(tabs)/profile.tsx - Updated profile screen without sign-in buttons
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
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

	const ProfileMenuItem = ({
		icon,
		title,
		subtitle,
		onPress,
		showArrow = true,
	}: {
		icon: string;
		title: string;
		subtitle?: string;
		onPress: () => void;
		showArrow?: boolean;
	}) => (
		<TouchableOpacity onPress={onPress} style={styles.menuItem}>
			<View style={styles.menuItemContent}>
				<Ionicons name={icon as any} size={24} color={theme.palette.primary.main} />
				<View style={styles.menuItemText}>
					<Text style={styles.menuItemTitle}>{title}</Text>
					{subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
				</View>
				{showArrow && <Ionicons name="chevron-forward" size={20} color={theme.palette.text.secondary} />}
			</View>
		</TouchableOpacity>
	);

	const styles = StyleSheet.create({
		header: {
			paddingVertical: theme.spacing.lg,
		},
		title: {
			...theme.typography.h2,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		userCard: {
			marginBottom: theme.spacing.lg,
			overflow: "hidden",
		},
		userInfo: {
			alignItems: "center",
			paddingTop: theme.spacing.xl,
			paddingBottom: theme.spacing.lg,
		},
		avatar: {
			width: 80,
			height: 80,
			borderRadius: 40,
			backgroundColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.md,
		},
		avatarText: {
			...theme.typography.h4,
			color: theme.palette.primary.contrastText,
			fontWeight: "700",
		},
		userName: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		userEmail: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		statsContainer: {
			flexDirection: "row",
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			paddingTop: theme.spacing.lg,
		},
		statItem: {
			flex: 1,
			alignItems: "center",
		},
		statValue: {
			...theme.typography.h6,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		statLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
		},
		menuSection: {
			marginBottom: theme.spacing.xl,
		},
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.md,
			paddingHorizontal: theme.spacing.md,
		},
		menuItem: {
			marginBottom: theme.spacing.sm,
		},
		menuItemContent: {
			flexDirection: "row",
			alignItems: "center",
		},
		menuItemText: {
			flex: 1,
			marginLeft: theme.spacing.md,
		},
		menuItemTitle: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "500",
		},
		menuItemSubtitle: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: 2,
		},
		logoutButton: {
			marginTop: theme.spacing.lg,
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

					{/* User Info Card */}
					<Animated.View entering={FadeInUp.springify()}>
						<Card style={styles.userCard}>
							<View style={styles.userInfo}>
								<View style={styles.avatar}>
									<Text style={styles.avatarText}>{getInitials(user.name)}</Text>
								</View>
								<Text style={styles.userName}>{user.name}</Text>
								<Text style={styles.userEmail}>{user.email}</Text>
							</View>

							<View style={styles.statsContainer}>
								<View style={styles.statItem}>
									<Text style={styles.statValue}>{totalItems}</Text>
									<Text style={styles.statLabel}>Cart Items</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statValue}>${totalPrice.toFixed(0)}</Text>
									<Text style={styles.statLabel}>Cart Value</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statValue}>{favoriteCount}</Text>
									<Text style={styles.statLabel}>Favorites</Text>
								</View>
							</View>
						</Card>
					</Animated.View>

					{/* Account Section */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Account</Text>

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
						</View>
					</Animated.View>

					{/* Shopping Section */}
					<Animated.View entering={FadeInUp.delay(200).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Shopping</Text>

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
							/>

							<ProfileMenuItem
								icon="notifications-outline"
								title="Notifications"
								subtitle="Manage your preferences"
								onPress={() => handleNavigate("/account/notifications")}
							/>
						</View>
					</Animated.View>

					{/* Financial Services Section */}
					<Animated.View entering={FadeInUp.delay(250).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Financial Services</Text>

							<ProfileMenuItem
								icon="cash-outline"
								title="Kenix Duka Loans"
								subtitle="Apply for business loans"
								onPress={() => router.push("/loans")}
							/>

							<ProfileMenuItem
								icon="phone-portrait-outline"
								title="Airtime Services"
								subtitle="Buy and sell airtime"
								onPress={() => router.push("/airtime")}
							/>
						</View>
					</Animated.View>

					{/* Settings Section */}
					<Animated.View entering={FadeInUp.delay(300).springify()}>
						<View style={styles.menuSection}>
							<Text style={styles.sectionTitle}>Settings</Text>

							<ProfileMenuItem
								icon="moon-outline"
								title="Theme"
								subtitle={`Current: ${getThemeDisplayName()}`}
								onPress={toggleTheme}
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
						</View>
					</Animated.View>

					{/* Logout Button */}
					<Animated.View entering={FadeInUp.delay(400).springify()}>
						<Button
							title="Sign Out"
							variant="outlined"
							fullWidth
							onPress={handleLogout}
							style={styles.logoutButton}
							icon={<Ionicons name="log-out-outline" size={20} color={theme.palette.primary.main} />}
						/>
					</Animated.View>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default ProfileScreen;
