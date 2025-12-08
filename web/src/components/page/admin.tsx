import { Container, Stack, Typography } from "@mui/material";
import CustomBreadcrumbs from "../custom-breadcrumbs";

interface PageProps {
	children: React.ReactNode;
	links?: { name: string; href: string }[];
	header?: string;
	subheader?: string;
}

const AdminPageLayout = ({ children, links, header, subheader }: PageProps) => {
	return (
		<Container maxWidth="xl">
			<Stack direction="column" spacing={1.5} sx={{ mt: 2 }}>
				{links && <CustomBreadcrumbs links={links} />}

				{header && (
					<Typography variant="h4" component="h1">
						{header}
					</Typography>
				)}

				{subheader && (
					<Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
						{subheader}
					</Typography>
				)}

				<>{children}</>
			</Stack>
		</Container>
	);
};

export default AdminPageLayout;
