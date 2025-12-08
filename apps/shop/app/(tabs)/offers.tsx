// app/(tabs)/offers.tsx - New Offers screen to replace search
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Card, SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product";
import { useTheme } from "../../hooks";
// Note: This import will be uncommented when stores are fixed
// import { useProducts, useOffers } from "../../store";

const OffersScreen = () => {
	const { theme } = useTheme();
	// Temporary mock data until stores are fixed
	const allProducts = { products: [] };
	const offers = [];
	const [searchQuery, setSearchQuery] = useState("");

	const filteredOffers = offers.filter((offer) => offer.title.toLowerCase().includes(searchQuery.toLowerCase()));

	const featuredOffers = [
		{
			id: "1",
			title: "Flash Sale",
			subtitle: "Up to 50% off electronics",
			icon: "⚡",
			color: theme.palette.error.main,
		},
		{
			id: "2",
			title: "Daily Deals",
			subtitle: "New deals every day",
			icon: "🎯",
			color: theme.palette.success.main,
		},
		{
			id: "3",
			title: "Buy 2 Get 1",
			subtitle: "Selected grocery items",
			icon: "🛒",
			color: theme.palette.warning.main,
		},
		{
			id: "4",
			title: "Free Delivery",
			subtitle: "Orders over $50",
			icon: "🚚",
			color: theme.palette.info.main,
		},
	];

	const styles = StyleSheet.create({
		header: {
			paddingVertical: theme.spacing.lg,
		},
		title: {
			...theme.typography.h2,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.sm,
		},
		subtitle: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.lg,
		},
		sectionTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginVertical: theme.spacing.md,
			marginHorizontal: theme.spacing.md,
			fontWeight: "600",
		},
		offersContainer: {
			paddingHorizontal: theme.spacing.md,
			marginBottom: theme.spacing.lg,
		},
		offerCard: {
			marginRight: theme.spacing.md,
			width: 200,
			overflow: "hidden",
		},
		offerGradient: {
			padding: theme.spacing.lg,
			minHeight: 120,
			justifyContent: "space-between",
		},
		offerIcon: {
			fontSize: 32,
			alignSelf: "flex-start",
		},
		offerTitle: {
			...theme.typography.h6,
			color: theme.palette.common.white,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
		},
		offerSubtitle: {
			...theme.typography.body2,
			color: "rgba(255,255,255,0.9)",
		},
		dealSection: {
			marginBottom: theme.spacing.lg,
		},
		productsGrid: {
			paddingHorizontal: theme.spacing.md,
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
		},
		emptyIcon: {
			fontSize: 64,
			marginBottom: theme.spacing.lg,
		},
		emptyTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
		},
		emptyDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
			paddingHorizontal: theme.spacing.lg,
		},
		promotionBanner: {
			marginHorizontal: theme.spacing.md,
			marginBottom: theme.spacing.lg,
			overflow: "hidden",
		},
		bannerGradient: {
			padding: theme.spacing.xl,
			alignItems: "center",
		},
		bannerTitle: {
			...theme.typography.h4,
			color: theme.palette.common.white,
			fontWeight: "700",
			textAlign: "center",
			marginBottom: theme.spacing.sm,
		},
		bannerDescription: {
			...theme.typography.body1,
			color: "rgba(255,255,255,0.9)",
			textAlign: "center",
		},
	});

	const renderOfferCard = ({ item, index }: { item: any; index: number }) => (
		<Animated.View entering={FadeInRight.delay(index * 100).springify()}>
			<Card style={styles.offerCard} variant="elevated">
				<LinearGradient
					colors={[item.color, item.color + "CC"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.offerGradient}
				>
					<Text style={styles.offerIcon}>{item.icon}</Text>
					<View>
						<Text style={styles.offerTitle}>{item.title}</Text>
						<Text style={styles.offerSubtitle}>{item.subtitle}</Text>
					</View>
				</LinearGradient>
			</Card>
		</Animated.View>
	);

	const renderProductItem = ({ item, index }: { item: any; index: number }) => (
		<ProductCard product={item} index={index} />
	);

	const EmptyOffersComponent = () => (
		<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
			<Text style={styles.emptyIcon}>🎁</Text>
			<Text style={styles.emptyTitle}>No Offers Available</Text>
			<Text style={styles.emptyDescription}>Check back later for amazing deals and special offers!</Text>
		</Animated.View>
	);

	return (
		<SafeArea>
			<Container>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.header}>
						<Text style={styles.title}>Special Offers</Text>
						<Text style={styles.subtitle}>Discover amazing deals and save more on your favorites</Text>
						<SearchBar
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search offers and deals..."
						/>
					</View>

					{/* Promotion Banner */}
					<Animated.View entering={FadeInUp.springify()}>
						<Card style={styles.promotionBanner} variant="elevated">
							<LinearGradient
								colors={[theme.palette.primary.main, theme.palette.primary.dark]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.bannerGradient}
							>
								<Text style={styles.bannerTitle}>🔥 Limited Time Offer</Text>
								<Text style={styles.bannerDescription}>
									Get up to 70% off on selected items. Hurry, while stocks last!
								</Text>
							</LinearGradient>
						</Card>
					</Animated.View>

					{/* Featured Offers */}
					<Text style={styles.sectionTitle}>Featured Deals</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersContainer}>
						{featuredOffers.map((offer, index) => (
							<View key={offer.id}>{renderOfferCard({ item: offer, index })}</View>
						))}
					</ScrollView>

					{/* Deal Products */}
					<View style={styles.dealSection}>
						<Text style={styles.sectionTitle}>Deal Products</Text>
						{allProducts.products.length > 0 ? (
							<FlatList
								data={allProducts.products.slice(0, 6)} // Show first 6 products as deals
								renderItem={renderProductItem}
								keyExtractor={(item) => item._id}
								numColumns={2}
								scrollEnabled={false}
								showsVerticalScrollIndicator={false}
								columnWrapperStyle={{ justifyContent: "space-between" }}
								style={styles.productsGrid}
							/>
						) : (
							<EmptyOffersComponent />
						)}
					</View>

					{/* Weekly Specials */}
					<Text style={styles.sectionTitle}>Weekly Specials</Text>
					{allProducts.products.length > 0 ? (
						<FlatList
							data={allProducts.products.slice(6, 10)} // Show next 4 products as weekly specials
							renderItem={renderProductItem}
							keyExtractor={(item) => item._id}
							numColumns={2}
							scrollEnabled={false}
							showsVerticalScrollIndicator={false}
							columnWrapperStyle={{ justifyContent: "space-between" }}
							style={styles.productsGrid}
						/>
					) : (
						<EmptyOffersComponent />
					)}
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default OffersScreen;
