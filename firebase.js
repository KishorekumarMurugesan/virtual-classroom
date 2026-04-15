import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBaOCQ901fCF_IrGA5QvWEkEbEsLZPzdZg",
  authDomain: "virtual-classroom-99865.firebaseapp.com",
  projectId: "virtual-classroom-99865",
  storageBucket: "virtual-classroom-99865.firebasestorage.app",
  messagingSenderId: "18644817209",
  appId: "1:18644817209:web:c58026a6c90da2874b84e8",
  measurementId: "G-4LVVFRLN4P"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);