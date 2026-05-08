import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "../../constants/ThemeContext";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import BottomNav from "../../components/BottomNav";
import { ProductCard } from "../../components/ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  university: string;
  condition: string;
  category: string;
  userId: string;
  status?: string;
  createdAt?: { toDate: () => Date };
  quantityAvailable?: number;
}

interface UserMap {
  [uid: string]: { firstName?: string; profilePhoto?: string };
}

const RECENT_SEARCHES_KEY = "marketplace_recent_searches";
const MAX_RECENT = 8;

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} h ago`;
  return `${Math.floor(diff / 1440)} d ago`;
}

const PLACEHOLDER = "https://via.placeholder.com/150";
const AVATAR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&q=80";

const CATEGORIES = [
  { name: "All", icon: "home", color: "#2563eb", bg: "#dbeafe" },
  { name: "Books & Notes", icon: "book", color: "#d97706", bg: "#fef3c7" },
  { name: "Calculators", icon: "hash", color: "#16a34a", bg: "#dcfce7" },
  { name: "Electronics", icon: "headphones", color: "#0891b2", bg: "#cffafe" },
  { name: "Engineering Tools", icon: "tool", color: "#ea580c", bg: "#ffedd5" },
  { name: "Medical Tools", icon: "plus-square", color: "#0284c7", bg: "#e0f2fe" },
  { name: "Lab Equipment", icon: "activity", color: "#65a30d", bg: "#ecfccb" },
  { name: "Stationery", icon: "edit-3", color: "#c026d3", bg: "#fae8ff" },
  { name: "Bags & Accessories", icon: "briefcase", color: "#b45309", bg: "#fef9c3" },
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const ALL_UNIVERSITIES = [
  "Cairo University", "Ain Shams University", "Alexandria University",
  "Mansoura University", "Assiut University", "Helwan University",
  "Tanta University", "Zagazig University", "Suez Canal University",
  "Al-Azhar University", "German University in Cairo",
  "British University in Egypt", "October 6 University",
  "Future University in Egypt", "AASTMT", "Nile University",
  "Misr International University", "MSA University", "Pharos University",
  "Sohag University", "Beni-Suef University", "Fayoum University",
  "South Valley University", "Kafr El Sheikh University",
  "Damanhour University", "Others",
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [items, setItems] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [filterVisible, setFilterVisible] = useState(false);
  const [timeSort, setTimeSort] = useState(""); // newest, oldest
  const [priceSort, setPriceSort] = useState(""); // low-high, high-low
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const sheetY = useRef(new Animated.Value(0)).current;

  /* ── Load recent searches from storage ── */
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((raw) => {
      if (raw) setRecentSearches(JSON.parse(raw));
    });
  }, []);

  /* ── Save a new search term to recent ── */
  const saveRecentSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Remove one recent search ── */
  const removeRecentSearch = useCallback(async (term: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== term);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Clear all recent searches ── */
  const clearAllRecent = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: Animated.event([null, { dy: sheetY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 150) {
          Animated.timing(sheetY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setFilterVisible(false);
            sheetY.setValue(0);
          });
        } else {
          Animated.spring(sheetY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, "id">) }))
        .filter((item) => item.status !== "sold" && item.quantityAvailable !== 0);
      setItems(data);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map: UserMap = {};
      snap.docs.forEach((doc) => (map[doc.id] = doc.data() as UserMap[string]));
      setUsers(map);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) setFavorites(snap.data().favourites || []);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "notifications"),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });
    return unsub;
  }, []);

  /* ── Build live suggestions ── */
  useEffect(() => {
    const q = search.trim().toLowerCase();

    // No text → show recent searches when focused
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const seen = new Set<string>();
    const results: string[] = [];

    for (const item of items) {
      const title = item.title?.trim();
      if (!title) continue;
      const lower = title.toLowerCase();
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower);
        results.push(title);
        if (results.length >= 7) break;
      }
    }

    for (const cat of CATEGORIES) {
      if (cat.name === "All") continue;
      const lower = cat.name.toLowerCase();
      if (lower.includes(q) && !seen.has(lower)) {
        seen.add(lower);
        results.push(cat.name);
        if (results.length >= 8) break;
      }
    }

    setSuggestions(results);
  }, [search, items]);

  /* ── What to show in dropdown ── */
  const dropdownMode: "recent" | "suggestions" | "none" =
    !isFocused
      ? "none"
      : search.trim().length < 2
        ? recentSearches.length > 0
          ? "recent"
          : "none"
        : suggestions.length > 0
          ? "suggestions"
          : "none";

  const toggleFavorite = async (productId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      if (favorites.includes(productId)) {
        await updateDoc(userRef, { favourites: arrayRemove(productId) });
      } else {
        await updateDoc(userRef, { favourites: arrayUnion(productId) });
        // Send notification
        const item = items.find((i) => i.id === productId);
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

  const commitSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearch(trimmed);
    setSubmittedSearch(trimmed);
    setIsFocused(false);
    saveRecentSearch(trimmed);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setSearch("");
    setSubmittedSearch("");
    setSuggestions([]);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedCondition("");
    setSelectedUniversity("");
    setTimeSort("");
    setPriceSort("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSubmittedSearch("");
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 180);
  };

  const universities = [
    ...new Set([
      ...ALL_UNIVERSITIES,
      ...items.map((i) => i.university).filter(Boolean),
    ]),
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesCondition = !selectedCondition || item.condition === selectedCondition;
    const matchesUni = !selectedUniversity || item.university === selectedUniversity;
    const matchesSearch = !submittedSearch ||
      item.title.toLowerCase().includes(submittedSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(submittedSearch.toLowerCase());

    return matchesCategory && matchesCondition && matchesUni && matchesSearch;
  }).sort((a, b) => {
    const getT = (val: any) => {
      if (!val) return 0;
      if (val.toDate) return val.toDate().getTime();
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'number') return val;
      const d = new Date(val);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    let priceRes = 0;
    if (priceSort === "low-high") priceRes = a.price - b.price;
    else if (priceSort === "high-low") priceRes = b.price - a.price;

    let timeRes = 0;
    const tA = getT(a.createdAt);
    const tB = getT(b.createdAt);
    if (timeSort === "newest") timeRes = tB - tA;
    else if (timeSort === "oldest") timeRes = tA - tB;

    if (priceSort && timeSort) {
      return priceRes !== 0 ? priceRes : timeRes;
    }
    return priceRes || timeRes || 0;
  });

  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedCondition !== "",
    selectedUniversity !== "",
    timeSort !== "",
    priceSort !== "",
  ].filter(Boolean).length;

  /* Highlight matching part */
  const HighlightedText = ({
    text,
    query,
  }: {
    text: string;
    query: string;
  }) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <Text style={s.suggestionText}>{text}</Text>;
    return (
      <Text style={s.suggestionText}>
        {text.slice(0, idx)}
        <Text style={s.suggestionBold}>
          {text.slice(idx, idx + query.length)}
        </Text>
        {text.slice(idx + query.length)}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: Product }) => {
    const seller = users[item.userId];
    const isFav = favorites.includes(item.id);

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
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[s.header, { justifyContent: "space-between", alignItems: "center", flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={s.logo}
          />
          <Text style={[s.headerTitle, { color: theme.text }]}>UniTrade</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/notifications/notifications")}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="bell" size={20} color={theme.text} />
          {unreadCount > 0 && (
            <View style={{ position: "absolute", top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444", borderWidth: 1.5, borderColor: theme.card }} />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={s.searchSection}>
        <View
          style={[
            s.searchBox,
            { backgroundColor: theme.card },
            isFocused && s.searchBoxFocused,
            isFocused &&
            dropdownMode !== "none" &&
            s.searchBoxFocusedWithDropdown,
          ]}
        >
          {isFocused ? (
            <TouchableOpacity
              onPress={() => {
                setIsFocused(false);
                Keyboard.dismiss();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="arrow-left" size={18} color="#334155" />
            </TouchableOpacity>
          ) : (
            <Feather name="search" size={17} color="#94a3b8" />
          )}

          <TextInput
            ref={inputRef}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            style={[s.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              if (!t.trim()) setSubmittedSearch("");
            }}
            returnKeyType="search"
            onSubmitEditing={() => commitSearch(search)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={s.clearBtn}>
              <Feather name="x" size={14} color="#64748b" />
            </TouchableOpacity>
          )}

          <View style={s.divider} />

          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={s.filterBtnWrap}
          >
            <Feather name="sliders" size={17} color="#2563eb" />
            {activeFiltersCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Dropdown: Recent OR Suggestions ── */}
        {dropdownMode !== "none" && (
          <View style={[s.dropdown, { backgroundColor: theme.card }]}>

            {/* Recent searches */}
            {dropdownMode === "recent" && (
              <>
                <View style={s.dropdownHeader}>
                  <Text style={[s.dropdownHeaderText, { color: theme.text }]}>
                    Recent searches
                  </Text>
                  <TouchableOpacity onPress={clearAllRecent}>
                    <Text style={s.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((term, i) => (
                  <TouchableOpacity
                    key={term}
                    style={[
                      s.suggestionRow,
                      i < recentSearches.length - 1 && s.suggestionBorder,
                    ]}
                    onPress={() => commitSearch(term)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="clock"
                      size={14}
                      color="#94a3b8"
                      style={s.sugIcon}
                    />
                    <Text
                      style={[s.suggestionText, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {term}
                    </Text>
                    {/* Fill input */}
                    <TouchableOpacity
                      onPress={() => {
                        setSearch(term);
                        inputRef.current?.focus();
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={s.arrowUpLeft}
                    >
                      <Feather name="arrow-up-left" size={15} color="#94a3b8" />
                    </TouchableOpacity>
                    {/* Remove single */}
                    <TouchableOpacity
                      onPress={() => removeRecentSearch(term)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={s.removeBtn}
                    >
                      <Feather name="x" size={13} color="#cbd5e1" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Live suggestions */}
            {dropdownMode === "suggestions" &&
              suggestions.map((sug, i) => (
                <TouchableOpacity
                  key={sug}
                  style={[
                    s.suggestionRow,
                    i < suggestions.length - 1 && s.suggestionBorder,
                  ]}
                  onPress={() => commitSearch(sug)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="search"
                    size={14}
                    color="#94a3b8"
                    style={s.sugIcon}
                  />
                  <HighlightedText text={sug} query={search} />
                  <TouchableOpacity
                    onPress={() => {
                      setSearch(sug);
                      inputRef.current?.focus();
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={s.arrowUpLeft}
                  >
                    <Feather name="arrow-up-left" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* ── Active search chip ── */}
      {submittedSearch.length > 0 && !isFocused && (
        <View style={s.activeSearchRow}>
          <View style={s.activeSearchChip}>
            <Feather name="search" size={12} color="#1d4ed8" />
            <Text style={s.activeSearchText} numberOfLines={1}>
              "{submittedSearch}"
            </Text>
            <TouchableOpacity
              onPress={clearSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={12} color="#1d4ed8" />
            </TouchableOpacity>
          </View>
          <Text style={s.resultsCountText}>
            {filteredItems.length} result
            {filteredItems.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Categories */}
      {!isFocused && (
        <View style={{ height: 60 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catList}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setSelectedCategory(cat.name)}
                  style={[s.catItem, active && s.catItemActive]}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={cat.icon as any}
                    size={15}
                    color={active ? "#fff" : "#334155"}
                  />
                  <Text style={[s.catText, active && s.catTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {!submittedSearch && !isFocused && (
        <View style={s.resultsRow}>
          <Text style={s.resultsCountText}>
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Product grid */}
      {!isFocused && (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={s.columnWrapper}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <View style={s.emptyIconCircle}>
                <Feather
                  name={submittedSearch ? "search" : "inbox"}
                  size={28}
                  color="#94a3b8"
                />
              </View>
              <Text style={[s.emptyTitle, { color: theme.text }]}>
                {submittedSearch ? "No results found" : "No products found"}
              </Text>
              <Text style={s.emptySubtitle}>
                {submittedSearch
                  ? `No items matched "${submittedSearch}"`
                  : "Try adjusting your filters to see more"}
              </Text>
              {submittedSearch ? (
                <TouchableOpacity onPress={clearSearch} style={s.emptyBtn}>
                  <Text style={s.emptyBtnText}>Clear search</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}

      {/* Filter bottom sheet */}
      <Modal 
        visible={filterVisible} 
        transparent 
        animationType="fade"
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
        <View style={s.backdrop}>
          <Animated.View
            style={[
              s.sheet,
              { backgroundColor: theme.card },
              {
                transform: [
                  {
                    translateY: sheetY.interpolate({
                      inputRange: [0, 600],
                      outputRange: [0, 600],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
            <View style={[s.sheetHandle, { backgroundColor: "#e2e8f0" }]} />

            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Feather name="x" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[s.filterLabel, { color: "#64748b" }]}>
              University
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              {universities.map((uni) => (
                <TouchableOpacity
                  key={uni}
                  onPress={() =>
                    setSelectedUniversity(
                      uni === selectedUniversity ? "" : uni
                    )
                  }
                  style={[
                    s.chip,
                    s.chipBlue,
                    selectedUniversity === uni && s.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      s.chipText,
                      selectedUniversity === uni && s.chipTextSelected,
                    ]}
                  >
                    {uni}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[s.filterLabel, { color: "#64748b" }]}>Condition</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  onPress={() =>
                    setSelectedCondition(
                      cond === selectedCondition ? "" : cond
                    )
                  }
                  style={[
                    s.chip,
                    s.chipGreen,
                    selectedCondition === cond && s.chipSelectedGreen,
                  ]}
                >
                  <Text
                    style={[
                      s.chipTextGreen,
                      selectedCondition === cond && s.chipTextSelectedGreen,
                    ]}
                  >
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[s.filterLabel, { color: "#64748b" }]}>
              Price Range (EGP)
            </Text>
            <View style={s.priceRow}>
              <TextInput
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min"
                placeholderTextColor="#94a3b8"
                style={[
                  s.priceInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                  },
                ]}
              />
              <Text style={{ color: "#94a3b8", paddingHorizontal: 8 }}>—</Text>
              <TextInput
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max"
                placeholderTextColor="#94a3b8"
                style={[
                  s.priceInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <Text style={[s.filterLabel, { color: "#64748b" }]}>Time Sort</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              {["newest", "oldest"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setTimeSort(timeSort === opt ? "" : opt)}
                  style={[
                    s.chip,
                    s.chipBlue,
                    timeSort === opt && s.chipSelected,
                  ]}
                >
                  <Text style={[s.chipText, timeSort === opt && s.chipTextSelected]}>
                    {opt === "newest" ? "Newest" : "Oldest"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[s.filterLabel, { color: "#64748b" }]}>Price Sort</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {["low-high", "high-low"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setPriceSort(priceSort === opt ? "" : opt)}
                  style={[
                    s.chip,
                    s.chipBlue,
                    priceSort === opt && s.chipSelected,
                  ]}
                >
                  <Text style={[s.chipText, priceSort === opt && s.chipTextSelected]}>
                    {opt === "low-high" ? "Low to High" : "High to Low"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.sheetActions}>
              <TouchableOpacity onPress={resetFilters} style={s.resetBtn}>
                <Text style={s.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterVisible(false)}
                style={s.applyBtn}
              >
                <Text style={s.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  logo: { width: 36, height: 36, resizeMode: "contain" },

  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    zIndex: 100,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  searchBoxFocused: {
    borderColor: "#2563eb",
  },
  searchBoxFocusedWithDropdown: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { width: 1, height: 18, backgroundColor: "#e2e8f0" },
  filterBtnWrap: { paddingLeft: 2, position: "relative" },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 8, fontWeight: "700" },

  /* Dropdown */
  dropdown: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "#2563eb",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#64748b",
  },
  clearAllText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sugIcon: { marginRight: 10 },
  suggestionText: { flex: 1, fontSize: 14, color: "#334155" },
  suggestionBold: { fontWeight: "700", color: "#0f172a" },
  arrowUpLeft: { paddingLeft: 6 },
  removeBtn: { paddingLeft: 8 },

  /* Active chip */
  activeSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 1,
  },
  activeSearchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: "68%",
  },
  activeSearchText: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  resultsRow: { paddingHorizontal: 16, paddingBottom: 4, zIndex: 1 },
  resultsCountText: { color: "#64748b", fontSize: 13, fontWeight: "500" },

  catList: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  catItemActive: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  catText: { fontSize: 13, color: "#334155", fontWeight: "600" },
  catTextActive: { color: "#fff" },

  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: { position: "relative" },
  image: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  conditionBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  soldOutBadge: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: { color: "#fff", fontSize: 14, fontWeight: "800", textTransform: "uppercase" },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: { backgroundColor: "rgba(255,255,255,0.85)" },
  cardBody: { padding: 10 },
  itemTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  price: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginBottom: 2 },
  university: { fontSize: 12, color: "#94a3b8", marginBottom: 6 },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 20, height: 20, borderRadius: 10, marginRight: 5 },
  sellerName: { fontSize: 12, flex: 1 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  timeText: { fontSize: 11, color: "#94a3b8" },
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  listContent: { paddingBottom: 100 },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 64,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2563eb",
  },
  emptyBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },

  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipBlue: { borderColor: "#bfdbfe", backgroundColor: "#eff6ff" },
  chipSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { color: "#2563eb", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff" },
  chipGreen: { borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" },
  chipSelectedGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipTextGreen: { color: "#16a34a", fontSize: 13, fontWeight: "500" },
  chipTextSelectedGreen: { color: "#fff" },
  priceRow: { flexDirection: "row", alignItems: "center" },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    alignItems: "center",
  },
  resetText: { color: "#2563eb", fontWeight: "600", fontSize: 15 },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  applyText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});