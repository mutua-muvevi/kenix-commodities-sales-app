// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ThemeTypes } from "@/theme/types";

export const skeleton = (theme: ThemeTypes) => {
	return {
		MuiSkeleton: {
			styleOverrides: {
				root: {
					backgroundColor: theme.palette.background.neutral,
				},
				rounded: {
					borderRadius: theme.shape.borderRadius * 2,
				},
			},
		},
	};
}
