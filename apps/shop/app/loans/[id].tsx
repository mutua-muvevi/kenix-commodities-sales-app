import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { loanApi, Loan } from "../../store/api/loan-api";
import { validatePhoneNumber } from "../../services/mpesa";
import Toast from "react-native-toast-message";

const LoanDetailsScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const { user, accessToken } = useAuth();

	const [loading, setLoading] = useState(true);
	const [loan, setLoan] = useState<Loan | null>(null);
	const [showRepayment, setShowRepayment] = useState(false);
	const [repaymentAmount, setRepaymentAmount] = useState("");
	const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		fetchLoanDetails();
	}, []);

	const fetchLoanDetails = async () => {
		if (!accessToken || !id) {
			setLoading(false);
			return;
		}

		try {
			const loanData = await loanApi.getLoanById(id as string, accessToken);
			setLoan(loanData);
			setRepaymentAmount((loanData.amountDue || 0).toString());
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to load loan details",
			});
			router.back();
		} finally {
			setLoading(false);
		}
	};

	const handleRepayment = async () => {
		if (!accessToken || !loan) return;

		const amount = parseFloat(repaymentAmount);

		if (!amount || amount <= 0) {
			Alert.alert("Invalid Amount", "Please enter a valid repayment amount");
			return;
		}

		if (amount > (loan.amountDue || 0)) {
			Alert.alert(
				"Amount Too High",
				`You cannot pay more than the outstanding amount (KSh ${loan.amountDue?.toLocaleString()})`,
			);
			return;
		}

		if (!validatePhoneNumber(phoneNumber)) {
			Alert.alert("Invalid Phone Number", "Please enter a valid Kenya phone number (e.g., 0712345678)");
			return;
		}

		Alert.alert(
			"Confirm Repayment",
			`Pay KSh ${amount.toLocaleString()} via M-Pesa?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Confirm",
					onPress: async () => {
						setProcessing(true);
						try {
							await loanApi.repayLoan(
								{
									loanId: loan.loanId,
									amount,
									phoneNumber,
								},
								accessToken,
							);

							Toast.show({
								type: "success",
								text1: "Payment Initiated",
								text2: "Check your phone for M-Pesa prompt",
							});

							setShowRepayment(false);
							setTimeout(() => {
								fetchLoanDetails();
							}, 2000);
						} catch (error: any) {
							Toast.show({
								type: "error",
								text1: "Error",
								text2: error.message || "Failed to initiate payment",
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
			case "approved":
			case "active":
				return theme.palette.primary.main;
			case "paid":
				return theme.palette.success.main;
			case "defaulted":
				return theme.palette.error.main;
			default:
				return theme.palette.text.secondary;
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "pending":
				return "Pending Approval";
			case "approved":
				return "Approved";
			case "active":
				return "Active";
			case "paid":
				return "Fully Paid";
			case "defaulted":
				return "Defaulted";
			default:
				return status;
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
		statusBadge: {
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.radius.md,
			alignSelf: "flex-start",
			marginBottom: theme.spacing.lg,
		},
		statusText: {
			...theme.typography.subtitle2,
			color: "#fff",
			fontWeight: "600",
		},
		amountCard: {
			backgroundColor: `${theme.palette.primary.main}15`,
			marginBottom: theme.spacing.lg,
		},
		amountLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.xs,
		},
		amountValue: {
			...theme.typography.h3,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		detailRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
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
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginTop: theme.spacing.lg,
			marginBottom: theme.spacing.md,
		},
		progressContainer: {
			marginTop: theme.spacing.md,
		},
		progressBar: {
			height: 12,
			backgroundColor: theme.palette.divider,
			borderRadius: 6,
			overflow: "hidden",
			marginBottom: theme.spacing.sm,
		},
		progressFill: {
			height: "100%",
			backgroundColor: theme.palette.success.main,
		},
		progressText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
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
		scheduleItem: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		scheduleInstallment: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		scheduleDate: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		scheduleAmount: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		paidBadge: {
			backgroundColor: theme.palette.success.main,
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: 2,
			borderRadius: 4,
			marginLeft: theme.spacing.sm,
		},
		paidText: {
			...theme.typography.caption,
			color: "#fff",
			fontWeight: "600",
		},
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
	});

	if (loading) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Loan Details</Text>
					</View>
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.palette.primary.main} />
					</View>
				</Container>
			</SafeArea>
		);
	}

	if (!loan) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Loan Details</Text>
					</View>
					<Text style={{ textAlign: "center", marginTop: theme.spacing.xxl }}>Loan not found</Text>
				</Container>
			</SafeArea>
		);
	}

	const progressPercentage = ((loan.amountPaid || 0) / (loan.amountDue || 1)) * 100;

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<Text style={styles.title}>Loan Details</Text>
				</View>

				<ScrollView showsVerticalScrollIndicator={false}>
					<Animated.View entering={FadeInUp.springify()}>
						<View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) }]}>
							<Text style={styles.statusText}>{getStatusLabel(loan.status)}</Text>
						</View>
					</Animated.View>

					{/* Loan Amount */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<Card style={styles.amountCard}>
							<Text style={styles.amountLabel}>Loan Amount</Text>
							<Text style={styles.amountValue}>KSh {loan.amount.toLocaleString()}</Text>
						</Card>
					</Animated.View>

					{/* Loan Details */}
					<Animated.View entering={FadeInUp.delay(200).springify()}>
						<Card>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Loan ID</Text>
								<Text style={styles.detailValue}>{loan.loanId}</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Purpose</Text>
								<Text style={styles.detailValue}>{loan.purpose}</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Interest Rate</Text>
								<Text style={styles.detailValue}>{loan.interestRate}% per month</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Duration</Text>
								<Text style={styles.detailValue}>{loan.duration} months</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Due Date</Text>
								<Text style={styles.detailValue}>
									{new Date(loan.dueDate).toLocaleDateString()}
								</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Amount Paid</Text>
								<Text style={[styles.detailValue, { color: theme.palette.success.main }]}>
									KSh {(loan.amountPaid || 0).toLocaleString()}
								</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Outstanding Amount</Text>
								<Text style={[styles.detailValue, { color: theme.palette.error.main }]}>
									KSh {(loan.amountDue || 0).toLocaleString()}
								</Text>
							</View>

							{/* Progress Bar */}
							<View style={styles.progressContainer}>
								<View style={styles.progressBar}>
									<View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
								</View>
								<Text style={styles.progressText}>
									{Math.round(progressPercentage)}% repaid
								</Text>
							</View>
						</Card>
					</Animated.View>

					{/* Repayment Form */}
					{loan.status === "active" && (loan.amountDue || 0) > 0 && !showRepayment && (
						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<Button
								title="Make Repayment"
								variant="gradient"
								fullWidth
								onPress={() => setShowRepayment(true)}
								style={{ marginTop: theme.spacing.lg }}
								icon={<Ionicons name="cash-outline" size={20} color="#fff" />}
							/>
						</Animated.View>
					)}

					{showRepayment && (
						<Animated.View entering={FadeInDown.springify()}>
							<Card style={{ marginTop: theme.spacing.lg }}>
								<Text style={styles.sectionTitle}>Make Repayment</Text>
								<Text style={[theme.typography.caption, { color: theme.palette.text.secondary }]}>
									Amount (KSh)
								</Text>
								<TextInput
									style={styles.input}
									placeholder="Enter amount"
									placeholderTextColor={theme.palette.text.disabled}
									value={repaymentAmount}
									onChangeText={setRepaymentAmount}
									keyboardType="numeric"
								/>
								<Text style={[theme.typography.caption, { color: theme.palette.text.secondary }]}>
									M-Pesa Phone Number
								</Text>
								<TextInput
									style={styles.input}
									placeholder="e.g., 0712345678"
									placeholderTextColor={theme.palette.text.disabled}
									value={phoneNumber}
									onChangeText={setPhoneNumber}
									keyboardType="phone-pad"
								/>
								<View style={{ flexDirection: "row", gap: theme.spacing.md }}>
									<Button
										title="Cancel"
										variant="outlined"
										onPress={() => setShowRepayment(false)}
										style={{ flex: 1 }}
									/>
									<Button
										title={processing ? "Processing..." : "Pay Now"}
										variant="gradient"
										onPress={handleRepayment}
										disabled={processing}
										style={{ flex: 1 }}
									/>
								</View>
							</Card>
						</Animated.View>
					)}

					{/* Repayment Schedule */}
					{loan.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
						<Animated.View entering={FadeInUp.delay(400).springify()}>
							<Text style={styles.sectionTitle}>Repayment Schedule</Text>
							<Card>
								{loan.repaymentSchedule.map((schedule, index) => (
									<View key={index} style={styles.scheduleItem}>
										<View style={{ flex: 1 }}>
											<Text style={styles.scheduleInstallment}>
												Installment {schedule.installmentNumber}
											</Text>
											<Text style={styles.scheduleDate}>
												Due: {new Date(schedule.dueDate).toLocaleDateString()}
											</Text>
										</View>
										<View style={{ flexDirection: "row", alignItems: "center" }}>
											<Text style={styles.scheduleAmount}>
												KSh {schedule.amount.toLocaleString()}
											</Text>
											{schedule.paid && (
												<View style={styles.paidBadge}>
													<Text style={styles.paidText}>PAID</Text>
												</View>
											)}
										</View>
									</View>
								))}
							</Card>
						</Animated.View>
					)}
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default LoanDetailsScreen;
