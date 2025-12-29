import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const userFirebaseConfig = {
  apiKey: "AIzaSyDNmHwSCxUQp4qOzSzSeh4O22kTF02ghoc",
  authDomain: "twilight-engineering.firebaseapp.com",
  projectId: "twilight-engineering",
  storageBucket: "twilight-engineering.firebasestorage.app",
  messagingSenderId: "708368955194",
  appId: "1:708368955194:web:53aff7d5abd5bcaa6ac203"
};

const app = initializeApp(userFirebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);