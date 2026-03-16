import React, { useEffect, useRef, useState } from "react";
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
PanResponder
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

const [filterVisible,setFilterVisible] = useState(false);
const [selectedUniversity,setSelectedUniversity] = useState("");
const [selectedCondition,setSelectedCondition] = useState("");
const [minPrice,setMinPrice] = useState("");
const [maxPrice,setMaxPrice] = useState("");

const conditions = ["New","Like New","Used"];

const sheetY = useRef(new Animated.Value(0)).current;

/* ================= Drag Bottom Sheet ================= */

const panResponder = useRef(
PanResponder.create({

onMoveShouldSetPanResponder: () => true,

onPanResponderMove: Animated.event(
[null,{ dy: sheetY }],
{ useNativeDriver:false }
),

onPanResponderRelease: (_,gesture)=>{

if(gesture.dy > 150){

Animated.timing(sheetY,{
toValue:600,
duration:200,
useNativeDriver:true
}).start(()=>{
setFilterVisible(false);
sheetY.setValue(0);
});

}else{

Animated.spring(sheetY,{
toValue:0,
useNativeDriver:true
}).start();

}

}

})
).current;

/* ================= Reset Filters ================= */

const resetFilters = () => {
setSelectedCategory("All");
setSelectedUniversity("");
setSelectedCondition("");
setMinPrice("");
setMaxPrice("");
setSearch("");
};

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

const universities = [
...new Set(items.map(item => item.university))
];

/* ================= FILTER ================= */

const filteredItems = items.filter(item=>{

const matchSearch =
item.title?.toLowerCase().includes(search.toLowerCase());

const matchCategory =
selectedCategory==="All" ||
item.category===selectedCategory;

const matchUniversity =
!selectedUniversity ||
item.university === selectedUniversity;

const matchCondition =
!selectedCondition ||
item.condition === selectedCondition;

const matchMinPrice =
!minPrice || item.price >= Number(minPrice);

const matchMaxPrice =
!maxPrice || item.price <= Number(maxPrice);

return (
matchSearch &&
matchCategory &&
matchUniversity &&
matchCondition &&
matchMinPrice &&
matchMaxPrice
);

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

<Image source={{uri:imageUrl}} style={styles.image}/>

<TouchableOpacity
style={styles.favoriteBtn}
onPress={()=>toggleFavorite(item.id)}
>

<Feather name="heart" size={18} color={isFav ? "red" : "white"} />

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

<Image source={{uri:sellerPhoto}} style={styles.sellerImage}/>

<Text style={[styles.sellerName,{color:theme.text}]}>
{sellerName}
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

<View style={[styles.searchBox,{backgroundColor: theme.card}]}>

<Feather name="search" size={18} color={theme.text}/>

<TextInput
placeholder="Search products..."
style={[styles.searchInput,{color:theme.text}]}
value={search}
onChangeText={setSearch}
/>

<TouchableOpacity onPress={()=>setFilterVisible(true)}>
<Feather name="sliders" size={20} color={theme.text}/>
</TouchableOpacity>

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

<Feather name={cat.icon as any} size={18} color="white"/>

<Text style={styles.categoryText}>
{cat.name}
</Text>

</TouchableOpacity>

))}

</ScrollView>

</View>

{/* Bottom Sheet Filter */}

<Modal visible={filterVisible} transparent animationType="fade">

<View style={{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,0.4)"}}>

<Animated.View
style={{
backgroundColor:"white",
padding:20,
borderTopLeftRadius:20,
borderTopRightRadius:20,
transform:[{
translateY: sheetY.interpolate({
inputRange:[0,600],
outputRange:[0,600],
extrapolate:"clamp"
})
}]
}}
{...panResponder.panHandlers}
>

<View style={{alignItems:"center",marginBottom:10}}>
<View style={{
width:40,
height:5,
backgroundColor:"#ccc",
borderRadius:5
}}/>
</View>

<Text style={{fontSize:20,fontWeight:"bold"}}>Filters</Text>

<Text style={{marginTop:15}}>University</Text>

<ScrollView horizontal>

{universities.map((uni,index)=>(

<TouchableOpacity
key={index}
onPress={()=>setSelectedUniversity(uni)}
style={{
padding:8,
backgroundColor:"#0ea5e9",
borderRadius:10,
marginRight:8
}}
>

<Text style={{color:"white"}}>
{uni}
</Text>

</TouchableOpacity>

))}

</ScrollView>

<Text style={{marginTop:15}}>Condition</Text>

<ScrollView horizontal>

{conditions.map((cond,index)=>(

<TouchableOpacity
key={index}
onPress={()=>setSelectedCondition(cond)}
style={{
padding:8,
backgroundColor:"#22c55e",
borderRadius:10,
marginRight:8
}}
>

<Text style={{color:"white"}}>
{cond}
</Text>

</TouchableOpacity>

))}

</ScrollView>

<Text style={{marginTop:15}}>Min Price</Text>

<TextInput
keyboardType="numeric"
value={minPrice}
onChangeText={setMinPrice}
style={{borderWidth:1,padding:10,borderRadius:8,marginTop:5}}
/>

<Text style={{marginTop:15}}>Max Price</Text>

<TextInput
keyboardType="numeric"
value={maxPrice}
onChangeText={setMaxPrice}
style={{borderWidth:1,padding:10,borderRadius:8,marginTop:5}}
/>

<TouchableOpacity
onPress={resetFilters}
style={{
borderWidth:1,
borderColor:"#2563EB",
padding:15,
marginTop:15,
borderRadius:10
}}
>

<Text style={{color:"#2563EB",textAlign:"center"}}>
Reset Filters
</Text>

</TouchableOpacity>

<TouchableOpacity
onPress={()=>setFilterVisible(false)}
style={{
backgroundColor:"#2563EB",
padding:15,
marginTop:10,
borderRadius:10
}}
>

<Text style={{color:"white",textAlign:"center"}}>
Apply Filter
</Text>

</TouchableOpacity>

</Animated.View>

</View>

</Modal>

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