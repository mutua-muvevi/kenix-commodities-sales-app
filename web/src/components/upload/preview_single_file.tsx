import Box from "@mui/material/Box";

import Image from "next/image";

// ----------------------------------------------------------------------
interface SingleFilePreviewProps {
	imgUrl: string;
}

const SingleFilePreview = ({ imgUrl = "" }: SingleFilePreviewProps) => {
	return (
		<Box
			sx={{
				p: 1,
				top: 0,
				left: 0,
				width: 1,
				height: 1,
				position: "absolute",
			}}
		>
			<Image
				alt="file preview"
				src={imgUrl}
				layout="fill"
				objectFit="cover"
				style={{
					borderRadius: 1,
				}}
			/>
		</Box>
	);
};

export default SingleFilePreview;
