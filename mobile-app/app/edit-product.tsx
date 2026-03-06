import React, { useEffect, useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Image,
ScrollView,
Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useLocalSearchParams, useRouter } from "expo-router";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import { db } from "./firebase";

export default function EditProduct(){

const router = useRouter();

const { id } = useLocalSearchParams();

const [title,setTitle] = useState("");
const [price,setPrice] = useState("");
const [condition,setCondition] = useState("");

const [images,setImages] = useState<string[]>([]);

/* ================= LOAD PRODUCT ================= */

useEffect(()=>{

const loadProduct = async()=>{

const ref = doc(db,"products",id as string);

const snap = await getDoc(ref);

if(snap.exists()){

const data:any = snap.data();

setTitle(data.title);
setPrice(String(data.price));
setCondition(data.condition);

if(data.images){
setImages(data.images);
}

}

};

loadProduct();

},[]);

/* ================= ADD IMAGE ================= */

const pickImage = async()=>{

let result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ImagePicker.MediaTypeOptions.Images,
quality:1
});

if(!result.canceled){

const uri = result.assets[0].uri;

setImages([...images,uri]);

}

};

/* ================= DELETE IMAGE ================= */

const removeImage = (index:number)=>{

const newImages = images.filter((_,i)=>i!==index);

setImages(newImages);

};

/* ================= UPDATE PRODUCT ================= */

const updateProduct = async()=>{

if(!title || !price){

Alert.alert("Error","Please fill all fields");

return;

}

try{

await updateDoc(doc(db,"products",id as string),{

title,
price:Number(price),
condition,
images

});

Alert.alert("Success","Product updated");

router.back();

}catch{

Alert.alert("Error","Failed to update");

}

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
Edit Product
</Text>

{/* TITLE */}

<TextInput
placeholder="Product Title"
value={title}
onChangeText={setTitle}
style={styles.input}
/>

{/* PRICE */}

<TextInput
placeholder="Price"
value={price}
onChangeText={setPrice}
keyboardType="numeric"
style={styles.input}
/>

{/* CONDITION */}

<TextInput
placeholder="Condition"
value={condition}
onChangeText={setCondition}
style={styles.input}
/>

{/* IMAGES */}

<Text style={styles.section}>
Images
</Text>

<View style={styles.imagesContainer}>

{images.map((img,index)=>(

<View key={index} style={styles.imageBox}>

<Image
source={{uri:img}}
style={styles.image}
/>

<TouchableOpacity
style={styles.deleteImage}
onPress={()=>removeImage(index)}
>

<Text style={{color:"white"}}>X</Text>

</TouchableOpacity>

</View>

))}

</View>

{/* ADD IMAGE */}

<TouchableOpacity
style={styles.addBtn}
onPress={pickImage}
>

<Text style={styles.addText}>
Add Image
</Text>

</TouchableOpacity>

{/* SAVE */}

<TouchableOpacity
style={styles.button}
onPress={updateProduct}
>

<Text style={styles.buttonText}>
Save Changes
</Text>

</TouchableOpacity>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7fb",
padding:20
},

title:{
fontSize:22,
fontWeight:"700",
marginBottom:20,
textAlign:"center"
},

input:{
backgroundColor:"white",
padding:12,
borderRadius:10,
marginBottom:10,
borderWidth:1,
borderColor:"#ddd"
},

section:{
fontWeight:"700",
marginTop:10,
marginBottom:10
},

imagesContainer:{
flexDirection:"row",
flexWrap:"wrap",
gap:10
},

imageBox:{
position:"relative"
},

image:{
width:100,
height:100,
borderRadius:10
},

deleteImage:{
position:"absolute",
top:5,
right:5,
backgroundColor:"red",
width:22,
height:22,
borderRadius:11,
alignItems:"center",
justifyContent:"center"
},

addBtn:{
backgroundColor:"#2563EB",
padding:12,
borderRadius:10,
alignItems:"center",
marginTop:15
},

addText:{
color:"white",
fontWeight:"600"
},

button:{
backgroundColor:"#22c55e",
padding:15,
borderRadius:10,
alignItems:"center",
marginTop:20
},

buttonText:{
color:"white",
fontWeight:"700",
fontSize:16
}

});