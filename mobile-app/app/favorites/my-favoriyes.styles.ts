import{ StyleSheet } from "react-native";
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
export default styles;