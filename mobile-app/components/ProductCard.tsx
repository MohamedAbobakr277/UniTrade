import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Stars } from "./Stars";
import { useSellerRating } from "../app/services/rating";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  university: string;
  condition: string;
  userId: string;
  status?: string;
  quantityAvailable?: number;
  createdAt?: any;
}

interface ProductCardProps {
  item: Product;
  theme: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  sellerName?: string;
  sellerPhoto?: string;
  showManagement?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (item: any) => void;
}

const PLACEHOLDER = "https://via.placeholder.com/150";
const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&q=80";

function timeAgo(date: any): string {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h ago`;
  return `${Math.floor(diff / 1440)} d ago`;
}

export const ProductCard = ({
  item,
  theme,
  isFavorite,
  onToggleFavorite,
  sellerName,
  sellerPhoto,
  showManagement = false,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductCardProps) => {
  const router = useRouter();
  const { rating: sellerRating } = useSellerRating(item.userId);

  const imageUri = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : PLACEHOLDER;
  const isSoldOut = item.status === "sold" || item.quantityAvailable === 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={[styles.image, isSoldOut && { opacity: 0.6 }]} />
        {isSoldOut ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        ) : item.condition ? (
          <View
            style={[
              styles.conditionBadge,
              {
                backgroundColor:
                  item.condition === "New"
                    ? "#dcfce7"
                    : item.condition === "Like New"
                    ? "#dbeafe"
                    : item.condition === "Good"
                    ? "#fef9c3"
                    : item.condition === "Fair"
                    ? "#fee2e2"
                    : "#fce7f3",
              },
            ]}
          >
            <Text
              style={[
                styles.conditionText,
                {
                  color:
                    item.condition === "New"
                      ? "#166534"
                      : item.condition === "Like New"
                      ? "#1e40af"
                      : item.condition === "Good"
                      ? "#854d0e"
                      : item.condition === "Fair"
                      ? "#991b1b"
                      : "#9d174d",
                },
              ]}
            >
              {item.condition}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={[styles.favBtn, isFavorite && styles.favBtnActive]}
          onPress={() => onToggleFavorite(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name="heart"
            size={16}
            color={isFavorite ? "#ef4444" : "#fff"}
            style={isFavorite ? { opacity: 1 } : { opacity: 0.85 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price} EGP</Text>
          {sellerRating.count > 0 && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>{sellerRating.average.toFixed(1)}</Text>
              <Text style={styles.starSmall}>★</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.university} numberOfLines={1}>
          {item.university}
        </Text>

        {item.quantityAvailable !== undefined && item.quantityAvailable > 0 && !isSoldOut && (
          <Text style={[
            styles.stockText,
            { color: item.quantityAvailable < 5 ? "#d97706" : "#16a34a" }
          ]}>
            {item.quantityAvailable} in stock
          </Text>
        )}

        {!showManagement && (
          <View style={styles.sellerRow}>
            <View style={styles.sellerInfo}>
              <Image source={{ uri: sellerPhoto || AVATAR_PLACEHOLDER }} style={styles.avatar} />
              <Text style={[styles.sellerName, { color: theme.text }]} numberOfLines={1}>
                {sellerName || "Unknown"}
              </Text>
            </View>
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>
        )}

        {showManagement && (
          <View style={styles.mgmtRow}>
            <View style={styles.mgmtActions}>
              <TouchableOpacity
                style={[styles.mgmtBtn, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}
                onPress={() => onEdit?.(item.id)}
              >
                <Feather name="edit-3" size={12} color="#2563eb" />
                <Text style={[styles.mgmtBtnText, { color: "#2563eb" }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mgmtBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}
                onPress={() => onDelete?.(item.id)}
              >
                <Feather name="trash-2" size={12} color="#ef4444" />
                <Text style={[styles.mgmtBtnText, { color: "#ef4444" }]}>Delete</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.statusToggle,
                item.status === "sold" ? styles.statusToggleActive : { borderColor: "#e2e8f0" }
              ]}
              onPress={() => onToggleStatus?.(item)}
            >
              <Feather
                name={item.status === "sold" ? "check-circle" : "circle"}
                size={13}
                color={item.status === "sold" ? "#fff" : "#94a3b8"}
              />
              <Text style={[styles.statusToggleText, { color: item.status === "sold" ? "#fff" : "#64748b" }]}>
                {item.status === "sold" ? "Sold Out" : "Mark Sold"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  soldOutBadge: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  conditionBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: "800",
  },
  favBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  cardBody: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563eb",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#d97706",
  },
  starSmall: {
    fontSize: 10,
    color: "#d97706",
    marginLeft: 1,
  },
  university: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  timeText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  mgmtRow: {
    marginTop: 8,
    gap: 8,
  },
  mgmtActions: {
    flexDirection: "row",
    gap: 6,
  },
  mgmtBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  mgmtBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  statusToggleActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
