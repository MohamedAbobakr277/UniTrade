import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
  },
  row: {
    paddingHorizontal: 16,
    gap: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: '48%', // Ensure 2 columns fit well
  },
  imageWrapper: { 
    position: "relative" 
  },
  image: { 
    width: "100%", 
    aspectRatio: 1, 
    resizeMode: "cover" 
  },
  conditionBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conditionText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "600" 
  },
  soldOutBadge: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtnActive: { 
    backgroundColor: "rgba(255,255,255,0.85)" 
  },
  cardBody: {
    padding: 10
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2
  },
  university: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellerInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1 
  },
  avatar: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    marginRight: 5 
  },
  sellerName: { 
    fontSize: 12, 
    flex: 1 
  },
  timeRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 3 
  },
  timeText: { 
    fontSize: 11, 
    color: "#94a3b8" 
  },
});

export default styles;