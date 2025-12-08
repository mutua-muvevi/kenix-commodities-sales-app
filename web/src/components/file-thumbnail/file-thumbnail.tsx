// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import DownloadButton from "./download-button";
import { fileData, fileFormat } from "./utils";

// ----------------------------------------------------------------------

interface FileThumbnailProps {
	file: string | object;
	tooltip?: boolean;
	imageView?: boolean;
	onDownload?: () => void;
	sx?: object;
	imgSx?: object;
}

const FileThumbnail = ({
	file,
	tooltip,
	imageView,
	onDownload,
	sx,
	imgSx,
}: FileThumbnailProps) => {
	const { name = "", path = "", preview = "" } = fileData(file);

	const format = fileFormat(path || preview);

	const renderContent =
		format === "image" && imageView ? (
			<Box
				component="img"
				src={preview}
				sx={{
					width: 1,
					height: 1,
					flexShrink: 0,
					objectFit: "cover",
					...imgSx,
				}}
			/>
		) : (
			<Box
				component="img"
				src={file && file.name ? URL.createObjectURL(file) : file}
				sx={{
					width: "100%",
					height: "100%",
					flexShrink: 0,
					...sx,
				}}
			/>
		);

	if (tooltip) {
		return (
			<Tooltip title={name}>
				<Stack
					flexShrink={0}
					component="span"
					alignItems="center"
					justifyContent="center"
					sx={{
						width: "fit-content",
						height: "inherit",
					}}
				>
					{renderContent}
					{onDownload && <DownloadButton onDownload={onDownload} />}
				</Stack>
			</Tooltip>
		);
	}

	return (
		<>
			{renderContent}
			{onDownload && <DownloadButton onDownload={onDownload} />}
		</>
	);
};

export default FileThumbnail;