// src/components/sections/testimonials/testimonials-section.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const TESTIMONIALS_DATA = [
	{
		id: 1,
		name: "Mary Wanjiku",
		role: "Shop Owner",
		location: "Kawangware, Nairobi",
		avatar: "👩🏿‍💼",
		rating: 5,
		content:
			"Kenix Commodities has transformed my business completely. The same-day delivery and quality products have helped me increase my sales by 40%. My customers are always happy with the fresh produce.",
		businessType: "Retail Shop",
		monthsUsing: 8,
	},
	{
		id: 2,
		name: "James Kimani",
		role: "Supermarket Manager",
		location: "Eastleigh, Nairobi",
		avatar: "👨🏿‍💼",
		rating: 5,
		content:
			"The inventory management system is incredible. I never run out of stock anymore, and the flexible payment options have improved my cash flow significantly. Highly recommended!",
		businessType: "Supermarket",
		monthsUsing: 12,
	},
	{
		id: 3,
		name: "Grace Akinyi",
		role: "Kiosk Owner",
		location: "Kibera, Nairobi",
		avatar: "👩🏿",
		rating: 5,
		content:
			"Before Kenix, I had to travel to the market daily. Now I just SMS my order and get everything delivered the same day. It saves me time and money. The support team speaks Swahili too!",
		businessType: "Kiosk",
		monthsUsing: 6,
	},
	{
		id: 4,
		name: "Peter Mwangi",
		role: "Store Manager",
		location: "South B, Nairobi",
		avatar: "👨🏿",
		rating: 5,
		content:
			"The quality of products is consistently high, and the pricing is very competitive. The mobile app makes ordering so easy. My business has grown by 30% since I started using Kenix.",
		businessType: "Convenience Store",
		monthsUsing: 10,
	},
	{
		id: 5,
		name: "Susan Njeri",
		role: "Wholesale Buyer",
		location: "Gikomba, Nairobi",
		avatar: "👩🏿‍💼",
		rating: 5,
		content:
			"As a wholesale buyer, I need reliable suppliers. Kenix delivers on time, every time. The bulk discounts and credit terms have helped me expand my business to three locations.",
		businessType: "Wholesale",
		monthsUsing: 15,
	},
	{
		id: 6,
		name: "David Ochieng",
		role: "Restaurant Owner",
		location: "Westlands, Nairobi",
		avatar: "👨🏿‍🍳",
		rating: 5,
		content:
			"Fresh ingredients are crucial for my restaurant. Kenix ensures I get the best quality produce delivered early morning. The consistency has improved my customer satisfaction ratings.",
		businessType: "Restaurant",
		monthsUsing: 9,
	},
];

// ----------------------------------------------------------------------

export default function TestimonialsSection() {
	const theme = useTheme();

	return (
		<Box
			sx={{
				py: { xs: 8, md: 15 },
				bgcolor: "grey.50",
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
							0.03
						)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(
							theme.palette.secondary.main,
							0.03
						)} 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${alpha(
							theme.palette.info.main,
							0.03
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
								CUSTOMER TESTIMONIALS
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
								What Our Customers
								<Box
									component="span"
									sx={{
										display: "block",
										color: "secondary.main",
										mt: 1,
									}}
								>
									Say About Us
								</Box>
							</Typography>
						</div>

						<div>
							<Typography
								variant="h6"
								sx={{
									color: "text.secondary",
									fontWeight: 400,
									maxWidth: 700,
									mx: "auto",
									lineHeight: 1.6,
								}}
							>
								Real stories from real business owners across Nairobi who have
								transformed their operations with Kenix Commodities.
							</Typography>
						</div>
					</Stack>

					{/* Testimonials Grid */}
					<Grid container spacing={{ xs: 3, md: 4 }}>
						{TESTIMONIALS_DATA.map((testimonial, index) => (
							<Grid xs={12} sm={6} md={4} key={testimonial.id}>
								<div>
									<Card
										component="div"
										whileHover={{
											y: -8,
											transition: { duration: 0.3, ease: "easeOut" },
										}}
										sx={{
											p: 4,
											height: "100%",
											position: "relative",
											borderRadius: 3,
											boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
											border: `1px solid ${alpha(
												theme.palette.grey[300],
												0.5
											)}`,
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											background: "white",
											"&:hover": {
												boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
												borderColor: "primary.main",
												transform: "translateY(-4px)",
											},
										}}
									>
										<Stack spacing={3} height="100%">
											{/* Quote Icon and Rating */}
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="flex-start"
											>
												<Stack direction="row" spacing={0.5}>
													{[...Array(testimonial.rating)].map((_, i) => (
														<StarIcon
															key={i}
															sx={{
																fontSize: 20,
																color: "warning.main",
															}}
														/>
													))}
												</Stack>

												<Box
													sx={{
														width: 40,
														height: 40,
														borderRadius: 2,
														bgcolor: alpha(theme.palette.primary.main, 0.1),
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "primary.main",
													}}
												>
													<FormatQuoteIcon sx={{ fontSize: 20 }} />
												</Box>
											</Stack>

											{/* Content */}
											<Typography
												variant="body1"
												sx={{
													color: "text.primary",
													lineHeight: 1.7,
													fontSize: "0.95rem",
													flex: 1,
													fontStyle: "italic",
													position: "relative",
													"&:before": {
														content: '""',
														position: "absolute",
														left: -16,
														top: 0,
														bottom: 0,
														width: 4,
														bgcolor: "primary.main",
														borderRadius: 2,
													},
													pl: 2,
												}}
											>
												"{testimonial.content}"
											</Typography>

											{/* Customer Info */}
											<Stack direction="row" spacing={2} alignItems="center">
												<Box
													sx={{
														width: 56,
														height: 56,
														borderRadius: 3,
														background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "1.8rem",
														flexShrink: 0,
														boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
													}}
												>
													{testimonial.avatar}
												</Box>

												<Stack spacing={0.5} flex={1}>
													<Typography
														variant="subtitle1"
														sx={{
															fontWeight: 700,
															color: "text.primary",
															fontSize: "1rem",
														}}
													>
														{testimonial.name}
													</Typography>

													<Typography
														variant="body2"
														sx={{
															color: "text.secondary",
															fontSize: "0.85rem",
															fontWeight: 500,
														}}
													>
														{testimonial.role}
													</Typography>

													<Typography
														variant="caption"
														sx={{
															color: "text.secondary",
															fontSize: "0.8rem",
															display: "flex",
															alignItems: "center",
														}}
													>
														📍 {testimonial.location}
													</Typography>

													<Stack direction="row" spacing={2} sx={{ mt: 1 }}>
														<Box
															sx={{
																px: 1.5,
																py: 0.5,
																borderRadius: 1,
																bgcolor: alpha(theme.palette.primary.main, 0.1),
																border: `1px solid ${alpha(
																	theme.palette.primary.main,
																	0.2
																)}`,
															}}
														>
															<Typography
																variant="caption"
																sx={{
																	color: "primary.main",
																	fontWeight: 600,
																	fontSize: "0.75rem",
																}}
															>
																{testimonial.businessType}
															</Typography>
														</Box>

														<Box
															sx={{
																px: 1.5,
																py: 0.5,
																borderRadius: 1,
																bgcolor: alpha(theme.palette.success.main, 0.1),
																border: `1px solid ${alpha(
																	theme.palette.success.main,
																	0.2
																)}`,
															}}
														>
															<Typography
																variant="caption"
																sx={{
																	color: "success.main",
																	fontWeight: 600,
																	fontSize: "0.75rem",
																}}
															>
																{testimonial.monthsUsing}mo user
															</Typography>
														</Box>
													</Stack>
												</Stack>
											</Stack>
										</Stack>

										{/* Hover gradient overlay */}
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: 4,
												background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
												borderRadius: "12px 12px 0 0",
												transform: "scaleX(0)",
												transformOrigin: "left",
												transition: "transform 0.3s ease",
												".MuiCard-root:hover &": {
													transform: "scaleX(1)",
												},
											}}
										/>
									</Card>
								</div>
							</Grid>
						))}
					</Grid>

					{/* Additional Stats */}
					<Box sx={{ mt: { xs: 8, md: 10 } }}>
						<div>
							<Card
								sx={{
									p: { xs: 4, md: 6 },
									textAlign: "center",
									background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
									border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
									borderRadius: 3,
								}}
							>
								<Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
									<Grid xs={12} md={6}>
										<Stack spacing={2}>
											<Typography
												variant="h4"
												sx={{
													color: "text.primary",
													fontWeight: 800,
													fontSize: { xs: "1.5rem", md: "2rem" },
												}}
											>
												Join Our Success Stories
											</Typography>

											<Typography
												variant="body1"
												sx={{
													color: "text.secondary",
													lineHeight: 1.6,
													maxWidth: 400,
													mx: { xs: "auto", md: 0 },
												}}
											>
												Become part of our growing community of successful
												retailers. Start your journey with Kenix Commodities
												today and experience the transformation yourself.
											</Typography>
										</Stack>
									</Grid>

									<Grid xs={12} md={6}>
										<Grid container spacing={3}>
											<Grid xs={4}>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h5"
														sx={{
															fontWeight: 800,
															color: "primary.main",
														}}
													>
														4.9★
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: "text.secondary",
															textAlign: "center",
														}}
													>
														Average Rating
													</Typography>
												</Stack>
											</Grid>

											<Grid xs={4}>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h5"
														sx={{
															fontWeight: 800,
															color: "secondary.main",
														}}
													>
														1000+
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: "text.secondary",
															textAlign: "center",
														}}
													>
														Happy Customers
													</Typography>
												</Stack>
											</Grid>

											<Grid xs={4}>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h5"
														sx={{
															fontWeight: 800,
															color: "success.main",
														}}
													>
														95%
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: "text.secondary",
															textAlign: "center",
														}}
													>
														Retention Rate
													</Typography>
												</Stack>
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							</Card>
						</div>
					</Box>

					{/* Bottom CTA */}
					<Box sx={{ textAlign: "center", mt: { xs: 6, md: 8 } }}>
						<div>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								spacing={2}
								justifyContent="center"
							>
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
											transform: "translateY(-1px)",
											boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
										},
										transition: "all 0.3s ease",
									}}
								>
									Get Started Free
								</Box>

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
											bgcolor: alpha(theme.palette.primary.main, 0.08),
										},
										transition: "all 0.3s ease",
									}}
								>
									View All Reviews
								</Box>
							</Stack>
						</div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
