import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { orderApi } from "../../store/api/order-api";
import { Order } from "../../store/types/order";
import Toast from "react-native-toast-message";

const OrdersScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { accessToken } = useAuth();

	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

	const fetchOrders = useCallback(async (showLoader = true) => {
		if (!accessToken) {
			Toast.show({
				type: "error",
				text1: "Authentication Required",
				text2: "Please log in to view your orders",
			});
			return;
		}

		try {
			if (showLoader) setIsLoading(true);

			const { orders: fetchedOrders } = await orderApi.getMyOrders(accessToken);
			setOrders(fetchedOrders);
		} catch (error: any) {
			console.error("Failed to fetch orders:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to load orders",
			});
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, [accessToken]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		fetchOrders(false);
	};

	const handleViewOrder = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return theme.palette.warning.main;
			case "approved":
				return theme.palette.info.main;
			case "in transit":
			case "intransit":
				return theme.palette.primary.main;
			case "delivered":
				return theme.palette.success.main;
			case "cancelled":
				return theme.palette.error.main;
			default:
				return theme.palette.text.secondary;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "time-outline";
			case "approved":
				return "checkmark-circle-outline";
			case "in transit":
			case "intransit":
				return "car-outline";
			case "delivered":
				return "checkmark-done-circle";
			case "cancelled":
				return "close-circle-outline";
			default:
				return "help-circle-outline";
		}
	};

	const filteredOrders = selectedStatus
		? orders.filter((order) => order.status.toLowerCase() === selectedStatus.toLowerCase())
		: orders;

	const styles = StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.lg,
		},
		title: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		backButton: {
			marginRight: theme.spacing.md,
		},
		filterContainer: {
			flexDirection: "row",
			marginBottom: theme.spacing.md,
			gap: theme.spacing.sm,
		},
		filterChip: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.radius.full,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			backgroundColor: theme.palette.background.surface,
		},
		filterChipActive: {
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
		},
		filterChipText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		filterChipTextActive: {
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		orderCard: {
			marginBottom: theme.spacing.md,
		},
		orderHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
			marginBottom: theme.spacing.sm,
		},
		orderIdContainer: {
			flex: 1,
		},
		orderIdLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginBottom: 2,
		},
		orderId: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		statusBadge: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.radius.sm,
			gap: 4,
		},
		statusText: {
			...theme.typography.caption,
			fontWeight: "600",
			textTransform: "uppercase",
		},
		orderDetails: {
			marginTop: theme.spacing.sm,
			paddingTop: theme.spacing.sm,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		detailRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginBottom: theme.spacing.xs,
		},
		detailLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		detailValue: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		totalAmount: {
			...theme.typography.h6,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		viewButton: {
			marginTop: theme.spacing.md,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.md,
			backgroundColor: `${theme.palette.primary.main}10`,
			borderRadius: theme.radius.md,
		},
		viewButtonText: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
			marginRight: theme.spacing.xs,
		},
		emptyContainer: {
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
		emptyText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
	});

	const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
		const statusColor = getStatusColor(item.status);
		const statusIcon = getStatusIcon(item.status);

		return (
			<Animated.View entering={FadeInUp.delay(index * 100).springify()}>
				<Card style={styles.orderCard}>
					<View style={styles.orderHeader}>
						<View style={styles.orderIdContainer}>
							<Text style={styles.orderIdLabel}>Order ID</Text>
							<Text style={styles.orderId}>{item.orderId}</Text>
						</View>
						<View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
							<Ionicons name={statusIcon as any} size={16} color={statusColor} />
							<Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
						</View>
					</View>

					<View style={styles.orderDetails}>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Date</Text>
							<Text style={styles.detailValue}>
								{new Date(item.createdAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Items</Text>
							<Text style={styles.detailValue}>{item.products.length} item(s)</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Payment</Text>
							<Text style={styles.detailValue}>{item.paymentMethod.toUpperCase()}</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>Total</Text>
							<Text style={styles.totalAmount}>${item.totalPrice.toFixed(2)}</Text>
						</View>
					</View>

					<TouchableOpacity style={styles.viewButton} onPress={() => handleViewOrder(item.orderId)}>
						<Text style={styles.viewButtonText}>View Details</Text>
						<Ionicons name="arrow-forward" size={16} color={theme.palette.primary.main} />
					</TouchableOpacity>
				</Card>
			</Animated.View>
		);
	};

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyIcon}>📦</Text>
			<Text style={styles.emptyTitle}>No Orders Yet</Text>
			<Text style={styles.emptyText}>
				{selectedStatus
					? `No ${selectedStatus} orders found`
					: "Start shopping to see your orders here"}
			</Text>
		</View>
	);

	if (isLoading) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>My Orders</Text>
					</View>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.palette.primary.main} />
					</View>
				</Container>
			</SafeArea>
		);
	}

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<Text style={styles.title}>My Orders</Text>
				</View>

				<FlatList
					data={filteredOrders}
					renderItem={renderOrderItem}
					keyExtractor={(item) => item._id}
					ListEmptyComponent={renderEmpty}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingBottom: theme.spacing.xl,
						flexGrow: 1,
					}}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							tintColor={theme.palette.primary.main}
						/>
					}
				/>
			</Container>
		</SafeArea>
	);
};

export default OrdersScreen;
