import React from 'react';
import { CheckCircle2, ShieldCheck, Wrench, Box, Play, XCircle } from 'lucide-react';

export default function StageReadyReview({ items, onProceed }) {
  const machineItems = items.filter(i => i.stage === 1);
  const toolItems = items.filter(i => i.stage === 2);
  const wpItems = items.filter(i => i.stage === 3);

  const mOk = machineItems.every(i => i.confirmed);
  const tOk = toolItems.every(i => i.confirmed);
  const wOk = wpItems.every(i => i.confirmed);
  const allReady = mOk && tOk && wOk;

  const sections = [
    { label: 'Machine Checks', Icon: ShieldCheck, color: '#60a5fa', items: machineItems, ok: mOk, count: machineItems.filter(i=>i.confirmed).length, total: machineItems.length },
    { label: 'Tool Magazine', Icon: Wrench, color: '#fbbf24', items: toolItems, ok: tOk, count: toolItems.filter(i=>i.confirmed).length, total: toolItems.length },
    { label: 'Workpiece Setup', Icon: Box, color: '#c084fc', items: wpItems, ok: wOk, count: wpItems.filter(i=>i.confirmed).length, total: wpItems.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>

      {/* Ready Banner */}
      <div style={{ background: allReady ? 'linear-gradient(135deg, rgba(5,150,105,0.18), rgba(14,26,46,0.95))' : '#0e1a2e', border: `2px solid ${allReady ? 'rgba(16,185,129,0.55)' : 'rgba(245,158,11,0.4)'}`, borderRadius: '20px', padding: '36px 28px', textAlign: 'center', boxShadow: allReady ? '0 0 40px rgba(16,185,129,0.2)' : 'none' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.5)', color: '#34d399', marginBottom: '16px', boxShadow: allReady ? '0 0 20px rgba(16,185,129,0.35)' : 'none' }}>
          <CheckCircle2 size={36} />
        </div>
        <div style={{ display: 'inline-block', padding: '4px 14px', background: allReady ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${allReady ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`, borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: allReady ? '#34d399' : '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', marginBottom: '10px' }}>
          {allReady ? 'STATUS: READY FOR OPERATION' : 'STATUS: REVIEW INCOMPLETE'}
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>VMC Startup Readiness Complete</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.7' }}>
          {allReady ? 'All 15 pre-operation items verified. Machine, tooling, and workpiece are ready for operation.' : 'Some items remain unconfirmed. Please complete all stages before proceeding.'}
        </p>
        <button onClick={onProceed} disabled={!allReady} className="hmi-btn hmi-btn-success" style={{ fontSize: '15px', padding: '15px 40px', boxShadow: allReady ? '0 0 30px rgba(16,185,129,0.4)' : 'none' }}>
          <Play size={18} style={{ fill: 'white' }} />
          Proceed to Operation Simulation
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {sections.map(({ label, Icon, color, items: list, ok, count, total }) => (
          <div key={label} style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '18px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #1b2d4f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon size={15} color={color} />
                <span style={{ fontSize: '12px', fontWeight: 700, color }}>{label}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: ok ? '#34d399' : '#f59e0b', background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{count} / {total} OK</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {list.map(i => (
                <li key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title}</span>
                  {i.confirmed ? <CheckCircle2 size={13} color="#34d399" style={{ flexShrink: 0 }} /> : <XCircle size={13} color="#f59e0b" style={{ flexShrink: 0 }} />}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
