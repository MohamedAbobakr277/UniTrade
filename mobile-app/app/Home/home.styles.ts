import { StyleSheet } from "react-native";
const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f7fb"
},

paddingWrapper:{
paddingHorizontal:15
},

headerRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
marginTop:10,
marginBottom:12
},

header:{
fontSize:24,
fontWeight:"700"
},

logo:{
width:40,
height:40
},

searchBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"white",
paddingHorizontal:12,
borderRadius:12,
height:45,
marginBottom:15
},

searchInput:{
marginLeft:10,
flex:1
},

categoryCard:{
backgroundColor:"#2563EB",
width:80,
height:85,
borderRadius:14,
marginRight:10,
alignItems:"center",
justifyContent:"center"
},

categoryText:{
color:"white",
fontSize:11,
marginTop:4,
textAlign:"center"
},

card:{
backgroundColor:"white",
borderRadius:14,
width:"48%",
marginBottom:15,
overflow:"hidden",
elevation:3
},

columnWrapper:{
justifyContent:"space-between",
paddingHorizontal:15
},

flatListContent:{
paddingBottom:100
},

image:{
width:"100%",
height:120
},

favoriteBtn:{
position:"absolute",
top:8,
right:8,
backgroundColor:"rgba(0,0,0,0.4)",
padding:6,
borderRadius:20
},

cardContent:{
padding:10
},

title:{
fontSize:14,
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
},

sellerRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginTop:6
},

sellerImage:{
width:22,
height:22,
borderRadius:20,
marginRight:6
},

sellerName:{
fontSize:12,
color:"#475569"
},

time:{
fontSize:11,
color:"#94a3b8",
marginLeft:4
}

});
export default styles;