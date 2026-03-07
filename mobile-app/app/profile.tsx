import React, { useState, useEffect } from "react";
import {
View,
Text,
Image,
ScrollView,
TouchableOpacity,
StyleSheet,
Modal,
TextInput,
Alert
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { auth, db } from "./firebase";

import {
doc,
getDoc,
updateDoc,
collection,
query,
where,
onSnapshot,
deleteDoc
} from "firebase/firestore";

import { signOut } from "firebase/auth";

export default function Profile(){

const router = useRouter();

const [user,setUser] = useState<any>(null);
const [items,setItems] = useState<any[]>([]);
const [editVisible,setEditVisible] = useState(false);

const [firstName,setFirstName] = useState("");
const [lastName,setLastName] = useState("");
const [phone,setPhone] = useState("");

const [faculty,setFaculty] = useState("");
const [university,setUniversity] = useState("");

const [showUniversityList,setShowUniversityList] = useState(false);
const [showFacultyList,setShowFacultyList] = useState(false);

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
"Future University in Egypt",
"AASTMT",
"Nile University",
"Others"
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
"Others"
];

/* ================= USER DATA ================= */

useEffect(()=>{

const loadUser = async ()=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

const ref = doc(db,"users",uid);

const snap = await getDoc(ref);

if(snap.exists()){

const data = snap.data();

setUser(data);

setFirstName(data.firstName || "");
setLastName(data.lastName || "");
setPhone(data.phoneNumber || "");
setFaculty(data.faculty || "");
setUniversity(data.university || "");

}

};

loadUser();

},[]);


/* ================= USER PRODUCTS ================= */

useEffect(()=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

const q = query(
collection(db,"products"),
where("userId","==",uid)
);

const unsub = onSnapshot(q,(snapshot)=>{

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setItems(data);

});

return unsub;

},[]);


/* ================= DELETE PRODUCT ================= */

const deleteProduct = (id:string)=>{

Alert.alert(
"Delete Product",
"Are you sure you want to delete this product?",
[
{text:"Cancel"},
{
text:"Delete",
style:"destructive",
onPress:async ()=>{

await deleteDoc(doc(db,"products",id));

}
}
]
);

};


/* ================= PICK IMAGE ================= */

const pickImage = async ()=>{

let result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ImagePicker.MediaTypeOptions.Images,
quality:1
});

if(!result.canceled){

const uri = result.assets[0].uri;

setUser({
...user,
profilePhoto:uri
});

const uid = auth.currentUser?.uid;

if(!uid) return;

await updateDoc(doc(db,"users",uid),{
profilePhoto:uri
});

}

};


/* ================= SAVE PROFILE ================= */

const saveProfile = async ()=>{

const uid = auth.currentUser?.uid;

if(!uid) return;

await updateDoc(doc(db,"users",uid),{
firstName,
lastName,
phoneNumber:phone,
faculty,
university
});

setUser({
...user,
firstName,
lastName,
phoneNumber:phone,
faculty,
university
});

setEditVisible(false);

};


/* ================= LOGOUT ================= */

const handleLogout = async ()=>{

await signOut(auth);

router.replace("/");

};


return(

<ScrollView
style={styles.container}
contentContainerStyle={{paddingBottom:200}}
showsVerticalScrollIndicator={false}
>

<View style={styles.headerCard}>

<TouchableOpacity onPress={pickImage}>

<Image
source={{
uri:user?.profilePhoto ||
"https://images.unsplash.com/photo-1633332755192-727a05c4013d"
}}
style={styles.avatar}
/>

<View style={styles.cameraIcon}>
<Feather name="camera" size={16} color="white"/>
</View>

</TouchableOpacity>

<Text style={styles.name}>
{user?.firstName} {user?.lastName}
</Text>

<Text style={styles.university}>
{user?.university}
</Text>

<View style={styles.actions}>

<TouchableOpacity
style={styles.editBtnProfile}
onPress={()=>setEditVisible(true)}
>

<Feather name="edit" size={16} color="#2563EB"/>

<Text style={styles.editText}>
Edit Profile
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.resetBtn}
onPress={()=>router.push("/forgot-password")}
>

<Feather name="lock" size={16} color="white"/>

<Text style={styles.resetText}>
Reset Password
</Text>

</TouchableOpacity>

</View>

</View>


<View style={styles.infoCard}>

<Text style={styles.sectionTitle}>
Personal Information
</Text>

<View style={styles.infoRow}>
<Feather name="mail" size={18} color="#2563EB"/>
<Text style={styles.infoText}>{user?.email}</Text>
</View>

<View style={styles.infoRow}>
<Feather name="phone" size={18} color="#2563EB"/>
<Text style={styles.infoText}>{user?.phoneNumber}</Text>
</View>

<View style={styles.infoRow}>
<Feather name="book" size={18} color="#2563EB"/>
<Text style={styles.infoText}>{user?.faculty}</Text>
</View>

<View style={styles.infoRow}>
<Feather name="map-pin" size={18} color="#2563EB"/>
<Text style={styles.infoText}>{user?.university}</Text>
</View>
</View>

{/* ================= MY LISTINGS ================= */}

<View style={styles.listingsHeader}>
<Feather name="grid" size={18} color="#2563EB"/>

<Text style={styles.sectionTitle}>
My Listings
</Text>

</View>

<View style={styles.products}>

{items.map((item:any)=>{

const image =
Array.isArray(item.images) && item.images.length>0
? item.images[0]
: "https://via.placeholder.com/150";

return(

<View key={item.id} style={styles.productCard}>

<Image
source={{uri:image}}
style={styles.productImage}
/>

<View style={styles.productInfo}>

<Text style={styles.productTitle}>
{item.title}
</Text>

<Text style={styles.price}>
{item.price} EGP
</Text>

<View style={styles.actionsRow}>

<TouchableOpacity
style={styles.editBtn}
onPress={()=>router.push({
pathname:"/edit-product",
params:{id:item.id}
})}
>
<Feather name="edit" size={14} color="white"/>
<Text style={styles.actionText}>Edit</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.deleteBtn}
onPress={()=>deleteProduct(item.id)}
>
<Feather name="trash-2" size={14} color="white"/>
<Text style={styles.actionText}>Delete</Text>
</TouchableOpacity>

</View>

</View>

</View>

);

})}

</View>


{/* SIGN OUT */}

<TouchableOpacity
style={styles.logoutBtn}
onPress={handleLogout}
>

<Feather name="log-out" size={18} color="white"/>

<Text style={styles.logoutText}>
Sign Out
</Text>

</TouchableOpacity>


{/* EDIT PROFILE MODAL */}

<Modal visible={editVisible} animationType="slide">

<View style={styles.modal}>

<Text style={styles.modalTitle}>
Edit Profile
</Text>

<TextInput
placeholder="First Name"
value={firstName}
onChangeText={setFirstName}
style={styles.input}
/>

<TextInput
placeholder="Last Name"
value={lastName}
onChangeText={setLastName}
style={styles.input}
/>

<TextInput
placeholder="Phone"
value={phone}
onChangeText={setPhone}
style={styles.input}
/>


{/* UNIVERSITY */}

<TextInput
placeholder="University"
value={university}
onFocus={()=>setShowUniversityList(true)}
onChangeText={(text)=>{
setUniversity(text);
setShowUniversityList(true);
}}
style={styles.input}
/>

{showUniversityList &&

<ScrollView style={{maxHeight:150}}>

{universities
.filter(u=>u.toLowerCase().includes(university.toLowerCase()))
.map(u=>(

<TouchableOpacity
key={u}
onPress={()=>{
setUniversity(u);
setShowUniversityList(false);
}}
style={{
padding:10,
borderBottomWidth:1,
borderColor:"#eee"
}}
>

<Text>{u}</Text>

</TouchableOpacity>

))}

</ScrollView>

}


{/* FACULTY */}

<TextInput
placeholder="Faculty"
value={faculty}
onFocus={()=>setShowFacultyList(true)}
onChangeText={(text)=>{
setFaculty(text);
setShowFacultyList(true);
}}
style={styles.input}
/>

{showFacultyList &&

<ScrollView style={{maxHeight:150}}>

{faculties
.filter(f=>f.toLowerCase().includes(faculty.toLowerCase()))
.map(f=>(

<TouchableOpacity
key={f}
onPress={()=>{
setFaculty(f);
setShowFacultyList(false);
}}
style={{
padding:10,
borderBottomWidth:1,
borderColor:"#eee"
}}
>

<Text>{f}</Text>

</TouchableOpacity>

))}

</ScrollView>

}


<View style={styles.modalButtons}>

<TouchableOpacity
style={styles.saveBtn}
onPress={saveProfile}
>
<Text style={styles.saveText}>
Save
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setEditVisible(false)}
>
<Text style={styles.cancelText}>
Cancel
</Text>
</TouchableOpacity>

</View>

</View>

</Modal>

</ScrollView>

);

}


/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f1f5f9",
padding:20
},

headerCard:{
backgroundColor:"white",
borderRadius:20,
alignItems:"center",
padding:25,
marginBottom:20,
elevation:4
},

avatar:{
width:110,
height:110,
borderRadius:60
},

cameraIcon:{
position:"absolute",
bottom:0,
right:0,
backgroundColor:"#2563EB",
padding:6,
borderRadius:20
},

name:{
fontSize:22,
fontWeight:"700",
marginTop:10
},

university:{
color:"#64748b",
marginBottom:15
},

actions:{
flexDirection:"row",
gap:10
},

editBtnProfile:{
flexDirection:"row",
alignItems:"center",
gap:5,
borderWidth:1,
borderColor:"#2563EB",
padding:10,
borderRadius:10
},

editText:{
color:"#2563EB",
fontWeight:"600"
},

resetBtn:{
flexDirection:"row",
alignItems:"center",
gap:5,
backgroundColor:"#2563EB",
padding:10,
borderRadius:10
},

resetText:{
color:"white",
fontWeight:"600"
},

infoCard:{
backgroundColor:"white",
padding:20,
borderRadius:16,
marginBottom:20
},

sectionTitle:{
fontSize:18,
fontWeight:"700",
marginBottom:10
},

infoRow:{
flexDirection:"row",
alignItems:"center",
gap:10,
marginBottom:10
},

infoText:{
fontSize:15,
color:"#334155"
},

listingsHeader:{
flexDirection:"row",
alignItems:"center",
gap:6,
marginBottom:10
},

products:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between"
},

productCard:{
width:"48%",
backgroundColor:"white",
borderRadius:14,
overflow:"hidden",
marginBottom:12
},

productImage:{
width:"100%",
height:120
},

productInfo:{
padding:10
},

productTitle:{
fontWeight:"600",
fontSize:14
},

price:{
color:"#2563EB",
fontWeight:"700",
marginTop:4
},

actionsRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:8
},

editBtn:{
flexDirection:"row",
alignItems:"center",
gap:4,
backgroundColor:"#2563EB",
padding:6,
borderRadius:6,
width:"48%",
justifyContent:"center"
},

deleteBtn:{
flexDirection:"row",
alignItems:"center",
gap:4,
backgroundColor:"#ef4444",
padding:6,
borderRadius:6,
width:"48%",
justifyContent:"center"
},

actionText:{
color:"white",
fontSize:12,
fontWeight:"600"
},

logoutBtn:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
gap:8,
backgroundColor:"#ef4444",
padding:16,
borderRadius:12,
marginTop:30
},

logoutText:{
color:"white",
fontWeight:"700",
fontSize:16
},

modal:{
flex:1,
justifyContent:"center",
padding:20,
backgroundColor:"white"
},

modalTitle:{
fontSize:22,
fontWeight:"700",
marginBottom:20
},

input:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:10,
padding:12,
marginBottom:10
},

modalButtons:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
},

saveBtn:{
backgroundColor:"#2563EB",
padding:12,
borderRadius:8
},

saveText:{
color:"white",
fontWeight:"600"
},

cancelText:{
color:"red",
fontWeight:"600"
}

});