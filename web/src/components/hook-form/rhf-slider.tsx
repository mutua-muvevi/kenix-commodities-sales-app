/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useFormContext } from "react-hook-form";

import Slider from "@mui/material/Slider";
import FormHelperText from "@mui/material/FormHelperText";

// ----------------------------------------------------------------------
interface RHFSliderProps {
	name: string;
	helperText?: string;
	[key: string]: any;
}

const RHFSlider = ({ name, helperText, ...other }: RHFSliderProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<>
					<Slider {...field} valueLabelDisplay="auto" {...other} />

					{(!!error || helperText) && (
						<FormHelperText error={!!error}>
							{error ? error?.message : helperText}
						</FormHelperText>
					)}
				</>
			)}
		/>
	);
};

export default RHFSlider;
