const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'hmi_vmc.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS hmi_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    stage INTEGER NOT NULL DEFAULT 0,
    operation_status TEXT NOT NULL DEFAULT 'READY',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    stage INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    specs TEXT,
    step_order INTEGER NOT NULL,
    confirmed INTEGER NOT NULL DEFAULT 0,
    confirmed_at DATETIME
  );
`);

// Mock Scenario Data (Preloaded as per assignment requirements)
const INITIAL_CHECKLIST_ITEMS = [
  // Stage 1: Machine Checks
  {
    id: 'chk_power',
    stage: 1,
    category: 'machine',
    title: 'Power / Control Available',
    detail: 'Verify main 415V 3-phase power supply and 24V DC control circuit energization.',
    specs: JSON.stringify({ parameter: 'Control Voltage', value: '24.1 V DC (Normal)' }),
    step_order: 1
  },
  {
    id: 'chk_estop',
    stage: 1,
    category: 'machine',
    title: 'E-Stop Released',
    detail: 'Ensure main panel Emergency Stop button and pendant E-stop are twist-released.',
    specs: JSON.stringify({ parameter: 'Circuit Status', value: 'Closed / Healthy' }),
    step_order: 2
  },
  {
    id: 'chk_door',
    stage: 1,
    category: 'machine',
    title: 'Guard / Door Closed',
    detail: 'Close safety door enclosure interlock before homing axes.',
    specs: JSON.stringify({ parameter: 'Interlock Switch', value: 'Engaged (Safety OK)' }),
    step_order: 3
  },
  {
    id: 'chk_alarm',
    stage: 1,
    category: 'machine',
    title: 'No Active Alarm',
    detail: 'Confirm CNC controller diagnostic screen has zero active fault flags.',
    specs: JSON.stringify({ parameter: 'Controller Status', value: 'ALARM 000: CLEAR' }),
    step_order: 4
  },
  {
    id: 'chk_lubcoolant',
    stage: 1,
    category: 'machine',
    title: 'Lubrication / Coolant Ready',
    detail: 'Check slide-way lube reservoir level and flood coolant concentration (6-8% Brix).',
    specs: JSON.stringify({ parameter: 'Lube Pressure / Coolant', value: '4.2 bar / 80% Tank' }),
    step_order: 5
  },
  {
    id: 'chk_refreturn',
    stage: 1,
    category: 'machine',
    title: 'Reference Return Complete',
    detail: 'Perform G28 machine zero home return for X, Y, Z axes.',
    specs: JSON.stringify({ parameter: 'Machine Zero (G28)', value: 'X: 0.000, Y: 0.000, Z: 0.000' }),
    step_order: 6
  },

  // Stage 2: Required Tools
  {
    id: 'tool_01',
    stage: 2,
    category: 'tool',
    title: 'Tool #01: 12mm 4-Flute Endmill',
    detail: 'Insert Tool #01 into Spindle / Magazine Pot 1 for Rough Facing & Main Pocketing.',
    specs: JSON.stringify({ tool_number: 1, tool_type: '12mm 4-Flute Solid Carbide Endmill', cnc_program_rev: 'O1001_TOP_MILL.NC Rev 2.1', holder: 'BT40-ER32-70' }),
    step_order: 1
  },
  {
    id: 'tool_02',
    stage: 2,
    category: 'tool',
    title: 'Tool #02: 6mm Ball Nose Endmill',
    detail: 'Insert Tool #02 into Magazine Pot 2 for 3D Contour Finishing & Internal Fillets.',
    specs: JSON.stringify({ tool_number: 2, tool_type: '6mm 2-Flute Carbide Ball Endmill', cnc_program_rev: 'O1001_TOP_MILL.NC Rev 2.1', holder: 'BT40-ER16-100' }),
    step_order: 2
  },
  {
    id: 'tool_03',
    stage: 2,
    category: 'tool',
    title: 'Tool #03: 8.5mm HSS Drill Bit',
    detail: 'Insert Tool #03 into Magazine Pot 3 for M10 Thread Pre-drilling (4 Holes).',
    specs: JSON.stringify({ tool_number: 3, tool_type: '8.5mm 140° TiN Coated Carbide Drill', cnc_program_rev: 'O1001_TOP_MILL.NC Rev 2.1', holder: 'BT40-ER25-80' }),
    step_order: 3
  },
  {
    id: 'tool_04',
    stage: 2,
    category: 'tool',
    title: 'Tool #04: M10x1.5 Tap',
    detail: 'Insert Tool #04 into Magazine Pot 4 for Rigid Tapping M10 Holes.',
    specs: JSON.stringify({ tool_number: 4, tool_type: 'M10x1.5 Spiral Flute HSS-E Tap', cnc_program_rev: 'O1001_TOP_MILL.NC Rev 2.1', holder: 'BT40-ETP12 Tension/Comp Holder' }),
    step_order: 4
  },

  // Stage 3: Workpiece Setup
  {
    id: 'work_fixture',
    stage: 3,
    category: 'workpiece',
    title: 'Fixture Mounting',
    detail: 'Mount 6" Precision CNC Vise onto T-slot table aligned with dial indicator within 0.01mm.',
    specs: JSON.stringify({ fixture_name: 'Kurt Precision 6-inch Vise', alignment_tolerance: '±0.008 mm' }),
    step_order: 1
  },
  {
    id: 'work_orientation',
    stage: 3,
    category: 'workpiece',
    title: 'Workpiece Orientation',
    detail: 'Seat AL6061 raw block (150x100x50mm) against fixed jaw stopper pin.',
    specs: JSON.stringify({ stock_material: 'AL6061-T6 Aluminum Block', dimensions: '150 x 100 x 50 mm' }),
    step_order: 2
  },
  {
    id: 'work_clamping',
    stage: 3,
    category: 'workpiece',
    title: 'Clamping Instruction',
    detail: 'Torque vise handle to specified torque rating. Mallet block down onto parallels.',
    specs: JSON.stringify({ clamping_torque: '45 Nm (33 ft-lb)', seat_verification: 'Parallel feeler gauge 0.02mm NO GO' }),
    step_order: 3
  },
  {
    id: 'work_drawing_rev',
    stage: 3,
    category: 'workpiece',
    title: 'Material & Drawing Revision',
    detail: 'Verify drawing revision stamp matches CNC program header specifications.',
    specs: JSON.stringify({ drawing_number: 'DWG-VMC-OP10', drawing_revision: 'REV-C (Approved)', cnc_program: 'O1001_TOP_MILL.NC' }),
    step_order: 4
  },
  {
    id: 'work_offset',
    stage: 3,
    category: 'workpiece',
    title: 'Work Offset G54 Setup',
    detail: 'Edge-find top-left corner of workpiece stock and probe Z-zero at top surface.',
    specs: JSON.stringify({ work_offset_register: 'G54', x_offset: '-340.250', y_offset: '-185.120', z_offset: '-112.450' }),
    step_order: 5
  }
];

function seedDatabase() {
  // Check if state exists
  const row = db.prepare('SELECT * FROM hmi_state WHERE id = 1').get();
  if (!row) {
    db.prepare("INSERT INTO hmi_state (id, stage, operation_status) VALUES (1, 0, 'READY')").run();
  }

  // Check if checklist items exist
  const count = db.prepare('SELECT COUNT(*) as count FROM checklist_items').get().count;
  if (count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO checklist_items (id, stage, category, title, detail, specs, step_order, confirmed)
      VALUES (@id, @stage, @category, @title, @detail, @specs, @step_order, 0)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) insertStmt.run(item);
    });

    insertMany(INITIAL_CHECKLIST_ITEMS);
  }
}

seedDatabase();

module.exports = db;
