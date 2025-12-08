// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import Popover from "@mui/material/Popover";
import { menuItemClasses } from "@mui/material/MenuItem";

import { getPosition } from "./utils";
import { StyledArrow } from "./styles";
import React from "react";

// ----------------------------------------------------------------------

interface CustomPopoverProps {
	arrow?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	hiddenArrow?: boolean;
	sx?: object;
	open?: object;
	onClose: () => void;
	children?: React.ReactNode;
	disableArrow?: boolean;
}

const CustomPopover = ({
	open,
	children,
	arrow = "top-right",
	hiddenArrow,
	sx,
	...other
}: CustomPopoverProps) => {
	const { style, anchorOrigin, transformOrigin }: any = getPosition(arrow);

	return (
		<Popover
			open={Boolean(open)}
			anchorEl={open}
			anchorOrigin={anchorOrigin}
			transformOrigin={transformOrigin}
			slotProps={{
				paper: {
					sx: {
						width: "auto",
						overflow: "inherit",
						borderRadius: "5px",
						...style,
						[`& .${menuItemClasses.root}`]: {
							"& svg": {
								mr: 2,
								flexShrink: 0,
							},
						},
						...sx,
					},
				},
			}}
			{...other}
		>
			{!hiddenArrow && <StyledArrow arrow={arrow} />}

			{children}
		</Popover>
	);
};

export default CustomPopover;
