const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Scenario preloaded meta info
const SCENARIO_META = {
  quantity: 50,
  operation: 'OP10 - Top Face & Pocket Milling',
  material: 'AL6061-T6 Aluminum Block (150x100x50mm)',
  drawing_revision: 'REV-C',
  cnc_program: 'O1001_TOP_MILL.NC (Rev 2.1)',
  fixture: 'Kurt Precision 6-inch Vise',
  work_offset: 'G54 (X: 0, Y: 0, Z: Top Surface)',
  required_tools_count: 4,
  ordered_setup_steps: 5
};

// GET /api/scenario - Preloaded mock scenario assumptions
app.get('/api/scenario', (req, res) => {
  res.json({ success: true, scenario: SCENARIO_META });
});

// GET /api/state - Current HMI stage, status & items
app.get('/api/state', (req, res) => {
  try {
    const state = db.prepare('SELECT * FROM hmi_state WHERE id = 1').get();
    const items = db.prepare('SELECT * FROM checklist_items ORDER BY stage ASC, step_order ASC').all();

    // Parse specs JSON
    const parsedItems = items.map(item => ({
      ...item,
      confirmed: Boolean(item.confirmed),
      specs: item.specs ? JSON.parse(item.specs) : null
    }));

    res.json({
      success: true,
      stage: state.stage,
      operation_status: state.operation_status,
      updated_at: state.updated_at,
      items: parsedItems
    });
  } catch (err) {
    console.error('Error fetching state:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/confirm - Confirm an item (Check, Tool, or Workpiece step)
app.post('/api/confirm', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Item ID required' });

  try {
    const item = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    // Toggle or confirm item
    const newConfirmedState = item.confirmed ? 0 : 1;
    const now = newConfirmedState ? new Date().toISOString() : null;

    db.prepare('UPDATE checklist_items SET confirmed = ?, confirmed_at = ? WHERE id = ?')
      .run(newConfirmedState, now, id);

    res.json({ success: true, id, confirmed: Boolean(newConfirmedState) });
  } catch (err) {
    console.error('Error confirming item:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/next - Advance to next stage (Enforces: open next stage ONLY after every item on current stage is confirmed)
app.post('/api/next', (req, res) => {
  try {
    const currentState = db.prepare('SELECT * FROM hmi_state WHERE id = 1').get();
    const currentStage = currentState.stage;

    // Stage 0 -> Stage 1 (Power On sequence initialization)
    if (currentStage === 0) {
      db.prepare('UPDATE hmi_state SET stage = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run();
      return res.json({ success: true, newStage: 1 });
    }

    // Stages 1, 2, 3 require all items in that stage to be confirmed
    if ([1, 2, 3].includes(currentStage)) {
      const unconfirmed = db.prepare('SELECT COUNT(*) as count FROM checklist_items WHERE stage = ? AND confirmed = 0').get(currentStage);
      if (unconfirmed.count > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot proceed to next stage: ${unconfirmed.count} item(s) in Stage ${currentStage} remain unconfirmed.`
        });
      }
    }

    const nextStage = Math.min(currentStage + 1, 5);
    db.prepare('UPDATE hmi_state SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(nextStage);

    res.json({ success: true, newStage: nextStage });
  } catch (err) {
    console.error('Error advancing stage:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/operation/start - START Operation (READY -> RUNNING)
app.post('/api/operation/start', (req, res) => {
  try {
    // Check that stage is 5 (or 4 ready review complete) and all items in stages 1,2,3 are confirmed
    const unconfirmed = db.prepare('SELECT COUNT(*) as count FROM checklist_items WHERE confirmed = 0').get();
    if (unconfirmed.count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot start operation: Not all arrangements and checks are complete.'
      });
    }

    db.prepare("UPDATE hmi_state SET operation_status = 'RUNNING', stage = 5, updated_at = CURRENT_TIMESTAMP WHERE id = 1").run();
    res.json({ success: true, status: 'RUNNING' });
  } catch (err) {
    console.error('Error starting operation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/operation/stop - STOP Operation (RUNNING -> STOPPED, preserving latest stage)
app.post('/api/operation/stop', (req, res) => {
  try {
    db.prepare("UPDATE hmi_state SET operation_status = 'STOPPED', updated_at = CURRENT_TIMESTAMP WHERE id = 1").run();
    res.json({ success: true, status: 'STOPPED' });
  } catch (err) {
    console.error('Error stopping operation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reset - Reset entire workflow to Power On
app.post('/api/reset', (req, res) => {
  try {
    db.prepare("UPDATE hmi_state SET stage = 0, operation_status = 'READY', updated_at = CURRENT_TIMESTAMP WHERE id = 1").run();
    db.prepare('UPDATE checklist_items SET confirmed = 0, confirmed_at = NULL').run();
    res.json({ success: true, message: 'Workflow reset to Power On' });
  } catch (err) {
    console.error('Error resetting workflow:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend static build assets if available (Production deployment)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.resolve(clientDistPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`VMC Operator HMI Backend running on http://localhost:${PORT}`);
});
