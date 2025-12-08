// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";

import Collapse from "@mui/material/Collapse";

import { usePathname } from "@/routes/hooks";
import { useActiveLink } from "@/routes/hooks/use-active-link";

import NavItem from "./nav-item";

// ----------------------------------------------------------------------

interface NavSubListProps {
	data: any[];
	depth: number;
	slotProps?: object;
}

const NavSubList = ({ data, depth, slotProps }: NavSubListProps) => {
	return (
		<>
			{data.map((list) => (
				<NavList
					key={list.title}
					data={list}
					depth={depth + 1}
					slotProps={slotProps}
				/>
			))}
		</>
	);
};

// ----------------------------------------------------------------------

interface NavListProps {
	data: object;
	depth?: number;
	slotProps?: object;
}

const NavList = ({ data, depth, slotProps }: NavListProps) => {
	const pathname = usePathname();

	const active = useActiveLink(data.path, !!data.children);

	const [openMenu, setOpenMenu] = useState(active);

	useEffect(() => {
		if (!active) {
			handleCloseMenu();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const handleToggleMenu = useCallback(() => {
		if (data.children) {
			setOpenMenu((prev) => !prev);
		}
	}, [data.children]);

	const handleCloseMenu = useCallback(() => {
		setOpenMenu(false);
	}, []);

	return (
		<>
			<NavItem
				open={openMenu}
				onClick={handleToggleMenu}
				//
				title={data.title}
				path={data.path}
				caption={data.caption}
				icon={data.icon}
				//
				depth={depth}
				hasChild={!!data.children}
				externalLink={!!data.path.includes("http")}
				//
				active={active}
				className={active ? "active" : ""}
				sx={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
			/>

			{!!data.children && (
				<Collapse in={openMenu} unmountOnExit>
					<NavSubList
						data={data.children}
						depth={depth}
						slotProps={slotProps}
					/>
				</Collapse>
			)}
		</>
	);
};

export default NavList;
