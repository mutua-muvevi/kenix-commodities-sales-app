import { ThemeTypes } from "@/theme/types";
import { buttonClasses } from "@mui/material/Button";

// ----------------------------------------------------------------------

export const loadingButton = (theme: ThemeTypes) => {
	return {
		MuiButton: {
			styleOverrides: {
				root: ({ ownerState }: { ownerState: { variant: string; size: string; loading: boolean } }) => ({
					borderRadius: theme.shape.borderRadius / 2,
					...(ownerState.variant === "soft" && {
						[`& .${buttonClasses.startIcon}`]: {
							...(ownerState.loading && {
								left: 10,
							}),
						},
						[`& .${buttonClasses.endIcon}`]: {
							...(ownerState.loading && {
								right: 14,
							}),
						},
						...(ownerState.size === "small" && {
							[`& .${buttonClasses.startIcon}`]: {
								...(ownerState.loading && {
									left: 10,
								}),
							},
							[`& .${buttonClasses.endIcon}`]: {
								...(ownerState.loading && {
									right: 10,
								}),
							},
						}),
					}),
				}),
			},
		},
	};
};