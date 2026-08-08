import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export const fetchLatestDecisions = async () => {
  try {
    // Fetch real data from Firestore agent_decisions collection
    const q = query(collection(db, 'agent_decisions'), orderBy('timestamp', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);

    const decisions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        shipmentId: data.shipmentId,
        suggested_route: data.suggested_route,
        analysis: data.analysis,
        metrics: data.metrics || { distance: "N/A", co2: "N/A" },
        integrity_hash: data.integrity_hash,
        status: data.status,
        timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : new Date().toLocaleString()
      };
    });

    // If no real data, return demo data
    if (decisions.length === 0) {
      console.log("No real data found, showing demo data...");
      return [
        {
          id: "demo-1",
          shipmentId: "SHIP-777",
          suggested_route: "Pune Inland Port",
          analysis: "Mumbai Port closure detected due to weather disruption. Reroute suggested to Pune ICD to minimize lead-time delay by 48 hours.",
          metrics: { distance: "148.5 km", co2: "29.7 kg" },
          integrity_hash: "dda0f964cfa9aa69b0349985bc67fd322...",
          status: "Validated",
          timestamp: new Date().toLocaleString()
        }
      ];
    }

    return decisions;
  } catch (error) {
    console.error("Error fetching decisions:", error);
    // Fallback to demo data on error
    return [
      {
        id: "demo-1",
        shipmentId: "SHIP-777",
        suggested_route: "Pune Inland Port",
        analysis: "Mumbai Port closure detected due to weather disruption. Reroute suggested to Pune ICD to minimize lead-time delay by 48 hours.",
        metrics: { distance: "148.5 km", co2: "29.7 kg" },
        integrity_hash: "dda0f964cfa9aa69b0349985bc67fd322...",
        status: "Validated",
        timestamp: new Date().toLocaleString()
      }
    ];
  }
};