// src/components/modal/modal.tsx
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	useTheme,
	IconButton,
	Stack,
	useMediaQuery,
	Slide,
	AppBar,
	Toolbar,
	Box,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import { Iconify } from "@/components/iconify";
import Scrollbar from "@/components/scrollbar";

interface ModalComponentProps {
	title?: string;
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	height?: number | string;
	actions?: React.ReactNode[];
	maxWidth?: "sm" | "md" | "lg" | "xl";
	level?: "default" | "info" | "success" | "warning" | "error";
}

// Slide transition for mobile fullscreen
const Transition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const ModalComponent: React.FC<ModalComponentProps> = ({
	title,
	open,
	onClose,
	children,
	height,
	maxWidth,
	level,
	actions,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

	// Mobile fullscreen modal
	if (isMobile) {
		return (
			<Dialog
				open={open}
				onClose={onClose}
				fullScreen
				TransitionComponent={Transition}
				sx={{
					"& .MuiDialog-paper": {
						borderRadius: 0,
						margin: 0,
						maxHeight: "100vh",
						height: "95vh",
					},
				}}
			>
				{/* Mobile App Bar Header */}
				<AppBar
					position="sticky"
					elevation={1}
					sx={{
						backgroundColor:
							level && level !== "default"
								? theme.palette[level]?.main
								: theme.palette.primary.main,
						zIndex: theme.zIndex.appBar,
					}}
				>
					<Toolbar
						sx={{
							minHeight: { xs: 56, sm: 64 },
							px: { xs: 2, sm: 3 },
						}}
					>
						<Typography
							variant="h6"
							component="div"
							sx={{
								flexGrow: 1,
								color:
									level && level !== "default"
										? theme.palette[level]?.contrastText
										: theme.palette.primary.contrastText,
								fontSize: { xs: "1rem", sm: "1.25rem" },
								fontWeight: 600,
							}}
						>
							{title || "Details"}
						</Typography>
						<IconButton
							edge="end"
							onClick={onClose}
							sx={{
								color:
									level && level !== "default"
										? theme.palette[level]?.contrastText
										: theme.palette.primary.contrastText,
								ml: 2,
								p: { xs: 1, sm: 1.5 },
							}}
							size={isSmallMobile ? "small" : "medium"}
						>
							<Iconify icon="mdi:close" />
						</IconButton>
					</Toolbar>
				</AppBar>

				{/* Mobile Content */}
				<DialogContent
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						p: 0,
						overflow: "hidden",
						position: "relative",
					}}
				>
					<Box sx={{ flex: 1, overflow: "auto" }}>
						<Scrollbar
							sx={{
								height: actions ? "calc(100vh - 160px)" : "calc(100vh - 120px)", // Account for header and actions
								"& .simplebar-content": {
									padding: theme.spacing(2),
									minHeight: "100%",
								},
							}}
						>
							{children}
						</Scrollbar>
					</Box>

					{/* Mobile Actions */}
					{actions && (
						<Box
							sx={{
								backgroundColor: theme.palette.background.paper,
								borderTop: `1px solid ${theme.palette.divider}`,
								p: 2,
								flexShrink: 0,
							}}
						>
							<Stack
								direction={isSmallMobile ? "column" : "row"}
								spacing={isSmallMobile ? 1 : 2}
								justifyContent="flex-end"
								sx={{
									"& > *": {
										...(isSmallMobile && {
											width: "100%",
											minHeight: 44, // Touch-friendly height
										}),
									},
								}}
							>
								{actions}
							</Stack>
						</Box>
					)}
				</DialogContent>
			</Dialog>
		);
	}

	// Desktop modal - PROPER IMPLEMENTATION
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth={maxWidth || "xl"}
			fullWidth
			sx={{
				"& .MuiDialog-paper": {
					borderRadius: 2,
					maxHeight: height ? height : "90vh",
					margin: 2,
					display: "flex",
					flexDirection: "column",
				},
			}}
		>
			{/* FIXED HEADER - BLUE SECTION */}
			<DialogTitle
				sx={{
					backgroundColor:
						level && level !== "default"
							? theme.palette[level]?.main
							: theme.palette.primary.main,
					py: 2,
					px: 3,
					flexShrink: 0, // Prevent shrinking
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography
						variant="h6"
						sx={{
							color:
								level && level !== "default"
									? theme.palette[level]?.contrastText
									: theme.palette.primary.contrastText,
							fontWeight: 600,
						}}
					>
						{title || "Details"}
					</Typography>
					<IconButton
						onClick={onClose}
						sx={{
							color:
								level && level !== "default"
									? theme.palette[level]?.contrastText
									: theme.palette.primary.contrastText,
							ml: 2,
						}}
					>
						<Iconify icon="mdi:close" />
					</IconButton>
				</Stack>
			</DialogTitle>

			{/* SCROLLABLE CONTENT AREA */}
			<DialogContent
				sx={{
					p: 0,
					flex: 1,
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Scrollbar
					sx={{
						height: actions ? "calc(90vh - 200px)" : "calc(90vh - 120px)",
						"& .simplebar-content": {
							padding: theme.spacing(3),
						},
						"& .simplebar-scrollbar": {
							"&:before": {
								backgroundColor: theme.palette.grey[400],
								opacity: 0.8,
							},
							"&.simplebar-visible:before": {
								opacity: 1,
							},
						},
					}}
				>
					{children}
				</Scrollbar>
			</DialogContent>

			{/* FIXED ACTIONS AT BOTTOM */}
			{actions && (
				<Box
					sx={{
						p: 3,
						pt: 2,
						borderTop: `1px solid ${theme.palette.divider}`,
						backgroundColor: theme.palette.background.paper,
						flexShrink: 0, // Prevent shrinking
					}}
				>
					<Stack direction="row" justifyContent="flex-end" spacing={2}>
						{actions}
					</Stack>
				</Box>
			)}
		</Dialog>
	);
};

export default ModalComponent;
