import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

import EmptyContent from "../empty-content";

// ----------------------------------------------------------------------

interface TableNoDataProps {
	notFound?: boolean;
	sx?: object;
}

const TableNoData = ({ notFound, sx }: TableNoDataProps) => {
	return (
		<TableRow>
			{notFound ? (
				<TableCell colSpan={12}>
					<EmptyContent
						filled
						title="No Data"
						sx={{
							py: 10,
							...sx,
						}}
					/>
				</TableCell>
			) : (
				<TableCell colSpan={12} sx={{ p: 0 }} />
			)}
		</TableRow>
	);
};

export default TableNoData;
