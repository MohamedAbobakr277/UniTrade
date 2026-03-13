import React, { useEffect, useState } from "react";
import {
View,
Text,
Image,
ScrollView,
StyleSheet,
TouchableOpacity,
Linking
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { doc, getDoc } from "firebase/firestore";
import { db } from "./../firebase";

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
  [key: string]: any;
};

export default function ProductDetails(){

const { id } = useLocalSearchParams();
const [product,setProduct] = useState<Product | null>(null);

/* GET PRODUCT */

useEffect(()=>{

const fetchProduct = async()=>{

if(!id) return;

const docId = Array.isArray(id) ? id[0] : id;
const ref = doc(db, "products", docId);

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


/* CONTACT */

const phone = product?.phone || "";

const openWhatsApp = ()=>{
Linking.openURL(`https://wa.me/${phone}`);
};

const callSeller = ()=>{
Linking.openURL(`tel:${phone}`);
};

const sendSMS = ()=>{
Linking.openURL(`sms:${phone}`);
};


/* LOADING */

if(!product){
return(
<View style={styles.loading}>
<Text>Loading...</Text>
</View>
);
}


/* UI */

return(

<View style={styles.screen}>

<ScrollView contentContainerStyle={{flexGrow:1}}>

<Image
source={{uri:product.images?.[0]}}
style={styles.image}
/>

<TouchableOpacity
style={styles.backBtn}
onPress={()=>router.back()}
>
<Feather name="arrow-left" size={22} color="white"/>
</TouchableOpacity>


<View style={styles.contentCard}>

<View>

<Text style={styles.price}>
EGP {product.price}
</Text>

<Text style={styles.title}>
{product.title}
</Text>

<Text style={styles.location}>
📍 {product.university}
</Text>

<Text style={styles.description}>
{product.description}
</Text>

</View>


<View style={styles.infoRow}>

<View style={styles.infoBox}>
<Text style={styles.infoLabel}>Condition</Text>
<Text style={styles.infoValue}>{product.condition}</Text>
</View>

<View style={styles.infoBox}>
<Text style={styles.infoLabel}>Category</Text>
<Text style={styles.infoValue}>{product.category}</Text>
</View>

</View>

</View>

</ScrollView>



{/* CONTACT BUTTONS */}

<View style={styles.contactRow}>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#25D366"}]}
onPress={openWhatsApp}
>
<Feather name="message-circle" size={20} color="white"/>
<Text style={styles.contactText}>WhatsApp</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.contactBtn,{backgroundColor:"#ef4444"}]}
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



/* STYLES */

const styles = StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#020617"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

image:{
width:"100%",
height:320,
resizeMode:"cover"
},

backBtn:{
position:"absolute",
top:50,
left:15,
backgroundColor:"rgba(0,0,0,0.5)",
padding:8,
borderRadius:20
},

contentCard:{
backgroundColor:"#111827",
marginTop:-30,
borderTopLeftRadius:25,
borderTopRightRadius:25,
padding:22,
flex:1,
justifyContent:"space-between"
},

price:{
fontSize:26,
fontWeight:"700",
color:"#ffffff"
},

title:{
fontSize:18,
marginTop:8,
color:"#cbd5e1"
},

location:{
marginTop:6,
color:"#94a3b8",
fontSize:14
},

description:{
marginTop:16,
color:"#e2e8f0",
lineHeight:22
},

infoRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:25
},

infoBox:{
backgroundColor:"#020617",
padding:14,
borderRadius:12,
width:"48%",
alignItems:"center"
},

infoLabel:{
color:"#94a3b8",
fontSize:12
},

infoValue:{
color:"#ffffff",
fontWeight:"600",
marginTop:5
},

contactRow:{
flexDirection:"row",
justifyContent:"space-around",
padding:15,
backgroundColor:"#020617",
borderTopWidth:1,
borderColor:"#1e293b"
},

contactBtn:{
flexDirection:"row",
alignItems:"center",
padding:12,
borderRadius:10
},

contactText:{
color:"white",
marginLeft:6,
fontWeight:"600"
}

});