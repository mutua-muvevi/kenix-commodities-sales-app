"use client";

import { m, domMax, LazyMotion } from "framer-motion";

// ----------------------------------------------------------------------

interface MotionLazyProps {
	children: React.ReactNode;
}

export const MotionLazy = ({ children }: MotionLazyProps) => {
	return (
		<LazyMotion strict features={domMax}>
			<m.div style={{ height: "100%" }}> {children} </m.div>
		</LazyMotion>
	);
};
