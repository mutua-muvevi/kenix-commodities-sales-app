/* eslint-disable @typescript-eslint/no-explicit-any */
// ----------------------------------------------------------------------

export const emptyRows = (
	page: number,
	rowsPerPage: number,
	arrayLength: number
): number => {
	return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
};

function descendingComparator(a: any, b: any, orderBy: any) {
	if (a[orderBy] === null) {
		return 1;
	}
	if (b[orderBy] === null) {
		return -1;
	}
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

export const getComparator = (order: string, orderBy: string) => {
	return order === "desc"
		? (a: any, b: any) => descendingComparator(a, b, orderBy)
		: (a: any, b: any) => -descendingComparator(a, b, orderBy);
};
