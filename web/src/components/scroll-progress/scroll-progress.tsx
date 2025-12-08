// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { m, useSpring } from "framer-motion";

import Box from "@mui/material/Box";

// ----------------------------------------------------------------------

interface ScrollProgressProps {
	color?:
		| "inherit"
		| "primary"
		| "secondary"
		| "info"
		| "success"
		| "warning"
		| "error";
	size?: number;
	scrollYProgress: object;
	sx?: object;
}

const ScrollProgress = ({
	color = "primary",
	size = 3,
	scrollYProgress,
	sx,
	...other
}: ScrollProgressProps) => {
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	return (
		<Box
			component={m.div}
			sx={{
				top: 0,
				left: 0,
				right: 0,
				height: size,
				zIndex: 1999,
				position: "fixed",
				transformOrigin: "0%",
				bgcolor: "text.primary",
				...(color !== "inherit" && {
					background: (theme) =>
						`linear-gradient(135deg, ${theme.palette[color].light} 0%, ${theme.palette[color].main} 100%)`,
				}),
				...sx,
			}}
			style={{ scaleX }}
			{...other}
		/>
	);
}

export default ScrollProgress;
