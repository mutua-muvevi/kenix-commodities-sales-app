/* eslint-disable @typescript-eslint/no-explicit-any */
import { alpha } from "@mui/material/styles";
import { primary } from "../palette";

interface Color {
	lighter: string;
	light: string;
	main: string;
	dark: string;
	darker: string;
	contrastText: string;
}

interface PresetOptions {
	name: string;
	value: string;
}

export const createPresets = (preset : any) => {
	const primaryColor = getPrimary(preset);

	const theme = {
		palette: {
			primary: primaryColor,
		},
		customShadows: {
			primary: `0 8px 16px 0 ${alpha(`${primaryColor?.main}`, 0.24)}`,
		},
	};

	return {
		...theme,
	};
};

const cyan: Color = {
	lighter: "#CCF4FE",
	light: "#68CDF9",
	main: "#078DEE",
	dark: "#0351AB",
	darker: "#012972",
	contrastText: "#FFFFFF",
};

const purple: Color = {
	lighter: "#EBD6FD",
	light: "#B985F4",
	main: "#7635dc",
	dark: "#431A9E",
	darker: "#200A69",
	contrastText: "#FFFFFF",
};

const blue: Color = {
	lighter: "#D1E9FC",
	light: "#76B0F1",
	main: "#2065D1",
	dark: "#103996",
	darker: "#061B64",
	contrastText: "#FFFFFF",
};

const green: Color = {
	lighter: "#61e29b",
	light: "#4edf8f",
	main: "#3adb82",
	dark: "#34c575",
	darker: "#2eaf68",
	contrastText: "#000000",
};

const red: Color = {
	lighter: "#FFE3D5",
	light: "#FFC1AC",
	main: "#FF3030",
	dark: "#B71833",
	darker: "#7A0930",
	contrastText: "#FFFFFF",
};

const brown: Color = {
	lighter: "#ae7d5a",
	light: "#a26a42",
	main: "#8b4513",
	dark: "#7d3e11",
	darker: "#61300d",
	contrastText: "#FFFFFF",
}

const orange: Color = {
	lighter: "#ff9e5d",
	light: "#ff9146",
	main: "#ff7518",
	dark: "#e66916",
	darker: "#cc5e13",
	contrastText: "#000000",
}

export const presetOptions: PresetOptions[] = [
	{ name: "default", value: primary.main },
	{ name: "cyan", value: cyan.main },
	{ name: "purple", value: purple.main },
	{ name: "blue", value: blue.main },
	{ name: "orange", value: orange.main },
	{ name: "red", value: red.main },
	{ name: "brown", value: brown.main },
	{ name: "green", value: green.main },
];

export function getPrimary(preset: string): Color {
	const colors: Record<string, Color> = {
		default: primary,
		cyan,
		purple,
		blue,
		orange,
		red,
		brown,
		green,
	};

	return colors[preset] || primary;
}
