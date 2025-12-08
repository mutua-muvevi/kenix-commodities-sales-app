// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";

import Stack from "@mui/material/Stack";
import Popover from "@mui/material/Popover";

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
		<Stack spacing={0.5}>
			{data.map((list) => (
				<NavList
					key={list.title}
					data={list}
					depth={depth + 1}
					slotProps={slotProps}
				/>
			))}
		</Stack>
	);
};

// ----------------------------------------------------------------------

interface NavList {
	data: object;
	depth: number;
	slotProps?: object;
}

const NavList = ({ data, depth, slotProps }: NavList) => {
	const navRef = useRef(null);

	const pathname = usePathname();

	const active = useActiveLink(data.path, !!data.children);

	const [openMenu, setOpenMenu] = useState(false);

	useEffect(() => {
		if (openMenu) {
			handleCloseMenu();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const handleOpenMenu = useCallback(() => {
		if (data.children) {
			setOpenMenu(true);
		}
	}, [data.children]);

	const handleCloseMenu = useCallback(() => {
		setOpenMenu(false);
	}, []);

	return (
		<>
			<NavItem
				ref={navRef}
				open={openMenu}
				onMouseEnter={handleOpenMenu}
				onMouseLeave={handleCloseMenu}
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
				sx={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
			/>

			{!!data.children && (
				<Popover
					disableScrollLock
					open={openMenu}
					anchorEl={navRef.current}
					anchorOrigin={
						depth === 1
							? { vertical: "bottom", horizontal: "left" }
							: { vertical: "center", horizontal: "right" }
					}
					transformOrigin={
						depth === 1
							? { vertical: "top", horizontal: "left" }
							: { vertical: "center", horizontal: "left" }
					}
					slotProps={{
						paper: {
							onMouseEnter: handleOpenMenu,
							onMouseLeave: handleCloseMenu,
							sx: {
								minWidth: 160,
								...(openMenu && {
									pointerEvents: "auto",
								}),
							},
						},
					}}
					sx={{
						pointerEvents: "none",
					}}
				>
					<NavSubList
						data={data.children}
						depth={depth}
						slotProps={slotProps}
					/>
				</Popover>
			)}
		</>
	);
};

export default NavList;
