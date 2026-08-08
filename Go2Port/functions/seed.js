const { Firestore } = require('@google-cloud/firestore');

// Add the databaseId property here
const db = new Firestore({
  databaseId: 'agentic-supply-chain' 
});

const seedData = async () => {
  const shipment = {
    id: "SHIP-777",
    origin: "Mumbai Port, IN",
    destination: "Hamburg, DE",
    status: "In Transit",
    cargo: "Lithium Batteries",
    priority: "Critical",
    current_lat: 18.9400,
    current_lng: 72.8400,
    estimated_arrival: "2026-05-10"
  };

  try {
    await db.collection('shipments').doc('SHIP-777').set(shipmentData);
    console.log("✅ Phase 2 Success: Shipment SHIP-777 created in Firestore.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

seedData();