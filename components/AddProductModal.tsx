import { Button, Input } from "@/components";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({
  visible,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!imageUrl.trim()) newErrors.imageUrl = "Product image is required";
    if (!description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const fileExt = file.uri.split(".").pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, decode(file.base64!), {
          contentType: file.type ?? "image/jpeg",
        });

      if (uploadError) {
        Alert.alert("Upload Error", uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.from("products").insert({
        name,
        price: parseFloat(price),
        image_url: imageUrl,
        description,
      });

      if (error) throw error;

      setName("");
      setPrice("");
      setImageUrl("");
      setDescription("");
      setErrors({});

      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Product</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Input
              label="Product Name"
              placeholder="Enter product name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              fullWidth
            />

            <Input
              label="Price"
              placeholder="Enter price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              error={errors.price}
              fullWidth
            />

            <TouchableOpacity onPress={handleImagePick} style={styles.imageUploadButton}>
              <Text style={styles.imageUploadText}>
                {imageUrl ? "Change Image" : "Pick Image"}
              </Text>
            </TouchableOpacity>

            {imageUrl ? (
              <Image src={imageUrl} style={styles.previewImage} />
            ) : null}

            {errors.imageUrl ? (
              <Text style={{ color: Colors.light.error, marginBottom: 8 }}>{errors.imageUrl}</Text>
            ) : null}

            <Input
              label="Description"
              placeholder="Enter product description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              error={errors.description}
              style={styles.textArea}
              fullWidth
            />

            <Button
              title="Add Product"
              onPress={handleSubmit}
              isLoading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    width: "100%",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 16,
  },
  imageUploadButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  imageUploadText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
});
