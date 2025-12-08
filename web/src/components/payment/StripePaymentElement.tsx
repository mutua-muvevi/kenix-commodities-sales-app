// src/components/payment/StripePaymentElement.tsx - Secure Stripe Payment Element
"use client";

import { useState, useEffect } from "react";
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
	Box,
	Button,
	Typography,
	Alert,
	CircularProgress,
	Card,
	CardContent,
	Stack,
	Divider,
	Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { Iconify } from "@/components/iconify";
import { useAuthContext } from "@/auth/hooks";
import { useSnackbar } from "@/components/snackbar";

// Initialize Stripe with public key
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
	{
		apiVersion: "2023-10-16", // Use stable API version
		locale: "en",
	}
);

interface PlanDetails {
	id: string;
	name: string;
	price: number;
	currency: string;
	interval: string;
	trial_days?: number;
	features: string[];
}

interface StripePaymentElementProps {
	planDetails: PlanDetails;
	onSuccess: (subscription: any) => void;
	onError: (error: string) => void;
	planType: "business" | "individual";
}

// Payment Form Component
const PaymentForm = ({
	planDetails,
	onSuccess,
	onError,
	planType,
}: StripePaymentElementProps) => {
	const stripe = useStripe();
	const elements = useElements();
	const theme = useTheme();
	const { user } = useAuthContext();
	const { enqueueSnackbar } = useSnackbar();
	const token = sessionStorage.getItem("token") || "";

	const [isLoading, setIsLoading] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [clientSecret, setClientSecret] = useState<string>("");

	// Create payment intent on component mount
	useEffect(() => {
		const createPaymentIntent = async () => {
			try {
				const response = await fetch(
					"/api/subscription/create-payment-intent",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
							"Idempotency-Key": crypto.randomUUID(),
						},
						body: JSON.stringify({
							plan_type: planType,
							plan_name: planDetails.id,
							return_url: `${window.location.origin}/account/billing?success=true`,
						}),
					}
				);

				if (!response.ok) {
					throw new Error("Failed to create payment intent");
				}

				const data = await response.json();
				setClientSecret(data.data.client_secret);
			} catch (error) {
				console.error("Error creating payment intent:", error);
				onError("Failed to initialize payment. Please try again.");
			}
		};

		if (user?.token && planDetails.id !== "free") {
			createPaymentIntent();
		}
	}, [user?.token, planDetails.id, planType, onError]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements || !clientSecret) {
			return;
		}

		setIsLoading(true);
		setPaymentError(null);

		try {
			// Confirm payment with Stripe
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/account/billing?success=true`,
				},
				redirect: "if_required",
			});

			if (error) {
				// Handle payment errors with user-friendly messages
				const userFriendlyError = getPaymentErrorMessage(error);
				setPaymentError(userFriendlyError);
				onError(userFriendlyError);
			} else if (paymentIntent?.status === "succeeded") {
				// Payment succeeded, confirm subscription
				await confirmSubscription(paymentIntent.id);
			}
		} catch (error) {
			console.error("Payment error:", error);
			setPaymentError("An unexpected error occurred. Please try again.");
			onError("Payment processing failed");
		} finally {
			setIsLoading(false);
		}
	};

	const confirmSubscription = async (paymentIntentId: string) => {
		try {
			const response = await fetch("/api/subscription/confirm", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({
					subscription_id: clientSecret
						.split("_secret_")[0]
						.replace("pi_", "sub_"),
					payment_intent_id: paymentIntentId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to confirm subscription");
			}

			const data = await response.json();
			enqueueSnackbar("Subscription activated successfully!", {
				variant: "success",
			});
			onSuccess(data.data);
		} catch (error) {
			console.error("Error confirming subscription:", error);
			onError(
				"Payment succeeded but subscription confirmation failed. Please contact support."
			);
		}
	};

	return (
		<Card sx={{ maxWidth: 500, mx: "auto" }}>
			<CardContent sx={{ p: 3 }}>
				{/* Plan Summary */}
				<Box sx={{ mb: 3 }}>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{ mb: 2 }}
					>
						<Typography variant="h6" fontWeight="bold">
							{planDetails.name} Plan
						</Typography>
						<Chip
							label={planType === "business" ? "Business" : "Individual"}
							color="primary"
							size="small"
						/>
					</Stack>

					<Stack
						direction="row"
						alignItems="baseline"
						spacing={1}
						sx={{ mb: 2 }}
					>
						<Typography variant="h4" fontWeight="bold" color="primary.main">
							${(planDetails.price / 100).toFixed(2)}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							/{planDetails.interval}
						</Typography>
					</Stack>

					{planDetails.trial_days && (
						<Alert severity="success" sx={{ mb: 2 }}>
							<Typography variant="body2">
								Start your {planDetails.trial_days}-day free trial. No charges
								until trial ends.
							</Typography>
						</Alert>
					)}

					<Divider sx={{ my: 2 }} />

					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Plan includes:
					</Typography>
					<Stack spacing={0.5}>
						{planDetails.features.slice(0, 4).map((feature, index) => (
							<Stack
								key={index}
								direction="row"
								alignItems="center"
								spacing={1}
							>
								<Iconify
									icon="eva:checkmark-circle-2-fill"
									sx={{ color: "success.main", fontSize: 16 }}
								/>
								<Typography variant="body2">{feature}</Typography>
							</Stack>
						))}
					</Stack>
				</Box>

				{/* Payment Form */}
				<Box component="form" onSubmit={handleSubmit}>
					{clientSecret && (
						<Box sx={{ mb: 3 }}>
							<Typography variant="subtitle2" sx={{ mb: 2 }}>
								Payment Information
							</Typography>
							<Box
								sx={{
									p: 2,
									border: `1px solid ${theme.palette.divider}`,
									borderRadius: 1,
									"& .StripeElement": {
										padding: "12px",
									},
								}}
							>
								<PaymentElement
									options={{
										layout: "tabs",
										paymentMethodOrder: ["card", "link"],
										fields: {
											billingDetails: "auto",
										},
										terms: {
											card: "auto",
										},
									}}
								/>
							</Box>
						</Box>
					)}

					{paymentError && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{paymentError}
						</Alert>
					)}

					<Button
						type="submit"
						fullWidth
						variant="contained"
						size="large"
						disabled={!stripe || !clientSecret || isLoading}
						startIcon={
							isLoading ? (
								<CircularProgress size={20} />
							) : (
								<Iconify icon="eva:credit-card-fill" />
							)
						}
						sx={{
							py: 1.5,
							fontWeight: "bold",
							textTransform: "none",
						}}
					>
						{isLoading
							? "Processing Payment..."
							: planDetails.trial_days
							? `Start ${planDetails.trial_days}-Day Trial`
							: `Subscribe for $${(planDetails.price / 100).toFixed(2)}/${
									planDetails.interval
							  }`}
					</Button>

					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mt: 2, display: "block", textAlign: "center" }}
					>
						<Iconify icon="eva:shield-fill" sx={{ mr: 0.5, fontSize: 14 }} />
						Secured by Stripe. Your payment information is encrypted and secure.
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};

// Main Stripe Payment Element Component
const StripePaymentElement = (props: StripePaymentElementProps) => {
	const theme = useTheme();

	// Stripe Elements configuration
	const elementsOptions = {
		clientSecret: "",
		appearance: {
			theme: theme.palette.mode === "dark" ? "night" : ("stripe" as const),
			variables: {
				colorPrimary: theme.palette.primary.main,
				colorBackground: theme.palette.background.paper,
				colorText: theme.palette.text.primary,
				colorDanger: theme.palette.error.main,
				fontFamily: theme.typography.fontFamily,
				spacingUnit: "4px",
				borderRadius: theme.shape.borderRadius + "px",
			},
			rules: {
				".Input": {
					border: `1px solid ${theme.palette.divider}`,
					borderRadius: theme.shape.borderRadius + "px",
					padding: "12px",
					fontSize: "14px",
				},
				".Input:focus": {
					borderColor: theme.palette.primary.main,
					boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
				},
				".Label": {
					fontSize: "14px",
					fontWeight: "500",
					color: theme.palette.text.primary,
				},
			},
		},
	};

	return (
		<Elements stripe={stripePromise} options={elementsOptions}>
			<PaymentForm {...props} />
		</Elements>
	);
};

// Helper function for user-friendly error messages
const getPaymentErrorMessage = (error: any): string => {
	const errorMessages: { [key: string]: string } = {
		card_declined: "Your card was declined. Please try another payment method.",
		insufficient_funds: "Insufficient funds. Please try another card.",
		expired_card: "Your card has expired. Please use a different card.",
		incorrect_cvc:
			"The security code is incorrect. Please check and try again.",
		processing_error: "A processing error occurred. Please try again.",
		incorrect_number:
			"The card number is incorrect. Please check and try again.",
		invalid_expiry_month: "The expiry month is invalid.",
		invalid_expiry_year: "The expiry year is invalid.",
		authentication_required:
			"Authentication is required. Please complete the verification.",
		card_not_supported:
			"This card is not supported. Please try a different card.",
		currency_not_supported: "This currency is not supported.",
		duplicate_transaction: "This appears to be a duplicate transaction.",
		fraudulent: "This transaction was flagged as potentially fraudulent.",
		generic_decline: "Your card was declined. Please contact your bank.",
		invalid_account: "The account is invalid.",
		invalid_amount: "The payment amount is invalid.",
		lost_card: "This card was reported as lost.",
		merchant_blacklist: "This transaction cannot be processed.",
		new_account_information_available:
			"Please update your payment information.",
		no_action_taken: "No action was taken on this payment.",
		not_permitted: "This transaction is not permitted.",
		restricted_card: "This card has restrictions.",
		stolen_card: "This card was reported as stolen.",
		testmode_decline: "This is a test transaction that was declined.",
		transaction_not_allowed: "This transaction is not allowed.",
		try_again_later: "Please try again later.",
		withdrawal_count_limit_exceeded: "You have exceeded the withdrawal limit.",
	};

	const code = error.decline_code || error.code || "unknown_error";
	return (
		errorMessages[code] ||
		"An unexpected error occurred. Please try again or contact support."
	);
};

export default StripePaymentElement;
