import { Platform } from "react-native";
import { Typography } from "./types/theme";

const fontFamily = Platform.select({
	ios: "System",
	android: "Roboto",
	default: "System",
});

const fontSecondaryFamily = Platform.select({
	ios: "System",
	android: "Roboto",
	default: "System",
});

export const typography: Typography = {
	fontFamily,
	fontSecondaryFamily,
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemiBold: 600,
	fontWeightBold: 700,
	h1: {
		fontFamily,
		fontSize: 32,
		fontWeight: "800",
		lineHeight: 40,
		letterSpacing: -0.5,
	},
	h2: {
		fontFamily,
		fontSize: 28,
		fontWeight: "800",
		lineHeight: 36,
		letterSpacing: -0.3,
	},
	h3: {
		fontFamily,
		fontSize: 24,
		fontWeight: "700",
		lineHeight: 32,
		letterSpacing: -0.2,
	},
	h4: {
		fontFamily,
		fontSize: 20,
		fontWeight: "700",
		lineHeight: 28,
		letterSpacing: -0.1,
	},
	h5: {
		fontFamily,
		fontSize: 18,
		fontWeight: "600",
		lineHeight: 24,
	},
	h6: {
		fontFamily,
		fontSize: 16,
		fontWeight: "600",
		lineHeight: 22,
	},
	subtitle1: {
		fontFamily,
		fontSize: 16,
		fontWeight: "500",
		lineHeight: 24,
	},
	subtitle2: {
		fontFamily,
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 20,
	},
	body1: {
		fontFamily,
		fontSize: 16,
		fontWeight: "400",
		lineHeight: 24,
	},
	body2: {
		fontFamily,
		fontSize: 14,
		fontWeight: "400",
		lineHeight: 20,
	},
	caption: {
		fontFamily,
		fontSize: 12,
		fontWeight: "400",
		lineHeight: 16,
	},
	overline: {
		fontFamily,
		fontSize: 12,
		fontWeight: "700",
		lineHeight: 16,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	button: {
		fontFamily,
		fontSize: 14,
		fontWeight: "600",
		lineHeight: 20,
		textTransform: "none",
	},
};
