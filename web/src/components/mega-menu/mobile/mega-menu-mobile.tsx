/* eslint-disable @typescript-eslint/no-explicit-any */

import Stack from "@mui/material/Stack";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

interface MegaMenuMobileProps {
	data: any[];
	slotProps?: object;
	[key: string]: any;
}

const MegaMenuMobile = ({ data, slotProps, ...other }: MegaMenuMobileProps) => {
	return (
		<Stack component="nav" id="mega-menu-mobile" {...other}>
			{data.map((list: any) => (
				<NavList key={list.title} data={list} slotProps={slotProps} />
			))}
		</Stack>
	);
};

export default MegaMenuMobile;
