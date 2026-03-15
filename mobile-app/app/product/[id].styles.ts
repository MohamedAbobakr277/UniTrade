import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({

screen:{
flex:1,
backgroundColor:"#F3F4F6"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

image:{
width:width,
height:260,
resizeMode:"contain",
backgroundColor:"white"
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

imageCount:{
position:"absolute",
bottom:15,
right:15,
backgroundColor:"rgba(0,0,0,0.6)",
paddingHorizontal:8,
paddingVertical:4,
borderRadius:6
},

imageCountText:{
color:"white"
},

backBtn:{
position:"absolute",
top:50,
left:15,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

favorite:{
position:"absolute",
top:50,
right:60,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

share:{
position:"absolute",
top:50,
right:15,
backgroundColor:"rgba(255,255,255,0.8)",
padding:10,
borderRadius:30
},

content:{
padding:20
},

price:{
fontSize:30,
fontWeight:"bold",
color:"#2563EB"
},

title:{
fontSize:20,
marginTop:6,
fontWeight:"600"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:6
},

location:{
color:"#6B7280"
},

date:{
color:"#6B7280"
},

description:{
marginTop:15,
fontSize:15,
lineHeight:22,
color:"#374151"
},

infoRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
},

infoCard:{
backgroundColor:"#EFF6FF",
width:"48%",
padding:15,
borderRadius:12,
alignItems:"center"
},

infoValue:{
fontSize:18,
fontWeight:"bold",
color:"#1E3A8A"
},

infoLabel:{
marginTop:4,
color:"#6B7280"
},

sellerCard:{
marginTop:25,
padding:15,
backgroundColor:"white",
borderRadius:12
},

sellerTitle:{
fontWeight:"600",
marginBottom:5
},

sellerRow:{
flexDirection:"row",
alignItems:"center"
},

sellerImage:{
width:45,
height:45,
borderRadius:50,
marginRight:10
},

sellerName:{
color:"#374151",
fontSize:16
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
