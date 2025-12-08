// src/components/sections/cta/cta-section.tsx
"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const BENEFITS = [
	{
		icon: CheckCircleIcon,
		title: "Free Setup",
		description: "No setup fees or hidden charges to get started",
	},
	{
		icon: TrendingUpIcon,
		title: "Instant Growth",
		description: "Start seeing results from your first order",
	},
	{
		icon: PhoneIcon,
		title: "24/7 Support",
		description: "Dedicated support team available anytime",
	},
	{
		icon: RocketLaunchIcon,
		title: "Quick Launch",
		description: "Get up and running in less than 24 hours",
	},
];

const QUICK_STATS = [
	{ number: "2min", label: "Average Setup Time", color: "primary" },
	{ number: "0", label: "Setup Fees", color: "success" },
	{ number: "24/7", label: "Support Available", color: "info" },
	{ number: "1000+", label: "Satisfied Retailers", color: "secondary" },
];

// ----------------------------------------------------------------------

export default function CtaSection() {
	const theme = useTheme();

	const handleGetStarted = () => {
		// Handle get started action
		console.log("Get started clicked");
	};

	const handleScheduleDemo = () => {
		// Handle schedule demo action
		console.log("Schedule demo clicked");
	};

	const handleQuickStart = (event: React.FormEvent) => {
		event.preventDefault();
		// Handle quick start form submission
		console.log("Quick start form submitted");
	};

	return (
		<Box
			sx={{
				py: { xs: 8, md: 15 },
				background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.dark} 30%,
          ${theme.palette.secondary.main} 70%,
          ${theme.palette.secondary.dark} 100%)`,
				color: "white",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Background Animation Elements */}
			<Box
				component={"div"}
				animate={{
					rotate: 360,
				}}
				transition={{
					duration: 120,
					repeat: Infinity,
					ease: "linear",
				}}
				sx={{
					position: "absolute",
					top: "10%",
					left: "5%",
					width: { xs: 100, md: 200 },
					height: { xs: 100, md: 200 },
					borderRadius: "50%",
					background: alpha(theme.palette.warning.main, 0.1),
					border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
				}}
			/>

			<Box
				component={"div"}
				animate={{
					rotate: -360,
				}}
				transition={{
					duration: 100,
					repeat: Infinity,
					ease: "linear",
				}}
				sx={{
					position: "absolute",
					bottom: "10%",
					right: "5%",
					width: { xs: 80, md: 150 },
					height: { xs: 80, md: 150 },
					borderRadius: "30%",
					background: alpha(theme.palette.success.main, 0.1),
					border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}`,
				}}
			/>

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
							theme.palette.warning.light,
							0.1
						)} 0%, transparent 50%)
          `,
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative" }}>
				<MotionViewport>
					{/* Main CTA Content */}
					<Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
						{/* Left Side - Main CTA */}
						<Grid xs={12} md={6}>
							<div variants={varFade().inLeft}>
								<Stack spacing={4}>
									<Stack spacing={3}>
										<Typography
											variant="overline"
											sx={{
												color: alpha(theme.palette.common.white, 0.8),
												fontWeight: 700,
												letterSpacing: 2,
											}}
										>
											READY TO TRANSFORM YOUR BUSINESS?
										</Typography>

										<Typography
											variant="h2"
											sx={{
												color: "white",
												fontWeight: 900,
												fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
												lineHeight: 1.1,
												textShadow: "0 4px 12px rgba(0,0,0,0.3)",
											}}
										>
											Start Your Success
											<Box
												component="span"
												sx={{
													display: "block",
													background:
														"linear-gradient(45deg, #FFD700, #FF8C00)",
													backgroundClip: "text",
													WebkitBackgroundClip: "text",
													WebkitTextFillColor: "transparent",
													mt: 1,
												}}
											>
												Journey Today
											</Box>
										</Typography>

										<Typography
											variant="h6"
											sx={{
												color: alpha(theme.palette.common.white, 0.9),
												fontWeight: 400,
												lineHeight: 1.6,
												maxWidth: 500,
											}}
										>
											Join over 1,000 successful retailers who have transformed
											their businesses with Kenix Commodities. No setup fees,
											instant access, 24/7 support.
										</Typography>
									</Stack>

									{/* Benefits List */}
									<Grid container spacing={2}>
										{BENEFITS.map((benefit, index) => (
											<Grid xs={12} sm={6} key={index}>
												<Stack direction="row" spacing={2} alignItems="center">
													<Box
														sx={{
															width: 40,
															height: 40,
															borderRadius: 2,
															bgcolor: alpha(theme.palette.success.main, 0.2),
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															flexShrink: 0,
														}}
													>
														<benefit.icon
															sx={{ color: "success.light", fontSize: 20 }}
														/>
													</Box>
													<Stack spacing={0.5}>
														<Typography
															variant="subtitle2"
															sx={{ color: "white", fontWeight: 600 }}
														>
															{benefit.title}
														</Typography>
														<Typography
															variant="caption"
															sx={{
																color: alpha(theme.palette.common.white, 0.7),
																fontSize: "0.8rem",
																lineHeight: 1.3,
															}}
														>
															{benefit.description}
														</Typography>
													</Stack>
												</Stack>
											</Grid>
										))}
									</Grid>

									{/* Action Buttons */}
									<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
										<Button
											size="large"
											variant="contained"
											startIcon={<RocketLaunchIcon />}
											onClick={handleGetStarted}
											sx={{
												minWidth: 220,
												height: 56,
												bgcolor: "white",
												color: "primary.main",
												fontWeight: 800,
												fontSize: "1.1rem",
												borderRadius: 3,
												boxShadow: "0 8px 32px rgba(255,255,255,0.3)",
												"&:hover": {
													bgcolor: alpha(theme.palette.common.white, 0.95),
													transform: "translateY(-2px)",
													boxShadow: "0 12px 40px rgba(255,255,255,0.4)",
												},
												transition: "all 0.3s ease",
											}}
										>
											Start Free Today
										</Button>

										<Button
											size="large"
											variant="outlined"
											startIcon={<CalendarTodayIcon />}
											onClick={handleScheduleDemo}
											sx={{
												minWidth: 200,
												height: 56,
												borderColor: alpha(theme.palette.common.white, 0.5),
												color: "white",
												fontWeight: 700,
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
											Schedule Demo
										</Button>
									</Stack>
								</Stack>
							</div>
						</Grid>

						{/* Right Side - Quick Start Form */}
						<Grid xs={12} md={6}>
							<div variants={varFade().inRight}>
								<Card
									sx={{
										p: { xs: 4, md: 5 },
										borderRadius: 4,
										background: alpha(theme.palette.common.white, 0.95),
										backdropFilter: "blur(20px)",
										boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
										border: `1px solid ${alpha(
											theme.palette.common.white,
											0.3
										)}`,
									}}
								>
									<Stack spacing={4}>
										<Stack spacing={2} textAlign="center">
											<Typography
												variant="h5"
												sx={{
													color: "text.primary",
													fontWeight: 700,
												}}
											>
												Get Started in 2 Minutes
											</Typography>

											<Typography
												variant="body2"
												sx={{
													color: "text.secondary",
													lineHeight: 1.5,
												}}
											>
												Enter your details below and we'll set up your account
												instantly. No credit card required.
											</Typography>
										</Stack>

										<Box component="form" onSubmit={handleQuickStart}>
											<Stack spacing={3}>
												<TextField
													fullWidth
													label="Business Name"
													variant="outlined"
													required
													sx={{
														"& .MuiOutlinedInput-root": {
															borderRadius: 2,
														},
													}}
												/>

												<TextField
													fullWidth
													label="Your Name"
													variant="outlined"
													required
													sx={{
														"& .MuiOutlinedInput-root": {
															borderRadius: 2,
														},
													}}
												/>

												<TextField
													fullWidth
													label="Phone Number"
													variant="outlined"
													type="tel"
													placeholder="07XX XXX XXX"
													required
													sx={{
														"& .MuiOutlinedInput-root": {
															borderRadius: 2,
														},
													}}
												/>

												<TextField
													fullWidth
													label="Email Address"
													variant="outlined"
													type="email"
													required
													sx={{
														"& .MuiOutlinedInput-root": {
															borderRadius: 2,
														},
													}}
												/>

												<Button
													type="submit"
													fullWidth
													variant="contained"
													size="large"
													startIcon={<RocketLaunchIcon />}
													sx={{
														height: 56,
														borderRadius: 2,
														fontWeight: 700,
														fontSize: "1.1rem",
														boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
														"&:hover": {
															transform: "translateY(-1px)",
															boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
														},
														transition: "all 0.3s ease",
													}}
												>
													Create Free Account
												</Button>
											</Stack>
										</Box>

										{/* Trust Indicators */}
										<Stack spacing={2}>
											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													textAlign: "center",
													fontSize: "0.75rem",
												}}
											>
												✅ No setup fees • ✅ Cancel anytime • ✅ 24/7 support
											</Typography>

											<Grid container spacing={2}>
												{QUICK_STATS.map((stat, index) => (
													<Grid xs={6} key={index}>
														<Stack alignItems="center" spacing={0.5}>
															<Typography
																variant="h6"
																sx={{
																	fontWeight: 800,
																	color: `${stat.color}.main`,
																	fontSize: "1rem",
																}}
															>
																{stat.number}
															</Typography>
															<Typography
																variant="caption"
																sx={{
																	color: "text.secondary",
																	textAlign: "center",
																	fontSize: "0.7rem",
																	lineHeight: 1.2,
																}}
															>
																{stat.label}
															</Typography>
														</Stack>
													</Grid>
												))}
											</Grid>
										</Stack>
									</Stack>
								</Card>
							</div>
						</Grid>
					</Grid>

					{/* Bottom Section - Alternative Contact Methods */}
					<Box sx={{ mt: { xs: 8, md: 12 } }}>
						<div>
							<Card
								sx={{
									p: { xs: 4, md: 6 },
									background: alpha(theme.palette.common.white, 0.1),
									backdropFilter: "blur(20px)",
									border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
									borderRadius: 3,
									textAlign: "center",
								}}
							>
								<Stack spacing={4}>
									<Stack spacing={2}>
										<Typography
											variant="h5"
											sx={{
												color: "white",
												fontWeight: 700,
											}}
										>
											Prefer to Talk? We're Here to Help
										</Typography>

										<Typography
											variant="body1"
											sx={{
												color: "text.secondary",
												maxWidth: 600,
												mx: "auto",
												lineHeight: 1.6,
											}}
										>
											Our team of experts is ready to answer your questions and
											help you get started. Reach out via phone, email, or
											schedule a personalized demo.
										</Typography>
									</Stack>

									<Grid container spacing={3} justifyContent="center">
										<Grid xs={12} sm={4}>
											<Stack spacing={2} alignItems="center">
												<Box
													sx={{
														width: 60,
														height: 60,
														borderRadius: 3,
														bgcolor: alpha(theme.palette.info.main, 0.2),
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<PhoneIcon
														sx={{ color: "info.light", fontSize: 28 }}
													/>
												</Box>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h6"
														sx={{ color: "white", fontWeight: 600 }}
													>
														Call Us
													</Typography>
													<Typography
														variant="body2"
														sx={{
															color: alpha(theme.palette.common.white, 0.8),
														}}
													>
														+254 700 000 000
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: alpha(theme.palette.common.white, 0.6),
														}}
													>
														Mon-Fri 8AM-6PM EAT
													</Typography>
												</Stack>
											</Stack>
										</Grid>

										<Grid xs={12} sm={4}>
											<Stack spacing={2} alignItems="center">
												<Box
													sx={{
														width: 60,
														height: 60,
														borderRadius: 3,
														bgcolor: alpha(theme.palette.success.main, 0.2),
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<EmailIcon
														sx={{ color: "success.light", fontSize: 28 }}
													/>
												</Box>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h6"
														sx={{ color: "white", fontWeight: 600 }}
													>
														Email Us
													</Typography>
													<Typography
														variant="body2"
														sx={{
															color: alpha(theme.palette.common.white, 0.8),
														}}
													>
														sales@kenixcommodities.co.ke
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: alpha(theme.palette.common.white, 0.6),
														}}
													>
														We respond within 1 hour
													</Typography>
												</Stack>
											</Stack>
										</Grid>

										<Grid xs={12} sm={4}>
											<Stack spacing={2} alignItems="center">
												<Box
													sx={{
														width: 60,
														height: 60,
														borderRadius: 3,
														bgcolor: alpha(theme.palette.warning.main, 0.2),
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<CalendarTodayIcon
														sx={{ color: "warning.light", fontSize: 28 }}
													/>
												</Box>
												<Stack spacing={1} alignItems="center">
													<Typography
														variant="h6"
														sx={{ color: "white", fontWeight: 600 }}
													>
														Book Demo
													</Typography>
													<Typography
														variant="body2"
														sx={{
															color: alpha(theme.palette.common.white, 0.8),
														}}
													>
														30-minute consultation
													</Typography>
													<Typography
														variant="caption"
														sx={{
															color: alpha(theme.palette.common.white, 0.6),
														}}
													>
														Available today
													</Typography>
												</Stack>
											</Stack>
										</Grid>
									</Grid>

									<Stack
										direction={{ xs: "column", sm: "row" }}
										spacing={2}
										justifyContent="center"
									>
										<Button
											variant="outlined"
											startIcon={<PhoneIcon />}
											sx={{
												borderColor: alpha(theme.palette.common.white, 0.5),
												color: "white",
												fontWeight: 600,
												px: 3,
												py: 1.5,
												borderRadius: 2,
												"&:hover": {
													borderColor: "white",
													bgcolor: alpha(theme.palette.common.white, 0.1),
												},
											}}
										>
											Call Now
										</Button>

										<Button
											variant="outlined"
											startIcon={<EmailIcon />}
											sx={{
												borderColor: alpha(theme.palette.common.white, 0.5),
												color: "white",
												fontWeight: 600,
												px: 3,
												py: 1.5,
												borderRadius: 2,
												"&:hover": {
													borderColor: "white",
													bgcolor: alpha(theme.palette.common.white, 0.1),
												},
											}}
										>
											Send Email
										</Button>

										<Button
											variant="contained"
											startIcon={<CalendarTodayIcon />}
											sx={{
												bgcolor: "warning.main",
												color: "white",
												fontWeight: 600,
												px: 3,
												py: 1.5,
												borderRadius: 2,
												"&:hover": {
													bgcolor: "warning.dark",
												},
											}}
										>
											Book Demo
										</Button>
									</Stack>
								</Stack>
							</Card>
						</div>
					</Box>

					{/* Final Trust Statement */}
					<Box sx={{ mt: 6, textAlign: "center" }}>
						<div>
							<Stack spacing={3} alignItems="center">
								<Typography
									variant="h6"
									sx={{
										color: alpha(theme.palette.common.white, 0.9),
										fontWeight: 600,
										maxWidth: 500,
									}}
								>
									Trusted by 1000+ businesses across Kenya
								</Typography>

								<Stack
									direction="row"
									spacing={4}
									flexWrap="wrap"
									justifyContent="center"
								>
									<Stack alignItems="center" spacing={1}>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 800,
												color: "success.light",
											}}
										>
											99.8%
										</Typography>
										<Typography
											variant="caption"
											sx={{
												color: alpha(theme.palette.common.white, 0.7),
												textAlign: "center",
											}}
										>
											Uptime
										</Typography>
									</Stack>

									<Stack alignItems="center" spacing={1}>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 800,
												color: "warning.light",
											}}
										>
											4.9★
										</Typography>
										<Typography
											variant="caption"
											sx={{
												color: alpha(theme.palette.common.white, 0.7),
												textAlign: "center",
											}}
										>
											Rating
										</Typography>
									</Stack>

									<Stack alignItems="center" spacing={1}>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 800,
												color: "info.light",
											}}
										>
											2.5hrs
										</Typography>
										<Typography
											variant="caption"
											sx={{
												color: alpha(theme.palette.common.white, 0.7),
												textAlign: "center",
											}}
										>
											Avg Delivery
										</Typography>
									</Stack>

									<Stack alignItems="center" spacing={1}>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 800,
												color: "secondary.light",
											}}
										>
											24/7
										</Typography>
										<Typography
											variant="caption"
											sx={{
												color: alpha(theme.palette.common.white, 0.7),
												textAlign: "center",
											}}
										>
											Support
										</Typography>
									</Stack>
								</Stack>
							</Stack>
						</div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
