"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";

import { Iconify } from "@/components/iconify";
import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const FEATURES = [
	{
		icon: "eva:smartphone-fill",
		title: "Mobile & SMS Ordering",
		description:
			"Easy-to-use mobile app and SMS system for quick restocking without internet dependency.",
	},
	{
		icon: "eva:truck-fill",
		title: "Same-Day Delivery",
		description:
			"Reliable same-day delivery across Nairobi, ensuring your shelves are never empty.",
	},
	{
		icon: "eva:bar-chart-fill",
		title: "Inventory Management",
		description:
			"Efficient inventory tracking and management tools to optimize your stock levels.",
	},
	{
		icon: "eva:people-fill",
		title: "Dedicated Support",
		description:
			"Local Kenyan support team that understands your business needs and challenges.",
	},
	{
		icon: "eva:credit-card-fill",
		title: "Flexible Payment",
		description:
			"Multiple payment options including M-Pesa, cash on delivery, and credit terms.",
	},
	{
		icon: "eva:trending-up-fill",
		title: "Business Growth",
		description:
			"Analytics and insights to help you grow your retail business sustainably.",
	},
];

// ----------------------------------------------------------------------

export default function AboutSection() {
	const theme = useTheme();

	return (
		<Container maxWidth="lg" sx={{ py: { xs: 8, md: 15 } }}>
			<MotionViewport>
				{/* Header */}
				<Stack spacing={3} sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
					<div>
						<Typography variant="overline" sx={{ color: "primary.main" }}>
							About Kenix Commodities
						</Typography>
					</div>

					<div>
						<Typography variant="h2" sx={{ color: "text.primary" }}>
							Empowering
							<Box component="span" sx={{ color: "secondary.main", mx: 1 }}>
								Small Businesses
							</Box>
							Across Kenya
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
							Kenix Commodities is a Nairobi-based B2B e-commerce platform
							revolutionizing retail in Kenya by streamlining access to
							essential goods for both formal and informal retailers. We drive
							sustainable growth in Kenya's retail sector.
						</Typography>
					</div>
				</Stack>

				{/* Features Grid */}
				<Grid container spacing={4}>
					{FEATURES.map((feature, index) => (
						<Grid key={feature.title} xs={12} md={4}>
							<div>
								<Card
									sx={{
										p: 4,
										height: "100%",
										textAlign: "center",
										bgcolor: "background.paper",
										border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
										transition: "all 0.3s ease-in-out",
										"&:hover": {
											transform: "translateY(-8px)",
											boxShadow: `0 20px 40px ${alpha(
												theme.palette.grey[500],
												0.12
											)}`,
											borderColor: "primary.main",
										},
									}}
								>
									<Box
										sx={{
											width: 72,
											height: 72,
											mx: "auto",
											mb: 3,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											borderRadius: "50%",
											bgcolor: alpha(theme.palette.primary.main, 0.1),
										}}
									>
										<Iconify
											icon={feature.icon}
											sx={{
												color: "primary.main",
												fontSize: 32,
											}}
										/>
									</Box>

									<Typography
										variant="h6"
										sx={{ mb: 2, color: "text.primary" }}
									>
										{feature.title}
									</Typography>

									<Typography
										variant="body2"
										sx={{
											color: "text.secondary",
											lineHeight: 1.6,
										}}
									>
										{feature.description}
									</Typography>
								</Card>
							</div>
						</Grid>
					))}
				</Grid>

				{/* Stats Section */}
				<Box sx={{ mt: { xs: 8, md: 12 } }}>
					<div>
						<Grid container spacing={4}>
							<Grid xs={12} md={4}>
								<Stack spacing={2} sx={{ textAlign: "center" }}>
									<Typography
										variant="h2"
										sx={{
											color: "primary.main",
											fontWeight: 700,
										}}
									>
										1000+
									</Typography>
									<Typography variant="h6" sx={{ color: "text.primary" }}>
										Active Retailers
									</Typography>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Trusted by over 1000 retailers across Nairobi
									</Typography>
								</Stack>
							</Grid>

							<Grid xs={12} md={4}>
								<Stack spacing={2} sx={{ textAlign: "center" }}>
									<Typography
										variant="h2"
										sx={{
											color: "secondary.main",
											fontWeight: 700,
										}}
									>
										24hrs
									</Typography>
									<Typography variant="h6" sx={{ color: "text.primary" }}>
										Delivery Time
									</Typography>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Same-day delivery guaranteed within Nairobi
									</Typography>
								</Stack>
							</Grid>

							<Grid xs={12} md={4}>
								<Stack spacing={2} sx={{ textAlign: "center" }}>
									<Typography
										variant="h2"
										sx={{
											color: "success.main",
											fontWeight: 700,
										}}
									>
										99%
									</Typography>
									<Typography variant="h6" sx={{ color: "text.primary" }}>
										Satisfaction Rate
									</Typography>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Customer satisfaction is our top priority
									</Typography>
								</Stack>
							</Grid>
						</Grid>
					</div>
				</Box>
			</MotionViewport>
		</Container>
	);
}
