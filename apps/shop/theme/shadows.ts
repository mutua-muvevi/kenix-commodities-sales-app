// theme/shadows.ts - Fixed with ES6+ and proper color imports
import { Platform } from "react-native";
import { alpha } from "./utils/colors";
import { grey, common, primary, secondary, success, warning, error, info } from "./palette";

export const shadows = (mode: "light" | "dark") => {
	const color = mode === "light" ? grey[500] : common.black;

	const transparent1 = alpha(color, 0.2);
	const transparent2 = alpha(color, 0.14);
	const transparent3 = alpha(color, 0.12);

	// React Native shadow properties
	const createShadow = (elevation: number, opacity: number = 0.3) => {
		if (Platform.OS === "ios") {
			return {
				shadowColor: color,
				shadowOffset: {
					width: 0,
					height: elevation / 2,
				},
				shadowOpacity: opacity,
				shadowRadius: elevation,
			};
		} else {
			return {
				elevation,
				shadowColor: color,
			};
		}
	};

	return {
		z1: createShadow(1, 0.16),
		z4: createShadow(4, 0.16),
		z8: createShadow(8, 0.16),
		z12: createShadow(12, 0.24),
		z16: createShadow(16, 0.24),
		z20: createShadow(20, 0.24),
		z24: createShadow(24, 0.32),
		card: createShadow(2, 0.12),
		button: createShadow(4, 0.16),
		modal: createShadow(24, 0.4),
		primary: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? primary.main : primary.light,
		},
		secondary: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? secondary.main : secondary.light,
		},
		success: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? success.main : success.light,
		},
		warning: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? warning.main : warning.light,
		},
		error: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? error.main : error.light,
		},
		info: {
			...createShadow(8, 0.24),
			shadowColor: mode === "light" ? info.main : info.light,
		},
	};
};
