// components/category/CategoryGrid.tsx - Grid layout for categories
import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { Category } from "../../store/types/product";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
	categories: Category[];
	onCategoryPress?: (category: Category) => void;
	numColumns?: number;
	refreshing?: boolean;
	onRefresh?: () => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
	categories,
	onCategoryPress,
	numColumns = 2,
	refreshing = false,
	onRefresh,
}) => {
	const { theme } = useTheme();

	const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
		<CategoryCard category={item} index={index} onPress={() => onCategoryPress?.(item)} />
	);

	const styles = StyleSheet.create({
		container: {
			flex: 1,
		},
		contentContainer: {
			padding: theme.spacing.sm,
			paddingBottom: theme.spacing.xl,
		},
		columnWrapper: {
			justifyContent: "space-between",
		},
	});

	return (
		<View style={styles.container}>
			<FlatList
				data={categories}
				renderItem={renderCategoryItem}
				keyExtractor={(item) => item._id}
				numColumns={numColumns}
				contentContainerStyle={styles.contentContainer}
				columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
				showsVerticalScrollIndicator={false}
				refreshing={refreshing}
				onRefresh={onRefresh}
			/>
		</View>
	);
};
