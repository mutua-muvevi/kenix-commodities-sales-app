import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	RefreshControl,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { airtimeApi, AirtimeTransaction } from "../../store/api/airtime-api";
import { validatePhoneNumber } from "../../services/mpesa";
import Toast from "react-native-toast-message";

type ServiceType = "buy" | "sell";
type Provider = "Safaricom" | "Airtel";

const AirtimeScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { user, accessToken } = useAuth();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [serviceType, setServiceType] = useState<ServiceType>("buy");
	const [provider, setProvider] = useState<Provider>("Safaricom");
	const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
	const [amount, setAmount] = useState("");
	const [transactions, setTransactions] = useState<AirtimeTransaction[]>([]);

	const quickAmounts = [50, 100, 200, 500, 1000];

	useEffect(() => {
		fetchTransactions();
	}, []);

	const fetchTransactions = async () => {
		if (!accessToken || !user?._id) {
			setLoading(false);
			return;
		}

		try {
			const result = await airtimeApi.getShopTransactions(user._id, accessToken);
			setTransactions(result.transactions);
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to load transactions",
			});
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleRefresh = () => {
		setRefreshing(true);
		fetchTransactions();
	};

	const handleSubmit = async () => {
		if (!accessToken) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Please log in to continue",
			});
			return;
		}

		const airtimeAmount = parseFloat(amount);

		if (!airtimeAmount || airtimeAmount <= 0) {
			Alert.alert("Invalid Amount", "Please enter a valid amount");
			return;
		}

		if (airtimeAmount < 10) {
			Alert.alert("Amount Too Low", "Minimum amount is KSh 10");
			return;
		}

		if (!validatePhoneNumber(phoneNumber)) {
			Alert.alert("Invalid Phone Number", "Please enter a valid Kenya phone number (e.g., 0712345678)");
			return;
		}

		Alert.alert(
			`Confirm ${serviceType === "buy" ? "Purchase" : "Sale"}`,
			`${serviceType === "buy" ? "Buy" : "Sell"} KSh ${airtimeAmount} ${provider} airtime ${
				serviceType === "buy" ? "for" : "from"
			} ${phoneNumber}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Confirm",
					onPress: async () => {
						setProcessing(true);
						try {
							const transaction =
								serviceType === "buy"
									? await airtimeApi.buyAirtime(
											{ phoneNumber, amount: airtimeAmount, provider },
											accessToken,
									  )
									: await airtimeApi.sellAirtime(
											{ phoneNumber, amount: airtimeAmount, provider },
											accessToken,
									  );

							Toast.show({
								type: "success",
								text1: "Success",
								text2: `Airtime ${serviceType === "buy" ? "purchase" : "sale"} initiated. Check your phone for M-Pesa prompt.`,
							});

							setAmount("");
							setTimeout(() => {
								fetchTransactions();
							}, 2000);
						} catch (error: any) {
							Toast.show({
								type: "error",
								text1: "Error",
								text2: error.message || `Failed to ${serviceType} airtime`,
							});
						} finally {
							setProcessing(false);
						}
					},
				},
			],
		);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return theme.palette.warning.main;
			case "success":
				return theme.palette.success.main;
			case "failed":
				return theme.palette.error.main;
			default:
				return theme.palette.text.secondary;
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
		tabContainer: {
			flexDirection: "row",
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.md,
			padding: 4,
			marginBottom: theme.spacing.lg,
		},
		tab: {
			flex: 1,
			paddingVertical: theme.spacing.sm,
			alignItems: "center",
			borderRadius: theme.borderRadius.sm,
		},
		tabActive: {
			backgroundColor: theme.palette.primary.main,
		},
		tabText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			fontWeight: "600",
		},
		tabTextActive: {
			color: "#fff",
		},
		providerContainer: {
			flexDirection: "row",
			gap: theme.spacing.md,
			marginBottom: theme.spacing.lg,
		},
		providerButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: theme.spacing.md,
			borderRadius: theme.borderRadius.md,
			borderWidth: 2,
			borderColor: theme.palette.divider,
			backgroundColor: theme.palette.background.surface,
		},
		providerButtonActive: {
			borderColor: theme.palette.primary.main,
			backgroundColor: `${theme.palette.primary.main}15`,
		},
		providerText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			fontWeight: "600",
			marginLeft: theme.spacing.sm,
		},
		providerTextActive: {
			color: theme.palette.primary.main,
		},
		inputLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.xs,
		},
		input: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.md,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			marginBottom: theme.spacing.md,
		},
		quickAmountsContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: theme.spacing.sm,
			marginTop: theme.spacing.sm,
			marginBottom: theme.spacing.lg,
		},
		quickAmountButton: {
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.lg,
			borderRadius: theme.borderRadius.md,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			backgroundColor: theme.palette.background.surface,
		},
		quickAmountText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginTop: theme.spacing.lg,
			marginBottom: theme.spacing.md,
		},
		transactionCard: {
			marginBottom: theme.spacing.md,
		},
		transactionHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		transactionType: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		statusBadge: {
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.borderRadius.sm,
		},
		statusText: {
			...theme.typography.caption,
			color: "#fff",
			fontWeight: "600",
		},
		transactionDetail: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.xs,
		},
		transactionLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		transactionValue: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		emptyIcon: {
			fontSize: 64,
			marginBottom: theme.spacing.lg,
		},
		emptyText: {
			...theme.typography.body1,
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

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<Text style={styles.title}>Airtime Services</Text>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				>
					{/* Service Type Tabs */}
					<Animated.View entering={FadeInUp.springify()}>
						<View style={styles.tabContainer}>
							<TouchableOpacity
								style={[styles.tab, serviceType === "buy" && styles.tabActive]}
								onPress={() => setServiceType("buy")}
							>
								<Text style={[styles.tabText, serviceType === "buy" && styles.tabTextActive]}>
									Buy Airtime
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, serviceType === "sell" && styles.tabActive]}
								onPress={() => setServiceType("sell")}
							>
								<Text style={[styles.tabText, serviceType === "sell" && styles.tabTextActive]}>
									Sell Airtime
								</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>

					{/* Form Card */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<Card>
							{/* Provider Selection */}
							<Text style={styles.inputLabel}>Select Provider</Text>
							<View style={styles.providerContainer}>
								<TouchableOpacity
									style={[
										styles.providerButton,
										provider === "Safaricom" && styles.providerButtonActive,
									]}
									onPress={() => setProvider("Safaricom")}
								>
									<Text style={{ fontSize: 24 }}>📱</Text>
									<Text
										style={[
											styles.providerText,
											provider === "Safaricom" && styles.providerTextActive,
										]}
									>
										Safaricom
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.providerButton,
										provider === "Airtel" && styles.providerButtonActive,
									]}
									onPress={() => setProvider("Airtel")}
								>
									<Text style={{ fontSize: 24 }}>📞</Text>
									<Text
										style={[styles.providerText, provider === "Airtel" && styles.providerTextActive]}
									>
										Airtel
									</Text>
								</TouchableOpacity>
							</View>

							{/* Phone Number */}
							<Text style={styles.inputLabel}>Phone Number</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 0712345678"
								placeholderTextColor={theme.palette.text.disabled}
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								keyboardType="phone-pad"
							/>

							{/* Amount */}
							<Text style={styles.inputLabel}>Amount (KSh)</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter amount"
								placeholderTextColor={theme.palette.text.disabled}
								value={amount}
								onChangeText={setAmount}
								keyboardType="numeric"
							/>

							{/* Quick Amounts */}
							<View style={styles.quickAmountsContainer}>
								{quickAmounts.map((quickAmount) => (
									<TouchableOpacity
										key={quickAmount}
										style={styles.quickAmountButton}
										onPress={() => setAmount(quickAmount.toString())}
									>
										<Text style={styles.quickAmountText}>KSh {quickAmount}</Text>
									</TouchableOpacity>
								))}
							</View>

							<Button
								title={
									processing
										? "Processing..."
										: serviceType === "buy"
										? "Buy Airtime"
										: "Sell Airtime"
								}
								variant="gradient"
								fullWidth
								onPress={handleSubmit}
								disabled={processing || !amount || !phoneNumber}
								icon={
									<Ionicons
										name={serviceType === "buy" ? "cart-outline" : "cash-outline"}
										size={20}
										color="#fff"
									/>
								}
							/>
						</Card>
					</Animated.View>

					{/* Transaction History */}
					<Text style={styles.sectionTitle}>Recent Transactions</Text>

					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={theme.palette.primary.main} />
						</View>
					) : transactions.length > 0 ? (
						transactions.map((transaction, index) => (
							<Animated.View key={transaction._id} entering={FadeInDown.delay(index * 50).springify()}>
								<Card style={styles.transactionCard}>
									<View style={styles.transactionHeader}>
										<Text style={styles.transactionType}>
											{transaction.type === "buy" ? "Airtime Purchase" : "Airtime Sale"}
										</Text>
										<View
											style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}
										>
											<Text style={styles.statusText}>
												{transaction.status.toUpperCase()}
											</Text>
										</View>
									</View>

									<View style={styles.transactionDetail}>
										<Text style={styles.transactionLabel}>Provider</Text>
										<Text style={styles.transactionValue}>{transaction.provider}</Text>
									</View>
									<View style={styles.transactionDetail}>
										<Text style={styles.transactionLabel}>Phone Number</Text>
										<Text style={styles.transactionValue}>{transaction.phoneNumber}</Text>
									</View>
									<View style={styles.transactionDetail}>
										<Text style={styles.transactionLabel}>Amount</Text>
										<Text style={[styles.transactionValue, { color: theme.palette.primary.main }]}>
											KSh {transaction.amount.toLocaleString()}
										</Text>
									</View>
									<View style={styles.transactionDetail}>
										<Text style={styles.transactionLabel}>Date</Text>
										<Text style={styles.transactionValue}>
											{new Date(transaction.createdAt).toLocaleString()}
										</Text>
									</View>
									{transaction.mpesaReceiptNumber && (
										<View style={styles.transactionDetail}>
											<Text style={styles.transactionLabel}>Receipt</Text>
											<Text style={styles.transactionValue}>{transaction.mpesaReceiptNumber}</Text>
										</View>
									)}
								</Card>
							</Animated.View>
						))
					) : (
						<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
							<Text style={styles.emptyIcon}>📱</Text>
							<Text style={styles.emptyText}>
								No transactions yet.
								{"\n"}
								{serviceType === "buy" ? "Buy" : "Sell"} your first airtime above.
							</Text>
						</Animated.View>
					)}
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default AirtimeScreen;
