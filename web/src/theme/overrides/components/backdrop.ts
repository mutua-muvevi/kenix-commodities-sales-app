import { ThemeTypes } from "@/theme/types";
import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export const backdrop = (theme: ThemeTypes) => {
	return {
		MuiBackdrop: {
			styleOverrides: {
				root: {
					backgroundColor: alpha(theme.palette.grey[900].toString(), 0.8),
				},
				invisible: {
					background: "transparent",
				},
			},
		},
	};
}
