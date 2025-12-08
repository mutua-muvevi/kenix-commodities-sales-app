// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { forwardRef } from "react";
import { Icon } from "@iconify/react";
import Box from "@mui/material/Box";

interface IconifyProps {
	icon: string;
	width?: number;
	sx?: object;
	[key: string]: any;
}

const Iconify = forwardRef<HTMLDivElement, IconifyProps>(({ icon, width = 20, sx, ...other }: IconifyProps, ref) => (
	<Box
		ref={ref}
		className="component-iconify"
		sx={{ display: "inline-flex", width, height: width, ...sx }}
		{...other}
	>
		<Icon icon={icon} width={width} height={width} />
	</Box>
));

Iconify.displayName = "Iconify";

export default Iconify;
