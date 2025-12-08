// src/components/sections/products/product-showcase-section.tsx
"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { m, AnimatePresence } from "framer-motion";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { MotionViewport, varFade } from "@/components/animate";

// ----------------------------------------------------------------------

const PRODUCT_CATEGORIES = [
	{ id: "all", label: "All Products", color: "primary" },
	{ id: "fresh", label: "Fresh Produce", color: "success" },
	{ id: "dairy", label: "Dairy & Bakery", color: "info" },
	{ id: "grains", label: "Grains & Cereals", color: "warning" },
	{ id: "beverages", label: "Beverages", color: "secondary" },
	{ id: "household", label: "Household", color: "error" },
];

const FEATURED_PRODUCTS = [
	{
		id: 1,
		name: "Premium Kenyan Tomatoes",
		category: "fresh",
		price: 85,
		originalPrice: 120,
		unit: "per kg",
		image: "🍅",
		rating: 4.8,
		reviews: 156,
		inStock: true,
		isPopular: true,
		discount: 29,
		description: "Farm-fresh, locally sourced tomatoes perfect for retail.",
		tags: ["Organic", "Local", "Fresh"],
	},
	{
		id: 2,
		name: "Fresh Milk - 1L Packets",
		category: "dairy",
		price: 65,
		originalPrice: null,
		unit: "per packet",
		image: "🥛",
		rating: 4.9,
		reviews: 203,
		inStock: true,
		isPopular: true,
		discount: 0,
		description: "Pure, pasteurized milk from certified dairy farms.",
		tags: ["Pasteurized", "Protein Rich"],
	},
	{
		id: 3,
		name: "Premium Maize Flour - 2kg",
		category: "grains",
		price: 140,
		originalPrice: 160,
		unit: "per bag",
		image: "🌽",
		rating: 4.7,
		reviews: 89,
		inStock: true,
		isPopular: false,
		discount: 13,
		description: "High-quality maize flour, fortified with vitamins.",
		tags: ["Fortified", "Premium Quality"],
	},
	{
		id: 4,
		name: "Coca-Cola 300ml Bottles",
		category: "beverages",
		price: 45,
		originalPrice: null,
		unit: "per bottle",
		image: "🥤",
		rating: 4.6,
		reviews: 124,
		inStock: true,
		isPopular: false,
		discount: 0,
		description: "Classic Coca-Cola in convenient 300ml bottles.",
		tags: ["Brand", "Popular"],
	},
	{
		id: 5,
		name: "Avocados - Grade A",
		category: "fresh",
		price: 180,
		originalPrice: 220,
		unit: "per kg",
		image: "🥑",
		rating: 4.8,
		reviews: 67,
		inStock: true,
		isPopular: true,
		discount: 18,
		description: "Premium grade avocados, perfect ripeness guaranteed.",
		tags: ["Premium", "Export Quality"],
	},
	{
		id: 6,
		name: "Dishwashing Liquid - 500ml",
		category: "household",
		price: 95,
		originalPrice: 110,
		unit: "per bottle",
		image: "🧴",
		rating: 4.5,
		reviews: 91,
		inStock: false,
		isPopular: false,
		discount: 14,
		description: "Effective dishwashing liquid with lemon scent.",
		tags: ["Antibacterial", "Lemon Fresh"],
	},
	{
		id: 7,
		name: "White Bread Loaves",
		category: "dairy",
		price: 55,
		originalPrice: null,
		unit: "per loaf",
		image: "🍞",
		rating: 4.4,
		reviews: 78,
		inStock: true,
		isPopular: false,
		discount: 0,
		description: "Freshly baked white bread, soft and nutritious.",
		tags: ["Fresh Baked", "Soft"],
	},
	{
		id: 8,
		name: "Kenyan Tea Leaves - 500g",
		category: "beverages",
		price: 280,
		originalPrice: 320,
		unit: "per packet",
		image: "🍃",
		rating: 4.9,
		reviews: 145,
		inStock: true,
		isPopular: true,
		discount: 13,
		description: "Premium Kenyan black tea from highland estates.",
		tags: ["Premium", "Export Grade", "Highland"],
	},
];

// ----------------------------------------------------------------------

export default function ProductShowcaseSection() {
	const theme = useTheme();
	const [activeCategory, setActiveCategory] = useState("all");

	const filteredProducts =
		activeCategory === "all"
			? FEATURED_PRODUCTS
			: FEATURED_PRODUCTS.filter(
					(product) => product.category === activeCategory
			  );

	const handleCategoryChange = (
		event: React.SyntheticEvent,
		newValue: string
	) => {
		setActiveCategory(newValue);
	};

	return (
		<Box
			sx={{
				py: { xs: 8, md: 15 },
				bgcolor: "background.default",
				position: "relative",
			}}
		>
			<Container maxWidth="lg">
				<MotionViewport>
					{/* Header */}
					<Stack spacing={3} sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
						<div>
							<Typography
								variant="overline"
								sx={{
									color: "primary.main",
									fontWeight: 700,
									letterSpacing: 2,
								}}
							>
								PRODUCT SHOWCASE
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
								Quality Products for
								<Box
									component="span"
									sx={{
										display: "block",
										color: "secondary.main",
										mt: 1,
									}}
								>
									Every Business Need
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
								From fresh produce to household essentials, discover our
								carefully curated selection of products that keep your business
								thriving and customers satisfied.
							</Typography>
						</div>
					</Stack>

					{/* Category Tabs */}
					<div>
						<Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
							<Tabs
								value={activeCategory}
								onChange={handleCategoryChange}
								variant="scrollable"
								scrollButtons="auto"
								sx={{
									"& .MuiTabs-flexContainer": {
										gap: 1,
									},
									"& .MuiTab-root": {
										minWidth: "auto",
										minHeight: 48,
										borderRadius: 3,
										textTransform: "none",
										fontWeight: 600,
										fontSize: "0.9rem",
										transition: "all 0.3s ease",
										"&:hover": {
											bgcolor: alpha(theme.palette.primary.main, 0.08),
										},
										"&.Mui-selected": {
											color: "white",
											bgcolor: "primary.main",
											boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
										},
									},
									"& .MuiTabs-indicator": {
										display: "none",
									},
								}}
							>
								{PRODUCT_CATEGORIES.map((category) => (
									<Tab
										key={category.id}
										value={category.id}
										label={category.label}
									/>
								))}
							</Tabs>
						</Box>
					</div>

					{/* Products Grid */}
					<AnimatePresence mode="wait">
						<div
							key={activeCategory}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<Grid container spacing={{ xs: 3, md: 4 }}>
								{filteredProducts.map((product, index) => (
									<Grid xs={12} sm={6} md={4} lg={3} key={product.id}>
										<div>
											<Card
												component={"div"}
												whileHover={{
													y: -8,
													transition: { duration: 0.3, ease: "easeOut" },
												}}
												sx={{
													height: "100%",
													position: "relative",
													overflow: "hidden",
													borderRadius: 3,
													boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
													border: `1px solid ${alpha(
														theme.palette.grey[300],
														0.5
													)}`,
													transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
													"&:hover": {
														boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
														borderColor: "primary.main",
													},
												}}
											>
												{/* Product Image & Badges */}
												<Box
													sx={{
														position: "relative",
														height: 200,
														bgcolor: alpha(theme.palette.grey[100], 0.5),
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "4rem",
													}}
												>
													{product.image}

													{/* Badges */}
													<Stack
														spacing={1}
														sx={{
															position: "absolute",
															top: 12,
															left: 12,
														}}
													>
														{product.isPopular && (
															<Chip
																size="small"
																label="Popular"
																color="secondary"
																sx={{
																	fontWeight: 600,
																	fontSize: "0.75rem",
																}}
															/>
														)}
														{product.discount > 0 && (
															<Chip
																size="small"
																label={`-${product.discount}%`}
																sx={{
																	bgcolor: "error.main",
																	color: "white",
																	fontWeight: 700,
																	fontSize: "0.75rem",
																}}
															/>
														)}
													</Stack>

													{/* Quick Actions */}
													<Stack
														spacing={1}
														sx={{
															position: "absolute",
															top: 12,
															right: 12,
															opacity: 0,
															transition: "opacity 0.3s ease",
															".MuiCard-root:hover &": {
																opacity: 1,
															},
														}}
													>
														<Button
															size="small"
															variant="contained"
															color="primary"
															sx={{
																minWidth: 40,
																width: 40,
																height: 40,
																borderRadius: "50%",
																p: 0,
																boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
															}}
														>
															<FavoriteIcon sx={{ fontSize: 18 }} />
														</Button>
														<Button
															size="small"
															variant="contained"
															color="info"
															sx={{
																minWidth: 40,
																width: 40,
																height: 40,
																borderRadius: "50%",
																p: 0,
																boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
															}}
														>
															<VisibilityIcon sx={{ fontSize: 18 }} />
														</Button>
													</Stack>

													{/* Stock Status */}
													{!product.inStock && (
														<Box
															sx={{
																position: "absolute",
																top: 0,
																left: 0,
																right: 0,
																bottom: 0,
																bgcolor: alpha(theme.palette.grey[900], 0.7),
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																color: "white",
																fontWeight: 700,
																fontSize: "1.1rem",
															}}
														>
															Out of Stock
														</Box>
													)}
												</Box>

												{/* Product Details */}
												<Stack spacing={2} sx={{ p: 3 }}>
													<Stack spacing={1}>
														<Typography
															variant="h6"
															sx={{
																fontWeight: 700,
																color: "text.primary",
																fontSize: "1rem",
																lineHeight: 1.3,
															}}
														>
															{product.name}
														</Typography>

														<Typography
															variant="body2"
															sx={{
																color: "text.secondary",
																lineHeight: 1.5,
																display: "-webkit-box",
																WebkitLineClamp: 2,
																WebkitBoxOrient: "vertical",
																overflow: "hidden",
															}}
														>
															{product.description}
														</Typography>
													</Stack>

													{/* Tags */}
													<Stack direction="row" spacing={1} flexWrap="wrap">
														{product.tags.slice(0, 2).map((tag) => (
															<Chip
																key={tag}
																label={tag}
																size="small"
																variant="outlined"
																sx={{
																	fontSize: "0.7rem",
																	height: 24,
																}}
															/>
														))}
													</Stack>

													{/* Price & Rating */}
													<Stack
														direction="row"
														alignItems="center"
														justifyContent="space-between"
													>
														<Stack spacing={0.5}>
															<Stack
																direction="row"
																alignItems="baseline"
																spacing={1}
															>
																<Typography
																	variant="h6"
																	sx={{
																		fontWeight: 800,
																		color: "primary.main",
																	}}
																>
																	KES {product.price}
																</Typography>
																{product.originalPrice && (
																	<Typography
																		variant="body2"
																		sx={{
																			textDecoration: "line-through",
																			color: "text.disabled",
																			fontSize: "0.85rem",
																		}}
																	>
																		{product.originalPrice}
																	</Typography>
																)}
															</Stack>
															<Typography
																variant="caption"
																sx={{
																	color: "text.secondary",
																	fontSize: "0.75rem",
																}}
															>
																{product.unit}
															</Typography>
														</Stack>

														<Stack alignItems="flex-end" spacing={0.5}>
															<Stack
																direction="row"
																alignItems="center"
																spacing={0.5}
															>
																<Typography
																	variant="body2"
																	sx={{
																		fontWeight: 600,
																		color: "warning.main",
																	}}
																>
																	★ {product.rating}
																</Typography>
															</Stack>
															<Typography
																variant="caption"
																sx={{
																	color: "text.secondary",
																	fontSize: "0.7rem",
																}}
															>
																({product.reviews})
															</Typography>
														</Stack>
													</Stack>

													{/* Add to Cart Button */}
													<Button
														fullWidth
														variant="contained"
														startIcon={<ShoppingCartIcon />}
														disabled={!product.inStock}
														sx={{
															mt: 2,
															py: 1.5,
															borderRadius: 2,
															fontWeight: 600,
															textTransform: "none",
															boxShadow: product.inStock
																? "0 4px 12px rgba(0,0,0,0.15)"
																: "none",
															"&:hover": {
																transform: product.inStock
																	? "translateY(-1px)"
																	: "none",
																boxShadow: product.inStock
																	? "0 6px 16px rgba(0,0,0,0.2)"
																	: "none",
															},
															"&:disabled": {
																bgcolor: "action.disabledBackground",
																color: "text.disabled",
															},
															transition: "all 0.3s ease",
														}}
													>
														{product.inStock ? "Add to Cart" : "Out of Stock"}
													</Button>
												</Stack>
											</Card>
										</div>
									</Grid>
								))}
							</Grid>
						</div>
					</AnimatePresence>

					{/* View All Products CTA */}
					<Box sx={{ textAlign: "center", mt: { xs: 8, md: 10 } }}>
						<div>
							<Stack spacing={3} alignItems="center">
								<Typography
									variant="h5"
									sx={{
										color: "text.primary",
										fontWeight: 700,
									}}
								>
									Discover More Products
								</Typography>

								<Typography
									variant="body1"
									sx={{
										color: "text.secondary",
										maxWidth: 500,
										mx: "auto",
									}}
								>
									Explore our complete catalog of over 5,000+ products across
									all categories. Find everything you need to stock your
									business.
								</Typography>

								<Button
									variant="contained"
									size="large"
									endIcon={<LocalOfferIcon />}
									sx={{
										px: 4,
										py: 2,
										borderRadius: 3,
										fontWeight: 700,
										fontSize: "1.1rem",
										boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
										"&:hover": {
											transform: "translateY(-2px)",
											boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
										},
										transition: "all 0.3s ease",
									}}
								>
									View All Products
								</Button>
							</Stack>
						</div>
					</Box>
				</MotionViewport>
			</Container>
		</Box>
	);
}
