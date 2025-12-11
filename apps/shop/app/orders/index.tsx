import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	FadeInUp,
	FadeIn,
	ZoomIn,
	SlideInRight,
	Layout,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SafeArea, Container } from "../../components/layout";
import { Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { orderApi } from "../../store/api/order-api";
import { Order } from "../../store/types/order";
import Toast from "react-native-toast-message";

type OrderStatus = "all" | "pending" | "approved" | "in transit" | "delivered" | "cancelled";

interface StatusConfig {
	label: string;
	color: string;
	bgColor: string;
	icon: keyof typeof Ionicons.glyphMap;
	gradient: [string, string];
}

const OrdersScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { accessToken } = useAuth();

	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");

	const fetchOrders = useCallback(
		async (showLoader = true) => {
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

				// Haptic feedback on successful refresh
				if (!showLoader) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				}
			} catch (error: any) {
				console.error("Failed to fetch orders:", error);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: error.message || "Failed to load orders",
				});
				if (!showLoader) {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				}
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[accessToken]
	);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		fetchOrders(false);
	};

	const handleViewOrder = (orderId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push(`/orders/${orderId}`);
	};

	const handleStatusFilter = (status: OrderStatus) => {
		Haptics.selectionAsync();
		setSelectedStatus(status);
	};

	const getStatusConfig = (status: string): StatusConfig => {
		const statusLower = status.toLowerCase();

		switch (statusLower) {
			case "pending":
				return {
					label: "Pending",
					color: theme.palette.warning.dark,
					bgColor: theme.palette.warning.lighter,
					icon: "time",
					gradient: [theme.palette.warning.light, theme.palette.warning.main],
				};
			case "approved":
				return {
					label: "Approved",
					color: theme.palette.info.dark,
					bgColor: theme.palette.info.lighter,
					icon: "checkmark-circle",
					gradient: [theme.palette.info.light, theme.palette.info.main],
				};
			case "in transit":
			case "intransit":
				return {
					label: "In Transit",
					color: theme.palette.primary.dark,
					bgColor: theme.palette.primary.lighter,
					icon: "car",
					gradient: [theme.palette.primary.light, theme.palette.primary.main],
				};
			case "delivered":
				return {
					label: "Delivered",
					color: theme.palette.success.dark,
					bgColor: theme.palette.success.lighter,
					icon: "checkmark-done-circle",
					gradient: [theme.palette.success.light, theme.palette.success.main],
				};
			case "cancelled":
				return {
					label: "Cancelled",
					color: theme.palette.error.dark,
					bgColor: theme.palette.error.lighter,
					icon: "close-circle",
					gradient: [theme.palette.error.light, theme.palette.error.main],
				};
			default:
				return {
					label: status,
					color: theme.palette.text.secondary,
					bgColor: theme.palette.grey[200],
					icon: "help-circle",
					gradient: [theme.palette.grey[400], theme.palette.grey[500]],
				};
		}
	};

	const getOrderTimeline = (status: string) => {
		const stages = [
			{ key: "pending", label: "Pending", icon: "time" },
			{ key: "approved", label: "Approved", icon: "checkmark-circle" },
			{ key: "intransit", label: "In Transit", icon: "car" },
			{ key: "delivered", label: "Delivered", icon: "checkmark-done-circle" },
		];

		const statusMap: { [key: string]: number } = {
			pending: 0,
			approved: 1,
			"in transit": 2,
			intransit: 2,
			delivered: 3,
			cancelled: -1,
		};

		const currentIndex = statusMap[status.toLowerCase()] ?? -1;

		return { stages, currentIndex };
	};

	const filterOptions: { key: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
		{ key: "all", label: "All", icon: "list" },
		{ key: "pending", label: "Pending", icon: "time" },
		{ key: "approved", label: "Approved", icon: "checkmark-circle" },
		{ key: "in transit", label: "In Transit", icon: "car" },
		{ key: "delivered", label: "Delivered", icon: "checkmark-done-circle" },
		{ key: "cancelled", label: "Cancelled", icon: "close-circle" },
	];

	const filteredOrders =
		selectedStatus === "all"
			? orders
			: orders.filter((order) => order.status.toLowerCase() === selectedStatus.toLowerCase());

	const getOrderStats = () => {
		const stats = {
			all: orders.length,
			pending: orders.filter((o) => o.status.toLowerCase() === "pending").length,
			approved: orders.filter((o) => o.status.toLowerCase() === "approved").length,
			"in transit": orders.filter(
				(o) => o.status.toLowerCase() === "in transit" || o.status.toLowerCase() === "intransit"
			).length,
			delivered: orders.filter((o) => o.status.toLowerCase() === "delivered").length,
			cancelled: orders.filter((o) => o.status.toLowerCase() === "cancelled").length,
		};
		return stats;
	};

	const orderStats = getOrderStats();

	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.lg,
			paddingHorizontal: theme.spacing.md,
			backgroundColor: theme.palette.background.default,
		},
		backButton: {
			marginRight: theme.spacing.md,
			padding: theme.spacing.xs,
		},
		headerContent: {
			flex: 1,
		},
		title: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		subtitle: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: 2,
		},
		filterScrollContainer: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			backgroundColor: theme.palette.background.default,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		filterContainer: {
			flexDirection: "row",
			gap: theme.spacing.sm,
		},
		filterChip: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.xl,
			borderWidth: 1.5,
			borderColor: theme.palette.divider,
			backgroundColor: theme.palette.background.surface,
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			minHeight: 38,
		},
		filterChipActive: {
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
		},
		filterChipText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			fontWeight: "500",
		},
		filterChipTextActive: {
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		filterBadge: {
			backgroundColor: theme.palette.action.hover,
			paddingHorizontal: 6,
			paddingVertical: 2,
			borderRadius: theme.borderRadius.sm,
			minWidth: 20,
			alignItems: "center",
			justifyContent: "center",
		},
		filterBadgeActive: {
			backgroundColor: "rgba(255,255,255,0.25)",
		},
		filterBadgeText: {
			...theme.typography.caption,
			fontSize: 11,
			fontWeight: "700",
			color: theme.palette.text.primary,
		},
		filterBadgeTextActive: {
			color: theme.palette.common.white,
		},
		listContent: {
			padding: theme.spacing.md,
			paddingBottom: theme.spacing.xxl,
		},
		orderCard: {
			marginBottom: theme.spacing.md,
			overflow: "hidden",
		},
		orderCardInner: {
			padding: theme.spacing.md,
		},
		orderHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
			marginBottom: theme.spacing.md,
		},
		orderIdContainer: {
			flex: 1,
			marginRight: theme.spacing.sm,
		},
		orderIdLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginBottom: 4,
			textTransform: "uppercase",
			letterSpacing: 0.5,
		},
		orderId: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		statusBadge: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.lg,
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		statusText: {
			...theme.typography.caption,
			fontWeight: "700",
			textTransform: "uppercase",
			letterSpacing: 0.5,
		},
		timeline: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
		},
		timelineItem: {
			flex: 1,
			alignItems: "center",
		},
		timelineIconContainer: {
			width: 32,
			height: 32,
			borderRadius: 16,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 6,
		},
		timelineIconActive: {
			backgroundColor: theme.palette.primary.main,
		},
		timelineIconInactive: {
			backgroundColor: theme.palette.grey[300],
		},
		timelineIconCompleted: {
			backgroundColor: theme.palette.success.main,
		},
		timelineLabel: {
			...theme.typography.caption,
			fontSize: 10,
			textAlign: "center",
			color: theme.palette.text.secondary,
		},
		timelineLabelActive: {
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		timelineConnector: {
			position: "absolute",
			top: 16,
			left: "25%",
			right: "25%",
			height: 2,
			backgroundColor: theme.palette.divider,
		},
		timelineConnectorActive: {
			backgroundColor: theme.palette.primary.main,
		},
		orderDetails: {
			marginTop: theme.spacing.sm,
			paddingTop: theme.spacing.md,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		detailRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		detailRowLast: {
			marginBottom: 0,
			paddingTop: theme.spacing.sm,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		detailLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			flex: 1,
		},
		detailValue: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		detailIcon: {
			marginRight: theme.spacing.xs,
		},
		totalAmount: {
			...theme.typography.h5,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		viewButton: {
			marginTop: theme.spacing.md,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.lg,
			backgroundColor: theme.palette.primary.main,
			borderRadius: theme.borderRadius.lg,
			shadowColor: theme.palette.primary.main,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
			elevation: 4,
		},
		viewButtonText: {
			...theme.typography.button,
			color: theme.palette.common.white,
			fontWeight: "700",
			marginRight: theme.spacing.xs,
		},
		emptyContainer: {
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.xxl * 2,
			paddingHorizontal: theme.spacing.xl,
		},
		emptyIconContainer: {
			width: 120,
			height: 120,
			borderRadius: 60,
			backgroundColor: theme.palette.background.neutral,
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xl,
		},
		emptyIcon: {
			marginBottom: 0,
		},
		emptyTitle: {
			...theme.typography.h4,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
			fontWeight: "700",
			textAlign: "center",
		},
		emptyText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			lineHeight: 24,
			marginBottom: theme.spacing.xl,
		},
		emptyButton: {
			backgroundColor: theme.palette.primary.main,
			paddingHorizontal: theme.spacing.xl,
			paddingVertical: theme.spacing.md,
			borderRadius: theme.borderRadius.lg,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
		},
		emptyButtonText: {
			...theme.typography.button,
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.xxl * 2,
		},
		loadingText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.md,
		},
	});

	const renderTimeline = (order: Order) => {
		const { stages, currentIndex } = getOrderTimeline(order.status);
		const isCancelled = order.status.toLowerCase() === "cancelled";

		if (isCancelled) {
			return null; // Don't show timeline for cancelled orders
		}

		return (
			<View style={styles.timeline}>
				{stages.map((stage, index) => {
					const isActive = index === currentIndex;
					const isCompleted = index < currentIndex;
					const iconColor =
						isActive || isCompleted ? theme.palette.common.white : theme.palette.grey[500];

					return (
						<View key={stage.key} style={styles.timelineItem}>
							{index > 0 && (
								<View
									style={[
										styles.timelineConnector,
										isCompleted && styles.timelineConnectorActive,
									]}
								/>
							)}
							<Animated.View
								entering={ZoomIn.delay(index * 100).springify()}
								style={[
									styles.timelineIconContainer,
									isActive
										? styles.timelineIconActive
										: isCompleted
										? styles.timelineIconCompleted
										: styles.timelineIconInactive,
								]}
							>
								<Ionicons
									name={stage.icon as any}
									size={16}
									color={iconColor}
								/>
							</Animated.View>
							<Text
								style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}
								numberOfLines={1}
							>
								{stage.label}
							</Text>
						</View>
					);
				})}
			</View>
		);
	};

	const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
		const statusConfig = getStatusConfig(item.status);

		return (
			<Animated.View
				entering={FadeInUp.delay(index * 50)
					.duration(400)
					.springify()}
				layout={Layout.springify()}
			>
				<Card style={styles.orderCard} variant="elevated">
					<View style={styles.orderCardInner}>
						{/* Header */}
						<View style={styles.orderHeader}>
							<View style={styles.orderIdContainer}>
								<Text style={styles.orderIdLabel}>Order ID</Text>
								<Text style={styles.orderId}>#{item.orderId}</Text>
							</View>
							<View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
								<Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
								<Text style={[styles.statusText, { color: statusConfig.color }]}>
									{statusConfig.label}
								</Text>
							</View>
						</View>

						{/* Timeline */}
						{renderTimeline(item)}

						{/* Details */}
						<View style={styles.orderDetails}>
							<View style={styles.detailRow}>
								<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
									<Ionicons
										name="calendar-outline"
										size={16}
										color={theme.palette.text.secondary}
										style={styles.detailIcon}
									/>
									<Text style={styles.detailLabel}>Date</Text>
								</View>
								<Text style={styles.detailValue}>
									{new Date(item.createdAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</Text>
							</View>
							<View style={styles.detailRow}>
								<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
									<Ionicons
										name="cube-outline"
										size={16}
										color={theme.palette.text.secondary}
										style={styles.detailIcon}
									/>
									<Text style={styles.detailLabel}>Items</Text>
								</View>
								<Text style={styles.detailValue}>{item.products.length} item(s)</Text>
							</View>
							<View style={styles.detailRow}>
								<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
									<Ionicons
										name="card-outline"
										size={16}
										color={theme.palette.text.secondary}
										style={styles.detailIcon}
									/>
									<Text style={styles.detailLabel}>Payment</Text>
								</View>
								<Text style={styles.detailValue}>{item.paymentMethod.toUpperCase()}</Text>
							</View>
							<View style={[styles.detailRow, styles.detailRowLast]}>
								<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
									<Ionicons
										name="cash-outline"
										size={16}
										color={theme.palette.primary.main}
										style={styles.detailIcon}
									/>
									<Text style={styles.detailLabel}>Total Amount</Text>
								</View>
								<Text style={styles.totalAmount}>KES {item.totalPrice.toLocaleString()}</Text>
							</View>
						</View>

						{/* View Details Button */}
						<TouchableOpacity
							style={styles.viewButton}
							onPress={() => handleViewOrder(item.orderId)}
							activeOpacity={0.8}
						>
							<Text style={styles.viewButtonText}>View Details</Text>
							<Ionicons name="arrow-forward" size={18} color={theme.palette.common.white} />
						</TouchableOpacity>
					</View>
				</Card>
			</Animated.View>
		);
	};

	const renderEmpty = () => {
		const emptyConfig =
			selectedStatus === "all"
				? {
						icon: "cart-outline" as keyof typeof Ionicons.glyphMap,
						title: "No Orders Yet",
						message: "Start shopping to place your first order and track it here.",
						showButton: true,
				  }
				: {
						icon: "search-outline" as keyof typeof Ionicons.glyphMap,
						title: `No ${selectedStatus} Orders`,
						message: `You don't have any ${selectedStatus} orders at the moment.`,
						showButton: false,
				  };

		return (
			<Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
				<Animated.View entering={ZoomIn.delay(100).springify()} style={styles.emptyIconContainer}>
					<Ionicons
						name={emptyConfig.icon}
						size={64}
						color={theme.palette.text.secondary}
						style={styles.emptyIcon}
					/>
				</Animated.View>
				<Animated.Text entering={FadeInUp.delay(200).springify()} style={styles.emptyTitle}>
					{emptyConfig.title}
				</Animated.Text>
				<Animated.Text entering={FadeInUp.delay(250).springify()} style={styles.emptyText}>
					{emptyConfig.message}
				</Animated.Text>
				{emptyConfig.showButton && (
					<Animated.View entering={FadeInUp.delay(300).springify()}>
						<TouchableOpacity
							style={styles.emptyButton}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								router.push("/(tabs)");
							}}
							activeOpacity={0.8}
						>
							<Ionicons name="basket" size={20} color={theme.palette.common.white} />
							<Text style={styles.emptyButtonText}>Start Shopping</Text>
						</TouchableOpacity>
					</Animated.View>
				)}
			</Animated.View>
		);
	};

	if (isLoading) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<View style={styles.headerContent}>
							<Text style={styles.title}>My Orders</Text>
						</View>
					</View>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.palette.primary.main} />
						<Text style={styles.loadingText}>Loading your orders...</Text>
					</View>
				</Container>
			</SafeArea>
		);
	}

	return (
		<SafeArea>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							router.back();
						}}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<View style={styles.headerContent}>
						<Text style={styles.title}>My Orders</Text>
						<Text style={styles.subtitle}>
							{orders.length} {orders.length === 1 ? "order" : "orders"} in total
						</Text>
					</View>
				</View>

				{/* Filter Tabs */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.filterScrollContainer}
					contentContainerStyle={styles.filterContainer}
				>
					{filterOptions.map((option, index) => {
						const isActive = selectedStatus === option.key;
						const count = orderStats[option.key];

						return (
							<Animated.View
								key={option.key}
								entering={SlideInRight.delay(index * 50)
									.duration(300)
									.springify()}
							>
								<TouchableOpacity
									style={[styles.filterChip, isActive && styles.filterChipActive]}
									onPress={() => handleStatusFilter(option.key)}
									activeOpacity={0.7}
								>
									<Ionicons
										name={option.icon}
										size={16}
										color={
											isActive
												? theme.palette.common.white
												: theme.palette.text.secondary
										}
									/>
									<Text
										style={[
											styles.filterChipText,
											isActive && styles.filterChipTextActive,
										]}
									>
										{option.label}
									</Text>
									{count > 0 && (
										<View
											style={[
												styles.filterBadge,
												isActive && styles.filterBadgeActive,
											]}
										>
											<Text
												style={[
													styles.filterBadgeText,
													isActive && styles.filterBadgeTextActive,
												]}
											>
												{count}
											</Text>
										</View>
									)}
								</TouchableOpacity>
							</Animated.View>
						);
					})}
				</ScrollView>

				{/* Orders List */}
				<FlatList
					data={filteredOrders}
					renderItem={renderOrderItem}
					keyExtractor={(item) => item._id}
					ListEmptyComponent={renderEmpty}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[
						styles.listContent,
						filteredOrders.length === 0 && { flex: 1 },
					]}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							tintColor={theme.palette.primary.main}
							colors={[theme.palette.primary.main]}
						/>
					}
				/>
			</View>
		</SafeArea>
	);
};

export default OrdersScreen;
