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
    query,
    collection,
    where,
    getDocs
} from "firebase/firestore";

/* ================= SIGN UP ================= */
export async function signUp(firstName, lastName, email, password, faculty, university, phoneNumber) {
    try {
        if (!email.endsWith(".edu.eg")) {
            throw new Error("University email (.edu.eg) is required");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const actionCodeSettings = {
            url: "http://localhost:5177/login",
            handleCodeInApp: true
        };

        await sendEmailVerification(user, actionCodeSettings);

        await setDoc(doc(db, "pendingUsers", user.uid), {
            firstName,
            lastName,
            email,
            faculty,
            university,
            phoneNumber,
            createdAt: new Date()
        });

    } catch (error) {
        console.error("SIGNUP ERROR:", error);

        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    throw new Error("This email is already registered.");
                case "auth/invalid-email":
                    throw new Error("The email address is not valid.");
                case "auth/weak-password":
                    throw new Error("Password should be at least 6 characters.");
            }
        }

        if (error.message) {
            throw new Error(error.message);
        }

        throw new Error("Sign up failed. Please try again.");
    }
}

/* ================= LOGIN ================= */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in.");
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const pendingRef = doc(db, "pendingUsers", user.uid);
            const pendingSnap = await getDoc(pendingRef);

            if (!pendingSnap.exists()) {
                throw new Error("No account exists with this email. Please sign up first.");
            }

            const pendingData = pendingSnap.data();

            await setDoc(userRef, {
                ...pendingData,
                role: "student",
                createdAt: new Date()
            });

            await deleteDoc(pendingRef);
        }

        return user.uid;

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        if (error.code) {
            switch (error.code) {
                case "auth/invalid-email":
                    throw new Error("The email address is not valid.");
                case "auth/user-not-found":
                    throw new Error("No account found with this email.");
                case "auth/wrong-password":
                    throw new Error("Incorrect password. Please try again.");
                case "auth/too-many-requests":
                    throw new Error("Too many attempts. Please try again later.");
                case "auth/invalid-credential":
                    throw new Error("Invalid email or password.");
            }
        }

        if (error.message) {
            throw new Error(error.message);
        }

        throw new Error("Something went wrong. Please try again.");
    }
}

/* ================= FORGOT PASSWORD ================= */
export async function forgotPassword(email) {
    try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("No account exists with this email.");
        }

        const actionCodeSettings = {
            url: "http://localhost:5177/reset-password",
            handleCodeInApp: true
        };

        await sendPasswordResetEmail(auth, email, actionCodeSettings);

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        if (error.code) {
            switch (error.code) {
                case "auth/invalid-email":
                    throw new Error("The email address is not valid.");
                case "auth/user-not-found":
                    throw new Error("No account found with this email.");
            }
        }

        if (error.message) {
            throw new Error(error.message);
        }

        throw new Error("Unable to send password reset email.");
    }
}

/* ================= RESET PASSWORD ================= */
export async function resetPasswordWithCode(oobCode, newPassword) {
    try {
        await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        if (error.code) {
            switch (error.code) {
                case "auth/expired-action-code":
                    throw new Error("Reset link has expired. Please request a new one.");
                case "auth/invalid-action-code":
                    throw new Error("Invalid or already used reset link.");
                case "auth/weak-password":
                    throw new Error("Password should be at least 6 characters.");
            }
        }

        throw new Error("Failed to reset password.");
    }
}

/* ================= LOGOUT ================= */
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        throw new Error("Failed to logout. Please try again.");
    }
}