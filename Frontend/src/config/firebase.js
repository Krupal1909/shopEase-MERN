import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCcVFfx5EQKvUL7BNLQdtK0u0b7ooAsCJw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mern-ecommerce-82984.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mern-ecommerce-82984",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mern-ecommerce-82984.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "326243519299",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:326243519299:web:54d7ea0cdf78e86f8c3df6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure auth settings
auth.useDeviceLanguage();

export default app;
