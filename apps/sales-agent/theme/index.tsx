import { useColorScheme } from "react-native";
import { palette } from "./palette";
import { typography } from "./typography";
import { shadows } from "./shadows";
import { spacing, borderRadius } from "./spacing";
import { ThemeType } from "./types/theme";

// Simple theme creation function - no context needed
export const createTheme = (mode: "light" | "dark"): ThemeType => {
	return {
		palette: palette(mode),
		typography,
		shadows: shadows(mode),
		spacing,
		borderRadius,
	};
};

// Export theme utilities
export * from "./palette";
export * from "./typography";
export * from "./shadows";
export * from "./spacing";
export * from "./components";
export * from "./types/theme";
export * from "./utils/colors";
export * from "./utils/dimensions";
export * from "./utils/responsive";
