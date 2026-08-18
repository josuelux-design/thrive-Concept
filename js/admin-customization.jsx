// ============================================================
// Thrive TRM — Admin · Customization
// Three admin option-list pages (Document Labels, Event Type,
// Team Function Labels) sharing one configurable-list table.
// Reuses window.UIX (Button/Toggle/SquareButton/Modal), Icon,
// DragGrip, and a top-center success toast. Exposed on
// window.AdminCustom.
// ============================================================
const { useState: useCz, useEffect: useCzE, useRef: useCzR } = React;
const { Button: CzBtn, Toggle: CzToggle, SquareButton: CzSquare, Modal: CzModal } = window.UIX;

const CZ_KEY = 'thrive-customization-v1';
const CZ_ADMIN = 'Brendan Murphy';
const czToday = () => 'Jul 07 2026';

// ---- seed helpers -----------------------------------------
let _czAuto = 0;
const czId = () => 'cz' + (Date.now().toString(36)) + (++_czAuto) + Math.random().toString(36).slice(2, 5);
// custom row
const C = (name, creator, date, active = true, used = 4) =>
  ({ id: czId(), name, type: 'custom', active, creator, date, used });
// system row
const Sy = (name) => ({ id: czId(), name, type: 'system', active: true, creator: null, date: null, used: 0 });

const B = CZ_ADMIN;
const CZ_SEED = {
  documentLabels: {
    Person: [
      C('CCAT', B, 'Jul 07 2026'),
      Sy('Cover letter'),
      C('Assessment', B, 'Jul 06 2026', false),
      C('Dealsheet', B, 'Jun 22 2026', true, 0),
      Sy('LinkedIn PDF'),
      Sy('NDA'),
      Sy('Other'),
      C('Portfolio', 'Gill Hughes', 'May 03 2026'),
      Sy('Reference'),
      Sy('Resume / CV'),
      C('Work sample', 'Gill Hughes', 'May 03 2026', false),
    ],
    Company: [
      C('Master service agreement', B, 'Jun 22 2026'),
      C('Org chart', B, 'Jun 22 2026', true, 0),
      Sy('Other'),
      Sy('Presentation'),
    ],
    Project: [
      Sy('Company presentation'),
      Sy('Invoice'),
      Sy('Other'),
      C('Outreach template', B, 'Jun 22 2026'),
      C('Pitch sheet', B, 'Jun 22 2026', true, 0),
      Sy('Position description'),
      C('Scorecard template', B, 'Jun 22 2026'),
      C('Verification of approval', B, 'Jun 22 2026'),
    ],
  },
  eventType: [
    C('Debrief', B, 'Jun 22 2026'),
    Sy('Meeting'),
    Sy('Recruiter Interview'),
    Sy('Hiring Team Interview'),
  ],
  teamFunction: [
    'Lead Recruiter', 'Primary Scheduler', 'External Contract Specialist', 'Secondary Recruiter',
    'Consulting Partner', 'Primary Analyst', 'Secondary Analyst', 'Talent Team Lead',
    'Talent Team Member', 'Deal Team Lead', 'Deal Team Member', 'Executive Assistant',
    'PortCo Hiring Manager', 'PortCo Team Member', 'Origination', 'Conversion', 'Execution',
  ].map((n, i) => C(n, B, 'Jun 22 2026', true, i % 4 === 0 ? 0 : 3)),
};

// ---- persistence ------------------------------------------
function czLoad() {
  try {
    const raw = localStorage.getItem(CZ_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return JSON.parse(JSON.stringify(CZ_SEED));
}
function czSave(store) {
  try { localStorage.setItem(CZ_KEY, JSON.stringify(store)); } catch (e) {}
}

// shared store hook: read once, persist on every change
function useCzStore() {
  const [store, setStore] = useCz(czLoad);
  const update = (fn) => setStore(prev => { const next = fn(prev); czSave(next); return next; });
  return [store, update];
}

// ---- top-center success toast (DOM, cross-scope safe) ------
function czToast(message) {
  let host = document.getElementById('cz-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'cz-toast-host';
    host.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:10px;align-items:center;pointer-events:none;';
    document.body.appendChild(host);
  }
  const card = document.createElement('div');
  card.style.cssText = 'pointer-events:auto;max-width:460px;background:#fff;border:1px solid var(--border-secondary);border-radius:12px;box-shadow:var(--shadow-lg);padding:12px 16px;display:flex;gap:12px;align-items:center;transform:translateY(-10px);opacity:0;transition:opacity 180ms ease-out, transform 180ms ease-out;font-family:var(--font-body);';
  card.innerHTML = `
    <div style="width:32px;height:32px;border-radius:8px;flex-shrink:0;background:var(--color-success-50);color:var(--color-success-600);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--color-success-300);">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <div style="font-size:15px;font-weight:600;color:var(--fg-primary);white-space:nowrap;">${message}</div>`;
  host.appendChild(card);
  requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
  const dismiss = () => { card.style.opacity = '0'; card.style.transform = 'translateY(-10px)'; setTimeout(() => card.remove(), 200); };
  setTimeout(dismiss, 3200);
}

// ---- layout tokens ----------------------------------------
const CZ_GRID = '28px minmax(0,1fr) 220px 152px 188px';
const rowGrid = { display: 'grid', gridTemplateColumns: CZ_GRID, columnGap: 16, alignItems: 'center' };

// ---- inline text input (edit / add) -----------------------
function CzInput({ value, onChange, onSave, onCancel, placeholder }) {
  return (
    <input
      autoFocus
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); onSave(); }
        else if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }}
      onBlur={(e) => { e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }}
      style={{
        width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px',
        fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)',
        background: '#fff', border: '1px solid var(--border-brand)', borderRadius: 8,
        outline: 'none', boxShadow: 'var(--shadow-focus-ring)',
      }} />
  );
}

// ---- pencil icon button -----------------------------------
function CzPencil({ onClick }) {
  const [h, setH] = useCz(false);
  return (
    <button type="button" aria-label="Edit" onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 36, height: 36, borderRadius: 8, border: 0, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: h ? 'var(--bg-primary-hover)' : 'transparent', color: 'var(--fg-tertiary)',
        transition: 'background 120ms ease-out' }}>
      <Icon.Edit width={18} height={18} />
    </button>
  );
}

// ---- System badge -----------------------------------------
function CzSystemBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px 2px 7px',
      borderRadius: 9999, background: 'var(--color-gray-100)', color: 'var(--fg-tertiary)',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
      <Icon.Lock width={12} height={12} />
      System
    </span>
  );
}

// ============================================================
// Row
// ============================================================
function CzRow({ row, editing, editVal, setEditVal, dropTop, dragging, draggable,
                 onStartEdit, onSaveEdit, onCancelEdit, onToggle, dragHandlers }) {
  const [gripHover, setGripHover] = useCz(false);
  const system = row.type === 'system';

  return (
    <div
      draggable={draggable}
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      onDragEnd={dragHandlers.onDragEnd}
      style={{
        ...rowGrid, padding: '18px 24px',
        borderTop: dropTop ? '2px solid var(--color-brand-500)' : '2px solid transparent',
        borderBottom: '1px solid var(--border-secondary)',
        background: dragging ? 'var(--bg-brand-primary)' : '#fff',
        opacity: dragging ? 0.6 : 1, transition: 'background 120ms ease-out',
      }}>
      {/* drag grip */}
      <span
        onMouseEnter={() => setGripHover(true)} onMouseLeave={() => setGripHover(false)}
        title={draggable ? 'Drag to reorder' : undefined}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: gripHover && draggable ? 'var(--fg-tertiary)' : 'var(--fg-quinary, var(--color-gray-300))',
          cursor: draggable ? 'grab' : 'not-allowed' }}>
        <DragGrip size={20} />
      </span>

      {/* name */}
      <div style={{ minWidth: 0 }}>
        {editing ? (
          <CzInput value={editVal} onChange={setEditVal} onSave={onSaveEdit} onCancel={onCancelEdit} />
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontSize: 16, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
            {system && <CzSystemBadge />}
          </span>
        )}
      </div>

      {/* created */}
      <div style={{ minWidth: 0 }}>
        {system ? (
          <span style={{ fontSize: 16, color: 'var(--fg-quaternary)' }}>—</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.creator}</span>
            <span style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>{row.date}</span>
          </div>
        )}
      </div>

      {/* status */}
      <div>
        {system ? null : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
            opacity: editing ? 0.5 : 1, pointerEvents: editing ? 'none' : 'auto' }}>
            <CzToggle checked={row.active} onChange={() => onToggle(row)} />
            <span style={{ fontSize: 15, color: 'var(--fg-secondary)' }}>{row.active ? 'Active' : 'Disabled'}</span>
          </div>
        )}
      </div>

      {/* action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {editing ? (
          <React.Fragment>
            <CzBtn variant="secondary" size="sm" onClick={onCancelEdit}>Cancel</CzBtn>
            <CzBtn variant="primary" size="sm" onClick={onSaveEdit}>Save</CzBtn>
          </React.Fragment>
        ) : (!system && <CzPencil onClick={() => onStartEdit(row)} />)}
      </div>
    </div>
  );
}

// ---- add row (name input only) ----------------------------
function CzAddRow({ value, setValue, onSave, onCancel }) {
  return (
    <div style={{ ...rowGrid, padding: '18px 24px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-300)' }}>
        <DragGrip size={20} />
      </span>
      <div style={{ minWidth: 0 }}>
        <CzInput value={value} onChange={setValue} onSave={onSave} onCancel={onCancel} placeholder="Enter a name…" />
      </div>
      <div />
      <div />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <CzBtn variant="secondary" size="sm" onClick={onCancel}>Cancel</CzBtn>
        <CzBtn variant="primary" size="sm" onClick={onSave}>Save</CzBtn>
      </div>
    </div>
  );
}

// ============================================================
// Section table
// ============================================================
function CzSection({ title, rows, setRows }) {
  const [editId, setEditId] = useCz(null);
  const [editVal, setEditVal] = useCz('');
  const [adding, setAdding] = useCz(false);
  const [addVal, setAddVal] = useCz('');
  const [confirm, setConfirm] = useCz(null);
  const [dragId, setDragId] = useCz(null);
  const [overId, setOverId] = useCz(null);

  const busy = editId !== null || adding;

  // ---- add ----
  const startAdd = () => { setAdding(true); setAddVal(''); setEditId(null); };
  const cancelAdd = () => { setAdding(false); setAddVal(''); };
  const saveAdd = () => {
    const name = addVal.trim();
    if (!name) return;
    setRows([{ id: czId(), name, type: 'custom', active: true, creator: CZ_ADMIN, date: czToday(), used: 0 }, ...rows]);
    setAdding(false); setAddVal('');
    czToast(`“${name}” added`);
  };

  // ---- edit ----
  const startEdit = (r) => { setEditId(r.id); setEditVal(r.name); setAdding(false); };
  const cancelEdit = () => { setEditId(null); setEditVal(''); };
  const saveEdit = () => {
    const name = editVal.trim();
    if (!name) return;
    setRows(rows.map(r => r.id === editId ? { ...r, name, creator: CZ_ADMIN, date: czToday() } : r));
    setEditId(null); setEditVal('');
    czToast('Changes saved');
  };

  // ---- toggle ----
  const applyDisable = (r) => {
    setRows(rows.map(x => x.id === r.id ? { ...x, active: false } : x));
    czToast(`“${r.name}” disabled`);
  };
  const onToggle = (r) => {
    if (r.active) {
      if (r.used > 0) { setConfirm(r); return; }
      applyDisable(r);
    } else {
      setRows(rows.map(x => x.id === r.id ? { ...x, active: true } : x));
      czToast(`“${r.name}” enabled`);
    }
  };

  // ---- drag reorder ----
  const dragHandlersFor = (r) => ({
    onDragStart: (e) => { if (busy) { e.preventDefault(); return; } setDragId(r.id); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', r.id); } catch (x) {} },
    onDragEnter: () => { if (dragId != null && dragId !== r.id) setOverId(r.id); },
    onDragOver: (e) => { if (dragId != null) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; } },
    onDrop: (e) => {
      e.preventDefault();
      if (dragId == null || dragId === r.id) { setDragId(null); setOverId(null); return; }
      const from = rows.findIndex(x => x.id === dragId);
      const to = rows.findIndex(x => x.id === r.id);
      if (from < 0 || to < 0) { setDragId(null); setOverId(null); return; }
      const next = rows.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setRows(next);
      setDragId(null); setOverId(null);
    },
    onDragEnd: () => { setDragId(null); setOverId(null); },
  });

  return (
    <section style={{ marginBottom: 32 }}>
      {/* section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</h2>
        <CzSquare icon={<Icon.Plus />} accent title={`Add ${title.toLowerCase()}`} onClick={startAdd} size={40} />
      </div>

      {/* card */}
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
        {/* column header */}
        <div style={{ ...rowGrid, padding: '14px 24px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
          <span />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)' }}>Name</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)' }}>Created</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)' }}>Status</span>
          <span />
        </div>

        {/* add row (top) */}
        {adding && <CzAddRow value={addVal} setValue={setAddVal} onSave={saveAdd} onCancel={cancelAdd} />}

        {/* data rows */}
        {rows.map(r => (
          <CzRow key={r.id} row={r}
            editing={editId === r.id}
            editVal={editVal} setEditVal={setEditVal}
            dropTop={overId === r.id && dragId !== r.id}
            dragging={dragId === r.id}
            draggable={!busy}
            onStartEdit={startEdit} onSaveEdit={saveEdit} onCancelEdit={cancelEdit}
            onToggle={onToggle}
            dragHandlers={dragHandlersFor(r)} />
        ))}
      </div>

      {/* disable confirm */}
      {confirm && (
        <CzModal
          title={`Disable “${confirm.name}”?`}
          onClose={() => setConfirm(null)}
          footer={
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <CzBtn variant="secondary" onClick={() => setConfirm(null)}>Cancel</CzBtn>
              <CzBtn variant="primary" onClick={() => { const r = confirm; setConfirm(null); applyDisable(r); }}>Disable</CzBtn>
            </div>
          }>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-warning-50)', color: 'var(--color-warning-600)', border: '1px solid var(--color-warning-300)' }}>
              <Icon.AlertTriangle width={22} height={22} />
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: '22px', color: 'var(--fg-tertiary)' }}>
              This option is used on <strong style={{ color: 'var(--fg-secondary)', fontWeight: 600 }}>{confirm.used} {confirm.used === 1 ? 'record' : 'records'}</strong>. Disabling hides it from the dropdown going forward, but those records keep it.
            </p>
          </div>
        </CzModal>
      )}
    </section>
  );
}

// ---- page shell -------------------------------------------
function CzPageShell({ title, subtitle, children }) {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 40px 72px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
        <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: '24px', color: 'var(--fg-quaternary)', maxWidth: 720 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Pages
// ============================================================
function DocumentLabelsPage() {
  const [store, update] = useCzStore();
  const setSection = (key) => (rows) => update(s => ({ ...s, documentLabels: { ...s.documentLabels, [key]: rows } }));
  const dl = store.documentLabels;
  return (
    <CzPageShell
      title="Document Labels"
      subtitle="Labels applied to documents and attachments. Shown when uploading a file to a record. System created labels can't be edited or deleted.">
      <CzSection title="Person" rows={dl.Person} setRows={setSection('Person')} />
      <CzSection title="Company" rows={dl.Company} setRows={setSection('Company')} />
      <CzSection title="Project" rows={dl.Project} setRows={setSection('Project')} />
    </CzPageShell>
  );
}

function EventTypePage() {
  const [store, update] = useCzStore();
  const setRows = (rows) => update(s => ({ ...s, eventType: rows }));
  return (
    <CzPageShell
      title="Event Type"
      subtitle="Types of events and interviews. Shown when logging or scheduling an event. System created types can't be edited or deleted.">
      <CzSection title="Event types" rows={store.eventType} setRows={setRows} />
    </CzPageShell>
  );
}

function TeamFunctionLabelsPage() {
  const [store, update] = useCzStore();
  const setRows = (rows) => update(s => ({ ...s, teamFunction: rows }));
  return (
    <CzPageShell
      title="Team Function Labels"
      subtitle="Functions assigned to team members on a project. Shown when adding someone to a project team.">
      <CzSection title="Team functions" rows={store.teamFunction} setRows={setRows} />
    </CzPageShell>
  );
}

window.AdminCustom = { DocumentLabelsPage, EventTypePage, TeamFunctionLabelsPage };
