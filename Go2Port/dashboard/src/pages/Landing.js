import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, ShieldCheck, Map, ArrowRight } from 'lucide-react';

export const Landing = () => {
  const [shipmentId, setShipmentId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (shipmentId.trim()) {
      navigate(`/track?id=${shipmentId.trim()}`);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(rgba(2, 12, 27, 0.7), rgba(2, 12, 27, 0.95)), url("/bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div className="badge bg-teal-glow text-teal" style={{ marginBottom: '2rem' }}>
            Next-Generation Port Logistics
          </div>
          
          <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Navigate the Global <br/>
            <span className="text-gradient">Supply Chain</span> with AI.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Real-time telemetry, predictive climate analysis, and autonomous AI re-routing for your critical ocean freight.
          </p>

          {/* Tracking Input */}
          <form onSubmit={handleTrack} className="glass-panel" style={{ 
            display: 'flex', 
            padding: '8px', 
            maxWidth: '500px', 
            margin: '0 auto',
            borderRadius: '12px'
          }}>
            <input 
              type="text" 
              placeholder="Enter Shipment ID (e.g., SHIP-777)" 
              className="input-ocean"
              style={{ border: 'none', background: 'transparent' }}
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
            />
            <button type="submit" className="btn-filled">
              Track <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ backgroundColor: 'rgba(2,12,27,0.5)', padding: '5rem 2rem' }}>
        <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="icon-wrapper bg-blue-glow" style={{ width: 'max-content', marginBottom: '1.5rem' }}>
              <Ship size={32} className="text-blue" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Live Telemetry</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Track GPS, Temperature, and Humidity in real-time. Our sensors keep your cargo safe across the oceans.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="icon-wrapper bg-teal-glow" style={{ width: 'max-content', marginBottom: '1.5rem' }}>
              <Map size={32} className="text-teal" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Rerouting</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              When ports close due to weather, our AI instantly calculates the best alternative port to minimize delays.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="icon-wrapper bg-green-glow" style={{ width: 'max-content', marginBottom: '1.5rem' }}>
              <ShieldCheck size={32} className="text-green" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Blockchain Audit</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Every autonomous decision is hashed and verified, ensuring complete transparency in logistics handling.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
