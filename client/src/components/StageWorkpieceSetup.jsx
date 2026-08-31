import React from 'react';
import { Box, CheckCircle, Clock, ArrowRight, Anchor } from 'lucide-react';

export default function StageWorkpieceSetup({ items, onConfirm, allConfirmed, onNext }) {
  const wpItems = items.filter(i => i.stage === 3);
  const confirmedCount = wpItems.filter(i => i.confirmed).length;
  const pct = wpItems.length ? Math.round((confirmedCount / wpItems.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>

      {/* Stage Header */}
      <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
            <Box size={15} color="#c084fc" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>Stage 3 · Workpiece Setup</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>Fixture, Clamping & Work Offset (G54)</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Align and clamp stock in fixture, then probe and verify G54 coordinate offsets.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Setup Steps</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f1f5f9' }}>{confirmedCount} / {wpItems.length}</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#070d1a', border: `3px solid ${pct === 100 ? '#10b981' : '#1b2d4f'}`, borderTopColor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: pct === 100 ? '#10b981' : '#c084fc', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
            {pct}%
          </div>
          {allConfirmed && (
            <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '12px', padding: '9px 18px', animation: 'bounce 1s ease-in-out infinite' }}>
              NEXT <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Setup Step Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {wpItems.map((item, idx) => {
          const done = item.confirmed;
          const s = item.specs || {};
          return (
            <div key={item.id} style={{ background: done ? 'rgba(6,20,14,0.6)' : '#0e1a2e', border: `1px solid ${done ? 'rgba(16,185,129,0.45)' : '#1b2d4f'}`, borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: done ? '0 0 16px rgba(16,185,129,0.07)' : 'none', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', borderRadius: '6px', padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace' }}>STEP #{idx + 1}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: done ? '#34d399' : '#f59e0b', background: done ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {done ? <CheckCircle size={11} /> : <Clock size={11} />}
                  {done ? 'CLAMPED & VERIFIED' : 'ACTION REQUIRED'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{item.detail}</p>
              </div>
              {Object.keys(s).length > 0 && (
                <div style={{ background: '#070d1a', border: '1px solid #1b2d4f', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {Object.entries(s).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{k.replace(/_/g, ' ')}:</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#c084fc', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => onConfirm(item.id)} className={`hmi-btn ${done ? 'hmi-btn-outline-success' : 'hmi-btn-primary'}`} style={{ fontSize: '12px', padding: '10px', width: '100%' }}>
                {done ? <CheckCircle size={14} /> : <Anchor size={14} />}
                {done ? 'Confirmed (Click to Undo)' : 'Arrange, Clamp & Confirm'}
              </button>
            </div>
          );
        })}
      </div>

      {allConfirmed && (
        <div style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(14,26,46,0.8))', border: '2px solid rgba(16,185,129,0.5)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 0 30px rgba(16,185,129,0.15)', animation: 'fadeIn 0.4s ease-out' }}>
          <div>
            <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>✓ Workpiece Arranged, Clamped & Probed</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Kurt Vise alignment verified, stock torqued to 45 Nm, G54 offset registers confirmed.</p>
          </div>
          <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '13px', padding: '13px 28px' }}>
            <span>PROCEED TO STAGE 4: READY REVIEW</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
    </div>
  );
}
