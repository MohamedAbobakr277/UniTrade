// mobile-app/app/signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./signup.styles";

import { signUp } from "../services/auth";

const SignUpScreen: React.FC = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [showUniversityList, setShowUniversityList] = useState<boolean>(false);
  const [showFacultyList, setShowFacultyList] = useState<boolean>(false);

  const universities = [
    "Cairo University",
    "Ain Shams University",
    "Alexandria University",
    "Mansoura University",
    "Assiut University",
    "Helwan University",
    "Tanta University",
    "Zagazig University",
    "Suez Canal University",
    "Al-Azhar University",
    "German University in Cairo",
    "British University in Egypt",
    "October 6 University",
    "Future University in Egypt",
    "AASTMT",
    "Nile University",
    "Others",
  ];

  const faculties = [
    "Computer Science",
    "Engineering",
    "Medicine",
    "Pharmacy",
    "Law",
    "Business Administration",
    "Dentistry",
    "Arts",
    "Science",
    "Nursing",
    "Others",
  ];

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.edu\.eg$/;
  const phoneRegex: RegExp = /^(010|011|012|015)[0-9]{8}$/;

  const isFormValid =
    firstName.length > 0 &&
    lastName.length > 0 &&
    emailRegex.test(email) &&
    university.length > 0 &&
    faculty.length > 0 &&
    phoneRegex.test(phone) &&
    password.length >= 6 &&
    confirmPassword === password;

  const handleSignUp = async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Please check the red hints and complete the form.");
      return;
    }

    setLoading(true);

    try {
      await signUp(
        firstName,
        lastName,
        email,
        password,
        faculty,
        university,
        phone
      );

      Alert.alert(
     "Verify your email",
        "Account created successfully. Please check your email to verify your account before logging in."
   );

     router.replace("/");

    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownList = (
    data: string[],
    selectedValue: string,
    onSelect: (val: string) => void,
    isVisible: boolean,
    iconName: any
  ) => {
    if (!isVisible || data.length === 0) return null;

    return (
      <View style={localStyles.listContainer}>
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {data.map((item) => {
            const isSelected = item === selectedValue;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.6}
                onPress={() => onSelect(item)}
                style={[
                  localStyles.listItem,
                  isSelected && localStyles.selectedItem,
                ]}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                  <View style={localStyles.iconWrapper}>
                    <Feather
                      name={iconName}
                      size={14}
                      color={isSelected ? "#2563EB" : "#9CA3AF"}
                    />
                  </View>

                  <Text
                    style={[
                      localStyles.itemText,
                      isSelected && localStyles.selectedItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </View>

                {isSelected && (
                  <Feather name="check-circle" size={18} color="#2563EB" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[styles.container, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Create Account</Text>

          {/* First Name */}
          <View style={styles.inputBox}>
            <Feather name="user" size={18} color="#396cda" />
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputBox}>
            <Feather name="user" size={18} color="#396cda" />
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          {/* Email */}
          <View style={styles.inputBox}>
            <Feather name="mail" size={18} color="#396cda" />
            <TextInput
              placeholder="University Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {email.length > 0 && !emailRegex.test(email) && (
            <Text style={localStyles.errorHint}>Must end with .edu.eg</Text>
          )}

          {/* University */}
          <View
            style={[
              styles.inputBox,
              showUniversityList && localStyles.inputBoxActive,
            ]}
          >
            <Feather name="book" size={18} color="#396cda" />
            <TextInput
              placeholder="University"
              value={university}
              onFocus={() => setShowUniversityList(true)}
              onChangeText={(text) => {
                setUniversity(text);
                setShowUniversityList(true);
              }}
              style={[styles.input, { flex: 1 }]}
            />

            <TouchableOpacity
              onPress={() => setShowUniversityList(!showUniversityList)}
            >
              <Feather
                name={showUniversityList ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {renderDropdownList(
            universities.filter((u) =>
              u.toLowerCase().includes(university.toLowerCase())
            ),
            university,
            (val) => {
              setUniversity(val);
              setShowUniversityList(false);
              Keyboard.dismiss();
            },
            showUniversityList,
            "map-pin"
          )}

          {/* Faculty */}
          <View
            style={[
              styles.inputBox,
              showFacultyList && localStyles.inputBoxActive,
            ]}
          >
            <Feather name="briefcase" size={18} color="#396cda" />
            <TextInput
              placeholder="Faculty"
              value={faculty}
              onFocus={() => setShowFacultyList(true)}
              onChangeText={(text) => {
                setFaculty(text);
                setShowFacultyList(true);
              }}
              style={[styles.input, { flex: 1 }]}
            />

            <TouchableOpacity
              onPress={() => setShowFacultyList(!showFacultyList)}
            >
              <Feather
                name={showFacultyList ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {renderDropdownList(
            faculties.filter((f) =>
              f.toLowerCase().includes(faculty.toLowerCase())
            ),
            faculty,
            (val) => {
              setFaculty(val);
              setShowFacultyList(false);
              Keyboard.dismiss();
            },
            showFacultyList,
            "layers"
          )}

          {/* Phone */}
          <View style={styles.inputBox}>
            <Feather name="phone" size={18} color="#396cda" />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          {phone.length > 0 && !phoneRegex.test(phone) && (
            <Text style={localStyles.errorHint}>
              Start with 010/011/012/015 (11 digits)
            </Text>
          )}

          {/* Password */}
          <View style={styles.inputBox}>
            <Feather name="lock" size={18} color="#396cda" />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>
          </View>

          {password.length > 0 && password.length < 6 && (
            <Text style={localStyles.errorHint}>
              Password must be at least 6 characters
            </Text>
          )}

          {/* Confirm Password */}
          <View style={styles.inputBox}>
            <Feather name="lock" size={18} color="#396cda" />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Feather
                name={showConfirm ? "eye" : "eye-off"}
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>
          </View>

          {confirmPassword.length > 0 && confirmPassword !== password && (
            <Text style={localStyles.errorHint}>Passwords do not match</Text>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, { opacity: isFormValid ? 1 : 0.6 }]}
            disabled={!isFormValid || loading}
            onPress={handleSignUp}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.signup}>
            Already have an account?{" "}
            <Text
              style={{ color: "#2563EB", fontWeight: "600" }}
              onPress={() => router.back()}
            >
              Log In
            </Text>
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  inputBoxActive: {
    borderColor: "#2563EB",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },

  listContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxHeight: 200,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#2563EB",
    marginBottom: 20,
    elevation: 5,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  selectedItem: {
    backgroundColor: "#F0F7FF",
  },

  itemText: {
    fontSize: 15,
    color: "#374151",
  },

  selectedItemText: {
    color: "#2563EB",
    fontWeight: "600",
  },

  errorHint: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default SignUpScreen;