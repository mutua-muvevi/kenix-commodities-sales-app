/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useFormContext } from "react-hook-form";
import { Rating, Box } from "@mui/material";
import Iconify from "../iconify";

// Labels for rating feedback
const labels: { [index: string]: string } = {
	0.5: "Useless",
	1: "Useless+",
	1.5: "Poor",
	2: "Poor+",
	2.5: "Ok",
	3: "Ok+",
	3.5: "Good",
	4: "Good+",
	4.5: "Excellent",
	5: "Excellent+",
};

// Function to get label text
const getLabelText = (value: number) => {
	return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
};

// ----------------------------------------------------------------------
interface RHFRatingProps {
	name: string;
	helperText?: string | object | any;
	precision?: number;
	defaultValue?: number;
	[key: string]: any;
}

const RHFRating = ({ name, helperText, precision = 0.5, defaultValue = 0, ...other }: RHFRatingProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			render={({ field, fieldState: { error } }) => (
				<Box>
					<Rating
						{...field}
						precision={precision}
						value={field.value}
						onChange={(event, newValue) => {
							field.onChange(newValue);
						}}
						getLabelText={getLabelText}
						emptyIcon={
							<Iconify
								icon="eva:star-outline"
								sx={{ opacity: 0.55, color: "text.secondary" }}
								fontSize="inherit"
							/>
						}
						{...other}
					/>
					{field.value !== null && (
						<Box sx={{ ml: 2, color: error ? "error.main" : "text.secondary" }}>{labels[field.value]}</Box>
					)}
					{(error || helperText) && (
						<Box
							sx={{
								ml: 2,
								color: error ? "error.main" : "text.secondary",
								fontSize: "0.75rem",
							}}
						>
							{error ? error.message : helperText}
						</Box>
					)}
				</Box>
			)}
		/>
	);
};

export default RHFRating;
