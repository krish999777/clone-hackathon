
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0EJim4QVVIfG4Fg5di2OxgeFXna6v53Q",
  authDomain: "food-for-life-98de1.firebaseapp.com",
  projectId: "food-for-life-98de1",
  storageBucket: "food-for-life-98de1.firebasestorage.app",
  messagingSenderId: "198907444411",
  appId: "1:198907444411:web:38c939761ae14ade433d9e",
  measurementId: "G-R8PG931S6E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export Storage