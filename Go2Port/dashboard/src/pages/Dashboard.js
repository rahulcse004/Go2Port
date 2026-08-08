import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Truck, Leaf, AlertTriangle, Activity, Thermometer, Droplets, Clock, Map } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { MapViewer } from '../MapViewer';

// --- SUB-COMPONENTS ---

const SummaryCard = ({ title, value, icon: Icon, colorClass, bgGlowClass, animationDelay }) => (
  <div className={`glass-panel summary-card animate-slide-up`} style={{ animationDelay: `${animationDelay}s` }}>
    <div className={`icon-wrapper ${bgGlowClass}`}>
      <Icon size={28} className={colorClass} />
    </div>
    <div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
    </div>
  </div>
);

const IntegrityBadge = ({ hash }) => (
  <div className="badge bg-green-glow text-green" style={{ fontFamily: 'monospace' }}>
    <ShieldCheck size={14} style={{ marginRight: '6px' }} />
    ID: {hash.substring(0, 8)}...
  </div>
);

const StatusBadge = ({ status }) => {
  let colorClass = 'text-blue';
  let glowClass = 'bg-blue-glow';
  
  if (status === 'Delayed' || status === 'Pending User Approval') {
    colorClass = 'text-orange';
    glowClass = 'bg-orange-glow';
  } else if (status === 'Critical') {
    colorClass = 'text-red';
    glowClass = 'bg-red-glow';
  } else if (status === 'Validated') {
    colorClass = 'text-green';
    glowClass = 'bg-green-glow';
  }

  return (
    <div className={`badge ${glowClass} ${colorClass}`}>
      <Activity size={14} style={{ marginRight: '4px' }} />
      {status}
    </div>
  );
};

// --- MAIN APP ---

export const Dashboard = () => {
  const [decisions, setDecisions] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);

  useEffect(() => {
    // 1. Listen to all recent shipments
    const shipmentsQ = query(collection(db, 'final_audit_shipments'));
    const unsubscribeShipments = onSnapshot(shipmentsQ, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShipments(docs);
    }, (err) => {
      console.error('Shipment fetch error:', err);
      setError(err.message);
    });

    // 2. Listen to agent decisions
    const decisionsQ = query(collection(db, 'agent_decisions'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribeDecisions = onSnapshot(decisionsQ, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp
          ? data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp.seconds * 1000)
          : new Date();
        return { id: doc.id, ...data, timestampObj: timestamp, timestampStr: timestamp.toLocaleString() };
      });
      setDecisions(docs);
      setLoading(false);
    }, (err) => {
      console.error('Firestore real-time error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      unsubscribeDecisions();
      unsubscribeShipments();
    };
  }, []);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const activeDisruptions = decisions.filter(d => d.status !== 'Validated').length;
    const avgTemp = shipments.length > 0 ? (shipments.reduce((acc, s) => acc + (s.temperature || 0), 0) / shipments.length).toFixed(1) : 0;
    const highRisk = shipments.filter(s => s.risk_level === 'High' || s.priority === 'Critical').length;
    return { activeDisruptions, avgTemp, highRisk, totalShipments: shipments.length };
  }, [shipments, decisions]);

  // Format data for chart
  const chartData = useMemo(() => {
    return shipments.map(s => ({
      name: s.id,
      Temperature: s.temperature || 0,
      Humidity: s.humidity || 0,
    }));
  }, [shipments]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="live-indicator" style={{ width: '20px', height: '20px', marginBottom: '1rem' }}></div>
        <h2 style={{ fontFamily: 'Outfit' }}>Establishing Neural Link...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--accent-red)', minHeight: '100vh', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle size={48} className="text-red" style={{ marginBottom: '1rem' }} />
          <h2>Connection Interrupted</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="header-title">Supply Chain Nexus</h1>
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-indicator"></span>
          <span style={{ fontSize: '0.9rem', fontWeight: '500', letterSpacing: '1px' }}>LIVE TELEMETRY</span>
        </div>
      </header>

      {/* 1. TOP ROW: Dynamic Summary Cards */}
      <div className="grid-cards">
        <SummaryCard title="Active Shipments" value={stats.totalShipments} icon={Truck} colorClass="text-blue" bgGlowClass="bg-blue-glow" animationDelay={0.1} />
        <SummaryCard title="High Risk Assets" value={stats.highRisk} icon={AlertTriangle} colorClass="text-red" bgGlowClass="bg-red-glow" animationDelay={0.2} />
        <SummaryCard title="Avg Network Temp" value={`${stats.avgTemp}°C`} icon={Thermometer} colorClass="text-orange" bgGlowClass="bg-orange-glow" animationDelay={0.3} />
        <SummaryCard title="Pending Interventions" value={stats.activeDisruptions} icon={Activity} colorClass="text-green" bgGlowClass="bg-green-glow" animationDelay={0.4} />
      </div>

      <div className="grid-main">
        {/* LEFT COLUMN: Shipments & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Charts Section */}
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem', animationDelay: '0.5s' }}>
            <h2 className="section-header">
              <Thermometer size={20} className="text-blue" />
              Environmental Telemetry
            </h2>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                  <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Temperature" stroke="var(--accent-orange)" fillOpacity={1} fill="url(#colorTemp)" />
                  <Area type="monotone" dataKey="Humidity" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Shipments List */}
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem', animationDelay: '0.6s' }}>
            <h2 className="section-header">
              <Truck size={20} className="text-green" />
              Asset Roster
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {shipments.map(ship => (
                <div key={ship.id} className="data-row" style={{ alignItems: 'center', borderLeft: ship.port_status === 'CLOSED' ? '3px solid var(--accent-red)' : 'none' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                      {ship.id} 
                      {ship.port_status === 'CLOSED' && <span style={{marginLeft: '8px', padding: '2px 6px', fontSize: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', borderRadius: '4px', fontWeight: 'bold'}}>PORT CLOSED</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {ship.cargo} • {ship.location ? '📍 In Transit' : ship.origin} → <strong>{ship.destination}</strong>
                    </div>
                    {ship.location && (
                       <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '6px', fontFamily: 'monospace' }}>
                          <Map size={10} style={{display: 'inline', marginRight: '4px'}}/>
                          LIVE GPS: {ship.location.lat.toFixed(4)}, {ship.location.lng.toFixed(4)}
                       </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                         <Thermometer size={14} className={ship.temperature > 25 ? 'text-red' : 'text-muted'} />
                         <span style={{ color: ship.temperature > 25 ? 'var(--accent-red)' : 'inherit'}}>{ship.temperature}°C</span>
                       </span>
                       <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                         <Droplets size={14} className="text-blue" />
                         {ship.humidity}%
                       </span>
                    </div>
                    <StatusBadge status={ship.status} />
                  </div>
                </div>
              ))}
              {shipments.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No active assets detected.</div>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Decision Feed */}
        <div>
          <h2 className="section-header">
            <Activity size={20} className="text-red" />
            Agent Interventions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {decisions.map((decision, index) => (
              <div key={decision.id} className="glass-panel animate-slide-up" style={{ 
                padding: '1.5rem', 
                borderLeft: `4px solid ${decision.status === 'Validated' ? 'var(--accent-green)' : 'var(--accent-orange)'}`,
                animationDelay: `${0.7 + (index * 0.1)}s`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>{decision.suggested_route}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={12} /> {decision.shipmentId}
                      <span style={{ margin: '0 4px' }}>•</span>
                      <Clock size={12} /> {decision.timestampStr}
                    </div>
                  </div>
                  <IntegrityBadge hash={decision.integrity_hash || decision.id} />
                </div>

                <p style={{ color: '#cbd5e1', lineHeight: '1.5', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  {decision.analysis}
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  {decision.metrics && Object.entries(decision.metrics).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{key.replace('_', ' ')}</span>
                       <span style={{ fontWeight: '600', fontSize: '0.9rem', color: key.includes('co2') ? 'var(--accent-green)' : 'var(--accent-blue)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                
                {decision.metrics && decision.metrics.polyline && (
                  <button 
                    onClick={() => setSelectedDecision(decision)}
                    style={{
                      marginTop: '1.25rem',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--accent-blue)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                  >
                    <Map size={16} /> View Interactive Route
                  </button>
                )}
              </div>
            ))}
            {decisions.length === 0 && (
               <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                 No recent interventions.
               </div>
            )}
          </div>
        </div>

      </div>

      {selectedDecision && (
        <MapViewer decision={selectedDecision} onClose={() => setSelectedDecision(null)} />
      )}
    </div>
  );
}