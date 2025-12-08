
import { ThemeTypes } from "@/theme/types";
import { radioClasses } from "@mui/material/Radio";

// ----------------------------------------------------------------------

export function radio(theme: ThemeTypes) {
	return {
		// CHECKBOX, RADIO, SWITCH
		MuiFormControlLabel: {
			styleOverrides: {
				label: {
					...theme.typography.body2,
				},
			},
		},
		MuiRadio: {
			styleOverrides: {
				/* eslint-disable @typescript-eslint/no-explicit-any */
				root: ({ ownerState } : any) => {
					const { color } = ownerState;

					return {
						padding: theme.spacing(1),
						...(color === "default" && {
							[`&.${radioClasses.checked}`]: {
								color: theme.palette.text.primary,
							},
						}),
						[`&.${radioClasses.disabled}`]: {
							color: theme.palette.action.disabled,
						},
					};
				},
			},
		},
	};
}
