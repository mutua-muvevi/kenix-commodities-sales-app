// theme/utils/dimensions.ts - Screen dimension utilities
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const dimensions = {
	screenWidth,
	screenHeight,
	isSmallScreen: screenWidth < 375,
	isMediumScreen: screenWidth >= 375 && screenWidth < 768,
	isLargeScreen: screenWidth >= 768,
	aspectRatio: screenWidth / screenHeight,
};

export const getResponsiveSize = (size: number, factor: number = 1): number => {
	const baseWidth = 375; // iPhone 8 width as base
	return (screenWidth / baseWidth) * size * factor;
};
