// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */


import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import TablePagination from "@mui/material/TablePagination";
import FormControlLabel from "@mui/material/FormControlLabel";

// ----------------------------------------------------------------------

interface TablePaginationCustomProps {
	dense?: boolean;
	onChangeDense?: () => void;
	rowsPerPageOptions?: number[];
	sx?: object;
}

const TablePaginationCustom = ({
	dense,
	onChangeDense,
	rowsPerPageOptions = [5, 10, 25],
	sx,
	...other
}: TablePaginationCustomProps) => {
	return (
		<Box sx={{ position: "relative", ...sx }}>
			<TablePagination
				rowsPerPageOptions={rowsPerPageOptions}
				component="div"
				{...other}
				sx={{
					borderTopColor: "transparent",
				}}
			/>

			{onChangeDense && (
				<FormControlLabel
					label="Dense"
					control={<Switch checked={dense} onChange={onChangeDense} />}
					sx={{
						pl: 2,
						py: 1.5,
						top: 0,
						position: {
							sm: "absolute",
						},
					}}
				/>
			)}
		</Box>
	);
};

export default TablePaginationCustom;
