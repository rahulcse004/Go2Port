import React from 'react';
import { Anchor, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Track Shipment', path: '/track' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <nav className="glass-nav" style={{ padding: '0 2rem', height: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-bright)' }}>
        <div style={{ background: 'var(--accent-teal-glow)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(100,255,218,0.3)' }}>
          <Anchor size={24} className="text-teal" />
        </div>
        <span style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.25rem', letterSpacing: '1px' }}>
          Go2<span className="text-teal">Port</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="nav-desktop">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path}
            style={{
              textDecoration: 'none',
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: '0.95rem',
              color: location.pathname === link.path ? 'var(--accent-teal)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              borderBottom: location.pathname === link.path ? '2px solid var(--accent-teal)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
        }
      `}</style>

    </nav>
  );
};
