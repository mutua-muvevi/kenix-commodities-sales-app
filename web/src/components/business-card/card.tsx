/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useResponsive } from "@/hooks/use-responsive";
import {
	alpha,
	Card,
	CardActionArea,
	CardContent,
	Divider,
	// Rating,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import Link from "next/link";
import Iconify from "../iconify";
import Image from "next/image";
import { truncateStr } from "@/utils/format-string";

const BusinessCard = ({ business }: any) => {
	const theme = useTheme();
	const isMdDown = useResponsive("down", "md");

	
	if (!business || !business.businessName) return null;

	const {
		_id,
		businessName,
		basicInfo,
		location,
		description,
		isSponsored,
		isVerified,
	} = business;

	

	const basicInfoItems = [
		{
			label: "Email",
			value: basicInfo?.email,
			icon: "eva:email-fill",
		},
		{
			label: "Phone",
			value: basicInfo?.phone,
			icon: "eva:phone-fill",
		},
		{
			label: "Website",
			value: basicInfo?.website,
			icon: "eva:link-fill",
		},
		{
			label: "Address",
			value: `${location?.street} ${location?.city}, ${location?.state}, ${location?.country}`,
			icon: "ix:location-filled",
		},
	].filter((item) => item.value);

	return (
		<Card
			sx={{
				backgroundColor:
					isSponsored === true
						? alpha(theme.palette.primary.main, 0.1)
						: theme.palette.background.paper,
			}}
		>
			<CardActionArea>
				<Link
					href={`/business/${_id}`}
					style={{
						textDecoration: "none",
						color: "inherit",
					}}
				>
					<CardContent>
						<Stack direction="column" spacing={3}>
							<Stack
								direction="row"
								alignItems="flex-start"
								justifyContent={"space-between"}
							>
								{business.logo ? (
									<Image
										src={business.logo}
										alt={`${businessName} logo`}
										height={50}
										width={50}
										style={{
											borderRadius: "5px",
										}}
									/>
								) : null}

								<Stack>
									{isVerified === true ? (
										<Stack direction="row" spacing={1.5}>
											<Tooltip
												title="Verified"
												sx={{
													cursor: "pointer",
													borderRadius: "2px",
													padding: "2px",
													color: "text.primary",
												}}
											>
												<Iconify
													icon="material-symbols:verified"
													width={24}
													sx={{
														color: alpha(theme.palette.success.main, 0.8),
													}}
												/>
											</Tooltip>
											<Typography
												variant="body2"
												color="success"
												fontWeight="bold"
											>
												Verified
											</Typography>
										</Stack>
									) : null}

									{isSponsored === true ? (
										<Stack direction="row" spacing={1.5}>
											<Tooltip
												title="Sponsored"
												sx={{
													cursor: "pointer",
													borderRadius: "2px",
													padding: "2px",
													color: "text.primary",
												}}
											>
												<Iconify
													icon="material-symbols:verified"
													width={24}
													sx={{
														color: alpha(theme.palette.success.main, 0.8),
													}}
												/>
											</Tooltip>
											<Typography
												variant="body2"
												color="success"
												fontWeight="bold"
											>
												Sponsored
											</Typography>
										</Stack>
									) : null}
								</Stack>
							</Stack>

							<Stack direction="column" spacing={1}>
								<Typography variant="body1" fontWeight={"bold"}>
									{businessName}
								</Typography>

								<Stack
									direction={isMdDown ? "column" : "row"}
									spacing={isMdDown ? 1 : 3}
									alignItems={isMdDown ? "flex-start" : "center"}
								>
									{basicInfoItems.map((item, i) => (
										<Stack direction="row" spacing={1} key={i} alignItems="center">
											<Iconify
												icon={item.icon}
												width={16}
												sx={{ color: theme.palette.text.secondary }}
											/>
											<Typography variant="body2" color="text.secondary">
												{item.value}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Stack>

							<Divider />

							{/* description */}
							{description && description.length > 0 && description[0].paragraphs.length > 0 ? (
								<Stack direction="column" spacing={3}>
									<Typography
										variant="body2"
										color="text.secondary"
										textAlign="justify"
									>
										{truncateStr(description[0].paragraphs[0], 150)}
									</Typography>
								</Stack>
							) : null}

							{/* reviews */}
							{/* {
								business?.reviews?.length > 0 ? (
									<Stack direction="row" spacing={1.5} alignItems="center">
									<Divider />
										<Rating value={review.rating} precision={0.5} readOnly sx={{ pr: 2 }} size="small" />
									</Stack>
								) : null
							}

							<Stack direction="row" spacing={1.5} alignItems="center">
								<Rating name="read-only" value={4.5} readOnly />
								<Typography variant="body2" color="text.secondary">
									4.5
								</Typography>
								<Typography variant="body2" color="text.secondary">
									(100 Reviews)
								</Typography>
							</Stack> */}
						</Stack>
					</CardContent>
				</Link>
			</CardActionArea>
		</Card>
	);
};

export default BusinessCard;
