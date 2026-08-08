require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore
const db = new Firestore({ 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agentic-ai-494018",
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

async function runSimulator() {
  console.log("🌊 Starting Dynamic Telemetry Simulator...");
  const collectionName = 'final_audit_shipments';

  setInterval(async () => {
    try {
      const snapshot = await db.collection(collectionName).get();
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Add random jitter to temperature (-0.5 to +0.5)
        let newTemp = (data.temperature || 20) + (Math.random() - 0.5);
        // Add random jitter to humidity (-1 to +1)
        let newHum = (data.humidity || 50) + (Math.random() * 2 - 1);

        // Keep values in realistic bounds
        if (newTemp > 35) newTemp -= 2; // Cooling system kicks in
        if (newTemp < 2) newTemp += 2;  // Heating kicks in
        if (newHum > 95) newHum -= 5;
        if (newHum < 10) newHum += 5;

        const docRef = db.collection(collectionName).doc(doc.id);
        batch.update(docRef, {
          temperature: parseFloat(newTemp.toFixed(1)),
          humidity: parseFloat(newHum.toFixed(1)),
          last_updated: new Date().toISOString()
        });
      });

      await batch.commit();
      process.stdout.write("〰️"); // Visual heartbeat in console
    } catch (error) {
      console.error("\n❌ Simulator Error:", error.message);
    }
  }, 4000); // Update every 4 seconds
}

runSimulator();
