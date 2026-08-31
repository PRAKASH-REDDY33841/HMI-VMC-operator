import React from 'react';
import { Cpu, RotateCcw } from 'lucide-react';

export default function Header({ scenario, currentStage, onReset }) {
  return (
    <header style={{ background: '#0b1525', borderBottom: '1px solid #1b2d4f', padding: '0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>

        {/* Logo + Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Cpu size={22} color="#60a5fa" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>PRIMEFORM VMC-850</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}></span>
                ONLINE
              </span>
            </div>
            <p style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', margin: '1px 0 0 0' }}>FANUC 0i-MF PLUS · VMC-OPT-01</p>
          </div>
        </div>

        {/* Scenario Params */}
        {scenario && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#070d1a', border: '1px solid #1b2d4f', borderRadius: '10px', padding: '8px 14px', flex: 1, justifyContent: 'center' }}>
            {[
              { label: 'OPERATION', value: scenario.operation, color: '#60a5fa' },
              { label: 'CNC PROGRAM', value: scenario.cnc_program, color: '#fbbf24' },
              { label: 'WORK OFFSET', value: scenario.work_offset, color: '#34d399' },
              { label: 'BATCH / REV', value: `${scenario.quantity} pcs · ${scenario.drawing_revision}`, color: '#c084fc' },
            ].map(p => (
              <div key={p.label} style={{ minWidth: 0 }}>
                <div style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '1px' }}>{p.label}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: p.color, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{p.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reset Button */}
        <button onClick={onReset} className="hmi-btn hmi-btn-secondary" style={{ padding: '7px 14px', fontSize: '11px' }}>
          <RotateCcw size={13} />
          <span>Reset HMI</span>
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </header>
  );
}
