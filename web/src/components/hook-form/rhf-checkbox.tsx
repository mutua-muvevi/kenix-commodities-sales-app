// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, useFormContext } from "react-hook-form";

import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel, {
	formControlLabelClasses,
} from "@mui/material/FormControlLabel";

// ----------------------------------------------------------------------
interface RHFCheckboxProps {
	helperText?: string;
	name: string;
	[key: string]: any;
}

export const RHFCheckbox = ({
	name,
	helperText,
	...other
}: RHFCheckboxProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<div>
					<FormControlLabel
						control={<Checkbox {...field} checked={field.value} />}
						{...other}
					/>

					{(!!error || helperText) && (
						<FormHelperText error={!!error}>
							{error ? error?.message : helperText}
						</FormHelperText>
					)}
				</div>
			)}
		/>
	);
};

// ----------------------------------------------------------------------
interface RHFMultiCheckboxProps {
	helperText?: string;
	label?: string;
	name: string;
	options: string[] | object[];
	row?: boolean;
	spacing?: number;
	sx?: object;
	[key: string]: any;
}

export const RHFMultiCheckbox = ({
	row,
	name,
	label,
	options,
	spacing,
	helperText,
	sx,
	...other
}: RHFMultiCheckboxProps) => {
	const { control } = useFormContext();

	const getSelected = (selectedItems, item) =>
		selectedItems.includes(item)
			? selectedItems.filter((value) => value !== item)
			: [...selectedItems, item];

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<FormControl component="fieldset">
					{label && (
						<FormLabel component="legend" sx={{ typography: "body2" }}>
							{label}
						</FormLabel>
					)}

					<FormGroup
						sx={{
							...(row && {
								flexDirection: "row",
							}),
							[`& .${formControlLabelClasses.root}`]: {
								"&:not(:last-of-type)": {
									mb: spacing || 0,
								},
								...(row && {
									mr: 0,
									"&:not(:last-of-type)": {
										mr: spacing || 2,
									},
								}),
							},
							...sx,
						}}
					>
						{options.map((option: any) => (
							<FormControlLabel
								key={option.value}
								control={
									<Checkbox
										checked={field.value.includes(option.value)}
										onChange={() =>
											field.onChange(getSelected(field.value, option.value))
										}
									/>
								}
								label={option.label}
								{...other}
							/>
						))}
					</FormGroup>

					{(!!error || helperText) && (
						<FormHelperText error={!!error} sx={{ mx: 0 }}>
							{error ? error?.message : helperText}
						</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	);
};
