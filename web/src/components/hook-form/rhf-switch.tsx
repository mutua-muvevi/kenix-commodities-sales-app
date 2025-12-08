// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, useFormContext } from "react-hook-form";

import Switch from "@mui/material/Switch";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";

// ----------------------------------------------------------------------
interface RHFSwitchProps {
	name: string;
	helperText?: string;
	[key: string]: any;
}

const RHFSwitch = ({ name, helperText, ...other }: RHFSwitchProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<div>
					<FormControlLabel
						control={<Switch {...field} checked={field.value} />}
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

export default RHFSwitch;
