import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Gauge, Cpu, Activity, Disc, Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

const MOCK_GCODE = [
  "N0010 G21 G90 G40 G80 G17",
  "N0020 T01 M06 (12mm ENDMILL)",
  "N0030 S4500 M03 G54",
  "N0040 G00 X-75.000 Y-50.000 Z25.000",
  "N0050 M08 (COOLANT ON)",
  "N0060 G01 Z-3.000 F600",
  "N0070 G01 X75.000 F1200",
  "N0080 G01 Y50.000",
  "N0090 G01 X-75.000",
  "N0100 G01 Y-50.000",
  "N0110 G00 Z25.000",
  "N0120 T02 M06 (6mm BALL MILL)",
  "N0130 S8000 M03",
  "N0140 G01 Z-8.500 F800",
  "N0150 G02 X30.000 Y30.000 R15.000",
  "N0160 T03 M06 (8.5mm DRILL)",
  "N0170 G81 Z-25.000 R2.000 F450",
  "N0180 T04 M06 (M10 TAP)",
  "N0190 G84 Z-20.000 F1500 S500",
  "N0200 G28 X0 Y0 Z0 M09 M05",
  "N0210 M30 (PROGRAM END & RESET)",
];

function getToolForProgress(p) {
  if (p < 25) return 1;
  if (p < 55) return 2;
  if (p < 80) return 3;
  return 4;
}
const TOOL_NAMES = { 1: '12mm 4-Flute Carbide Endmill', 2: '6mm Ball Nose Mill', 3: '8.5mm Carbide Drill', 4: 'M10×1.5 Rigid Tap' };

export default function StageOperation({ scenario, operationStatus, onStart, onStop }) {
  const [rpm, setRpm] = useState(0);
  const [feed, setFeed] = useState(0);
  const [activeTool, setActiveTool] = useState(1);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gcodeIdx, setGcodeIdx] = useState(0);
  const consoleRef = useRef(null);

  const isRunning = operationStatus === 'RUNNING';
  const isStopped = operationStatus === 'STOPPED';
  const isReady = !isRunning && !isStopped;

  useEffect(() => {
    let iv = null;
    if (isRunning) {
      iv = setInterval(() => {
        setElapsed(e => e + 1);
        setRpm(4500 + Math.floor(Math.random() * 100 - 50));
        setFeed(1200 + Math.floor(Math.random() * 50 - 25));
        setGcodeIdx(i => (i + 1) % MOCK_GCODE.length);
        setProgress(p => {
          const next = p >= 100 ? 0 : p + 1;
          setActiveTool(getToolForProgress(next));
          return next;
        });
      }, 800);
    } else {
      setRpm(0); setFeed(0);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [isRunning]);

  useEffect(() => {
    if (consoleRef.current && isRunning) {
      const el = consoleRef.current.querySelector('[data-active="true"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [gcodeIdx, isRunning]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const statusColor = isRunning ? '#06b6d4' : isStopped ? '#ef4444' : '#10b981';
  const statusBg = isRunning ? 'rgba(6,182,212,0.15)' : isStopped ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)';
  const statusText = isRunning ? 'STATUS: RUNNING' : isStopped ? 'STATUS: STOPPED' : 'STATUS: READY';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>

      {/* Stage Header */}
      <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
            <Activity size={15} color="#22d3ee" style={{ animation: isRunning ? 'pulse 1s ease-in-out infinite' : 'none' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>Stage 5 · Live Operation Simulation</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>{scenario?.operation || 'OP10 — Milling & Tapping'}</h2>
          <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {scenario?.cnc_program} · {scenario?.work_offset}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: statusBg, border: `2px solid ${statusColor}`, borderRadius: '12px', boxShadow: `0 0 20px ${statusColor}33`, animation: isRunning ? 'pulse 2s ease-in-out infinite' : 'none' }}>
          {isRunning && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor, display: 'block', animation: 'ping 1s ease-in-out infinite' }}></span>}
          {isStopped && <AlertOctagon size={18} color={statusColor} />}
          {isReady && <CheckCircle2 size={18} color={statusColor} />}
          <span style={{ fontSize: '14px', fontWeight: 900, color: statusColor, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>{statusText}</span>
        </div>
      </div>

      {/* Dashboard: Gauges + G-Code Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>

        {/* Left — Telemetry Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Spindle */}
          <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Disc size={14} color="#22d3ee" style={{ animation: isRunning ? 'spin 0.8s linear infinite' : 'none' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spindle Speed</span>
              </div>
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>S-CODE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace' }}>{rpm}</span>
              <span style={{ fontSize: '11px', color: '#475569' }}>RPM</span>
            </div>
            <div style={{ height: '5px', background: '#1b2d4f', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((rpm/8000)*100, 100)}%`, background: 'linear-gradient(90deg, #2563eb, #22d3ee)', borderRadius: '3px', transition: 'width 0.3s' }}></div>
            </div>
            <div style={{ fontSize: '10px', color: isRunning ? '#22d3ee' : '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: '5px' }}>{isRunning ? 'CW / M03' : '● STOPPED'}</div>
          </div>

          {/* Feed Rate */}
          <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={14} color="#fbbf24" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Axis Feed Rate</span>
              </div>
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>F-CODE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace' }}>{feed}</span>
              <span style={{ fontSize: '11px', color: '#475569' }}>mm/min</span>
            </div>
            <div style={{ height: '5px', background: '#1b2d4f', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((feed/2000)*100, 100)}%`, background: 'linear-gradient(90deg, #d97706, #fbbf24)', borderRadius: '3px', transition: 'width 0.3s' }}></div>
            </div>
            <div style={{ fontSize: '10px', color: '#fbbf24', fontFamily: 'JetBrains Mono, monospace', marginTop: '5px' }}>100% OVERRIDE</div>
          </div>

          {/* Active Tool */}
          <div style={{ background: '#0e1a2e', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Cpu size={14} color="#c084fc" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tool in Spindle</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>TOOL #0{activeTool}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{TOOL_NAMES[activeTool]}</div>
            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: '6px' }}>MAG POT 0{activeTool} · BT40</div>
          </div>
        </div>

        {/* Right — G-Code Console + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* G-Code Console */}
          <div style={{ background: '#070d1a', border: '1px solid #1b2d4f', borderRadius: '14px', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #1b2d4f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Activity size={13} color="#22d3ee" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>CNC Execution Console</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                <Clock size={11} />
                Cycle: <strong style={{ color: '#f1f5f9' }}>{fmt(elapsed)}</strong>
              </div>
            </div>
            <div ref={consoleRef} style={{ flex: 1, height: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {MOCK_GCODE.map((line, i) => {
                const active = i === gcodeIdx && isRunning;
                return (
                  <div key={i} data-active={active ? 'true' : 'false'} style={{ padding: '4px 8px', borderRadius: '5px', background: active ? 'rgba(6,182,212,0.15)' : 'transparent', borderLeft: active ? '3px solid #06b6d4' : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: active ? '#22d3ee' : '#475569', fontFamily: 'JetBrains Mono, monospace', fontWeight: active ? 700 : 400 }}>{line}</span>
                    {active && <span style={{ fontSize: '9px', background: '#06b6d4', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>EXEC</span>}
                  </div>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1b2d4f' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Part Machining Progress</span>
                <span style={{ color: '#22d3ee', fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: '8px', background: '#1b2d4f', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #06b6d4, #10b981)', borderRadius: '4px', transition: 'width 0.5s', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }}></div>
              </div>
            </div>
          </div>

          {/* Start / Stop Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={onStart} disabled={isRunning} className="hmi-btn hmi-btn-success" style={{ fontSize: '14px', padding: '14px', justifyContent: 'center' }}>
              <Play size={18} style={{ fill: 'white' }} />
              START OPERATION
            </button>
            <button onClick={onStop} disabled={!isRunning} className="hmi-btn hmi-btn-danger" style={{ fontSize: '14px', padding: '14px', justifyContent: 'center' }}>
              <Square size={18} style={{ fill: 'white' }} />
              STOP OPERATION
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}@keyframes ping{0%{opacity:1}75%,100%{opacity:0}}`}</style>
    </div>
  );
}
