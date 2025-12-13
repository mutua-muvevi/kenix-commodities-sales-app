// app/(tabs)/offers.tsx - Polished Offers Screen (Competing with Twiga Foods & Wasoko)
import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	ScrollView,
	TouchableOpacity,
	Dimensions,
	Pressable,
} from "react-native";
import Animated, {
	FadeInUp,
	FadeInRight,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
	interpolate,
	Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeArea, Container } from "../../components/layout";
import { Card, SearchBar } from "../../components/ui";
import { ProductCard } from "../../components/product/ProductCard";
import { useTheme } from "../../hooks";
import { useProducts } from "../../store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const DEAL_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Offer {
	id: string;
	title: string;
	subtitle: string;
	icon: string;
	gradient: string[];
	discount?: string;
}

interface DealCategory {
	id: string;
	title: string;
	icon: string;
	color: string;
}

const OffersScreen = () => {
	const { theme } = useTheme();
	const { allProducts, fetchAllProducts, hasProducts } = useProducts();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const carouselProgress = useSharedValue(0);

	// Flash Sale carousel refs and state
	const flashSaleRef = useRef<FlatList>(null);
	const [flashSaleIndex, setFlashSaleIndex] = useState(0);

	// Weekly Specials carousel refs and state
	const weeklySpecialsRef = useRef<FlatList>(null);
	const [weeklySpecialsIndex, setWeeklySpecialsIndex] = useState(0);

	// Auto-scroll animation for carousel
	useEffect(() => {
		carouselProgress.value = withRepeat(
			withTiming(3, { duration: 12000 }),
			-1,
			false
		);
	}, []);

	// Fetch products on mount
	useEffect(() => {
		if (!hasProducts) {
			fetchAllProducts();
		}
	}, []);

	// Auto-scroll Flash Sale carousel
	useEffect(() => {
		const flashSaleProducts = allProducts.products.slice(0, 10);
		if (flashSaleProducts.length === 0) return;

		const interval = setInterval(() => {
			setFlashSaleIndex((prevIndex) => {
				const nextIndex = (prevIndex + 1) % flashSaleProducts.length;
				flashSaleRef.current?.scrollToIndex({
					index: nextIndex,
					animated: true,
				});
				return nextIndex;
			});
		}, 3000); // Auto-scroll every 3 seconds

		return () => clearInterval(interval);
	}, [allProducts.products]);

	// Auto-scroll Weekly Specials carousel
	useEffect(() => {
		const weeklyProducts = allProducts.products.slice(6, 16);
		if (weeklyProducts.length === 0) return;

		const interval = setInterval(() => {
			setWeeklySpecialsIndex((prevIndex) => {
				const nextIndex = (prevIndex + 1) % weeklyProducts.length;
				weeklySpecialsRef.current?.scrollToIndex({
					index: nextIndex,
					animated: true,
				});
				return nextIndex;
			});
		}, 3500); // Slightly different interval for variety

		return () => clearInterval(interval);
	}, [allProducts.products]);

	// Deal of the Day - changes daily
	const dealOfTheDay = allProducts.products[0];

	// Featured promotional banners with eye-catching gradients
	const featuredBanners = [
		{
			id: "1",
			title: "Flash Sale",
			subtitle: "Up to 50% off on selected items",
			icon: "flash",
			gradient: [theme.palette.error.main, theme.palette.error.dark],
			discount: "50%",
			expiresIn: "2h 45m",
		},
		{
			id: "2",
			title: "Bulk Discounts",
			subtitle: "Save more when you buy in bulk",
			icon: "cube",
			gradient: [theme.palette.success.main, theme.palette.success.dark],
			discount: "30%",
			expiresIn: "24h",
		},
		{
			id: "3",
			title: "New Arrivals",
			subtitle: "Fresh stock just delivered",
			icon: "sparkles",
			gradient: [theme.palette.info.main, theme.palette.info.dark],
			discount: "20%",
			expiresIn: "5d",
		},
	];

	// Deal categories with icons
	const dealCategories: DealCategory[] = [
		{
			id: "all",
			title: "All Deals",
			icon: "grid",
			color: theme.palette.primary.main,
		},
		{
			id: "flash",
			title: "Flash Sale",
			icon: "flash",
			color: theme.palette.error.main,
		},
		{
			id: "weekly",
			title: "Weekly",
			icon: "calendar",
			color: theme.palette.success.main,
		},
		{
			id: "bulk",
			title: "Bulk",
			icon: "cube",
			color: theme.palette.warning.main,
		},
	];

	const filteredProducts = allProducts.products.filter((product) =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const flashSaleProducts = filteredProducts.slice(0, 10);
	const weeklySpecials = filteredProducts.slice(6, 16);

	const styles = StyleSheet.create({
		scrollView: {
			flex: 1,
		},
		header: {
			paddingVertical: theme.spacing.lg,
		},
		title: {
			...theme.typography.h2,
			color: theme.palette.text.primary,
			fontWeight: "700",
			marginBottom: theme.spacing.xs,
		},
		subtitle: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
			marginBottom: theme.spacing.md,
		},
		// Carousel Banners
		carouselContainer: {
			marginBottom: theme.spacing.lg,
		},
		carouselScroll: {
			paddingHorizontal: theme.spacing.md,
		},
		bannerCard: {
			width: BANNER_WIDTH,
			height: 180,
			marginRight: theme.spacing.md,
			borderRadius: theme.borderRadius.lg,
			overflow: "hidden",
		},
		bannerGradient: {
			flex: 1,
			padding: theme.spacing.lg,
			justifyContent: "space-between",
		},
		bannerTop: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
		},
		bannerIconContainer: {
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: "rgba(255,255,255,0.2)",
			justifyContent: "center",
			alignItems: "center",
		},
		discountBadge: {
			backgroundColor: theme.palette.common.white,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.xl,
		},
		discountText: {
			...theme.typography.h6,
			color: theme.palette.error.main,
			fontWeight: "700",
		},
		bannerContent: {
			gap: theme.spacing.xs,
		},
		bannerTitle: {
			...theme.typography.h4,
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		bannerSubtitle: {
			...theme.typography.body1,
			color: "rgba(255,255,255,0.9)",
		},
		timerContainer: {
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.xs,
			marginTop: theme.spacing.xs,
		},
		timerText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "600",
		},
		// Deal of the Day
		dealOfDayContainer: {
			marginBottom: theme.spacing.lg,
		},
		dealOfDayCard: {
			marginHorizontal: theme.spacing.md,
			borderRadius: theme.borderRadius.lg,
			overflow: "hidden",
		},
		dealOfDayGradient: {
			padding: theme.spacing.lg,
		},
		dealOfDayHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			marginBottom: theme.spacing.md,
		},
		dealOfDayTitle: {
			...theme.typography.h5,
			color: theme.palette.common.white,
			fontWeight: "700",
			flex: 1,
		},
		dealOfDayBadge: {
			backgroundColor: theme.palette.warning.main,
			paddingHorizontal: theme.spacing.md,
			paddingVertical: theme.spacing.xs,
			borderRadius: theme.borderRadius.md,
		},
		dealOfDayBadgeText: {
			...theme.typography.caption,
			color: theme.palette.common.white,
			fontWeight: "700",
		},
		dealOfDayContent: {
			backgroundColor: theme.palette.background.paper,
			borderRadius: theme.borderRadius.md,
			padding: theme.spacing.md,
			flexDirection: "row",
			gap: theme.spacing.md,
			alignItems: "center",
		},
		dealOfDayImage: {
			width: 80,
			height: 80,
			borderRadius: theme.borderRadius.md,
			backgroundColor: theme.palette.grey[200],
		},
		dealOfDayInfo: {
			flex: 1,
		},
		dealOfDayProductName: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			marginBottom: theme.spacing.xs,
		},
		dealOfDayPrices: {
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.sm,
			marginBottom: theme.spacing.xs,
		},
		dealOfDayOriginalPrice: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textDecorationLine: "line-through",
		},
		dealOfDayPrice: {
			...theme.typography.h6,
			color: theme.palette.success.main,
			fontWeight: "700",
		},
		dealOfDaySavings: {
			...theme.typography.caption,
			color: theme.palette.success.main,
		},
		// Categories Filter
		categoriesContainer: {
			marginBottom: theme.spacing.lg,
		},
		categoriesScroll: {
			paddingHorizontal: theme.spacing.md,
		},
		categoryChip: {
			paddingHorizontal: theme.spacing.lg,
			paddingVertical: theme.spacing.sm,
			borderRadius: theme.borderRadius.xl,
			marginRight: theme.spacing.sm,
			borderWidth: 1.5,
			flexDirection: "row",
			alignItems: "center",
			gap: theme.spacing.xs,
		},
		categoryChipActive: {
			borderColor: "transparent",
		},
		categoryChipInactive: {
			backgroundColor: "transparent",
			borderColor: theme.palette.divider,
		},
		categoryChipText: {
			...theme.typography.body2,
			fontWeight: "600",
		},
		categoryChipTextActive: {
			color: theme.palette.common.white,
		},
		categoryChipTextInactive: {
			color: theme.palette.text.secondary,
		},
		// Section Headers
		sectionHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: theme.spacing.md,
			marginBottom: theme.spacing.md,
		},
		sectionTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		sectionViewAll: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		// Product Grid
		productsGrid: {
			paddingHorizontal: theme.spacing.md,
			paddingBottom: theme.spacing.lg,
		},
		productGridContent: {
			gap: theme.spacing.md,
		},
		// Empty State
		emptyState: {
			alignItems: "center",
			paddingVertical: theme.spacing.xxl,
			paddingHorizontal: theme.spacing.lg,
		},
		emptyIcon: {
			marginBottom: theme.spacing.lg,
		},
		emptyTitle: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			marginBottom: theme.spacing.sm,
			textAlign: "center",
		},
		emptyDescription: {
			...theme.typography.body2,
			color: theme.palette.text.secondary,
			textAlign: "center",
		},
		// Shimmer Loading
		shimmerContainer: {
			width: BANNER_WIDTH,
			height: 180,
			borderRadius: theme.borderRadius.lg,
			backgroundColor: theme.palette.background.neutral,
			overflow: "hidden",
		},
	});

	// Render promotional banner with countdown
	const renderBanner = ({ item, index }: { item: any; index: number }) => (
		<Animated.View
			entering={FadeInRight.delay(index * 100).springify()}
		>
			<Pressable
				style={({ pressed }) => [
					styles.bannerCard,
					{ opacity: pressed ? 0.9 : 1 },
				]}
			>
				<LinearGradient
					colors={item.gradient}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.bannerGradient}
				>
					<View style={styles.bannerTop}>
						<View style={styles.bannerIconContainer}>
							<Ionicons
								name={item.icon as any}
								size={28}
								color={theme.palette.common.white}
							/>
						</View>
						<View style={styles.discountBadge}>
							<Text style={styles.discountText}>{item.discount} OFF</Text>
						</View>
					</View>

					<View style={styles.bannerContent}>
						<Text style={styles.bannerTitle}>{item.title}</Text>
						<Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
						<View style={styles.timerContainer}>
							<Ionicons
								name="time-outline"
								size={14}
								color={theme.palette.common.white}
							/>
							<Text style={styles.timerText}>Ends in {item.expiresIn}</Text>
						</View>
					</View>
				</LinearGradient>
			</Pressable>
		</Animated.View>
	);

	// Render category filter chip
	const renderCategoryChip = (category: DealCategory) => {
		const isActive = selectedCategory === category.id;
		return (
			<Pressable
				key={category.id}
				onPress={() => setSelectedCategory(category.id)}
			>
				<LinearGradient
					colors={
						isActive
							? [category.color, category.color]
							: ["transparent", "transparent"]
					}
					style={[
						styles.categoryChip,
						isActive ? styles.categoryChipActive : styles.categoryChipInactive,
					]}
				>
					<Ionicons
						name={category.icon as any}
						size={16}
						color={
							isActive
								? theme.palette.common.white
								: theme.palette.text.secondary
						}
					/>
					<Text
						style={[
							styles.categoryChipText,
							isActive
								? styles.categoryChipTextActive
								: styles.categoryChipTextInactive,
						]}
					>
						{category.title}
					</Text>
				</LinearGradient>
			</Pressable>
		);
	};

	// Render product with discount badge
	const renderProductItem = ({ item, index }: { item: any; index: number }) => (
		<View style={{ position: "relative" }}>
			<ProductCard product={item} index={index} />
			{/* Discount Badge Overlay */}
			<View
				style={{
					position: "absolute",
					top: 8,
					left: 8,
					backgroundColor: theme.palette.error.main,
					paddingHorizontal: 8,
					paddingVertical: 4,
					borderRadius: theme.borderRadius.sm,
					flexDirection: "row",
					alignItems: "center",
					gap: 4,
				}}
			>
				<Ionicons name="flash" size={12} color={theme.palette.common.white} />
				<Text
					style={{
						...theme.typography.caption,
						color: theme.palette.common.white,
						fontWeight: "700",
						fontSize: 10,
					}}
				>
					{Math.floor(Math.random() * 30) + 20}% OFF
				</Text>
			</View>
		</View>
	);

	// Empty state component
	const EmptyOffersComponent = () => (
		<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
			<Ionicons
				name="gift-outline"
				size={80}
				color={theme.palette.grey[400]}
				style={styles.emptyIcon}
			/>
			<Text style={styles.emptyTitle}>No Offers Available</Text>
			<Text style={styles.emptyDescription}>
				Check back later for amazing deals and special offers! We're constantly
				updating our promotions.
			</Text>
		</Animated.View>
	);

	return (
		<SafeArea>
			<Container>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
				>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Special Offers</Text>
						<Text style={styles.subtitle}>
							Discover amazing deals and save more on your favorites
						</Text>
						<SearchBar
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search offers and deals..."
						/>
					</View>

					{/* Featured Banners Carousel */}
					<View style={styles.carouselContainer}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							snapToInterval={BANNER_WIDTH + 16}
							decelerationRate="fast"
							contentContainerStyle={styles.carouselScroll}
						>
							{featuredBanners.map((banner, index) =>
								renderBanner({ item: banner, index })
							)}
						</ScrollView>
					</View>

					{/* Deal of the Day */}
					{dealOfTheDay && (
						<Animated.View
							entering={FadeInDown.delay(200).springify()}
							style={styles.dealOfDayContainer}
						>
							<Card style={styles.dealOfDayCard} variant="elevated">
								<LinearGradient
									colors={[
										theme.palette.secondary.main,
										theme.palette.secondary.dark,
									]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.dealOfDayGradient}
								>
									<View style={styles.dealOfDayHeader}>
										<Ionicons
											name="trophy"
											size={24}
											color={theme.palette.common.white}
										/>
										<Text style={styles.dealOfDayTitle}>Deal of the Day</Text>
										<View style={styles.dealOfDayBadge}>
											<Text style={styles.dealOfDayBadgeText}>
												LIMITED
											</Text>
										</View>
									</View>

									<View style={styles.dealOfDayContent}>
										<View style={styles.dealOfDayImage}>
											<Ionicons
												name="cube"
												size={40}
												color={theme.palette.grey[400]}
											/>
										</View>
										<View style={styles.dealOfDayInfo}>
											<Text
												style={styles.dealOfDayProductName}
												numberOfLines={1}
											>
												{dealOfTheDay.name}
											</Text>
											<View style={styles.dealOfDayPrices}>
												<Text style={styles.dealOfDayOriginalPrice}>
													KES{" "}
													{(dealOfTheDay.unitPrice * 1.5).toLocaleString()}
												</Text>
												<Text style={styles.dealOfDayPrice}>
													KES {dealOfTheDay.unitPrice.toLocaleString()}
												</Text>
											</View>
											<Text style={styles.dealOfDaySavings}>
												Save KES{" "}
												{(dealOfTheDay.unitPrice * 0.5).toLocaleString()}
											</Text>
										</View>
									</View>
								</LinearGradient>
							</Card>
						</Animated.View>
					)}

					{/* Deal Categories Filter */}
					<Animated.View
						entering={FadeInUp.delay(300).springify()}
						style={styles.categoriesContainer}
					>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoriesScroll}
						>
							{dealCategories.map(renderCategoryChip)}
						</ScrollView>
					</Animated.View>

					{/* Flash Sale Section - Horizontal Carousel */}
					<Animated.View entering={FadeInUp.delay(400).springify()}>
						<View style={styles.sectionHeader}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
								<Ionicons
									name="flash"
									size={20}
									color={theme.palette.error.main}
								/>
								<Text style={styles.sectionTitle}>⚡ Flash Sale</Text>
							</View>
							<TouchableOpacity>
								<Text style={styles.sectionViewAll}>View All</Text>
							</TouchableOpacity>
						</View>

						{flashSaleProducts.length > 0 ? (
							<FlatList
								ref={flashSaleRef}
								data={flashSaleProducts}
								renderItem={({ item, index }) => (
									<View style={{ width: SCREEN_WIDTH * 0.42, marginRight: 12 }}>
										<ProductCard product={item} index={index} />
									</View>
								)}
								keyExtractor={(item) => `flash-${item._id}`}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ paddingHorizontal: 12 }}
								snapToInterval={SCREEN_WIDTH * 0.42 + 12}
								decelerationRate="fast"
								pagingEnabled={false}
								onScrollToIndexFailed={(info) => {
									setTimeout(() => {
										flashSaleRef.current?.scrollToIndex({
											index: info.index,
											animated: true,
										});
									}, 100);
								}}
							/>
						) : (
							<EmptyOffersComponent />
						)}
					</Animated.View>

					{/* Weekly Specials Section - Horizontal Carousel */}
					<Animated.View entering={FadeInUp.delay(500).springify()}>
						<View style={styles.sectionHeader}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
								<Ionicons
									name="calendar"
									size={20}
									color={theme.palette.success.main}
								/>
								<Text style={styles.sectionTitle}>📅 Weekly Specials</Text>
							</View>
							<TouchableOpacity>
								<Text style={styles.sectionViewAll}>View All</Text>
							</TouchableOpacity>
						</View>

						{weeklySpecials.length > 0 ? (
							<FlatList
								ref={weeklySpecialsRef}
								data={weeklySpecials}
								renderItem={({ item, index }) => (
									<View style={{ width: SCREEN_WIDTH * 0.42, marginRight: 12 }}>
										<ProductCard product={item} index={index} />
									</View>
								)}
								keyExtractor={(item) => `weekly-${item._id}`}
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ paddingHorizontal: 12 }}
								snapToInterval={SCREEN_WIDTH * 0.42 + 12}
								decelerationRate="fast"
								pagingEnabled={false}
								onScrollToIndexFailed={(info) => {
									setTimeout(() => {
										weeklySpecialsRef.current?.scrollToIndex({
											index: info.index,
											animated: true,
										});
									}, 100);
								}}
							/>
						) : (
							<EmptyOffersComponent />
						)}
					</Animated.View>

					{/* Bottom Padding */}
					<View style={{ height: theme.spacing.xl }} />
				</ScrollView>
			</Container>
		</SafeArea>
	);
};

export default OffersScreen;
