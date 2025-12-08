/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import { useTheme, Box, Typography, IconButton, Avatar, Chip, Link, Divider, Stack } from "@mui/material";
import Iconify from "../iconify";

interface ProcessedBusiness {
	_id: string;
	businessName: string;
	location: {
		coordinates: [number, number];
		city: string;
		country: string;
		street: string;
	};
	logo?: string;
	basicInfo?: {
		phone?: string;
		website?: string;
		email?: string;
		hours?: string;
		rating?: number;
		category?: string;
		description?: string;
	};
	position: {
		lat: number;
		lng: number;
	};
}

interface CustomInfoWindowProps {
	business: ProcessedBusiness;
	position: { lat: number; lng: number };
	onClose: () => void;
	onBusinessClick?: (business: ProcessedBusiness) => void;
}

const CustomInfoWindow: React.FC<CustomInfoWindowProps> = ({ business, position, onClose, onBusinessClick }) => {
	const theme = useTheme();

	const handleViewDetails = () => {
		if (onBusinessClick) {
			onBusinessClick(business);
		}
	};

	const formatPhoneNumber = (phone: string) => {
		// Basic phone number formatting - you can enhance this
		return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
	};

	const getBusinessInitial = () => {
		return business.businessName.charAt(0).toUpperCase();
	};

	return (
		<InfoWindow
			position={position}
			onCloseClick={onClose}
			options={{
				pixelOffset: new window.google.maps.Size(0, -50),
				maxWidth: 350,
				disableAutoPan: false,
			}}
		>
			<Box
				sx={{
					minWidth: 280,
					maxWidth: 340,
					backgroundColor: theme.palette.background.paper,
					borderRadius: 2,
					overflow: "hidden",
					boxShadow: theme.shadows[8],
					border: `1px solid ${theme.palette.divider}`,
				}}
			>
				{/* Header Section */}
				<Box
					sx={{
						background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
						color: theme.palette.primary.contrastText,
						p: 2,
						position: "relative",
					}}
				>
					<IconButton
						onClick={onClose}
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							color: theme.palette.primary.contrastText,
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.2)",
							},
							width: 28,
							height: 28,
						}}
					>
						<Iconify icon="eva:close-fill" width={16} />
					</IconButton>

					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar
							src={business.logo}
							sx={{
								width: 50,
								height: 50,
								backgroundColor: theme.palette.primary.lighter,
								color: theme.palette.primary.contrastText,
								border: "2px solid rgba(255, 255, 255, 0.2)",
								fontSize: "20px",
								fontWeight: "bold",
							}}
						>
							{!business.logo && getBusinessInitial()}
						</Avatar>

						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 600,
									fontSize: "18px",
									lineHeight: 1.2,
									mb: 0.5,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{business.businessName}
							</Typography>

							{business.basicInfo?.category && (
								<Chip
									label={business.basicInfo.category}
									size="small"
									sx={{
										backgroundColor: "rgba(255, 255, 255, 0.2)",
										color: theme.palette.primary.contrastText,
										fontSize: "11px",
										height: 24,
									}}
								/>
							)}
						</Box>
					</Stack>
				</Box>

				{/* Content Section */}
				<Box sx={{ p: 2 }}>
					{/* Rating */}
					{business.basicInfo?.rating && (
						<Box sx={{ mb: 2 }}>
							<Stack direction="row" alignItems="center" spacing={1}>
								<Stack direction="row" alignItems="center" spacing={0.5}>
									{[...Array(5)].map((_, index) => (
										<Iconify
											key={index}
											icon={
												index < Math.floor(business.basicInfo!.rating!)
													? "eva:star-fill"
													: "eva:star-outline"
											}
											width={14}
											sx={{
												color:
													index < Math.floor(business.basicInfo!.rating!)
														? theme.palette.warning.main
														: theme.palette.grey[400],
											}}
										/>
									))}
								</Stack>
								<Typography variant="body2" color="text.secondary">
									{business.basicInfo.rating.toFixed(1)}
								</Typography>
							</Stack>
						</Box>
					)}

					{/* Description */}
					{business.basicInfo?.description && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{
								mb: 2,
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								lineHeight: 1.4,
							}}
						>
							{business.basicInfo.description}
						</Typography>
					)}

					<Divider sx={{ my: 2 }} />

					{/* Contact Information */}
					<Stack spacing={1.5}>
						{/* Address */}
						<Stack direction="row" spacing={1.5} alignItems="flex-start">
							<Iconify
								icon="eva:pin-fill"
								width={16}
								sx={{
									color: theme.palette.text.secondary,
									mt: 0.25,
									flexShrink: 0,
								}}
							/>
							<Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.4 }}>
								{business.location.street && `${business.location.street}, `}
								{business.location.city}
								{business.location.country && `, ${business.location.country}`}
							</Typography>
						</Stack>

						{/* Phone */}
						{business.basicInfo?.phone && (
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Iconify
									icon="eva:phone-fill"
									width={16}
									sx={{
										color: theme.palette.text.secondary,
										flexShrink: 0,
									}}
								/>
								<Link
									href={`tel:${business.basicInfo.phone}`}
									variant="body2"
									color="primary"
									underline="hover"
									sx={{ fontWeight: 500 }}
								>
									{formatPhoneNumber(business.basicInfo.phone)}
								</Link>
							</Stack>
						)}

						{/* Website */}
						{business.basicInfo?.website && (
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Iconify
									icon="eva:globe-2-fill"
									width={16}
									sx={{
										color: theme.palette.text.secondary,
										flexShrink: 0,
									}}
								/>
								<Link
									href={business.basicInfo.website}
									target="_blank"
									rel="noopener noreferrer"
									variant="body2"
									color="primary"
									underline="hover"
									sx={{
										fontWeight: 500,
										display: "flex",
										alignItems: "center",
										gap: 0.5,
									}}
								>
									Visit Website
									<Iconify icon="eva:external-link-fill" width={12} />
								</Link>
							</Stack>
						)}

						{/* Hours */}
						{business.basicInfo?.hours && (
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Iconify
									icon="eva:clock-fill"
									width={16}
									sx={{
										color: theme.palette.text.secondary,
										flexShrink: 0,
									}}
								/>
								<Typography variant="body2" color="text.primary">
									{business.basicInfo.hours}
								</Typography>
							</Stack>
						)}

						{/* Email */}
						{business.basicInfo?.email && (
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Iconify
									icon="eva:email-fill"
									width={16}
									sx={{
										color: theme.palette.text.secondary,
										flexShrink: 0,
									}}
								/>
								<Link
									href={`mailto:${business.basicInfo.email}`}
									variant="body2"
									color="primary"
									underline="hover"
									sx={{ fontWeight: 500 }}
								>
									{business.basicInfo.email}
								</Link>
							</Stack>
						)}
					</Stack>

					{/* Action Button */}
					{onBusinessClick && (
						<Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
							<Box
								component="button"
								onClick={handleViewDetails}
								sx={{
									width: "100%",
									padding: "10px 16px",
									backgroundColor: theme.palette.primary.main,
									color: theme.palette.primary.contrastText,
									border: "none",
									borderRadius: 1,
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: 600,
									transition: "all 0.2s ease",
									"&:hover": {
										backgroundColor: theme.palette.primary.dark,
										transform: "translateY(-1px)",
									},
									"&:active": {
										transform: "translateY(0)",
									},
								}}
							>
								View Details
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</InfoWindow>
	);
};

export default CustomInfoWindow;