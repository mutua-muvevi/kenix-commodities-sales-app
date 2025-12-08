// src/components/layout/footer/footer.tsx
"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m } from "framer-motion";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

// ----------------------------------------------------------------------

const FOOTER_LINKS = {
	company: {
		title: "Company",
		links: [
			{ title: "About Us", href: "/about" },
			{ title: "Our Story", href: "/story" },
			{ title: "Careers", href: "/careers" },
			{ title: "Press & Media", href: "/press" },
			{ title: "Investor Relations", href: "/investors" },
		],
	},
	products: {
		title: "Products & Services",
		links: [
			{ title: "Fresh Produce", href: "/products/fresh" },
			{ title: "Dairy & Bakery", href: "/products/dairy" },
			{ title: "Grains & Cereals", href: "/products/grains" },
			{ title: "Beverages", href: "/products/beverages" },
			{ title: "Household Items", href: "/products/household" },
		],
	},
	solutions: {
		title: "Solutions",
		links: [
			{ title: "For Small Retailers", href: "/solutions/small-retailers" },
			{ title: "For Supermarkets", href: "/solutions/supermarkets" },
			{ title: "For Wholesalers", href: "/solutions/wholesalers" },
			{ title: "Inventory Management", href: "/solutions/inventory" },
			{ title: "Delivery Solutions", href: "/solutions/delivery" },
		],
	},
	support: {
		title: "Support",
		links: [
			{ title: "Help Center", href: "/support" },
			{ title: "API Documentation", href: "/api-docs" },
			{ title: "System Status", href: "/status" },
			{ title: "Contact Support", href: "/support/contact" },
			{ title: "Training Resources", href: "/training" },
		],
	},
};

const SOCIAL_LINKS = [
	{
		name: "Facebook",
		icon: FacebookIcon,
		href: "https://www.facebook.com/kenixcommodities",
		color: "#1877F2",
	},
	{
		name: "Twitter",
		icon: TwitterIcon,
		href: "https://www.twitter.com/kenixcommodities",
		color: "#1DA1F2",
	},
	{
		name: "LinkedIn",
		icon: LinkedInIcon,
		href: "https://www.linkedin.com/company/kenixcommodities",
		color: "#0A66C2",
	},
	{
		name: "Instagram",
		icon: InstagramIcon,
		href: "https://www.instagram.com/kenixcommodities",
		color: "#E4405F",
	},
	{
		name: "WhatsApp",
		icon: WhatsAppIcon,
		href: "https://wa.me/254700000000",
		color: "#25D366",
	},
];

const CONTACT_INFO = [
	{
		icon: LocationOnIcon,
		title: "Head Office",
		content: ["Nairobi CBD, Kenya", "P.O. Box 12345-00100"],
	},
	{
		icon: PhoneIcon,
		title: "Phone",
		content: ["+254 700 000 000", "+254 711 111 111"],
	},
	{
		icon: EmailIcon,
		title: "Email",
		content: ["info@kenixcommodities.co.ke", "support@kenixcommodities.co.ke"],
	},
];

// ----------------------------------------------------------------------

export default function Footer() {
	const theme = useTheme();

	const handleNewsletterSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		// Handle newsletter subscription
		console.log("Newsletter subscription submitted");
	};

	return (
		<Box
			component="footer"
			sx={{
				bgcolor: "grey.900",
				color: "grey.50",
				pt: { xs: 8, md: 12 },
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
            radial-gradient(circle at 25% 25%, ${alpha(
							theme.palette.primary.main,
							0.1
						)} 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${alpha(
							theme.palette.secondary.main,
							0.1
						)} 0%, transparent 50%)
          `,
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative" }}>
				{/* Newsletter Section */}
				<Box
					component={m.div}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					sx={{
						p: { xs: 4, md: 6 },
						mb: { xs: 6, md: 8 },
						bgcolor: alpha(theme.palette.primary.main, 0.1),
						borderRadius: 3,
						textAlign: "center",
						border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
						backdropFilter: "blur(10px)",
					}}
				>
					<Typography
						variant="h4"
						sx={{
							mb: 2,
							color: "primary.light",
							fontWeight: 700,
							fontSize: { xs: "1.5rem", md: "2rem" },
						}}
					>
						Stay Connected with Kenix Commodities
					</Typography>

					<Typography
						variant="body1"
						sx={{
							mb: 4,
							color: "grey.300",
							maxWidth: 600,
							mx: "auto",
							lineHeight: 1.6,
						}}
					>
						Get the latest updates on new products, exclusive offers, and
						industry insights delivered directly to your inbox. Join our
						community of successful retailers.
					</Typography>

					<Box
						component="form"
						onSubmit={handleNewsletterSubmit}
						sx={{
							maxWidth: 500,
							mx: "auto",
						}}
					>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={2}
							sx={{ alignItems: "stretch" }}
						>
							<TextField
								fullWidth
								placeholder="Enter your email address"
								variant="outlined"
								type="email"
								required
								sx={{
									"& .MuiOutlinedInput-root": {
										bgcolor: alpha(theme.palette.common.white, 0.1),
										borderRadius: 2,
										color: "white",
										"& fieldset": {
											borderColor: alpha(theme.palette.common.white, 0.3),
										},
										"&:hover fieldset": {
											borderColor: alpha(theme.palette.common.white, 0.5),
										},
										"&.Mui-focused fieldset": {
											borderColor: "primary.light",
										},
									},
									"& .MuiInputBase-input::placeholder": {
										color: alpha(theme.palette.common.white, 0.7),
										opacity: 1,
									},
								}}
							/>
							<Button
								variant="contained"
								size="large"
								type="submit"
								endIcon={<SendIcon />}
								sx={{
									minWidth: { xs: "100%", sm: 150 },
									bgcolor: "primary.main",
									color: "white",
									fontWeight: 600,
									borderRadius: 2,
									py: { xs: 1.5, sm: "auto" },
									boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
									"&:hover": {
										bgcolor: "primary.dark",
										transform: "translateY(-1px)",
										boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
									},
									transition: "all 0.3s ease",
								}}
							>
								Subscribe
							</Button>
						</Stack>
					</Box>
				</Box>

				{/* Main Footer Content */}
				<Grid container spacing={{ xs: 4, md: 6 }}>
					{/* Company Info */}
					<Grid xs={12} md={4}>
						<Stack spacing={3}>
							{/* Logo */}
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box
									sx={{
										width: 48,
										height: 48,
										borderRadius: 2,
										background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mr: 2,
									}}
								>
									<Typography
										variant="h5"
										sx={{
											color: "white",
											fontWeight: 800,
										}}
									>
										K
									</Typography>
								</Box>
								<Typography
									variant="h6"
									sx={{
										color: "grey.100",
										fontWeight: 700,
									}}
								>
									Kenix Commodities
								</Typography>
							</Box>

							<Typography
								variant="body2"
								sx={{
									color: "grey.400",
									lineHeight: 1.8,
									maxWidth: 350,
								}}
							>
								Kenya's leading B2B e-commerce platform, revolutionizing retail
								by streamlining access to essential goods for both formal and
								informal retailers across East Africa.
							</Typography>

							{/* Contact Information */}
							<Stack spacing={2}>
								{CONTACT_INFO.map((contact, index) => (
									<Stack
										key={index}
										direction="row"
										spacing={2}
										alignItems="flex-start"
									>
										<Box
											sx={{
												width: 40,
												height: 40,
												borderRadius: 2,
												bgcolor: alpha(theme.palette.primary.main, 0.1),
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexShrink: 0,
											}}
										>
											<contact.icon
												sx={{ color: "primary.light", fontSize: 20 }}
											/>
										</Box>
										<Stack spacing={0.5}>
											<Typography
												variant="subtitle2"
												sx={{ color: "grey.300", fontWeight: 600 }}
											>
												{contact.title}
											</Typography>
											{contact.content.map((item, idx) => (
												<Typography
													key={idx}
													variant="body2"
													sx={{ color: "grey.400" }}
												>
													{item}
												</Typography>
											))}
										</Stack>
									</Stack>
								))}
							</Stack>

							{/* Social Links */}
							<Stack direction="row" spacing={1}>
								{SOCIAL_LINKS.map((social) => (
									<IconButton
										key={social.name}
										component="a"
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										sx={{
											width: 44,
											height: 44,
											bgcolor: alpha(social.color, 0.1),
											color: social.color,
											border: `1px solid ${alpha(social.color, 0.2)}`,
											transition: "all 0.3s ease",
											"&:hover": {
												bgcolor: social.color,
												color: "white",
												transform: "translateY(-2px)",
												boxShadow: `0 4px 12px ${alpha(social.color, 0.3)}`,
											},
										}}
									>
										<social.icon sx={{ fontSize: 20 }} />
									</IconButton>
								))}
							</Stack>
						</Stack>
					</Grid>

					{/* Footer Links Sections */}
					{Object.entries(FOOTER_LINKS).map(([key, section]) => (
						<Grid xs={12} sm={6} md={2} key={key}>
							<Stack spacing={2}>
								<Typography
									variant="h6"
									sx={{
										color: "grey.100",
										fontSize: "1rem",
										fontWeight: 700,
										mb: 1,
									}}
								>
									{section.title}
								</Typography>

								<Stack spacing={1.5}>
									{section.links.map((link) => (
										<Typography
											key={link.title}
											component="a"
											href={link.href}
											variant="body2"
											sx={{
												color: "grey.400",
												textDecoration: "none",
												cursor: "pointer",
												transition: "all 0.3s ease",
												position: "relative",
												display: "inline-block",
												"&:hover": {
													color: "primary.light",
													transform: "translateX(4px)",
												},
												"&:before": {
													content: '""',
													position: "absolute",
													bottom: -2,
													left: 0,
													width: 0,
													height: 2,
													bgcolor: "primary.light",
													transition: "width 0.3s ease",
												},
												"&:hover:before": {
													width: "100%",
												},
											}}
										>
											{link.title}
										</Typography>
									))}
								</Stack>
							</Stack>
						</Grid>
					))}
				</Grid>

				<Divider sx={{ borderColor: "grey.700", my: { xs: 6, md: 8 } }} />

				{/* Bottom Footer */}
				<Stack
					direction={{ xs: "column", md: "row" }}
					justifyContent="space-between"
					alignItems={{ xs: "center", md: "center" }}
					spacing={3}
					sx={{ pb: 4 }}
				>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={{ xs: 2, sm: 4 }}
						alignItems="center"
					>
						<Typography variant="body2" sx={{ color: "grey.500" }}>
							© 2024 Kenix Commodities Ltd. All rights reserved.
						</Typography>

						<Stack direction="row" spacing={3}>
							<Typography
								component="a"
								href="/privacy"
								variant="body2"
								sx={{
									color: "grey.500",
									textDecoration: "none",
									transition: "color 0.3s ease",
									"&:hover": {
										color: "primary.light",
									},
								}}
							>
								Privacy Policy
							</Typography>
							<Typography
								component="a"
								href="/terms"
								variant="body2"
								sx={{
									color: "grey.500",
									textDecoration: "none",
									transition: "color 0.3s ease",
									"&:hover": {
										color: "primary.light",
									},
								}}
							>
								Terms of Service
							</Typography>
							<Typography
								component="a"
								href="/cookies"
								variant="body2"
								sx={{
									color: "grey.500",
									textDecoration: "none",
									transition: "color 0.3s ease",
									"&:hover": {
										color: "primary.light",
									},
								}}
							>
								Cookie Policy
							</Typography>
						</Stack>
					</Stack>

					<Stack direction="row" spacing={2} alignItems="center">
						<Typography variant="caption" sx={{ color: "grey.600" }}>
							Made with ❤️ in Kenya
						</Typography>
						<Box
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor: "success.main",
								animation: "pulse 2s infinite",
								"@keyframes pulse": {
									"0%": {
										opacity: 1,
										transform: "scale(1)",
									},
									"50%": {
										opacity: 0.5,
										transform: "scale(1.2)",
									},
									"100%": {
										opacity: 1,
										transform: "scale(1)",
									},
								},
							}}
						/>
						<Typography
							variant="caption"
							sx={{ color: "success.main", fontWeight: 600 }}
						>
							Online
						</Typography>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
