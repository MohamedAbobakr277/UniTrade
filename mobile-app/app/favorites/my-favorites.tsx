import React, { useEffect, useState } from "react";
import { useTheme } from "../../constants/ThemeContext";
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
  doc
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import styles from "./my-favoriyes.styles";

export default function MyFavorites(){

const { theme } = useTheme();

const router = useRouter();

const [favorites,setFavorites] = useState<any[]>([]);

useEffect(()=>{
  const uid = auth.currentUser?.uid;
  if(!uid) return;

  const unsubscribe = onSnapshot(doc(db, "users", uid), (snapshot)=>{
    const data = snapshot.data();
    loadProducts(data?.favourites || []);
  });
  return unsubscribe;
},[]);



const loadProducts = (ids:string[])=>{
  if (!ids || ids.length === 0) {
    setFavorites([]);
    return;
  }
  const unsubscribe = onSnapshot(collection(db,"products"),(snapshot)=>{
    const allProducts = snapshot.docs.map(doc=>{
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
};



const renderItem = ({item}:any)=>{

const imageUrl =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

return(

<TouchableOpacity
style={[styles.card,{backgroundColor:theme.card}]}
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

<Text style={[styles.title,{color:theme.text}]}>
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

<SafeAreaView style={[styles.container,{backgroundColor:theme.background}]}>

<Text style={[styles.header,{color:theme.text}]}>
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