import React,{useEffect,useState} from "react";
import {
View,
Text,
FlatList,
Image,
StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {collection,onSnapshot} from "firebase/firestore";
import {db} from "./firebase";

import {useFavorites} from "../constants/FavoriteContext";

export default function MyFavorites(){

const {favorites} = useFavorites();

const [items,setItems] = useState<any[]>([]);

useEffect(()=>{

const unsub = onSnapshot(collection(db,"products"),(snapshot)=>{

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setItems(data);

});

return unsub;

},[]);

const favProducts = items.filter(item=>favorites.includes(item.id));

const renderItem = ({item}:any)=>{

const image =
Array.isArray(item.images)&&item.images.length>0
? item.images[0]
:"https://via.placeholder.com/150";

return(

<View style={styles.card}>

<Image source={{uri:image}} style={styles.image}/>

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

<SafeAreaView edges={["top"]} style={styles.container}>

<Text style={styles.header}>
My Favorites
</Text>

<FlatList
data={favProducts}
renderItem={renderItem}
keyExtractor={(item)=>item.id}
numColumns={2}
columnWrapperStyle={styles.row}
contentContainerStyle={{paddingBottom:100}}
showsVerticalScrollIndicator={false}
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