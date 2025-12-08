// src/components/hook-form/rhf-date-time.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { parseISO, isValid } from "date-fns";
import { TextField, InputAdornment } from "@mui/material";
import { Iconify } from "@/components/iconify";

interface RHFDateTimePickerProps {
	name: string;
	label?: string;
	helperText?: string | object | any;
	use12Hour?: boolean; // Optional: toggle between 24-hour and AM/PM format
	[key: string]: any;
}

export const RHFDateTimePicker: React.FC<RHFDateTimePickerProps> = ({
	name,
	label,
	helperText,
	use12Hour = false,
	...other
}) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => {
				// Convert string to Date object if necessary
				const value = field.value
					? typeof field.value === "string"
						? parseISO(field.value)
						: field.value
					: null;

				return (
					<DesktopDateTimePicker
						{...field}
						value={isValid(value) ? value : null}
						onChange={(date) => {
							field.onChange(date ? date : null);
						}}
						format={use12Hour ? "MM/dd/yyyy hh:mm a" : "MM/dd/yyyy HH:mm"}
						slotProps={{
							textField: {
								fullWidth: true,
								error: !!error,
								helperText: error ? error.message : helperText,
								InputProps: {
									startAdornment: (
										<InputAdornment position="start">
											<Iconify
												icon="mdi:calendar-clock"
												sx={{ color: "text.secondary" }}
											/>
										</InputAdornment>
									),
								},
							},
						}}
						{...other}
					/>
				);
			}}
		/>
	);
};

export default RHFDateTimePicker;
