import { alpha, darken, lighten } from "./utils/colors";
import { GreyColors, ThemeColors, CommonColors, ActionColors, Palette } from "./types/theme";

export const grey: GreyColors = {
	0: "#FFFFFF",
	100: "#F9FAFB",
	200: "#F4F6F8",
	300: "#DFE3E8",
	400: "#C4CDD5",
	500: "#919EAB",
	600: "#637381",
	700: "#454F5B",
	800: "#212B36",
	900: "#161C24",
};

export const common: CommonColors = {
	black: "#000000",
	white: "#FFFFFF",
};

// Your specified colors
const primaryMain = "#002389";
const secondaryMain = "#ec5926";

export const primary: ThemeColors = {
	lighter: lighten(primaryMain, 0.3),
	light: lighten(primaryMain, 0.15),
	main: primaryMain,
	dark: darken(primaryMain, 0.1),
	darker: darken(primaryMain, 0.2),
	contrastText: "#FFFFFF",
};

export const secondary: ThemeColors = {
	lighter: lighten(secondaryMain, 0.3),
	light: lighten(secondaryMain, 0.15),
	main: secondaryMain,
	dark: darken(secondaryMain, 0.1),
	darker: darken(secondaryMain, 0.2),
	contrastText: "#FFFFFF",
};

export const info: ThemeColors = {
	lighter: "#CAFDF5",
	light: "#61F3F3",
	main: "#00B8D9",
	dark: "#006C9C",
	darker: "#003768",
	contrastText: "#FFFFFF",
};

export const success: ThemeColors = {
	lighter: "#D3FCD2",
	light: "#77ED8B",
	main: "#22C55E",
	dark: "#118D57",
	darker: "#065E49",
	contrastText: "#FFFFFF",
};

export const warning: ThemeColors = {
	lighter: "#FFF5CC",
	light: "#FFD666",
	main: "#FFAB00",
	dark: "#B76E00",
	darker: "#7A4100",
	contrastText: grey[800],
};

export const error: ThemeColors = {
	lighter: "#FFE9D5",
	light: "#FFAC82",
	main: "#FF5630",
	dark: "#B71D18",
	darker: "#7A0916",
	contrastText: "#FFFFFF",
};

export const action: ActionColors = {
	hover: alpha(grey[500], 0.08),
	selected: alpha(grey[500], 0.16),
	disabled: alpha(grey[500], 0.8),
	disabledBackground: alpha(grey[500], 0.24),
	focus: alpha(grey[500], 0.24),
	active: grey[600],
	hoverOpacity: 0.08,
	disabledOpacity: 0.48,
};

const base = {
	primary,
	secondary,
	info,
	success,
	warning,
	error,
	grey,
	common,
	divider: alpha(grey[500], 0.2),
	action,
};

export const palette = (mode: "light" | "dark"): Palette => {
	const light: Palette = {
		...base,
		mode: "light",
		text: {
			primary: grey[800],
			secondary: grey[600],
			disabled: grey[500],
		},
		background: {
			default: "#FFFFFF",
			paper: grey[100],
			neutral: grey[200],
			surface: "#FFFFFF",
		},
		action: {
			...base.action,
			active: grey[600],
		},
	};

	const dark: Palette = {
		...base,
		mode: "dark",
		text: {
			primary: "#FFFFFF",
			secondary: grey[500],
			disabled: grey[600],
		},
		background: {
			default: "#121313",
			paper: "#181a1b",
			neutral: alpha(grey[500], 0.12),
			surface: "#1e1e1e",
		},
		action: {
			...base.action,
			active: grey[500],
		},
	};

	return mode === "light" ? light : dark;
};
