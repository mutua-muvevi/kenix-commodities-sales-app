/* eslint-disable @typescript-eslint/no-explicit-any */

import { memo } from "react";

import Stack from "@mui/material/Stack";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

interface NavBasicMobileProps {
	data: any[];
	slotProps?: object;
	[key: string]: any;
}

const NavBasicMobile = ({ data, slotProps, ...other }: NavBasicMobileProps) => {
	return (
		<Stack component="nav" id="nav-basic-mobile" {...other}>
			{data.map((list) => (
				<NavList key={list.title} data={list} depth={1} slotProps={slotProps} />
			))}
		</Stack>
	);
};

export default memo(NavBasicMobile);
