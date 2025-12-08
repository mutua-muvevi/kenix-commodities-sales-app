// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ThemeTypes } from "@/theme/types";
import { tabClasses } from "@mui/material/Tab";

// ----------------------------------------------------------------------

export const tabs = (theme: ThemeTypes) => {
	return {
		MuiTabs: {
			styleOverrides: {
				indicator: {
					backgroundColor: theme.palette.text.primary,
				},
				scrollButtons: {
					width: 48,
					borderRadius: "50%",
				},
			},
		},
		MuiTab: {
			styleOverrides: {
				root: {
					padding: 0,
					opacity: 1,
					minWidth: 48,
					minHeight: 48,
					fontWeight: theme.typography.fontWeightSemiBold,
					"&:not(:last-of-type)": {
						marginRight: theme.spacing(3),
						[theme.breakpoints.up("sm")]: {
							marginRight: theme.spacing(5),
						},
					},
					[`&:not(.${tabClasses.selected})`]: {
						color: theme.palette.text.secondary,
					},
				},
			},
		},
	};
};
