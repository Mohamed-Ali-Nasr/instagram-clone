// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxoyLTgYKH4nTyd6zyAeiALc_yXsgqP58",
  authDomain: "instagram-clone-99924.firebaseapp.com",
  projectId: "instagram-clone-99924",
  storageBucket: "instagram-clone-99924.appspot.com",
  messagingSenderId: "242164799958",
  appId: "1:242164799958:web:23c19001c557ff03dd2c77",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export { db, storage, app };
