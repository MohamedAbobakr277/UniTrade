import React, { useEffect, useState } from "react";
import {
View,
Text,
Image,
ScrollView,
StyleSheet,
TouchableOpacity,
Linking,
Dimensions,
Share,
Modal
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {
doc,
getDoc,
setDoc,
deleteDoc
} from "firebase/firestore";

import { db, auth } from "../firebase";

const { width } = Dimensions.get("window");

export default function ProductDetails(){

const { id } = useLocalSearchParams();

const [product,setProduct] = useState<any>(null);
const [activeImage,setActiveImage] = useState(0);
const [favorite,setFavorite] = useState(false);
const [zoom,setZoom] = useState(false);

useEffect(()=>{

const fetchProduct = async()=>{

if(!id) return;

const docId = Array.isArray(id) ? id[0] : id;

const ref = doc(db,"products",docId);

const snap = await getDoc(ref);

if(snap.exists()){
setProduct({
id:snap.id,
...snap.data()
});
}

};

fetchProduct();

},[id]);

/* FAVORITE */

const toggleFavorite = async()=>{

const user = auth.currentUser;

if(!user || !product) return;

const favRef = doc(db,"favorites",`${user.uid}_${product.id}`);

if(favorite){

await deleteDoc(favRef);
setFavorite(false);

}else{

await setDoc(favRef,{
userId:user.uid,
productId:product.id,
createdAt:new Date()
});

setFavorite(true);

}

};

/* SHARE */

const shareProduct = async()=>{

if(!product) return;

await Share.share({
message:`${product.title} - EGP ${Number(product.price).toLocaleString()}`
});

};

/* CONTACT */

const phone = product?.phone || "";

const openWhatsApp = ()=> Linking.openURL(`https://wa.me/${phone}`);
const callSeller = ()=> Linking.openURL(`tel:${phone}`);
const sendSMS = ()=> Linking.openURL(`sms:${phone}`);

/* TIME AGO */

const timeAgo = (timestamp:any)=>{

if(!timestamp) return "";

const now = new Date();
const date = timestamp.toDate();

const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

const hours = Math.floor(seconds / 3600);

if(hours < 1){

const minutes = Math.floor(seconds / 60);
return minutes + " minutes ago";

}

if(hours < 24){
return hours + " hours ago";
}

const days = Math.floor(hours / 24);

return days + " days ago";

};

if(!product){
return(
<View style={styles.loading}>
<Text>Loading...</Text>
</View>
);
}

const mainImage =
product.images?.[0] ||
"https://via.placeholder.com/400";

return(

<View style={styles.screen}>

<ScrollView>

{/* IMAGE SLIDER */}

<View>

<ScrollView
horizontal
pagingEnabled
showsHorizontalScrollIndicator={false}
decelerationRate="fast"
onScroll={(e)=>{

const slide = Math.round(
e.nativeEvent.contentOffset.x / width
);

setActiveImage(slide);

}}
scrollEventThrottle={16}
>

{product.images?.length ? (

product.images.map((img:string,index:number)=>(

<TouchableOpacity
key={index}
activeOpacity={0.9}
onPress={()=>setZoom(true)}
>

<Image
source={{uri:img}}
style={styles.image}
/>

</TouchableOpacity>

))

) : (

<Image
source={{uri:mainImage}}
style={styles.image}
/>

)}

</ScrollView>

<View style={styles.imageCount}>
<Text style={styles.imageCountText}>
{activeImage+1}/{product.images?.length || 1}
</Text>
</View>

<View style={styles.dots}>

{product.images?.map((_:any,i:number)=>(

<View
key={i}
style={[
styles.dot,
activeImage===i && styles.activeDot
]}
/>

))}

</View>

</View>

{/* TOP BUTTONS */}

<TouchableOpacity
style={styles.backBtn}
onPress={()=>router.back()}
>
<Feather name="arrow-left" size={22} color="#333"/>
</TouchableOpacity>

<TouchableOpacity
style={styles.favorite}
onPress={toggleFavorite}
>
<Feather
name="heart"
size={22}
color={favorite ? "red":"#333"}
/>
</TouchableOpacity>

<TouchableOpacity
style={styles.share}
onPress={shareProduct}
>
<Feather name="share-2" size={22} color="#333"/>
</TouchableOpacity>

{/* CONTENT */}

<View style={styles.content}>

<Text style={styles.price}>
EGP {Number(product.price).toLocaleString()}
</Text>

<Text style={styles.title}>
{product.title}
</Text>

<View style={styles.row}>

<Text style={styles.location}>
📍 {product.university}
</Text>

<Text style={styles.date}>
{timeAgo(product.createdAt)}
</Text>

</View>

<Text style={styles.description}>
{product.description}
</Text>

<View style={styles.infoRow}>

<View style={styles.infoCard}>
<Text style={styles.infoValue}>
{product.condition}
</Text>
<Text style={styles.infoLabel}>
Condition
</Text>
</View>

<View style={styles.infoCard}>
<Text style={styles.infoValue}>
{product.category}
</Text>
<Text style={styles.infoLabel}>
Category
</Text>
</View>

</View>

{/* SELLER */}

<View style={styles.sellerCard}>

<Text style={styles.sellerTitle}>
Seller
</Text>

<Text style={styles.sellerName}>
{product.sellerName || "Unknown"}
</Text>

</View>

</View>

</ScrollView>

{/* CONTACT */}

<View style={styles.contactBar}>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#22C55E"}]}
onPress={openWhatsApp}
>
<Feather name="message-circle" size={20} color="white"/>
<Text style={styles.contactText}>WhatsApp</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#3B82F6"}]}
onPress={sendSMS}
>
<Feather name="mail" size={20} color="white"/>
<Text style={styles.contactText}>SMS</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#2563EB"}]}
onPress={callSeller}
>
<Feather name="phone" size={20} color="white"/>
<Text style={styles.contactText}>Call</Text>
</TouchableOpacity>

</View>

{/* ZOOM */}

<Modal visible={zoom} transparent={true}>

<TouchableOpacity
style={{
flex:1,
backgroundColor:"black",
justifyContent:"center"
}}
onPress={()=>setZoom(false)}
>

<Image
source={{uri:product.images?.[activeImage]}}
style={{
width:"100%",
height:400,
resizeMode:"contain"
}}
/>

</TouchableOpacity>

</Modal>

</View>

);

}

const styles = StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#F3F4F6"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

image:{
width:width,
height:260,
resizeMode:"contain",
backgroundColor:"white"
},

dots:{
flexDirection:"row",
position:"absolute",
bottom:15,
alignSelf:"center"
},

dot:{
width:8,
height:8,
borderRadius:4,
backgroundColor:"#D1D5DB",
margin:4
},

activeDot:{
backgroundColor:"#2563EB"
},

imageCount:{
position:"absolute",
bottom:15,
right:15,
backgroundColor:"rgba(0,0,0,0.6)",
paddingHorizontal:8,
paddingVertical:4,
borderRadius:6
},

imageCountText:{
color:"white"
},

backBtn:{
position:"absolute",
top:50,
left:15,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

favorite:{
position:"absolute",
top:50,
right:60,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

share:{
position:"absolute",
top:50,
right:15,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

content:{
padding:20
},

price:{
fontSize:30,
fontWeight:"bold",
color:"#2563EB"
},

title:{
fontSize:20,
marginTop:6,
fontWeight:"600"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:6
},

location:{
color:"#6B7280"
},

date:{
color:"#6B7280"
},

description:{
marginTop:15,
fontSize:15,
lineHeight:22,
color:"#374151"
},

infoRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
},

infoCard:{
backgroundColor:"#EFF6FF",
width:"48%",
padding:15,
borderRadius:12,
alignItems:"center"
},

infoValue:{
fontSize:18,
fontWeight:"bold",
color:"#1E3A8A"
},

infoLabel:{
marginTop:4,
color:"#6B7280"
},

sellerCard:{
marginTop:25,
padding:15,
backgroundColor:"white",
borderRadius:12
},

sellerTitle:{
fontWeight:"600",
marginBottom:5
},

sellerName:{
color:"#374151"
},

contactBar:{
flexDirection:"row",
justifyContent:"space-around",
padding:15,
backgroundColor:"white",
borderTopWidth:1,
borderColor:"#E5E7EB"
},

contactBtn:{
flexDirection:"row",
alignItems:"center",
padding:14,
borderRadius:10
},

contactText:{
color:"white",
marginLeft:6,
fontWeight:"600"
}

});
