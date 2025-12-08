/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, getTime, formatDistanceToNow } from "date-fns";

// ----------------------------------------------------------------------

export const fDate = (date: any, newFormat?: any) => {
	const fm = newFormat || "dd MMM yyyy";

	return date ? format(new Date(date), fm) : "";
};

export const fTime = (date: any, newFormat: any) => {
	const fm = newFormat || "p";

	return date ? format(new Date(date), fm) : "";
};

export const fDateTime = (date: any, newFormat: any) => {
	const fm = newFormat || "dd MMM yyyy p";

	return date ? format(new Date(date), fm) : "";
};

export const fTimestamp = (date: any) => {
	return date ? getTime(new Date(date)) : "";
};

export const fToNow = (date: any) => {
	return date
		? formatDistanceToNow(new Date(date), {
				addSuffix: true,
		  })
		: "";
};

export const isBetween = (inputDate: any, startDate: any, endDate: any) => {
	const date = new Date(inputDate);

	const results =
		new Date(date.toDateString()) >= new Date(startDate.toDateString()) &&
		new Date(date.toDateString()) <= new Date(endDate.toDateString());

	return results;
};

export const isAfter = (startDate: any, endDate: any) => {
	const results = startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;

	return results;
};

export const yearNow = () => new Date().getFullYear();

// Format date for different use cases
export function fDateShort(date: Date | string | number) {
	return fDate(date, "MMM dd");
}

export function fDateLong(date: Date | string | number) {
	return fDate(date, "EEEE, MMMM dd, yyyy");
}

// Format relative time
export function fRelativeTime(date: Date | string | number) {
	if (!date) return "";

	const now = new Date();
	const targetDate = new Date(date);
	const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return "Just now";
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < 604800) {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days > 1 ? "s" : ""} ago`;
	} else {
		return fDate(date);
	}
}
