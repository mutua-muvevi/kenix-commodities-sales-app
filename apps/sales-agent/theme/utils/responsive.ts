// theme/utils/responsive.ts - Responsive design utilities
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const breakpoints = {
	xs: 0,
	sm: 576,
	md: 768,
	lg: 992,
	xl: 1200,
};

export const isScreenSize = {
	xs: width >= breakpoints.xs && width < breakpoints.sm,
	sm: width >= breakpoints.sm && width < breakpoints.md,
	md: width >= breakpoints.md && width < breakpoints.lg,
	lg: width >= breakpoints.lg && width < breakpoints.xl,
	xl: width >= breakpoints.xl,
};

export const getColumns = (): number => {
	if (width < breakpoints.sm) return 1;
	if (width < breakpoints.md) return 2;
	if (width < breakpoints.lg) return 3;
	return 4;
};
