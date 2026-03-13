import React, { useEffect, useState } from "react";
import {
View,
Text,
Image,
ScrollView,
StyleSheet,
TouchableOpacity,
Linking,
Dimensions
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./../firebase";

const { width } = Dimensions.get("window");

type Product = {
id: string;
images?: string[];
price?: number;
title?: string;
university?: string;
description?: string;
condition?: string;
category?: string;
phone?: string;
createdAt?: any;
};

export default function ProductDetails(){

const { id } = useLocalSearchParams();
const [product,setProduct] = useState<Product | null>(null);
const [activeImage,setActiveImage] = useState(0);

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

const formatDate = (timestamp:any)=>{
if(!timestamp) return "";
return timestamp.toDate().toLocaleDateString("en-GB");
};

const phone = product?.phone || "";

const openWhatsApp = ()=> Linking.openURL(`https://wa.me/${phone}`);
const callSeller = ()=> Linking.openURL(`tel:${phone}`);
const sendSMS = ()=> Linking.openURL(`sms:${phone}`);

if(!product){
return(
<View style={styles.loading}>
<Text>Loading...</Text>
</View>
);
}

return(

<View style={styles.screen}>

<ScrollView>

{/* IMAGE SLIDER */}

<View>

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

{product.images?.map((img,index)=>(
<Image
key={index}
source={{uri:img}}
style={styles.image}
/>
))}

</ScrollView>

{/* IMAGE DOTS */}

<View style={styles.dots}>

{product.images?.map((_,i)=>(
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

{/* BACK BUTTON */}

<TouchableOpacity
style={styles.backBtn}
onPress={()=>router.back()}
>
<Feather name="arrow-left" size={24} color="white"/>
</TouchableOpacity>

{/* CARD */}

<View style={styles.card}>

<Text style={styles.price}>
EGP {product.price}
</Text>

<Text style={styles.title}>
{product.title}
</Text>

<View style={styles.row}>

<Text style={styles.location}>
📍 {product.university}
</Text>

<Text style={styles.date}>
{formatDate(product.createdAt)}
</Text>

</View>

<Text style={styles.description}>
{product.description}
</Text>

<View style={styles.infoRow}>

<View style={styles.infoBox}>
<Text style={styles.infoValue}>{product.condition}</Text>
<Text style={styles.infoLabel}>Condition</Text>
</View>

<View style={styles.infoBox}>
<Text style={styles.infoValue}>{product.category}</Text>
<Text style={styles.infoLabel}>Category</Text>
</View>

</View>

</View>

</ScrollView>

{/* CONTACT BAR */}

<View style={styles.contactBar}>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#25D366"}]}
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

</View>

);

}

const styles = StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#F1F5F9"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

image:{
width:width,
height:320,
resizeMode:"cover"
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

backBtn:{
position:"absolute",
top:50,
left:15,
backgroundColor:"rgba(0,0,0,0.5)",
padding:10,
borderRadius:30
},

card:{
backgroundColor:"white",
padding:20,
borderTopLeftRadius:25,
borderTopRightRadius:25,
marginTop:-20
},

price:{
fontSize:30,
fontWeight:"bold",
color:"#2563EB"
},

title:{
fontSize:18,
marginTop:8,
fontWeight:"600",
color:"#111827"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:8
},

location:{
color:"#64748B"
},

date:{
color:"#64748B"
},

description:{
marginTop:15,
fontSize:15,
color:"#374151",
lineHeight:22
},

infoRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
},

infoBox:{
backgroundColor:"#EFF6FF",
padding:15,
borderRadius:12,
width:"48%",
alignItems:"center"
},

infoValue:{
fontSize:16,
fontWeight:"bold",
color:"#1E3A8A"
},

infoLabel:{
color:"#64748B",
marginTop:3
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
