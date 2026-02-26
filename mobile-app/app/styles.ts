import { StyleSheet } from "react-native";
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  logo: {
    width: 160,
    height: 160,
    alignSelf: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#216da4",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 30,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
  },

  forgot: {
    color: "#2563EB",
    textAlign: "right",
    marginBottom: 20,
    fontWeight: "500",
  },

  button: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 25,
  },

  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  signup: {
    textAlign: "center",
    color: "#6B7280",
  },
});