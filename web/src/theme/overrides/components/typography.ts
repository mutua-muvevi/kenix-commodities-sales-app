import { ThemeTypes } from "@/theme/types";
// ----------------------------------------------------------------------


export const typography = (theme: ThemeTypes) => {
	return {
		MuiTypography: {
			styleOverrides: {
				paragraph: {
					marginBottom: theme.spacing(2),
				},
				gutterBottom: {
					marginBottom: theme.spacing(1),
				},
			},
		},
	};
};
