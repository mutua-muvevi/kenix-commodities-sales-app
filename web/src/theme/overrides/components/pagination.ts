// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { alpha } from "@mui/material/styles";
import { paginationItemClasses } from "@mui/material/PaginationItem";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"];

// ----------------------------------------------------------------------

export const pagination = (theme: ThemeTypes) => {
	const lightMode = theme.palette.mode === "light";

	const rootStyles = (ownerState: { color: string; variant: string }) => {
		const defaultColor = ownerState.color === "standard";

		const filledVariant = ownerState.variant === "text";

		const outlinedVariant = ownerState.variant === "outlined";

		const softVariant = ownerState.variant === "soft";

		const defaultStyle = {
			[`& .${paginationItemClasses.root}`]: {
				...(outlinedVariant && {
					borderColor: alpha(theme.palette.grey[500].toString(), 0.24),
				}),

				[`&.${paginationItemClasses.selected}`]: {
					fontWeight: theme.typography.fontWeightSemiBold,
					...(outlinedVariant && {
						borderColor: "currentColor",
					}),

					...(defaultColor && {
						backgroundColor: alpha(theme.palette.grey[500].toString(), 0.08),
						...(filledVariant && {
							color: lightMode
								? theme.palette.common.white
								: theme.palette.grey[800],
							backgroundColor: theme.palette.text.primary,
							"&:hover": {
								backgroundColor: lightMode
									? theme.palette.grey[700]
									: theme.palette.grey[100],
							},
						}),
					}),
				},
			},
		};

		const colorStyle = COLORS.map((color) => ({
			...(ownerState.color === color && {
				[`& .${paginationItemClasses.root}`]: {
					[`&.${paginationItemClasses.selected}`]: {
						...(ownerState.color === color && {
							// SOFT
							...(softVariant && {
								color: theme.palette[color][lightMode ? "dark" : "light"],
								backgroundColor: alpha(theme.palette[color].main, 0.08),
								"&:hover": {
									backgroundColor: alpha(theme.palette[color].main, 0.16),
								},
							}),
						}),
					},
				},
			}),
		}));

		return [defaultStyle, ...colorStyle];
	};

	return {
		MuiPagination: {
			styleOverrides: {
				/* eslint-disable @typescript-eslint/no-explicit-any */
				root: ({ ownerState }: any) => rootStyles(ownerState),
			},
		},
	};
};
