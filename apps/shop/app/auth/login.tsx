// app/auth/login.tsx - Login screen with simple validation
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
	email?: string;
	password?: string;
};

const LoginScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { login, loading, error: authError, resetError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState({ email: false, password: false });

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

	const validate = () => {
		const newErrors: FormErrors = {
			email: validateEmail(email),
			password: validatePassword(password),
		};
		setErrors(newErrors);
		return !newErrors.email && !newErrors.password;
	};

	const handleSubmit = async () => {
		if (!validate()) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			resetError();
			await login({ email, password });
			// Navigation will happen automatically via auth state change
			router.replace("/(tabs)");
		} catch (err: any) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			Alert.alert("Login Failed", err?.message || "Please check your credentials and try again.");
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
			marginBottom: theme.spacing.xxl,
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
			marginTop: theme.spacing.xl,
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
		forgotPassword: {
			alignSelf: "flex-end",
			marginTop: -theme.spacing.sm,
			marginBottom: theme.spacing.lg,
		},
		forgotPasswordText: {
			...theme.typography.body2,
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
			marginVertical: theme.spacing.xl,
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
		demoCredentials: {
			backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.md,
			marginBottom: theme.spacing.lg,
			borderLeftWidth: 4,
			borderLeftColor: theme.palette.info.main,
		},
		demoTitle: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		demoText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			lineHeight: 18,
		},
		footer: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: theme.spacing.xl,
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
									colors={[theme.palette.primary.main, theme.palette.primary.dark]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.headerIconContainer}
								>
									<View style={styles.headerIcon}>
										<Ionicons name="lock-closed" size={36} color={theme.palette.common.white} />
									</View>
								</LinearGradient>
								<Text style={styles.title}>Sign In</Text>
								<Text style={styles.subtitle}>Welcome back! Please enter your credentials</Text>
							</Animated.View>

							{/* Demo Credentials Info */}
							<Animated.View entering={FadeInUp.delay(200).springify()}>
								<View style={styles.demoCredentials}>
									<Text style={styles.demoTitle}>Demo Credentials</Text>
									<Text style={styles.demoText}>
										Email: john@example.com{"\n"}Password: password
									</Text>
								</View>
							</Animated.View>

							{/* Login Form */}
							<Animated.View entering={FadeInUp.delay(300).springify()} style={styles.form}>
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
											placeholder="Enter your password"
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

								{/* Forgot Password Link */}
								<TouchableOpacity
									style={styles.forgotPassword}
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
										Alert.alert("Forgot Password", "Password recovery feature coming soon!");
									}}
									accessibilityRole="button"
									accessibilityLabel="Forgot password"
								>
									<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
								</TouchableOpacity>

								{/* Submit Button */}
								<View style={styles.submitButton}>
									<Button
										title="Sign In"
										variant="gradient"
										size="large"
										fullWidth
										loading={loading}
										onPress={handleSubmit}
										icon={
											!loading ? (
												<Ionicons name="log-in-outline" size={20} color={theme.palette.common.white} />
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

							{/* Footer - Create Account Link */}
							<Animated.View entering={FadeInDown.delay(500).springify()}>
								<View style={styles.footer}>
									<Text style={styles.footerText}>Don't have an account?</Text>
									<TouchableOpacity
										onPress={() => {
											Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
											router.push("/auth/register" as any);
										}}
										accessibilityRole="button"
										accessibilityLabel="Create account"
									>
										<Text style={styles.footerLink}>Create Account</Text>
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

export default LoginScreen;
