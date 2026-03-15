import { StyleSheet } from "react-native";
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
soldBadge:{
position:"absolute",
top:8,
left:8,
backgroundColor:"#ef4444",
paddingHorizontal:8,
paddingVertical:3,
borderRadius:6,
zIndex:10
},

soldTextBadge:{
color:"white",
fontSize:10,
fontWeight:"700"
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

soldRow:{
alignItems:"center",
marginTop:6
},

soldBtn:{
backgroundColor:"#16a34a",
padding:6,
borderRadius:20
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
export default styles;