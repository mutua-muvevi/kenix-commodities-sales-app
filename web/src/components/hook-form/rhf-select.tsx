// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, useFormContext } from "react-hook-form";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { Typography } from "@mui/material";

// ----------------------------------------------------------------------
interface RHFSelectProps {
	PaperPropsSx?: object;
	options: {
		value: string;
		label: string;
		[key: any]: any;
	}[];
	helperText?: object | string;
	maxHeight?: number;
	name: string;
	native?: boolean;
	placeholder?: string;
	[key: string]: any;
}

export const RHFSelect = ({
	name,
	native,
	maxHeight = 220,
	helperText,
	options,
	PaperPropsSx,
	placeholder,
	...other
}: RHFSelectProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<TextField
					{...field}
					select
					fullWidth
					SelectProps={{
						native,
						displayEmpty: true,
						MenuProps: {
							PaperProps: {
								sx: {
									...(!native && {
										maxHeight:
											typeof maxHeight === "number"
												? maxHeight
												: "unset",
									}),
									...PaperPropsSx,
								},
							},
						},
						sx: { textTransform: "capitalize" },
					}}
					error={!!error}
					helperText={error ? error?.message : helperText}
					{...other}
				>
					{/* Add a disabled option to simulate a placeholder */}
					{placeholder && (
						<MenuItem value="" disabled>
							<Typography variant="body2" color="text.disabled">
								{placeholder}
							</Typography>
						</MenuItem>
					)}

					{options.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
			)}
		/>
	);
};

// ----------------------------------------------------------------------
interface RHFMultiSelectProps {
	checkbox: boolean;
	chip: boolean;
	helperText?: object;
	label?: string;
	name: string;
	options: object[] | number[] | string[];
	placeholder?: string;
}

export const RHFMultiSelect = ({
	name,
	chip,
	label,
	options,
	checkbox,
	placeholder,
	helperText,
	...other
}: RHFMultiSelectProps) => {
	const { control } = useFormContext();

	const renderValues = (selectedIds) => {
		const selectedItems = options.filter((item) =>
			selectedIds.includes(item.value),
		);

		if (!selectedItems.length && placeholder) {
			return <Box sx={{ color: "text.disabled" }}>{placeholder}</Box>;
		}

		if (chip) {
			return (
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
					{selectedItems.map((item) => (
						<Chip
							key={item.value}
							size="small"
							label={item.label}
						/>
					))}
				</Box>
			);
		}

		return selectedItems.map((item) => item.label).join(", ");
	};

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<FormControl error={!!error} {...other}>
					{label && <InputLabel id={name}> {label} </InputLabel>}

					<Select
						{...field}
						multiple
						displayEmpty={!!placeholder}
						id={`multiple-${name}`}
						labelId={name}
						label={label}
						renderValue={renderValues}
					>
						{options.map((option) => {
							const selected = field.value.includes(option.value);

							return (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{checkbox && (
										<Checkbox
											size="small"
											disableRipple
											checked={selected}
										/>
									)}

									{option.label}
								</MenuItem>
							);
						})}
					</Select>

					{(!!error || helperText) && (
						<FormHelperText error={!!error}>
							{error ? error?.message : helperText}
						</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	);
};
