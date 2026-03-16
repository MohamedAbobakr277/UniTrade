import React, { useEffect, useState } from "react";
import { useTheme } from "../../constants/ThemeContext";
import {
View,
Text,
FlatList,
Image,
TouchableOpacity,
TextInput,
ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
collection,
onSnapshot,
query,
where,
addDoc,
deleteDoc,
getDocs
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import BottomNav from "../../components/BottomNav";
import styles from "./home.styles";

export default function HomeScreen(){

const router = useRouter();

const { theme } = useTheme();

const [search,setSearch] = useState("");
const [items,setItems] = useState<any[]>([]);
const [favorites,setFavorites] = useState<string[]>([]);
const [users,setUsers] = useState<any>({});
const [selectedCategory,setSelectedCategory] = useState("All");

/* ================= GET PRODUCTS ================= */

useEffect(()=>{

const unsubscribe = onSnapshot(collection(db,"products"),(snapshot)=>{

const data = snapshot.docs
.map(doc=>({
id:doc.id,
...doc.data()
}))
.filter((item:any)=>!item.sold);

setItems(data);

});

return unsubscribe;

},[]);

/* ================= GET USERS ================= */

useEffect(()=>{

const unsubscribe = onSnapshot(collection(db,"users"),(snapshot)=>{

const data:any = {};

snapshot.docs.forEach(doc=>{
data[doc.id] = doc.data();
});

setUsers(data);

});

return unsubscribe;

},[]);

/* ================= LOAD FAVORITES ================= */

useEffect(()=>{

const loadFavorites = async()=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

const q = query(
collection(db,"favorites"),
where("userId","==",uid)
);

const snapshot = await getDocs(q);

const favIds = snapshot.docs.map(doc=>doc.data().productId);

setFavorites(favIds);

};

loadFavorites();

},[]);

/* ================= TOGGLE FAVORITE ================= */

const toggleFavorite = async(productId:string)=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

const q = query(
collection(db,"favorites"),
where("userId","==",uid),
where("productId","==",productId)
);

const snapshot = await getDocs(q);

if(snapshot.empty){

await addDoc(collection(db,"favorites"),{
userId:uid,
productId
});

setFavorites([...favorites,productId]);

}else{

snapshot.forEach(async(docItem)=>{
await deleteDoc(docItem.ref);
});

setFavorites(favorites.filter(id=>id!==productId));

}

};

/* ================= CATEGORIES ================= */

const categories = [
{ name:"All", icon:"home" },

{ name:"Books & Notes", icon:"book" },

{ name:"Calculators", icon:"hash" },

{ name:"Laptops & Tablets", icon:"monitor" },

{ name:"Electronics", icon:"headphones" },

{ name:"Engineering Tools", icon:"tool" },

{ name:"Medical Tools", icon:"plus-square" },

{ name:"Lab Equipment", icon:"activity" },

{ name:"Stationery", icon:"edit-3" },

{ name:"Bags & Accessories", icon:"briefcase" },

{ name:"Furniture", icon:"box" }
];

/* ================= FILTER ================= */

const filteredItems = items.filter(item=>{

const matchSearch =
item.title?.toLowerCase().includes(search.toLowerCase());

const matchCategory =
selectedCategory==="All" ||
item.category===selectedCategory;

return matchSearch && matchCategory;

});

/* ================= PRODUCT CARD ================= */

const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

const sellerName = users[item.userId]?.firstName || "Unknown";

const sellerPhoto =
users[item.userId]?.profilePhoto ||
"https://images.unsplash.com/photo-1633332755192-727a05c4013d";

const createdAt = item.createdAt?.toDate?.();

let timeText = "";

if(createdAt){

const now = new Date();

const diff = Math.floor(
(now.getTime() - createdAt.getTime()) / 60000
);

if(diff < 60){
timeText = `${diff} min ago`;
}else if(diff < 1440){
timeText = `${Math.floor(diff/60)} h ago`;
}else{
timeText = `${Math.floor(diff/1440)} d ago`;
}

}

const isFav = favorites.includes(item.id);

return(

<TouchableOpacity
style={[styles.card,{backgroundColor:theme.card}]}
onPress={()=>router.push({
pathname:"/product/[id]",
params:{id:item.id}
})}
>

<View>

<Image
source={{uri:imageUrl}}
style={styles.image}
/>

<TouchableOpacity
style={styles.favoriteBtn}
onPress={()=>toggleFavorite(item.id)}
>

<Feather
name="heart"
size={18}
color={isFav ? "red" : "white"}
/>

</TouchableOpacity>

</View>

<View style={styles.cardContent}>

<Text style={[styles.title,{color:theme.text}]} numberOfLines={1}>
{item.title}
</Text>

<Text style={styles.price}>
{item.price} EGP
</Text>

<Text style={styles.meta}>
{item.university}
</Text>

<Text style={styles.meta}>
{item.condition}
</Text>

<View style={styles.sellerRow}>

<View style={{flexDirection:"row",alignItems:"center"}}>

<Image
source={{uri:sellerPhoto}}
style={styles.sellerImage}
/>

<Text style={[styles.sellerName,{color:theme.text}]}>
{sellerName}
</Text>

</View>

<View style={{flexDirection:"row",alignItems:"center"}}>

<Feather name="clock" size={14} color="#94a3b8"/>

<Text style={styles.time}>
{timeText}
</Text>

</View>

</View>

</View>

</TouchableOpacity>

);

};

/* ================= UI ================= */

return(

<SafeAreaView style={[styles.container,{backgroundColor:theme.background}]}>

<View style={styles.paddingWrapper}>

<View style={styles.headerRow}>

<Text style={[styles.header,{color:theme.text}]}>
Marketplace
</Text>

<Image
source={require("../../assets/images/logo.png")}
style={styles.logo}
/>

</View>

<View
style={[
styles.searchBox,
{
backgroundColor: theme.card,
borderColor: theme.text === "#ffffff" ? "#334155" : "#e5e7eb"
}
]}
>

<Feather
name="search"
size={18}
color={theme.text}
/>

<TextInput
placeholder="Search products..."
placeholderTextColor={theme.text === "#ffffff" ? "#94a3b8" : "#6b7280"}
style={[
styles.searchInput,
{ color: theme.text }
]}
value={search}
onChangeText={(text: string) => setSearch(text)}
/>

</View>

</View>

<View style={{height:95}}>

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
contentContainerStyle={{paddingHorizontal:15}}
>

{categories.map((cat,index)=>(

<TouchableOpacity
key={index}
onPress={()=>setSelectedCategory(cat.name)}
style={styles.categoryCard}
>

<Feather
name={cat.icon as any}
size={18}
color="white"
/>

<Text style={styles.categoryText}>
{cat.name}
</Text>

</TouchableOpacity>

))}

</ScrollView>

</View>

<FlatList
data={filteredItems}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
numColumns={2}
columnWrapperStyle={styles.columnWrapper}
contentContainerStyle={styles.flatListContent}
showsVerticalScrollIndicator={false}
/>

<BottomNav/>

</SafeAreaView>

);

}