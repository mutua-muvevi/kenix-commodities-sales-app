import { Inter, Roboto, Open_Sans } from "next/font/google";

// ----------------------------------------------------------------------

export const remToPx = (value: number | string) => {
	if(typeof(value) === "string"){
		return Math.round(parseFloat(value) * 16);
	} else {
		return Math.round(value * 16);
	}
}

export const pxToRem = (value : number) => {
	return `${value / 16}rem`;
}

type responsiveFontSizesTypes = {
	sm: number;
	md: number;
	lg: number;
}

export function responsiveFontSizes({ sm, md, lg }: responsiveFontSizesTypes) {
	return {
		"@media (min-width:600px)": {
			fontSize: pxToRem(sm),
		},
		"@media (min-width:900px)": {
			fontSize: pxToRem(md),
		},
		"@media (min-width:1200px)": {
			fontSize: pxToRem(lg),
		},
	};
}

export const primaryFont = Inter({
	weight: ["400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const secondaryFont = Open_Sans({
	weight: ["400", "500", "600", "700", "800"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const headingFont = Roboto({
	weight: ["400", "500", "700", "900"],
	subsets: ["latin"],
	display: "swap",
	fallback: ["system-ui", "sans-serif"],
});

// ----------------------------------------------------------------------

// LEARN MORE
// https://nextjs.org/docs/basic-features/font-optimization#google-fonts

export const typography = {
	fontFamily: primaryFont.style.fontFamily,
	fontSecondaryFamily: secondaryFont.style.fontFamily,
	fontHeadingFamily: headingFont.style.fontFamily,
	fontWeightRegular: 400,
	fontWeightMedium: 500,
	fontWeightSemiBold: 600,
	fontWeightBold: 700,
	h1: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 700,
		lineHeight: 1.2,
		fontSize: pxToRem(40),
		letterSpacing: "-0.02em",
		...responsiveFontSizes({ sm: 48, md: 56, lg: 64 }),
	},
	h2: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 700,
		lineHeight: 1.3,
		fontSize: pxToRem(32),
		letterSpacing: "-0.01em",
		...responsiveFontSizes({ sm: 36, md: 42, lg: 48 }),
	},
	h3: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.4,
		fontSize: pxToRem(24),
		letterSpacing: "-0.01em",
		...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
	},
	h4: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.4,
		fontSize: pxToRem(20),
		...responsiveFontSizes({ sm: 20, md: 22, lg: 24 }),
	},
	h5: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.5,
		fontSize: pxToRem(18),
		...responsiveFontSizes({ sm: 18, md: 19, lg: 20 }),
	},
	h6: {
		fontFamily: headingFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.5,
		fontSize: pxToRem(16),
		...responsiveFontSizes({ sm: 16, md: 17, lg: 18 }),
	},
	subtitle1: {
		fontFamily: secondaryFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.5,
		fontSize: pxToRem(16),
		letterSpacing: "0.01em",
	},
	subtitle2: {
		fontFamily: secondaryFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.5,
		fontSize: pxToRem(14),
		letterSpacing: "0.01em",
	},
	body1: {
		fontFamily: primaryFont.style.fontFamily,
		fontWeight: 400,
		lineHeight: 1.6,
		fontSize: pxToRem(16),
		letterSpacing: "0.01em",
	},
	body2: {
		fontFamily: primaryFont.style.fontFamily,
		fontWeight: 400,
		lineHeight: 1.5,
		fontSize: pxToRem(14),
		letterSpacing: "0.01em",
	},
	caption: {
		fontFamily: primaryFont.style.fontFamily,
		fontWeight: 400,
		lineHeight: 1.5,
		fontSize: pxToRem(12),
		letterSpacing: "0.02em",
	},
	overline: {
		fontFamily: primaryFont.style.fontFamily,
		fontWeight: 700,
		lineHeight: 1.5,
		fontSize: pxToRem(12),
		textTransform: "uppercase",
		letterSpacing: "0.1em",
	},
	button: {
		fontFamily: primaryFont.style.fontFamily,
		fontWeight: 600,
		lineHeight: 1.4,
		fontSize: pxToRem(14),
		textTransform: "none",
		letterSpacing: "0.01em",
	},
};
