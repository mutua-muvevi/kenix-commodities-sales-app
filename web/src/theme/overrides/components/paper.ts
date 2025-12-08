import { ThemeTypes } from "@/theme/types";
import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export const paper = (theme: ThemeTypes) => {
	return {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
				outlined: {
					borderColor: alpha(theme.palette.grey[500].toString(), 0.16),
				},
			},
		},
	};
};
