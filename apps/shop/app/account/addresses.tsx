// app/account/addresses.tsx - Addresses Management Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import Toast from "react-native-toast-message";

interface Address {
	id: string;
	name: string;
	phone: string;
	address: string;
	city: string;
	isDefault: boolean;
}

const AddressesScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();

	// Mock addresses data
	const [addresses, setAddresses] = useState<Address[]>([
		{
			id: "1",
			name: "John Doe",
			phone: "+254 712 345 678",
			address: "123 Main Street, Downtown",
			city: "Nairobi",
			isDefault: true,
		},
		{
			id: "2",
			name: "John Doe",
			phone: "+254 712 345 678",
			address: "456 Market Road, Westlands",
			city: "Nairobi",
			isDefault: false,
		},
		{
			id: "3",
			name: "John Doe Shop",
			phone: "+254 712 345 678",
			address: "789 Business Plaza, Kilimani",
			city: "Nairobi",
			isDefault: false,
		},
	]);

	const [showAddForm, setShowAddForm] = useState(false);

	const handleSetDefault = (addressId: string) => {
		setAddresses((prev) =>
			prev.map((addr) => ({
				...addr,
				isDefault: addr.id === addressId,
			})),
		);
		Toast.show({
			type: "success",
			text1: "Default Address Updated",
			text2: "This address is now your default delivery address",
			position: "bottom",
		});
	};

	const handleDeleteAddress = (addressId: string) => {
		const addressToDelete = addresses.find((addr) => addr.id === addressId);
		if (addressToDelete?.isDefault) {
			Toast.show({
				type: "error",
				text1: "Cannot Delete",
				text2: "You cannot delete your default address",
				position: "bottom",
			});
			return;
		}

		setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
		Toast.show({
			type: "success",
			text1: "Address Deleted",
			text2: "The address has been removed from your account",
			position: "bottom",
		});
	};

	const handleAddAddress = () => {
		Toast.show({
			type: "info",
			text1: "Add New Address",
			text2: "Address form will be implemented soon",
			position: "bottom",
		});
		setShowAddForm(true);
	};

	const renderAddressCard = ({ item, index }: { item: Address; index: number }) => {
		const styles = createStyles(theme);

		return (
			<Animated.View entering={FadeInUp.delay(index * 100).springify()}>
				<Card style={styles.addressCard}>
					{/* Default Badge */}
					{item.isDefault && (
						<View style={styles.defaultBadge}>
							<Text style={styles.defaultBadgeText}>Default</Text>
						</View>
					)}

					{/* Address Info */}
					<View style={styles.addressInfo}>
						<View style={styles.addressHeader}>
							<Ionicons name="location" size={20} color={theme.palette.primary.main} />
							<Text style={styles.addressName}>{item.name}</Text>
						</View>

						<View style={styles.addressDetail}>
							<Ionicons name="call" size={16} color={theme.palette.text.secondary} />
							<Text style={styles.addressDetailText}>{item.phone}</Text>
						</View>

						<View style={styles.addressDetail}>
							<Ionicons name="home" size={16} color={theme.palette.text.secondary} />
							<Text style={styles.addressDetailText}>{item.address}</Text>
						</View>

						<View style={styles.addressDetail}>
							<Ionicons name="location-outline" size={16} color={theme.palette.text.secondary} />
							<Text style={styles.addressDetailText}>{item.city}</Text>
						</View>
					</View>

					{/* Actions */}
					<View style={styles.addressActions}>
						{!item.isDefault && (
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => handleSetDefault(item.id)}
								activeOpacity={0.7}
							>
								<Ionicons name="checkmark-circle-outline" size={20} color={theme.palette.primary.main} />
								<Text style={styles.actionButtonText}>Set as Default</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity
							style={styles.actionButton}
							onPress={() =>
								Toast.show({
									type: "info",
									text1: "Edit Address",
									text2: "Edit functionality coming soon",
									position: "bottom",
								})
							}
							activeOpacity={0.7}
						>
							<Ionicons name="create-outline" size={20} color={theme.palette.text.secondary} />
							<Text style={[styles.actionButtonText, { color: theme.palette.text.secondary }]}>Edit</Text>
						</TouchableOpacity>

						{!item.isDefault && (
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => handleDeleteAddress(item.id)}
								activeOpacity={0.7}
							>
								<Ionicons name="trash-outline" size={20} color={theme.palette.error.main} />
								<Text style={[styles.actionButtonText, { color: theme.palette.error.main }]}>Delete</Text>
							</TouchableOpacity>
						)}
					</View>
				</Card>
			</Animated.View>
		);
	};

	const styles = createStyles(theme);

	return (
		<SafeArea>
			<View style={{ flex: 1, backgroundColor: theme.palette.background.default }}>
				{/* Header */}
				<Animated.View entering={FadeInUp.springify()}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Delivery Addresses</Text>
					</View>
				</Animated.View>

				<Container>
					<ScrollView showsVerticalScrollIndicator={false}>
						{/* Info Card */}
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Card style={styles.infoCard}>
								<View style={styles.infoHeader}>
									<Ionicons name="information-circle" size={24} color={theme.palette.info.main} />
									<Text style={styles.infoTitle}>Manage Your Addresses</Text>
								</View>
								<Text style={styles.infoText}>
									Add and manage your delivery addresses. You can set a default address for faster checkout.
								</Text>
							</Card>
						</Animated.View>

						{/* Add New Address Button */}
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Button
								title="Add New Address"
								variant="outlined"
								fullWidth
								onPress={handleAddAddress}
								icon={<Ionicons name="add-circle-outline" size={20} color={theme.palette.primary.main} />}
								style={styles.addButton}
							/>
						</Animated.View>

						{/* Addresses List */}
						<View style={styles.addressesList}>
							{addresses.map((address, index) => (
								<View key={address.id}>{renderAddressCard({ item: address, index })}</View>
							))}
						</View>

						{/* Empty State */}
						{addresses.length === 0 && (
							<Animated.View entering={FadeInUp.delay(300).springify()} style={styles.emptyState}>
								<Text style={styles.emptyIcon}>📍</Text>
								<Text style={styles.emptyTitle}>No Addresses Yet</Text>
								<Text style={styles.emptyDescription}>
									Add your first delivery address to get started with orders
								</Text>
							</Animated.View>
						)}
					</ScrollView>
				</Container>
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
		infoCard: {
			backgroundColor: theme.palette.info.light,
			marginVertical: theme.spacing.lg,
		},
		infoHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		infoTitle: {
			...theme.typography.subtitle1,
			color: theme.palette.info.dark,
			fontWeight: "600",
			marginLeft: theme.spacing.sm,
		},
		infoText: {
			...theme.typography.body2,
			color: theme.palette.info.dark,
			lineHeight: 20,
		},
		addButton: {
			marginBottom: theme.spacing.lg,
		},
		addressesList: {
			marginBottom: theme.spacing.xxl,
		},
		addressCard: {
			marginBottom: theme.spacing.md,
			position: "relative",
		},
		defaultBadge: {
			position: "absolute",
			top: theme.spacing.md,
			right: theme.spacing.md,
			backgroundColor: theme.palette.success.main,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.borderRadius.full,
		},
		defaultBadgeText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		addressInfo: {
			marginBottom: theme.spacing.md,
		},
		addressHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		addressName: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginLeft: theme.spacing.sm,
		},
		addressDetail: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
			paddingLeft: theme.spacing.xs,
		},
		addressDetailText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginLeft: theme.spacing.sm,
			flex: 1,
		},
		addressActions: {
			flexDirection: "row",
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			paddingTop: theme.spacing.md,
			justifyContent: "flex-start",
			flexWrap: "wrap",
		},
		actionButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			marginRight: theme.spacing.md,
		},
		actionButtonText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "500",
			marginLeft: theme.spacing.xs,
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		emptyIcon: {
			fontSize: 64,
			marginBottom: theme.spacing.lg,
		},
		emptyTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
		},
		emptyDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
			paddingHorizontal: theme.spacing.lg,
		},
	});

export default AddressesScreen;
