import React from 'react';
import { ArrowRight, CheckCircle2, Play, Square, AlertCircle, Info } from 'lucide-react';

export default function ControlFooter({ currentStage, operationStatus, unconfirmedCount, allConfirmed, onNextStage, onStartOperation, onStopOperation }) {
  const isRunning = operationStatus === 'RUNNING';
  const isStopped = operationStatus === 'STOPPED';
  const canNext = [1,2,3].includes(currentStage) ? unconfirmedCount === 0 : true;

  return (
    <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(7,13,26,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1b2d4f', boxShadow: '0 -8px 32px rgba(0,0,0,0.7)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>

        {/* Status Message */}
        <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {currentStage === 0 && (
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Info size={14} color="#3b82f6" />
              Click POWER ON to begin the machine startup sequence.
            </span>
          )}
          {[1,2,3].includes(currentStage) && unconfirmedCount > 0 && (
            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', padding: '6px 12px', borderRadius: '8px' }}>
              <AlertCircle size={14} color="#f59e0b" />
              <strong>{unconfirmedCount} item(s) pending</strong> — confirm all to unlock NEXT STAGE.
            </span>
          )}
          {[1,2,3].includes(currentStage) && allConfirmed && (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>
              <CheckCircle2 size={14} color="#34d399" />
              All Stage {currentStage} items confirmed — scroll down to proceed.
            </span>
          )}
          {currentStage === 4 && (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700 }}>
              <CheckCircle2 size={14} color="#34d399" />
              All 15 pre-operation checks complete. Click PROCEED TO OPERATION.
            </span>
          )}
          {currentStage === 5 && (
            <span style={{ color: isRunning ? '#22d3ee' : isStopped ? '#f87171' : '#34d399', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700 }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: isRunning ? '#06b6d4' : isStopped ? '#ef4444' : '#10b981', display: 'inline-block', animation: isRunning ? 'ping 1s ease-in-out infinite' : 'none' }}></span>
              SIMULATION: {operationStatus}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {[1,2,3].includes(currentStage) && (
            <button
              onClick={onNextStage}
              disabled={!canNext}
              className={`hmi-btn ${canNext ? 'hmi-btn-success' : 'hmi-btn-secondary'}`}
              style={{ fontSize: '12px', padding: '9px 20px', boxShadow: canNext ? '0 0 16px rgba(16,185,129,0.35)' : 'none' }}
              title={!canNext ? `Confirm all ${unconfirmedCount} remaining item(s) first` : 'Advance to next stage'}
            >
              NEXT STAGE
              <ArrowRight size={14} />
            </button>
          )}
          {currentStage === 4 && (
            <button onClick={onNextStage} className="hmi-btn hmi-btn-success" style={{ fontSize: '12px', padding: '9px 20px', boxShadow: '0 0 16px rgba(16,185,129,0.35)' }}>
              PROCEED TO OPERATION
              <Play size={14} style={{ fill: 'white' }} />
            </button>
          )}
          {currentStage === 5 && (
            <>
              <button onClick={onStartOperation} disabled={isRunning} className="hmi-btn hmi-btn-success" style={{ fontSize: '12px', padding: '9px 18px' }}>
                <Play size={14} style={{ fill: 'white' }} /> START
              </button>
              <button onClick={onStopOperation} disabled={!isRunning} className="hmi-btn hmi-btn-danger" style={{ fontSize: '12px', padding: '9px 18px' }}>
                <Square size={14} style={{ fill: 'white' }} /> STOP
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes ping{0%{opacity:1}75%,100%{opacity:0.1}}`}</style>
    </footer>
  );
}
