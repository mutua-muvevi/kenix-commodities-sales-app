/* eslint-disable @typescript-eslint/no-explicit-any */
export const flattenArray = (list: any[], key = "children"): any => {
	let children: any[] = [];

	const flatten = list?.map((item) => {
		if (item[key] && item[key].length) {
			children = [...children, ...item[key]];
		}
		
		return item;
	});

	return flatten?.concat(
		children.length ? flattenArray(children, key) : children
	);
};
