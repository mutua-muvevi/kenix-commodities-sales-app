import { ThemeTypes } from "@/theme/types";
// ----------------------------------------------------------------------


export const stepper = (theme: ThemeTypes) => {
	return {
		MuiStepConnector: {
			styleOverrides: {
				line: {
					borderColor: theme.palette.divider,
				},
			},
		},
	};
}
