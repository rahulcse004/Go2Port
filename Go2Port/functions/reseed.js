require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');
const dataset = require('./dataset.json');

// Initialize Firestore using the (default) ID from your .env
const db = new Firestore({ 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agentic-ai-494018",
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

async function reseed() {
  console.log("🛠️ Seeding rich data into the database...");
  
  const shipmentsCollection = 'final_audit_shipments';
  const decisionsCollection = 'agent_decisions';
  
  try {
    const timestamp = new Date();

    // 1. Seed Multiple Shipments
    const shipments = dataset.shipments.map(({ eta_hours, ...shipment }) => ({
      ...shipment,
      eta: new Date(timestamp.getTime() + eta_hours * 60 * 60 * 1000).toISOString(),
      last_updated: timestamp.toISOString()
    }));

    for (const ship of shipments) {
      await db.collection(shipmentsCollection).doc(ship.id).set(ship);
      console.log(`✅ Seeded Shipment: ${ship.id}`);
    }

    // 2. Seed Agent Decisions
    const decisions = dataset.agent_decisions.map(({ id, timestamp_offset_hours, ...decision }) => ({
      ...decision,
      timestamp: new Date(timestamp.getTime() + timestamp_offset_hours * 60 * 60 * 1000)
    }));

    for (const decision of decisions) {
      await db.collection(decisionsCollection).doc(decision.id).set(decision);
      console.log(`✅ Seeded Decision: ${decision.id}`);
    }

    console.log("🚀 Data seeding complete. The dashboard should now show rich real-time insights!");
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
  }
}

reseed();