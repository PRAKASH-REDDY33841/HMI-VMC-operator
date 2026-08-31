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
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchData = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      
      const [scenRes, stateRes] = await Promise.all([
        fetch('/api/scenario'),
        fetch('/api/state')
      ]);

      if (!scenRes.ok || !stateRes.ok) {
        throw new Error(`Server returned HTTP ${scenRes.status} / ${stateRes.status}`);
      }

      const scenData = await scenRes.json();
      const stateData = await stateRes.json();

      if (scenData.success) setScenario(scenData.scenario);
      if (stateData.success) {
        setStage(stateData.stage);
        setOperationStatus(stateData.operation_status);
        setItems(stateData.items || []);
      }
      setErrorMsg(null);
    } catch (err) {
      console.warn(`Connection attempt ${retryCount + 1} failed:`, err);
      // Auto-retry up to 3 times with 1.5s delay (handles cloud server cold-start delay)
      if (retryCount < 3) {
        setIsRetrying(true);
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, 1500);
      } else {
        setErrorMsg('VMC HMI backend server is starting up or temporarily offline. Click RETRY NOW to reconnect.');
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirmItem = async (id) => {
    // Optimistic UI update
    setItems(prev => prev.map(item => item.id === id ? { ...item, confirmed: !item.confirmed } : item));
    try {
      const res = await fetch('/api/confirm', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, confirmed: data.confirmed } : item));
      }
    } catch (err) {
      console.error('Confirm sync error:', err);
    }
  };

  const handleNextStage = async () => {
    // Optimistic UI update
    const nextS = Math.min(stage + 1, 5);
    setStage(nextS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch('/api/next', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) {
        setStage(data.newStage);
        setErrorMsg(null);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      console.error('Next stage sync error:', err);
    }
  };

  const handleStartOperation = async () => {
    setOperationStatus('RUNNING');
    setStage(5);
    try {
      const res = await fetch('/api/operation/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) { 
        setOperationStatus('RUNNING'); 
        setErrorMsg(null); 
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      console.error('Start operation sync error:', err);
    }
  };

  const handleStopOperation = async () => {
    setOperationStatus('STOPPED');
    try {
      const res = await fetch('/api/operation/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) { 
        setOperationStatus('STOPPED'); 
        setErrorMsg(null); 
      }
    } catch (err) {
      console.error('Stop operation sync error:', err);
    }
  };

  const handleReset = async () => {
    setStage(0);
    setOperationStatus('READY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) { 
        fetchData(); 
      }
    } catch (err) {
      console.error('Reset sync error:', err);
    }
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

        {/* Error / Retrying Alert Banner */}
        {errorMsg && (
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠ {errorMsg}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => fetchData(0)} 
                style={{ color: '#fff', fontWeight: 800, background: '#dc2626', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                RETRY NOW
              </button>
              <button onClick={() => setErrorMsg(null)} style={{ color: '#ef4444', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: '6px' }}>✕</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', gap: '16px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #1b2d4f', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            {isRetrying ? 'Retrying connection to VMC HMI Core...' : 'Connecting to VMC HMI Core...'}
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
