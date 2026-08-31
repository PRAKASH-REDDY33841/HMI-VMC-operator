import React from 'react';
import { Power, ShieldCheck, Wrench, Box, CheckCircle2, Play } from 'lucide-react';

const STAGES = [
  { id: 0, label: 'Power On', short: 'PWR', Icon: Power },
  { id: 1, label: 'Machine Checks', short: 'CHK', Icon: ShieldCheck },
  { id: 2, label: 'Required Tools', short: 'TLS', Icon: Wrench },
  { id: 3, label: 'Workpiece Setup', short: 'WPC', Icon: Box },
  { id: 4, label: 'Ready Review', short: 'RDY', Icon: CheckCircle2 },
  { id: 5, label: 'Operation', short: 'RUN', Icon: Play },
];

export default function StageTracker({ currentStage, operationStatus }) {
  return (
    <div style={{ background: '#0a1223', borderBottom: '1px solid #1b2d4f' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px', minWidth: '520px', position: 'relative' }}>

          {/* Connector line */}
          <div style={{ position: 'absolute', top: '20px', left: '32px', right: '32px', height: '1px', background: '#1b2d4f', zIndex: 0 }}></div>

          {STAGES.map(s => {
            const { id, label, short, Icon } = s;
            const done = id < currentStage;
            const active = id === currentStage;
            const isRunning = id === 5 && operationStatus === 'RUNNING';
            const isStopped = id === 5 && operationStatus === 'STOPPED';

            let iconBg, iconBorder, iconColor, labelColor;
            if (isRunning) {
              iconBg = 'rgba(6,182,212,0.18)'; iconBorder = '#06b6d4'; iconColor = '#22d3ee'; labelColor = '#22d3ee';
            } else if (isStopped) {
              iconBg = 'rgba(239,68,68,0.15)'; iconBorder = '#ef4444'; iconColor = '#f87171'; labelColor = '#f87171';
            } else if (active) {
              iconBg = 'rgba(59,130,246,0.18)'; iconBorder = '#3b82f6'; iconColor = '#60a5fa'; labelColor = '#e2e8f0';
            } else if (done) {
              iconBg = 'rgba(16,185,129,0.12)'; iconBorder = 'rgba(16,185,129,0.5)'; iconColor = '#34d399'; labelColor = '#94a3b8';
            } else {
              iconBg = '#0e1a2e'; iconBorder = '#1b2d4f'; iconColor = '#334155'; labelColor = '#334155';
            }

            return (
              <div key={id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: iconBg, border: `2px solid ${iconBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: active ? `0 0 14px ${iconBorder}55` : isRunning ? '0 0 14px rgba(6,182,212,0.4)' : 'none',
                  animation: active ? 'none' : isRunning ? 'pulse2 2s ease-in-out infinite' : 'none',
                }}>
                  <Icon size={17} color={iconColor} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: labelColor, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{short}</div>
                  <div style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: labelColor, lineHeight: 1.2, maxWidth: '72px', textAlign: 'center' }}>{label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
