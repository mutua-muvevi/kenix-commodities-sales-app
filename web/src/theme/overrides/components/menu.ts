import { ThemeTypes } from "@/theme/types";
import { menuItem } from "../../css";

// ----------------------------------------------------------------------

export const menu = (theme: ThemeTypes) => {
	return {
		MuiMenuItem: {
			styleOverrides: {
				root: {
					...menuItem(theme),
				},
			},
		},
	};
};
