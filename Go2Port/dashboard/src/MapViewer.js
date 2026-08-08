import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

// Custom Map Bounds Fitter
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
};

// Create custom emoji icons for the map
const createEmojiIcon = (emoji) => {
  return L.divIcon({
    html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

export const MapViewer = ({ decision }) => {
  const decodedPath = useMemo(() => {
    if (!decision || !decision.metrics || !decision.metrics.polyline) return [];
    try {
      // OSRM encoded polyline decoding
      const decoded = polyline.decode(decision.metrics.polyline);
      // OSRM returns [lat, lng] array
      return decoded;
    } catch (e) {
      console.error("Error decoding polyline:", e);
      return [];
    }
  }, [decision]);

  if (!decodedPath || decodedPath.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Waiting for route data...</p>
      </div>
    );
  }

  const startPos = decodedPath[0];
  const endPos = decodedPath[decodedPath.length - 1];

  return (
    <MapContainer 
      center={startPos} 
      zoom={6} 
      style={{ height: '100%', width: '100%', background: '#020c1b' }}
      zoomControl={false}
    >
      {/* Premium Satellite Theme Tiles from Esri */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      />
      
      <Polyline 
        positions={decodedPath} 
        pathOptions={{ color: '#64ffda', weight: 4, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }} 
      />

      <Marker position={startPos} icon={createEmojiIcon('🚚')}>
        <Popup>
          <div style={{ background: '#0a192f', color: '#ccd6f6', padding: '5px' }}>
            <strong>Current Live Location</strong><br/>
            Diverted Route Start
          </div>
        </Popup>
      </Marker>

      <Marker position={endPos} icon={createEmojiIcon('⚓')}>
        <Popup>
          <div style={{ background: '#0a192f', color: '#ccd6f6', padding: '5px' }}>
            <strong>Nearest Available Port</strong><br/>
            Alternative Destination
          </div>
        </Popup>
      </Marker>

      <FitBounds positions={decodedPath} />

      {/* Override leaflet popup styles to match theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: #0a192f;
          color: #ccd6f6;
          border: 1px solid rgba(100, 255, 218, 0.2);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background-color: #0a192f;
        }
        .custom-emoji-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </MapContainer>
  );
};
