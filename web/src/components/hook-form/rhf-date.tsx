// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { Controller, useFormContext } from "react-hook-form";
import { parseISO, isValid } from "date-fns";

interface RHFDatePickerProps {
	name: string;
	helperText?: string | object | any;
	type?: string;
	[key: string]: any;
}

export const RHFDatePicker = ({
	name,
	helperText,
	//   type,
	...other
}: RHFDatePickerProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => {
				// Convert string to Date object if necessary
				const value = field.value ? (typeof field.value === "string" ? parseISO(field.value) : field.value) : null;

				return (
					<DesktopDatePicker
						{...field}
						value={isValid(value) ? value : null} // Ensure valid Date or null
						onChange={(date) => {
							// Pass the Date object directly or convert to ISO string if needed
							field.onChange(date ? date : null);
						}}
						slotProps={{
							textField: {
								fullWidth: true,
								error: !!error,
								helperText: error ? error.message : helperText,
							},
						}}
						{...other}
					/>
				);
			}}
		/>
	);
};
