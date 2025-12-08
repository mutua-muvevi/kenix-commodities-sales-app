// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { alpha } from "@mui/material/styles";
import { linearProgressClasses } from "@mui/material/LinearProgress";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"];

// ----------------------------------------------------------------------

export const progress = (theme: ThemeTypes) => {
	const rootStyles = (ownerState: { color: string; variant: string }) => {
		const bufferVariant = ownerState.variant === "buffer";

		const defaultStyle = {
			borderRadius: 4,
			[`& .${linearProgressClasses.bar}`]: {
				borderRadius: 4,
			},
			...(bufferVariant && {
				backgroundColor: "transparent",
			}),
		};

		const colorStyle = COLORS.map((color) => ({
			...(ownerState.color === color && {
				backgroundColor: alpha(theme.palette[color].main, 0.24),
			}),
		}));

		return [defaultStyle, ...colorStyle];
	};

	return {
		MuiLinearProgress: {
			styleOverrides: {
				/* eslint-disable @typescript-eslint/no-explicit-any */
				root: ({ ownerState } : any) => rootStyles(ownerState),
			},
		},
	};
};
