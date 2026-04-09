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

    if (error.code === "auth/email-already-in-use")
      throw new Error("Email already used");

    if (error.code === "auth/invalid-email")
      throw new Error("Invalid email");

    if (error.code === "auth/weak-password")
      throw new Error("Weak password");

    throw new Error(error.message);
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

    if (error.code === "auth/user-not-found")
      throw new Error("User not found");

    if (error.code === "auth/wrong-password")
      throw new Error("Wrong password");

    throw new Error(error.message);
  }
}


/* ================= FORGOT PASSWORD ================= */

export async function forgotPassword(email) {

  try {

    await sendPasswordResetEmail(auth, email);

  } catch (error) {

    if (error.code === "auth/invalid-email")
      throw new Error("Invalid email");

    throw new Error("Cannot send reset email");
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

    if (error.code === "auth/expired-action-code")
      throw new Error("Link expired");

    if (error.code === "auth/weak-password")
      throw new Error("Weak password");

    throw new Error("Reset failed");
  }
}


/* ================= LOGOUT ================= */

export async function logout() {

  try {

    await signOut(auth);

  } catch (error) {

    throw new Error("Logout failed");
  }
}