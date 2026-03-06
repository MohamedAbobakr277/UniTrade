// mobile-app/app/home.tsx

import React, { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
Image,
TouchableOpacity,
TextInput,
ScrollView,
StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

import BottomNav from "../components/BottomNav";

export default function HomeScreen(){

const [search,setSearch] = useState("");
const [items,setItems] = useState<any[]>([]);
const [selectedCategory,setSelectedCategory] = useState("All");

/* ================= FIREBASE ================= */

useEffect(()=>{

const unsubscribe = onSnapshot(
collection(db,"products"),
(snapshot)=>{

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setItems(data);

}
);

return unsubscribe;

},[]);

/* ================= CATEGORIES ================= */

const categories = [
{ name:"All", icon:"home" },
{ name:"Books", icon:"book" },
{ name:"Calculators", icon:"hash" },
{ name:"Laptops", icon:"monitor" },
{ name:"Engineering", icon:"tool" },
{ name:"Medical", icon:"plus-square" }
];

/* ================= FILTER ================= */

const filteredItems = items.filter(item=>{

const matchSearch =
item.title?.toLowerCase().includes(search.toLowerCase());

const matchCategory =
selectedCategory === "All" ||
item.category === selectedCategory;

return matchSearch && matchCategory;

});

/* ================= PRODUCT CARD ================= */

const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length > 0
? item.images[0]
: "https://via.placeholder.com/150";

return(

<TouchableOpacity style={styles.card}>

<Image
source={{uri:imageUrl}}
style={styles.image}
resizeMode="cover"
/>

<View style={styles.cardContent}>

<Text style={styles.title}>
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

</View>

</TouchableOpacity>

);

};

/* ================= UI ================= */

return(

<SafeAreaView edges={["top"]} style={styles.container}>

{/* HEADER */}

<View style={styles.headerRow}>

<Text style={styles.header}>
Marketplace
</Text>

<Image
source={require("../assets/images/logo.png")}
style={styles.logo}
/>

</View>

{/* SEARCH */}

<View style={styles.searchBox}>

<Feather name="search" size={18} color="gray"/>

<TextInput
placeholder="Search products..."
value={search}
onChangeText={setSearch}
style={styles.searchInput}
/>

</View>

{/* CATEGORIES */}

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={styles.categories}
>

{categories.map((cat,index)=>(

<TouchableOpacity
key={index}
onPress={()=>setSelectedCategory(cat.name)}
style={[
styles.categoryCard,
selectedCategory===cat.name && {backgroundColor:"#1E40AF"}
]}
>

<Feather
name={cat.icon as any}
size={20}
color="white"
style={{marginBottom:6}}
/>

<Text style={styles.categoryText}>
{cat.name}
</Text>

</TouchableOpacity>

))}

</ScrollView>

{/* PRODUCTS */}

<FlatList
data={filteredItems}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
numColumns={2}
columnWrapperStyle={{justifyContent:"space-between"}}
showsVerticalScrollIndicator={false}
/>

{/* BOTTOM NAV */}

<BottomNav/>

</SafeAreaView>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7fb",
paddingHorizontal:15,
paddingBottom:80
},

headerRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
marginTop:10,
marginBottom:12
},

header:{
fontSize:24,
fontWeight:"700"
},

logo:{
width:40,
height:40,
resizeMode:"contain"
},

searchBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"white",
paddingHorizontal:12,
borderRadius:12,
height:45,
marginBottom:10,
elevation:2
},

searchInput:{
marginLeft:10,
flex:1
},

categories:{
marginBottom:8
},

categoryCard:{
backgroundColor:"#2563EB",
width:85,
height:85,
borderRadius:14,
marginRight:10,
alignItems:"center",
justifyContent:"center"
},

categoryText:{
color:"white",
fontWeight:"600",
fontSize:11,
textAlign:"center"
},

card:{
backgroundColor:"white",
borderRadius:14,
width:"48%",
marginBottom:12,
overflow:"hidden",
elevation:3
},

image:{
width:"100%",
height:120
},

cardContent:{
padding:10
},

title:{
fontSize:14,
fontWeight:"600"
},

price:{
color:"#2563EB",
fontWeight:"700",
marginTop:4
},

meta:{
fontSize:12,
color:"gray"
}

});