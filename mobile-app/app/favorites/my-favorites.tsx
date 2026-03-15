import React, { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
Image,
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

import { auth, db } from "../services/firebase";
import styles from "./my-favoriyes.styles";

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



