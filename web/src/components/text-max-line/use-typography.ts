// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useTheme } from "@mui/material/styles";

import { useWidth } from "@/hooks/use-responsive";

// ----------------------------------------------------------------------

const remToPx = (value: string) => {
	return Math.round(parseFloat(value) * 16);
}

const useTypography = (variant: string) => {
	const theme = useTheme();

	const breakpoints = useWidth();

	const key = theme.breakpoints.up(breakpoints === "xl" ? "lg" : breakpoints);

	const hasResponsive =
		variant === "h1" ||
		variant === "h2" ||
		variant === "h3" ||
		variant === "h4" ||
		variant === "h5" ||
		variant === "h6";

	const getFont =
		hasResponsive && theme.typography[variant][key]
			? theme.typography[variant][key]
			: theme.typography[variant];

	const fontSize = remToPx(getFont.fontSize);

	const lineHeight = Number(theme.typography[variant].lineHeight) * fontSize;

	const { fontWeight, letterSpacing } = theme.typography[variant];

	return { fontSize, lineHeight, fontWeight, letterSpacing };
};

export default useTypography;
