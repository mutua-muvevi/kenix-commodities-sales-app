/* eslint-disable @typescript-eslint/no-explicit-any */

import { forwardRef } from "react";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import { RouterLink } from "@/routes/components";
import Image from "next/image";

// ----------------------------------------------------------------------

interface LogoProps {
	disabledLink?: boolean;
	variant?: 'icon' | 'landscape' | 'portrait';
	sx?: object;
	[key: string]: any;
}

const Logo = forwardRef(({ disabledLink = false, variant = 'landscape', sx, ...other }: LogoProps, ref) => {
	
	const getLogoSrc = () => {
		switch (variant) {
			case 'icon':
				return '/images/logo-icon.png';
			case 'portrait':
				return '/images/logo-portrait.png';
			default:
				return '/images/logo-landscape.png';
		}
	};

	const getDimensions = () => {
		switch (variant) {
			case 'icon':
				return { width: 40, height: 40 };
			case 'portrait':
				return { width: 120, height: 150 };
			default:
				return { width: 200, height: 60 };
		}
	};

	const dimensions = getDimensions();

	const logo = (
		<Box
			ref={ref}
			component="div"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				...sx,
			}}
			{...other}
		>
			<Image
				src={getLogoSrc()}
				alt="Kenix Commodities - Your Shop's Restock Partner"
				width={dimensions.width}
				height={dimensions.height}
				style={{
					objectFit: "contain",
					cursor: "pointer",
				}}
				priority
			/>
		</Box>
	);

	if (disabledLink) {
		return logo;
	}

	return (
		<Link component={RouterLink} href="/" sx={{ display: "contents" }}>
			{logo}
		</Link>
	);
});

Logo.displayName = "Logo";

export default Logo;
