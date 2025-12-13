// theme/utils/colors.ts - Color utility functions
export const alpha = (color: string, opacity: number): string => {
	// Convert hex to rgba
	const hex = color.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const lighten = (color: string, amount: number): string => {
	// Simple lighten function - converts hex to lighter shade
	const hex = color.replace("#", "");
	const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
	const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
	const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));

	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const darken = (color: string, amount: number): string => {
	// Simple darken function - converts hex to darker shade
	const hex = color.replace("#", "");
	const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
	const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
	const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));

	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
