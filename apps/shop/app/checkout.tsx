import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeArea, Container } from "../components/layout";
import { Button, Card } from "../components/ui";
import { useTheme, useCart, useAuth } from "../hooks";
import { orderApi } from "../store/api/order-api";
import { initiateMpesaPayment, listenForPaymentConfirmation, validatePhoneNumber } from "../services/mpesa";
import { connectWebSocket } from "../services/websocket";
import Toast from "react-native-toast-message";

type PaymentMethod = "mpesa" | "cash";
type CheckoutStep = "review" | "payment" | "processing" | "success" | "error";

const CheckoutScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { items, totalPrice, clearCart } = useCart();
	const { user, accessToken } = useAuth();

	const [step, setStep] = useState<CheckoutStep>("review");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
	const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
	const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
	const [deliveryNotes, setDeliveryNotes] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [orderId, setOrderId] = useState<string | null>(null);
	const [transactionId, setTransactionId] = useState<string | null>(null);
	const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(120); // 2 minutes countdown

	const deliveryFee = 0; // Free delivery
	const totalAmount = totalPrice + deliveryFee;

	useEffect(() => {
		// Initialize WebSocket connection
		if (accessToken) {
			connectWebSocket().catch((err) => {
				console.warn("WebSocket connection failed:", err);
			});
		}
	}, [accessToken]);

	useEffect(() => {
		// Countdown timer for payment processing
		if (step === "processing" && countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else if (step === "processing" && countdown === 0) {
			handlePaymentTimeout();
		}
	}, [step, countdown]);

	const handleReviewOrder = () => {
		if (!deliveryAddress.trim()) {
			Alert.alert("Missing Information", "Please enter your delivery address");
			return;
		}
		setStep("payment");
	};

	const handlePlaceOrder = async () => {
		if (paymentMethod === "mpesa") {
			if (!phoneNumber.trim()) {
				Alert.alert("Missing Information", "Please enter your M-Pesa phone number");
				return;
			}

			if (!validatePhoneNumber(phoneNumber)) {
				Alert.alert("Invalid Phone Number", "Please enter a valid Kenya phone number (e.g., 0712345678)");
				return;
			}
		}

		setIsProcessing(true);
		setErrorMessage(null);

		try {
			if (!accessToken) {
				throw new Error("Please log in to place an order");
			}

			// Create order
			const orderData = {
				orderer: user?._id || "",
				products: items.map((item) => ({
					product: item.productId,
					quantity: item.quantity,
				})),
				paymentMethod,
				deliveryAddress,
				deliveryNotes,
			};

			const order = await orderApi.createOrder(orderData, accessToken);
			setOrderId(order.orderId);

			if (paymentMethod === "mpesa") {
				// Initiate M-Pesa payment
				setStep("processing");
				setCountdown(120);

				const paymentResult = await initiateMpesaPayment(
					order.orderId,
					phoneNumber,
					totalAmount,
					accessToken,
				);

				if (!paymentResult.success) {
					throw new Error(paymentResult.error || "Payment initiation failed");
				}

				setTransactionId(paymentResult.transactionId || null);

				// Listen for payment confirmation via WebSocket
				const cleanup = listenForPaymentConfirmation(
					order.orderId,
					(data) => {
						setMpesaReceiptNumber(data.mpesaReceiptNumber || null);
						setStep("success");
						clearCart();
						setIsProcessing(false);
					},
					(error) => {
						setErrorMessage(error);
						setStep("error");
						setIsProcessing(false);
					},
					120000, // 2 minutes timeout
				);

				// Cleanup on unmount
				return () => cleanup();
			} else {
				// Cash payment - order placed successfully
				setStep("success");
				clearCart();
				setIsProcessing(false);
			}
		} catch (error: any) {
			console.error("Order placement error:", error);
			setErrorMessage(error.message || "Failed to place order");
			setStep("error");
			setIsProcessing(false);
		}
	};

	const handlePaymentTimeout = () => {
		setErrorMessage("Payment timeout - please try again");
		setStep("error");
		setIsProcessing(false);
	};

	const handleRetryPayment = () => {
		setStep("payment");
		setErrorMessage(null);
		setCountdown(120);
	};

	const handleCancelOrder = () => {
		Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
			{ text: "No", style: "cancel" },
			{
				text: "Yes",
				style: "destructive",
				onPress: () => {
					setStep("review");
					setErrorMessage(null);
					setOrderId(null);
					setTransactionId(null);
				},
			},
		]);
	};

	const handleGoToOrders = () => {
		router.push("/orders");
	};

	const handleTrackOrder = () => {
		if (orderId) {
			router.push(`/orders/${orderId}`);
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
			marginBottom: theme.spacing.lg,
		},
		sectionTitle: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.md,
		},
		input: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.radius.md,
			padding: theme.spacing.md,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			marginBottom: theme.spacing.md,
		},
		multilineInput: {
			minHeight: 80,
			textAlignVertical: "top",
		},
		orderItem: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		itemName: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			flex: 1,
		},
		itemQuantity: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginHorizontal: theme.spacing.sm,
		},
		itemPrice: {
			...theme.typography.body2,
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
		paymentOption: {
			flexDirection: "row",
			alignItems: "center",
			padding: theme.spacing.md,
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.radius.md,
			borderWidth: 2,
			marginBottom: theme.spacing.md,
		},
		paymentOptionSelected: {
			borderColor: theme.palette.primary.main,
			backgroundColor: `${theme.palette.primary.main}10`,
		},
		paymentOptionUnselected: {
			borderColor: theme.palette.divider,
		},
		radioButton: {
			width: 24,
			height: 24,
			borderRadius: 12,
			borderWidth: 2,
			borderColor: theme.palette.divider,
			marginRight: theme.spacing.md,
			alignItems: "center",
			justifyContent: "center",
		},
		radioButtonSelected: {
			borderColor: theme.palette.primary.main,
		},
		radioButtonInner: {
			width: 12,
			height: 12,
			borderRadius: 6,
			backgroundColor: theme.palette.primary.main,
		},
		paymentOptionText: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			flex: 1,
		},
		processingContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		mpesaLogo: {
			fontSize: 80,
			marginBottom: theme.spacing.xl,
		},
		processingTitle: {
			...theme.typography.h4,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.md,
			textAlign: "center",
		},
		processingText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.sm,
		},
		countdown: {
			...theme.typography.h5,
			color: theme.palette.primary.main,
			fontWeight: "700",
			marginTop: theme.spacing.lg,
		},
		successContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		successIcon: {
			fontSize: 100,
			marginBottom: theme.spacing.xl,
		},
		successTitle: {
			...theme.typography.h3,
			color: theme.palette.success.main,
			fontWeight: "700",
			marginBottom: theme.spacing.md,
		},
		successText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.sm,
		},
		orderIdText: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginTop: theme.spacing.md,
		},
		errorContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		errorIcon: {
			fontSize: 80,
			marginBottom: theme.spacing.xl,
		},
		errorTitle: {
			...theme.typography.h4,
			color: theme.palette.error.main,
			fontWeight: "700",
			marginBottom: theme.spacing.md,
		},
		errorText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.lg,
			paddingHorizontal: theme.spacing.lg,
		},
		buttonRow: {
			flexDirection: "row",
			gap: theme.spacing.md,
			marginTop: theme.spacing.lg,
		},
	});

	// Render different steps
	if (step === "review") {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Review Order</Text>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Card style={styles.section}>
								<Text style={styles.sectionTitle}>Delivery Information</Text>
								<TextInput
									style={styles.input}
									placeholder="Delivery Address *"
									placeholderTextColor={theme.palette.text.disabled}
									value={deliveryAddress}
									onChangeText={setDeliveryAddress}
									multiline
								/>
								<TextInput
									style={[styles.input, styles.multilineInput]}
									placeholder="Delivery Notes (optional)"
									placeholderTextColor={theme.palette.text.disabled}
									value={deliveryNotes}
									onChangeText={setDeliveryNotes}
									multiline
								/>
							</Card>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
								{items.map((item, index) => (
									<View key={item.productId} style={styles.orderItem}>
										<Text style={styles.itemName} numberOfLines={1}>
											{item.name}
										</Text>
										<Text style={styles.itemQuantity}>x{item.quantity}</Text>
										<Text style={styles.itemPrice}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
									</View>
								))}
							</Card>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<Card style={styles.section}>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Subtotal</Text>
									<Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Delivery Fee</Text>
									<Text style={styles.summaryValue}>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</Text>
								</View>
								<View style={styles.totalRow}>
									<Text style={styles.totalLabel}>Total</Text>
									<Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
								</View>
							</Card>
						</Animated.View>

						<Button
							title="Continue to Payment"
							variant="gradient"
							fullWidth
							onPress={handleReviewOrder}
							style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}
						/>
					</ScrollView>
				</Container>
			</SafeArea>
		);
	}

	if (step === "payment") {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => setStep("review")} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Payment Method</Text>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Text style={styles.sectionTitle}>Select Payment Method</Text>

							<TouchableOpacity
								style={[
									styles.paymentOption,
									paymentMethod === "mpesa" ? styles.paymentOptionSelected : styles.paymentOptionUnselected,
								]}
								onPress={() => setPaymentMethod("mpesa")}
							>
								<View
									style={[
										styles.radioButton,
										paymentMethod === "mpesa" && styles.radioButtonSelected,
									]}
								>
									{paymentMethod === "mpesa" && <View style={styles.radioButtonInner} />}
								</View>
								<Text style={styles.paymentOptionText}>M-Pesa</Text>
								<Text style={{ fontSize: 24 }}>📱</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.paymentOption,
									paymentMethod === "cash" ? styles.paymentOptionSelected : styles.paymentOptionUnselected,
								]}
								onPress={() => setPaymentMethod("cash")}
							>
								<View
									style={[
										styles.radioButton,
										paymentMethod === "cash" && styles.radioButtonSelected,
									]}
								>
									{paymentMethod === "cash" && <View style={styles.radioButtonInner} />}
								</View>
								<Text style={styles.paymentOptionText}>Cash on Delivery</Text>
								<Text style={{ fontSize: 24 }}>💵</Text>
							</TouchableOpacity>
						</Animated.View>

						{paymentMethod === "mpesa" && (
							<Animated.View entering={FadeInDown.springify()} style={styles.section}>
								<Text style={styles.sectionTitle}>M-Pesa Phone Number</Text>
								<TextInput
									style={styles.input}
									placeholder="e.g., 0712345678"
									placeholderTextColor={theme.palette.text.disabled}
									value={phoneNumber}
									onChangeText={setPhoneNumber}
									keyboardType="phone-pad"
									maxLength={13}
								/>
								<Text style={[theme.typography.caption, { color: theme.palette.text.secondary }]}>
									You will receive an M-Pesa prompt to enter your PIN
								</Text>
							</Animated.View>
						)}

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<View style={styles.totalRow}>
									<Text style={styles.totalLabel}>Amount to Pay</Text>
									<Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
								</View>
							</Card>
						</Animated.View>

						<Button
							title={isProcessing ? "Processing..." : "Place Order"}
							variant="gradient"
							fullWidth
							onPress={handlePlaceOrder}
							disabled={isProcessing}
							style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}
						/>
					</ScrollView>
				</Container>
			</SafeArea>
		);
	}

	if (step === "processing") {
		const minutes = Math.floor(countdown / 60);
		const seconds = countdown % 60;

		return (
			<SafeArea>
				<Container>
					<Animated.View entering={ZoomIn.springify()} style={styles.processingContainer}>
						<Text style={styles.mpesaLogo}>📱</Text>
						<ActivityIndicator size="large" color={theme.palette.primary.main} />
						<Text style={styles.processingTitle}>Processing Payment</Text>
						<Text style={styles.processingText}>Check your phone for M-Pesa prompt</Text>
						<Text style={styles.processingText}>Enter your M-Pesa PIN to complete payment</Text>
						<Text style={styles.countdown}>
							{minutes}:{seconds.toString().padStart(2, "0")}
						</Text>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	if (step === "success") {
		return (
			<SafeArea>
				<Container>
					<Animated.View entering={ZoomIn.springify()} style={styles.successContainer}>
						<Text style={styles.successIcon}>✅</Text>
						<Text style={styles.successTitle}>
							{paymentMethod === "mpesa" ? "Payment Successful!" : "Order Placed!"}
						</Text>
						<Text style={styles.successText}>Your order has been placed successfully</Text>
						{orderId && <Text style={styles.orderIdText}>Order ID: {orderId}</Text>}
						{mpesaReceiptNumber && (
							<Text style={[styles.successText, { marginTop: theme.spacing.sm }]}>
								M-Pesa Receipt: {mpesaReceiptNumber}
							</Text>
						)}

						<View style={[styles.buttonRow, { marginTop: theme.spacing.xxl }]}>
							<Button
								title="Track Order"
								variant="gradient"
								onPress={handleTrackOrder}
								style={{ flex: 1 }}
							/>
							<Button
								title="View Orders"
								variant="outlined"
								onPress={handleGoToOrders}
								style={{ flex: 1 }}
							/>
						</View>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	if (step === "error") {
		return (
			<SafeArea>
				<Container>
					<Animated.View entering={ZoomIn.springify()} style={styles.errorContainer}>
						<Text style={styles.errorIcon}>❌</Text>
						<Text style={styles.errorTitle}>
							{paymentMethod === "mpesa" ? "Payment Failed" : "Order Failed"}
						</Text>
						<Text style={styles.errorText}>{errorMessage || "An error occurred. Please try again."}</Text>

						<View style={styles.buttonRow}>
							<Button
								title="Retry Payment"
								variant="gradient"
								onPress={handleRetryPayment}
								style={{ flex: 1 }}
							/>
							<Button
								title="Cancel Order"
								variant="outlined"
								onPress={handleCancelOrder}
								style={{ flex: 1 }}
							/>
						</View>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	return null;
};

export default CheckoutScreen;
