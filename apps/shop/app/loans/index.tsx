import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme, useAuth } from "../../hooks";
import { loanApi, Loan } from "../../store/api/loan-api";
import Toast from "react-native-toast-message";

const LoansScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { user, accessToken } = useAuth();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [eligibility, setEligibility] = useState<any>(null);
	const [loans, setLoans] = useState<Loan[]>([]);
	const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
	const [completedLoans, setCompletedLoans] = useState<Loan[]>([]);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		if (!accessToken || !user?._id) {
			setLoading(false);
			return;
		}

		try {
			const [eligibilityRes, loansRes] = await Promise.all([
				loanApi.checkEligibility(user._id, accessToken),
				loanApi.getShopLoans(user._id, accessToken),
			]);

			setEligibility(eligibilityRes);
			setLoans(loansRes.loans);

			// Separate active and completed loans
			const active = loansRes.loans.filter(
				(loan) => loan.status === "active" || loan.status === "approved",
			);
			const completed = loansRes.loans.filter(
				(loan) => loan.status === "paid" || loan.status === "defaulted",
			);

			setActiveLoans(active);
			setCompletedLoans(completed);
		} catch (error: any) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Failed to load loan information",
			});
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleRefresh = () => {
		setRefreshing(true);
		fetchData();
	};

	const handleApplyForLoan = () => {
		if (!eligibility?.eligible) {
			Toast.show({
				type: "info",
				text1: "Not Eligible",
				text2: eligibility?.reason || "You are not eligible for a loan at this time",
			});
			return;
		}
		router.push("/loans/apply");
	};

	const handleViewLoan = (loanId: string) => {
		router.push(`/loans/${loanId}`);
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
			justifyContent: "space-between",
			paddingVertical: theme.spacing.lg,
		},
		backButton: {
			marginRight: theme.spacing.md,
		},
		title: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "700",
			flex: 1,
		},
		eligibilityCard: {
			marginBottom: theme.spacing.lg,
		},
		eligibilityHeader: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		eligibilityIcon: {
			fontSize: 40,
			marginRight: theme.spacing.md,
		},
		eligibilityTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		eligibilitySubtitle: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
		},
		amountContainer: {
			backgroundColor: `${theme.palette.primary.main}15`,
			borderRadius: theme.radius.md,
			padding: theme.spacing.lg,
			marginVertical: theme.spacing.md,
		},
		amountLabel: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.xs,
		},
		amountValue: {
			...theme.typography.h4,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		detailRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: theme.spacing.sm,
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
		loanCard: {
			marginBottom: theme.spacing.md,
		},
		loanHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.md,
		},
		loanId: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		statusBadge: {
			paddingHorizontal: theme.spacing.sm,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.radius.sm,
		},
		statusText: {
			...theme.typography.caption,
			color: "#fff",
			fontWeight: "600",
		},
		loanAmount: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
		},
		loanPurpose: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.md,
		},
		progressContainer: {
			marginTop: theme.spacing.md,
		},
		progressBar: {
			height: 8,
			backgroundColor: theme.palette.divider,
			borderRadius: 4,
			overflow: "hidden",
			marginBottom: theme.spacing.xs,
		},
		progressFill: {
			height: "100%",
			backgroundColor: theme.palette.primary.main,
		},
		progressText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
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

	if (loading) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.title}>Kenix Duka Loans</Text>
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
					<Text style={styles.title}>Kenix Duka Loans</Text>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
				>
					{/* Eligibility Card */}
					<Animated.View entering={FadeInUp.springify()}>
						<Card style={styles.eligibilityCard}>
							<View style={styles.eligibilityHeader}>
								<Text style={styles.eligibilityIcon}>
									{eligibility?.eligible ? "✅" : "ℹ️"}
								</Text>
								<View style={{ flex: 1 }}>
									<Text style={styles.eligibilityTitle}>
										{eligibility?.eligible ? "You're Eligible!" : "Loan Eligibility"}
									</Text>
									<Text style={styles.eligibilitySubtitle}>
										{eligibility?.eligible
											? "Apply for a Kenix Duka business loan"
											: eligibility?.reason || "Check your eligibility status"}
									</Text>
								</View>
							</View>

							{eligibility?.eligible && (
								<>
									<View style={styles.amountContainer}>
										<Text style={styles.amountLabel}>Maximum Loan Amount</Text>
										<Text style={styles.amountValue}>
											KSh {eligibility.maxAmount?.toLocaleString() || "0"}
										</Text>
									</View>

									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Interest Rate</Text>
										<Text style={styles.detailValue}>{eligibility.interestRate || 0}% per month</Text>
									</View>
									<View style={styles.detailRow}>
										<Text style={styles.detailLabel}>Max Duration</Text>
										<Text style={styles.detailValue}>{eligibility.maxDuration || 0} months</Text>
									</View>

									<Button
										title="Apply for Loan"
										variant="gradient"
										fullWidth
										onPress={handleApplyForLoan}
										style={{ marginTop: theme.spacing.lg }}
										icon={<Ionicons name="add-circle-outline" size={20} color="#fff" />}
									/>
								</>
							)}
						</Card>
					</Animated.View>

					{/* Active Loans */}
					{activeLoans.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>Active Loans ({activeLoans.length})</Text>
							{activeLoans.map((loan, index) => (
								<Animated.View key={loan._id} entering={FadeInDown.delay(index * 100).springify()}>
									<TouchableOpacity onPress={() => handleViewLoan(loan.loanId)}>
										<Card style={styles.loanCard}>
											<View style={styles.loanHeader}>
												<Text style={styles.loanId}>{loan.loanId}</Text>
												<View
													style={[
														styles.statusBadge,
														{ backgroundColor: getStatusColor(loan.status) },
													]}
												>
													<Text style={styles.statusText}>{getStatusLabel(loan.status)}</Text>
												</View>
											</View>

											<Text style={styles.loanAmount}>
												KSh {loan.amount.toLocaleString()}
											</Text>
											<Text style={styles.loanPurpose}>{loan.purpose}</Text>

											<View style={styles.detailRow}>
												<Text style={styles.detailLabel}>Amount Paid</Text>
												<Text style={styles.detailValue}>
													KSh {loan.amountPaid?.toLocaleString() || 0}
												</Text>
											</View>
											<View style={styles.detailRow}>
												<Text style={styles.detailLabel}>Amount Due</Text>
												<Text style={[styles.detailValue, { color: theme.palette.error.main }]}>
													KSh {loan.amountDue?.toLocaleString() || 0}
												</Text>
											</View>

											{/* Progress Bar */}
											<View style={styles.progressContainer}>
												<View style={styles.progressBar}>
													<View
														style={[
															styles.progressFill,
															{
																width: `${((loan.amountPaid || 0) / (loan.amountDue || 1)) * 100}%`,
															},
														]}
													/>
												</View>
												<Text style={styles.progressText}>
													{Math.round(((loan.amountPaid || 0) / (loan.amountDue || 1)) * 100)}% repaid
												</Text>
											</View>
										</Card>
									</TouchableOpacity>
								</Animated.View>
							))}
						</>
					)}

					{/* Completed Loans */}
					{completedLoans.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>Completed Loans ({completedLoans.length})</Text>
							{completedLoans.map((loan, index) => (
								<Animated.View
									key={loan._id}
									entering={FadeInDown.delay((activeLoans.length + index) * 100).springify()}
								>
									<TouchableOpacity onPress={() => handleViewLoan(loan.loanId)}>
										<Card style={styles.loanCard}>
											<View style={styles.loanHeader}>
												<Text style={styles.loanId}>{loan.loanId}</Text>
												<View
													style={[
														styles.statusBadge,
														{ backgroundColor: getStatusColor(loan.status) },
													]}
												>
													<Text style={styles.statusText}>{getStatusLabel(loan.status)}</Text>
												</View>
											</View>

											<Text style={styles.loanAmount}>
												KSh {loan.amount.toLocaleString()}
											</Text>
											<Text style={styles.loanPurpose}>{loan.purpose}</Text>
										</Card>
									</TouchableOpacity>
								</Animated.View>
							))}
						</>
					)}

					{/* Empty State */}
					{activeLoans.length === 0 && completedLoans.length === 0 && (
						<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
							<Text style={styles.emptyIcon}>💰</Text>
							<Text style={styles.emptyText}>
								You don't have any loans yet.
								{"\n"}
								Apply for your first Kenix Duka loan above.
							</Text>
						</Animated.View>
					)}
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default LoansScreen;
