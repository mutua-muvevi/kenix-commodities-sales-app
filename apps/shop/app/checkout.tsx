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
	Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	FadeInDown,
	FadeInUp,
	ZoomIn,
	FadeIn,
	SlideInRight,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
	withSpring,
	Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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
	const [phoneNumber, setPhoneNumber] = useState("");
	const [deliveryAddress, setDeliveryAddress] = useState("");
	const [deliveryNotes, setDeliveryNotes] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [orderId, setOrderId] = useState<string | null>(null);
	const [transactionId, setTransactionId] = useState<string | null>(null);
	const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(120); // 2 minutes countdown

	// Form validation states
	const [addressError, setAddressError] = useState("");
	const [phoneError, setPhoneError] = useState("");
	const [addressFocused, setAddressFocused] = useState(false);
	const [phoneFocused, setPhoneFocused] = useState(false);

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

	const validateAddress = (address: string): boolean => {
		if (!address.trim()) {
			setAddressError("Delivery address is required");
			return false;
		}
		if (address.trim().length < 10) {
			setAddressError("Please provide a more detailed address");
			return false;
		}
		setAddressError("");
		return true;
	};

	const validatePhone = (phone: string): boolean => {
		if (!phone.trim()) {
			setPhoneError("Phone number is required");
			return false;
		}
		if (!validatePhoneNumber(phone)) {
			setPhoneError("Please enter a valid Kenya phone number (e.g., 0712345678)");
			return false;
		}
		setPhoneError("");
		return true;
	};

	const handleReviewOrder = () => {
		Haptics.selectionAsync();
		if (!validateAddress(deliveryAddress)) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setStep("payment");
	};

	const handlePlaceOrder = async () => {
		Haptics.selectionAsync();

		if (paymentMethod === "mpesa") {
			if (!validatePhone(phoneNumber)) {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					},
					(error) => {
						setErrorMessage(error);
						setStep("error");
						setIsProcessing(false);
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

	// Step Indicator Component
	const StepIndicator = () => {
		const steps = [
			{ key: "review", label: "Review", icon: "clipboard-outline" },
			{ key: "payment", label: "Payment", icon: "card-outline" },
			{ key: "processing", label: "Processing", icon: "time-outline" },
		];

		const getStepIndex = (currentStep: CheckoutStep) => {
			if (currentStep === "review") return 0;
			if (currentStep === "payment") return 1;
			return 2;
		};

		const currentIndex = getStepIndex(step);

		return (
			<View style={stepStyles.container}>
				{steps.map((s, index) => {
					const isCompleted = index < currentIndex;
					const isActive = index === currentIndex;

					return (
						<View key={s.key} style={stepStyles.stepWrapper}>
							<View style={stepStyles.stepItem}>
								<Animated.View
									entering={FadeIn.delay(index * 100)}
									style={[
										stepStyles.stepCircle,
										isCompleted && stepStyles.stepCircleCompleted,
										isActive && stepStyles.stepCircleActive,
									]}
								>
									{isCompleted ? (
										<Ionicons name="checkmark" size={16} color={theme.palette.common.white} />
									) : (
										<Ionicons
											name={s.icon as any}
											size={18}
											color={isActive ? theme.palette.common.white : theme.palette.text.disabled}
										/>
									)}
								</Animated.View>
								<Text
									style={[
										stepStyles.stepLabel,
										isActive && stepStyles.stepLabelActive,
										isCompleted && stepStyles.stepLabelCompleted,
									]}
								>
									{s.label}
								</Text>
							</View>
							{index < steps.length - 1 && (
								<View
									style={[
										stepStyles.stepLine,
										isCompleted && stepStyles.stepLineCompleted,
									]}
								/>
							)}
						</View>
					);
				})}
			</View>
		);
	};

	const stepStyles = StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			marginVertical: theme.spacing.lg,
			paddingHorizontal: theme.spacing.sm,
		},
		stepWrapper: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
		},
		stepItem: {
			alignItems: "center",
		},
		stepCircle: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.background.neutral,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 2,
			borderColor: theme.palette.divider,
		},
		stepCircleActive: {
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
		},
		stepCircleCompleted: {
			backgroundColor: theme.palette.success.main,
			borderColor: theme.palette.success.main,
		},
		stepLabel: {
			...theme.typography.caption,
			color: theme.palette.text.disabled,
			marginTop: theme.spacing.xs,
			fontSize: 11,
		},
		stepLabelActive: {
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		stepLabelCompleted: {
			color: theme.palette.success.main,
			fontWeight: "600",
		},
		stepLine: {
			flex: 1,
			height: 2,
			backgroundColor: theme.palette.divider,
			marginHorizontal: theme.spacing.xs,
			marginBottom: 32,
		},
		stepLineCompleted: {
			backgroundColor: theme.palette.success.main,
		},
	});

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
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.md,
			borderWidth: 2,
			borderColor: theme.palette.divider,
			marginBottom: theme.spacing.xs,
		},
		inputFocused: {
			borderColor: theme.palette.primary.main,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.primary.lighter + "10" : theme.palette.background.surface,
		},
		inputError: {
			borderColor: theme.palette.error.main,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.error.lighter + "15" : theme.palette.background.surface,
		},
		errorText: {
			...theme.typography.caption,
			color: theme.palette.error.main,
			marginBottom: theme.spacing.md,
			marginTop: -theme.spacing.xs,
		},
		inputLabel: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		inputHelper: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: -theme.spacing.xs,
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
			color: theme.palette.primary.main,
			fontWeight: "700",
			fontSize: 15,
		},
		currencySymbol: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			fontWeight: "500",
			marginRight: 2,
		},
		summaryRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
			alignItems: "center",
		},
		summaryLabel: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			fontSize: 15,
		},
		summaryValue: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "700",
			fontSize: 16,
		},
		totalRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: theme.spacing.lg,
			borderTopWidth: 2,
			borderTopColor: theme.palette.divider,
			marginTop: theme.spacing.md,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.primary.lighter + "08" : theme.palette.background.neutral,
			marginHorizontal: -theme.spacing.md,
			paddingHorizontal: theme.spacing.md,
			borderRadius: theme.borderRadius.md,
		},
		totalLabel: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		totalValue: {
			...theme.typography.h4,
			color: theme.palette.primary.main,
			fontWeight: "800",
		},
		paymentOption: {
			flexDirection: "row",
			alignItems: "center",
			padding: theme.spacing.lg,
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.lg,
			borderWidth: 2,
			marginBottom: theme.spacing.md,
			shadowColor: theme.palette.common.black,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.05,
			shadowRadius: 4,
			elevation: 2,
		},
		paymentOptionSelected: {
			borderColor: theme.palette.primary.main,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.primary.lighter + "15" : theme.palette.primary.darker + "20",
			shadowOpacity: 0.1,
			elevation: 4,
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
			backgroundColor: theme.palette.primary.lighter + "20",
		},
		radioButtonInner: {
			width: 12,
			height: 12,
			borderRadius: 6,
			backgroundColor: theme.palette.primary.main,
		},
		paymentOptionContent: {
			flex: 1,
		},
		paymentOptionText: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: 2,
		},
		paymentOptionDescription: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		paymentIcon: {
			width: 48,
			height: 48,
			borderRadius: theme.borderRadius.md,
			backgroundColor: theme.palette.background.neutral,
			alignItems: "center",
			justifyContent: "center",
			marginLeft: theme.spacing.sm,
		},
		processingContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
			paddingHorizontal: theme.spacing.lg,
		},
		processingIconContainer: {
			width: 120,
			height: 120,
			borderRadius: 60,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.success.lighter : theme.palette.success.darker + "30",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xl,
		},
		mpesaLogo: {
			fontSize: 64,
		},
		processingTitle: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "800",
			marginBottom: theme.spacing.md,
			textAlign: "center",
		},
		processingText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.sm,
			lineHeight: 22,
		},
		countdownContainer: {
			marginTop: theme.spacing.xl,
			padding: theme.spacing.lg,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.warning.lighter : theme.palette.warning.darker + "20",
			borderRadius: theme.borderRadius.lg,
			borderWidth: 1,
			borderColor: theme.palette.warning.light,
		},
		countdown: {
			...theme.typography.h4,
			color: theme.palette.warning.dark,
			fontWeight: "800",
			textAlign: "center",
		},
		countdownLabel: {
			...theme.typography.caption,
			color: theme.palette.warning.dark,
			textAlign: "center",
			marginTop: theme.spacing.xs,
			fontWeight: "600",
		},
		successContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
			paddingHorizontal: theme.spacing.lg,
		},
		successIconContainer: {
			width: 120,
			height: 120,
			borderRadius: 60,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.success.lighter : theme.palette.success.darker + "30",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xl,
			borderWidth: 4,
			borderColor: theme.palette.success.main,
		},
		successIcon: {
			fontSize: 64,
		},
		successTitle: {
			...theme.typography.h3,
			color: theme.palette.success.main,
			fontWeight: "800",
			marginBottom: theme.spacing.md,
			textAlign: "center",
		},
		successText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.sm,
			lineHeight: 22,
		},
		orderDetailsCard: {
			marginTop: theme.spacing.lg,
			padding: theme.spacing.lg,
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.lg,
			width: "100%",
			borderWidth: 1,
			borderColor: theme.palette.divider,
		},
		orderIdText: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "700",
			textAlign: "center",
			marginBottom: theme.spacing.xs,
		},
		receiptText: {
			...theme.typography.body2,
			color: theme.palette.success.dark,
			fontWeight: "600",
			textAlign: "center",
		},
		errorContainer: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
			paddingHorizontal: theme.spacing.lg,
		},
		errorIconContainer: {
			width: 120,
			height: 120,
			borderRadius: 60,
			backgroundColor: theme.palette.mode === "light" ? theme.palette.error.lighter : theme.palette.error.darker + "30",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xl,
			borderWidth: 4,
			borderColor: theme.palette.error.main,
		},
		errorIcon: {
			fontSize: 64,
		},
		errorTitle: {
			...theme.typography.h3,
			color: theme.palette.error.main,
			fontWeight: "800",
			marginBottom: theme.spacing.md,
			textAlign: "center",
		},
		errorText: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			marginBottom: theme.spacing.lg,
			lineHeight: 22,
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
						<TouchableOpacity
							onPress={() => {
								Haptics.selectionAsync();
								router.back();
							}}
							style={styles.backButton}
						>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Checkout</Text>
					</View>

					<StepIndicator />

					<ScrollView showsVerticalScrollIndicator={false}>
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Card style={styles.section}>
								<Text style={styles.sectionTitle}>Delivery Information</Text>

								<Text style={styles.inputLabel}>Delivery Address</Text>
								<TextInput
									style={[
										styles.input,
										styles.multilineInput,
										addressFocused && styles.inputFocused,
										addressError && styles.inputError,
									]}
									placeholder="Enter your complete delivery address"
									placeholderTextColor={theme.palette.text.disabled}
									value={deliveryAddress}
									onChangeText={(text) => {
										setDeliveryAddress(text);
										if (addressError) validateAddress(text);
									}}
									onFocus={() => {
										setAddressFocused(true);
										Haptics.selectionAsync();
									}}
									onBlur={() => {
										setAddressFocused(false);
										validateAddress(deliveryAddress);
									}}
									multiline
									numberOfLines={3}
								/>
								{addressError ? (
									<Animated.Text entering={SlideInRight.springify()} style={styles.errorText}>
										{addressError}
									</Animated.Text>
								) : (
									<Text style={styles.inputHelper}>Include landmarks for easier delivery</Text>
								)}

								<Text style={styles.inputLabel}>Delivery Notes (Optional)</Text>
								<TextInput
									style={[styles.input, styles.multilineInput]}
									placeholder="Any special instructions for delivery"
									placeholderTextColor={theme.palette.text.disabled}
									value={deliveryNotes}
									onChangeText={setDeliveryNotes}
									onFocus={() => Haptics.selectionAsync()}
									multiline
									numberOfLines={2}
								/>
								<Text style={styles.inputHelper}>e.g., Call before arrival, Leave at gate</Text>
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
										<View style={{ flexDirection: "row", alignItems: "baseline" }}>
											<Text style={styles.currencySymbol}>KES </Text>
											<Text style={styles.itemPrice}>
												{(item.unitPrice * item.quantity).toLocaleString("en-KE", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</Text>
										</View>
									</View>
								))}
							</Card>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<Card style={styles.section}>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Subtotal</Text>
									<View style={{ flexDirection: "row", alignItems: "baseline" }}>
										<Text style={styles.currencySymbol}>KES </Text>
										<Text style={styles.summaryValue}>
											{totalPrice.toLocaleString("en-KE", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Text>
									</View>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Delivery Fee</Text>
									<Text style={[styles.summaryValue, { color: theme.palette.success.main }]}>
										{deliveryFee === 0 ? "FREE" : `KES ${deliveryFee.toFixed(2)}`}
									</Text>
								</View>
								<View style={styles.totalRow}>
									<Text style={styles.totalLabel}>Total Amount</Text>
									<View style={{ flexDirection: "row", alignItems: "baseline" }}>
										<Text
											style={[
												styles.currencySymbol,
												{ color: theme.palette.primary.main, fontSize: 18, fontWeight: "700" },
											]}
										>
											KES{" "}
										</Text>
										<Text style={styles.totalValue}>
											{totalAmount.toLocaleString("en-KE", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Text>
									</View>
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
						<TouchableOpacity
							onPress={() => {
								Haptics.selectionAsync();
								setStep("review");
							}}
							style={styles.backButton}
						>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Checkout</Text>
					</View>

					<StepIndicator />

					<ScrollView showsVerticalScrollIndicator={false}>
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<Text style={styles.sectionTitle}>Select Payment Method</Text>

							<Pressable
								style={[
									styles.paymentOption,
									paymentMethod === "mpesa" ? styles.paymentOptionSelected : styles.paymentOptionUnselected,
								]}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setPaymentMethod("mpesa");
								}}
							>
								<View
									style={[
										styles.radioButton,
										paymentMethod === "mpesa" && styles.radioButtonSelected,
									]}
								>
									{paymentMethod === "mpesa" && <View style={styles.radioButtonInner} />}
								</View>
								<View style={styles.paymentOptionContent}>
									<Text style={styles.paymentOptionText}>M-Pesa</Text>
									<Text style={styles.paymentOptionDescription}>Pay instantly via M-Pesa STK Push</Text>
								</View>
								<View
									style={[
										styles.paymentIcon,
										paymentMethod === "mpesa" && { backgroundColor: theme.palette.success.lighter },
									]}
								>
									<Ionicons
										name="phone-portrait"
										size={24}
										color={paymentMethod === "mpesa" ? theme.palette.success.main : theme.palette.text.disabled}
									/>
								</View>
							</Pressable>

							<Pressable
								style={[
									styles.paymentOption,
									paymentMethod === "cash" ? styles.paymentOptionSelected : styles.paymentOptionUnselected,
								]}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setPaymentMethod("cash");
								}}
							>
								<View
									style={[
										styles.radioButton,
										paymentMethod === "cash" && styles.radioButtonSelected,
									]}
								>
									{paymentMethod === "cash" && <View style={styles.radioButtonInner} />}
								</View>
								<View style={styles.paymentOptionContent}>
									<Text style={styles.paymentOptionText}>Cash on Delivery</Text>
									<Text style={styles.paymentOptionDescription}>Pay when you receive your order</Text>
								</View>
								<View
									style={[
										styles.paymentIcon,
										paymentMethod === "cash" && { backgroundColor: theme.palette.secondary.lighter },
									]}
								>
									<Ionicons
										name="cash"
										size={24}
										color={paymentMethod === "cash" ? theme.palette.secondary.main : theme.palette.text.disabled}
									/>
								</View>
							</Pressable>
						</Animated.View>

						{paymentMethod === "mpesa" && (
							<Animated.View entering={FadeInDown.springify()} style={styles.section}>
								<Card>
									<Text style={styles.sectionTitle}>M-Pesa Details</Text>

									<Text style={styles.inputLabel}>Phone Number</Text>
									<TextInput
										style={[
											styles.input,
											phoneFocused && styles.inputFocused,
											phoneError && styles.inputError,
										]}
										placeholder="0712345678 or +254712345678"
										placeholderTextColor={theme.palette.text.disabled}
										value={phoneNumber}
										onChangeText={(text) => {
											setPhoneNumber(text);
											if (phoneError) validatePhone(text);
										}}
										onFocus={() => {
											setPhoneFocused(true);
											Haptics.selectionAsync();
										}}
										onBlur={() => {
											setPhoneFocused(false);
											if (phoneNumber) validatePhone(phoneNumber);
										}}
										keyboardType="phone-pad"
										maxLength={13}
									/>
									{phoneError ? (
										<Animated.Text entering={SlideInRight.springify()} style={styles.errorText}>
											{phoneError}
										</Animated.Text>
									) : (
										<Text style={styles.inputHelper}>
											You will receive an M-Pesa prompt to enter your PIN
										</Text>
									)}
								</Card>
							</Animated.View>
						)}

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Card style={styles.section}>
								<View style={styles.totalRow}>
									<Text style={styles.totalLabel}>Amount to Pay</Text>
									<View style={{ flexDirection: "row", alignItems: "baseline" }}>
										<Text
											style={[
												styles.currencySymbol,
												{ color: theme.palette.primary.main, fontSize: 18, fontWeight: "700" },
											]}
										>
											KES{" "}
										</Text>
										<Text style={styles.totalValue}>
											{totalAmount.toLocaleString("en-KE", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</Text>
									</View>
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

		// Pulsing animation for the processing icon
		const PulsingIcon = () => {
			const scale = useSharedValue(1);
			const opacity = useSharedValue(1);

			React.useEffect(() => {
				scale.value = withRepeat(
					withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 800 })),
					-1,
					false,
				);
				opacity.value = withRepeat(
					withSequence(withTiming(0.6, { duration: 800 }), withTiming(1, { duration: 800 })),
					-1,
					false,
				);
			}, []);

			const animatedStyle = useAnimatedStyle(() => ({
				transform: [{ scale: scale.value }],
				opacity: opacity.value,
			}));

			return (
				<Animated.View style={[styles.processingIconContainer, animatedStyle]}>
					<Ionicons name="phone-portrait" size={56} color={theme.palette.success.main} />
				</Animated.View>
			);
		};

		return (
			<SafeArea>
				<Container>
					<Animated.View entering={FadeIn.duration(400)} style={styles.processingContainer}>
						<PulsingIcon />

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Text style={styles.processingTitle}>Processing Payment</Text>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<View
								style={{
									backgroundColor: theme.palette.background.paper,
									borderRadius: theme.borderRadius.lg,
									padding: theme.spacing.lg,
									marginTop: theme.spacing.xl,
									borderWidth: 1,
									borderColor: theme.palette.divider,
								}}
							>
								<View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
									<View
										style={{
											width: 32,
											height: 32,
											borderRadius: 16,
											backgroundColor: theme.palette.info.lighter,
											alignItems: "center",
											justifyContent: "center",
											marginRight: theme.spacing.sm,
										}}
									>
										<Ionicons name="information" size={18} color={theme.palette.info.main} />
									</View>
									<Text style={[theme.typography.subtitle2, { color: theme.palette.text.primary, flex: 1 }]}>
										Check your phone
									</Text>
								</View>
								<Text style={styles.processingText}>1. You will receive an M-Pesa prompt</Text>
								<Text style={styles.processingText}>2. Enter your M-Pesa PIN</Text>
								<Text style={styles.processingText}>3. Confirm the payment</Text>
							</View>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(400).springify()} style={styles.countdownContainer}>
							<Ionicons name="timer-outline" size={24} color={theme.palette.warning.dark} />
							<Text style={styles.countdown}>
								{minutes}:{seconds.toString().padStart(2, "0")}
							</Text>
							<Text style={styles.countdownLabel}>Time remaining</Text>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(500).springify()} style={{ marginTop: theme.spacing.xl }}>
							<ActivityIndicator size="large" color={theme.palette.primary.main} />
						</Animated.View>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	if (step === "success") {
		// Success animation
		const SuccessIcon = () => {
			const scale = useSharedValue(0);
			const rotation = useSharedValue(0);

			React.useEffect(() => {
				scale.value = withSpring(1, { damping: 8, stiffness: 100 });
				rotation.value = withSequence(
					withTiming(10, { duration: 100 }),
					withTiming(-10, { duration: 100 }),
					withTiming(0, { duration: 100 }),
				);
			}, []);

			const animatedStyle = useAnimatedStyle(() => ({
				transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
			}));

			return (
				<Animated.View style={[styles.successIconContainer, animatedStyle]}>
					<Ionicons name="checkmark-circle" size={72} color={theme.palette.success.main} />
				</Animated.View>
			);
		};

		return (
			<SafeArea>
				<Container>
					<Animated.View entering={FadeIn.duration(300)} style={styles.successContainer}>
						<SuccessIcon />

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Text style={styles.successTitle}>
								{paymentMethod === "mpesa" ? "Payment Successful!" : "Order Placed!"}
							</Text>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<Text style={styles.successText}>Your order has been confirmed and is being processed</Text>
						</Animated.View>

						{orderId && (
							<Animated.View entering={FadeInUp.delay(400).springify()} style={styles.orderDetailsCard}>
								<View style={{ alignItems: "center", marginBottom: theme.spacing.md }}>
									<Ionicons name="receipt-outline" size={32} color={theme.palette.primary.main} />
								</View>
								<Text style={styles.orderIdText}>Order #{orderId.slice(-8).toUpperCase()}</Text>
								{mpesaReceiptNumber && (
									<Text style={styles.receiptText}>M-Pesa Receipt: {mpesaReceiptNumber}</Text>
								)}
								<View
									style={{
										marginTop: theme.spacing.md,
										paddingTop: theme.spacing.md,
										borderTopWidth: 1,
										borderTopColor: theme.palette.divider,
									}}
								>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Text style={[theme.typography.body2, { color: theme.palette.text.secondary }]}>
											Total Amount
										</Text>
										<View style={{ flexDirection: "row", alignItems: "baseline" }}>
											<Text
												style={[
													theme.typography.caption,
													{ color: theme.palette.primary.main, fontWeight: "600" },
												]}
											>
												KES{" "}
											</Text>
											<Text
												style={[
													theme.typography.h6,
													{ color: theme.palette.primary.main, fontWeight: "800" },
												]}
											>
												{totalAmount.toLocaleString("en-KE", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</Text>
										</View>
									</View>
								</View>
							</Animated.View>
						)}

						<Animated.View
							entering={FadeInUp.delay(500).springify()}
							style={[styles.buttonRow, { marginTop: theme.spacing.xxl, width: "100%" }]}
						>
							<Button
								title="Track Order"
								variant="gradient"
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
									handleTrackOrder();
								}}
								style={{ flex: 1 }}
								icon={<Ionicons name="location-outline" size={18} color={theme.palette.common.white} />}
							/>
							<Button
								title="View Orders"
								variant="outlined"
								onPress={() => {
									Haptics.selectionAsync();
									handleGoToOrders();
								}}
								style={{ flex: 1 }}
							/>
						</Animated.View>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	if (step === "error") {
		// Error animation
		const ErrorIcon = () => {
			const shake = useSharedValue(0);

			React.useEffect(() => {
				shake.value = withSequence(
					withTiming(10, { duration: 50 }),
					withTiming(-10, { duration: 50 }),
					withTiming(10, { duration: 50 }),
					withTiming(-10, { duration: 50 }),
					withTiming(0, { duration: 50 }),
				);
			}, []);

			const animatedStyle = useAnimatedStyle(() => ({
				transform: [{ translateX: shake.value }],
			}));

			return (
				<Animated.View style={[styles.errorIconContainer, animatedStyle]}>
					<Ionicons name="close-circle" size={72} color={theme.palette.error.main} />
				</Animated.View>
			);
		};

		return (
			<SafeArea>
				<Container>
					<Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
						<ErrorIcon />

						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<Text style={styles.errorTitle}>
								{paymentMethod === "mpesa" ? "Payment Failed" : "Order Failed"}
							</Text>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<View
								style={{
									backgroundColor: theme.palette.background.paper,
									borderRadius: theme.borderRadius.lg,
									padding: theme.spacing.lg,
									marginTop: theme.spacing.lg,
									borderWidth: 1,
									borderColor: theme.palette.error.light,
									borderLeftWidth: 4,
									borderLeftColor: theme.palette.error.main,
								}}
							>
								<View style={{ flexDirection: "row", alignItems: "flex-start" }}>
									<Ionicons
										name="alert-circle"
										size={24}
										color={theme.palette.error.main}
										style={{ marginRight: theme.spacing.sm, marginTop: 2 }}
									/>
									<Text style={[styles.errorText, { flex: 1, marginBottom: 0 }]}>
										{errorMessage || "An unexpected error occurred. Please try again."}
									</Text>
								</View>
							</View>
						</Animated.View>

						<Animated.View
							entering={FadeInUp.delay(400).springify()}
							style={[styles.buttonRow, { width: "100%" }]}
						>
							<Button
								title="Retry"
								variant="gradient"
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
									handleRetryPayment();
								}}
								style={{ flex: 1 }}
								icon={<Ionicons name="refresh" size={18} color={theme.palette.common.white} />}
							/>
							<Button
								title="Cancel"
								variant="outlined"
								onPress={() => {
									Haptics.selectionAsync();
									handleCancelOrder();
								}}
								style={{ flex: 1 }}
							/>
						</Animated.View>
					</Animated.View>
				</Container>
			</SafeArea>
		);
	}

	return null;
};

export default CheckoutScreen;
