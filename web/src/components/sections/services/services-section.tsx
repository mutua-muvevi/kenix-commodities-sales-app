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

import { Iconify } from "@/components/iconify";
import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const SERVICES = [
	{
		icon: "eva:shopping-bag-fill",
		title: "Essential Goods Supply",
		description:
			"Wide range of essential goods including food items, beverages, household products, and more.",
		features: [
			"Fresh produce and groceries",
			"Packaged foods and beverages",
			"Household essentials",
			"Personal care products",
		],
		color: "primary",
	},
	{
		icon: "eva:smartphone-fill",
		title: "Mobile & SMS Platform",
		description:
			"User-friendly mobile app and SMS ordering system designed for easy access and operation.",
		features: [
			"Intuitive mobile application",
			"SMS-based ordering system",
			"Offline functionality",
			"Multi-language support",
		],
		color: "secondary",
	},
	{
		icon: "eva:truck-fill",
		title: "Delivery & Logistics",
		description:
			"Reliable same-day delivery service across Nairobi with real-time tracking and updates.",
		features: [
			"Same-day delivery guarantee",
			"Real-time order tracking",
			"Flexible delivery schedules",
			"Reliable logistics network",
		],
		color: "success",
	},
	{
		icon: "eva:bar-chart-fill",
		title: "Inventory Management",
		description:
			"Advanced inventory tracking and management tools to optimize your stock levels and reduce waste.",
		features: [
			"Real-time stock monitoring",
			"Automated reorder alerts",
			"Sales analytics",
			"Demand forecasting",
		],
		color: "info",
	},
	{
		icon: "eva:credit-card-fill",
		title: "Flexible Payment Options",
		description:
			"Multiple payment methods including mobile money, cash on delivery, and flexible credit terms.",
		features: [
			"M-Pesa integration",
			"Cash on delivery",
			"Flexible credit terms",
			"Bulk order discounts",
		],
		color: "warning",
	},
	{
		icon: "eva:headphones-fill",
		title: "Dedicated Support",
		description:
			"Local customer support team providing assistance in English and Swahili during business hours.",
		features: [
			"Local support team",
			"English & Swahili support",
			"Business consultation",
			"Technical assistance",
		],
		color: "error",
	},
];

// ----------------------------------------------------------------------

export default function ServicesSection() {
	const theme = useTheme();

	return (
		<Box sx={{ bgcolor: "grey.50", py: { xs: 8, md: 15 } }}>
			<Container maxWidth="lg">
				<MotionViewport>
					{/* Header */}
					<Stack
						spacing={3}
						sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}
					>
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Typography variant="overline" sx={{ color: "primary.main" }}>
								Our Services
							</Typography>
						</m.div>

						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Typography variant="h2" sx={{ color: "text.primary" }}>
								Complete
								<Box component="span" sx={{ color: "secondary.main", mx: 1 }}>
									B2B Solutions
								</Box>
								for Your Business
							</Typography>
						</m.div>

						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
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
								From ordering to delivery, we provide end-to-end solutions that
								help your retail business thrive in Kenya's competitive market.
							</Typography>
						</m.div>
					</Stack>

					{/* Services Grid */}
					<Grid container spacing={4}>
						{SERVICES.map((service, index) => (
							<Grid key={service.title} xs={12} md={6}>
								<m.div>
									<Card
										sx={{
											p: 4,
											height: "100%",
											bgcolor: "background.paper",
											border: `1px solid ${alpha(
												theme.palette.grey[500],
												0.12
											)}`,
											transition: "all 0.3s ease-in-out",
											"&:hover": {
												transform: "translateY(-8px)",
												boxShadow: `0 20px 40px ${alpha(
													theme.palette.grey[500],
													0.12
												)}`,
												borderColor: `${service.color}.main`,
											},
										}}
									>
										<Stack spacing={3}>
											{/* Service Header */}
											<Stack
												direction="row"
												spacing={2}
												sx={{ alignItems: "center" }}
											>
												<Box
													sx={{
														width: 56,
														height: 56,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														borderRadius: 2,
														bgcolor: alpha(
															theme.palette[
																service.color as keyof typeof theme.palette
															]?.main || theme.palette.primary.main,
															0.1
														),
													}}
												>
													<Iconify
														icon={service.icon}
														sx={{
															color: `${service.color}.main`,
															fontSize: 28,
														}}
													/>
												</Box>

												<Stack spacing={0.5} sx={{ flex: 1 }}>
													<Typography
														variant="h6"
														sx={{ color: "text.primary" }}
													>
														{service.title}
													</Typography>
												</Stack>
											</Stack>

											{/* Service Description */}
											<Typography
												variant="body2"
												sx={{
													color: "text.secondary",
													lineHeight: 1.6,
												}}
											>
												{service.description}
											</Typography>

											{/* Service Features */}
											<Stack spacing={1.5}>
												{service.features.map((feature) => (
													<Stack
														key={feature}
														direction="row"
														spacing={1}
														sx={{ alignItems: "center" }}
													>
														<Iconify
															icon="eva:checkmark-circle-2-fill"
															sx={{
																color: `${service.color}.main`,
																fontSize: 16,
																flexShrink: 0,
															}}
														/>
														<Typography
															variant="body2"
															sx={{
																color: "text.secondary",
																fontSize: 14,
															}}
														>
															{feature}
														</Typography>
													</Stack>
												))}
											</Stack>

											{/* CTA Button */}
											<Button
												variant="outlined"
												color={service.color as any}
												endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
												sx={{
													alignSelf: "flex-start",
													mt: 2,
													borderColor: alpha(
														theme.palette[
															service.color as keyof typeof theme.palette
														]?.main || theme.palette.primary.main,
														0.3
													),
													"&:hover": {
														borderColor: `${service.color}.main`,
														bgcolor: alpha(
															theme.palette[
																service.color as keyof typeof theme.palette
															]?.main || theme.palette.primary.main,
															0.08
														),
													},
												}}
											>
												Learn More
											</Button>
										</Stack>
									</Card>
								</m.div>
							</Grid>
						))}
					</Grid>

					{/* CTA Section */}
					<Box sx={{ mt: { xs: 8, md: 10 }, textAlign: "center" }}>
						<m.div>
							<Card
								sx={{
									p: { xs: 4, md: 6 },
									bgcolor: "primary.main",
									color: "primary.contrastText",
									background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
								}}
							>
								<Stack spacing={3} sx={{ alignItems: "center" }}>
									<Typography variant="h3" sx={{ color: "inherit" }}>
										Ready to Transform Your Business?
									</Typography>

									<Typography
										variant="h6"
										sx={{
											color: alpha(theme.palette.primary.contrastText, 0.8),
											maxWidth: 600,
											fontWeight: 400,
										}}
									>
										Join over 1000 retailers who trust Kenix Commodities for
										their supply needs. Start your journey today!
									</Typography>

									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={2}
										sx={{ mt: 2 }}
									>
										<Button
											size="large"
											variant="contained"
											color="secondary"
											endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
											sx={{
												minWidth: 160,
												height: 48,
											}}
										>
											Get Started
										</Button>

										<Button
											size="large"
											variant="outlined"
											sx={{
												minWidth: 160,
												height: 48,
												borderColor: alpha(
													theme.palette.primary.contrastText,
													0.3
												),
												color: "primary.contrastText",
												"&:hover": {
													borderColor: "primary.contrastText",
													bgcolor: alpha(
														theme.palette.primary.contrastText,
														0.1
													),
												},
											}}
										>
											Contact Sales
										</Button>
									</Stack>
								</Stack>
							</Card>
						</m.div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
