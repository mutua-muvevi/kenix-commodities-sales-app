// src/components/business-card/card-enhanced.tsx
"use client";

import {
	Card,
	CardActionArea,
	CardContent,
	Stack,
	Typography,
	Box,
	Chip,
	Rating,
	Avatar,
	useTheme,
	alpha,
	Divider,
	Grid,
	Tooltip,
	IconButton,
} from "@mui/material";
import { m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useResponsive } from "@/hooks/use-responsive";
import { Iconify } from "@/components/iconify";
import { truncateStr } from "@/utils/format-string";

interface Business {
	_id: string;
	businessName: string;
	basicInfo?: {
		email?: string;
		phone?: string;
		website?: string;
	} | null;
	location?: {
		city?: string;
		state?: string;
		country?: string;
		street?: string;
	} | null;
	description?: Array<{
		title?: string;
		paragraphs?: string[];
	}> | null;
	isSponsored?: boolean;
	isVerified?: boolean;
	logo?: string;
	thumbnail?: string;
	overalRating?: number;
	reviews?: any[];
	category?: {
		_id: string;
		name: string;
	} | null;
}

interface BusinessCardProps {
	business: Business;
	variant?: "default" | "compact";
}

const BusinessCardEnhanced = ({
	business,
	variant = "default",
}: BusinessCardProps) => {
	const theme = useTheme();
	const isMdDown = useResponsive("down", "md");

	// Safety check - return null if business is invalid
	if (!business || !business._id || !business.businessName) {
		console.warn("Invalid business data passed to BusinessCard:", business);
		return null;
	}

	const {
		_id,
		businessName,
		basicInfo,
		location,
		description,
		isSponsored = false,
		isVerified = false,
		logo,
		thumbnail,
		overalRating = 0,
		reviews = [],
		category,
	} = business;

	// Safely build contact info items
	const contactInfoItems = [
		basicInfo?.email && {
			label: "Email",
			value: basicInfo.email,
			icon: "eva:email-fill",
		},
		basicInfo?.phone && {
			label: "Phone",
			value: basicInfo.phone,
			icon: "eva:phone-fill",
		},
		basicInfo?.website && {
			label: "Website",
			value: basicInfo.website,
			icon: "eva:link-fill",
		},
	].filter(Boolean);

	// Safely build location string
	const locationString = location
		? [location.city, location.state, location.country]
				.filter(Boolean)
				.join(", ")
		: null;

	// Safely get description text
	const descriptionText =
		description &&
		description.length > 0 &&
		description[0].paragraphs &&
		description[0].paragraphs.length > 0
			? description[0].paragraphs[0]
			: null;

	// Get business image with fallback
	const getBusinessImage = () => {
		if (logo) return logo;
		if (thumbnail) return thumbnail;
		return null;
	};

	const businessImage = getBusinessImage();

	// Compact Grid Card for Grid View
	if (variant === "compact") {
		return (
			<m.div
				whileHover={{
					y: -8,
					transition: { duration: 0.3, ease: "easeOut" },
				}}
				style={{ height: "100%" }}
			>
				<Card
					sx={{
						height: 420, // Fixed height for uniformity
						display: "flex",
						flexDirection: "column",
						position: "relative",
						overflow: "hidden",
						background: isSponsored
							? `linear-gradient(135deg, ${alpha(
									theme.palette.warning.main,
									0.08
							  )}, ${alpha(theme.palette.warning.main, 0.02)})`
							: `linear-gradient(135deg, ${alpha(
									theme.palette.primary.main,
									0.02
							  )}, ${alpha(theme.palette.background.paper, 1)})`,
						border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
						"&:hover": {
							boxShadow: `0 20px 40px ${alpha(
								theme.palette.primary.main,
								0.15
							)}`,
							border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
							transform: "translateY(-2px)",
						},
						transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
						borderRadius: 3,
					}}
				>
					{/* Sponsored Badge */}
					{isSponsored && (
						<Box
							sx={{
								position: "absolute",
								top: 12,
								right: 12,
								zIndex: 3,
							}}
						>
							<Chip
								label="Sponsored"
								size="small"
								sx={{
									background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
									color: "white",
									fontWeight: 700,
									fontSize: "0.7rem",
									boxShadow: `0 4px 12px ${alpha(
										theme.palette.warning.main,
										0.4
									)}`,
									border: "none",
									"& .MuiChip-icon": {
										color: "white",
									},
								}}
								icon={<Iconify icon="eva:star-fill" width={14} />}
							/>
						</Box>
					)}

					<CardActionArea
						sx={{ height: "100%", display: "flex", flexDirection: "column" }}
					>
						<Link
							href={`/business/${_id}`}
							style={{
								textDecoration: "none",
								color: "inherit",
								height: "100%",
								width: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							{/* Header Section with Image */}
							<Box
								sx={{
									position: "relative",
									height: 140,
									background: `linear-gradient(135deg, ${alpha(
										theme.palette.primary.main,
										0.8
									)}, ${alpha(theme.palette.secondary.main, 0.6)})`,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
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
										opacity: 0.1,
										background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
									}}
								/>

								{/* Business Image/Avatar */}
								{businessImage ? (
									<Box
										sx={{
											position: "relative",
											zIndex: 2,
										}}
									>
										<Image
											src={businessImage}
											alt={`${businessName} logo`}
											width={80}
											height={80}
											style={{
												borderRadius: "20px",
												objectFit: "cover",
												border: `3px solid ${alpha(
													theme.palette.common.white,
													0.9
												)}`,
												boxShadow: `0 8px 24px ${alpha(
													theme.palette.common.black,
													0.15
												)}`,
											}}
										/>
									</Box>
								) : (
									<Avatar
										sx={{
											width: 80,
											height: 80,
											bgcolor: alpha(theme.palette.common.white, 0.9),
											color: theme.palette.primary.main,
											fontSize: "2rem",
											fontWeight: 800,
											border: `3px solid ${alpha(
												theme.palette.common.white,
												0.9
											)}`,
											boxShadow: `0 8px 24px ${alpha(
												theme.palette.common.black,
												0.15
											)}`,
											zIndex: 2,
										}}
									>
										{businessName.charAt(0).toUpperCase()}
									</Avatar>
								)}

								{/* Verification Badge */}
								{isVerified && (
									<Box
										sx={{
											position: "absolute",
											bottom: 12,
											left: 12,
											zIndex: 3,
										}}
									>
										<Tooltip title="Verified Business" arrow>
											<Chip
												size="small"
												icon={
													<Iconify
														icon="eva:checkmark-circle-fill"
														width={16}
													/>
												}
												label="Verified"
												sx={{
													background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
													color: "white",
													fontWeight: 700,
													fontSize: "0.7rem",
													boxShadow: `0 4px 12px ${alpha(
														theme.palette.success.main,
														0.4
													)}`,
													border: "none",
													"& .MuiChip-icon": {
														color: "white",
													},
												}}
											/>
										</Tooltip>
									</Box>
								)}

								{/* Rating Badge */}
								{overalRating > 0 && (
									<Box
										sx={{
											position: "absolute",
											bottom: 12,
											right: 12,
											zIndex: 3,
										}}
									>
										<Box
											sx={{
												background: alpha(theme.palette.common.white, 0.95),
												borderRadius: 2,
												px: 1.5,
												py: 0.5,
												display: "flex",
												alignItems: "center",
												gap: 0.5,
												boxShadow: `0 4px 12px ${alpha(
													theme.palette.common.black,
													0.1
												)}`,
												backdropFilter: "blur(10px)",
											}}
										>
											<Rating
												value={overalRating}
												precision={0.1}
												readOnly
												size="small"
											/>
											<Typography
												variant="caption"
												fontWeight={600}
												sx={{ color: theme.palette.text.primary }}
											>
												({reviews.length})
											</Typography>
										</Box>
									</Box>
								)}
							</Box>

							{/* Content Section */}
							<CardContent
								sx={{
									flexGrow: 1,
									display: "flex",
									flexDirection: "column",
									p: 2.5,
									"&:last-child": { pb: 2.5 },
								}}
							>
								<Stack spacing={2} sx={{ height: "100%" }}>
									{/* Business Name */}
									<Box>
										<Typography
											variant="h6"
											fontWeight={700}
											color="primary.main"
											sx={{
												lineHeight: 1.3,
												minHeight: 50, // Fixed height for uniformity
												display: "-webkit-box",
												WebkitLineClamp: 2,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
												"&:hover": {
													color: "primary.dark",
												},
												transition: "color 0.3s ease",
											}}
											title={businessName}
										>
											{businessName}
										</Typography>
									</Box>

									{/* Category */}
									{category && (
										<Box>
											<Chip
												label={category.name}
												size="small"
												variant="outlined"
												sx={{
													borderColor: alpha(theme.palette.secondary.main, 0.3),
													color: theme.palette.secondary.main,
													fontWeight: 600,
													fontSize: "0.75rem",
													"&:hover": {
														bgcolor: alpha(theme.palette.secondary.main, 0.1),
													},
												}}
											/>
										</Box>
									)}

									{/* Location */}
									{locationString && (
										<Stack direction="row" alignItems="center" spacing={1}>
											<Iconify
												icon="eva:pin-fill"
												width={16}
												sx={{
													color: theme.palette.text.secondary,
													flexShrink: 0,
												}}
											/>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
													fontWeight: 500,
												}}
												title={locationString}
											>
												{locationString}
											</Typography>
										</Stack>
									)}

									{/* Description */}
									{descriptionText && (
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{
												lineHeight: 1.5,
												display: "-webkit-box",
												WebkitLineClamp: 3,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
												flexGrow: 1,
												fontSize: "0.875rem",
											}}
										>
											{descriptionText}
										</Typography>
									)}

									{/* Contact Actions */}
									<Box sx={{ mt: "auto" }}>
										<Divider sx={{ mb: 2 }} />
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Stack direction="row" spacing={0.5}>
												{basicInfo?.phone && (
													<Tooltip title="Call" arrow>
														<IconButton
															size="small"
															sx={{
																bgcolor: alpha(theme.palette.success.main, 0.1),
																color: theme.palette.success.main,
																"&:hover": {
																	bgcolor: alpha(
																		theme.palette.success.main,
																		0.2
																	),
																},
															}}
														>
															<Iconify icon="eva:phone-fill" width={16} />
														</IconButton>
													</Tooltip>
												)}
												{basicInfo?.email && (
													<Tooltip title="Email" arrow>
														<IconButton
															size="small"
															sx={{
																bgcolor: alpha(theme.palette.info.main, 0.1),
																color: theme.palette.info.main,
																"&:hover": {
																	bgcolor: alpha(theme.palette.info.main, 0.2),
																},
															}}
														>
															<Iconify icon="eva:email-fill" width={16} />
														</IconButton>
													</Tooltip>
												)}
												{basicInfo?.website && (
													<Tooltip title="Website" arrow>
														<IconButton
															size="small"
															sx={{
																bgcolor: alpha(theme.palette.warning.main, 0.1),
																color: theme.palette.warning.main,
																"&:hover": {
																	bgcolor: alpha(
																		theme.palette.warning.main,
																		0.2
																	),
																},
															}}
														>
															<Iconify icon="eva:link-fill" width={16} />
														</IconButton>
													</Tooltip>
												)}
											</Stack>

											<Stack direction="row" alignItems="center" spacing={0.5}>
												<Typography
													variant="body2"
													color="primary.main"
													fontWeight={600}
													sx={{ fontSize: "0.8rem" }}
												>
													View Details
												</Typography>
												<Iconify
													icon="eva:arrow-right-fill"
													width={14}
													sx={{ color: theme.palette.primary.main }}
												/>
											</Stack>
										</Stack>
									</Box>
								</Stack>
							</CardContent>
						</Link>
					</CardActionArea>
				</Card>
			</m.div>
		);
	}

	// Default List Card (unchanged)
	return (
		<m.div
			whileHover={{
				y: -2,
				transition: { duration: 0.2 },
			}}
		>
			<Card
				sx={{
					background: isSponsored
						? `linear-gradient(135deg, ${alpha(
								theme.palette.warning.main,
								0.05
						  )}, ${alpha(theme.palette.warning.main, 0.02)})`
						: theme.palette.background.paper,
					border: isSponsored
						? `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
						: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
					"&:hover": {
						boxShadow: theme.shadows[8],
						border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
					},
					transition: "all 0.3s ease",
					position: "relative",
					overflow: "visible",
				}}
			>
				{/* Sponsored Badge */}
				{isSponsored && (
					<Box
						sx={{
							position: "absolute",
							top: -8,
							right: 16,
							zIndex: 2,
						}}
					>
						<Chip
							label="Sponsored"
							size="small"
							color="warning"
							icon={<Iconify icon="eva:star-fill" />}
							sx={{
								fontWeight: 700,
								boxShadow: theme.shadows[2],
							}}
						/>
					</Box>
				)}

				<CardActionArea>
					<Link
						href={`/business/${_id}`}
						style={{
							textDecoration: "none",
							color: "inherit",
						}}
					>
						<CardContent sx={{ p: 3 }}>
							<Grid container spacing={3}>
								{/* Business Image */}
								<Grid item xs={12} sm={3} md={2}>
									<Stack alignItems={isMdDown ? "flex-start" : "center"}>
										{businessImage ? (
											<Image
												src={businessImage}
												alt={`${businessName} logo`}
												width={80}
												height={80}
												style={{
													borderRadius: "12px",
													objectFit: "cover",
													border: `2px solid ${alpha(
														theme.palette.primary.main,
														0.1
													)}`,
												}}
											/>
										) : (
											<Avatar
												sx={{
													width: 80,
													height: 80,
													bgcolor: "primary.main",
													fontSize: "1.5rem",
													fontWeight: 700,
													border: `2px solid ${alpha(
														theme.palette.primary.main,
														0.1
													)}`,
												}}
											>
												{businessName.charAt(0).toUpperCase()}
											</Avatar>
										)}

										{/* Verification Badge */}
										{isVerified && (
											<Tooltip title="Verified Business">
												<Chip
													label="Verified"
													size="small"
													color="success"
													icon={<Iconify icon="eva:checkmark-circle-fill" />}
													sx={{
														mt: 1,
														fontWeight: 600,
														fontSize: "0.75rem",
													}}
												/>
											</Tooltip>
										)}
									</Stack>
								</Grid>

								{/* Business Details */}
								<Grid item xs={12} sm={9} md={10}>
									<Stack spacing={2} sx={{ height: "100%" }}>
										{/* Header */}
										<Stack spacing={1}>
											<Stack
												direction="row"
												alignItems="flex-start"
												justifyContent="space-between"
											>
												<Typography
													variant="h5"
													fontWeight={700}
													color="primary.main"
													sx={{
														lineHeight: 1.3,
														"&:hover": {
															color: "primary.dark",
														},
														transition: "color 0.3s ease",
													}}
												>
													{businessName}
												</Typography>

												{/* Rating */}
												{overalRating > 0 && (
													<Stack
														direction="row"
														alignItems="center"
														spacing={0.5}
													>
														<Rating
															value={overalRating}
															precision={0.1}
															readOnly
															size="small"
														/>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															({reviews.length})
														</Typography>
													</Stack>
												)}
											</Stack>

											{/* Category and Location */}
											<Stack
												direction={isMdDown ? "column" : "row"}
												spacing={isMdDown ? 1 : 2}
												alignItems={isMdDown ? "flex-start" : "center"}
												flexWrap="wrap"
											>
												{category && (
													<Chip
														label={category.name}
														size="small"
														variant="outlined"
														color="secondary"
														sx={{ fontWeight: 600 }}
													/>
												)}

												{locationString && (
													<Stack
														direction="row"
														alignItems="center"
														spacing={0.5}
													>
														<Iconify
															icon="eva:pin-fill"
															width={16}
															color="text.secondary"
														/>
														<Typography variant="body2" color="text.secondary">
															{locationString}
														</Typography>
													</Stack>
												)}
											</Stack>
										</Stack>

										{/* Contact Information */}
										{contactInfoItems.length > 0 && (
											<>
												<Divider />
												<Grid container spacing={2}>
													{contactInfoItems.map((item: any, index) => (
														<Grid item xs={12} sm={6} md={4} key={index}>
															<Stack
																direction="row"
																spacing={1}
																alignItems="center"
															>
																<Iconify
																	icon={item.icon}
																	width={16}
																	sx={{ color: theme.palette.text.secondary }}
																/>
																<Typography
																	variant="body2"
																	color="text.secondary"
																	sx={{
																		overflow: "hidden",
																		textOverflow: "ellipsis",
																		whiteSpace: "nowrap",
																	}}
																>
																	{item.value}
																</Typography>
															</Stack>
														</Grid>
													))}
												</Grid>
											</>
										)}

										{/* Description */}
										{descriptionText && (
											<>
												<Divider />
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														lineHeight: 1.6,
														textAlign: "justify",
													}}
												>
													{truncateStr(descriptionText, 200)}
												</Typography>
											</>
										)}

										{/* Footer Actions */}
										<Stack
											direction="row"
											alignItems="center"
											justifyContent="space-between"
											sx={{ mt: "auto", pt: 2 }}
										>
											<Stack direction="row" spacing={1}>
												{contactInfoItems.length > 0 && (
													<Chip
														icon={<Iconify icon="eva:phone-fill" />}
														label="Contact"
														size="small"
														variant="outlined"
														color="primary"
													/>
												)}

												{locationString && (
													<Chip
														icon={<Iconify icon="eva:navigation-2-fill" />}
														label="Directions"
														size="small"
														variant="outlined"
														color="info"
													/>
												)}
											</Stack>

											<Stack direction="row" alignItems="center" spacing={1}>
												<Typography
													variant="body2"
													color="primary.main"
													fontWeight={600}
												>
													View Details
												</Typography>
												<Iconify
													icon="eva:arrow-right-fill"
													width={16}
													color="primary.main"
												/>
											</Stack>
										</Stack>
									</Stack>
								</Grid>
							</Grid>
						</CardContent>
					</Link>
				</CardActionArea>
			</Card>
		</m.div>
	);
};

export default BusinessCardEnhanced;
