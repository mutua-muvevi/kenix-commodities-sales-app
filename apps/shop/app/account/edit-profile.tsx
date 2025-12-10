// app/account/edit-profile.tsx - Edit Profile Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useAuth } from "../../store";
import Toast from "react-native-toast-message";

const EditProfileScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { user } = useAuth();

	// Initialize form state with user data
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
		businessName: user?.businessName || "",
	});

	const [isEditing, setIsEditing] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		setIsEditing(true);
	};

	const handleSave = () => {
		// Validate required fields
		if (!formData.name || !formData.email || !formData.phone) {
			Toast.show({
				type: "error",
				text1: "Validation Error",
				text2: "Please fill in all required fields",
				position: "bottom",
			});
			return;
		}

		// TODO: Implement API call to update profile
		Toast.show({
			type: "success",
			text1: "Profile Updated",
			text2: "Your profile has been successfully updated",
			position: "bottom",
		});
		setIsEditing(false);
	};

	const handleCancel = () => {
		// Reset form to original user data
		setFormData({
			name: user?.name || "",
			email: user?.email || "",
			phone: user?.phone || "",
			businessName: user?.businessName || "",
		});
		setIsEditing(false);
	};

	const InputField = ({
		label,
		value,
		onChangeText,
		placeholder,
		icon,
		keyboardType = "default",
		required = false,
	}: {
		label: string;
		value: string;
		onChangeText: (text: string) => void;
		placeholder: string;
		icon: string;
		keyboardType?: "default" | "email-address" | "phone-pad";
		required?: boolean;
	}) => (
		<View style={styles.inputContainer}>
			<View style={styles.labelContainer}>
				<Text style={styles.label}>{label}</Text>
				{required && <Text style={styles.required}>*</Text>}
			</View>
			<View style={styles.inputWrapper}>
				<Ionicons name={icon as any} size={20} color={theme.palette.text.secondary} style={styles.inputIcon} />
				<Text
					style={styles.input}
					onPress={() => {
						// In a real app, this would open a proper text input
						// For now, we'll just show a toast
						Toast.show({
							type: "info",
							text1: "Edit Field",
							text2: `Click to edit ${label}`,
							position: "bottom",
						});
					}}
					numberOfLines={1}
				>
					{value || placeholder}
				</Text>
			</View>
		</View>
	);

	const styles = StyleSheet.create({
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: theme.spacing.md,
			paddingHorizontal: theme.spacing.sm,
			borderBottomWidth: 1,
			borderBottomColor: theme.palette.divider,
		},
		backButton: {
			width: 40,
			height: 40,
			borderRadius: 20,
			backgroundColor: theme.palette.background.surface,
			alignItems: "center",
			justifyContent: "center",
			marginRight: theme.spacing.md,
		},
		headerTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
			flex: 1,
		},
		avatarSection: {
			alignItems: "center",
			paddingVertical: theme.spacing.xl,
		},
		avatarContainer: {
			position: "relative",
			marginBottom: theme.spacing.md,
		},
		avatar: {
			width: 100,
			height: 100,
			borderRadius: 50,
			backgroundColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
		},
		avatarText: {
			...theme.typography.h3,
			color: theme.palette.primary.contrastText,
			fontWeight: "700",
		},
		editAvatarButton: {
			position: "absolute",
			bottom: 0,
			right: 0,
			width: 32,
			height: 32,
			borderRadius: 16,
			backgroundColor: theme.palette.primary.main,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 2,
			borderColor: theme.palette.background.default,
		},
		formSection: {
			marginBottom: theme.spacing.xl,
		},
		sectionTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.md,
		},
		inputContainer: {
			marginBottom: theme.spacing.lg,
		},
		labelContainer: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		label: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "500",
		},
		required: {
			...theme.typography.body2,
			color: theme.palette.error.main,
			marginLeft: 4,
		},
		inputWrapper: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.palette.background.surface,
			borderRadius: theme.borderRadius.md,
			borderWidth: 1,
			borderColor: theme.palette.divider,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.md,
		},
		inputIcon: {
			marginRight: theme.spacing.md,
		},
		input: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			flex: 1,
		},
		buttonGroup: {
			flexDirection: "row",
			gap: theme.spacing.md,
			marginTop: theme.spacing.xl,
		},
		cancelButton: {
			flex: 1,
		},
		saveButton: {
			flex: 1,
		},
		infoCard: {
			backgroundColor: theme.palette.info.light,
			marginTop: theme.spacing.lg,
		},
		infoText: {
			...theme.typography.body2,
			color: theme.palette.info.dark,
			lineHeight: 20,
		},
	});

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<SafeArea>
			<View style={{ flex: 1, backgroundColor: theme.palette.background.default }}>
				{/* Header */}
				<Animated.View entering={FadeInUp.springify()}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color={theme.palette.text.primary} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Edit Profile</Text>
					</View>
				</Animated.View>

				<ScrollView showsVerticalScrollIndicator={false}>
					<Container>
						{/* Avatar Section */}
						<Animated.View entering={FadeInUp.delay(100).springify()}>
							<View style={styles.avatarSection}>
								<View style={styles.avatarContainer}>
									<View style={styles.avatar}>
										<Text style={styles.avatarText}>{getInitials(formData.name)}</Text>
									</View>
									<TouchableOpacity
										style={styles.editAvatarButton}
										onPress={() =>
											Toast.show({
												type: "info",
												text1: "Change Avatar",
												text2: "Avatar upload coming soon",
												position: "bottom",
											})
										}
									>
										<Ionicons name="camera" size={16} color={theme.palette.common.white} />
									</TouchableOpacity>
								</View>
							</View>
						</Animated.View>

						{/* Personal Information Section */}
						<Animated.View entering={FadeInUp.delay(200).springify()}>
							<View style={styles.formSection}>
								<Text style={styles.sectionTitle}>Personal Information</Text>

								<InputField
									label="Full Name"
									value={formData.name}
									onChangeText={(text) => handleInputChange("name", text)}
									placeholder="Enter your full name"
									icon="person-outline"
									required
								/>

								<InputField
									label="Email Address"
									value={formData.email}
									onChangeText={(text) => handleInputChange("email", text)}
									placeholder="Enter your email"
									icon="mail-outline"
									keyboardType="email-address"
									required
								/>

								<InputField
									label="Phone Number"
									value={formData.phone}
									onChangeText={(text) => handleInputChange("phone", text)}
									placeholder="Enter your phone number"
									icon="call-outline"
									keyboardType="phone-pad"
									required
								/>
							</View>
						</Animated.View>

						{/* Business Information Section */}
						<Animated.View entering={FadeInUp.delay(300).springify()}>
							<View style={styles.formSection}>
								<Text style={styles.sectionTitle}>Business Information</Text>

								<InputField
									label="Business Name"
									value={formData.businessName}
									onChangeText={(text) => handleInputChange("businessName", text)}
									placeholder="Enter your business name"
									icon="business-outline"
								/>
							</View>
						</Animated.View>

						{/* Info Card */}
						<Animated.View entering={FadeInUp.delay(400).springify()}>
							<Card style={styles.infoCard}>
								<Text style={styles.infoText}>
									Your personal information is secure and will only be used to improve your shopping
									experience.
								</Text>
							</Card>
						</Animated.View>

						{/* Action Buttons */}
						{isEditing && (
							<Animated.View entering={FadeInUp.delay(500).springify()}>
								<View style={styles.buttonGroup}>
									<Button
										title="Cancel"
										variant="outlined"
										onPress={handleCancel}
										style={styles.cancelButton}
									/>
									<Button title="Save Changes" variant="gradient" onPress={handleSave} style={styles.saveButton} />
								</View>
							</Animated.View>
						)}
					</Container>
				</ScrollView>
			</View>
		</SafeArea>
	);
};

export default EditProfileScreen;
