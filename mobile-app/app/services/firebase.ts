import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-cpKYrCe67E2tViT-pxeNyjGnl5lHBc0",
  authDomain: "unitrade-cc943.firebaseapp.com",
  projectId: "unitrade-cc943",
  storageBucket: "unitrade-cc943.firebasestorage.app",
  messagingSenderId: "717685360668",
  appId: "1:717685360668:web:469d4865759445e4c6f7d9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);