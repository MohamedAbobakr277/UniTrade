import React, { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
Image,
StyleSheet,
TouchableOpacity
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
collection,
onSnapshot,
query,
where
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function MyFavorites(){

const router = useRouter();

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

const allProducts = snapshot.docs.map(doc=>{
const data = doc.data();
return {
id: doc.id,
...data,
sold: data.sold ?? false // Ensure 'sold' property exists
};
});

const favProducts = allProducts.filter(
item => ids.includes(item.id) && !item.sold
);

setFavorites(favProducts);

});

};



const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

return(

<TouchableOpacity
style={styles.card}
onPress={()=>router.push({
pathname:"/product/[id]",
params:{id:item.id}
})}
>

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

</TouchableOpacity>

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