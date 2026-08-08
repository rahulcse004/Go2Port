import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFile } from 'node:fs/promises';

const firebaseConfig = {
  apiKey: 'AIzaSyDjflqgfZg6M9qbn_s_KtjdSKFfNHkmp6',
  authDomain: 'agentic-ai-494018.firebaseapp.com',
  projectId: 'agentic-ai-494018',
  storageBucket: 'agentic-ai-494018.firebasestorage.app',
  messagingSenderId: '252517190757',
  appId: '1:252517190757:web:96374c3a9f75177dda0a8c'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dataset = JSON.parse(await readFile('../functions/dataset.json', 'utf8'));
const timestamp = new Date();

for (const shipment of dataset.shipments) {
  const { eta_hours, ...record } = shipment;
  await setDoc(doc(db, 'final_audit_shipments', record.id), {
    ...record,
    eta: new Date(timestamp.getTime() + eta_hours * 60 * 60 * 1000).toISOString(),
    last_updated: timestamp.toISOString()
  });
  console.log(`Uploaded shipment ${record.id}`);
}

for (const decision of dataset.agent_decisions) {
  const { id, timestamp_offset_hours, ...record } = decision;
  await setDoc(doc(db, 'agent_decisions', id), {
    ...record,
    timestamp: new Date(timestamp.getTime() + timestamp_offset_hours * 60 * 60 * 1000)
  });
  console.log(`Uploaded decision ${id}`);
}

console.log('Firebase dataset upload complete.');
