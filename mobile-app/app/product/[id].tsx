import React, { useEffect, useState } from "react";
import {
View,
Text,
Image,
ScrollView,
TouchableOpacity,
Linking,
Dimensions,
Share,
Modal,
StatusBar,
StyleSheet,
ActivityIndicator
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../constants/ThemeContext";

import {
doc,
getDoc,
collection,
query,
where,
getDocs,
addDoc,
deleteDoc
} from "firebase/firestore";

import { db, auth } from "../services/firebase";

const { width } = Dimensions.get("window");

type Product = {
id: string;
title: string;
price: number;
description?: string;
university?: string;
condition?: string;
category?: string;
images?: string[];
createdAt?: any;
userId?: string;
sellerName?: string;
phone?: string;
};

export default function ProductDetails(){

const { theme } = useTheme();
const { id } = useLocalSearchParams();

const [product,setProduct] = useState<Product | null>(null);
const [sellerPhoto,setSellerPhoto] = useState<string>("");
const [activeImage,setActiveImage] = useState<number>(0);
const [favorite,setFavorite] = useState<boolean>(false);
const [zoom,setZoom] = useState<boolean>(false);
const [loading,setLoading] = useState<boolean>(true);

useEffect(()=>{

const fetchProduct = async()=>{

try{

if(!id) return;

const docId = Array.isArray(id) ? id[0] : id;

const ref = doc(db,"products",docId);
const snap = await getDoc(ref);

if(snap.exists()){

const data:any = snap.data();

setProduct({
id:snap.id,
...data
});

if(data.userId){

const userRef = doc(db,"users",data.userId);
const userSnap = await getDoc(userRef);

if(userSnap.exists()){

const userData:any = userSnap.data();

setSellerPhoto(
userData.profilePhoto ||
userData.photoURL ||
userData.photo ||
"https://cdn-icons-png.flaticon.com/512/149/149071.png"
);

}

}

}

}catch(e){
console.log("Error:",e);
}finally{
setLoading(false);
}

};

fetchProduct();

},[id]);

useEffect(()=>{

const checkFavorite = async()=>{

const user = auth.currentUser;
if(!user || !product) return;

const q = query(
collection(db,"favorites"),
where("userId","==",user.uid),
where("productId","==",product.id)
);

const snapshot = await getDocs(q);

if(!snapshot.empty){
setFavorite(true);
}

};

checkFavorite();

},[product]);

const toggleFavorite = async()=>{

const user = auth.currentUser;
if(!user || !product) return;

const q = query(
collection(db,"favorites"),
where("userId","==",user.uid),
where("productId","==",product.id)
);

const snapshot = await getDocs(q);

if(snapshot.empty){

await addDoc(collection(db,"favorites"),{
userId:user.uid,
productId:product.id
});

setFavorite(true);

}else{

snapshot.forEach(async(docItem)=>{
await deleteDoc(docItem.ref);
});

setFavorite(false);

}

};

const shareProduct = async()=>{

if(!product) return;

await Share.share({
message:`${product.title} - EGP ${Number(product.price).toLocaleString()}`
});

};

const phone = product?.phone || "";

const openWhatsApp = ()=> Linking.openURL(`https://wa.me/${phone}`);
const callSeller = ()=> Linking.openURL(`tel:${phone}`);
const sendSMS = ()=> Linking.openURL(`sms:${phone}`);

const timeAgo = (timestamp:any)=>{

if(!timestamp) return "";

const now = new Date();
const date = timestamp.toDate();

const seconds = Math.floor((now.getTime()-date.getTime())/1000);
const hours = Math.floor(seconds/3600);

if(hours < 1) return Math.floor(seconds/60)+" min ago";
if(hours < 24) return hours+" hours ago";

return Math.floor(hours/24)+" days ago";

};

if(loading){

return(
<View style={[styles.loading,{backgroundColor:theme.background}]}>
<ActivityIndicator size="large" color="#2563EB"/>
<Text style={{color:theme.text,marginTop:10}}>
Loading Product...
</Text>
</View>
);

}

if(!product){

return(
<View style={[styles.loading,{backgroundColor:theme.background}]}>
<Text style={{color:theme.text}}>
Product not found
</Text>
</View>
);

}

return(

<View style={[styles.screen,{backgroundColor:theme.background}]}>

<StatusBar barStyle="light-content" translucent backgroundColor="transparent"/>

<ScrollView showsVerticalScrollIndicator={false}>

<View style={styles.imageContainer}>

<ScrollView
horizontal
pagingEnabled
showsHorizontalScrollIndicator={false}
onScroll={(e)=>{

const slide = Math.round(
e.nativeEvent.contentOffset.x / width
);

setActiveImage(slide);

}}
scrollEventThrottle={16}
>

{(product.images?.length
? product.images
:["https://via.placeholder.com/400"]
).map((img,index)=>(

<TouchableOpacity key={index} onPress={()=>setZoom(true)}>
<Image source={{uri:img}} style={styles.mainImage}/>
</TouchableOpacity>

))}

</ScrollView>

</View>

<View style={styles.headerButtons}>

<TouchableOpacity
style={styles.iconCircle}
onPress={()=>router.back()}
>
<Feather name="arrow-left" size={22} color="white"/>
</TouchableOpacity>

<View style={{flexDirection:"row"}}>

<TouchableOpacity
style={[styles.iconCircle,{marginRight:10}]}
onPress={toggleFavorite}
>

<Feather
name="heart"
size={22}
color={favorite ? "red":"white"}
/>

</TouchableOpacity>

<TouchableOpacity
style={styles.iconCircle}
onPress={shareProduct}
>
<Feather name="share-2" size={22} color="white"/>
</TouchableOpacity>

</View>

</View>

<View style={styles.content}>

<Text style={[styles.price,{color:theme.text}]}>
EGP {Number(product.price).toLocaleString()}
</Text>

<Text style={[styles.title,{color:theme.text}]}>
{product.title}
</Text>

<View style={styles.row}>

<Text style={[styles.location,{color:theme.text}]}>
📍 {product.university}
</Text>

<Text style={styles.dateText}>
{timeAgo(product.createdAt)}
</Text>

</View>

<Text style={[styles.description,{color:theme.text}]}>
{product.description}
</Text>

<View style={[styles.sellerCard,{backgroundColor:theme.card}]}>

<Text style={[styles.sellerTitle,{color:theme.text}]}>
Seller
</Text>

<View style={styles.sellerRow}>

<Image
source={{uri:sellerPhoto}}
style={styles.sellerImage}
/>

<Text style={[styles.sellerName,{color:theme.text}]}>
{product.sellerName || "Unknown"}
</Text>

</View>

</View>

</View>

<View style={{height:120}}/>

</ScrollView>

<View style={[styles.contactBar,{backgroundColor:theme.background}]}>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#22C55E"}]}
onPress={openWhatsApp}
>
<Feather name="message-circle" size={20} color="white"/>
<Text style={styles.contactBtnText}>WhatsApp</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#3B82F6"}]}
onPress={sendSMS}
>
<Feather name="mail" size={20} color="white"/>
<Text style={styles.contactBtnText}>SMS</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#2563EB"}]}
onPress={callSeller}
>
<Feather name="phone" size={20} color="white"/>
<Text style={styles.contactBtnText}>Call</Text>
</TouchableOpacity>

</View>

<Modal visible={zoom} transparent>

<TouchableOpacity
style={styles.modalContainer}
onPress={()=>setZoom(false)}
>

<Image
source={{uri:product.images?.[activeImage]}}
style={styles.fullImage}
/>

</TouchableOpacity>

</Modal>

</View>

);

}

const styles = StyleSheet.create({

screen:{flex:1},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

imageContainer:{
width:width,
height:420,
backgroundColor:"#000"
},

mainImage:{
width:width,
height:420,
resizeMode:"contain"
},

headerButtons:{
position:"absolute",
top:50,
left:20,
right:20,
flexDirection:"row",
justifyContent:"space-between",
zIndex:10
},

iconCircle:{
backgroundColor:"rgba(0,0,0,0.45)",
width:44,
height:44,
borderRadius:22,
justifyContent:"center",
alignItems:"center"
},

content:{
padding:20
},

price:{
fontSize:28,
fontWeight:"bold",
marginBottom:5
},

title:{
fontSize:20,
fontWeight:"600",
marginBottom:10
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:20
},

location:{
fontSize:14
},

dateText:{
color:"#888",
fontSize:13
},

description:{
fontSize:16,
lineHeight:24,
marginBottom:25
},

sellerCard:{
padding:15,
borderRadius:15
},

sellerTitle:{
fontWeight:"bold",
marginBottom:10
},

sellerRow:{
flexDirection:"row",
alignItems:"center"
},

sellerImage:{
width:50,
height:50,
borderRadius:25,
marginRight:12
},

sellerName:{
fontSize:16,
fontWeight:"600"
},

contactBar:{
position:"absolute",
bottom:0,
width:width,
flexDirection:"row",
paddingHorizontal:15,
paddingTop:15,
paddingBottom:35,
justifyContent:"space-between",
borderTopWidth:1
},

contactBtn:{
flexDirection:"row",
alignItems:"center",
paddingVertical:12,
paddingHorizontal:10,
borderRadius:12,
flex:0.31,
justifyContent:"center"
},

contactBtnText:{
color:"white",
marginLeft:4,
fontWeight:"bold",
fontSize:11
},

modalContainer:{
flex:1,
backgroundColor:"black",
justifyContent:"center"
},

fullImage:{
width:"100%",
height:"100%",
resizeMode:"contain"
}

});