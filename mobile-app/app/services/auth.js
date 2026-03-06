// src/services/auth.js

import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";


/* ================= SIGN UP ================= */

export async function signUp(firstName, lastName, email, password, faculty, university, phoneNumber) {
  try {

    if (!email.endsWith(".edu.eg")) {
      throw new Error("You must use a university email (.edu.eg).");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    // تحديث بيانات المستخدم من Firebase
    await user.reload();

    // إرسال رسالة التحقق
    await sendEmailVerification(user);

    // حفظ بياناته مؤقتاً
    await setDoc(doc(db, "pendingUsers", user.uid), {
      firstName,
      lastName,
      email,
      faculty,
      university,
      phoneNumber,
      createdAt: serverTimestamp()
    });

    return user.uid;

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    throw new Error(error.message || "Sign up failed.");
  }
}


/* ================= LOGIN ================= */

export async function login(email, password) {

  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;


    /* ===== VERIFY EMAIL ===== */

    if (!user.emailVerified) {

      throw new Error("Please verify your email before logging in.");

    }


    /* ===== CHECK USER IN USERS COLLECTION ===== */

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);


    if (!userSnap.exists()) {

      const pendingRef = doc(db, "pendingUsers", user.uid);

      const pendingSnap = await getDoc(pendingRef);


      if (!pendingSnap.exists()) {

        throw new Error("Account data not found. Please sign up again.");

      }


      const pendingData = pendingSnap.data();


      await setDoc(userRef, {
        ...pendingData,
        role: "student",
        createdAt: serverTimestamp()
      });


      await deleteDoc(pendingRef);

    }

    return {
      uid: user.uid,
      email: user.email
    };

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    if (error.code) {

      switch (error.code) {

        case "auth/invalid-email":
          throw new Error("Invalid email.");

        case "auth/user-not-found":
          throw new Error("User not found.");

        case "auth/wrong-password":
          throw new Error("Incorrect password.");

        case "auth/too-many-requests":
          throw new Error("Too many attempts. Try later.");

      }

    }

    throw new Error(error.message || "Login failed.");

  }

}


/* ================= FORGOT PASSWORD ================= */

export async function forgotPassword(email) {

  try {

    await sendPasswordResetEmail(auth, email);

  } catch (error) {

    console.error("FORGOT PASSWORD ERROR:", error);

    if (error.code === "auth/invalid-email") {

      throw new Error("Invalid email address.");

    }

    throw new Error("Unable to send reset email.");

  }

}


/* ================= RESET PASSWORD ================= */

export async function resetPasswordWithCode(oobCode, newPassword) {

  try {

    await confirmPasswordReset(auth, oobCode, newPassword);

  } catch (error) {

    console.error("RESET PASSWORD ERROR:", error);

    if (error.code === "auth/expired-action-code") {

      throw new Error("Reset link expired.");

    }

    if (error.code === "auth/weak-password") {

      throw new Error("Password must be at least 6 characters.");

    }

    throw new Error("Password reset failed.");

  }

}


/* ================= LOGOUT ================= */

export async function logout() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error("LOGOUT ERROR:", error);

    throw new Error("Logout failed.");

  }

}