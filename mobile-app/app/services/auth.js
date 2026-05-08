import { auth, db } from "./firebase";

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

export async function signUp(
  firstName,
  lastName,
  email,
  password,
  faculty,
  university,
  phoneNumber
) {
  try {

    if (!email.endsWith(".edu.eg")) {
      throw new Error("Use university email (.edu.eg)");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await sendEmailVerification(user);

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
    throw error;
  }
}


/* ================= LOGIN ================= */

export async function login(email, password) {

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      throw new Error("Verify your email first");
    }

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      const pendingRef = doc(db, "pendingUsers", user.uid);

      const pendingSnap = await getDoc(pendingRef);

      if (!pendingSnap.exists()) {
        throw new Error("Account not found");
      }

      const pendingData = pendingSnap.data();

      await setDoc(userRef, {
        ...pendingData,
        role: "student",
        createdAt: serverTimestamp()
      });

      await deleteDoc(pendingRef);
    }

    return user;

  } catch (error) {
    throw error;
  }
}


/* ================= FORGOT PASSWORD ================= */

export async function forgotPassword(email) {
  try {
    // Configure action code settings to redirect back to the app
    // Note: The URL must be an authorized domain in the Firebase Console
    const actionCodeSettings = {
      url: `https://unitrade-app.firebaseapp.com/reset-password?email=${email}`,
      handleCodeInApp: true,
      android: {
        packageName: "com.ahmed21299.UniTrade",
        installApp: true,
      },
      iOS: {
        bundleId: "com.ahmed21299.UniTrade",
      },
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

  } catch (error) {
    console.log("FORGOT ERROR:", error);
    throw error;
  }
}


/* ================= RESET PASSWORD ================= */

export async function resetPasswordWithCode(
  oobCode,
  newPassword
) {

  try {

    await confirmPasswordReset(auth, oobCode, newPassword);

  } catch (error) {
    throw error;
  }
}


/* ================= LOGOUT ================= */

export async function logout() {

  try {

    await signOut(auth);

  } catch (error) {
    throw error;
  }
}

/* ================= ERROR HANDLING ================= */

export function getFriendlyAuthError(errorCode) {
  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password";

    case "auth/user-not-found":
      return "Account not found";

    case "auth/email-already-in-use":
      return "This email is already registered";

    case "auth/invalid-email":
      return "Please enter a valid email address";

    case "auth/weak-password":
      return "Password is too weak";

    case "auth/network-request-failed":
      return "Network error. Please check your connection";
      
    case "auth/expired-action-code":
      return "The reset link has expired";

    case "auth/invalid-action-code":
      return "Invalid reset link. Please check your email again.";

    default:
      return "Something went wrong. Please try again later.";
  }
}