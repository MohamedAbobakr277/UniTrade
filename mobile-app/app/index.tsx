// mobile-app/app/login.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import styles from "./styles";

import { login, getFriendlyAuthError } from "./services/auth";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

const LoginScreen: React.FC = () => {

  const router = useRouter();

  const [showPassword,setShowPassword] = useState(false);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  /* ================= AUTO LOGIN ================= */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user)=>{

      if(user){

        await user.reload(); // تحديث حالة المستخدم

        if(user.emailVerified){
          router.replace("/Home/home");
        }

      }

    });

    return unsubscribe;

  },[router]);


  /* ================= LOGIN FUNCTION ================= */

  const handleLogin = async () => {

    if(!email || !password){
      Alert.alert("Error","Please enter email and password");
      return;
    }

    if(!emailRegex.test(email)){
      Alert.alert("Error","Invalid email format");
      return;
    }

    try{

      setLoading(true);

      await login(email,password);

      // التحويل يتم تلقائيا من onAuthStateChanged

    }catch(err:any){

      const errorMsg = err.code ? getFriendlyAuthError(err.code) : err.message;
      Alert.alert("Login Failed", errorMsg);

    }finally{

      setLoading(false);

    }

  };


  /* ================= UI ================= */

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#fff"/>

        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>


        {/* EMAIL */}

        <View style={styles.inputBox}>

          <Feather name="mail" size={18} color="#396cda"/>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

        </View>


        {/* PASSWORD */}

        <View style={styles.inputBox}>

          <Feather name="lock" size={18} color="#4b76d2"/>

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>

            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={18}
              color="#2563EB"
            />

          </TouchableOpacity>

        </View>


        {/* FORGOT PASSWORD */}

        <TouchableOpacity onPress={()=>router.push("/forgot-password/forgot-password")}>

          <Text style={styles.forgot}>Forgot Password?</Text>

        </TouchableOpacity>


        {/* LOGIN BUTTON */}

        <TouchableOpacity
          style={[styles.button,{opacity: email && password ? 1 : 0.6}]}
          disabled={!email || !password || loading}
          onPress={handleLogin}
        >

          <LinearGradient
            colors={["#3B82F6","#2563EB"]}
            style={styles.buttonGradient}
          >

            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Log In"}
            </Text>

          </LinearGradient>

        </TouchableOpacity>


        {/* SIGNUP */}

        <Text style={styles.signup}>

          Don’t have an account?{" "}

          <Text
            style={{color:"#2563EB",fontWeight:"600"}}
            onPress={()=>router.push("/SignUp/signup")}
          >

            Sign Up

          </Text>

        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

};

export default LoginScreen;