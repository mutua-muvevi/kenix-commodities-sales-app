// app/auth/register.tsx - Register screen with simple validation
import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { SafeArea, Container } from "../../components/layout";
import { Button } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useAuth } from "../../store";

type FormErrors = {
	name?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
};

type TouchedFields = {
	name: boolean;
	email: boolean;
	password: boolean;
	confirmPassword: boolean;
};

const RegisterScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { register: registerUser, loading, error: authError, resetError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<TouchedFields>({
		name: false,
		email: false,
		password: false,
		confirmPassword: false,
	});

	// Validation functions
	const validateName = (value: string) => {
		if (!value) return "Name is required";
		if (value.length < 2) return "Name must be at least 2 characters";
		return undefined;
	};

	const validateEmail = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value) return "Email is required";
		if (!emailRegex.test(value)) return "Please enter a valid email address";
		return undefined;
	};

	const validatePassword = (value: string) => {
		if (!value) return "Password is required";
		if (value.length < 6) return "Password must be at least 6 characters";
		return undefined;
	};

	const validateConfirmPassword = (value: string, pwd: string) => {
		if (!value) return "Please confirm your password";
		if (value !== pwd) return "Passwords must match";
		return undefined;
	};

	const validate = () => {
		const newErrors: FormErrors = {
			name: validateName(name),
			email: validateEmail(email),
			password: validatePassword(password),
			confirmPassword: validateConfirmPassword(confirmPassword, password),
		};
		setErrors(newErrors);
		return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
	};

	const handleSubmit = async () => {
		if (!validate()) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			resetError();
			await registerUser({ name, email, password, country: "Kenya" });
			router.replace("/(tabs)");
		} catch (err: any) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			Alert.alert("Registration Failed", err?.message || "Please try again later.");
		}
	};

	const styles = StyleSheet.create({
		keyboardView: {
			flex: 1,
		},
		scrollContent: {
			flexGrow: 1,
		},
		container: {
			flex: 1,
			paddingHorizontal: theme.spacing.lg,
			paddingTop: theme.spacing.xl,
			paddingBottom: theme.spacing.xl,
		},
		backButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: theme.spacing.xl,
		},
		header: {
			marginBottom: theme.spacing.xl,
		},
		headerIconContainer: {
			width: 80,
			height: 80,
			borderRadius: 40,
			marginBottom: theme.spacing.lg,
			alignSelf: "center",
		},
		headerIcon: {
			width: "100%",
			height: "100%",
			borderRadius: 40,
			alignItems: "center",
			justifyContent: "center",
		},
		title: {
			...theme.typography.h3,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
			textAlign: "center",
		},
		subtitle: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			textAlign: "center",
			lineHeight: 22,
		},
		form: {
			marginTop: theme.spacing.lg,
		},
		inputContainer: {
			marginBottom: theme.spacing.lg,
		},
		label: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.sm,
		},
		inputWrapper: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.md,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			paddingHorizontal: theme.spacing.md,
			minHeight: 52,
		},
		inputWrapperFocused: {
			borderColor: theme.palette.primary.main,
			borderWidth: 2,
		},
		inputWrapperError: {
			borderColor: theme.palette.error.main,
			borderWidth: 2,
		},
		inputIcon: {
			marginRight: theme.spacing.sm,
		},
		input: {
			flex: 1,
			...theme.typography.body1,
			color: theme.palette.text.primary,
			paddingVertical: theme.spacing.sm,
		},
		eyeButton: {
			padding: theme.spacing.sm,
		},
		errorText: {
			...theme.typography.caption,
			color: theme.palette.error.main,
			marginTop: theme.spacing.xs,
			marginLeft: theme.spacing.xs,
		},
		termsContainer: {
			flexDirection: "row",
			alignItems: "flex-start",
			marginBottom: theme.spacing.lg,
			paddingHorizontal: theme.spacing.xs,
		},
		termsText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			flex: 1,
			lineHeight: 18,
		},
		termsLink: {
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		submitButton: {
			marginTop: theme.spacing.md,
			marginBottom: theme.spacing.lg,
		},
		divider: {
			flexDirection: "row",
			alignItems: "center",
			marginVertical: theme.spacing.lg,
		},
		dividerLine: {
			flex: 1,
			height: 1,
			backgroundColor: theme.palette.divider,
		},
		dividerText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginHorizontal: theme.spacing.md,
		},
		footer: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
		},
		footerText: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
		},
		footerLink: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
			marginLeft: theme.spacing.xs,
		},
		benefitsContainer: {
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.md,
			marginBottom: theme.spacing.lg,
			borderLeftWidth: 4,
			borderLeftColor: theme.palette.success.main,
		},
		benefitsTitle: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.sm,
		},
		benefitItem: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.xs,
		},
		benefitText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginLeft: theme.spacing.sm,
			flex: 1,
		},
	});

	return (
		<SafeArea>
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<Container>
						<View style={styles.container}>
							{/* Back Button */}
							<Animated.View entering={FadeInUp.springify()}>
								<TouchableOpacity
									style={styles.backButton}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
										router.back();
									}}
									accessibilityRole="button"
									accessibilityLabel="Go back"
								>
									<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
								</TouchableOpacity>
							</Animated.View>

							{/* Header */}
							<Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
								<LinearGradient
									colors={[theme.palette.secondary.main, theme.palette.secondary.dark]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.headerIconContainer}
								>
									<View style={styles.headerIcon}>
										<Ionicons name="person-add" size={36} color={theme.palette.common.white} />
									</View>
								</LinearGradient>
								<Text style={styles.title}>Create Account</Text>
								<Text style={styles.subtitle}>Join us and start shopping today</Text>
							</Animated.View>

							{/* Benefits Info */}
							<Animated.View entering={FadeInUp.delay(200).springify()}>
								<View style={styles.benefitsContainer}>
									<Text style={styles.benefitsTitle}>What you'll get:</Text>
									<View style={styles.benefitItem}>
										<Ionicons name="checkmark-circle" size={16} color={theme.palette.success.main} />
										<Text style={styles.benefitText}>Access to exclusive deals and discounts</Text>
									</View>
									<View style={styles.benefitItem}>
										<Ionicons name="checkmark-circle" size={16} color={theme.palette.success.main} />
										<Text style={styles.benefitText}>Track your orders in real-time</Text>
									</View>
									<View style={styles.benefitItem}>
										<Ionicons name="checkmark-circle" size={16} color={theme.palette.success.main} />
										<Text style={styles.benefitText}>Save favorite products for later</Text>
									</View>
								</View>
							</Animated.View>

							{/* Registration Form */}
							<Animated.View entering={FadeInUp.delay(300).springify()} style={styles.form}>
								{/* Name Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Full Name</Text>
									<View
										style={[
											styles.inputWrapper,
											touched.name && styles.inputWrapperFocused,
											errors.name && styles.inputWrapperError,
										]}
									>
										<Ionicons
											name="person-outline"
											size={20}
											color={
												errors.name
													? theme.palette.error.main
													: touched.name
													? theme.palette.primary.main
													: theme.palette.text.disabled
											}
											style={styles.inputIcon}
										/>
										<TextInput
											style={styles.input}
											placeholder="Enter your full name"
											placeholderTextColor={theme.palette.text.disabled}
											value={name}
											onChangeText={(text) => {
												setName(text);
												if (touched.name) {
													setErrors((prev) => ({ ...prev, name: validateName(text) }));
												}
											}}
											onBlur={() => {
												setTouched((prev) => ({ ...prev, name: true }));
												setErrors((prev) => ({ ...prev, name: validateName(name) }));
											}}
											autoCapitalize="words"
											autoCorrect={false}
											editable={!loading}
										/>
									</View>
									{errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
								</View>

								{/* Email Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Email Address</Text>
									<View
										style={[
											styles.inputWrapper,
											touched.email && styles.inputWrapperFocused,
											errors.email && styles.inputWrapperError,
										]}
									>
										<Ionicons
											name="mail-outline"
											size={20}
											color={
												errors.email
													? theme.palette.error.main
													: touched.email
													? theme.palette.primary.main
													: theme.palette.text.disabled
											}
											style={styles.inputIcon}
										/>
										<TextInput
											style={styles.input}
											placeholder="Enter your email"
											placeholderTextColor={theme.palette.text.disabled}
											value={email}
											onChangeText={(text) => {
												setEmail(text);
												if (touched.email) {
													setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
												}
											}}
											onBlur={() => {
												setTouched((prev) => ({ ...prev, email: true }));
												setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
											}}
											keyboardType="email-address"
											autoCapitalize="none"
											autoCorrect={false}
											editable={!loading}
										/>
									</View>
									{errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
								</View>

								{/* Password Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Password</Text>
									<View
										style={[
											styles.inputWrapper,
											touched.password && styles.inputWrapperFocused,
											errors.password && styles.inputWrapperError,
										]}
									>
										<Ionicons
											name="lock-closed-outline"
											size={20}
											color={
												errors.password
													? theme.palette.error.main
													: touched.password
													? theme.palette.primary.main
													: theme.palette.text.disabled
											}
											style={styles.inputIcon}
										/>
										<TextInput
											style={styles.input}
											placeholder="Create a password"
											placeholderTextColor={theme.palette.text.disabled}
											value={password}
											onChangeText={(text) => {
												setPassword(text);
												if (touched.password) {
													setErrors((prev) => ({ ...prev, password: validatePassword(text) }));
												}
											}}
											onBlur={() => {
												setTouched((prev) => ({ ...prev, password: true }));
												setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
											}}
											secureTextEntry={!showPassword}
											autoCapitalize="none"
											autoCorrect={false}
											editable={!loading}
										/>
										<TouchableOpacity
											style={styles.eyeButton}
											onPress={() => setShowPassword(!showPassword)}
											accessibilityRole="button"
											accessibilityLabel={showPassword ? "Hide password" : "Show password"}
										>
											<Ionicons
												name={showPassword ? "eye-off-outline" : "eye-outline"}
												size={20}
												color={theme.palette.text.disabled}
											/>
										</TouchableOpacity>
									</View>
									{errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
								</View>

								{/* Confirm Password Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Confirm Password</Text>
									<View
										style={[
											styles.inputWrapper,
											touched.confirmPassword && styles.inputWrapperFocused,
											errors.confirmPassword && styles.inputWrapperError,
										]}
									>
										<Ionicons
											name="lock-closed-outline"
											size={20}
											color={
												errors.confirmPassword
													? theme.palette.error.main
													: touched.confirmPassword
													? theme.palette.primary.main
													: theme.palette.text.disabled
											}
											style={styles.inputIcon}
										/>
										<TextInput
											style={styles.input}
											placeholder="Confirm your password"
											placeholderTextColor={theme.palette.text.disabled}
											value={confirmPassword}
											onChangeText={(text) => {
												setConfirmPassword(text);
												if (touched.confirmPassword) {
													setErrors((prev) => ({
														...prev,
														confirmPassword: validateConfirmPassword(text, password),
													}));
												}
											}}
											onBlur={() => {
												setTouched((prev) => ({ ...prev, confirmPassword: true }));
												setErrors((prev) => ({
													...prev,
													confirmPassword: validateConfirmPassword(confirmPassword, password),
												}));
											}}
											secureTextEntry={!showConfirmPassword}
											autoCapitalize="none"
											autoCorrect={false}
											editable={!loading}
										/>
										<TouchableOpacity
											style={styles.eyeButton}
											onPress={() => setShowConfirmPassword(!showConfirmPassword)}
											accessibilityRole="button"
											accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
										>
											<Ionicons
												name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
												size={20}
												color={theme.palette.text.disabled}
											/>
										</TouchableOpacity>
									</View>
									{errors.confirmPassword && (
										<Text style={styles.errorText}>{errors.confirmPassword}</Text>
									)}
								</View>

								{/* Terms and Conditions */}
								<View style={styles.termsContainer}>
									<Ionicons
										name="information-circle-outline"
										size={16}
										color={theme.palette.text.secondary}
										style={{ marginRight: theme.spacing.xs, marginTop: 2 }}
									/>
									<Text style={styles.termsText}>
										By creating an account, you agree to our{" "}
										<Text style={styles.termsLink}>Terms of Service</Text> and{" "}
										<Text style={styles.termsLink}>Privacy Policy</Text>
									</Text>
								</View>

								{/* Submit Button */}
								<View style={styles.submitButton}>
									<Button
										title="Create Account"
										variant="gradient"
										size="large"
										fullWidth
										loading={loading}
										onPress={handleSubmit}
										icon={
											!loading ? (
												<Ionicons name="person-add-outline" size={20} color={theme.palette.common.white} />
											) : undefined
										}
									/>
								</View>
							</Animated.View>

							{/* Divider */}
							<Animated.View entering={FadeInUp.delay(400).springify()}>
								<View style={styles.divider}>
									<View style={styles.dividerLine} />
									<Text style={styles.dividerText}>or</Text>
									<View style={styles.dividerLine} />
								</View>
							</Animated.View>

							{/* Footer - Sign In Link */}
							<Animated.View entering={FadeInDown.delay(500).springify()}>
								<View style={styles.footer}>
									<Text style={styles.footerText}>Already have an account?</Text>
									<TouchableOpacity
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
											router.push("/auth/login" as any);
										}}
										accessibilityRole="button"
										accessibilityLabel="Sign in"
									>
										<Text style={styles.footerLink}>Sign In</Text>
									</TouchableOpacity>
								</View>
							</Animated.View>
						</View>
					</Container>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeArea>
	);
};

export default RegisterScreen;
