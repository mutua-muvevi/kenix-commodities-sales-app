// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

import Collapse from "@mui/material/Collapse";

import { usePathname } from "@/routes/hooks";
import { useActiveLink } from "@/routes/hooks/use-active-link";

import NavItem from "./nav-item";

// ----------------------------------------------------------------------

interface NavListSubList {
	data: any[];
	depth: number;
	slotProps?: object;
}

const NavSubList = ({ data, depth, slotProps }: NavListSubList) => {
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

interface NavList {
	data: object;
	depth: number;
	slotProps?: object;
}
const NavList = ({ data, depth, slotProps }: NavList) => {
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
				icon={data.icon}
				info={data.info}
				roles={data.roles}
				caption={data.caption}
				disabled={data.disabled}
				//
				depth={depth}
				hasChild={!!data.children}
				externalLink={data.path.includes("http")}
				currentRole={slotProps?.currentRole}
				//
				active={active}
				className={active ? "active" : ""}
				sx={{
					mb: `${slotProps?.gap}px`,
					...(depth === 1 ? slotProps?.rootItem : slotProps?.subItem),
				}}
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