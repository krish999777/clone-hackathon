
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1MEebumtENXwtKC1CBmqiQgkcXRVTUbw",
  authDomain: "food-for-li.firebaseapp.com",
  projectId: "food-for-li",
  storageBucket: "food-for-li.firebasestorage.app",
  messagingSenderId: "489894629274",
  appId: "1:489894629274:web:3b8451c7b99eee0ec8b423",
  measurementId: "G-SRYDVDMREC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export Storage