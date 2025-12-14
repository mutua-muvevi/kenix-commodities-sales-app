import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeArea, Container } from "../../components/layout";
import { SearchBar } from "../../components/ui";
import { CategoryGrid } from "../../components/category/CategoryGrid";
import { useTheme } from "../../hooks";
import { useCategories } from "../../store";
import { Category } from "../../store/types/product";

const CategoriesScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { categories, isLoadingCategories, error, fetchCategories, hasCategories, categoryCount } = useCategories();

	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		if (!hasCategories) {
			fetchCategories();
		}
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchCategories();
		} catch (error) {
			console.error("Refresh failed:", error);
		} finally {
			setRefreshing(false);
		}
	};

	const handleCategoryPress = (category: Category) => {
		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			console.log("Category pressed:", category.name, "ID:", category._id);
			router.push(`/category/${category._id}`);
		} catch (error) {
			console.error("Category navigation error:", error);
		}
	};

	const filteredCategories = searchQuery
		? categories.filter((category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: categories;

	const styles = StyleSheet.create({
		header: {
			padding: theme.spacing.md,
			backgroundColor: theme.palette.background.paper,
		},
		title: {
			...theme.typography.h4,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.sm,
		},
		subtitle: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.md,
		},
		searchContainer: {
			marginBottom: theme.spacing.sm,
		},
		emptyState: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			padding: theme.spacing.xl,
		},
		emptyTitle: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			marginTop: theme.spacing.lg,
			marginBottom: theme.spacing.sm,
		},
		emptyDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
	});

	if (error) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>Something went wrong</Text>
						<Text style={styles.emptyDescription}>{error}</Text>
					</View>
				</Container>
			</SafeArea>
		);
	}

	return (
		<SafeArea>
			<Container style={{ padding: 0 }}>
				<View style={styles.header}>
					<Text style={styles.title}>Categories</Text>
					<Text style={styles.subtitle}>
						{categoryCount} categor{categoryCount !== 1 ? "ies" : "y"} available
					</Text>

					<View style={styles.searchContainer}>
						<SearchBar
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search categories..."
						/>
					</View>
				</View>

				{isLoadingCategories && !refreshing ? (
					<View style={styles.emptyState}>
						<Text>Loading categories...</Text>
					</View>
				) : filteredCategories.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>No Categories Found</Text>
						<Text style={styles.emptyDescription}>
							{searchQuery
								? `No categories match "${searchQuery}"`
								: "Categories will appear here once loaded"}
						</Text>
					</View>
				) : (
					<CategoryGrid
						categories={filteredCategories}
						onCategoryPress={handleCategoryPress}
						refreshing={refreshing}
						onRefresh={handleRefresh}
					/>
				)}
			</Container>
		</SafeArea>
	);
};

export default CategoriesScreen;
