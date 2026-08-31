import React from 'react';
import { ShieldCheck, CheckCircle, Clock, ArrowRight } from 'lucide-react';

function ProgressRing({ percent, color = '#10b981' }) {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#070d1a', borderStyle: 'solid', borderWidth: '3px', borderColor: percent === 100 ? color : '#1b2d4f', borderTopColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: percent === 100 ? color : '#64748b', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
      {percent}%
    </div>
  );
}

export default function StageMachineChecks({ items, onConfirm, allConfirmed, onNext }) {
  const machineItems = items.filter(i => i.stage === 1);
  const confirmedCount = machineItems.filter(i => i.confirmed).length;
  const pct = machineItems.length ? Math.round((confirmedCount / machineItems.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>

      {/* Stage Header */}
      <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
            <ShieldCheck size={15} color="#60a5fa" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>Stage 1 · Machine Checks</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>Pre-Operation Safety & Signal Verification</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Confirm all 6 critical VMC signals before proceeding to tool loading.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Verification</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f1f5f9' }}>{confirmedCount} / {machineItems.length}</div>
          </div>
          <ProgressRing percent={pct} />
          {allConfirmed && (
            <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '12px', padding: '9px 18px', animation: 'bounce 1s ease-in-out infinite' }}>
              NEXT <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Check Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {machineItems.map((item, idx) => {
          const done = item.confirmed;
          const param = item.specs?.parameter;
          const val = item.specs?.value;
          return (
            <div key={item.id} style={{ background: done ? 'rgba(6,20,14,0.6)' : '#0e1a2e', border: `1px solid ${done ? 'rgba(16,185,129,0.45)' : '#1b2d4f'}`, borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: done ? '0 0 16px rgba(16,185,129,0.07)' : 'none', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '6px', padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace' }}>CHK #{idx + 1}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: done ? '#34d399' : '#f59e0b', background: done ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {done ? <CheckCircle size={11} /> : <Clock size={11} />}
                  {done ? 'CONFIRMED' : 'PENDING'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{item.detail}</p>
              </div>
              {param && (
                <div style={{ background: '#070d1a', border: '1px solid #1b2d4f', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{param}:</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>{val}</span>
                </div>
              )}
              <button onClick={() => onConfirm(item.id)} className={`hmi-btn ${done ? 'hmi-btn-outline-success' : 'hmi-btn-primary'}`} style={{ fontSize: '12px', padding: '10px', width: '100%' }}>
                <CheckCircle size={14} />
                {done ? 'Confirmed (Click to Undo)' : 'Confirm Check'}
              </button>
            </div>
          );
        })}
      </div>

      {/* All Confirmed Bottom Banner */}
      {allConfirmed && (
        <div style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(14,26,46,0.8))', border: '2px solid rgba(16,185,129,0.5)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 0 30px rgba(16,185,129,0.15)', animation: 'fadeIn 0.4s ease-out' }}>
          <div>
            <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>✓ All 6 Machine Checks Verified</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Control voltage healthy, safety door locked, reference homing complete. Ready for tool loading.</p>
          </div>
          <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '13px', padding: '13px 28px' }}>
            <span>PROCEED TO STAGE 2: REQUIRED TOOLS</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
    </div>
  );
}
