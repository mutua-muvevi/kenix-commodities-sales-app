// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ThemeTypes } from "@/theme/types";

export const card = (theme : ThemeTypes) => {
	return {
		MuiCard: {
			styleOverrides: {
				root: {
					position: "relative",
					boxShadow: theme.customShadows.card,
					borderRadius: theme.shape.borderRadius ,
					zIndex: 0, // Fix Safari overflow: hidden with border radius
				},
			},
		},
		MuiCardHeader: {
			styleOverrides: {
				root: {
					padding: theme.spacing(3, 3, 0),
				},
			},
		},
		MuiCardContent: {
			styleOverrides: {
				root: {
					padding: theme.spacing(3),
				},
			},
		},
	};
}
