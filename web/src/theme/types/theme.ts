import { Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
	interface PaletteColor {
		lighter?: string;
		darker?: string;
	}

	interface SimplePaletteColorOptions {
		lighter?: string;
		darker?: string;
	}
}

export interface CustomShadowsTypes {
	z1: string;
	z4: string;
	z8: string;
	z12: string;
	z16: string;
	z20: string;
	z24: string;
	card: string;
	dropdown: string;
	dialog: string;
	primary: string;
	info: string;
	secondary: string;
	success: string;
	warning: string;
	error: string;
	[key: string]: string;
}

// No need to define `TypographyTypes`, we can directly use the MUI Theme's typography types
export interface ThemeTypes {
	breakpoints: Theme["breakpoints"];
	customShadows?: CustomShadowsTypes;
	direction: string;
	palette: Theme["palette"];
	shadows: Theme["shadows"];
	shape: Theme["shape"];
	spacing: Theme["spacing"];
	transitions: Theme["transitions"];
	typography: Theme["typography"];
}
