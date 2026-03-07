import React, { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
Image,
StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
collection,
onSnapshot,
query,
where
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function MyFavorites(){

const [favorites,setFavorites] = useState<any[]>([]);

useEffect(()=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

const q = query(
collection(db,"favorites"),
where("userId","==",uid)
);

const unsubscribe = onSnapshot(q,(snapshot)=>{

const data = snapshot.docs.map(doc=>doc.data().productId);

loadProducts(data);

});

return unsubscribe;

},[]);



const loadProducts = (ids:string[])=>{

const unsubscribe = onSnapshot(collection(db,"products"),(snapshot)=>{

const allProducts = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

const favProducts = allProducts.filter(item=>ids.includes(item.id));

setFavorites(favProducts);

});

};



const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

return(

<View style={styles.card}>

<Image
source={{uri:imageUrl}}
style={styles.image}
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

</View>

</View>

);

};



return(

<SafeAreaView style={styles.container}>

<Text style={styles.header}>
My Favorites
</Text>

<FlatList
data={favorites}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
numColumns={2}
columnWrapperStyle={styles.row}
/>

</SafeAreaView>

);

}



const styles = StyleSheet.create({

container:{
flex:1,
padding:15,
backgroundColor:"#f5f7fb"
},

header:{
fontSize:22,
fontWeight:"700",
marginBottom:20
},

row:{
justifyContent:"space-between"
},

card:{
backgroundColor:"white",
borderRadius:12,
width:"48%",
marginBottom:15,
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