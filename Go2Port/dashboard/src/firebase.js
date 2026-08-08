// Firebase configuration for dashboard
// This connects to the same Firestore database as your backend
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjflqgfZg6M9qbn_s_KtjdSKFfNHkmp6k",
  authDomain: "agentic-ai-494018.firebaseapp.com",
  projectId: "agentic-ai-494018",
  storageBucket: "agentic-ai-494018.firebasestorage.app",
  messagingSenderId: "252517190757",
  appId: "1:252517190757:web:96374c3a9f75177dda0a8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);