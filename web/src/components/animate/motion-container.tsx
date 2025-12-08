/* eslint-disable @typescript-eslint/no-explicit-any */
import { m } from "framer-motion";

import Box from "@mui/material/Box";

import { varContainer } from "./variants";

// ----------------------------------------------------------------------

interface MotionContainerProps {
	animate?: boolean;
	action?: boolean;
	children: React.ReactNode;
	[key : string]: any
}

const MotionContainer = ({
	animate,
	action = false,
	children,
	...other
}: MotionContainerProps) => {
	if (action) {
		return (
			<Box
				component={m.div}
				initial={false}
				animate={animate ? "animate" : "exit"}
				variants={varContainer()}
				{...other}
			>
				{children}
			</Box>
		);
	}

	return (
		<Box
			component={m.div}
			initial="initial"
			animate="animate"
			exit="exit"
			variants={varContainer()}
			{...other}
		>
			{children}
		</Box>
	);
};

export default MotionContainer;