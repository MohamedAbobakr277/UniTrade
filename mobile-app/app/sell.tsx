// mobile-app/app/sell.tsx

import React, { useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
Image,
ScrollView,
Alert,
ActivityIndicator,
StyleSheet
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { db, auth } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

/* ================= CLOUDINARY ================= */

const CLOUD_NAME = "dstfo8pxq";
const UPLOAD_PRESET = "unitrade_upload";

/* ================= DATA ================= */

const categories = ["Books","Calculators","Laptops","Engineering","Medical"];
const conditions = ["Good","Fair","Poor"];

const universities = [
"Cairo University",
"Ain Shams University",
"Alexandria University",
"Mansoura University",
"Assiut University",
"Helwan University",
"Tanta University",
"Zagazig University",
"Suez Canal University",
"Al-Azhar University",
"German University in Cairo",
"British University in Egypt",
"October 6 University",
"Future University in Egypt"
];

const faculties = [
"Computer Science",
"Engineering",
"Medicine",
"Pharmacy",
"Law",
"Business Administration",
"Dentistry",
"Arts",
"Science",
"Nursing",
"Education",
"Agriculture",
"Economics",
"Philosophy",
"Mass Communication"
];

/* ================= COMPONENT ================= */

export default function Sell(){

const router = useRouter();

const [images,setImages] = useState<string[]>([]);
const [loading,setLoading] = useState(false);

const [title,setTitle] = useState("");
const [description,setDescription] = useState("");
const [category,setCategory] = useState("");
const [condition,setCondition] = useState("");
const [university,setUniversity] = useState("");
const [faculty,setFaculty] = useState("");
const [price,setPrice] = useState("");

const [showUniversity,setShowUniversity] = useState(false);
const [showFaculty,setShowFaculty] = useState(false);

/* ================= IMAGE PICKER ================= */

const pickImage = async () => {

const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

if(status !== "granted"){
Alert.alert("Permission required");
return;
}

const result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ImagePicker.MediaTypeOptions.Images,
allowsMultipleSelection:true,
selectionLimit:10,
quality:0.7
});

if(!result.canceled && result.assets){

const newImages = result.assets.map(asset => asset.uri);

const allImages = [...images,...newImages];

if(allImages.length > 10){
Alert.alert("Maximum 10 images allowed");
return;
}

setImages(allImages);

}

};

/* ================= DELETE IMAGE ================= */

const removeImage = (index:number)=>{
const newImages = images.filter((_,i)=>i!==index);
setImages(newImages);
};

/* ================= CLOUDINARY UPLOAD ================= */

const uploadImage = async (imageUri:string) => {

const data = new FormData();

data.append("file",{
uri:imageUri,
type:"image/jpeg",
name:"upload.jpg"
} as any);

data.append("upload_preset",UPLOAD_PRESET);

const res = await fetch(
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
{
method:"POST",
body:data
}
);

const file = await res.json();

return file.secure_url;

};

const uploadImages = async () => {

const urls:string[] = [];

for(const img of images){

const url = await uploadImage(img);
urls.push(url);

}

return urls;

};

/* ================= POST PRODUCT ================= */

const handlePost = async ()=>{

if(loading) return;

if(images.length===0){
Alert.alert("Add at least one image");
return;
}

if(!title || !category || !condition || !price){
Alert.alert("Fill required fields");
return;
}

try{

setLoading(true);

const imageUrls = await uploadImages();

await addDoc(collection(db,"products"),{

title,
description,
category,
condition,
university,
faculty,
price,
images:imageUrls,

userId: auth.currentUser?.uid,

sellerName: auth.currentUser?.providerData[0]?.displayName,
sellerEmail: auth.currentUser?.email,

createdAt:new Date()

});


Alert.alert("Product posted successfully");

router.replace("/home");

}catch(e){

console.log(e);
Alert.alert("Error posting product");

}finally{

setLoading(false);

}

};

/* ================= UI ================= */

return(

<SafeAreaView style={{flex:1}}>

<ScrollView
style={{padding:20}}
contentContainerStyle={{paddingBottom:120}}
>

<Text style={{fontSize:22,fontWeight:"bold",marginBottom:15}}>
Sell Your Item
</Text>

{images.length>0 && (
<Image
source={{uri:images[0]}}
style={{
width:"100%",
height:200,
borderRadius:15,
marginBottom:10
}}
/>
)}

<View style={{flexDirection:"row",flexWrap:"wrap"}}>

{images.map((img,index)=>(

<View key={index} style={{marginRight:10}}>

<Image
source={{uri:img}}
style={{
width:70,
height:70,
borderRadius:10
}}
/>

<TouchableOpacity
onPress={()=>removeImage(index)}
style={{
position:"absolute",
top:-5,
right:-5,
backgroundColor:"black",
borderRadius:20,
paddingHorizontal:6
}}
>

<Text style={{color:"white"}}>X</Text>

</TouchableOpacity>

</View>

))}

</View>

<TouchableOpacity
onPress={pickImage}
style={{
marginTop:10,
marginBottom:15,
backgroundColor:"#E5E7EB",
padding:12,
borderRadius:10,
alignItems:"center"
}}
>
<Text>Add Images</Text>
</TouchableOpacity>

<TextInput
placeholder="Title"
value={title}
onChangeText={setTitle}
style={styles.input}
/>

<TextInput
placeholder="Description"
value={description}
onChangeText={setDescription}
style={[styles.input,{height:80}]}
multiline
/>

<Text style={styles.label}>Category</Text>

<View style={{flexDirection:"row",flexWrap:"wrap",marginBottom:15}}>

{categories.map((cat)=>(

<TouchableOpacity
key={cat}
onPress={()=>setCategory(cat)}
style={{
backgroundColor:category===cat?"#2563EB":"#E5E7EB",
paddingHorizontal:12,
paddingVertical:8,
borderRadius:10,
marginRight:8,
marginBottom:8
}}
>

<Text style={{color:category===cat?"white":"black"}}>
{cat}
</Text>

</TouchableOpacity>

))}

</View>

<Text style={styles.label}>Condition</Text>

<View style={{flexDirection:"row",marginBottom:15}}>

{conditions.map((c)=>(

<TouchableOpacity
key={c}
onPress={()=>setCondition(c)}
style={{
flex:1,
backgroundColor:condition===c?"#2563EB":"#E5E7EB",
padding:10,
borderRadius:10,
marginRight:8,
alignItems:"center"
}}
>

<Text style={{color:condition===c?"white":"black"}}>
{c}
</Text>

</TouchableOpacity>

))}

</View>

<TextInput
placeholder="University"
value={university}
onFocus={()=>setShowUniversity(true)}
style={styles.input}
/>

{showUniversity &&(

<View style={styles.dropdown}>

{universities.map(u=>(

<TouchableOpacity
key={u}
onPress={()=>{
setUniversity(u);
setShowUniversity(false);
}}
style={styles.item}
>

<Text>{u}</Text>

</TouchableOpacity>

))}

</View>

)}

<TextInput
placeholder="Faculty"
value={faculty}
onFocus={()=>setShowFaculty(true)}
style={styles.input}
/>

{showFaculty &&(

<View style={styles.dropdown}>

{faculties.map(f=>(

<TouchableOpacity
key={f}
onPress={()=>{
setFaculty(f);
setShowFaculty(false);
}}
style={styles.item}
>

<Text>{f}</Text>

</TouchableOpacity>

))}

</View>

)}

<TextInput
placeholder="Price"
value={price}
onChangeText={(t)=>{
const clean = t.replace(/[^0-9]/g,"");
setPrice(clean);
}}
keyboardType="numeric"
style={styles.input}
/>

<TouchableOpacity
onPress={handlePost}
style={{
backgroundColor:"#2563EB",
padding:15,
borderRadius:10,
marginTop:15
}}
>

{loading
? <ActivityIndicator color="white"/>
: <Text style={{color:"white",textAlign:"center"}}>
Post Item
</Text>
}

</TouchableOpacity>

</ScrollView>

</SafeAreaView>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

input:{
borderWidth:1,
borderColor:"#ddd",
padding:12,
borderRadius:10,
marginBottom:12
},

label:{
fontWeight:"bold",
marginBottom:8
},

dropdown:{
backgroundColor:"#fff",
borderWidth:1,
borderColor:"#ddd",
borderRadius:8,
marginBottom:10
},

item:{
padding:12,
borderBottomWidth:1,
borderBottomColor:"#eee"
}

});
