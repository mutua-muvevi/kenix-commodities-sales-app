// src/components/calendar/create-schedule.tsx
"use client";

import React, { useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
	Box,
	Button,
	Stack,
	MenuItem,
	Typography,
	Paper,
	alpha,
	useTheme,
} from "@mui/material";
import ModalComponent from "@/components/modal";
import {
	RHFTextField,
	RHFCheckbox,
	RHFDateTimePicker,
} from "@/components/hook-form";
import { RHFSelect } from "@/components/hook-form/rhf-select";
import { useScheduleCrud, useScheduleForm } from "@/store";
import { ScheduleFormData } from "@/store/slices/schedules/types";
import { Iconify } from "@/components/iconify";

// Validation schema
const createScheduleSchema = Yup.object({
	title: Yup.string()
		.required("Title is required")
		.max(100, "Title must be 100 characters or less"),
	description: Yup.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
	startDateTime: Yup.date()
		.required("Start date is required")
		.typeError("Invalid start date"),
	endDateTime: Yup.date()
		.required("End date is required")
		.typeError("Invalid end date")
		.test(
			"is-after-start",
			"End date must be after start date",
			function (value) {
				return value > this.parent.startDateTime;
			}
		),
	notificationSettings: Yup.object({
		email: Yup.boolean(),
		push: Yup.boolean(),
		minutesBefore: Yup.number()
			.oneOf([5, 10, 15, 30, 60, 1440])
			.required("Notification time is required"),
	}).optional(),
});

interface CreateScheduleProps {
	open: boolean;
	onClose: () => void;
	initialDate: Date | null;
	businessId?: string;
	onSuccess: () => void;
}

const notificationOptions = [
	{ value: 5, label: "5 minutes before" },
	{ value: 10, label: "10 minutes before" },
	{ value: 15, label: "15 minutes before" },
	{ value: 30, label: "30 minutes before" },
	{ value: 60, label: "1 hour before" },
	{ value: 1440, label: "1 day before" },
];

const CreateSchedule: React.FC<CreateScheduleProps> = ({
	open,
	onClose,
	initialDate,
	businessId,
	onSuccess,
}) => {
	const theme = useTheme();
	const { createSchedule, loading, error } = useScheduleCrud();
	const { resetCreateForm } = useScheduleForm();

	const methods = useForm<ScheduleFormData>({
		resolver: yupResolver(createScheduleSchema),
		defaultValues: {
			title: "",
			description: "",
			startDateTime: initialDate || new Date(),
			endDateTime: initialDate
				? new Date(initialDate.getTime() + 60 * 60 * 1000)
				: new Date(),
			notificationSettings: {
				email: true,
				push: true,
				minutesBefore: 15,
			},
		},
	});

	const { handleSubmit, reset, setValue, watch } = methods;
	const startDateTime = watch("startDateTime");

	// Update end time when start time changes
	useEffect(() => {
		if (startDateTime) {
			const newEndTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
			setValue("endDateTime", newEndTime);
		}
	}, [startDateTime, setValue]);

	// Reset form when modal opens
	useEffect(() => {
		if (open && initialDate) {
			const endDate = new Date(initialDate.getTime() + 60 * 60 * 1000);
			reset({
				title: "",
				description: "",
				startDateTime: initialDate,
				endDateTime: endDate,
				notificationSettings: {
					email: true,
					push: true,
					minutesBefore: 15,
				},
			});
		}
	}, [open, initialDate, reset]);

	const onSubmit = useCallback(
		async (data: ScheduleFormData) => {
			try {
				const token = sessionStorage.getItem("token") || "";
				if (!token) throw new Error("No authentication token");

				const payload = {
					...data,
					businessId: businessId || undefined,
				};

				await createSchedule(payload, token);
				resetCreateForm();
				reset();
				onSuccess();
				onClose();
			} catch (err) {
				console.error("Error creating schedule:", err);
			}
		},
		[createSchedule, resetCreateForm, reset, onClose, onSuccess, businessId]
	);

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<ModalComponent
			open={open}
			onClose={handleClose}
			title="Create New Schedule"
			maxWidth="sm"
			level="success"
			height="auto"
		>
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={3} sx={{ mt: 2 }}>
						{/* Error Display */}
						{error && (
							<Paper
								sx={{
									p: 2,
									bgcolor: alpha(theme.palette.error.main, 0.08),
									border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
								}}
							>
								<Typography variant="body2" color="error.main">
									{error}
								</Typography>
							</Paper>
						)}

						{/* Title */}
						<RHFTextField
							name="title"
							label="Schedule Title"
							placeholder="Enter schedule title..."
							InputProps={{
								startAdornment: (
									<Iconify
										icon="eva:edit-2-fill"
										sx={{
											color: theme.palette.text.disabled,
											mr: 1,
											fontSize: 20,
										}}
									/>
								),
							}}
						/>

						{/* Description */}
						<RHFTextField
							name="description"
							label="Description (Optional)"
							multiline
							rows={3}
							placeholder="Add description for your schedule..."
							InputProps={{
								startAdornment: (
									<Iconify
										icon="eva:file-text-fill"
										sx={{
											color: theme.palette.text.disabled,
											mr: 1,
											fontSize: 20,
											alignSelf: "flex-start",
											mt: 1,
										}}
									/>
								),
							}}
						/>

						{/* Date & Time Section */}
						<Paper
							sx={{
								p: 2,
								bgcolor: alpha(theme.palette.info.main, 0.04),
								border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
							}}
						>
							<Typography
								variant="subtitle2"
								color="info.main"
								fontWeight="600"
								sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Iconify icon="eva:calendar-fill" sx={{ fontSize: 18 }} />
								Date & Time
							</Typography>

							<Stack spacing={2}>
								<RHFDateTimePicker
									name="startDateTime"
									label="Start Date & Time"
								/>
								<RHFDateTimePicker name="endDateTime" label="End Date & Time" />
							</Stack>
						</Paper>

						{/* Notification Settings */}
						<Paper
							sx={{
								p: 2,
								bgcolor: alpha(theme.palette.warning.main, 0.04),
								border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
							}}
						>
							<Typography
								variant="subtitle2"
								color="warning.main"
								fontWeight="600"
								sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
							>
								<Iconify icon="eva:bell-fill" sx={{ fontSize: 18 }} />
								Notification Settings
							</Typography>

							<Stack spacing={2}>
								<Box sx={{ display: "flex", gap: 2 }}>
									<RHFCheckbox
										name="notificationSettings.email"
										label="Email Notification"
									/>
									<RHFCheckbox
										name="notificationSettings.push"
										label="Push Notification"
									/>
								</Box>

								<RHFSelect
									name="notificationSettings.minutesBefore"
									label="Notify Before"
									placeholder="Choose notification timing"
									helperText="Choose when to receive notifications"
									options={notificationOptions}
								/>
							</Stack>
						</Paper>

						{/* Action Buttons */}
						<Stack direction="row" spacing={2} sx={{ pt: 1 }}>
							<Button
								onClick={handleClose}
								disabled={loading}
								variant="outlined"
								fullWidth
								sx={{
									height: 48,
									fontWeight: 600,
								}}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={loading}
								fullWidth
								sx={{
									height: 48,
									fontWeight: 600,
									bgcolor: theme.palette.success.main,
									"&:hover": {
										bgcolor: theme.palette.success.dark,
									},
								}}
								startIcon={
									loading ? undefined : <Iconify icon="eva:plus-fill" />
								}
							>
								{loading ? "Creating..." : "Create Schedule"}
							</Button>
						</Stack>
					</Stack>
				</form>
			</FormProvider>
		</ModalComponent>
	);
};

export default CreateSchedule;
