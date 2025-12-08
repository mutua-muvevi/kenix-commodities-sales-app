import { listClasses } from "@mui/material/List";

import { paper } from "../../css";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------

export const popover = (theme: ThemeTypes) => {
	return {
		MuiPopover: {
			styleOverrides: {
				paper: {
					...paper({ theme, dropdown: true }),
					[`& .${listClasses.root}`]: {
						paddingTop: 0,
						paddingBottom: 0,
					},
				},
			},
		},
	};
};
