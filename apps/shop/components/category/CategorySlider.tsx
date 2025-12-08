import React from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Category } from "../../store/types/product";
import { CategoryCard } from "./CategoryCard";

const { width: screenWidth } = Dimensions.get("window");
const SLIDER_CARD_WIDTH = 120; // Fixed width for horizontal slider

interface CategorySliderProps {
	categories: Category[];
	onCategoryPress?: (category: Category) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ categories, onCategoryPress }) => {
	const { theme } = useTheme();

	const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
		<View style={styles.itemContainer}>
			<CategoryCard category={item} index={index} onPress={() => onCategoryPress?.(item)} />
		</View>
	);

	const styles = StyleSheet.create({
		container: {
			marginVertical: theme.spacing.sm,
		},
		contentContainer: {
			paddingHorizontal: theme.spacing.sm,
		},
		itemContainer: {
			width: SLIDER_CARD_WIDTH,
			marginRight: theme.spacing.sm,
		},
	});

	// Override card width for horizontal layout
	const CategoryCardWithCustomWidth = ({ category, index, onPress }: any) => {
		const cardStyles = StyleSheet.create({
			customContainer: {
				width: SLIDER_CARD_WIDTH,
				marginBottom: theme.spacing.sm,
			},
		});

		return (
			<View style={cardStyles.customContainer}>
				<CategoryCard category={category} index={index} onPress={onPress} />
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={categories}
				renderItem={({ item, index }) => (
					<CategoryCardWithCustomWidth
						category={item}
						index={index}
						onPress={() => onCategoryPress?.(item)}
					/>
				)}
				keyExtractor={(item) => item._id}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.contentContainer}
			/>
		</View>
	);
};
