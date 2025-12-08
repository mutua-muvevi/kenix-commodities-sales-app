// src/utils/format-chart.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fNumber } from "./format-number";

/**
 * Format date for chart labels based on timeframe
 */
export const fChartDate = (date: Date | string | number, timeFrame: "daily" | "weekly" | "monthly" | "yearly"): string => {
	if (!date) return "";

	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) return "";

	try {
		switch (timeFrame) {
			case "daily":
				return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
			case "weekly":
				const weekNumber = Math.ceil(dateObj.getDate() / 7);
				return `Week ${weekNumber}`;
			case "monthly":
				return dateObj.toLocaleDateString("en-US", { month: "short" });
			case "yearly":
				return dateObj.getFullYear().toString();
			default:
				return dateObj.toLocaleDateString();
		}
	} catch (error) {
		console.warn("Error formatting chart date:", error);
		return "";
	}
};

/**
 * Format compact numbers for charts
 */
export const fCompactNumber = (value: number): string => {
	if (typeof value !== "number" || isNaN(value)) return "0";

	if (value >= 1000000000) {
		return `${(value / 1000000000).toFixed(1)}B`;
	}
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}K`;
	}
	return Math.round(value).toString();
};

/**
 * Get color by index for dynamic chart colors
 */
export const getColorByIndex = (index: number, theme: any): string => {
	const colors = [
		theme.palette.primary.main,
		theme.palette.secondary.main,
		theme.palette.success.main,
		theme.palette.warning.main,
		theme.palette.error.main,
		theme.palette.info.main,
		theme.palette.primary.dark,
		theme.palette.secondary.dark,
		theme.palette.success.dark,
		theme.palette.warning.dark,
	];

	return colors[index % colors.length];
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current: number, previous: number): number => {
	if (typeof current !== "number" || typeof previous !== "number") return 0;
	if (previous === 0) return current > 0 ? 100 : 0;
	return ((current - previous) / previous) * 100;
};

/**
 * Format percentage with proper sign
 */
export const fPercentage = (value: number, showSign: boolean = true): string => {
	if (typeof value !== "number" || isNaN(value)) return "0%";

	const formatted = Math.abs(value).toFixed(1);
	const sign = showSign ? (value >= 0 ? "+" : "-") : "";
	return `${sign}${formatted}%`;
};

/**
 * Get status color based on value and thresholds
 */
export const getStatusColor = (value: number, good: number, average: number, theme: any): string => {
	if (value >= good) return theme.palette.success.main;
	if (value >= average) return theme.palette.warning.main;
	return theme.palette.error.main;
};

/**
 * Generate realistic time series data for testing/demo purposes
 */
export const generateTimeSeriesData = (
	period: "daily" | "weekly" | "monthly" | "yearly",
	baseValue: number = 100,
	variance: number = 0.3,
	trend: number = 0.05,
): Array<{ x: number; y: number; label: string }> => {
	const data = [];
	const now = new Date();
	const points = period === "daily" ? 30 : period === "weekly" ? 12 : period === "monthly" ? 12 : 5;

	for (let i = points; i >= 0; i--) {
		const date = new Date(now);

		// Set date based on period
		if (period === "daily") {
			date.setDate(date.getDate() - i);
		} else if (period === "weekly") {
			date.setDate(date.getDate() - i * 7);
		} else if (period === "monthly") {
			date.setMonth(date.getMonth() - i);
		} else {
			date.setFullYear(date.getFullYear() - i);
		}

		// Calculate value with trend and variance
		const trendValue = baseValue * (1 + trend * (points - i));
		const seasonality = Math.sin((i / points) * Math.PI * 2) * 0.1;
		const randomVariance = (Math.random() - 0.5) * variance;
		const value = Math.max(0, trendValue * (1 + seasonality + randomVariance));

		data.push({
			x: date.getTime(),
			y: Math.floor(value),
			label: fChartDate(date, period),
		});
	}

	return data.reverse(); // Chronological order
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
	if (!data.length) {
		console.warn("No data to export");
		return;
	}

	try {
		const headers = Object.keys(data[0]);
		const csvContent = [
			headers.join(","),
			...data.map((row) =>
				headers
					.map((header) => {
						const value = row[header];
						if (value === null || value === undefined) return "";
						return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
					})
					.join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Clean up the URL
		setTimeout(() => URL.revokeObjectURL(url), 100);
	} catch (error) {
		console.error("Error exporting CSV:", error);
	}
};

/**
 * Export chart as image
 */
export const exportChartAsImage = (chartRef: any, filename: string): void => {
	if (!chartRef?.current) {
		console.warn("Chart reference not found");
		return;
	}

	try {
		const canvas = chartRef.current.querySelector("canvas");
		if (canvas) {
			canvas.toBlob((blob: Blob | null) => {
				if (blob) {
					const link = document.createElement("a");
					const url = URL.createObjectURL(blob);
					link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
					link.href = url;
					link.click();

					// Clean up
					setTimeout(() => URL.revokeObjectURL(url), 100);
				}
			});
		} else {
			console.warn("Canvas element not found in chart");
		}
	} catch (error) {
		console.error("Error exporting chart image:", error);
	}
};

/**
 * Generate country data with realistic distribution for East Africa
 */
export const generateCountryData = (): Array<{
	country: string;
	code: string;
	flag: string;
	users: number;
	businesses: number;
	region: string;
}> => {
	const countries = [
		{ country: "Kenya", code: "KE", flag: "🇰🇪", region: "East Africa", weight: 0.45 },
		{ country: "Uganda", code: "UG", flag: "🇺🇬", region: "East Africa", weight: 0.25 },
		{ country: "Tanzania", code: "TZ", flag: "🇹🇿", region: "East Africa", weight: 0.2 },
		{ country: "Rwanda", code: "RW", flag: "🇷🇼", region: "East Africa", weight: 0.07 },
		{ country: "South Sudan", code: "SS", flag: "🇸🇸", region: "East Africa", weight: 0.03 },
	];

	// Base totals - these would come from actual data
	const totalUsers = 2500;
	const totalBusinesses = 950;

	return countries.map((country) => ({
		...country,
		users: Math.floor(totalUsers * country.weight * (0.85 + Math.random() * 0.3)),
		businesses: Math.floor(totalBusinesses * country.weight * (0.85 + Math.random() * 0.3)),
	}));
};

/**
 * Calculate data distribution percentages
 */
export const calculateDistribution = <T extends Record<string, number>>(
	data: T[],
	valueKey: keyof T,
): Array<T & { percentage: number }> => {
	const total = data.reduce((sum, item) => sum + Number(item[valueKey]), 0);

	return data.map((item) => ({
		...item,
		percentage: total > 0 ? (Number(item[valueKey]) / total) * 100 : 0,
	}));
};

/**
 * Format chart tooltip content
 */
export const formatTooltip = (
	value: number,
	name: string,
	props: any,
	formatType: "number" | "currency" | "percentage" = "number",
): string => {
	let formattedValue: string;

	switch (formatType) {
		case "currency":
			formattedValue = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(value);
			break;
		case "percentage":
			formattedValue = `${value.toFixed(1)}%`;
			break;
		default:
			formattedValue = fNumber(value);
	}

	return `${name}: ${formattedValue}`;
};

/**
 * Generate chart gradient colors
 */
export const generateGradient = (color: string, opacity: number = 0.8): any => {
	return {
		type: "gradient",
		gradient: {
			shadeIntensity: 1,
			opacityFrom: opacity,
			opacityTo: 0.1,
			stops: [0, 90, 100],
		},
	};
};

/**
 * Smooth data points for better visualization
 */
export const smoothData = (data: number[], smoothingFactor: number = 0.3): number[] => {
	if (data.length <= 1) return data;

	const smoothed = [data[0]]; // First point remains unchanged

	for (let i = 1; i < data.length; i++) {
		const smoothedValue = smoothed[i - 1] * (1 - smoothingFactor) + data[i] * smoothingFactor;
		smoothed.push(smoothedValue);
	}

	return smoothed;
};

/**
 * Find peaks and valleys in data
 */
export const findPeaksAndValleys = (data: number[]): { peaks: number[]; valleys: number[] } => {
	const peaks: number[] = [];
	const valleys: number[] = [];

	for (let i = 1; i < data.length - 1; i++) {
		if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
			peaks.push(i);
		} else if (data[i] < data[i - 1] && data[i] < data[i + 1]) {
			valleys.push(i);
		}
	}

	return { peaks, valleys };
};
