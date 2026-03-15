import { StyleSheet } from "react-native";

export default StyleSheet.create({

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