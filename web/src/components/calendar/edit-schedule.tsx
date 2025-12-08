// src/components/calendar/edit-schedule.tsx - FIXED
"use client";

import React, { useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Box, Button, ButtonGroup, Stack, Alert } from "@mui/material";
import ModalComponent from "@/components/modal";
import { RHFTextField, RHFCheckbox, RHFDateTimePicker } from "@/components/hook-form";
import { useScheduleCrud, useScheduleForm } from "@/store";
import { Schedule, ScheduleFormData } from "@/store/slices/schedules/types";

// Validation schema
const editScheduleSchema = Yup.object({
	title: Yup.string().required("Title is required").max(100, "Title must be 100 characters or less"),
	description: Yup.string().max(500, "Description must be 500 characters or less").optional(),
	startDateTime: Yup.date().required("Start date is required").typeError("Invalid start date"),
	endDateTime: Yup.date()
		.required("End date is required")
		.typeError("Invalid end date")
		.test("is-after-start", "End date must be after start date", function (value) {
			return value > this.parent.startDateTime;
		}),
	notificationSettings: Yup.object({
		email: Yup.boolean(),
		push: Yup.boolean(),
		minutesBefore: Yup.number().oneOf([5, 10, 15, 30, 60, 1440]).required("Notification time is required"),
	}).optional(),
});

interface EditScheduleProps {
	open: boolean;
	onClose: () => void;
	schedule: Schedule | null;
	onSuccess: () => void;
	onDelete?: (scheduleId: string) => void;
}

const EditSchedule: React.FC<EditScheduleProps> = ({ 
	open, 
	onClose, 
	schedule, 
	onSuccess,
	onDelete 
}) => {
	const { updateSchedule, loading } = useScheduleCrud();
	const { resetEditForm } = useScheduleForm();

	// FIXED: Convert schedule data to form format
	const getFormData = (schedule: Schedule | null): ScheduleFormData => {
		if (!schedule) {
			return {
				title: "",
				description: "",
				startDateTime: new Date().toISOString(),
				endDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
				notificationSettings: { email: true, push: true, minutesBefore: 15 },
			};
		}

		return {
			title: schedule.title || "",
			description: schedule.description || "",
			startDateTime: new Date(schedule.startDateTime).toISOString(),
			endDateTime: new Date(schedule.endDateTime).toISOString(),
			notificationSettings: {
				email: schedule.notificationSettings?.email ?? true,
				push: schedule.notificationSettings?.push ?? true,
				minutesBefore: schedule.notificationSettings?.minutesBefore ?? 15,
			},
		};
	};

	const methods = useForm<ScheduleFormData>({
		resolver: yupResolver(editScheduleSchema),
		defaultValues: getFormData(schedule),
	});

	const { handleSubmit, reset, formState: { isDirty } } = methods;

	// FIXED: Update form when schedule changes or modal opens
	useEffect(() => {
		if (open && schedule) {
			const formData = getFormData(schedule);
			reset(formData);
			// console.log('📝 Edit Schedule opened with data:', formData);
			// console.log('📋 Original schedule:', schedule);
		}
	}, [open, schedule, reset]);

	const onSubmit = useCallback(
		async (data: ScheduleFormData) => {
			if (!schedule?._id) {
				console.error('❌ No schedule ID provided');
				return;
			}

			try {
				// console.log('📤 Updating schedule with data:', data);
				const token = sessionStorage.getItem("token") || "";
				if (!token) throw new Error("No authentication token");
				
				// Format data for server
				const payload = {
					...data,
					startDateTime: new Date(data.startDateTime).toISOString(),
					endDateTime: new Date(data.endDateTime).toISOString(),
				};
				
				await updateSchedule(schedule._id, payload, token);
				resetEditForm(schedule._id);
				onSuccess();
				onClose();
			} catch (err) {
				console.error('❌ Update schedule error:', err);
			}
		},
		[updateSchedule, resetEditForm, onClose, onSuccess, schedule],
	);

	const handleDelete = useCallback(() => {
		if (!schedule?._id) return;
		if (onDelete) {
			onDelete(schedule._id);
		}
	}, [schedule, onDelete]);

	const handleClose = useCallback(() => {
		if (schedule) {
			resetEditForm(schedule._id);
		}
		onClose();
	}, [onClose, resetEditForm, schedule]);

	// Don't render if no schedule
	if (!schedule) {
		return null;
	}

	return (
		<ModalComponent 
			open={open} 
			onClose={handleClose} 
			title={`Edit Schedule: ${schedule.title}`} 
			maxWidth="sm" 
			level="warning"
		>
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack direction="column" spacing={3}>
						{/* Show which schedule is being edited */}
						<Alert severity="info" sx={{ mt: 1 }}>
							Editing schedule created on {new Date(schedule.createdAt).toLocaleDateString()}
						</Alert>

						<RHFTextField 
							name="title" 
							label="Schedule Title" 
							placeholder="Enter a descriptive title..."
						/>
						<RHFTextField 
							name="description" 
							label="Description" 
							multiline 
							rows={3}
							placeholder="Add any additional details..."
						/>
						<RHFDateTimePicker 
							name="startDateTime" 
							label="Start Date & Time" 
						/>
						<RHFDateTimePicker 
							name="endDateTime" 
							label="End Date & Time" 
						/>

						<Box>
							<RHFCheckbox 
								name="notificationSettings.email" 
								label="Send email notification" 
							/>
							<RHFCheckbox 
								name="notificationSettings.push" 
								label="Send push notification" 
							/>
							<RHFTextField
								name="notificationSettings.minutesBefore"
								label="Notify me before (minutes)"
								type="number"
								helperText="Choose: 5, 10, 15, 30, 60, or 1440 (1 day)"
								sx={{ mt: 1 }}
							/>
						</Box>

						<ButtonGroup 
							size="large" 
							sx={{ 
								display: 'flex', 
								justifyContent: 'space-between',
								'& > *': { flex: 1 }
							}}
						>
							<Button 
								onClick={handleClose} 
								disabled={loading}
								variant="outlined"
							>
								Cancel
							</Button>
							<Button 
								type="submit" 
								variant="contained" 
								disabled={loading || !isDirty}
								color="warning"
							>
								{loading ? "Saving..." : "Update Schedule"}
							</Button>
							{onDelete && (
								<Button 
									color="error" 
									onClick={handleDelete} 
									disabled={loading}
									variant="outlined"
								>
									Delete
								</Button>
							)}
						</ButtonGroup>
					</Stack>
				</form>
			</FormProvider>
		</ModalComponent>
	);
};

export default EditSchedule;