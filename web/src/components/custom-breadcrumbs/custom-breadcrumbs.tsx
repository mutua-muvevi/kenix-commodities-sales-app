import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import LinkItem from "./link-item";

// ----------------------------------------------------------------------

interface CustomBreadcrumbsProps {
	links: { name: string; href?: string }[];
	heading?: string;
	action?: React.ReactNode;
	moreLink?: string[];
	activeLast?: boolean;
	sx?: object;
}

 const CustomBreadcrumbs = ({
	links,
	action,
	heading,
	moreLink,
	activeLast,
	sx,
	...other
}: CustomBreadcrumbsProps) => {
	const lastLink = links[links.length - 1].name;

	return (
		<Box sx={{ ...sx }}>
			<Stack direction="row" alignItems="center">
				<Box sx={{ flexGrow: 1 }}>
					{/* HEADING */}
					{heading && (
						<Typography variant="h4" gutterBottom>
							{heading}
						</Typography>
					)}

					{/* BREADCRUMBS */}
					{!!links.length && (
						<Breadcrumbs separator={<Separator />} {...other}>
							{links.map((link) => (
								<LinkItem
									key={link?.name || ""}
									link={link}
									activeLast={activeLast}
									disabled={link.name === lastLink}
								/>
							))}
						</Breadcrumbs>
					)}
				</Box>

				{action && <Box sx={{ flexShrink: 0 }}> {action} </Box>}
			</Stack>

			{/* MORE LINK */}
			{!!moreLink && (
				<Box sx={{ mt: 2 }}>
					{moreLink?.map((href : string) => (
						<Link
							key={href}
							href={href}
							variant="body2"
							target="_blank"
							rel="noopener"
							sx={{ display: "table" }}
						>
							{href}
						</Link>
					))}
				</Box>
			)}
		</Box>
	);
}


// ----------------------------------------------------------------------

const Separator = () => {
	return (
		<Box
			component="span"
			sx={{
				width: 4,
				height: 4,
				borderRadius: "50%",
				bgcolor: "text.disabled",
			}}
		/>
	);
}

export default CustomBreadcrumbs