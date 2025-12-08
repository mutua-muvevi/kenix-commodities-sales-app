// src/components/sections/hero/hero-section.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

import { Iconify } from "@/components/iconify";
import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const HERO_STATS = [
	{
		number: "1000+",
		label: "Active Retailers",
		icon: TrendingUpIcon,
		color: "primary",
	},
	{
		number: "24hrs",
		label: "Delivery Time",
		icon: LocalShippingIcon,
		color: "secondary",
	},
	{
		number: "5000+",
		label: "Products",
		icon: InventoryIcon,
		color: "info",
	},
	{
		number: "99.5%",
		label: "Uptime",
		icon: PhoneAndroidIcon,
		color: "success",
	},
];

// ----------------------------------------------------------------------

export default function HeroSection() {
	const theme = useTheme();

	return (
		<Box
			sx={{
				minHeight: { xs: "100vh", md: "100vh" },
				position: "relative",
				overflow: "hidden",
				background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.dark} 50%,
          ${theme.palette.secondary.main} 100%)`,
				display: "flex",
				alignItems: "center",
			}}
		>
			{/* Background Pattern */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `
            radial-gradient(circle at 25% 25%, ${alpha(
							theme.palette.common.white,
							0.1
						)} 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${alpha(
							theme.palette.secondary.light,
							0.1
						)} 0%, transparent 50%)
          `,
					zIndex: 1,
				}}
			/>

			{/* Animated Background Elements */}
			<Box
				component="div"
				sx={{
					position: "absolute",
					top: "10%",
					right: "10%",
					width: { xs: 60, md: 100 },
					height: { xs: 60, md: 100 },
					borderRadius: "50%",
					background: alpha(theme.palette.warning.main, 0.1),
					zIndex: 1,
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
				<MotionViewport>
					<Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
						{/* Left Content */}
						<Grid xs={12} md={6}>
							<Stack spacing={{ xs: 3, md: 4 }}>
								<div>
									<Typography
										variant="overline"
										sx={{
											color: alpha(theme.palette.common.white, 0.8),
											letterSpacing: 2,
											fontWeight: 600,
										}}
									>
										REVOLUTIONIZING RETAIL IN KENYA
									</Typography>
								</div>

								<div>
									<Typography
										variant="h1"
										sx={{
											color: "white",
											fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
											fontWeight: 800,
											lineHeight: 1.1,
											textShadow: "0 4px 12px rgba(0,0,0,0.3)",
										}}
									>
										Kenya's Premier
										<Box
											component="span"
											sx={{
												display: "block",
												background: "linear-gradient(45deg, #FFD700, #FF8C00)",
												backgroundClip: "text",
												WebkitBackgroundClip: "text",
												WebkitTextFillColor: "transparent",
											}}
										>
											B2B E-commerce
										</Box>
										Platform
									</Typography>
								</div>

								<div>
									<Typography
										variant="h5"
										sx={{
											color: alpha(theme.palette.common.white, 0.9),
											fontWeight: 400,
											lineHeight: 1.6,
											maxWidth: 600,
										}}
									>
										Streamlining access to essential goods for retailers across
										Kenya. Same-day delivery, flexible payments, and dedicated
										support.
									</Typography>
								</div>

								<div>
									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={2}
										sx={{ mt: 4 }}
									>
										<Button
											size="large"
											variant="contained"
											endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
											sx={{
												minWidth: 200,
												height: 56,
												bgcolor: "white",
												color: "primary.main",
												fontWeight: 700,
												fontSize: "1.1rem",
												borderRadius: 3,
												boxShadow: "0 8px 32px rgba(255,255,255,0.3)",
												"&:hover": {
													bgcolor: alpha(theme.palette.common.white, 0.9),
													transform: "translateY(-2px)",
													boxShadow: "0 12px 40px rgba(255,255,255,0.4)",
												},
												transition: "all 0.3s ease",
											}}
										>
											Start Trading Now
										</Button>

										<Button
											size="large"
											variant="outlined"
											startIcon={<PlayCircleOutlineIcon />}
											sx={{
												minWidth: 180,
												height: 56,
												borderColor: alpha(theme.palette.common.white, 0.5),
												color: "white",
												fontWeight: 600,
												borderRadius: 3,
												backdropFilter: "blur(10px)",
												background: alpha(theme.palette.common.white, 0.1),
												"&:hover": {
													borderColor: "white",
													background: alpha(theme.palette.common.white, 0.2),
													transform: "translateY(-2px)",
												},
												transition: "all 0.3s ease",
											}}
										>
											Watch Demo
										</Button>
									</Stack>
								</div>

								{/* Trust Indicators */}
								<div>
									<Grid container spacing={3} sx={{ mt: 4 }}>
										{HERO_STATS.map((stat, index) => (
											<Grid xs={6} sm={3} key={index}>
												<Card
													component="div"
													sx={{
														p: 2,
														textAlign: "center",
														background: alpha(theme.palette.common.white, 0.1),
														backdropFilter: "blur(20px)",
														border: `1px solid ${alpha(
															theme.palette.common.white,
															0.2
														)}`,
														borderRadius: 2,
													}}
												>
													<Box
														sx={{
															color: `${stat.color}.light`,
															mb: 1,
															display: "flex",
															justifyContent: "center",
														}}
													>
														<stat.icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
													</Box>
													<Typography
														variant="h6"
														sx={{
															color: "white",
															fontWeight: 700,
															fontSize: { xs: "1rem", sm: "1.25rem" },
														}}
													>
														{stat.number}
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: alpha(theme.palette.common.white, 0.8),
															fontSize: { xs: "0.75rem", sm: "0.875rem" },
														}}
													>
														{stat.label}
													</Typography>
												</Card>
											</Grid>
										))}
									</Grid>
								</div>
							</Stack>
						</Grid>

						{/* Right Content - Hero Image/Video */}
						<Grid xs={12} md={6}>
							<div>
								<Box
									sx={{
										position: "relative",
										borderRadius: 4,
										overflow: "hidden",
										boxShadow: "0 20px 80px rgba(0,0,0,0.3)",
									}}
								>
									{/* Placeholder for hero image/video */}
									<Box
										sx={{
											width: "100%",
											height: { xs: 300, md: 500 },
											background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.common.white, 0.2)} 0%, 
                        ${alpha(theme.palette.primary.light, 0.3)} 100%)`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											backdropFilter: "blur(20px)",
											border: `1px solid ${alpha(
												theme.palette.common.white,
												0.3
											)}`,
										}}
									>
										<Stack spacing={2} alignItems="center">
											<Box
												component="div"
											>
												<PhoneAndroidIcon
													sx={{
														fontSize: { xs: 60, md: 80 },
														color: "white",
														filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
													}}
												/>
											</Box>
											<Typography
												variant="h6"
												sx={{
													color: "white",
													textAlign: "center",
													fontWeight: 600,
												}}
											>
												Mobile App Coming Soon
											</Typography>
										</Stack>
									</Box>

									{/* Floating Action Cards */}
									<Card
										component="div"
										sx={{
											position: "absolute",
											top: 20,
											right: 20,
											p: 1.5,
											background: alpha(theme.palette.success.main, 0.9),
											backdropFilter: "blur(20px)",
											minWidth: 120,
										}}
									>
										<Typography
											variant="caption"
											sx={{ color: "white", fontWeight: 600 }}
										>
											🚀 Fast Delivery
										</Typography>
									</Card>

									<Card
										component="div"
										sx={{
											position: "absolute",
											bottom: 20,
											left: 20,
											p: 1.5,
											background: alpha(theme.palette.warning.main, 0.9),
											backdropFilter: "blur(20px)",
											minWidth: 120,
										}}
									>
										<Typography
											variant="caption"
											sx={{ color: "white", fontWeight: 600 }}
										>
											💳 Flexible Pay
										</Typography>
									</Card>
								</Box>
							</div>
						</Grid>
					</Grid>
				</MotionViewport>
			</Container>

			{/* Scroll indicator */}
			<Box
				component="div"
				sx={{
					position: "absolute",
					bottom: 30,
					left: "50%",
					transform: "translateX(-50%)",
					color: alpha(theme.palette.common.white, 0.7),
					cursor: "pointer",
					zIndex: 2,
				}}
			>
				<Stack alignItems="center" spacing={1}>
					<Typography variant="caption" sx={{ color: "inherit" }}>
						Scroll to explore
					</Typography>
					<Iconify icon="eva:arrow-down-fill" sx={{ fontSize: 24 }} />
				</Stack>
			</Box>
		</Box>
	);
}
