import colors from "@/constants/colors";
import { useCart } from "@/providers/CartProvider";
import { Product } from "@/types";
import { Minus, Plus, ShoppingCart } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  product: Product;
  inCart?: boolean;
}

export default function ProductCard({ product, inCart = false }: ProductCardProps) {
  const { addToCart, removeFromCart, updateQuantity, items } = useCart();
  
  const cartItem = items.find(item => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: product.image_url }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
        
        {inCart ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={handleDecreaseQuantity}
            >
              <Minus size={16} color={colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={handleIncreaseQuantity}
            >
              <Plus size={16} color={colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={handleRemoveFromCart}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color="#fff" />
            <Text style={styles.addButtonText}>
              {quantity > 0 ? `Add more (${quantity})` : "Add to cart"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    //backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.light.text,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.light.primary,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#F3F4F6",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    marginLeft: "auto",
  },
  removeText: {
    color: colors.light.error,
    fontWeight: "500",
  },
});