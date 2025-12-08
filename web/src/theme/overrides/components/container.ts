/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeTypes } from "@/theme/types";

export const container = (theme: ThemeTypes) => {
	return {
		MuiContainer: {
			styleOverrides: {
				maxWidthXl: {
					maxWidth: "2000px",
					[theme.breakpoints.up("xl")]: {
						maxWidth: "2000px"
					}
				}
			}
		}
	}
}