require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({ 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agentic-ai-494018",
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

// A simple simulated route from Nagpur towards Mumbai Port
const routeCoordinates = [
  { lat: 21.1458, lng: 79.0882 }, // Nagpur
  { lat: 20.9320, lng: 77.7523 }, // Amravati
  { lat: 20.7002, lng: 77.0082 }, // Akola
  { lat: 20.0110, lng: 75.1980 }, // Aurangabad
  { lat: 19.9975, lng: 73.7898 }, // Nashik (Current position)
  { lat: 19.2856, lng: 73.0463 }, // Bhiwandi
  { lat: 18.9438, lng: 72.8359 }, // Mumbai Port
];

async function runLiveStreamer() {
  console.log("🚚 Starting Live GPS Telemetry Streamer...");
  const collectionName = 'final_audit_shipments';
  const shipId = 'SHIP-777';

  let currentStep = 0;

  // Initialize the shipment with the first coordinate if it doesn't exist
  try {
    await db.collection(collectionName).doc(shipId).set({
      id: "SHIP-777",
      origin: "Nagpur, India",
      destination: "Mumbai Port, India",
      cargo: "Lithium Batteries",
      status: "In Transit",
      risk_level: "High",
      priority: "Critical",
      temperature: 28.5,
      humidity: 65,
      location: routeCoordinates[0],
      port_status: "OPEN",
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ Initialized ${shipId} at Origin: Nagpur`);
  } catch(e) {
    console.error("Init error", e);
  }

  const intervalId = setInterval(async () => {
    try {
      if (currentStep < routeCoordinates.length - 2) { // Stop before reaching Mumbai
        currentStep++;
        const currentLoc = routeCoordinates[currentStep];

        // Simulate some temperature fluctuations
        const newTemp = 28.0 + (Math.random() * 2 - 1);
        const newHum = 65 + (Math.random() * 5 - 2.5);

        console.log(`📍 Streaming location update -> Lat: ${currentLoc.lat}, Lng: ${currentLoc.lng}`);

        await db.collection(collectionName).doc(shipId).update({
          location: currentLoc,
          temperature: parseFloat(newTemp.toFixed(1)),
          humidity: parseFloat(newHum.toFixed(1)),
          last_updated: new Date().toISOString()
        });
      } else {
        // Truck is near Mumbai, trigger a disruption!
        console.log("🚨 INJECTING DISRUPTION: Mumbai Port Closed!");
        await db.collection(collectionName).doc(shipId).update({
          port_status: "CLOSED",
          status: "Delayed",
          last_updated: new Date().toISOString()
        });
        clearInterval(intervalId); // Stop streaming, wait for agent
      }
    } catch (error) {
      console.error("\n❌ Streamer Error:", error.message);
    }
  }, 5000); // Update every 5 seconds
}

runLiveStreamer();
