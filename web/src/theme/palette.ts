// src/theme/palette.ts - CORRECTED VERSION
"use client";
import { alpha } from "@mui/material/styles";

export const grey = {
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

export const primary = {
	lighter: "#5A7BC8",
	light: "#2E5BB7",
	main: "#002389", // Your original primary color
	dark: "#194085",
	darker: "#133674",
	contrastText: "#FFFFFF",
};

export const secondary = {
	lighter: "#FF8B61",
	light: "#FF7647",
	main: "#ec5926", // Your original secondary color
	dark: "#E55E30",
	darker: "#CC522A",
	contrastText: "#FFFFFF",
};

export const info = {
	lighter: "#CAFDF5",
	light: "#61F3F3",
	main: "#00B8D9",
	dark: "#006C9C",
	darker: "#003768",
	contrastText: "#FFFFFF",
};

export const success = {
	lighter: "#D3FCD2",
	light: "#77ED8B",
	main: "#22C55E",
	dark: "#118D57",
	darker: "#065E49",
	contrastText: "#ffffff",
};

export const warning = {
	lighter: "#FFF5CC",
	light: "#FFD666",
	main: "#FFAB00",
	dark: "#B76E00",
	darker: "#7A4100",
	contrastText: grey[800],
};

export const error = {
	lighter: "#FFE9D5",
	light: "#FFAC82",
	main: "#FF5630",
	dark: "#B71D18",
	darker: "#7A0916",
	contrastText: "#FFFFFF",
};

export const brown = {
	lighter: "#ae7d5a",
	light: "#a26a42",
	main: "#8b4513",
	dark: "#7d3e11",
	darker: "#61300d",
	contrastText: "#FFFFFF",
}

export const orange = {
	lighter: "#ff9e5d",
	light: "#ff9146",
	main: "#ff7518",
	dark: "#e66916",
	darker: "#cc5e13",
	contrastText: "#000000",
}

const red = {
	lighter: "#FFE3D5",
	light: "#FFC1AC",
	main: "#FF3030",
	dark: "#B71833",
	darker: "#7A0930",
	contrastText: "#FFFFFF",
};

export const common = {
	black: "#000000",
	white: "#FFFFFF",
};

export const action = {
	hover: alpha(grey[500], 0.08),
	selected: alpha(grey[500], 0.16),
	disabled: alpha(grey[500], 0.8),
	disabledBackground: alpha(grey[500], 0.24),
	focus: alpha(grey[500], 0.24),
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
	brown,
	orange,
	red,
	common,
	divider: alpha(grey[500], 0.2),
	action,
};

// ----------------------------------------------------------------------

export const palette = (mode: "light" | "dark") => {
	const light = {
		...base,
		mode: "light",
		text: {
			primary: grey[800], // Dark text - #212B36
			secondary: grey[600], // Medium grey - #637381
			disabled: grey[500], // Light grey - #919EAB
		},
		background: {
			// 🔥 THE FIX: Changed from grey[200] to white
			paper: "#FFFFFF", // WHITE backgrounds instead of grey
			default: "#FFFFFF", // White default
			neutral: grey[100], // Very light grey for neutral areas
			navs: "#FFFFFF", // White navigation
		},
		action: {
			...base.action,
			active: grey[600],
		},
	};

	const dark = {
		...base,
		mode: "dark",
		text: {
			primary: "#FFFFFF", // White text on dark
			secondary: grey[400], // Light grey
			disabled: grey[600], // Medium grey
		},
		background: {
			paper: "#1C1C1C", // Dark paper backgrounds
			default: "#121313", // Dark default
			neutral: alpha(grey[500], 0.12), // Transparent grey
			navs: "#181a1b", // Dark navigation
		},
		action: {
			...base.action,
			active: grey[400],
		},
	};

	return mode === "light" ? light : dark;
}