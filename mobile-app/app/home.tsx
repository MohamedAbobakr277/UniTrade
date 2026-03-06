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
import { useFavorites } from "../constants/FavoriteContext";

export default function HomeScreen() {

const [search,setSearch] = useState("");
const [items,setItems] = useState<any[]>([]);
const [selectedCategory,setSelectedCategory] = useState("All");

const {favorites,toggleFavorite} = useFavorites();

useEffect(()=>{

const unsubscribe = onSnapshot(collection(db,"products"),(snapshot)=>{

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setItems(data);

});

return unsubscribe;

},[]);

const categories = [
{name:"All",icon:"home"},
{name:"Books",icon:"book"},
{name:"Calculators",icon:"hash"},
{name:"Laptops",icon:"monitor"},
{name:"Engineering",icon:"tool"},
{name:"Medical",icon:"plus-square"},
];

const filteredItems = items.filter(item=>{

const matchSearch =
item.title?.toLowerCase().includes(search.toLowerCase());

const matchCategory =
selectedCategory==="All" ||
item.category===selectedCategory;

return matchSearch && matchCategory;

});

const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

const isFav = favorites.includes(item.id);

return(

<View style={styles.card}>

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
color={isFav?"red":"white"}
/>

</TouchableOpacity>

</View>

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

</View>

);

};

return(

<SafeAreaView style={styles.container}>

<View style={styles.paddingWrapper}>

<View style={styles.headerRow}>

<Text style={styles.header}>
Marketplace
</Text>

<Image
source={require("../assets/images/logo.png")}
style={styles.logo}
/>

</View>

<View style={styles.searchBox}>

<Feather name="search" size={18} color="gray"/>

<TextInput
placeholder="Search products..."
value={search}
onChangeText={setSearch}
style={styles.searchInput}
/>

</View>

</View>

<View style={{height:110}}>

<ScrollView horizontal showsHorizontalScrollIndicator={false}>

{categories.map((cat,index)=>(

<TouchableOpacity
key={index}
onPress={()=>setSelectedCategory(cat.name)}
style={styles.categoryCard}
>

<Feather name={cat.icon as any} size={22} color="white"/>

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
/>

<BottomNav/>

</SafeAreaView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7fb"
},

paddingWrapper:{
paddingHorizontal:15
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
height:40
},

searchBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"white",
paddingHorizontal:12,
borderRadius:12,
height:45,
marginBottom:15
},

searchInput:{
marginLeft:10,
flex:1
},

categoryCard:{
backgroundColor:"#2563EB",
width:90,
height:100,
borderRadius:14,
marginRight:10,
alignItems:"center",
justifyContent:"center"
},

categoryText:{
color:"white",
fontSize:12
},

card:{
backgroundColor:"white",
borderRadius:14,
width:"48%",
marginBottom:15,
overflow:"hidden",
elevation:3
},

columnWrapper:{
justifyContent:"space-between",
paddingHorizontal:15
},

flatListContent:{
paddingBottom:100
},

image:{
width:"100%",
height:120
},

favoriteBtn:{
position:"absolute",
top:8,
right:8,
backgroundColor:"rgba(0,0,0,0.4)",
padding:6,
borderRadius:20
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