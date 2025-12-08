// src/components/scrollbar/styles.tsx
"use client";

import SimpleBar from "simplebar-react";
import { alpha, styled } from "@mui/material/styles";

export const StyledRootScrollbar = styled("div", {
	shouldForwardProp: (prop) => prop !== "height",
})<{ height?: string | number }>(() => ({
	flexGrow: 1,
}));

export const StyledScrollbar = styled(SimpleBar)(({ theme, sx }: any) => ({
	maxHeight: sx && "height" in sx ? sx.height : "100%",
	"& .simplebar-scrollbar": {
		"&:before": {
			backgroundColor: alpha(theme.palette.grey[600], 0.48),
		},
		"&.simplebar-visible:before": {
			opacity: 1,
		},
	},
	"& .simplebar-mask": {
		zIndex: "inherit",
	},
}));
