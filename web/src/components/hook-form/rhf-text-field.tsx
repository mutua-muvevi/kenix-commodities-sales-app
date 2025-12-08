/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, useFormContext } from "react-hook-form";

import TextField from "@mui/material/TextField";

// ----------------------------------------------------------------------
interface RHFTextFieldProps {
	name: string;
	helperText?: string | object | any;
	type?: string;
	defaultValue?: string;
	[key: string]: any;
}

const RHFTextField = ({
	name,
	helperText,
	type,
	defaultValue,
	...other
}: RHFTextFieldProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue || ""}
			render={({ field, fieldState: { error } }) => (
				<TextField
					{...field}
					fullWidth
					type={type}
					value={type === "number" && field.value === 0 ? "" : field.value}
					onChange={(event) => {
						if (type === "number") {
							field.onChange(Number(event.target.value));
						} else {
							field.onChange(event.target.value);
						}
					}}
					error={!!error}
					helperText={error ? error?.message : helperText}
					{...other}
				/>
			)}
		/>
	);
};

export default RHFTextField;
