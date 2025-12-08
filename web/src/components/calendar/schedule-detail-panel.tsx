// src/components/calendar/schedule-detail-panel.tsx
"use client";

import React from "react";
import {
	Box,
	Typography,
	IconButton,
	Divider,
	Chip,
	Stack,
	Paper,
	Avatar,
	Button,
	useTheme,
	alpha,
} from "@mui/material";
import {
	format,
	isToday,
	isTomorrow,
	isYesterday,
	formatDistanceToNow,
} from "date-fns";
import { Iconify } from "@/components/iconify";
import { Schedule } from "@/store/slices/schedules/types";

interface ScheduleDetailPanelProps {
	schedule: Schedule | null;
	onClose: () => void;
	onEdit: (schedule: Schedule) => void;
	onDelete: (schedule: Schedule) => void;
}

const ScheduleDetailPanel: React.FC<ScheduleDetailPanelProps> = ({
	schedule,
	onClose,
	onEdit,
	onDelete,
}) => {
	const theme = useTheme();

	if (!schedule) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="body2" color="text.secondary" align="center">
					No schedule selected
				</Typography>
			</Box>
		);
	}

	const startDate = new Date(schedule.startDateTime);
	const endDate = new Date(schedule.endDateTime);
	const now = new Date();
	const isUpcoming = startDate > now;
	const isOngoing = startDate <= now && endDate >= now;
	const isPast = endDate < now;

	// Format date display
	const formatDate = (date: Date) => {
		if (isToday(date)) return "Today";
		if (isTomorrow(date)) return "Tomorrow";
		if (isYesterday(date)) return "Yesterday";
		return format(date, "MMM dd, yyyy");
	};

	// Get status info
	const getStatusInfo = () => {
		if (isOngoing) {
			return {
				label: "Ongoing",
				color: "success" as const,
				icon: "eva:play-circle-fill",
			};
		}
		if (isUpcoming) {
			return {
				label: `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`,
				color: "info" as const,
				icon: "eva:clock-fill",
			};
		}
		return {
			label: "Completed",
			color: "default" as const,
			icon: "eva:checkmark-circle-2-fill",
		};
	};

	const statusInfo = getStatusInfo();

	const getNotificationText = () => {
		if (!schedule.notificationSettings) return "No notifications";

		const { email, push, minutesBefore } = schedule.notificationSettings;
		const methods = [];
		if (email) methods.push("Email");
		if (push) methods.push("Push");

		if (methods.length === 0) return "No notifications";

		let timeText = "";
		if (minutesBefore === 1440) timeText = "1 day before";
		else if (minutesBefore === 60) timeText = "1 hour before";
		else timeText = `${minutesBefore} minutes before`;

		return `${methods.join(" & ")} • ${timeText}`;
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<Box
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					bgcolor: alpha(theme.palette.primary.main, 0.08),
					borderBottom: `1px solid ${theme.palette.divider}`,
				}}
			>
				<Typography variant="h6" color="primary.main" fontWeight="600">
					Schedule Details
				</Typography>
				<IconButton onClick={onClose} size="small">
					<Iconify icon="eva:close-fill" />
				</IconButton>
			</Box>

			{/* Content */}
			<Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
				<Stack spacing={3}>
					{/* Status */}
					<Box>
						<Chip
							icon={<Iconify icon={statusInfo.icon} />}
							label={statusInfo.label}
							color={statusInfo.color}
							variant="soft"
							size="small"
						/>
					</Box>

					{/* Title */}
					<Box>
						<Typography variant="h5" fontWeight="700" gutterBottom>
							{schedule.title}
						</Typography>
						{schedule.description && (
							<Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
								{schedule.description}
							</Typography>
						)}
					</Box>

					{/* Date & Time Info */}
					<Paper
						sx={{
							p: 2,
							bgcolor: alpha(theme.palette.grey[500], 0.04),
							border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
						}}
					>
						<Stack spacing={2}>
							{/* Start Date */}
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Avatar
									sx={{
										bgcolor: theme.palette.success.main,
										width: 32,
										height: 32,
									}}
								>
									<Iconify icon="eva:calendar-fill" sx={{ fontSize: 16 }} />
								</Avatar>
								<Box>
									<Typography variant="subtitle2" fontWeight="600">
										Starts
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{formatDate(startDate)} at {format(startDate, "h:mm a")}
									</Typography>
								</Box>
							</Box>

							<Divider />

							{/* End Date */}
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Avatar
									sx={{
										bgcolor: theme.palette.error.main,
										width: 32,
										height: 32,
									}}
								>
									<Iconify icon="eva:clock-fill" sx={{ fontSize: 16 }} />
								</Avatar>
								<Box>
									<Typography variant="subtitle2" fontWeight="600">
										Ends
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{formatDate(endDate)} at {format(endDate, "h:mm a")}
									</Typography>
								</Box>
							</Box>

							{/* Duration */}
							<Box
								sx={{
									mt: 1,
									p: 1,
									bgcolor: alpha(theme.palette.info.main, 0.08),
									borderRadius: 1,
								}}
							>
								<Typography
									variant="caption"
									color="info.main"
									fontWeight="600"
									sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
								>
									<Iconify icon="eva:clock-outline" sx={{ fontSize: 14 }} />
									Duration:{" "}
									{formatDistanceToNow(startDate, {
										includeSeconds: false,
									})} to{" "}
									{formatDistanceToNow(endDate, { includeSeconds: false })}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					{/* Notifications */}
					<Paper
						sx={{
							p: 2,
							bgcolor: alpha(theme.palette.warning.main, 0.04),
							border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Avatar
								sx={{
									bgcolor: theme.palette.warning.main,
									width: 32,
									height: 32,
								}}
							>
								<Iconify icon="eva:bell-fill" sx={{ fontSize: 16 }} />
							</Avatar>
							<Box>
								<Typography variant="subtitle2" fontWeight="600">
									Notifications
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{getNotificationText()}
								</Typography>
							</Box>
						</Box>
					</Paper>

					{/* Creator Info */}
					{schedule.createdBy && (
						<Paper
							sx={{
								p: 2,
								bgcolor: alpha(theme.palette.grey[500], 0.04),
								border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Avatar
									sx={{
										bgcolor: theme.palette.grey[400],
										width: 32,
										height: 32,
									}}
								>
									<Iconify icon="eva:person-fill" sx={{ fontSize: 16 }} />
								</Avatar>
								<Box>
									<Typography variant="subtitle2" fontWeight="600">
										Created by
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{schedule.createdBy.email}
									</Typography>
								</Box>
							</Box>
						</Paper>
					)}

					{/* Timestamps */}
					<Box sx={{ pt: 1 }}>
						<Typography variant="caption" color="text.disabled" display="block">
							Created:{" "}
							{format(new Date(schedule.createdAt), "MMM dd, yyyy 'at' h:mm a")}
						</Typography>
						<Typography variant="caption" color="text.disabled" display="block">
							Updated:{" "}
							{format(new Date(schedule.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
						</Typography>
					</Box>
				</Stack>
			</Box>

			{/* Action Buttons */}
			<Box
				sx={{
					p: 2,
					borderTop: `1px solid ${theme.palette.divider}`,
					bgcolor: alpha(theme.palette.grey[500], 0.04),
				}}
			>
				<Stack direction="row" spacing={1}>
					<Button
						variant="contained"
						startIcon={<Iconify icon="eva:edit-2-fill" />}
						onClick={() => onEdit(schedule)}
						fullWidth
						sx={{
							bgcolor: theme.palette.primary.main,
							"&:hover": {
								bgcolor: theme.palette.primary.dark,
							},
						}}
					>
						Edit
					</Button>
					<Button
						variant="outlined"
						color="error"
						startIcon={<Iconify icon="eva:trash-2-fill" />}
						onClick={() => onDelete(schedule)}
						fullWidth
					>
						Delete
					</Button>
				</Stack>
			</Box>
		</Box>
	);
};

export default ScheduleDetailPanel;
