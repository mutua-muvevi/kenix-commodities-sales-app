"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";

import { Iconify } from "@/components/iconify";
import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const CONTACT_INFO = [
	{
		icon: "eva:pin-fill",
		title: "Visit Us",
		description: "Nairobi, Kenya",
		details: "Central Business District\nNairobi County, Kenya",
	},
	{
		icon: "eva:phone-fill",
		title: "Call Us",
		description: "+254 700 000 000",
		details: "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 8:00 AM - 2:00 PM",
	},
	{
		icon: "eva:email-fill",
		title: "Email Us",
		description: "info@kenixcommodities.co.ke",
		details: "We respond within 24 hours\nBusiness inquiries welcome",
	},
];

const BUSINESS_TYPES = [
	"Small Retail Shop",
	"Supermarket",
	"Convenience Store",
	"Wholesale Business",
	"Restaurant/Hotel",
	"Other",
];

// ----------------------------------------------------------------------

export default function ContactSection() {
	const theme = useTheme();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		businessType: "",
		message: "",
	});

	const handleChange =
		(field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
			setFormData({ ...formData, [field]: event.target.value });
		};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		console.log("Form submitted:", formData);
		// Handle form submission
	};

	return (
		<Container maxWidth="lg" sx={{ py: { xs: 8, md: 15 } }}>
			<MotionViewport>
				{/* Header */}
				<Stack spacing={3} sx={{ textAlign: "center", mb: { xs: 8, md: 10 } }}>
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Typography variant="overline" sx={{ color: "primary.main" }}>
							Contact Us
						</Typography>
					</m.div>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Typography variant="h2" sx={{ color: "text.primary" }}>
							Get in
							<Box component="span" sx={{ color: "secondary.main", mx: 1 }}>
								Touch
							</Box>
							Today
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
								maxWidth: 600,
								mx: "auto",
								lineHeight: 1.6,
							}}
						>
							Ready to revolutionize your retail business? Contact our team of
							experts and discover how Kenix Commodities can help you grow.
						</Typography>
					</m.div>
				</Stack>

				<Grid container spacing={4}>
					{/* Contact Information */}
					<Grid xs={12} md={4}>
						<Stack spacing={4}>
							{CONTACT_INFO.map((contact) => (
								<m.div key={contact.title} variants={varFade().inLeft}>
									<Card
										sx={{
											p: 3,
											bgcolor: "background.paper",
											border: `1px solid ${alpha(
												theme.palette.grey[500],
												0.12
											)}`,
											transition: "all 0.3s ease-in-out",
											"&:hover": {
												transform: "translateY(-4px)",
												boxShadow: `0 12px 24px ${alpha(
													theme.palette.grey[500],
													0.12
												)}`,
											},
										}}
									>
										<Stack
											direction="row"
											spacing={2}
											sx={{ alignItems: "flex-start" }}
										>
											<Box
												sx={{
													width: 48,
													height: 48,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													borderRadius: 2,
													bgcolor: alpha(theme.palette.primary.main, 0.1),
													flexShrink: 0,
												}}
											>
												<Iconify
													icon={contact.icon}
													sx={{
														color: "primary.main",
														fontSize: 24,
													}}
												/>
											</Box>

											<Stack spacing={1}>
												<Typography variant="h6" sx={{ color: "text.primary" }}>
													{contact.title}
												</Typography>

												<Typography
													variant="subtitle1"
													sx={{
														color: "primary.main",
														fontWeight: 600,
													}}
												>
													{contact.description}
												</Typography>

												<Typography
													variant="body2"
													sx={{
														color: "text.secondary",
														whiteSpace: "pre-line",
														lineHeight: 1.6,
													}}
												>
													{contact.details}
												</Typography>
											</Stack>
										</Stack>
									</Card>
								</m.div>
							))}
						</Stack>
					</Grid>

					{/* Contact Form */}
					<Grid xs={12} md={8}>
						<m.div variants={varFade().inRight}>
							<Card
								sx={{
									p: { xs: 3, md: 4 },
									bgcolor: "background.paper",
									border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
								}}
							>
								<form onSubmit={handleSubmit}>
									<Stack spacing={3}>
										<Typography
											variant="h4"
											sx={{ color: "text.primary", mb: 2 }}
										>
											Send us a Message
										</Typography>

										<Grid container spacing={2}>
											<Grid xs={12} md={6}>
												<TextField
													fullWidth
													label="Full Name"
													value={formData.name}
													onChange={handleChange("name")}
													required
												/>
											</Grid>

											<Grid xs={12} md={6}>
												<TextField
													fullWidth
													label="Email Address"
													type="email"
													value={formData.email}
													onChange={handleChange("email")}
													required
												/>
											</Grid>
										</Grid>

										<Grid container spacing={2}>
											<Grid xs={12} md={6}>
												<TextField
													fullWidth
													label="Phone Number"
													value={formData.phone}
													onChange={handleChange("phone")}
													placeholder="+254 7XX XXX XXX"
													required
												/>
											</Grid>

											<Grid xs={12} md={6}>
												<TextField
													fullWidth
													select
													label="Business Type"
													value={formData.businessType}
													onChange={handleChange("businessType")}
													required
												>
													{BUSINESS_TYPES.map((type) => (
														<MenuItem key={type} value={type}>
															{type}
														</MenuItem>
													))}
												</TextField>
											</Grid>
										</Grid>

										<TextField
											fullWidth
											multiline
											rows={4}
											label="Message"
											placeholder="Tell us about your business needs and how we can help..."
											value={formData.message}
											onChange={handleChange("message")}
											required
										/>

										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={2}
											sx={{ justifyContent: "flex-end" }}
										>
											<Button
												type="submit"
												size="large"
												variant="contained"
												endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
												sx={{
													minWidth: 160,
													height: 48,
													bgcolor: "primary.main",
													"&:hover": {
														bgcolor: "primary.dark",
													},
												}}
											>
												Send Message
											</Button>
										</Stack>
									</Stack>
								</form>
							</Card>
						</m.div>
					</Grid>
				</Grid>

				{/* Map Section */}
				<Box sx={{ mt: { xs: 6, md: 8 } }}>
					<m.div>
						<Card
							sx={{
								overflow: "hidden",
								bgcolor: "background.paper",
								border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
							}}
						>
							<Stack spacing={2} sx={{ p: 3, textAlign: "center" }}>
								<Typography variant="h5" sx={{ color: "text.primary" }}>
									Find Us in Nairobi
								</Typography>
								<Typography variant="body2" sx={{ color: "text.secondary" }}>
									Located in the heart of Nairobi's Central Business District,
									serving retailers across Kenya with reliable supply solutions.
								</Typography>
							</Stack>

							{/* Map Placeholder */}
							<Box
								sx={{
									height: 300,
									bgcolor: "grey.100",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									position: "relative",
								}}
							>
								<Stack spacing={2} sx={{ alignItems: "center" }}>
									<Iconify
										icon="eva:pin-fill"
										sx={{
											color: "primary.main",
											fontSize: 48,
										}}
									/>
									<Typography variant="h6" sx={{ color: "text.primary" }}>
										Nairobi, Kenya
									</Typography>
									<Typography variant="body2" sx={{ color: "text.secondary" }}>
										Interactive map integration coming soon
									</Typography>
								</Stack>
							</Box>
						</Card>
					</m.div>
				</Box>
			</MotionViewport>
		</Container>
	);
}
