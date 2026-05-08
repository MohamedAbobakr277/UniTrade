import React, { useEffect, useState } from "react";
import { useTheme } from "../../constants/ThemeContext";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Keyboard
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import styles from "./my-favoriyes.styles";
import { ProductCard } from "../../components/ProductCard";

const PLACEHOLDER = "https://via.placeholder.com/150";
const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&q=80";

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h ago`;
  return `${Math.floor(diff / 1440)} d ago`;
}

interface UserMap {
  [uid: string]: { firstName?: string; profilePhoto?: string };
}

export default function MyFavorites() {
  const { theme } = useTheme();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [users, setUsers] = useState<UserMap>({});

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", uid), (snapshot) => {
      const data = snapshot.data();
      const ids = data?.favourites || [];
      setFavoriteIds(ids);
      loadProducts(ids);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map: UserMap = {};
      snap.docs.forEach((doc) => (map[doc.id] = doc.data() as UserMap[string]));
      setUsers(map);
    });
    return unsub;
  }, []);

  const loadProducts = (ids: string[]) => {
    if (!ids || ids.length === 0) {
      setFavorites([]);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const allProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: data.status
        };
      });

      const favProducts = allProducts.filter(
        item => ids.includes(item.id) && item.status !== "sold"
      );

      setFavorites(favProducts);
    });
    return unsubscribe;
  };

  const toggleFavorite = async (productId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      if (favoriteIds.includes(productId)) {
        await updateDoc(userRef, { favourites: arrayRemove(productId) });
      } else {
        await updateDoc(userRef, { favourites: arrayUnion(productId) });
        // Send notification
        const item = favorites.find((i) => i.id === productId);
        if (item && item.userId !== uid) {
          const myName = users[uid]?.firstName || "A user";
          await addDoc(collection(db, "users", item.userId, "notifications"), {
            type: "favorite",
            message: `${myName} added your item '${item.title}' to their favorites! ❤️`,
            link: `/product/${productId}`,
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const renderItem = ({ item }: any) => {
    const seller = users[item.userId];
    const isFav = favoriteIds.includes(item.id);

    return (
      <ProductCard
        item={item}
        theme={theme}
        isFavorite={isFav}
        onToggleFavorite={toggleFavorite}
        sellerName={seller?.firstName}
        sellerPhoto={seller?.profilePhoto}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        My Favorites
      </Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}