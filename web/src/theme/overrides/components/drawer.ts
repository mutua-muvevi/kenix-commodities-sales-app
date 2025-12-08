import { alpha } from "@mui/material/styles";
import { drawerClasses } from "@mui/material/Drawer";

import { paper } from "../../css";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------

export const drawer = (theme: ThemeTypes) => {
	const lightMode = theme.palette.mode === "light";

	return {
		MuiDrawer: {
			styleOverrides: {
				root: ({ ownerState }: { ownerState: { variant : string; anchor: string } }) => ({
					...(ownerState.variant === "temporary" && {
						[`& .${drawerClasses.paper}`]: {
							...paper({ theme }),
							...(ownerState.anchor === "left" && {
								boxShadow: `40px 40px 80px -8px ${alpha(
									lightMode
										? theme.palette.grey[500].toString()
										: theme.palette.common.black.toString(),
									0.24
								)}`,
							}),
							...(ownerState.anchor === "right" && {
								boxShadow: `-40px 40px 80px -8px ${alpha(
									lightMode
										? theme.palette.grey[500].toString()
										: theme.palette.common.black.toString(),
									0.24
								)}`,
							}),
						},
					}),
				}),
			},
		},
	};
};
