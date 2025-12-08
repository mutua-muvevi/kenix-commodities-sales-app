// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { alpha } from "@mui/material/styles";
import { alertClasses } from "@mui/material/Alert";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------

const COLORS = ["info", "success", "warning", "error"];

// ----------------------------------------------------------------------

export const alert = (theme: ThemeTypes) => {
	const lightMode = theme.palette.mode === "light";

	const rootStyles = (ownerState: { variant: string; severity: string }) => {
		const standardVariant = ownerState.variant === "standard";

		const filledVariant = ownerState.variant === "filled";

		const outlinedVariant = ownerState.variant === "outlined";


		const colorStyle = COLORS.map((color) => ({
			...(ownerState.severity === color && {
				// STANDARD
				...(standardVariant && {

					color: theme.palette[color][lightMode ? "darker" : "lighter"],
					backgroundColor:
						theme.palette[color][lightMode ? "lighter" : "darker"],
					[`& .${alertClasses.icon}`]: {
						color: theme.palette[color][lightMode ? "main" : "light"],
					},
				}),

				// FILLED
				...(filledVariant && {
					color: theme.palette[color].contrastText,
					backgroundColor: theme.palette[color].main,
				}),
				
				// OUTLINED
				...(outlinedVariant && {
					backgroundColor: alpha(theme.palette[color].main, 0.08),
					color: theme.palette[color][lightMode ? "dark" : "light"],
					border: `solid 1px ${alpha(theme.palette[color].main, 0.16)}`,
					[`& .${alertClasses.icon}`]: {
						color: theme.palette[color].main,
					},
				}),
			}),
		}));

		return [...colorStyle];
	};

	return {
		MuiAlert: {
			styleOverrides: {
				/* eslint-disable @typescript-eslint/no-explicit-any */
				root: ({ ownerState }: any) => rootStyles(ownerState),
				icon: {
					opacity: 1,
				},
			},
		},
		MuiAlertTitle: {
			styleOverrides: {
				root: {
					marginBottom: theme.spacing(0.5),
					fontWeight: theme.typography.fontWeightBold,
				},
			},
		},
	};
};
