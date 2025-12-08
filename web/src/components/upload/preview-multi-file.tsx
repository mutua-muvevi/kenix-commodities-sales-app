// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { m, AnimatePresence } from "framer-motion";

import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
// import ListItemText from "@mui/material/ListItemText";

// import { fData } from "@/utils/format-number";

import Iconify from "../iconify";
import { varFade } from "../animate";
import FileThumbnail, { fileData } from "../file-thumbnail";
import { Card, ImageList, ImageListItem, useTheme } from "@mui/material";

// ----------------------------------------------------------------------

interface MultiFilePreviewProps {
	thumbnail?: boolean;
	files: string[] | object[];
	onRemove?: () => void;
	sx?: object;
}

const MultiFilePreview = ({
	thumbnail,
	files,
	onRemove,
	sx,
}: MultiFilePreviewProps) => {
	const theme = useTheme();

	return (
		<AnimatePresence initial={false}>
			<ImageList variant="masonry" cols={3} gap={20}>
				{files?.map((file) => {
					// const { key, name = "", size = 0 } = fileData(file);
					const { key } = fileData(file);

					// const isNotFormatFile = typeof file === "string";

					if (thumbnail) {
						
						return (
							<Stack
								key={key}
								component={m.div}
								{...varFade().inUp}
								alignItems="center"
								display="inline-flex"
								justifyContent="center"
								sx={{
									m: 0.5,
									width: 80,
									height: 80,
									borderRadius: 1.25,
									overflow: "hidden",
									position: "relative",
									border: (theme) =>
										`solid 1px ${alpha(
											theme.palette.grey[500],
											0.16,
										)}`,
									...sx,
								}}
							>
								<FileThumbnail
									tooltip
									imageView
									file={file}
									sx={{ position: "absolute" }}
									imgSx={{ position: "absolute" }}
								/>

								{onRemove && (
									<IconButton
										size="small"
										onClick={() => onRemove(file)}
										sx={{
											p: 0.5,
											top: 4,
											right: 4,
											position: "absolute",
											color: "common.white",
											bgcolor: (theme) =>
												alpha(
													theme.palette.grey[900],
													0.48,
												),
											"&:hover": {
												bgcolor: (theme) =>
													alpha(
														theme.palette.grey[900],
														0.72,
													),
											},
										}}
									>
										<Iconify
											icon="mingcute:close-line"
											width={14}
										/>
									</IconButton>
								)}
							</Stack>
						);
					}

					return (
						<ImageListItem key={key}>
							<Card
								{...varFade().inUp}
								sx={{
									borderRadius: "5px",
									backgroundColor:
										theme.palette.background.default,
									...sx,
								}}
							>
								<Stack
									component={m.div}
									direction="row"
									alignItems="flex-start"
									justifyContent="space-between"
								>
									<div
										style={{
											position: "relative",
											zIndex: -1,
										}}
									>
										<FileThumbnail file={file} />
									</div>

									{/* <ListItemText
										primary={isNotFormatFile ? file : name}
										secondary={isNotFormatFile ? "" : fData(size)}
										secondaryTypographyProps={{
											component: "span",
											typography: "caption",
										}}
									/> */}

									{onRemove && (
										<IconButton
											size="small"
											onClick={() => onRemove(file)}
											sx={{
												position: "absolute", // Change from relative to absolute
												zIndex: 5,
												top: 8, // Adjust the position as needed
												right: 8, // Adjust the position as needed
												backgroundColor:
													theme.palette.primary.main,
												color: theme.palette.primary
													.contrastText,
												"&:hover": {
													backgroundColor:
														theme.palette.primary
															.dark, // Optional hover effect
												},
											}}
										>
											<Iconify
												icon="mingcute:close-line"
												width={20}
											/>
										</IconButton>
									)}
								</Stack>
							</Card>
						</ImageListItem>
					);
				})}
			</ImageList>
		</AnimatePresence>
	);
};

export default MultiFilePreview;
