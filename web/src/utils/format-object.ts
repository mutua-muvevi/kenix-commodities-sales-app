/* eslint-disable @typescript-eslint/no-explicit-any */

export const isObjectEmpty = (obj : any) => {
	return Object.keys(obj).length === 0;
};
