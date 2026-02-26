import app from "./firebase.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signOut
} from "firebase/auth";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    deleteDoc
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);


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
            throw new Error("University email (.edu.eg) is required");
        }


        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        await sendEmailVerification(user);


        await setDoc(doc(db, "pendingUsers", user.uid), {
            firstName,
            lastName,
            email,
            faculty,
            university,
            phoneNumber,
            createdAt: new Date()
        });

        console.log("Verification email sent. User stored in pendingUsers.");
    } catch (error) {
        console.error("Sign Up Error:", error.message);
        throw error;
    }
}


export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        if (!user.emailVerified) {
            throw new Error("Please verify your email first.");
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);


        if (!userSnap.exists()) {
            const pendingRef = doc(db, "pendingUsers", user.uid);
            const pendingSnap = await getDoc(pendingRef);

            if (!pendingSnap.exists()) {
                throw new Error("User data not found in pendingUsers.");
            }

            const pendingData = pendingSnap.data();


            await setDoc(userRef, {
                ...pendingData,
                role: "student",
                createdAt: new Date()
            });


            await deleteDoc(pendingRef);

            console.log("User moved from pendingUsers → users");
        }

        console.log("Login successful");
        return user.uid;

    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
}


export async function forgotPassword(email) {
    try {
        const actionCodeSettings = {
            url: "https://your-app.com/reset-password",
            handleCodeInApp: true
        };

        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        console.log("Password reset email sent.");
    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        throw error;
    }
}


export async function resetPasswordWithCode(oobCode, newPassword) {
    try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        console.log("Password updated successfully!");
    } catch (error) {
        console.error("Reset Password Error:", error.message);
        throw error;
    }
}
// test

export async function logout() {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Logout Error:", error.message);
        throw error;
    }
}