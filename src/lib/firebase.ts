
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzvBhSjN3zy1KhceNQhZXyWoX6Fkkcvdg",
  authDomain: "text-extractor-a89e4.firebaseapp.com",
  projectId: "text-extractor-a89e4",
  storageBucket: "text-extractor-a89e4.appspot.com",
  messagingSenderId: "670751161424",
  appId: "1:670751161424:web:993df0d5ed3a96cadea555",
  measurementId: "G-QQ36ZCXN16"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
