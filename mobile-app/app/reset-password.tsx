// mobile-app/app/reset-password.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { confirmPasswordReset } from "firebase/auth";
import { auth } from "./firebase";

import styles from "./reset-styles";

export default function ResetPassword() {

  const router = useRouter();

  // الكود القادم من رابط الايميل
  const { oobCode } = useLocalSearchParams();

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [error,setError] = useState("");

  const [showPassword,setShowPassword] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);


  const handleChange = async () => {

    try{

      setError("");

      if(!password || !confirm){
        setError("Fill all fields");
        return;
      }

      if(password.length < 6){
        setError("Password must be at least 6 characters");
        return;
      }

      if(password !== confirm){
        setError("Passwords do not match");
        return;
      }

      if(!oobCode){
        setError("Invalid reset link");
        return;
      }

      await confirmPasswordReset(
        auth,
        oobCode as string,
        password
      );

      Alert.alert(
        "Success",
        "Password changed successfully",
        [
          {
            text:"Login",
            onPress:()=>router.replace("/")
          }
        ]
      );

    }catch(err:any){

      console.log("RESET ERROR:",err);

      if(err.code === "auth/expired-action-code"){
        setError("Reset link expired");
        return;
      }

      if(err.code === "auth/invalid-action-code"){
        setError("Invalid reset link");
        return;
      }

      if(err.code === "auth/weak-password"){
        setError("Password must be at least 6 characters");
        return;
      }

      setError("Password reset failed");

    }

  };


  return (

    <View style={styles.container}>

      <StatusBar barStyle="dark-content"/>

      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Reset Password</Text>

      {/* NEW PASSWORD */}

      <View style={styles.inputBox}>

        <TextInput
          placeholder="New Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>

          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#2563EB"
          />

        </TouchableOpacity>

      </View>


      {/* CONFIRM PASSWORD */}

      <View style={styles.inputBox}>

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />

        <TouchableOpacity onPress={()=>setShowConfirm(!showConfirm)}>

          <Feather
            name={showConfirm ? "eye" : "eye-off"}
            size={20}
            color="#2563EB"
          />

        </TouchableOpacity>

      </View>


      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}


      <TouchableOpacity onPress={handleChange}>

        <LinearGradient
          colors={["#3B82F6","#2563EB"]}
          style={styles.button}
        >

          <Text style={styles.buttonText}>
            Change Password
          </Text>

        </LinearGradient>

      </TouchableOpacity>

    </View>

  );

}