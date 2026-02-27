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
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles2";
<<<<<<< HEAD
import { signUp } from "./services/authService";
export default function SignUpScreen() {
=======

// Import auth service
import { signUp } from "./services/auth";

const SignUpScreen: React.FC = () => {
>>>>>>> c81c6c914d91df757f591ac707446901da0308d1
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
    "Education",
    "Agriculture",
    "Economics",
    "Philosophy",
    "Mass Communication",
  ];

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid =
    firstName &&
    lastName &&
    email &&
    emailRegex.test(email) &&
    university &&
    faculty &&
    phone &&
    password &&
    confirmPassword &&
    password === confirmPassword;

<<<<<<< HEAD
  const handleSignUp =async () => {
    if (!isFormValid) return;
    try {
    const uid = await signUp(
      firstName,
      lastName,
      email,
      password,
      university,
      faculty,
      phone
    );
    alert("Verification email sent! Check your inbox.");
    router.push("/");
  } catch (err: any) {
    alert(err.message);
  }
};
=======
  const handleSignUp = async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await signUp(firstName, lastName, email, password, faculty, university, phone);
      Alert.alert("Success", "Account created successfully! Please verify your email.");
      router.push("/");

    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
>>>>>>> c81c6c914d91df757f591ac707446901da0308d1

  const filteredUniversities = universities.filter((uni) =>
    uni.toLowerCase().includes(university.toLowerCase())
  );

  const filteredFaculties = faculties.filter((fac) =>
    fac.toLowerCase().includes(faculty.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

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
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* University */}
        <View style={[styles.inputBox, { flexDirection: "row", alignItems: "center" }]}>
          <Feather name="book" size={18} color="#396cda" />
          <TextInput
            placeholder="University"
            value={university}
            onChangeText={(text) => {
              setUniversity(text);
              setShowUniversityList(true);
            }}
            placeholderTextColor="#9CA3AF"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => setShowUniversityList(!showUniversityList)}
            style={{
              marginLeft: 5,
              backgroundColor: "#e0e0e0",
              padding: 6,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather
              name={showUniversityList ? "chevron-up" : "chevron-down"}
              size={20}
              color="#396cda"
            />
          </TouchableOpacity>
        </View>

        {showUniversityList && filteredUniversities.length > 0 && (
          <View style={{ backgroundColor: "#fff", maxHeight: 200, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
            <FlatList
              data={filteredUniversities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setUniversity(item);
                    setShowUniversityList(false);
                  }}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled
            />
          </View>
        )}

        {/* Faculty */}
        <View style={[styles.inputBox, { flexDirection: "row", alignItems: "center" }]}>
          <Feather name="briefcase" size={18} color="#396cda" />
          <TextInput
            placeholder="Faculty"
            value={faculty}
            onChangeText={(text) => {
              setFaculty(text);
              setShowFacultyList(true);
            }}
            placeholderTextColor="#9CA3AF"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => setShowFacultyList(!showFacultyList)}
            style={{
              marginLeft: 5,
              backgroundColor: "#e0e0e0",
              padding: 6,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather
              name={showFacultyList ? "chevron-up" : "chevron-down"}
              size={20}
              color="#396cda"
            />
          </TouchableOpacity>
        </View>

        {showFacultyList && filteredFaculties.length > 0 && (
          <View style={{ backgroundColor: "#fff", maxHeight: 200, borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
            <FlatList
              data={filteredFaculties}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setFaculty(item);
                    setShowFacultyList(false);
                  }}
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" }}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled
            />
          </View>
        )}

        {/* Phone */}
        <View style={styles.inputBox}>
          <Feather name="phone" size={18} color="#396cda" />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputBox}>
          <Feather name="lock" size={18} color="#396cda" />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CA3AF"
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

        {/* Confirm Password */}
        <View style={styles.inputBox}>
          <Feather name="lock" size={18} color="#396cda" />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#9CA3AF"
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

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, { opacity: isFormValid ? 1 : 0.6 }]}
          disabled={!isFormValid || loading}
          onPress={handleSignUp}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
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
  );
};

export default SignUpScreen;