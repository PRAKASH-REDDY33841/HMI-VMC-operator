import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import StageTracker from './components/StageTracker';
import StagePowerOn from './components/StagePowerOn';
import StageMachineChecks from './components/StageMachineChecks';
import StageRequiredTools from './components/StageRequiredTools';
import StageWorkpieceSetup from './components/StageWorkpieceSetup';
import StageReadyReview from './components/StageReadyReview';
import StageOperation from './components/StageOperation';
import ControlFooter from './components/ControlFooter';

export default function App() {
  const [scenario, setScenario] = useState(null);
  const [stage, setStage] = useState(0);
  const [operationStatus, setOperationStatus] = useState('READY');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scenRes, stateRes] = await Promise.all([fetch('/api/scenario'), fetch('/api/state')]);
      const scenData = await scenRes.json();
      const stateData = await stateRes.json();
      if (scenData.success) setScenario(scenData.scenario);
      if (stateData.success) {
        setStage(stateData.stage);
        setOperationStatus(stateData.operation_status);
        setItems(stateData.items || []);
      }
      setErrorMsg(null);
    } catch {
      setErrorMsg('Failed to connect to VMC HMI backend. Ensure the node server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirmItem = async (id) => {
    try {
      const res = await fetch('/api/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, confirmed: data.confirmed } : item));
      }
    } catch {}
  };

  const handleNextStage = async () => {
    try {
      const res = await fetch('/api/next', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) {
        setStage(data.newStage);
        setErrorMsg(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error);
      }
    } catch {}
  };

  const handleStartOperation = async () => {
    try {
      const res = await fetch('/api/operation/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) { setOperationStatus('RUNNING'); setStage(5); setErrorMsg(null); }
      else setErrorMsg(data.error);
    } catch {}
  };

  const handleStopOperation = async () => {
    try {
      const res = await fetch('/api/operation/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) { setOperationStatus('STOPPED'); setErrorMsg(null); }
    } catch {}
  };

  const handleReset = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) { setStage(0); setOperationStatus('READY'); fetchData(); window.scrollTo({ top: 0 }); }
    } catch {}
  };

  const currentStageItems = items.filter(i => i.stage === stage);
  const unconfirmedCount = currentStageItems.filter(i => !i.confirmed).length;
  const allConfirmed = unconfirmedCount === 0 && currentStageItems.length > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070d1a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <Header scenario={scenario} currentStage={stage} onReset={handleReset} />

      {/* Stage Tracker */}
      <StageTracker currentStage={stage} operationStatus={operationStatus} />

      {/* Main Content — centered, max-width constrained */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 140px' }}>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '12px', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span>⚠ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '6px' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', gap: '16px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #1b2d4f', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Connecting to VMC HMI Core...
          </div>
        ) : (
          <>
            {stage === 0 && <StagePowerOn onInitiate={handleNextStage} />}
            {stage === 1 && <StageMachineChecks items={items} onConfirm={handleConfirmItem} allConfirmed={allConfirmed} onNext={handleNextStage} />}
            {stage === 2 && <StageRequiredTools items={items} onConfirm={handleConfirmItem} allConfirmed={allConfirmed} onNext={handleNextStage} />}
            {stage === 3 && <StageWorkpieceSetup items={items} onConfirm={handleConfirmItem} allConfirmed={allConfirmed} onNext={handleNextStage} />}
            {stage === 4 && <StageReadyReview items={items} onProceed={handleNextStage} />}
            {stage === 5 && <StageOperation scenario={scenario} operationStatus={operationStatus} onStart={handleStartOperation} onStop={handleStopOperation} />}
          </>
        )}
      </main>

      {/* Sticky Footer Controls */}
      <ControlFooter
        currentStage={stage}
        operationStatus={operationStatus}
        unconfirmedCount={unconfirmedCount}
        allConfirmed={allConfirmed}
        onNextStage={handleNextStage}
        onStartOperation={handleStartOperation}
        onStopOperation={handleStopOperation}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
