import React from 'react';
import { Power, Zap, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';

export default function StagePowerOn({ onInitiate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '32px', paddingBottom: '40px', animation: 'fadeIn 0.4s ease-out' }}>

      {/* Glowing Power Button */}
      <div style={{ position: 'relative', marginBottom: '36px' }}>
        <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <button
          onClick={onInitiate}
          style={{
            position: 'relative',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #1e3a5f, #0a1223)',
            border: '3px solid rgba(59,130,246,0.7)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            color: '#60a5fa',
            boxShadow: '0 0 50px rgba(59,130,246,0.35), inset 0 0 30px rgba(59,130,246,0.1)',
            cursor: 'pointer', transition: 'all 0.3s', outline: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 80px rgba(59,130,246,0.6), inset 0 0 40px rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(59,130,246,0.35), inset 0 0 30px rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.7)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Power size={52} color="#60a5fa" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' }} />
          <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd' }}>POWER ON</span>
        </button>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
        VMC Controller Power-Up Sequence
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', lineHeight: '1.7', marginBottom: '36px' }}>
        The VMC operator interface is on standby. Click <strong style={{ color: '#60a5fa' }}>POWER ON</strong> to initialize safety circuits and begin the step-by-step machine startup sequence.
      </p>

      {/* Specs Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '640px', marginBottom: '36px' }}>
        {[
          { Icon: Zap, color: '#34d399', label: 'Power Grid', value: '415V AC 3-Phase', sub: 'Bus Frequency: 50 Hz' },
          { Icon: Cpu, color: '#60a5fa', label: 'CNC Core', value: 'Fanuc 0i-MF', sub: 'Servos: Alpha i Series' },
          { Icon: ShieldAlert, color: '#c084fc', label: 'Safety Circuit', value: 'Dual Loop Interlock', sub: 'ISO 13849-1 Cat 4' },
        ].map(({ Icon, color, label, value, sub }) => (
          <div key={label} style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '18px 14px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
              <Icon size={15} color={color} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: color }}>{label}</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0', marginBottom: '3px' }}>{value}</div>
            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={onInitiate}
        className="hmi-btn hmi-btn-primary"
        style={{ fontSize: '14px', padding: '14px 36px', letterSpacing: '0.08em' }}
      >
        <span>INITIALIZE CONTROLLER & START MACHINE CHECKS</span>
        <ArrowRight size={18} />
      </button>

      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
