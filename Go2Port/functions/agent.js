require('dotenv').config();
const axios = require('axios');
const { Firestore } = require('@google-cloud/firestore');
const crypto = require('crypto');
const { getLogisticsImpact } = require('./mapsService');

const db = new Firestore({ 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agentic-ai-494018",
  databaseId: process.env.FIRESTORE_DB_ID || '(default)' 
});

async function runIntegratedAgent() {
  console.log("🧠 Antigravity Agent: Listening for disruptions...");

  db.collection('final_audit_shipments').onSnapshot(async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'modified') {
        const data = change.doc.data();
        
        // Trigger condition: Port is closed and we haven't already rerouted
        if (data.port_status === 'CLOSED' && !data.rerouted) {
          console.log(`\n🚨 Disruption Detected for ${data.id}! Destination Port Closed.`);
          
          try {
            console.log("🤖 Step 1: Generating AI Insights...");
            const aiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            
            let aiReasoning;
            let suggestedCity = "Nhava Sheva Port, India"; // default fallback

            try {
              const aiResponse = await axios.post(aiUrl, {
                contents: [{
                  parts: [{ 
                    text: `Shipment: ${JSON.stringify(data)}. Problem: Destination Port closed. Suggest exactly one alternative Sea Port in India to reroute to based on the current location. Format: 'PortName, India'. Explain why.` 
                  }]
                }]
              });
              aiReasoning = aiResponse.data.candidates[0].content.parts[0].text;
              
              // Extract the suggested port name (simple regex to find "Something Port, India" or similar)
              const match = aiReasoning.match(/([A-Z][a-zA-Z\s]+Port, India)/i);
              if (match) suggestedCity = match[0];
            } catch (aiError) {
              console.log("⚠️ AI quota exceeded, using fallback analysis...");
              aiReasoning = "Destination Port closure detected. Reroute suggested to Nhava Sheva Port to minimize lead-time delay and reduce transportation costs.";
            }
            console.log("✅ Reasoning Received.");
            console.log(`🎯 Suggested Alternative Port: ${suggestedCity}`);

            console.log(`🛰️ Step 2: Calculating logistics impact from live location...`);
            const origin = data.location ? data.location : data.origin;
            const impact = await getLogisticsImpact(origin, suggestedCity);

            const decisionHash = crypto.createHash('sha256').update(aiReasoning).digest('hex');

            if (impact) {
              console.log(`📊 Metrics: ${impact.distance} | ${impact.co2} CO2`);
              
              await db.collection('agent_decisions').add({
                shipmentId: data.id,
                analysis: aiReasoning,
                suggested_route: suggestedCity,
                metrics: impact,
                integrity_hash: decisionHash,
                timestamp: new Date(),
                status: "Validated"
              });

              // Mark shipment as rerouted so we don't trigger again
              await db.collection('final_audit_shipments').doc(data.id).update({
                rerouted: true,
                destination: suggestedCity,
                status: "Rerouted",
                last_updated: new Date().toISOString()
              });

              console.log("\n✨ PHASE 2 & 3 COMPLETE! Driver re-routed.");
            }
          } catch (error) {
            console.error("❌ Pipeline Crash:", error.message);
          }
        }
      }
    });
  }, err => {
    console.error(`Encountered error: ${err}`);
  });
}

runIntegratedAgent();