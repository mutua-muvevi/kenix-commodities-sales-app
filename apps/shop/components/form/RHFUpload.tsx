// components/form/RHFUpload.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ViewStyle } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface UploadFile {
	uri: string;
	name: string;
	type: string;
	size: number;
}

interface UploadValidation {
	maxSize?: number; // in bytes, default 10MB
	minSize?: number; // in bytes
	allowedTypes?: string[]; // MIME types
	maxFiles?: number; // for multiple uploads
	minFiles?: number;
}

interface RHFUploadProps {
	name: string;
	label?: string;
	helperText?: string;
	multiple?: boolean;
	uploadType?: "image" | "document" | "all";
	validation?: UploadValidation;
	disabled?: boolean;
	style?: ViewStyle;
	required?: boolean;
	placeholder?: string;
	// Rendering
	renderPreview?: (file: UploadFile, onRemove: () => void) => React.ReactElement;
	onUpload?: (files: UploadFile[]) => Promise<string[]>; // Returns URLs after upload
}

const DEFAULT_VALIDATION: UploadValidation = {
	maxSize: 10 * 1024 * 1024, // 10MB
	minSize: 0,
	allowedTypes: ["image/*", "application/pdf", "text/*"],
	maxFiles: 5,
	minFiles: 0,
};

export const RHFUpload: React.FC<RHFUploadProps> = ({
	name,
	label,
	helperText,
	multiple = false,
	uploadType = "all",
	validation = {},
	disabled = false,
	style,
	required = false,
	placeholder,
	renderPreview,
	onUpload,
}) => {
	const { theme } = useTheme();
	const { control } = useFormContext();
	const [isUploading, setIsUploading] = useState(false);
	const scale = useSharedValue(1);

	const config = { ...DEFAULT_VALIDATION, ...validation };

	const validateFile = (file: any): string | null => {
		// Size validation
		if (config.maxSize && file.size > config.maxSize) {
			return `File size must be less than ${formatFileSize(config.maxSize)}`;
		}
		if (config.minSize && file.size < config.minSize) {
			return `File size must be at least ${formatFileSize(config.minSize)}`;
		}

		// Type validation
		if (config.allowedTypes && config.allowedTypes.length > 0) {
			const isAllowed = config.allowedTypes.some((type) => {
				if (type.endsWith("/*")) {
					const baseType = type.split("/")[0];
					return file.type.startsWith(baseType);
				}
				return file.type === type;
			});

			if (!isAllowed) {
				return `File type ${file.type} is not allowed`;
			}
		}

		return null;
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleImagePicker = async (field: any) => {
		try {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert("Permission required", "Please grant camera roll permissions to upload images.");
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsMultipleSelection: multiple,
				quality: 0.8,
				allowsEditing: !multiple,
				aspect: [1, 1],
			});

			if (!result.canceled) {
				const files = result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.fileName || `image_${Date.now()}.jpg`,
					type: asset.type || "image/jpeg",
					size: asset.fileSize || 0,
				}));

				await handleFileSelection(files, field);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick image");
		}
	};

	const handleDocumentPicker = async (field: any) => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "*/*",
				multiple,
				copyToCacheDirectory: true,
			});

			if (!result.canceled) {
				const files = result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.name,
					type: asset.mimeType || "application/octet-stream",
					size: asset.size || 0,
				}));

				await handleFileSelection(files, field);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick document");
		}
	};

	const handleFileSelection = async (newFiles: UploadFile[], field: any) => {
		// Validate files
		const validationErrors: string[] = [];
		newFiles.forEach((file, index) => {
			const error = validateFile(file);
			if (error) {
				validationErrors.push(`File ${index + 1}: ${error}`);
			}
		});

		if (validationErrors.length > 0) {
			Alert.alert("Validation Error", validationErrors.join("\n"));
			return;
		}

		const currentFiles = field.value || [];
		let updatedFiles = multiple ? [...currentFiles, ...newFiles] : newFiles;

		// Check file count limits
		if (config.maxFiles && updatedFiles.length > config.maxFiles) {
			Alert.alert("Too many files", `Maximum ${config.maxFiles} files allowed`);
			updatedFiles = updatedFiles.slice(0, config.maxFiles);
		}

		// Upload files if onUpload is provided
		if (onUpload) {
			setIsUploading(true);
			try {
				const uploadedUrls = await onUpload(updatedFiles);
				// Update files with uploaded URLs
				updatedFiles = updatedFiles.map((file, index) => ({
					...file,
					uri: uploadedUrls[index] || file.uri,
				}));
			} catch (error) {
				Alert.alert("Upload Error", "Failed to upload files");
				setIsUploading(false);
				return;
			}
			setIsUploading(false);
		}

		field.onChange(updatedFiles);
	};

	const handleRemoveFile = (index: number, field: any) => {
		const currentFiles = field.value || [];
		const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
		field.onChange(updatedFiles);
	};

	const handlePress = () => {
		scale.value = withSpring(0.98, {}, () => {
			scale.value = withSpring(1);
		});
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.sm,
		},
		labelContainer: {
			flexDirection: "row",
			marginBottom: theme.spacing.xs,
		},
		label: {
			...theme.typography.body2,
			color: theme.palette.text.primary,
			fontWeight: "500",
		},
		required: {
			color: theme.palette.error.main,
			marginLeft: 2,
		},
		uploadArea: {
			borderWidth: 2,
			borderStyle: "dashed",
			borderColor: theme.palette.grey[300],
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.lg,
			alignItems: "center",
			justifyContent: "center",
			minHeight: 120,
			backgroundColor: theme.palette.background.surface,
		},
		uploadAreaActive: {
			borderColor: theme.palette.primary.main,
			backgroundColor: theme.palette.primary.main + "10",
		},
		uploadAreaError: {
			borderColor: theme.palette.error.main,
		},
		uploadAreaDisabled: {
			opacity: 0.6,
			backgroundColor: theme.palette.grey[100],
		},
		uploadIcon: {
			marginBottom: theme.spacing.sm,
		},
		uploadText: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			textAlign: "center",
			marginBottom: theme.spacing.xs,
		},
		uploadSubtext: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			textAlign: "center",
			fontSize: 11,
		},
		buttonsContainer: {
			flexDirection: "row",
			justifyContent: "center",
			marginTop: theme.spacing.sm,
			flexWrap: "wrap",
		},
		uploadButton: {
			backgroundColor: theme.palette.primary.main,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.sm,
			marginHorizontal: theme.spacing.xs,
			marginVertical: theme.spacing.xs,
			flexDirection: "row",
			alignItems: "center",
		},
		uploadButtonText: {
			color: theme.palette.primary.contrastText,
			...theme.typography.body2,
			fontWeight: "600",
			marginLeft: theme.spacing.xs,
		},
		previewContainer: {
			marginTop: theme.spacing.sm,
		},
		previewGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			marginHorizontal: -theme.spacing.xs,
		},
		previewItem: {
			margin: theme.spacing.xs,
			borderRadius: theme.borderRadius.sm,
			overflow: "hidden",
			backgroundColor: theme.palette.background.paper,
			...theme.shadows.z2,
		},
		imagePreview: {
			width: 80,
			height: 80,
			position: "relative",
		},
		image: {
			width: "100%",
			height: "100%",
		},
		documentPreview: {
			width: 100,
			padding: theme.spacing.sm,
			alignItems: "center",
			minHeight: 80,
		},
		documentIcon: {
			marginBottom: theme.spacing.xs,
		},
		fileName: {
			...theme.typography.caption,
			color: theme.palette.text.primary,
			textAlign: "center",
			fontSize: 10,
		},
		fileSize: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			textAlign: "center",
			fontSize: 9,
			marginTop: 2,
		},
		removeButton: {
			position: "absolute",
			top: 4,
			right: 4,
			backgroundColor: theme.palette.error.main,
			borderRadius: 10,
			width: 20,
			height: 20,
			alignItems: "center",
			justifyContent: "center",
		},
		helperText: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
			marginTop: theme.spacing.xs,
			fontSize: 11,
		},
		errorText: {
			color: theme.palette.error.main,
		},
		loadingOverlay: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(255, 255, 255, 0.8)",
			alignItems: "center",
			justifyContent: "center",
		},
	});

	const getFileIcon = (type: string) => {
		if (type.startsWith("image/")) return "image";
		if (type.includes("pdf")) return "document-text";
		if (type.includes("word") || type.includes("doc")) return "document";
		if (type.includes("excel") || type.includes("sheet")) return "grid";
		if (type.includes("powerpoint") || type.includes("presentation")) return "easel";
		return "document-outline";
	};

	const defaultRenderPreview = (file: UploadFile, onRemove: () => void) => {
		const isImage = file.type.startsWith("image/");

		return (
			<View key={file.uri} style={styles.previewItem}>
				{isImage ? (
					<View style={styles.imagePreview}>
						<Image source={{ uri: file.uri }} style={styles.image} resizeMode="cover" />
						<TouchableOpacity style={styles.removeButton} onPress={onRemove}>
							<Ionicons name="close" size={12} color="white" />
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.documentPreview}>
						<Ionicons
							name={getFileIcon(file.type) as any}
							size={24}
							color={theme.palette.primary.main}
							style={styles.documentIcon}
						/>
						<Text style={styles.fileName} numberOfLines={2}>
							{file.name}
						</Text>
						<Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
						<TouchableOpacity style={styles.removeButton} onPress={onRemove}>
							<Ionicons name="close" size={12} color="white" />
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => {
				const files = field.value || [];
				const hasFiles = files.length > 0;

				return (
					<Animated.View style={[styles.container, animatedStyle, style]}>
						{label && (
							<View style={styles.labelContainer}>
								<Text style={styles.label}>{label}</Text>
								{required && <Text style={styles.required}>*</Text>}
							</View>
						)}

						<TouchableOpacity
							style={[
								styles.uploadArea,
								hasFiles && styles.uploadAreaActive,
								error && styles.uploadAreaError,
								disabled && styles.uploadAreaDisabled,
							]}
							onPress={handlePress}
							disabled={disabled || isUploading}
							activeOpacity={0.7}
						>
							<Ionicons
								name="cloud-upload-outline"
								size={32}
								color={hasFiles ? theme.palette.primary.main : theme.palette.text.secondary}
								style={styles.uploadIcon}
							/>

							<Text style={styles.uploadText}>
								{placeholder || (hasFiles ? "Add more files" : "Tap to upload files")}
							</Text>

							<Text style={styles.uploadSubtext}>
								{uploadType === "image" && "Images only • "}
								{uploadType === "document" && "Documents only • "}
								Max {formatFileSize(config.maxSize || DEFAULT_VALIDATION.maxSize!)}
								{multiple && ` • Up to ${config.maxFiles} files`}
							</Text>

							{/* Upload buttons */}
							<View style={styles.buttonsContainer}>
								{(uploadType === "image" || uploadType === "all") && (
									<TouchableOpacity
										style={styles.uploadButton}
										onPress={() => handleImagePicker(field)}
										disabled={disabled || isUploading}
									>
										<Ionicons name="camera" size={16} color="white" />
										<Text style={styles.uploadButtonText}>Photos</Text>
									</TouchableOpacity>
								)}

								{(uploadType === "document" || uploadType === "all") && (
									<TouchableOpacity
										style={styles.uploadButton}
										onPress={() => handleDocumentPicker(field)}
										disabled={disabled || isUploading}
									>
										<Ionicons name="document" size={16} color="white" />
										<Text style={styles.uploadButtonText}>Files</Text>
									</TouchableOpacity>
								)}
							</View>

							{isUploading && (
								<View style={styles.loadingOverlay}>
									<ActivityIndicator size="small" color={theme.palette.primary.main} />
								</View>
							)}
						</TouchableOpacity>

						{/* File Previews */}
						{hasFiles && (
							<View style={styles.previewContainer}>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<View style={styles.previewGrid}>
										{files.map((file: UploadFile, index: number) =>
											renderPreview
												? renderPreview(file, () => handleRemoveFile(index, field))
												: defaultRenderPreview(file, () => handleRemoveFile(index, field)),
										)}
									</View>
								</ScrollView>
							</View>
						)}

						{(error || helperText) && (
							<Text style={[styles.helperText, error && styles.errorText]}>
								{error ? error.message : helperText}
							</Text>
						)}
					</Animated.View>
				);
			}}
		/>
	);
};

export default RHFUpload;
