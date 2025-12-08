/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeTypes } from "@/theme/types";
import { checkboxClasses } from "@mui/material/Checkbox";

// ----------------------------------------------------------------------

export const checkbox = (theme: ThemeTypes) => {
	return {
		MuiCheckbox: {
			styleOverrides: {
				root: ({ ownerState }: any) => {
					const { color } = ownerState;

					return {
						padding: theme.spacing(1),
						...(color === "default" && {
							[`&.${checkboxClasses.checked}`]: {
								color: theme.palette.text.primary,
							},
						}),
						[`&.${checkboxClasses.disabled}`]: {
							color: theme.palette.action.disabled,
						},
					};
				},
			},
		},
	};
};
