import Button from "@/components/Button";
import Input from "@/components/Input";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/providers/CartProvider";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function CheckoutScreen() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert("Error", "You must be logged in to place an order");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: getTotal(),
          shipping_address: `${address}, ${city}, ${postalCode}`,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Success
      setIsSuccess(true);
      clearCart();
      
      // Reset form
      setAddress("");
      setCity("");
      setPostalCode("");
      setErrors({});
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 size={64} color={Colors.light.success} />
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successText}>
          Your order has been successfully placed and is being processed.
        </Text>
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          style={styles.continueButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Checkout</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {items.map(item => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                ₦{(item.product.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₦{getTotal().toLocaleString()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <View style={styles.card}>
          <Input
            label="Address"
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            fullWidth
          />
          
          <Input
            label="City"
            placeholder="Enter your city"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            fullWidth
          />
          
          <Input
            label="Postal Code"
            placeholder="Enter your postal code"
            value={postalCode}
            onChangeText={setPostalCode}
            error={errors.postalCode}
            fullWidth
          />
        </View>
      </View>
      
      <Button
        title="Place Order"
        onPress={handlePlaceOrder}
        isLoading={isLoading}
        fullWidth
        style={styles.placeOrderButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.light.text,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  placeOrderButton: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 32,
  },
  continueButton: {
    width: "80%",
  },
});