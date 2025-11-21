import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE THIS SECTION WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
   apiKey: "AIzaSyD7f-X92QQE7Zl-3giDF7PB8xZ7KUuJf9E",
   authDomain: "voicebox2-67867.firebaseapp.com",
   projectId: "voicebox2-67867",
  storageBucket: "voicebox2-67867.firebasestorage.app",
   messagingSenderId: "533849885424",
   appId: "1:533849885424:web:c5b4900e2a0c694ef55035"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);






