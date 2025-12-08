/* eslint-disable @typescript-eslint/no-explicit-any */

import { memo } from "react";

import Stack from "@mui/material/Stack";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

interface NavBasicDesktop {
	data: any[];
	slotProps?: object;
	[key: string]: any;
}

const NavBasicDesktop = ({ data, slotProps, ...other }: NavBasicDesktop) => {
	return (
		<Stack
			component="nav"
			id="nav-basic-desktop"
			spacing={5}
			direction="row"
			{...other}
		>
			{data.map((list) => (
				<NavList key={list.title} data={list} depth={1} slotProps={slotProps} />
			))}
		</Stack>
	);
};

export default memo(NavBasicDesktop);
