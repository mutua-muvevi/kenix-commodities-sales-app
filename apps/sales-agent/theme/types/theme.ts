export interface ThemeColors {
	lighter: string;
	light: string;
	main: string;
	dark: string;
	darker: string;
	contrastText: string;
}

export interface GreyColors {
	0: string;
	100: string;
	200: string;
	300: string;
	400: string;
	500: string;
	600: string;
	700: string;
	800: string;
	900: string;
}

export interface CommonColors {
	black: string;
	white: string;
}

export interface ActionColors {
	hover: string;
	selected: string;
	disabled: string;
	disabledBackground: string;
	focus: string;
	active: string;
	hoverOpacity: number;
	disabledOpacity: number;
}

export interface BackgroundColors {
	default: string;
	paper: string;
	neutral: string;
	surface: string;
}

export interface TextColors {
	primary: string;
	secondary: string;
	disabled: string;
}

export interface Palette {
	mode: "light" | "dark";
	primary: ThemeColors;
	secondary: ThemeColors;
	info: ThemeColors;
	success: ThemeColors;
	warning: ThemeColors;
	error: ThemeColors;
	grey: GreyColors;
	common: CommonColors;
	text: TextColors;
	background: BackgroundColors;
	action: ActionColors;
	divider: string;
}

export interface Typography {
	fontFamily: string;
	fontSecondaryFamily: string;
	fontWeightRegular: number;
	fontWeightMedium: number;
	fontWeightSemiBold: number;
	fontWeightBold: number;
	h1: TextStyle;
	h2: TextStyle;
	h3: TextStyle;
	h4: TextStyle;
	h5: TextStyle;
	h6: TextStyle;
	subtitle1: TextStyle;
	subtitle2: TextStyle;
	body1: TextStyle;
	body2: TextStyle;
	caption: TextStyle;
	overline: TextStyle;
	button: TextStyle;
}

export interface CustomShadows {
	z1: string;
	z4: string;
	z8: string;
	z12: string;
	z16: string;
	z20: string;
	z24: string;
	card: string;
	button: string;
	modal: string;
	primary: string;
	secondary: string;
	success: string;
	warning: string;
	error: string;
	info: string;
}

export interface Spacing {
	xs: number;
	sm: number;
	md: number;
	lg: number;
	xl: number;
	xxl: number;
}

export interface BorderRadius {
	xs: number;
	sm: number;
	md: number;
	lg: number;
	xl: number;
	xxl: number;
}

export interface ThemeType {
	palette: Palette;
	typography: Typography;
	shadows: CustomShadows;
	spacing: Spacing;
	borderRadius: BorderRadius;
}

export interface TextStyle {
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: string | number;
	lineHeight?: number;
	letterSpacing?: number;
	textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
}
