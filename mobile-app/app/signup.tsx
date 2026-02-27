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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "./styles2";

// Import auth service
import { signUp } from "./services/auth";

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

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.edu\.eg$/;

  // ✅ Phone validation (Egyptian numbers)
  const phoneRegex: RegExp = /^01[0-9]{9}$/;

  const isFormValid =
    firstName &&
    lastName &&
    email &&
    emailRegex.test(email) &&
    university &&
    faculty &&
    phone &&
    phoneRegex.test(phone) &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleSignUp = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Error",
        "Please fill all fields correctly.\nUse university email (.edu.eg)\nPhone must be 11 digits and start with 01."
      );
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
        "Success",
        "Account created successfully! Please verify your email."
      );
      router.push("/");
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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
            placeholder="University Email (e.g. name@cu.edu.eg)"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {email.length > 0 && !emailRegex.test(email) && (
          <Text style={{ color: "red", fontSize: 12, marginBottom: 10, marginLeft: 10 }}>
            Email must end with .edu.eg
          </Text>
        )}

        {/* University */}
        <View style={styles.inputBox}>
          <Feather name="book" size={18} color="#396cda" />
          <TextInput
            placeholder="University"
            value={university}
            onChangeText={setUniversity}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Faculty */}
        <View style={styles.inputBox}>
          <Feather name="briefcase" size={18} color="#396cda" />
          <TextInput
            placeholder="Faculty"
            value={faculty}
            onChangeText={setFaculty}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputBox}>
          <Feather name="phone" size={18} color="#396cda" />
          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setPhone(cleaned);
            }}
            keyboardType="number-pad"
            maxLength={11}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {phone.length > 0 && !phoneRegex.test(phone) && (
          <Text style={{ color: "red", fontSize: 12, marginBottom: 10, marginLeft: 10 }}>
            Phone must be 11 digits and start with 01
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
            placeholderTextColor="#9CA3AF"
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
            secureTextEntry={!showConfirm}
            placeholderTextColor="#9CA3AF"
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
  );
};

export default SignUpScreen;