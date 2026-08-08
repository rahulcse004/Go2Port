import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Thermometer, Droplets, Map as MapIcon, Truck, Anchor, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MapViewer } from '../MapViewer';

export const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shipmentId, setShipmentId] = useState(searchParams.get('id') || '');
  const [shipment, setShipment] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    setLoading(true);
    setError(null);
    setShipment(null);
    setDecision(null);

    // Subscribe to live shipment updates
    const unsubscribe = onSnapshot(doc(db, 'final_audit_shipments', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShipment({ id: docSnap.id, ...data });
        setLoading(false);

        // If disrupted or rerouted, check for agent decisions
        if (data.port_status === 'CLOSED' || data.rerouted) {
          const decisionsQ = query(
            collection(db, 'agent_decisions'), 
            where('shipmentId', '==', id)
          );
          
          getDocs(decisionsQ).then(snap => {
            if (!snap.empty) {
              const sortedDecisions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp || 0).getTime();
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp || 0).getTime();
                return timeB - timeA;
              });
              setDecision(sortedDecisions[0]);
            }
          }).catch(console.error);
        }

      } else {
        setError(`Shipment ${id} not found.`);
        setLoading(false);
      }
    }, (err) => {
      console.error(err);
      setError("Failed to fetch shipment data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (shipmentId) {
      setSearchParams({ id: shipmentId });
    }
  };

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
      
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="header-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Track Your Cargo</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="text" 
            className="input-ocean"
            placeholder="Enter Shipment ID" 
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
          />
          <button type="submit" className="btn-filled">Search</button>
        </form>
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '4rem' }}><span className="live-indicator"></span></div>}
      
      {error && (
        <div className="glass-panel animate-slide-up" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--accent-red)' }}>
          <AlertTriangle size={40} className="text-red" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--accent-red)' }}>{error}</h2>
        </div>
      )}

      {shipment && !loading && (
        <div className="animate-slide-up">
          
          {/* Main Status Card */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '2rem' }}>{shipment.id}</h2>
                  <div className={`badge ${shipment.port_status === 'CLOSED' ? 'bg-red-glow text-red' : 'bg-teal-glow text-teal'}`}>
                    {shipment.port_status === 'CLOSED' ? 'PORT CLOSED' : shipment.status}
                  </div>
                </div>
                
                <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span><Anchor size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> {shipment.origin}</span>
                  <ArrowRight size={18} />
                  <strong style={{ color: 'var(--text-main)' }}>{shipment.destination}</strong>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cargo</div>
                    <div style={{ fontWeight: '600' }}>{shipment.cargo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</div>
                    <div style={{ fontWeight: '600' }}>{shipment.priority}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ETA</div>
                    <div style={{ fontWeight: '600' }}>{new Date(shipment.eta).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Telemetry */}
              <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(2, 12, 27, 0.4)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <Thermometer size={24} className={shipment.temperature > 25 ? "text-red" : "text-teal"} style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{shipment.temperature}°C</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TEMP</div>
                </div>
                <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <Droplets size={24} className="text-blue" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{shipment.humidity}%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HUMIDITY</div>
                </div>
              </div>

            </div>
            
            {shipment.location && (
               <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div className="live-indicator"></div>
                 <span style={{ color: 'var(--accent-teal)', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                   LIVE GPS: {shipment.location.lat.toFixed(4)}, {shipment.location.lng.toFixed(4)}
                 </span>
               </div>
            )}
          </div>

          {/* AI Agent Intervention Section */}
          {decision && (
            <div 
              className="glass-panel" 
              style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-orange)', transition: 'all 0.3s' }}
            >
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setIsMapExpanded(!isMapExpanded); }}
              >
                <div className="icon-wrapper bg-orange-glow">
                  <AlertTriangle size={24} className="text-orange" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--accent-orange)' }}>🚨 DRIVER NOTIFICATION: PORT CLOSED</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fastest Route to Nearest Available Port generated.</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    {isMapExpanded ? 'Hide Satellite Map' : 'View Satellite Map'}
                  </button>
                  <div className="badge bg-green-glow text-green" style={{ fontFamily: 'monospace' }}>
                    <ShieldCheck size={14} style={{ marginRight: '6px' }} />
                    Hash: {decision.integrity_hash.substring(0, 8)}...
                  </div>
                </div>
              </div>

              {isMapExpanded && (
                <div className="animate-slide-up">
                  <p style={{ lineHeight: 1.6, marginBottom: '2rem', color: 'var(--text-bright)' }}>
                    {decision.analysis}
                  </p>

                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                    {decision.metrics && Object.entries(decision.metrics).map(([key, value]) => {
                      if (key === 'polyline') return null;
                      return (
                        <div key={key}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-teal)' }}>{value}</div>
                        </div>
                      );
                    })}
                  </div>

                  {decision.metrics?.polyline && (
                    <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                      <MapViewer decision={decision} isEmbedded={true} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// Simple Arrow Component since lucide-react ArrowRight might conflict in imports if not careful
const ArrowRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
