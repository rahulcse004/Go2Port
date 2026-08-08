import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log('firebaseConfig loaded:', {
  apiKey: firebaseConfig.apiKey ? 'yes' : 'no',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const q = query(collection(db, 'agent_decisions'), orderBy('timestamp', 'desc'), limit(3));

try {
  const snapshot = await getDocs(q);
  console.log('docs count', snapshot.size);
  snapshot.docs.forEach((doc, idx) => {
    console.log(`${idx + 1}. ${doc.id}`, doc.data());
  });
} catch (e) {
  console.error('firestore error', e.code, e.message);
}
