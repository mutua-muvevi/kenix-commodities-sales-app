import React from "react";
import { View, FlatList, StyleSheet, Dimensions, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../hooks/useTheme";
import { Category } from "../../store/types/product";
import { CategoryCard } from "./CategoryCard";

const { width: screenWidth } = Dimensions.get("window");
const SLIDER_CARD_WIDTH = 140;
const CARD_HEIGHT = 110;

interface CategorySliderProps {
	categories: Category[];
	onCategoryPress?: (category: Category) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ categories, onCategoryPress }) => {
	const { theme } = useTheme();

	const handleCategoryPress = (category: Category) => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		onCategoryPress?.(category);
	};

	const styles = StyleSheet.create({
		container: {
			marginBottom: theme.spacing.md,
		},
		contentContainer: {
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: theme.spacing.xs,
		},
		itemContainer: {
			width: SLIDER_CARD_WIDTH,
			height: CARD_HEIGHT,
			marginRight: theme.spacing.md,
		},
		separator: {
			width: theme.spacing.sm,
		},
	});

	const CategoryCardWithCustomWidth = ({ category, index, onPress }: any) => {
		const cardStyles = StyleSheet.create({
			customContainer: {
				width: SLIDER_CARD_WIDTH,
			},
		});

		return (
			<View style={cardStyles.customContainer}>
				<CategoryCard category={category} index={index} onPress={onPress} />
			</View>
		);
	};

	const renderSeparator = () => <View style={styles.separator} />;

	return (
		<View style={styles.container}>
			<FlatList
				data={categories}
				renderItem={({ item, index }) => (
					<CategoryCardWithCustomWidth
						category={item}
						index={index}
						onPress={() => handleCategoryPress(item)}
					/>
				)}
				keyExtractor={(item) => item._id}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.contentContainer}
				ItemSeparatorComponent={renderSeparator}
				snapToInterval={SLIDER_CARD_WIDTH + theme.spacing.md}
				decelerationRate="fast"
				snapToAlignment="start"
				bounces={true}
				overScrollMode="auto"
				removeClippedSubviews={Platform.OS === "android"}
				maxToRenderPerBatch={6}
				initialNumToRender={4}
				windowSize={5}
			/>
		</View>
	);
};
