import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 25,
    color: "#111827",
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
    color: "#111827",
    fontSize: 15,
  },

  error: {
    color: "#DC2626",
    marginBottom: 10,
    fontSize: 13,
  },

  button: {
    borderRadius: 14,
    height: 50,
    overflow: "hidden",
  },

  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
  },

  buttonText: {
    textAlign: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 25,
  },
});