// src/components/sections/partners/partners-section.tsx
"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import Card from "@mui/material/Card";

import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const PARTNERS_DATA = [
	{
		name: "M-Pesa",
		logo: "💳",
		category: "Payment Partner",
		description: "Seamless mobile money integration for all transactions",
		bgColor: "#00A651",
	},
	{
		name: "Equity Bank",
		logo: "🏦",
		category: "Financial Partner",
		description: "Banking solutions and business credit facilities",
		bgColor: "#C41E3A",
	},
	{
		name: "DHL",
		logo: "📦",
		category: "Logistics Partner",
		description: "Express delivery services across Kenya",
		bgColor: "#FFCC00",
	},
	{
		name: "Safaricom",
		logo: "📱",
		category: "Technology Partner",
		description: "Telecommunications and digital solutions",
		bgColor: "#00A651",
	},
	{
		name: "KCB Bank",
		logo: "🏛️",
		category: "Financial Partner",
		description: "Corporate banking and merchant services",
		bgColor: "#1B5E20",
	},
	{
		name: "Twiga Foods",
		logo: "🥬",
		category: "Supply Partner",
		description: "Fresh produce sourcing and distribution",
		bgColor: "#4CAF50",
	},
	{
		name: "Airtel Money",
		logo: "💰",
		category: "Payment Partner",
		description: "Mobile payment solutions and wallet services",
		bgColor: "#E53935",
	},
	{
		name: "Kenya Railways",
		logo: "🚂",
		category: "Logistics Partner",
		description: "Freight transportation across the country",
		bgColor: "#1976D2",
	},
];

const CERTIFICATIONS = [
	{
		name: "ISO 9001:2015",
		description: "Quality Management Systems",
		icon: "🏆",
		year: "2023",
	},
	{
		name: "HACCP Certified",
		description: "Food Safety Management",
		icon: "🛡️",
		year: "2023",
	},
	{
		name: "KEBS Approved",
		description: "Kenya Bureau of Standards",
		icon: "✅",
		year: "2022",
	},
	{
		name: "PCI DSS Compliant",
		description: "Payment Security Standards",
		icon: "🔒",
		year: "2023",
	},
];

// ----------------------------------------------------------------------

export default function PartnersSection() {
	const theme = useTheme();

	return (
		<Box
			sx={{
				py: { xs: 8, md: 15 },
				bgcolor: "common.white",
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
            radial-gradient(circle at 20% 30%, ${alpha(
							theme.palette.grey[200],
							0.5
						)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha(
							theme.palette.grey[200],
							0.5
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
						<div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Typography
								variant="overline"
								sx={{
									color: "primary.main",
									fontWeight: 700,
									letterSpacing: 2,
								}}
							>
								TRUSTED PARTNERS
							</Typography>
						</div>

						<div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Typography
								variant="h2"
								sx={{
									color: "text.primary",
									fontWeight: 800,
									fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
								}}
							>
								Partnering with Kenya's
								<Box
									component="span"
									sx={{
										display: "block",
										color: "secondary.main",
										mt: 1,
									}}
								>
									Leading Organizations
								</Box>
							</Typography>
						</div>

						<div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
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
								We collaborate with industry leaders to provide you with the
								most reliable, secure, and efficient B2B commerce experience in
								Kenya.
							</Typography>
						</div>
					</Stack>

					{/* Partners Grid */}
					<Grid
						container
						spacing={{ xs: 3, md: 4 }}
						sx={{ mb: { xs: 8, md: 12 } }}
					>
						{PARTNERS_DATA.map((partner, index) => (
							<Grid xs={12} sm={6} md={4} lg={3} key={partner.name}>
								<div>
									<Card
										component={"div"}
										whileHover={{
											y: -8,
											transition: { duration: 0.3, ease: "easeOut" },
										}}
										sx={{
											p: 3,
											height: "100%",
											textAlign: "center",
											position: "relative",
											borderRadius: 3,
											boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
											border: `1px solid ${alpha(
												theme.palette.grey[300],
												0.5
											)}`,
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											overflow: "hidden",
											"&:hover": {
												boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
												borderColor: "primary.main",
											},
										}}
									>
										{/* Background gradient on hover */}
										<Box
											sx={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												bgcolor: alpha(partner.bgColor, 0.03),
												opacity: 0,
												transition: "opacity 0.3s ease",
												".MuiCard-root:hover &": {
													opacity: 1,
												},
											}}
										/>

										<Stack
											spacing={2}
											alignItems="center"
											sx={{ position: "relative" }}
										>
											{/* Logo */}
											<Box
												sx={{
													width: 80,
													height: 80,
													borderRadius: 3,
													bgcolor: alpha(partner.bgColor, 0.1),
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontSize: "2.5rem",
													border: `2px solid ${alpha(partner.bgColor, 0.2)}`,
													transition: "all 0.3s ease",
													".MuiCard-root:hover &": {
														transform: "scale(1.1)",
														borderColor: partner.bgColor,
														bgcolor: alpha(partner.bgColor, 0.2),
													},
												}}
											>
												{partner.logo}
											</Box>

											{/* Partner Info */}
											<Stack spacing={1} alignItems="center">
												<Typography
													variant="h6"
													sx={{
														fontWeight: 700,
														color: "text.primary",
														fontSize: "1rem",
													}}
												>
													{partner.name}
												</Typography>

												<Box
													sx={{
														px: 1.5,
														py: 0.5,
														borderRadius: 1,
														bgcolor: alpha(partner.bgColor, 0.1),
														border: `1px solid ${alpha(partner.bgColor, 0.2)}`,
													}}
												>
													<Typography
														variant="caption"
														sx={{
															color: partner.bgColor,
															fontWeight: 600,
															fontSize: "0.75rem",
														}}
													>
														{partner.category}
													</Typography>
												</Box>

												<Typography
													variant="body2"
													sx={{
														color: "text.secondary",
														lineHeight: 1.5,
														fontSize: "0.85rem",
														textAlign: "center",
													}}
												>
													{partner.description}
												</Typography>
											</Stack>
										</Stack>
									</Card>
								</div>
							</Grid>
						))}
					</Grid>

					{/* Certifications Section */}
					<Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
						<div>
							<Stack spacing={4}>
								<Typography
									variant="h4"
									sx={{
										color: "text.primary",
										fontWeight: 700,
										fontSize: { xs: "1.5rem", md: "2rem" },
									}}
								>
									Certified & Compliant
								</Typography>

								<Grid container spacing={3} justifyContent="center">
									{CERTIFICATIONS.map((cert, index) => (
										<Grid xs={12} sm={6} md={3} key={cert.name}>
											<div transition={{ delay: index * 0.1 }}>
												<Card
													sx={{
														p: 3,
														textAlign: "center",
														height: "100%",
														borderRadius: 2,
														border: `1px solid ${alpha(
															theme.palette.success.main,
															0.2
														)}`,
														bgcolor: alpha(theme.palette.success.main, 0.05),
														transition: "all 0.3s ease",
														"&:hover": {
															borderColor: "success.main",
															bgcolor: alpha(theme.palette.success.main, 0.1),
															transform: "translateY(-2px)",
														},
													}}
												>
													<Stack spacing={2} alignItems="center">
														<Typography sx={{ fontSize: "2rem" }}>
															{cert.icon}
														</Typography>

														<Stack spacing={1} alignItems="center">
															<Typography
																variant="subtitle1"
																sx={{
																	fontWeight: 700,
																	color: "text.primary",
																	fontSize: "0.9rem",
																}}
															>
																{cert.name}
															</Typography>

															<Typography
																variant="body2"
																sx={{
																	color: "text.secondary",
																	fontSize: "0.8rem",
																	lineHeight: 1.4,
																}}
															>
																{cert.description}
															</Typography>

															<Box
																sx={{
																	px: 1,
																	py: 0.5,
																	borderRadius: 1,
																	bgcolor: alpha(
																		theme.palette.success.main,
																		0.2
																	),
																}}
															>
																<Typography
																	variant="caption"
																	sx={{
																		color: "success.dark",
																		fontWeight: 600,
																		fontSize: "0.7rem",
																	}}
																>
																	Since {cert.year}
																</Typography>
															</Box>
														</Stack>
													</Stack>
												</Card>
											</div>
										</Grid>
									))}
								</Grid>
							</Stack>
						</div>
					</Box>

					{/* Trust Statement */}
					<Box sx={{ textAlign: "center" }}>
						<div>
							<Card
								sx={{
									p: { xs: 4, md: 6 },
									background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
									border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
									borderRadius: 3,
								}}
							>
								<Stack spacing={3} alignItems="center">
									<Typography
										variant="h5"
										sx={{
											color: "text.primary",
											fontWeight: 700,
											maxWidth: 600,
											lineHeight: 1.4,
										}}
									>
										"Building trust through partnerships, delivering excellence
										through compliance"
									</Typography>

									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											maxWidth: 500,
											lineHeight: 1.6,
										}}
									>
										Our strategic partnerships with Kenya's leading
										organizations ensure that your business gets the most
										reliable, secure, and efficient service possible.
									</Typography>

									<Stack direction="row" spacing={4} sx={{ mt: 2 }}>
										<Stack alignItems="center" spacing={1}>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 800,
													color: "primary.main",
												}}
											>
												8+
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													textAlign: "center",
												}}
											>
												Strategic Partners
											</Typography>
										</Stack>

										<Stack alignItems="center" spacing={1}>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 800,
													color: "secondary.main",
												}}
											>
												4+
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													textAlign: "center",
												}}
											>
												Certifications
											</Typography>
										</Stack>

										<Stack alignItems="center" spacing={1}>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 800,
													color: "success.main",
												}}
											>
												100%
											</Typography>
											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													textAlign: "center",
												}}
											>
												Compliance Rate
											</Typography>
										</Stack>
									</Stack>
								</Stack>
							</Card>
						</div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
