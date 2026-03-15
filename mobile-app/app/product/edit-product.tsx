import React, { useEffect, useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
Image,
ScrollView,
Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useLocalSearchParams, useRouter } from "expo-router";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import { db } from "../services/firebase";
import { useTheme } from "../../constants/ThemeContext";
import styles from "./edit-product.style";

export default function EditProduct(){

const { theme } = useTheme();

const router = useRouter();

const { id } = useLocalSearchParams();

const [title,setTitle] = useState("");
const [price,setPrice] = useState("");
const [condition,setCondition] = useState("");
const [category,setCategory] = useState("");

const [images,setImages] = useState<string[]>([]);

/* ================= DATA ================= */

const categories = [
"Books & Notes",
"Calculators",
"Laptops & Tablets",
"Electronics",
"Engineering Tools",
"Medical Tools",
"Lab Equipment",
"Stationery",
"Bags & Accessories",
"Furniture"
];

const conditions = ["Good","Fair","Poor"];

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
setCategory(data.category);

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
category,
images

});

Alert.alert("Success","Product updated");

router.back();

}catch{

Alert.alert("Error","Failed to update");

}

};

return(

<ScrollView style={[styles.container,{backgroundColor:theme.background}]}>

<Text style={[styles.title,{color:theme.text}]}>
Edit Product
</Text>

{/* TITLE */}

<TextInput
placeholder="Product Title"
placeholderTextColor="#9ca3af"
value={title}
onChangeText={setTitle}
style={[styles.input,{color:theme.text,backgroundColor:theme.card}]}
/>

{/* PRICE */}

<TextInput
placeholder="Price"
placeholderTextColor="#9ca3af"
value={price}
onChangeText={setPrice}
keyboardType="numeric"
style={[styles.input,{color:theme.text,backgroundColor:theme.card}]}
/>

{/* CATEGORY */}

<Text style={[styles.section,{color:theme.text}]}>
Category
</Text>

<View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:10}}>

{categories.map((cat)=>(

<TouchableOpacity
key={cat}
onPress={()=>setCategory(cat)}
style={{
backgroundColor:category===cat?"#2563EB":theme.card,
paddingHorizontal:12,
paddingVertical:8,
borderRadius:10,
marginRight:8,
marginBottom:8
}}
>

<Text style={{color:category===cat?"white":theme.text}}>
{cat}
</Text>

</TouchableOpacity>

))}

</View>

{/* CONDITION */}

<Text style={[styles.section,{color:theme.text}]}>
Condition
</Text>

<View style={{flexDirection:"row",marginBottom:10}}>

{conditions.map((c)=>(

<TouchableOpacity
key={c}
onPress={()=>setCondition(c)}
style={{
flex:1,
backgroundColor:condition===c?"#2563EB":theme.card,
padding:10,
borderRadius:10,
marginRight:8,
alignItems:"center"
}}
>

<Text style={{color:condition===c?"white":theme.text}}>
{c}
</Text>

</TouchableOpacity>

))}

</View>

{/* IMAGES */}

<Text style={[styles.section,{color:theme.text}]}>
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