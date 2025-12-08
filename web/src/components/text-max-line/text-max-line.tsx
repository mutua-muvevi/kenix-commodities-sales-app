// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { forwardRef } from "react";

import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import useTypography from "./use-typography";

// ----------------------------------------------------------------------

interface TextMaxLineProps {
	asLink?: boolean;
	children: React.ReactNode;
	line?: number;
	persistent?: boolean;
	sx?: object;
	variant: "body1" | "body2" | "button" | "caption" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "inherit" | "overline" | "subtitle1" | "subtitle2";
}

const TextMaxLine = forwardRef(
	(
		{
			asLink,
			variant = "body1",
			line = 2,
			persistent = false,
			children,
			sx,
			...other
		}: TextMaxLineProps,
		ref
	) => {
		const { lineHeight } = useTypography(variant);

		const styles = {
			overflow: "hidden",
			textOverflow: "ellipsis",
			display: "-webkit-box",
			WebkitLineClamp: line,
			WebkitBoxOrient: "vertical",
			...(persistent && {
				height: lineHeight * line,
			}),
			...sx,
		};

		if (asLink) {
			return (
				<Link
					color="inherit"
					ref={ref}
					variant={variant}
					sx={{ ...styles }}
					{...other}
				>
					{children}
				</Link>
			);
		}

		return (
			<Typography ref={ref} variant={variant} sx={{ ...styles }} {...other}>
				{children}
			</Typography>
		);
	}
);

TextMaxLine.displayName = "TextMaxLine";

export default TextMaxLine;
