// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { forwardRef } from "react";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

import { StyledLabel } from "./styles";

// ----------------------------------------------------------------------

interface LabelProps {
	children?: React.ReactNode;
	color?:
		| "default"
		| "primary"
		| "secondary"
		| "info"
		| "success"
		| "warning"
		| "error";
	variant?: "filled" | "outlined" | "ghost" | "soft";
	startIcon?: object;
	endIcon?: object;
	sx?: object;
}

// ----------------------------------------------------------------------

const Label = forwardRef(
	(
		{
			children,
			color = "default",
			variant = "soft",
			startIcon,
			endIcon,
			sx,
			...other
		}: LabelProps,
		ref
	) => {
		const theme = useTheme();

		const iconStyles = {
			width: 16,
			height: 16,
			"& svg, img": { width: 1, height: 1, objectFit: "cover" },
		};

		return (
			<StyledLabel
				ref={ref}
				component="span"
				ownerState={{ color, variant }}
				sx={{
					...(startIcon && { pl: 0.75 }),
					...(endIcon && { pr: 0.75 }),
					...sx,
				}}
				theme={theme}
				{...other}
			>
				{startIcon && <Box sx={{ mr: 0.75, ...iconStyles }}> {startIcon} </Box>}

				{children}

				{endIcon && <Box sx={{ ml: 0.75, ...iconStyles }}> {endIcon} </Box>}
			</StyledLabel>
		);
	}
);

// ----------------------------------------------------------------------

Label.displayName = "Label";

export default Label;
