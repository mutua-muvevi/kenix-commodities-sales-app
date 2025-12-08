
// ----------------------------------------------------------------------

import { ThemeTypes } from "@/theme/types";

export const tooltip = (theme: ThemeTypes) => {
	const lightMode = theme.palette.mode === "light";

	return {
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: theme.palette.grey[lightMode ? 800 : 700].toString(),
				},
				arrow: {
					color: theme.palette.grey[lightMode ? 800 : 700].toString(),
				},
			},
		},
	};
}
