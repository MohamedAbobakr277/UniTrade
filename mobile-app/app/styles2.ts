import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },

  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 25,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
    fontSize: 14,
  },

  forgot: {
    alignSelf: "flex-end",
    color: "#2563EB",
    marginBottom: 20,
    fontSize: 13,
  },

  button: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },

  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  signup: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default styles;