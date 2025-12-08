/* eslint-disable @typescript-eslint/no-explicit-any */
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { alpha, styled, useTheme } from "@mui/material/styles";
//

import { LeftIcon, RightIcon } from "./arrow-icons";
import { ThemeTypes } from "@/theme/types";

// ----------------------------------------------------------------------
interface StyledIconButtonProps {
	filled: boolean;
	shape: string;
	hasChild?: boolean;
	theme: ThemeTypes;
}

const StyledIconButton = styled(IconButton, {
	shouldForwardProp: (prop?: any) => prop !== "filled" && prop !== "hasChild" && prop !== "shape",
})(({ filled, shape, hasChild, theme }: StyledIconButtonProps) => ({
	color: "inherit",
	transition: theme.transitions.create("all", {
		duration: theme.transitions.duration.shorter,
	}),
	...(shape === "rounded" && {
		borderRadius: theme.shape.borderRadius * 1.5,
	}),
	...(!filled && {
		opacity: 0.48,
		"&:hover": {
			opacity: 1,
		},
	}),
	...(filled && {
		color: alpha(theme.palette.common.white, 0.8),
		backgroundColor: alpha(theme.palette.grey[900], 0.48),
		"&:hover": {
			color: theme.palette.common.white,
			backgroundColor: theme.palette.grey[900],
		},
	}),
	...(hasChild && {
		zIndex: 9,
		top: "50%",
		position: "absolute",
		marginTop: theme.spacing(-2.5),
	}),
}));

// ----------------------------------------------------------------------

interface CarouselArrowsProps {
	shape?: "circular" | "rounded";
	filled?: boolean;
	icon?: string | React.ReactElement;
	onNext?: VoidFunction;
	onPrev?: VoidFunction;
	children?: React.ReactNode;
	leftButtonProps?: object | any;
	rightButtonProps?: object | any;
	sx?: object;
}

export default function CarouselArrows({
	shape = "circular",
	filled = false,
	// icon,
	onNext,
	onPrev,
	children,
	leftButtonProps,
	rightButtonProps,
	sx,
	...other
}: CarouselArrowsProps) {
	const theme = useTheme();

	const isRTL = theme.direction === "rtl";

	const hasChild = !!children;

	if (hasChild) {
		return (
			<Stack sx={sx} {...other}>
				{onNext && (
					<StyledIconButton
						theme={theme}
						filled={filled}
						shape={shape}
						hasChild={!!children}
						onClick={onPrev}
						{...leftButtonProps}
						sx={{
							left: 16,
							...leftButtonProps?.sx,
						}}
					>
						<LeftIcon isRTL={isRTL} />
					</StyledIconButton>
				)}

				{children}

				{onPrev && (
					<StyledIconButton
						theme={theme}
						filled={filled}
						shape={shape}
						hasChild={!!children}
						onClick={onNext}
						{...rightButtonProps}
						sx={{
							right: 16,
							...rightButtonProps?.sx,
						}}
					>
						<RightIcon isRTL={isRTL} />
					</StyledIconButton>
				)}
			</Stack>
		);
	}

	return (
		<Stack direction="row" alignItems="center" display="inline-flex" sx={sx} {...other}>
			<StyledIconButton theme={theme} filled={filled} shape={shape} onClick={onPrev} {...leftButtonProps}>
				<LeftIcon isRTL={isRTL} />
			</StyledIconButton>

			<StyledIconButton theme={theme} filled={filled} shape={shape} onClick={onNext} {...rightButtonProps}>
				<RightIcon isRTL={isRTL} />
			</StyledIconButton>
		</Stack>
	);
}
