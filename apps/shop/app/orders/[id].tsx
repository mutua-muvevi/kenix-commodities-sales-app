import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Linking,
	Alert,
	Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Card, Button } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { orderApi } from "../../store/api/order-api";
import { Order } from "../../store/types/order";
import { connectWebSocket, onRiderLocationUpdate, onDeliveryStatusChange } from "../../services/websocket";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAP_HEIGHT = 300;

interface RiderLocation {
	latitude: number;
	longitude: number;
}

const OrderTrackingScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { accessToken, user } = useAuth();
	const mapRef = useRef<MapView>(null);

	const [order, setOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
	const [shopLocation] = useState<RiderLocation>({
		latitude: user?.location?.latitude || -1.2864,
		longitude: user?.location?.longitude || 36.8172,
	});

	useEffect(() => {
		if (!id || !accessToken) return;

		const loadOrder = async () => {
			try {
				setIsLoading(true);
				const fetchedOrder = await orderApi.getOrderById(id, accessToken);
				setOrder(fetchedOrder);
			} catch (error: any) {
				console.error("Failed to load order:", error);
				Toast.show({
					type: "error",
					text1: "Error",
					text2: error.message || "Failed to load order details",
				});
				router.back();
			} finally {
				setIsLoading(false);
			}
		};

		loadOrder();
	}, [id, accessToken]);

	useEffect(() => {
		// Connect to WebSocket for real-time updates
		if (!order) return;

		const initWebSocket = async () => {
			try {
				await connectWebSocket();

				// Listen for rider location updates
				const unsubLocation = onRiderLocationUpdate((data) => {
					if (data.routeId === (order as any).assignedRoute) {
						setRiderLocation(data.location);

						// Animate map to show both markers
						if (mapRef.current && data.location) {
							mapRef.current.fitToCoordinates(
								[shopLocation, data.location],
								{
									edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
									animated: true,
								},
							);
						}
					}
				});

				// Listen for delivery status changes
				const unsubStatus = onDeliveryStatusChange((data) => {
					if (data.orderId === order.orderId) {
						setOrder((prev) => (prev ? { ...prev, status: data.status as any } : null));

						if (data.status === "delivered") {
							Toast.show({
								type: "success",
								text1: "Delivery Complete",
								text2: "Your order has been delivered!",
							});
						}
					}
				});

				return () => {
					unsubLocation();
					unsubStatus();
				};
			} catch (error) {
				console.warn("WebSocket connection failed:", error);
			}
		};

		initWebSocket();
	}, [order]);

	const handleCallRider = () => {
		const riderPhone = (order as any)?.riderPhone || "+254712345678";
		Alert.alert("Call Rider", `Call ${riderPhone}?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Call",
				onPress: () => {
					Linking.openURL(`tel:${riderPhone}`);
				},
			},
		]);
	};

	const calculateETA = (): string => {
		if (!riderLocation || !shopLocation) return "Calculating...";

		// Simple distance calculation (Haversine formula)
		const R = 6371; // Earth's radius in km
		const dLat = ((shopLocation.latitude - riderLocation.latitude) * Math.PI) / 180;
		const dLon = ((shopLocation.longitude - riderLocation.longitude) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((riderLocation.latitude * Math.PI) / 180) *
				Math.cos((shopLocation.latitude * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;

		// Assume average speed of 30 km/h
		const timeInMinutes = Math.round((distance / 30) * 60);

		if (timeInMinutes < 1) return "Less than 1 minute";
		if (timeInMinutes < 60) return `${timeInMinutes} minutes`;
		return `${Math.floor(timeInMinutes / 60)} hours ${timeInMinutes % 60} minutes`;
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

	const styles = StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.lg,
		},
		backButton: {
			marginRight: theme.spacing.md,
		},
		title: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		section: {
			marginBottom: theme.spacing.md,
		},
		sectionTitle: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.sm,
		},
		orderIdText: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		dateText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		statusBadge: {
			flexDirection: "row",
			alignItems: "center",
			alignSelf: "flex-start",
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.radius.md,
			gap: theme.spacing.xs,
			marginTop: theme.spacing.sm,
		},
		statusText: {
			...theme.typography.body1,
			fontWeight: "600",
			textTransform: "uppercase",
		},
		mapContainer: {
			height: MAP_HEIGHT,
			borderRadius: theme.radius.lg,
			overflow: "hidden",
			marginBottom: theme.spacing.md,
		},
		map: {
			flex: 1,
		},
		etaCard: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			padding: theme.spacing.md,
			backgroundColor: `${theme.palette.primary.main}10`,
			borderRadius: theme.radius.md,
			marginBottom: theme.spacing.md,
		},
		etaText: {
			...theme.typography.h6,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		etaLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		riderInfo: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
		},
		riderDetails: {
			flex: 1,
		},
		riderName: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		riderPhone: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		callButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			backgroundColor: theme.palette.success.main,
			borderRadius: theme.radius.md,
			gap: theme.spacing.xs,
		},
		callButtonText: {
			...theme.typography.body2,
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		productItem: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		productName: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			flex: 1,
		},
		productQuantity: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginHorizontal: theme.spacing.sm,
		},
		productPrice: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		summaryRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
		},
		summaryLabel: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
		},
		summaryValue: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		totalRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.md,
			borderTopWidth: 2,
			borderTopColor: theme.palette.divider,
			marginTop: theme.spacing.sm,
		},
		totalLabel: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		totalValue: {
			...theme.typography.h6,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		statusMessage: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			padding: theme.spacing.lg,
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.radius.md,
		},
	});

	if (isLoading || !order) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Order Details</Text>
					</View>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.palette.primary.main} />
					</View>
				</Container>
			</SafeArea>
		);
	}

	const statusColor = getStatusColor(order.status);
	const statusIcon = getStatusIcon(order.status);
	const isInTransit = order.status.toLowerCase() === "in transit" || order.status.toLowerCase() === "intransit";
	const isDelivered = order.status.toLowerCase() === "delivered";

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<Text style={styles.title}>Order Details</Text>
				</View>

				<ScrollView showsVerticalScrollIndicator={false}>
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<Card style={styles.section}>
							<Text style={styles.orderIdText}>Order #{order.orderId}</Text>
							<Text style={styles.dateText}>
								Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
							<View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
								<Ionicons name={statusIcon as any} size={20} color={statusColor} />
								<Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
							</View>
						</Card>
					</Animated.View>

					{isInTransit && riderLocation && (
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<Text style={styles.sectionTitle}>Live Tracking</Text>

								<View style={styles.mapContainer}>
									<MapView
										ref={mapRef}
										provider={PROVIDER_GOOGLE}
										style={styles.map}
										initialRegion={{
											latitude: (shopLocation.latitude + riderLocation.latitude) / 2,
											longitude: (shopLocation.longitude + riderLocation.longitude) / 2,
											latitudeDelta: 0.05,
											longitudeDelta: 0.05,
										}}
									>
										{/* Shop Marker */}
										<Marker
											coordinate={shopLocation}
											title="Your Shop"
											description="Delivery destination"
											pinColor="red"
										>
											<Ionicons name="storefront" size={32} color={theme.palette.error.main} />
										</Marker>

										{/* Rider Marker */}
										<Marker
											coordinate={riderLocation}
											title="Delivery Rider"
											description="On the way"
											pinColor="blue"
										>
											<Ionicons name="bicycle" size={32} color={theme.palette.primary.main} />
										</Marker>

										{/* Route Line */}
										<Polyline
											coordinates={[riderLocation, shopLocation]}
											strokeColor={theme.palette.primary.main}
											strokeWidth={3}
											lineDashPattern={[10, 5]}
										/>
									</MapView>
								</View>

								<View style={styles.etaCard}>
									<View>
										<Text style={styles.etaLabel}>Estimated Arrival</Text>
										<Text style={styles.etaText}>{calculateETA()}</Text>
									</View>
									<Ionicons name="time" size={32} color={theme.palette.primary.main} />
								</View>

								{(order as any).riderName && (
									<View style={styles.riderInfo}>
										<View style={styles.riderDetails}>
											<Text style={styles.riderName}>{(order as any).riderName}</Text>
											<Text style={styles.riderPhone}>{(order as any).riderPhone || "N/A"}</Text>
										</View>
										<TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
											<Ionicons name="call" size={16} color={theme.palette.common.white} />
											<Text style={styles.callButtonText}>Call</Text>
										</TouchableOpacity>
									</View>
								)}
							</Card>
						</Animated.View>
					)}

					{!isInTransit && !isDelivered && (
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<Text style={styles.statusMessage}>
									{order.status === "pending"
										? "Waiting for admin approval. We'll notify you once your order is approved."
										: order.status === "approved"
											? "Order approved! Waiting for delivery assignment."
											: "Order status will be updated soon."}
								</Text>
							</Card>
						</Animated.View>
					)}

					{isDelivered && (
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<View style={{ alignItems: "center", paddingVertical: theme.spacing.lg }}>
									<Ionicons
										name="checkmark-done-circle"
										size={64}
										color={theme.palette.success.main}
									/>
									<Text style={[styles.statusMessage, { backgroundColor: "transparent" }]}>
										Your order has been successfully delivered!
									</Text>
								</View>
							</Card>
						</Animated.View>
					)}

					<Animated.View entering={FadeInUp.delay(300).springify()}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Order Items ({order.products.length})</Text>
							{order.products.map((item, index) => (
								<View key={index} style={styles.productItem}>
									<Text style={styles.productName}>Product #{index + 1}</Text>
									<Text style={styles.productQuantity}>x{item.quantity}</Text>
								</View>
							))}
						</Card>
					</Animated.View>

					<Animated.View entering={FadeInUp.delay(400).springify()}>
						<Card style={styles.section}>
							<View style={styles.summaryRow}>
								<Text style={styles.summaryLabel}>Payment Method</Text>
								<Text style={styles.summaryValue}>{order.paymentMethod.toUpperCase()}</Text>
							</View>
							<View style={styles.totalRow}>
								<Text style={styles.totalLabel}>Total Amount</Text>
								<Text style={styles.totalValue}>${order.totalPrice.toFixed(2)}</Text>
							</View>
						</Card>
					</Animated.View>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default OrderTrackingScreen;
