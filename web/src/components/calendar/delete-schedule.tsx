// src/components/calendar/delete-schedule.tsx
"use client";

import React, { useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import ModalComponent from "@/components/modal";
import { useScheduleCrud, useScheduleForm } from "@/store";

interface DeleteScheduleProps {
	open: boolean;
	onClose: () => void;
	scheduleId: string | null;
	onSuccess: () => void;
}

const DeleteSchedule: React.FC<DeleteScheduleProps> = ({ open, onClose, scheduleId, onSuccess }) => {
	const { deleteSchedule, loading } = useScheduleCrud();
	const { resetEditForm } = useScheduleForm();

	const handleDelete = useCallback(async () => {
		if (!scheduleId) return;
		try {
			const token = sessionStorage.getItem("token") || "";
			if (!token) throw new Error("No authentication token");
			await deleteSchedule(scheduleId, token);
			resetEditForm(scheduleId);
			onSuccess();
			onClose();
		} catch (err) {
			console.error(err);
		}
	}, [deleteSchedule, resetEditForm, scheduleId, onSuccess, onClose]);

	return (
		<ModalComponent open={open} onClose={onClose} title="Delete Schedule" maxWidth="xs" level="error" height="300">
			<Box sx={{ mt: 2 }}>
				<Typography>Are you sure you want to delete this schedule?</Typography>
				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
					<Button onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button color="error" onClick={handleDelete} disabled={loading}>
						Delete
					</Button>
				</Box>
			</Box>
		</ModalComponent>
	);
};

export default DeleteSchedule;
