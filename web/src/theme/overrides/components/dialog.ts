// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// ----------------------------------------------------------------------

import { ThemeTypes } from "@/theme/types";

export const dialog = (theme: ThemeTypes) => {
	return {
		MuiDialog: {
			styleOverrides: {
				paper: ({ ownerState }: { ownerState: { fullScreen: boolean } }) => ({
					boxShadow: theme.customShadows.dialog,
					borderRadius: theme.shape.borderRadius ,
					...(!ownerState.fullScreen && {
						margin: theme.spacing(2),
					}),
				}),
				paperFullScreen: {
					borderRadius: 0,
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					padding: theme.spacing(3),
				},
			},
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					padding: theme.spacing(0, 3),
				},
				dividers: {
					borderTop: 0,
					borderBottomStyle: "dashed",
					paddingBottom: theme.spacing(3),
				},
			},
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					padding: theme.spacing(3),
					"& > :not(:first-of-type)": {
						marginLeft: theme.spacing(1.5),
					},
				},
			},
		},
	};
};
