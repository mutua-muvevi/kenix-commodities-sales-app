// src/components/sections/features/features-section.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PaymentIcon from "@mui/icons-material/Payment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";

import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const FEATURES = [
	{
		icon: PhoneAndroidIcon,
		title: "Mobile & SMS Ordering",
		description:
			"Easy-to-use mobile app and SMS system for quick restocking without internet dependency. Order anytime, anywhere.",
		gradient: ["#667eea", "#764ba2"],
		stats: "99.9% Uptime",
	},
	{
		icon: LocalShippingIcon,
		title: "Same-Day Delivery",
		description:
			"Reliable same-day delivery across Nairobi and expanding to all major Kenyan cities. Never run out of stock again.",
		gradient: ["#f093fb", "#f5576c"],
		stats: "Under 4 Hours",
	},
	{
		icon: InventoryIcon,
		title: "Smart Inventory Management",
		description:
			"AI-powered inventory tracking and management tools to optimize your stock levels and predict demand.",
		gradient: ["#4facfe", "#00f2fe"],
		stats: "40% Less Waste",
	},
	{
		icon: SupportAgentIcon,
		title: "24/7 Dedicated Support",
		description:
			"Local Kenyan support team that understands your business needs and challenges. Support in English and Swahili.",
		gradient: ["#43e97b", "#38f9d7"],
		stats: "1min Response",
	},
	{
		icon: PaymentIcon,
		title: "Flexible Payment Options",
		description:
			"Multiple payment options including M-Pesa, Airtel Money, cash on delivery, and flexible credit terms.",
		gradient: ["#fa709a", "#fee140"],
		stats: "5+ Methods",
	},
	{
		icon: TrendingUpIcon,
		title: "Business Growth Analytics",
		description:
			"Comprehensive analytics and insights to help you grow your retail business sustainably and make data-driven decisions.",
		gradient: ["#a8edea", "#fed6e3"],
		stats: "30% Growth",
	},
	{
		icon: SecurityIcon,
		title: "Secure & Reliable",
		description:
			"Bank-grade security with SSL encryption, secure payment processing, and data protection compliance.",
		gradient: ["#ff9a9e", "#fecfef"],
		stats: "256-bit SSL",
	},
	{
		icon: SpeedIcon,
		title: "Lightning Fast Platform",
		description:
			"Optimized platform for quick ordering and processing. Average order completion time under 2 minutes.",
		gradient: ["#ffecd2", "#fcb69f"],
		stats: "<2min Orders",
	},
];

// ----------------------------------------------------------------------

export default function FeaturesSection() {
	const theme = useTheme();

	return (
		<Box
			sx={{
				py: { xs: 8, md: 15 },
				background: `linear-gradient(180deg, 
          ${theme.palette.grey[50]} 0%, 
          ${theme.palette.common.white} 50%,
          ${theme.palette.grey[50]} 100%)`,
				position: "relative",
				overflow: "hidden",
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
            radial-gradient(circle at 20% 50%, ${alpha(
							theme.palette.primary.main,
							0.05
						)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(
							theme.palette.secondary.main,
							0.05
						)} 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${alpha(
							theme.palette.info.main,
							0.05
						)} 0%, transparent 50%)
          `,
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative" }}>
				<MotionViewport>
					{/* Header */}
					<Stack
						spacing={3}
						sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}
					>
						<div>
							<Typography
								variant="overline"
								sx={{
									color: "primary.main",
									fontWeight: 700,
									letterSpacing: 2,
								}}
							>
								POWERFUL FEATURES
							</Typography>
						</div>

						<div>
							<Typography
								variant="h2"
								sx={{
									color: "text.primary",
									fontWeight: 800,
									fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
								}}
							>
								Everything You Need to
								<Box
									component="span"
									sx={{
										display: "block",
										background: "linear-gradient(45deg, #667eea, #764ba2)",
										backgroundClip: "text",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										mt: 1,
									}}
								>
									Scale Your Business
								</Box>
							</Typography>
						</div>

						<div>
							<Typography
								variant="h5"
								sx={{
									color: "text.secondary",
									fontWeight: 400,
									maxWidth: 800,
									mx: "auto",
									lineHeight: 1.6,
								}}
							>
								From smart inventory management to same-day delivery, our
								platform provides all the tools you need to succeed in Kenya's
								competitive retail market.
							</Typography>
						</div>
					</Stack>

					{/* Features Grid */}
					<Grid container spacing={{ xs: 3, md: 4 }}>
						{FEATURES.map((feature, index) => (
							<Grid xs={12} sm={6} md={4} lg={3} key={index}>
								<div>
									<Card
										component={"div"}
										whileHover={{
											y: -8,
											transition: { duration: 0.3, ease: "easeOut" },
										}}
										sx={{
											p: 4,
											height: "100%",
											textAlign: "center",
											position: "relative",
											background: "white",
											boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
											borderRadius: 3,
											border: `1px solid ${alpha(
												theme.palette.grey[300],
												0.5
											)}`,
											overflow: "hidden",
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											"&:hover": {
												boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
												borderColor: "primary.main",
											},
										}}
									>
										{/* Background gradient overlay on hover */}
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
												opacity: 0,
												transition: "opacity 0.3s ease",
												".MuiCard-root:hover &": {
													opacity: 0.03,
												},
											}}
										/>

										<Stack
											spacing={3}
											alignItems="center"
											sx={{ position: "relative", zIndex: 1 }}
										>
											{/* Icon with gradient background */}
											<Box
												sx={{
													width: 80,
													height: 80,
													borderRadius: 3,
													background: `linear-gradient(135deg, ${feature.gradient[0]}, ${feature.gradient[1]})`,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													boxShadow: `0 8px 32px ${alpha(
														feature.gradient[0],
														0.3
													)}`,
													transition: "all 0.3s ease",
													".MuiCard-root:hover &": {
														transform: "scale(1.1) rotate(5deg)",
														boxShadow: `0 12px 40px ${alpha(
															feature.gradient[0],
															0.4
														)}`,
													},
												}}
											>
												<feature.icon sx={{ fontSize: 36, color: "white" }} />
											</Box>

											<Stack spacing={2} alignItems="center">
												<Typography
													variant="h6"
													sx={{
														fontWeight: 700,
														color: "text.primary",
														fontSize: "1.1rem",
													}}
												>
													{feature.title}
												</Typography>

												<Typography
													variant="body2"
													sx={{
														color: "text.secondary",
														lineHeight: 1.6,
														fontSize: "0.9rem",
													}}
												>
													{feature.description}
												</Typography>

												{/* Stats badge */}
												<Box
													sx={{
														px: 2,
														py: 0.5,
														borderRadius: 10,
														background: alpha(feature.gradient[0], 0.1),
														border: `1px solid ${alpha(
															feature.gradient[0],
															0.2
														)}`,
													}}
												>
													<Typography
														variant="caption"
														sx={{
															color: feature.gradient[0],
															fontWeight: 600,
															fontSize: "0.75rem",
														}}
													>
														{feature.stats}
													</Typography>
												</Box>
											</Stack>
										</Stack>
									</Card>
								</div>
							</Grid>
						))}
					</Grid>

					{/* Bottom CTA */}
					<Box sx={{ textAlign: "center", mt: { xs: 8, md: 10 } }}>
						<div>
							<Stack spacing={3} alignItems="center">
								<Typography
									variant="h4"
									sx={{
										color: "text.primary",
										fontWeight: 700,
										maxWidth: 600,
										mx: "auto",
									}}
								>
									Ready to Transform Your Business?
								</Typography>

								<Typography
									variant="body1"
									sx={{
										color: "text.secondary",
										maxWidth: 500,
										mx: "auto",
										lineHeight: 1.6,
									}}
								>
									Join over 1,000 retailers who trust Kenix Commodities for
									their supply needs. Start your journey today with our
									comprehensive B2B platform.
								</Typography>

								<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
									<div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Box
											component="button"
											sx={{
												px: 4,
												py: 2,
												bgcolor: "primary.main",
												color: "white",
												border: "none",
												borderRadius: 2,
												fontSize: "1rem",
												fontWeight: 600,
												cursor: "pointer",
												minWidth: 180,
												boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
												"&:hover": {
													bgcolor: "primary.dark",
													boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
												},
												transition: "all 0.3s ease",
											}}
										>
											Get Started Free
										</Box>
									</div>

									<div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Box
											component="button"
											sx={{
												px: 4,
												py: 2,
												bgcolor: "transparent",
												color: "text.primary",
												border: "2px solid",
												borderColor: "primary.main",
												borderRadius: 2,
												fontSize: "1rem",
												fontWeight: 600,
												cursor: "pointer",
												minWidth: 180,
												"&:hover": {
													bgcolor: "primary.main",
													color: "white",
												},
												transition: "all 0.3s ease",
											}}
										>
											Schedule Demo
										</Box>
									</div>
								</Stack>
							</Stack>
						</div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
