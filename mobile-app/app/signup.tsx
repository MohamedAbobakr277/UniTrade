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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles2";
import { signUp } from "./services/authService";
export default function SignUpScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showUniversityList, setShowUniversityList] = useState(false);
  const [showFacultyList, setShowFacultyList] = useState(false);

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.5,
              elevation: 2,
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
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              maxHeight: 200,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <FlatList
              data={filteredUniversities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setUniversity(item);
                    setShowUniversityList(false);
                  }}
                  activeOpacity={0.6}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#333" }}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled={true}
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.5,
              elevation: 2,
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
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              maxHeight: 200,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <FlatList
              data={filteredFaculties}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setFaculty(item);
                    setShowFacultyList(false);
                  }}
                  activeOpacity={0.6}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#333" }}>{item}</Text>
                </TouchableOpacity>
              )}
              nestedScrollEnabled={true}
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

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { opacity: isFormValid ? 1 : 0.6 }]}
          disabled={!isFormValid}
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
}