import Link from "@mui/material/Link";

import { RouterLink } from "@/routes/components";

import Iconify from "../../iconify";

// ----------------------------------------------------------------------

interface MenuMoreLinkProps {
	path: string;
	title: string;
}

const MenuMoreLink = ({ title, path }: MenuMoreLinkProps) => {
	return (
		<Link
			component={RouterLink}
			href={path}
			color="inherit"
			sx={{
				alignItems: "center",
				typography: "caption",
				display: "inline-flex",
				alignSelf: "flex-end",
				fontWeight: "fontWeightBold",
			}}
		>
			{title} <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
		</Link>
	);
};

export default MenuMoreLink;
