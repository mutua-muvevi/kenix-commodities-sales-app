// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

const StyledRoot = styled(Box, {
	shouldForwardProp: (prop) => prop !== "rounded",
})(({ rounded, theme }) => ({
	zIndex: 9,
	margin: 0,
	padding: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: theme.palette.primary.main,
	"& li": {
		width: 18,
		height: 18,
		opacity: 0.32,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
		"&.slick-active": {
			opacity: 1,
			...(rounded && {
				"& span": {
					width: 16,
					borderRadius: 6,
				},
			}),
		},
	},
}));

const StyledDot = styled("span")(({ theme }) => ({
	width: 8,
	height: 8,
	borderRadius: "50%",
	transition: theme.transitions.create(["width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.short,
	}),
}));

// ----------------------------------------------------------------------

interface CarouselDotsProps {
	rounded?: boolean;
	sx?: object;
}

const CarouselDots = (props: CarouselDotsProps) => {
	const rounded = props?.rounded || false;

	const sx = props?.sx;

	return {
		appendDots: (dots: any) => (
			<>
				<StyledRoot component="ul" rounded={rounded} sx={{ ...sx }} {...props}>
					{dots}
				</StyledRoot>
			</>
		),
		customPaging: () => (
			<Stack
				component="div"
				alignItems="center"
				justifyContent="center"
				sx={{ width: 1, height: 1 }}
			>
				<StyledDot
					sx={{
						bgcolor: "currentColor",
					}}
				/>
			</Stack>
		),
	};
};

export default CarouselDots;
