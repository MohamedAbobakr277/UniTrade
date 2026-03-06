import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BottomNav() {

const router = useRouter();

return (

<View style={styles.container}>

<TouchableOpacity
style={styles.tab}
onPress={()=>router.push("/home")}
>

<Feather name="home" size={22} color="#2563EB"/>
<Text style={styles.label}>Home</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.tab}
onPress={()=>router.push("/sell")}
>

<Feather name="plus-circle" size={22} color="#2563EB"/>
<Text style={styles.label}>Sell</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.tab}
onPress={()=>router.push("../ads")}
>

<Feather name="list" size={22} color="#2563EB"/>
<Text style={styles.label}>My Ads</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.tab}
onPress={()=>router.push("../account")}
>

<Feather name="user" size={22} color="#2563EB"/>
<Text style={styles.label}>Account</Text>

</TouchableOpacity>

</View>

);

}

const styles = StyleSheet.create({

container:{
position:"absolute",
bottom:0,
left:0,
right:0,
height:70,
backgroundColor:"white",
flexDirection:"row",
justifyContent:"space-around",
alignItems:"center",
borderTopWidth:1,
borderColor:"#eee",
elevation:10
},

tab:{
alignItems:"center"
},

label:{
fontSize:12,
marginTop:3
}

});