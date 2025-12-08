/* eslint-disable @typescript-eslint/no-explicit-any */

import Stack from "@mui/material/Stack";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

interface MegaMenuDesktopHorizontalProps {
	data: any[];
	sx?: object;
	slotProps?: object;
	[key: string]: any;
}

const MegaMenuDesktopHorizontal = ({
	data,
	sx,
	slotProps,
	...other
}: MegaMenuDesktopHorizontalProps) => {
	return (
		<Stack
			component="nav"
			id="mega-menu-desktop-horizontal"
			direction="row"
			spacing={3}
			sx={{
				height: 1,
				...sx,
			}}
			{...other}
		>
			{data.map((list) => (
				<NavList key={list.title} data={list} slotProps={slotProps} />
			))}
		</Stack>
	);
}

export default MegaMenuDesktopHorizontal;
