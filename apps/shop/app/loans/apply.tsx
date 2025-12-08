import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { loanApi } from "../../store/api/loan-api";
import Toast from "react-native-toast-message";

const ApplyLoanScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { user, accessToken } = useAuth();

	const [loading, setLoading] = useState(false);
	const [eligibility, setEligibility] = useState<any>(null);
	const [amount, setAmount] = useState("");
	const [duration, setDuration] = useState("3");
	const [purpose, setPurpose] = useState("");

	const durations = [1, 2, 3, 6, 12]; // months

	useEffect(() => {
		fetchEligibility();
	}, []);

	const fetchEligibility = async () => {
		if (!accessToken || !user?._id) return;

		try {
			const eligibilityRes = await loanApi.checkEligibility(user._id, accessToken);
			setEligibility(eligibilityRes);

			if (!eligibilityRes.eligible) {
				Alert.alert(
					"Not Eligible",
					eligibilityRes.reason || "You are not eligible for a loan at this time",
					[{ text: "OK", onPress: () => router.back() }],
				);
			}
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to check eligibility",
			});
			router.back();
		}
	};

	const calculateMonthlyPayment = () => {
		const principal = parseFloat(amount) || 0;
		const months = parseInt(duration) || 1;
		const rate = (eligibility?.interestRate || 0) / 100;

		const totalInterest = principal * rate * months;
		const totalAmount = principal + totalInterest;
		const monthlyPayment = totalAmount / months;

		return {
			monthlyPayment,
			totalInterest,
			totalAmount,
		};
	};

	const handleApply = async () => {
		if (!accessToken) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Please log in to apply for a loan",
			});
			return;
		}

		const loanAmount = parseFloat(amount);

		if (!loanAmount || loanAmount <= 0) {
			Alert.alert("Invalid Amount", "Please enter a valid loan amount");
			return;
		}

		if (loanAmount > (eligibility?.maxAmount || 0)) {
			Alert.alert(
				"Amount Too High",
				`Maximum loan amount is KSh ${eligibility?.maxAmount?.toLocaleString()}`,
			);
			return;
		}

		if (!purpose.trim()) {
			Alert.alert("Missing Information", "Please enter the purpose of the loan");
			return;
		}

		setLoading(true);

		try {
			const loan = await loanApi.applyForLoan(
				{
					amount: loanAmount,
					purpose: purpose.trim(),
					duration: parseInt(duration),
				},
				accessToken,
			);

			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Loan application submitted successfully",
			});

			router.replace(`/loans/${loan.loanId}`);
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to submit loan application",
			});
		} finally {
			setLoading(false);
		}
	};

	const { monthlyPayment, totalInterest, totalAmount } = calculateMonthlyPayment();

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
			minHeight: 100,
			textAlignVertical: "top",
		},
		inputLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.xs,
		},
		inputHint: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: -theme.spacing.sm,
			marginBottom: theme.spacing.md,
		},
		durationContainer: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: theme.spacing.sm,
			marginTop: theme.spacing.sm,
		},
		durationButton: {
			paddingVertical: theme.spacing.sm,
			paddingHorizontal: theme.spacing.lg,
			borderRadius: theme.radius.md,
			borderWidth: 2,
			borderColor: theme.palette.divider,
			backgroundColor: theme.palette.background.surface,
		},
		durationButtonActive: {
			borderColor: theme.palette.primary.main,
			backgroundColor: `${theme.palette.primary.main}15`,
		},
		durationText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		durationTextActive: {
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		summaryCard: {
			backgroundColor: `${theme.palette.primary.main}10`,
		},
		summaryRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
		},
		summaryLabel: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		summaryValue: {
			...theme.typography.body2,
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
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		totalValue: {
			...theme.typography.subtitle1,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
	});

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
					</TouchableOpacity>
					<Text style={styles.title}>Apply for Loan</Text>
				</View>

				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Loan Amount */}
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Loan Amount</Text>
							<Text style={styles.inputLabel}>How much do you need? (KSh)</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g., 50000"
								placeholderTextColor={theme.palette.text.disabled}
								value={amount}
								onChangeText={setAmount}
								keyboardType="numeric"
							/>
							<Text style={styles.inputHint}>
								Maximum: KSh {eligibility?.maxAmount?.toLocaleString() || "0"}
							</Text>
						</Card>
					</Animated.View>

					{/* Duration */}
					<Animated.View entering={FadeInUp.delay(200).springify()}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Repayment Period</Text>
							<Text style={styles.inputLabel}>Select duration (months)</Text>
							<View style={styles.durationContainer}>
								{durations.map((d) => (
									<TouchableOpacity
										key={d}
										style={[
											styles.durationButton,
											duration === d.toString() && styles.durationButtonActive,
										]}
										onPress={() => setDuration(d.toString())}
										disabled={d > (eligibility?.maxDuration || 12)}
									>
										<Text
											style={[
												styles.durationText,
												duration === d.toString() && styles.durationTextActive,
											]}
										>
											{d} {d === 1 ? "month" : "months"}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</Card>
					</Animated.View>

					{/* Purpose */}
					<Animated.View entering={FadeInUp.delay(300).springify()}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Purpose of Loan</Text>
							<Text style={styles.inputLabel}>What will you use this loan for?</Text>
							<TextInput
								style={[styles.input, styles.multilineInput]}
								placeholder="e.g., Stock purchase, equipment, expansion..."
								placeholderTextColor={theme.palette.text.disabled}
								value={purpose}
								onChangeText={setPurpose}
								multiline
							/>
						</Card>
					</Animated.View>

					{/* Summary */}
					{parseFloat(amount) > 0 && (
						<Animated.View entering={FadeInUp.delay(400).springify()}>
							<Card style={[styles.section, styles.summaryCard]}>
								<Text style={styles.sectionTitle}>Loan Summary</Text>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Loan Amount</Text>
									<Text style={styles.summaryValue}>KSh {parseFloat(amount).toLocaleString()}</Text>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Interest Rate</Text>
									<Text style={styles.summaryValue}>{eligibility?.interestRate || 0}% per month</Text>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Duration</Text>
									<Text style={styles.summaryValue}>{duration} months</Text>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Total Interest</Text>
									<Text style={styles.summaryValue}>KSh {totalInterest.toLocaleString()}</Text>
								</View>
								<View style={styles.totalRow}>
									<Text style={styles.totalLabel}>Total Repayment</Text>
									<Text style={styles.totalValue}>KSh {totalAmount.toLocaleString()}</Text>
								</View>
								<View style={styles.summaryRow}>
									<Text style={styles.summaryLabel}>Monthly Payment</Text>
									<Text style={styles.summaryValue}>KSh {monthlyPayment.toLocaleString()}</Text>
								</View>
							</Card>
						</Animated.View>
					)}

					<Button
						title={loading ? "Submitting..." : "Submit Application"}
						variant="gradient"
						fullWidth
						onPress={handleApply}
						disabled={loading || !parseFloat(amount) || !purpose.trim()}
						style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}
						icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
					/>
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default ApplyLoanScreen;
