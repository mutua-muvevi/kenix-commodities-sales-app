/* eslint-disable @typescript-eslint/no-explicit-any */
import Stack from "@mui/material/Stack";

import NavList from "./nav-list";

// ----------------------------------------------------------------------

interface MegaMenuDesktopVerticalProps {
	data: any[];
	sx?: object;
	slotProps?: object;
	[key: string]: any;
}

const MegaMenuDesktopVertical = ({ data, sx, slotProps, ...other }: MegaMenuDesktopVerticalProps) => {
	return (
		<Stack
			component="nav"
			id="mega-menu-desktop-vertical"
			sx={{
				position: "relative",
				...sx,
			}}
			{...other}
		>
			{data.map((list) => (
				<NavList key={list.title} data={list} slotProps={slotProps} />
			))}
		</Stack>
	);
};

export default MegaMenuDesktopVertical;
