import React from 'react';
import { Wrench, CheckCircle, Clock, ArrowRight, FileCode2 } from 'lucide-react';

export default function StageRequiredTools({ items, onConfirm, allConfirmed, onNext }) {
  const toolItems = items.filter(i => i.stage === 2);
  const confirmedCount = toolItems.filter(i => i.confirmed).length;
  const pct = toolItems.length ? Math.round((confirmedCount / toolItems.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>

      {/* Stage Header */}
      <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
            <Wrench size={15} color="#fbbf24" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>Stage 2 · Required Tools</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>Tool Magazine Loading & Program Matching</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Load each cutting tool into its assigned magazine pot and confirm CNC program revision.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Tools Loaded</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#f1f5f9' }}>{confirmedCount} / {toolItems.length}</div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#070d1a', borderStyle: 'solid', borderWidth: '3px', borderColor: pct === 100 ? '#10b981' : '#1b2d4f', borderTopColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: pct === 100 ? '#10b981' : '#f59e0b', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
            {pct}%
          </div>
          {allConfirmed && (
            <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '12px', padding: '9px 18px', animation: 'bounce 1s ease-in-out infinite' }}>
              NEXT <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {toolItems.map(item => {
          const done = item.confirmed;
          const s = item.specs || {};
          return (
            <div key={item.id} style={{ background: done ? 'rgba(6,20,14,0.6)' : '#0e1a2e', border: `1px solid ${done ? 'rgba(16,185,129,0.45)' : '#1b2d4f'}`, borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: done ? '0 0 16px rgba(16,185,129,0.07)' : 'none', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '6px', padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace' }}>POT #{s.tool_number}</span>
                  <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>T{String(s.tool_number).padStart(2, '0')}</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: done ? '#34d399' : '#f59e0b', background: done ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {done ? <CheckCircle size={11} /> : <Clock size={11} />}
                  {done ? 'INSERTED' : 'REQUIRED'}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{item.detail}</p>
              </div>
              <div style={{ background: '#070d1a', border: '1px solid #1b2d4f', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>Tool Type:</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right', maxWidth: '140px' }}>{s.tool_type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}><FileCode2 size={11} color="#60a5fa" />CNC Rev:</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace' }}>{s.cnc_program_rev}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>Holder:</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{s.holder}</span>
                </div>
              </div>
              <button onClick={() => onConfirm(item.id)} className={`hmi-btn ${done ? 'hmi-btn-outline-success' : 'hmi-btn-primary'}`} style={{ fontSize: '12px', padding: '10px', width: '100%' }}>
                <CheckCircle size={14} />
                {done ? 'Tool Confirmed (Click to Re-inspect)' : `Insert & Confirm Tool #${s.tool_number}`}
              </button>
            </div>
          );
        })}
      </div>

      {allConfirmed && (
        <div style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(14,26,46,0.8))', border: '2px solid rgba(16,185,129,0.5)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 0 30px rgba(16,185,129,0.15)', animation: 'fadeIn 0.4s ease-out' }}>
          <div>
            <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>✓ All 4 Tools Loaded & Verified</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Endmill, Ball Nose, Drill, and Tap assigned to Magazine Pots 1–4. Ready for workpiece setup.</p>
          </div>
          <button onClick={onNext} className="hmi-btn hmi-btn-success" style={{ fontSize: '13px', padding: '13px 28px' }}>
            <span>PROCEED TO STAGE 3: WORKPIECE SETUP</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
    </div>
  );
}
