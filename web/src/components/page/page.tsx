import { Container, Stack, Typography } from "@mui/material";
import CustomBreadcrumbs from "../custom-breadcrumbs";

interface PageProps {
	children: React.ReactNode;
	links?: { name: string; href: string }[];
	header?: string;
}

const Page = ({ children, links, header }: PageProps) => {
	return (
		<Container maxWidth="lg">
			<Stack direction="column" spacing={3} sx={{ mt: 2 }}>
				{links && <CustomBreadcrumbs links={links} />}

				{header && (
					<Typography variant="h4" component="h1">
						{header}
					</Typography>
				)}

				<>{children}</>
			</Stack>
		</Container>
	);
};

export default Page;
