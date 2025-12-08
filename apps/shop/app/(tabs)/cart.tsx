// app/(tabs)/cart.tsx - Complete cart screen with ES6+ arrow functions
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeArea, Container } from "../../components/layout";
import { Button, Card } from "../../components/ui";
import { useTheme } from "../../hooks";
import { useCart } from "../../store";
import { CartItem } from "../../store/types/cart";

const CartScreen = () => {
	const { theme } = useTheme();
	const router = useRouter();
	const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart, isEmpty } = useCart();

	const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => {
		const handleQuantityChange = (change: number) => {
			const newQuantity = item.quantity + change;
			if (newQuantity > 0) {
				updateQuantity(item.productId, newQuantity);
			}
		};

		const handleRemove = () => {
			removeItem(item.productId);
		};

		return (
			<Animated.View entering={FadeInUp.delay(index * 100).springify()}>
				<Card style={styles.cartItem}>
					<View style={styles.itemHeader}>
						<Text style={styles.itemName} numberOfLines={2}>
							{item.name}
						</Text>
						<TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
							<Ionicons name="trash-outline" size={20} color={theme.palette.error.main} />
						</TouchableOpacity>
					</View>

					<View style={styles.itemDetails}>
						<Text style={styles.itemPrice}>
							${item.unitPrice.toFixed(2)} per {item.unitOfMeasure}
						</Text>
						<Text style={styles.itemStock}>{item.inStock ? "In Stock" : "Out of Stock"}</Text>
					</View>

					<View style={styles.quantityContainer}>
						<TouchableOpacity
							onPress={() => handleQuantityChange(-1)}
							style={styles.quantityButton}
							disabled={item.quantity <= 1}
						>
							<Ionicons
								name="remove"
								size={20}
								color={item.quantity <= 1 ? theme.palette.text.disabled : theme.palette.primary.main}
							/>
						</TouchableOpacity>

						<Text style={styles.quantity}>{item.quantity}</Text>

						<TouchableOpacity onPress={() => handleQuantityChange(1)} style={styles.quantityButton}>
							<Ionicons name="add" size={20} color={theme.palette.primary.main} />
						</TouchableOpacity>

						<Text style={styles.subtotal}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
					</View>
				</Card>
			</Animated.View>
		);
	};

	const EmptyCart = () => (
		<Animated.View entering={FadeInUp.springify()} style={styles.emptyState}>
			<Text style={styles.emptyIcon}>🛒</Text>
			<Text style={styles.emptyTitle}>Your Cart is Empty</Text>
			<Text style={styles.emptyDescription}>Add some items to your cart to get started shopping</Text>
		</Animated.View>
	);

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
		cartItem: {
			marginBottom: theme.spacing.md,
		},
		itemHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
			marginBottom: theme.spacing.sm,
		},
		itemName: {
			...theme.typography.subtitle1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			flex: 1,
			marginRight: theme.spacing.sm,
		},
		removeButton: {
			padding: theme.spacing.xs,
		},
		itemDetails: {
			marginBottom: theme.spacing.md,
		},
		itemPrice: {
			...theme.typography.body2,
			color: theme.palette.primary.main,
			fontWeight: "600",
		},
		itemStock: {
			...theme.typography.caption,
			color: theme.palette.text.secondary,
		},
		quantityContainer: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		quantityButton: {
			width: 36,
			height: 36,
			borderRadius: 18,
			backgroundColor: theme.palette.background.surface,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 1,
			borderColor: theme.palette.divider,
		},
		quantity: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
			minWidth: 40,
			textAlign: "center",
		},
		subtotal: {
			...theme.typography.h6,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		summary: {
			marginTop: theme.spacing.lg,
			paddingTop: theme.spacing.lg,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		summaryRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: theme.spacing.sm,
		},
		summaryLabel: {
			...theme.typography.body1,
			color: theme.palette.text.secondary,
		},
		summaryValue: {
			...theme.typography.body1,
			color: theme.palette.text.primary,
			fontWeight: "600",
		},
		totalRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: theme.spacing.md,
			paddingTop: theme.spacing.md,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
		},
		totalLabel: {
			...theme.typography.h5,
			color: theme.palette.text.primary,
			fontWeight: "700",
		},
		totalValue: {
			...theme.typography.h5,
			color: theme.palette.primary.main,
			fontWeight: "700",
		},
		actions: {
			marginTop: theme.spacing.xl,
		},
		clearButton: {
			marginTop: theme.spacing.md,
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
	});

	if (isEmpty) {
		return (
			<SafeArea>
				<Container>
					<View style={styles.header}>
						<Text style={styles.title}>Shopping Cart</Text>
					</View>
					<EmptyCart />
				</Container>
			</SafeArea>
		);
	}

	return (
		<SafeArea>
			<Container>
				<View style={styles.header}>
					<Text style={styles.title}>Shopping Cart</Text>
					<Text style={styles.subtitle}>
						{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
					</Text>
				</View>

				<FlatList
					data={items}
					renderItem={renderCartItem}
					keyExtractor={(item) => item.productId}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
				/>

				<Card style={styles.summary}>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Items ({totalItems})</Text>
						<Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
					</View>
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Delivery</Text>
						<Text style={styles.summaryValue}>Free</Text>
					</View>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Total</Text>
						<Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
					</View>

					<View style={styles.actions}>
						<Button
							title="Proceed to Checkout"
							variant="gradient"
							fullWidth
							onPress={() => router.push("/checkout")}
						/>
						<Button
							title="Clear Cart"
							variant="outlined"
							fullWidth
							onPress={clearCart}
							style={styles.clearButton}
						/>
					</View>
				</Card>
			</Container>
		</SafeArea>
	);
};

export default CartScreen;
