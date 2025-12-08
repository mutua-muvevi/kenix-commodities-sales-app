// src/components/scrollbar/scrollbar.tsx
import React, { memo, forwardRef } from "react";
import { StyledRootScrollbar, StyledScrollbar } from "./styles";

interface ScrollbarProps {
	children: React.ReactNode;
	sx?: object;
}

const Scrollbar = forwardRef(({ children, sx, ...other }: ScrollbarProps, ref) => {
	return (
		<StyledRootScrollbar sx={sx}>
			<StyledScrollbar
				scrollableNodeProps={{
					ref,
				}}
				clickOnTrack={false}
				// sx={sx}
				{...other}
			>
				{children}
			</StyledScrollbar>
		</StyledRootScrollbar>
	);
});

Scrollbar.displayName = "Scrollbar";

export default memo(Scrollbar);
