import _ from "lodash";

export const truncateStr = (string : string, length : number) => {
	const response = _.truncate(string, {
		length: length,
	});
	return response;
}
