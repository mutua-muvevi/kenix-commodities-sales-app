// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { forwardRef } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";

import { RouterLink } from "@/routes/components";

import Iconify from "../../iconify";

// ----------------------------------------------------------------------

interface NavItemProps {
	hasChild: boolean;
	open: boolean;
	active: boolean;
	externalLink?: boolean;
	path?: string;
	title?: string;
	icon?: JSX.Element;
	[key: string]: any;
}

const NavItem = forwardRef(
	(
		{
			title,
			path,
			icon,
			open,
			active,
			hasChild,
			externalLink,
			...other
		}: NavItemProps,
		ref
	) => {
		const renderContent = (
			<StyledNavItem
				disableRipple
				disableTouchRipple
				ref={ref}
				open={open}
				active={active}
				{...other}
			>
				{icon && (
					<Box component="span" className="icon">
						{icon}
					</Box>
				)}

				{title && (
					<Box component="span" className="label">
						{title}
					</Box>
				)}

				{hasChild && (
					<Iconify
						width={16}
						className="arrow"
						icon="eva:arrow-ios-downward-fill"
					/>
				)}
			</StyledNavItem>
		);

		if (externalLink)
			return (
				<Link
					href={path}
					target="_blank"
					rel="noopener"
					underline="none"
					color="inherit"
				>
					{renderContent}
				</Link>
			);

		return (
			<Link component={RouterLink} href={path} underline="none" color="inherit">
				{renderContent}
			</Link>
		);
	}
);

NavItem.displayName = "NavItem";

export default NavItem;

// ----------------------------------------------------------------------

const StyledNavItem = styled(ListItemButton, {
	shouldForwardProp: (prop) => prop !== "active",
})(({ active, open, theme }: any) => {
	const opened = open && !active;

	return {
		...theme.typography.body2,
		padding: 0,
		minHeight: "100%",
		fontWeight: theme.typography.fontWeightMedium,
		transition: theme.transitions.create(["all"], {
			duration: theme.transitions.duration.shorter,
		}),
		"&:hover": {
			backgroundColor: "transparent",
		},
		"& .icon": {
			width: 20,
			height: 20,
			flexShrink: 0,
			marginRight: theme.spacing(1),
		},
		"& .arrow": {
			marginLeft: theme.spacing(0.75),
		},
		...(active && {
			color: theme.palette.primary.main,
			fontWeight: theme.typography.fontWeightSemiBold,
		}),
		...(opened && {
			opacity: 0.64,
		}),
	};
});
