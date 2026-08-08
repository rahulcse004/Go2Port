import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [shipments, setShipments] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load shipments
      const shipmentsSnapshot = await getDocs(collection(db, 'final_audit_shipments'));
      const shipmentsData = shipmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShipments(shipmentsData);

      // Load agent decisions
      const decisionsSnapshot = await getDocs(collection(db, 'agent_decisions'));
      const decisionsData = decisionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDecisions(decisionsData);

    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async (shipmentId) => {
    try {
      setError(null);
      // In a real app, this would call your backend API
      // For now, we'll just refresh the data
      alert('Agent would run here for shipment: ' + shipmentId);
      await loadData();
    } catch (err) {
      setError('Failed to run agent: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading Antigravity Supply Chains...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 Antigravity Supply Chains</h1>
        <p>AI-Powered Logistics Disruption Management</p>
        <button onClick={loadData} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Refresh Data
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <section>
        <h2>Shipments</h2>
        {shipments.map(shipment => (
          <div key={shipment.id} className="shipment-card">
            <h3>Shipment {shipment.id}</h3>
            <p><strong>Origin:</strong> {shipment.origin}</p>
            <p><strong>Destination:</strong> {shipment.destination}</p>
            <p><strong>Status:</strong> {shipment.status}</p>
            <button onClick={() => runAgent(shipment.id)}>
              Run AI Agent
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2>Agent Decisions</h2>
        {decisions.map(decision => (
          <div key={decision.id} className="decision-card">
            <h3>Decision for {decision.shipmentId}</h3>
            <p><strong>Analysis:</strong> {decision.analysis}</p>
            <p><strong>Suggested Route:</strong> {decision.suggested_route}</p>
            {decision.metrics && (
              <div>
                <p><strong>Distance:</strong> {decision.metrics.distance}</p>
                <p><strong>Duration:</strong> {decision.metrics.duration}</p>
                <p><strong>CO2 Impact:</strong> {decision.metrics.co2}</p>
              </div>
            )}
            <p><strong>Timestamp:</strong> {new Date(decision.timestamp.seconds * 1000).toLocaleString()}</p>
            <p><strong>Hash:</strong> {decision.integrity_hash?.substring(0, 10)}...</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;