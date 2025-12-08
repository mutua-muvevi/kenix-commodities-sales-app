import { ThemeTypes } from "@/theme/types";

export const timeline = (theme: ThemeTypes) => {
	return {
		MuiTimelineDot: {
			styleOverrides: {
				root: {
					boxShadow: "none",
				},
			},
		},
		MuiTimelineConnector: {
			styleOverrides: {
				root: {
					backgroundColor: theme.palette.divider,
				},
			},
		},
	};
};
