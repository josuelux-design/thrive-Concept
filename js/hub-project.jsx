// ============================================================
// Thrive TRM — Project workspace (kanban + list + drawers)
// ============================================================
const { useState: usePR } = React;
const reportSlug = (name) => (name || 'Report').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const reportDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const initialsOf = (name) => (name || '').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const todayLabel = () => { const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; const d = new Date(); return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`; };

// ============================================================
// Candidate filters — vocabulary + apply + synth meta
// ============================================================
// Every filter that shows in the FilterModal maps to a key on this object.
// FILTER_EMPTY defines the zero state used by "Reset". Arrays default to []
// (multi-select), strings to '', bool to false.
const FILTER_EMPTY = {
  owners: [], addedBy: [], company: '', companyLimit: 'both',
  location: '', minStage: null, rejectedBy: [], rejectionReason: null,
  contacted: null, priority: null, hasScorecards: false,
  tags: [], outreachSource: [],
};

const FILTER_LABELS = {
  owners: 'Owner', addedBy: 'Added by', company: 'Company',
  location: 'Location', minStage: 'Min stage', rejectedBy: 'Rejected by',
  rejectionReason: 'Rejection reason', contacted: 'Contacted',
  priority: 'Prioritization', hasScorecards: 'Has scorecards',
  tags: 'Tags', outreachSource: 'Source',
};

const PRIORITY_OPTIONS       = ['Urgent', 'High', 'Medium', 'Low'];
const CONTACTED_OPTIONS      = ['Contacted', 'Never contacted', 'Awaiting reply'];
const REJECTION_REASONS      = ['Not qualified', 'Not interested', 'Comp misalignment', 'Location mismatch', 'Timing', 'Other'];
const OUTREACH_SOURCES       = ['LinkedIn', 'Referral', 'Cold email', 'Event', 'Rediscovery'];
const COMPANY_LIMIT_OPTIONS  = ['Both', 'Current only', 'Past only'];

function countActiveFilters(f) {
  let n = 0;
  if (f.owners.length) n++;
  if (f.addedBy.length) n++;
  if (f.company.trim()) n++;
  if (f.companyLimit && f.companyLimit !== 'both') n++;
  if (f.location.trim()) n++;
  if (f.minStage) n++;
  if (f.rejectedBy.length) n++;
  if (f.rejectionReason) n++;
  if (f.contacted) n++;
  if (f.priority) n++;
  if (f.hasScorecards) n++;
  if (f.tags.length) n++;
  if (f.outreachSource.length) n++;
  return n;
}

// Deterministic synth meta for fields we don't otherwise store. Same c.id → same
// meta forever; lets the demo filters actually reduce results.
function candMeta(c) {
  if (c._meta) return c._meta;
  let h = 0; const s = String(c.id || c.name || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const at = (arr, offset = 0) => arr[(h + offset) % arr.length];
  const meta = {
    addedBy: at(['AZ', 'MF', 'IA', 'DC', 'PR'], 3),
    priority: at(PRIORITY_OPTIONS, 5),
    contacted: c.stage === 'Research' ? 'Never contacted' : (h % 3 === 0 ? 'Awaiting reply' : 'Contacted'),
    rejectionReason: c.stage === 'Rejected' ? at(REJECTION_REASONS, 7) : null,
    rejectedBy: c.stage === 'Rejected' ? at(['AZ', 'MF', 'IA'], 2) : null,
    outreachSource: at(OUTREACH_SOURCES, 9),
  };
  c._meta = meta;
  return meta;
}

function applyCandFilters(cands, f) {
  let out = cands;
  if (f.owners.length)          out = out.filter(c => f.owners.includes(c.owner));
  if (f.addedBy.length)         out = out.filter(c => f.addedBy.includes(candMeta(c).addedBy));
  if (f.company.trim())         { const q = f.company.trim().toLowerCase(); out = out.filter(c => (c.company || '').toLowerCase().includes(q)); }
  if (f.location.trim())        { const q = f.location.trim().toLowerCase(); out = out.filter(c => [c.city, c.region, c.country].filter(Boolean).some(v => v.toLowerCase().includes(q))); }
  if (f.minStage) {
    const min = HubData.PROJECT_STAGES.indexOf(f.minStage);
    if (min >= 0) out = out.filter(c => HubData.PROJECT_STAGES.indexOf(c.stage) >= min);
  }
  if (f.rejectedBy.length)      out = out.filter(c => f.rejectedBy.includes(candMeta(c).rejectedBy));
  if (f.rejectionReason)        out = out.filter(c => candMeta(c).rejectionReason === f.rejectionReason);
  if (f.contacted)              out = out.filter(c => candMeta(c).contacted === f.contacted);
  if (f.priority)               out = out.filter(c => candMeta(c).priority === f.priority);
  if (f.hasScorecards)          out = out.filter(c => c.scorecards && c.scorecards.count > 0);
  if (f.tags.length)            out = out.filter(c => (c.tags || []).some(t => f.tags.includes(t.label)));
  if (f.outreachSource.length)  out = out.filter(c => f.outreachSource.includes(candMeta(c).outreachSource));
  return out;
}

// Sort catalog for the SortMenu popover
const SORT_OPTIONS = [
  { id: 'rank',      key: null,           dir: 'asc',  label: 'Rank (Default)' },
  { id: 'added-new', key: 'timeInStage',  dir: 'asc',  label: 'Added to Stage (Newest First)' },
  { id: 'added-old', key: 'timeInStage',  dir: 'desc', label: 'Added to Stage (Oldest First)' },
  { id: 'out-new',   key: 'activity',     dir: 'asc',  label: 'Last Outreach (Newest First)' },
  { id: 'out-old',   key: 'activity',     dir: 'desc', label: 'Last Outreach (Oldest First)' },
  { id: 'name-asc',  key: 'name',         dir: 'asc',  label: 'Name (A-Z)' },
  { id: 'name-desc', key: 'name',         dir: 'desc', label: 'Name (Z-A)' },
  { id: 'co-asc',    key: 'company',      dir: 'asc',  label: 'Primary Company (A-Z)' },
  { id: 'co-desc',   key: 'company',      dir: 'desc', label: 'Primary Company (Z-A)' },
  { id: 'title-asc', key: 'title',        dir: 'asc',  label: 'Primary Job Title (A-Z)' },
  { id: 'title-desc',key: 'title',        dir: 'desc', label: 'Primary Job Title (Z-A)' },
];
function sortIdFromState(s) {
  if (!s.key) return 'rank';
  const match = SORT_OPTIONS.find(o => o.key === s.key && o.dir === s.dir);
  return match ? match.id : 'rank';
}
function sortStateFromId(id) {
  const o = SORT_OPTIONS.find(x => x.id === id) || SORT_OPTIONS[0];
  return { key: o.key, dir: o.dir };
}

// ============================================================
// Filter modal building blocks
// ============================================================
// Compact multi-select popover: button reads "N selected" and opens a checkbox list.
function FSMultiSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = usePR(false);
  const [f, setF] = usePR(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const toggle = (opt) => { const has = value.includes(opt); onChange(has ? value.filter(v => v !== opt) : [...value, opt]); };
  const summary = value.length === 0 ? (placeholder || label) : value.length === 1 ? value[0] : `${value.length} selected`;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setF(true)} onMouseLeave={() => setF(false)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '10px 12px', border: `1px solid ${open || f ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 8, background: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, color: value.length ? 'var(--fg-primary)' : 'var(--fg-quaternary)', boxShadow: open ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <Icon.ChevronDown width={16} height={16} style={{ color: 'var(--fg-quaternary)', flexShrink: 0, transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 40, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 4, maxHeight: 260, overflowY: 'auto', animation: 'tt-pop 130ms ease-out' }}>
          {options.length === 0 && <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--fg-quaternary)' }}>No options.</div>}
          {options.map((opt, i) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const val = typeof opt === 'string' ? opt : opt.value;
            const on = value.includes(val);
            return (
              <button key={i} type="button" onClick={() => toggle(val)}
                style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 9px', borderRadius: 6, border: 0, background: on ? 'var(--bg-brand-primary)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-secondary)', textAlign: 'left' }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, border: on ? '0' : '1.5px solid var(--border-primary)', background: on ? 'var(--color-brand-600)' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <Icon.Check width={11} height={11} style={{ color: '#fff', strokeWidth: 3 }} />}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Single-select dropdown for enum-y filters (rejection reason, priority, etc.)
function FSSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = usePR(false);
  const [f, setF] = usePR(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setF(true)} onMouseLeave={() => setF(false)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '10px 12px', border: `1px solid ${open || f ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 8, background: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, color: value ? 'var(--fg-primary)' : 'var(--fg-quaternary)', boxShadow: open ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || (placeholder || label)}</span>
        <Icon.ChevronDown width={16} height={16} style={{ color: 'var(--fg-quaternary)', flexShrink: 0, transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 40, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 4, maxHeight: 260, overflowY: 'auto', animation: 'tt-pop 130ms ease-out' }}>
          <button type="button" onClick={() => { onChange(null); setOpen(false); }}
            style={{ display: 'block', width: '100%', padding: '7px 9px', borderRadius: 6, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-quaternary)', textAlign: 'left' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            Any
          </button>
          {options.map((opt, i) => {
            const on = value === opt;
            return (
              <button key={i} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                style={{ display: 'block', width: '100%', padding: '7px 9px', borderRadius: 6, border: 0, background: on ? 'var(--bg-brand-primary)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 600 : 400, color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)', textAlign: 'left' }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Text input with the same visual language as the selects above
function FSTextInput({ value, onChange, placeholder }) {
  const [f, setF] = usePR(false);
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: `1px solid ${f ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 8, outline: 'none', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
  );
}

function FSToggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <button type="button" role="switch" aria-checked={checked} onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        style={{ width: 40, height: 22, borderRadius: 9999, background: checked ? 'var(--color-brand-600)' : 'var(--color-gray-200)', position: 'relative', border: 0, cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 140ms' }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 140ms' }} />
      </button>
      <span style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>{label}</span>
    </label>
  );
}

// ============================================================
// FilterModal — right drawer, pending state, Apply/Reset/Cancel
// ============================================================
function CandFilterModal({ open, onClose, filters, onApply, teamMembers, tagOptions }) {
  const [draft, setDraft] = usePR(filters);
  // Reset draft whenever the modal opens with the current committed filters.
  React.useEffect(() => { if (open) setDraft(filters); }, [open, filters]);
  if (!open) return null;
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const reset = () => setDraft({ ...FILTER_EMPTY });
  const apply = () => { onApply(draft); onClose(); };

  const teamOpts = teamMembers.map(m => ({ label: m.name, value: m.initials }));
  const stageOpts = HubData.PROJECT_STAGES;
  const rejectedByOpts = teamMembers.map(m => ({ label: m.name, value: m.initials }));

  return (
    <div onMouseDown={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) apply(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(10,13,18,0.24)', display: 'flex', justifyContent: 'flex-end', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()}
        style={{ height: '100vh', width: 'min(520px, 96vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Icon.Adjust width={18} height={18} style={{ color: 'var(--fg-tertiary)' }} />
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Filter candidates</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.X width={20} height={20} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FSMultiSelect label="Owner" placeholder="Any owner" options={teamOpts} value={draft.owners} onChange={(v) => set('owners', v)} />
          <FSMultiSelect label="Added by" placeholder="Any teammate" options={teamOpts} value={draft.addedBy} onChange={(v) => set('addedBy', v)} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <div style={{ flex: 1 }}>
              <FSTextInput value={draft.company} onChange={(v) => set('company', v)} placeholder="Company" />
            </div>
            <div style={{ width: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2, lineHeight: 1 }}>Limit to</div>
              <FSSelect options={COMPANY_LIMIT_OPTIONS} value={draft.companyLimit === 'both' ? 'Both' : draft.companyLimit} onChange={(v) => set('companyLimit', v || 'both')} placeholder="Both" />
            </div>
          </div>
          <FSTextInput value={draft.location} onChange={(v) => set('location', v)} placeholder="Location" />
          <FSSelect label="Minimum Stage Reached" placeholder="Any stage" options={stageOpts} value={draft.minStage} onChange={(v) => set('minStage', v)} />
          <FSMultiSelect label="Rejected by" placeholder="Any teammate" options={rejectedByOpts} value={draft.rejectedBy} onChange={(v) => set('rejectedBy', v)} />
          <FSSelect label="Rejection reason" placeholder="Any reason" options={REJECTION_REASONS} value={draft.rejectionReason} onChange={(v) => set('rejectionReason', v)} />
          <FSSelect label="Contacted" placeholder="Any status" options={CONTACTED_OPTIONS} value={draft.contacted} onChange={(v) => set('contacted', v)} />
          <FSSelect label="Prioritization" placeholder="Any priority" options={PRIORITY_OPTIONS} value={draft.priority} onChange={(v) => set('priority', v)} />

          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 8 }}>Scorecards</div>
            <FSToggle checked={draft.hasScorecards} onChange={(v) => set('hasScorecards', v)} label="Only show candidates with scorecards" />
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', margin: '6px 0 8px' }}>Others</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FSMultiSelect label="Candidate Tags" placeholder="Any tag" options={tagOptions} value={draft.tags} onChange={(v) => set('tags', v)} />
              <FSMultiSelect label="Outreach Source" placeholder="Any source" options={OUTREACH_SOURCES} value={draft.outreachSource} onChange={(v) => set('outreachSource', v)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--border-secondary)', background: '#fff', flexShrink: 0 }}>
          <button type="button" onClick={reset}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Reset
          </button>
          <div style={{ display: 'inline-flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ height: 38, padding: '0 16px', borderRadius: 8, border: 0, background: 'transparent', color: 'var(--fg-brand-tertiary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button type="button" onClick={apply}
              style={{ height: 38, padding: '0 18px', borderRadius: 8, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}>
              Apply
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// SortMenu — popover dropdown, radio-style
// ============================================================
function SortMenu({ sort, setSort }) {
  const [open, setOpen] = usePR(false);
  const [h, setH] = usePR(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const currentId = sortIdFromState(sort);
  const currentLabel = (SORT_OPTIONS.find(o => o.id === currentId) || SORT_OPTIONS[0]).label;
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" title="Sort" aria-label="Sort" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ height: HDR_H, padding: '0 12px', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, background: (open || h) ? 'var(--bg-primary-hover)' : '#fff', border: '1px solid var(--border-primary)', color: 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 120ms' }}>
        <Icon.SortLines width={16} height={16} style={{ color: 'var(--fg-tertiary)' }} />
        <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentLabel}</span>
        <Icon.ChevronDown width={14} height={14} style={{ color: 'var(--fg-quaternary)', transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 60, width: 280, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 4, animation: 'tt-pop 130ms ease-out' }}>
          {SORT_OPTIONS.map(opt => {
            const on = opt.id === currentId;
            return (
              <button key={opt.id} type="button" role="menuitemradio" aria-checked={on}
                onClick={() => { setSort(sortStateFromId(opt.id)); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', border: 0, borderRadius: 7, cursor: 'pointer', background: on ? 'var(--bg-brand-primary)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 600 : 500, color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)', textAlign: 'left' }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ color: on ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', display: 'inline-flex' }}>
                  <Icon.SortLines width={14} height={14} />
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Icon button for the filter action — badges the active count.
function FilterButton({ count, onClick }) {
  const [h, setH] = usePR(false);
  return (
    <button type="button" title="Filter & sort" aria-label="Filter"
      onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ position: 'relative', height: HDR_H, padding: '0 12px', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, background: (count > 0) ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-primary-hover)' : '#fff'), border: `1px solid ${count > 0 ? 'var(--color-brand-500)' : 'var(--border-primary)'}`, color: count > 0 ? 'var(--color-brand-700)' : 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 120ms' }}>
      <Icon.Adjust width={16} height={16} />
      Filter
      {count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: 'var(--color-brand-600)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{count}</span>}
    </button>
  );
}

// Active-filter chip (dismissible)
function FilterChip({ label, value, onRemove }) {
  const [h, setH] = usePR(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 4px 0 10px', borderRadius: 999, background: '#fff', border: '1px solid var(--border-secondary)', boxShadow: 'var(--shadow-xs)', fontFamily: 'var(--font-body)', fontSize: 12.5 }}>
      <span style={{ color: 'var(--fg-quaternary)' }}>{label}:</span>
      <span style={{ fontWeight: 600, color: 'var(--fg-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      <button type="button" onClick={onRemove} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} aria-label={`Remove ${label} filter`}
        style={{ width: 18, height: 18, borderRadius: 4, border: 0, background: h ? 'var(--bg-primary-hover)' : 'transparent', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
        <Icon.X width={12} height={12} />
      </button>
    </span>
  );
}

// ============================================================
// Redesigned header primitives (labeled controls + dropdowns)
// ============================================================
const HDR_H = 34;

// close-on-outside-click / Esc helper for header menus
function useMenuDismiss(open, setOpen, ref) {
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
}

// ---- status pill: semantic color keyed to search age ----
function StatusPill({ status, daysOpen }) {
  const urgent = daysOpen >= 180;
  const c = urgent
    ? { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)', bd: 'var(--color-warning-300)', dot: 'var(--color-warning-600)' }
    : { fg: 'var(--color-success-700)', bg: 'var(--color-success-50)', bd: 'var(--color-success-300)', dot: 'var(--color-success-500)' };
  return (
    <span title={urgent ? 'Open 180+ days — aging search' : 'Open'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 22, padding: '0 9px', borderRadius: 9999, fontSize: 12.5, fontWeight: 600, color: c.fg, background: c.bg, border: `1px solid ${c.bd}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />{status}{daysOpen ? ` · ${daysOpen}d` : ''}
    </span>
  );
}

// ---- compact candidate search (34px) ----
function HdrSearch({ value, onChange }) {
  const [f, setF] = usePR(false);
  const v = value || '';
  return (
    <div style={{ position: 'relative', width: 340, flexShrink: 1, minWidth: 200 }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', pointerEvents: 'none', display: 'inline-flex' }}><Icon.Search width={17} height={17} /></span>
      <input value={v} onChange={(e) => onChange(e.target.value)} placeholder="Filter candidates in this project" onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: '100%', boxSizing: 'border-box', height: HDR_H, padding: `0 ${v ? 34 : 12}px 0 34px`, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: `1px solid ${f ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 8, outline: 'none', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
      {v && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: 6, border: 0, background: 'transparent', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.X width={14} height={14} />
        </button>
      )}
    </div>
  );
}

// ---- outlined header button (Filter / Sort / Generate) ----
function OutlinedBtn({ icon, label, count, chevron, chevronOpen, active, onClick, innerRef }) {
  const [h, setH] = usePR(false);
  return (
    <button ref={innerRef} type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: HDR_H, padding: '0 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
        color: active ? 'var(--color-brand-700)' : 'var(--fg-secondary)',
        background: active ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-primary-hover)' : '#fff'),
        border: `1px solid ${active ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
        boxShadow: 'var(--shadow-xs)', transition: 'background 120ms, border-color 120ms' }}>
      {React.cloneElement(icon, { width: 18, height: 18, style: { color: active ? 'var(--color-brand-600)' : 'var(--fg-tertiary)' } })}
      {label}
      {count != null && count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: 'var(--color-brand-600)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{count}</span>}
      {chevron && <Icon.ChevronDown width={16} height={16} style={{ color: 'var(--fg-quaternary)', marginLeft: -1, transition: 'transform 150ms', transform: chevronOpen ? 'rotate(180deg)' : 'none' }} />}
    </button>
  );
}

// ---- primary header button (Add candidates) ----
function PrimaryAddBtn({ label, chevronOpen, onClick }) {
  const [h, setH] = usePR(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: HDR_H, padding: '0 14px', borderRadius: 8, cursor: 'pointer', border: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-on-brand)', whiteSpace: 'nowrap', flexShrink: 0, background: h ? 'var(--bg-brand-solid-hover)' : 'var(--bg-brand-solid)', boxShadow: 'var(--shadow-skeu)', transition: 'background 120ms' }}>
      <Icon.Plus width={18} height={18} />{label}
      <Icon.ChevronDown width={16} height={16} style={{ marginLeft: 1, opacity: .85, transition: 'transform 150ms', transform: chevronOpen ? 'rotate(180deg)' : 'none' }} />
    </button>
  );
}

// ---- dropdown menu shell + items ----
function HdrMenu({ width = 240, children }) {
  return <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 60, width, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'tt-pop 130ms ease-out', transformOrigin: 'top right' }}>{children}</div>;
}
function HdrMenuLabel({ children }) {
  return <div style={{ padding: '6px 10px 7px', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>{children}</div>;
}
function HdrMenuDivider() {
  return <div style={{ height: 1, background: 'var(--border-secondary)', margin: '6px 8px' }} />;
}
function HdrMenuItem({ icon, title, desc, featured, danger, onClick }) {
  const [h, setH] = usePR(false);
  const iconColor = danger ? 'var(--color-error-600)' : featured ? 'var(--color-brand-600)' : 'var(--fg-tertiary)';
  const titleColor = danger ? 'var(--color-error-700)' : 'var(--fg-primary)';
  const bg = featured ? (h ? 'var(--color-brand-100)' : 'var(--bg-brand-primary)') : (h ? 'var(--bg-primary-hover)' : 'transparent');
  return (
    <button type="button" role="menuitem" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: desc ? 'flex-start' : 'center', gap: 11, width: '100%', padding: '9px 10px', border: 0, borderRadius: 8, cursor: 'pointer', background: bg, textAlign: 'left', fontFamily: 'var(--font-body)', transition: 'background 100ms' }}>
      <span style={{ display: 'inline-flex', flexShrink: 0, color: iconColor, marginTop: desc ? 1 : 0 }}>{React.cloneElement(icon, { width: 18, height: 18 })}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: featured ? 600 : 500, color: titleColor }}>
          {title}
          {featured && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: 'var(--color-brand-700)', background: '#fff', border: '1px solid var(--color-brand-200)', borderRadius: 4, padding: '1px 5px' }}>Featured</span>}
        </span>
        {desc && <span style={{ display: 'block', fontSize: 12.5, lineHeight: '17px', color: 'var(--fg-quaternary)', marginTop: 2 }}>{desc}</span>}
      </span>
    </button>
  );
}

// ---- Add candidates menu (primary CTA) ----
function AddCandidatesMenu({ onSource, onManual, onUpload, onLinkedIn }) {
  const [open, setOpen] = usePR(false);
  const ref = React.useRef(null);
  useMenuDismiss(open, setOpen, ref);
  const toast = (title, message) => HubUI.showHubToast({ title, message });
  const run = (fn) => { setOpen(false); fn && fn(); };
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <PrimaryAddBtn label="Add candidates" chevronOpen={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <HdrMenu width={308}>
          <HdrMenuLabel>Add candidates</HdrMenuLabel>
          <HdrMenuItem featured icon={<Icon.Briefcase />} title="Source from past projects" desc="Reuse candidates you've already found in other searches" onClick={() => run(onSource)} />
          <HdrMenuDivider />
          <HdrMenuItem icon={<Icon.Upload />} title="Upload resume" desc="Parse a PDF or DOCX into a new candidate" onClick={() => run(onUpload || (() => toast('Upload resume', 'Choose a resume file to import as a new candidate.')))} />
          <HdrMenuItem icon={<Icon.LinkedIn />} title="Import from LinkedIn" desc="Paste a LinkedIn URL to pull the profile" onClick={() => run(onLinkedIn || (() => toast('Import from LinkedIn', 'Paste a LinkedIn profile URL to import.')))} />
          <HdrMenuItem icon={<Icon.UserPlus />} title="Add manually" desc="Start with a blank card — fill in experience yourself" onClick={() => run(onManual)} />
        </HdrMenu>
      )}
    </div>
  );
}

// ---- project logo mark ----
function ProjLogo({ size = 44, onClick }) {
  return (
    <button type="button" onClick={onClick} title="Project details" style={{ width: size, height: size, borderRadius: 12, border: 0, padding: 0, cursor: 'pointer', background: 'linear-gradient(135deg, #2A3CC4, #1F2A8A)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#7CC0F8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 16a4 4 0 0 1 .9-7.9A5.5 5.5 0 0 1 17.7 8.2 3.9 3.9 0 0 1 18 16" />
        <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" />
      </svg>
    </button>
  );
}

// ---- project/kanban/details view toggle ----
function ProjViewToggle({ view, setView }) {
  const Rows = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  const Cols = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="16" rx="1.5" /><rect x="17" y="4" width="4" height="16" rx="1.5" /></svg>;
  const Doc = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  // Map icon — grouped rows with a colored priority band on the leading edge (mapping-sheet metaphor)
  const MapIco = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5v14" /><path d="M8 6h13M8 12h13M8 18h9" /></svg>;
  const Item = ({ id, icon, title }) => {
    const on = view === id;
    return <button type="button" title={title} onClick={() => setView(id)} style={{ width: 38, height: 28, borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? '#fff' : 'transparent', border: on ? '1px solid var(--border-secondary)' : '1px solid transparent', color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>{React.cloneElement(icon, { width: 18, height: 18 })}</button>;
  };
  return <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-tertiary)', borderRadius: 9, flexShrink: 0 }}><Item id="details" icon={<Doc />} title="Details" /><Item id="list" icon={<Rows />} title="List" /><Item id="kanban" icon={<Cols />} title="Kanban" /><Item id="map" icon={<MapIco />} title="Map" /></div>;
}

// ---- Empty vs Populated mode toggle (details view only) ----
function ModeToggle({ mode, setMode }) {
  const items = [
    { id: 'empty',     label: 'Empty state' },
    { id: 'populated', label: 'Populated' },
  ];
  return (
    <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-tertiary)', borderRadius: 9, flexShrink: 0 }}>
      {items.map(it => {
        const on = mode === it.id;
        return (
          <button key={it.id} type="button" onClick={() => setMode(it.id)}
            style={{ height: 26, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
              background: on ? '#fff' : 'transparent',
              border: on ? '1px solid var(--border-secondary)' : '1px solid transparent',
              color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)',
              boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- card density toggle (kanban only) — condensed vs expanded card body ----
function DensityToggle({ density, setDensity }) {
  const Compact = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
  const Expanded = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="4" width="16" height="7" rx="1.5" /><rect x="4" y="13" width="16" height="7" rx="1.5" /></svg>;
  const Item = ({ id, icon, title }) => {
    const on = density === id;
    return (
      <button type="button" title={title} onClick={() => setDensity(id)}
        style={{ width: 34, height: 26, borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? '#fff' : 'transparent', border: on ? '1px solid var(--border-secondary)' : '1px solid transparent', color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>
        {React.cloneElement(icon, { width: 16, height: 16 })}
      </button>
    );
  };
  return <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-tertiary)', borderRadius: 8, flexShrink: 0 }}><Item id="condensed" icon={<Compact />} title="Condensed cards" /><Item id="expanded" icon={<Expanded />} title="Expanded cards" /></div>;
}

// ---- view toolbar: search + filter + sort (left) · table controls + collapse toggle + view toggle (right) ----
function ViewToolbar({ query, setQuery, onFilter, filterCount, sort, setSort, resultCount, totalCount, onToggleCollapse, collapseLabel, allCollapsed, showCollapse = true, tableControls, view, setView, density, setDensity }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 24px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <HdrSearch value={query} onChange={setQuery} />
        <FilterButton count={filterCount} onClick={onFilter} />
        <SortMenu sort={sort} setSort={setSort} />
        {typeof resultCount === 'number' && (
          <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', marginLeft: 6, whiteSpace: 'nowrap' }}>
            {resultCount === totalCount ? `${totalCount} candidate${totalCount === 1 ? '' : 's'}` : `${resultCount} of ${totalCount}`}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        {tableControls}
        {tableControls && showCollapse && <span style={{ width: 1, height: 22, background: 'var(--border-secondary)' }} />}
        {showCollapse && (
          <button type="button" onClick={onToggleCollapse} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--fg-brand-tertiary)', fontFamily: 'var(--font-body)' }}>
            {allCollapsed ? <Icon.ChevronDown width={16} height={16} /> : <Icon.ChevronUp width={16} height={16} />}
            {collapseLabel}
          </button>
        )}
        {view === 'kanban' && <span style={{ width: 1, height: 22, background: 'var(--border-secondary)' }} />}
        {view === 'kanban' && <DensityToggle density={density} setDensity={setDensity} />}
        <span style={{ width: 1, height: 22, background: 'var(--border-secondary)' }} />
        <ProjViewToggle view={view} setView={setView} />
      </div>
    </div>
  );
}

// ---- active-filter chip row — shown under the toolbar when any filter is applied ----
function ActiveFilterRow({ filters, teamMembers, onChange, onClear }) {
  const nameFor = (initials) => { const m = (teamMembers || []).find(x => x.initials === initials); return m ? m.name : initials; };
  const chips = [];
  if (filters.owners.length)    chips.push({ label: FILTER_LABELS.owners, value: filters.owners.map(nameFor).join(', '), remove: () => onChange({ ...filters, owners: [] }) });
  if (filters.addedBy.length)   chips.push({ label: FILTER_LABELS.addedBy, value: filters.addedBy.map(nameFor).join(', '), remove: () => onChange({ ...filters, addedBy: [] }) });
  if (filters.company.trim())   chips.push({ label: FILTER_LABELS.company, value: filters.company, remove: () => onChange({ ...filters, company: '' }) });
  if (filters.companyLimit && filters.companyLimit !== 'both') chips.push({ label: 'Limit', value: filters.companyLimit, remove: () => onChange({ ...filters, companyLimit: 'both' }) });
  if (filters.location.trim())  chips.push({ label: FILTER_LABELS.location, value: filters.location, remove: () => onChange({ ...filters, location: '' }) });
  if (filters.minStage)         chips.push({ label: FILTER_LABELS.minStage, value: filters.minStage, remove: () => onChange({ ...filters, minStage: null }) });
  if (filters.rejectedBy.length)chips.push({ label: FILTER_LABELS.rejectedBy, value: filters.rejectedBy.map(nameFor).join(', '), remove: () => onChange({ ...filters, rejectedBy: [] }) });
  if (filters.rejectionReason)  chips.push({ label: FILTER_LABELS.rejectionReason, value: filters.rejectionReason, remove: () => onChange({ ...filters, rejectionReason: null }) });
  if (filters.contacted)        chips.push({ label: FILTER_LABELS.contacted, value: filters.contacted, remove: () => onChange({ ...filters, contacted: null }) });
  if (filters.priority)         chips.push({ label: FILTER_LABELS.priority, value: filters.priority, remove: () => onChange({ ...filters, priority: null }) });
  if (filters.hasScorecards)    chips.push({ label: FILTER_LABELS.hasScorecards, value: 'Yes', remove: () => onChange({ ...filters, hasScorecards: false }) });
  if (filters.tags.length)      chips.push({ label: FILTER_LABELS.tags, value: filters.tags.join(', '), remove: () => onChange({ ...filters, tags: [] }) });
  if (filters.outreachSource.length) chips.push({ label: FILTER_LABELS.outreachSource, value: filters.outreachSource.join(', '), remove: () => onChange({ ...filters, outreachSource: [] }) });
  if (chips.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '10px 24px 0' }}>
      {chips.map((ch, i) => <FilterChip key={i} label={ch.label} value={ch.value} onRemove={ch.remove} />)}
      <button type="button" onClick={onClear}
        style={{ height: 26, padding: '0 10px', borderRadius: 999, border: 0, background: 'transparent', color: 'var(--color-brand-700)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        Clear all
      </button>
    </div>
  );
}

// ---- team avatar stack (max 3 shown + overflow) ----
const TEAM_AVA = [{ bg: 'rgb(167,157,225)', fg: '#3B2E7A' }, { bg: 'rgb(140,174,242)', fg: '#15357A' }, { bg: 'rgb(144,240,136)', fg: '#1F4F17' }, { bg: 'rgb(247,193,110)', fg: '#7A4E0C' }];
function TeamStack({ team, more }) {
  const shown = team.slice(0, 3);
  const extra = (team.length - shown.length) + (more || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((t, i) => {
        const c = TEAM_AVA[i % TEAM_AVA.length];
        return <span key={i} title={t} style={{ width: 30, height: 30, borderRadius: '50%', background: c.bg, color: c.fg, border: '2px solid #fff', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: i ? -9 : 0, position: 'relative', zIndex: shown.length - i }}>{t}</span>;
      })}
      {extra > 0 ? <span title={`${extra} more team members`} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-gray-100)', border: '2px solid #fff', color: 'var(--fg-secondary)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: -9 }}>+{extra}</span> : null}
    </div>
  );
}

// Lead-signal glyph map (recruiting-domain icons)
const LEAD_ICONS = { user: Icon.User, message: Icon.MessagePlus, video: Icon.Video, calendar: Icon.Calendar, offer: Icon.Star, star: Icon.Star, clock: Icon.Clock, note: Icon.Note, phone: Icon.Phone };

// ---- candidate action row — note + outreach always shown; rest revealed on hover ----
function CandCardActions({ c, onOpen, hover }) {
  const { HubMiniIcon, showHubToast } = HubUI;
  const toast = (t) => showHubToast({ title: t, message: c.name });
  const isInterview = ['Recruiter Interview', 'Hiring Team Interview'].includes(c.stage);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 0 }}>
      <HubMiniIcon icon={<Icon.Note />} accent title="Add note" onClick={() => onOpen(c.id, 'Notes', true)} />
      <HubMiniIcon icon={<Icon.MessagePlus />} accent title="Add outreach" onClick={() => onOpen(c.id, 'Outreaches', true)} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden', maxWidth: hover ? 220 : 0, opacity: hover ? 1 : 0, transition: 'max-width 220ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease-out' }}>
        <HubMiniIcon icon={<Icon.Mail />} title="View email address(s)" onClick={() => toast('Email address')} />
        <HubMiniIcon icon={<Icon.Phone />} title="View phone number(s)" onClick={() => toast('Phone number')} />
        <HubMiniIcon icon={<Icon.CalendarPlus />} accent title="Add event" onClick={() => onOpen(c.id, 'Events', true)} />
        {isInterview && <HubMiniIcon icon={<Icon.Star />} accent title="Add scorecard" onClick={() => onOpen(c.id, 'Scorecards', true)} />}
      </div>
    </div>
  );
}

// ---- conditional status banner (off-limits danger / duplicate neutral) ----
function CardBanner({ c, onOpen }) {
  const { showHubToast } = HubUI;
  const off = c.offLimits ? (typeof c.offLimits === 'string' ? c.offLimits : 'Off limits') : (c.flag ? 'Off limits' : null);
  if (!off && !c.dup) return null;
  const danger = !!off;
  const onDetails = (e) => { e.stopPropagation(); if (danger) onOpen(c.id, 'Off Limits'); else showHubToast({ title: 'Possible duplicate', message: `Review potential matches for ${c.name}` }); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '-16px -16px 12px', padding: '8px 12px', borderRadius: '11px 11px 0 0', background: danger ? 'var(--bg-error-primary)' : 'var(--bg-tertiary)', color: danger ? 'var(--color-error-700)' : 'var(--fg-secondary)' }}>
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>{danger ? <Icon.Flag width={14} height={14} /> : <Icon.Copy2 width={14} height={14} />}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{danger ? off : 'Possible duplicate'}</span>
      <button type="button" onClick={onDetails} style={{ flexShrink: 0, border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: danger ? 'var(--color-error-700)' : 'var(--color-brand-600)', textDecoration: 'underline' }}>See details</button>
    </div>
  );
}

// ---- overflow (kebab) menu ----
function CardMenu({ c, onOpen }) {
  const { showHubToast } = HubUI;
  const [open, setOpen] = usePR(false);
  const [pos, setPos] = usePR(null);
  const [h, setH] = usePR(false);
  const btnRef = React.useRef(null);
  const toggle = (e) => {
    e.stopPropagation();
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: Math.min(r.bottom + 6, window.innerHeight - 244), right: Math.max(12, window.innerWidth - r.right) });
    setOpen(o => !o);
  };
  const run = (fn) => (e) => { e.stopPropagation(); setOpen(false); fn(); };
  const items = [
    { label: 'View profile', icon: <Icon.User />, fn: () => onOpen(c.id) },
    { label: 'Prioritize', icon: <Icon.Star />, fn: () => showHubToast({ title: `Prioritize ${c.name}`, message: 'Moved to top of stage' }) },
    { label: 'Move stage', icon: <Icon.Trending />, fn: () => showHubToast({ title: 'Move stage', message: c.name }) },
    { label: 'Add to another project', icon: <Icon.AddProject />, fn: () => showHubToast({ title: 'Add to another project', message: c.name }) },
    { label: 'Not a fit', icon: <Icon.X />, danger: true, fn: () => showHubToast({ title: `${c.name} is not a fit`, message: 'Moved to Rejected' }) },
  ];
  return (
    <React.Fragment>
      <button ref={btnRef} type="button" aria-label="More actions" onClick={toggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 30, height: 30, borderRadius: 7, border: 0, background: (open || h) ? 'var(--bg-primary-hover)' : 'transparent', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon.DotsVertical width={18} height={18} />
      </button>
      {open && pos && ReactDOM.createPortal(
        <React.Fragment>
          <div onMouseDown={run(() => {})} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 201, width: 232, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'cp-drop 140ms ease-out', fontFamily: 'var(--font-body)' }}>
            {items.map((it, i) => (
              <button key={i} type="button" onClick={run(it.fn)}
                onMouseEnter={(e) => e.currentTarget.style.background = it.danger ? 'var(--bg-error-primary)' : 'var(--bg-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', cursor: 'pointer', padding: '8px 10px', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: it.danger ? 'var(--color-error-600)' : 'var(--fg-secondary)', textAlign: 'left' }}>
                <span style={{ display: 'inline-flex', color: it.danger ? 'var(--color-error-600)' : 'var(--fg-quaternary)' }}>{React.cloneElement(it.icon, { width: 17, height: 17 })}</span>
                {it.label}
              </button>
            ))}
          </div>
        </React.Fragment>, document.body)}
    </React.Fragment>
  );
}

function Votes({ c, row, onVote }) {
  const [pop, setPop] = usePR(null); // { dir, top, left }
  const [note, setNote] = usePR('');
  const vote = c.myVote || null;
  const click = (e, dir) => {
    e.stopPropagation();
    if (vote === dir) { onVote(c.id, dir); return; } // clicking your current vote removes it
    const r = e.currentTarget.getBoundingClientRect();
    setNote('');
    setPop({ dir, top: Math.min(r.bottom + 8, window.innerHeight - 230), left: Math.min(r.left, window.innerWidth - 296) });
  };
  const save = () => { onVote(c.id, pop.dir, note); setPop(null); };
  const Thumb = ({ dir, count }) => {
    const active = vote === dir;
    const Ic = dir === 'up' ? Icon.ThumbsUp : Icon.ThumbsDown;
    const activeColor = dir === 'up' ? 'var(--color-brand-600)' : 'var(--color-error-600)';
    const [h, setH] = usePR(false);
    return (
      <button type="button" onClick={(e) => click(e, dir)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        title={active ? 'Click to remove your vote' : (dir === 'up' ? 'Vote up' : 'Vote down')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 400, padding: 0, color: active ? activeColor : (h ? 'var(--fg-tertiary)' : 'var(--fg-quaternary)'), transition: 'color 120ms' }}>
        <Ic width={18} height={18} fill={active ? 'currentColor' : 'none'} /> {count}
      </button>
    );
  };
  const dir = pop && pop.dir;
  return (
    <div style={{ display: 'flex', flexDirection: row ? 'row' : 'column', gap: row ? 10 : 8, alignItems: row ? 'center' : 'flex-end', flexShrink: 0 }}>
      <Thumb dir="up" count={c.up} />
      <Thumb dir="down" count={c.down} />
      {pop && ReactDOM.createPortal(
        <React.Fragment>
          <div onMouseDown={() => setPop(null)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'fixed', top: pop.top, left: pop.left, zIndex: 201, width: 280, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 14, animation: 'cp-drop 140ms ease-out', fontFamily: 'var(--font-body)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: dir === 'up' ? 'var(--color-brand-600)' : 'var(--color-error-600)', background: dir === 'up' ? 'var(--bg-brand-primary)' : 'var(--bg-error-primary)' }}>{dir === 'up' ? <Icon.ThumbsUp width={17} height={17} fill="currentColor" /> : <Icon.ThumbsDown width={17} height={17} fill="currentColor" />}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>{vote && vote !== dir ? `Change to ${dir === 'up' ? 'thumbs up' : 'thumbs down'}` : `Thumbs ${dir === 'up' ? 'up' : 'down'}`}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
              </div>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} autoFocus placeholder="Add a note (optional)…" style={{ width: '100%', boxSizing: 'border-box', height: 70, padding: '9px 11px', fontSize: 13, lineHeight: '19px', fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 9, outline: 'none', resize: 'none', boxShadow: 'var(--shadow-xs)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 11 }}>
              <button type="button" onClick={() => setPop(null)} style={{ height: 34, padding: '0 13px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button type="button" onClick={save} style={{ height: 34, padding: '0 15px', borderRadius: 8, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}>Save vote</button>
            </div>
          </div>
        </React.Fragment>, document.body)}
    </div>
  );
}

// ---- footer: time-in-stage pill + owner (name reveals on avatar hover only) ----
function CardFooterOwner({ c, sig, onOwner }) {
  const { OwnerMenu, ownerName } = window.ProjBulk;
  const [oh, setOh] = usePR(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, minWidth: 0 }}>
      <span title={`${sig.timeInStage} in stage`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 9999, background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)', border: '1px solid var(--border-secondary)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
        <Icon.Clock width={12} height={12} />{sig.timeInStage}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', overflow: 'hidden', maxWidth: oh ? 130 : 0, opacity: oh ? 1 : 0, transition: 'max-width 220ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease-out' }}>
        <span style={{ fontSize: 13, color: 'var(--fg-tertiary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ownerName(c.owner)}</span>
      </span>
      <span onMouseEnter={() => setOh(true)} onMouseLeave={() => setOh(false)} style={{ display: 'inline-flex' }}>
        <OwnerMenu owner={c.owner} onChange={(o) => onOwner && onOwner(c.id, o)} size={22} />
      </span>
    </span>
  );
}

// ---- no-data CTA button (upload resume / import from linkedin / add manually) ----
function NoDataCta({ icon, label, onClick, featured }) {
  const [h, setH] = usePR(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 34, padding: '0 11px',
        border: `1px solid ${featured ? (h ? 'var(--color-brand-500)' : 'var(--color-brand-300)') : (h ? 'var(--border-primary)' : 'var(--border-secondary)')}`,
        borderRadius: 8, cursor: 'pointer',
        background: featured ? (h ? 'var(--color-brand-100)' : 'var(--bg-brand-primary)') : (h ? 'var(--bg-primary-hover)' : '#fff'),
        color: featured ? 'var(--color-brand-700)' : 'var(--fg-secondary)',
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, textAlign: 'left', transition: 'background 120ms, border-color 120ms',
      }}>
      <span style={{ display: 'inline-flex', flexShrink: 0, color: featured ? 'var(--color-brand-600)' : 'var(--fg-tertiary)' }}>{React.cloneElement(icon, { width: 16, height: 16 })}</span>
      {label}
    </button>
  );
}

// ---- kanban candidate card ----
function KanbanCard({ c, onOpen, selected, onToggle, onDragStart, onDragEnd, dragging, onUnhide, onOwner, onVote, onCandName, onCandNameCommit, onCandNameCancel, onSeedFromMatch, density }) {
  const { HubLink, HubColorTag, HubMiniIcon } = HubUI;
  const { SelectableAvatar, OwnerMenu, ownerName } = window.ProjBulk;
  const [h, setH] = usePR(false);
  const sig = HubData.candidateSignal(c);
  const LeadIc = LEAD_ICONS[sig.lead.icon] || Icon.Clock;
  const next = sig.lead.tone === 'next';
  const loc = [c.city, c.region, c.country].filter(Boolean).join(', ');
  const isNew = !!c.isNew;
  const noData = !c.title && !c.company && !(c.experience && c.experience.length);
  const toast = (title, message) => HubUI.showHubToast({ title, message });

  // ---- condensed card — name + title + key actions. Skipped for isNew / noData so the
  // ---- inline-name edit and the "no data" CTAs stay visible during onboarding.
  if (density === 'condensed' && !isNew && !noData) {
    return (
      <div data-card data-id={c.id} draggable
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', c.id); } catch (_) {} onDragStart && onDragStart(c.id); }}
        onDragEnd={() => onDragEnd && onDragEnd()}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          background: selected ? 'var(--bg-brand-primary)' : '#fff',
          border: `1px solid ${selected ? 'var(--color-brand-500)' : 'var(--border-secondary)'}`,
          borderRadius: 10, padding: '10px 12px',
          boxShadow: selected ? 'var(--shadow-sm)' : (h ? 'var(--shadow-md)' : 'var(--shadow-xs)'),
          transition: 'box-shadow 150ms, background 120ms, border-color 120ms',
          opacity: dragging ? 0.4 : 1, cursor: 'grab',
        }}>
        {/* banner still shown when urgent — off-limits / duplicate flags are important even in condensed mode */}
        <CardBanner c={c} onOpen={onOpen} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <SelectableAvatar c={c} size={32} selected={selected} onToggle={onToggle} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span onClick={(e) => { e.stopPropagation(); onOpen(c.id); }} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={14.5}>{c.name}</HubLink></span>
              {c.eye && <span title="Hidden from hiring manager" style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0 }}><Icon.EyeOff width={12} height={12} /></span>}
            </div>
            {c.title && <div style={{ marginTop: 1, fontSize: 12.5, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            <HubMiniIcon icon={<Icon.Note />} accent title="Add note" onClick={() => onOpen(c.id, 'Notes', true)} />
            <HubMiniIcon icon={<Icon.MessagePlus />} accent title="Add outreach" onClick={() => onOpen(c.id, 'Outreaches', true)} />
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} title={`${c.name} on LinkedIn`}
              style={{ width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
              <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
                <rect width="24" height="24" rx="3" fill="#0A66C2" />
                <path fill="#fff" d="M7.6 9.7H4.9V19h2.7V9.7Zm.2-2.8a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0ZM19 19h-2.7v-4.6c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.4-.1.7V19H10.7s.03-7.6 0-9.3h2.7v1.3a2.7 2.7 0 0 1 2.5-1.4c1.8 0 3.2 1.2 3.2 3.7V19Z" />
              </svg>
            </a>
            <CardMenu c={c} onOpen={onOpen} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-card data-id={c.id} draggable={!isNew}
      onDragStart={(e) => { if (isNew) { e.preventDefault(); return; } e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', c.id); } catch (_) {} onDragStart && onDragStart(c.id); }}
      onDragEnd={() => onDragEnd && onDragEnd()}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: selected ? 'var(--bg-brand-primary)' : '#fff', border: `1px solid ${isNew ? 'var(--color-brand-500)' : (selected ? 'var(--color-brand-500)' : 'var(--border-secondary)')}`, borderRadius: 12, padding: 16, boxShadow: isNew ? 'var(--shadow-md)' : (selected ? 'var(--shadow-sm)' : (h ? 'var(--shadow-md)' : 'var(--shadow-xs)')), transition: 'box-shadow 150ms, background 120ms, border-color 120ms', opacity: dragging ? 0.4 : 1, cursor: isNew ? 'default' : 'grab' }}>

      {/* 1. status banner (conditional) */}
      <CardBanner c={c} onOpen={onOpen} />

      {/* 2 + 3. identity + meta — avatar | stacked (name, role, company | location) | stacked votes + kebab */}
      <div style={{ display: 'flex', gap: 12 }}>
        <SelectableAvatar c={c} size={40} selected={selected} onToggle={onToggle} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {isNew ? (
              <div style={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
                <window.PersonNameField
                  value={c.name || ''}
                  onChange={(v) => onCandName && onCandName(c.id, v)}
                  onCommit={() => onCandNameCommit && onCandNameCommit(c.id)}
                  onSelectExisting={(match) => onSeedFromMatch && onSeedFromMatch(c.id, match)}
                  autoFocus placeholder="Candidate name"
                  label={null} required={false} size="sm" hint={null} />
              </div>
            ) : (
              <React.Fragment>
                <span onClick={(e) => { e.stopPropagation(); onOpen(c.id); }} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={16}>{c.name}</HubLink></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, overflow: 'hidden', maxWidth: h ? 44 : 0, opacity: h ? 1 : 0, transition: 'max-width 200ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease-out' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} title={`${c.name} on LinkedIn`} style={{ display: 'inline-flex' }}><svg width={15} height={15} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}><rect width="24" height="24" rx="3" fill="#0A66C2" /><path fill="#fff" d="M7.6 9.7H4.9V19h2.7V9.7Zm.2-2.8a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0ZM19 19h-2.7v-4.6c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.4-.1.7V19H10.7s.03-7.6 0-9.3h2.7v1.3a2.7 2.7 0 0 1 2.5-1.4c1.8 0 3.2 1.2 3.2 3.7V19Z" /></svg></a>
                  <span role="button" title="Open profile" onClick={(e) => { e.stopPropagation(); onOpen(c.id); }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-600)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-quaternary)'} style={{ display: 'inline-flex', color: 'var(--fg-quaternary)', cursor: 'pointer' }}><Icon.Link width={15} height={15} /></span>
                </span>
                {c.eye && <span role="button" tabIndex={0} title="Hidden from hiring manager · Click to unhide" onClick={(e) => { e.stopPropagation(); onUnhide && onUnhide(c.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUnhide && onUnhide(c.id); } }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-600)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-quaternary)'} style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0, cursor: 'pointer' }}><Icon.EyeOff width={14} height={14} /></span>}
              </React.Fragment>
            )}
          </div>
          {noData ? (
            <div style={{ marginTop: 2, fontSize: 13, color: 'var(--fg-quaternary)' }}>No data yet</div>
          ) : (
            <React.Fragment>
              {c.title && <div style={{ marginTop: 2, fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>}
              {(c.company || loc) && <div style={{ marginTop: 2, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.company && <HubLink size={14} weight={500}>{c.company}</HubLink>}{c.company && loc && <span style={{ color: 'var(--fg-quaternary)', margin: '0 7px' }}>|</span>}{loc && <span style={{ color: 'var(--fg-quaternary)' }}>{loc}</span>}</div>}
            </React.Fragment>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexShrink: 0 }}>
          {!isNew && <Votes c={c} onVote={onVote} />}
          <CardMenu c={c} onOpen={onOpen} />
        </div>
      </div>

      {/* 4. lead signal — hidden until the card has real data */}
      {!noData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: next ? 'var(--bg-brand-primary)' : 'var(--bg-tertiary)', color: next ? 'var(--color-brand-600)' : 'var(--fg-tertiary)' }}><LeadIc width={15} height={15} /></span>
          <span style={{ minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sig.lead.text}</span>
        </div>
      )}

      {/* 6. secondary cadence — demoted */}
      {!noData && sig.cadence.length > 0 && <div style={{ marginTop: 6, paddingLeft: 35, display: 'flex', flexDirection: 'column', gap: 2 }}>{sig.cadence.slice(0, 2).map((t, i) => <span key={i} style={{ fontSize: 13, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>)}</div>}

      {/* 7. tags — max 3 */}
      {!noData && c.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 12 }}>{c.tags.slice(0, 3).map((t, i) => <HubColorTag key={i} label={t.label} color={t.color} />)}{c.tags.length > 3 && <span style={{ fontSize: 13, color: 'var(--fg-quaternary)', fontWeight: 600 }}>+{c.tags.length - 3}</span>}</div>}

      {/* no-data CTA block — three ways to fill the card in */}
      {noData && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NoDataCta icon={<Icon.Upload />} label="Upload resume" onClick={(e) => { e.stopPropagation(); toast('Upload resume', `Choose a resume file for ${c.name || 'this candidate'}.`); }} />
          <NoDataCta icon={<Icon.LinkedIn />} label="Import from LinkedIn" onClick={(e) => { e.stopPropagation(); toast('Import from LinkedIn', `Paste a LinkedIn URL for ${c.name || 'this candidate'}.`); }} />
          <NoDataCta icon={<Icon.UserPlus />} label="Add experience manually" featured onClick={(e) => { e.stopPropagation(); onOpen(c.id, 'Overview'); }} />
        </div>
      )}

      {/* 7. footer — actions (left) · time-in-stage pill + owner (right, name reveals on hover) */}
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px 0 8px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <CandCardActions c={c} onOpen={onOpen} hover={h} />
        <CardFooterOwner c={c} sig={sig} onOwner={onOwner} />
      </div>
    </div>
  );
}

// ---- kanban view ----
// ---- kanban column header — hover reveals a small "+ Add" text button ----
function KanbanColHeader({ stage, count, onCollapse, onAdd }) {
  const [h, setH] = usePR(false);
  const [ah, setAh] = usePR(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px 14px' }}>
      <span style={{ minWidth: 26, height: 24, padding: '0 8px', borderRadius: 7, background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
      <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', whiteSpace: 'nowrap' }}>{stage}</span>
      <button type="button" onClick={onAdd} onMouseEnter={() => setAh(true)} onMouseLeave={() => setAh(false)}
        title={`Add candidate to ${stage}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 6,
          border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          color: 'var(--color-brand-700)', background: ah ? 'var(--color-brand-100)' : 'transparent',
          opacity: h ? 1 : 0, pointerEvents: h ? 'auto' : 'none', transition: 'opacity 150ms ease-out, background 120ms',
        }}>
        <Icon.Plus width={14} height={14} />Add
      </button>
      <button type="button" onClick={onCollapse} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronLeft width={18} height={18} /></button>
    </div>
  );
}

function KanbanView({ byStage, onOpen, selected, onToggle, moveCard, onUnhide, onOwner, onVote, collapsed, setCollapsed, onCandName, onCandNameCommit, onCandNameCancel, onSeedFromMatch, onAddManual, density }) {
  const [dragId, setDragId] = usePR(null);
  const [over, setOver] = usePR(null); // { stage, beforeId }

  const computeBefore = (e) => {
    const cards = [...e.currentTarget.querySelectorAll('[data-card]')].filter(el => el.dataset.id !== dragId);
    const y = e.clientY; let beforeId = null;
    for (const el of cards) { const r = el.getBoundingClientRect(); if (y < r.top + r.height / 2) { beforeId = el.dataset.id; break; } }
    return beforeId;
  };
  const onBodyDragOver = (e, stage) => { if (!dragId) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const beforeId = computeBefore(e); setOver(o => (o && o.stage === stage && o.beforeId === beforeId) ? o : { stage, beforeId }); };
  const onBodyDrop = (e, stage) => { e.preventDefault(); if (dragId) moveCard(dragId, stage, (over && over.stage === stage) ? over.beforeId : null); setDragId(null); setOver(null); };
  const endDrag = () => { setDragId(null); setOver(null); };
  const Line = () => <div style={{ height: 3, borderRadius: 3, background: 'var(--color-brand-500)', margin: '-5px 0', boxShadow: '0 0 0 3px rgba(68,76,231,0.14)' }} />;

  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px 24px 40px', alignItems: 'flex-start', minHeight: '100%' }}>
      {HubData.PROJECT_STAGES.map(stage => {
        const list = byStage[stage] || [];
        const isCol = !!collapsed[stage];
        const isOverCol = !!(over && over.stage === stage);
        const sc = HubData.STAGE_COLORS[stage] || 'var(--bg-tertiary)';
        return (
          <div key={stage} style={{ width: isCol ? 52 : 432, flexShrink: 0, overflow: 'hidden', transition: 'width 260ms cubic-bezier(0.4,0,0.2,1)' }}>
            {isCol ? (
              <div key="c" onClick={() => setCollapsed(s => ({ ...s, [stage]: false }))} style={{ width: 52, background: 'var(--bg-tertiary)', borderRadius: 12, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', animation: 'tt-fade 320ms ease-out' }}>
                <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronRight width={18} height={18} /></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>{stage} ({list.length})</span>
              </div>
            ) : (
              <div key="e" style={{ width: 432, animation: 'tt-fade 320ms ease-out' }}>
                <KanbanColHeader stage={stage} count={list.length}
                  onCollapse={() => setCollapsed(s => ({ ...s, [stage]: true }))}
                  onAdd={() => onAddManual && onAddManual(stage)} />
                <div
                  onDragOver={(e) => onBodyDragOver(e, stage)}
                  onDrop={(e) => onBodyDrop(e, stage)}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(o => (o && o.stage === stage) ? null : o); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 60, padding: 4, margin: -4, borderRadius: 12, background: isOverCol ? 'var(--bg-brand-primary)' : 'transparent', outline: isOverCol ? '2px dashed var(--color-brand-300)' : '2px dashed transparent', outlineOffset: -2, transition: 'background 120ms ease-out, outline-color 120ms ease-out' }}>
                  {list.map(c => (
                    <React.Fragment key={c.id}>
                      {isOverCol && over.beforeId === c.id && dragId !== c.id && <Line />}
                      <KanbanCard c={c} onOpen={onOpen} selected={selected.has(c.id)} onToggle={onToggle} onDragStart={setDragId} onDragEnd={endDrag} dragging={dragId === c.id} onUnhide={onUnhide} onOwner={onOwner} onVote={onVote} onCandName={onCandName} onCandNameCommit={onCandNameCommit} onCandNameCancel={onCandNameCancel} onSeedFromMatch={onSeedFromMatch} density={density} />
                    </React.Fragment>
                  ))}
                  {isOverCol && over.beforeId === null && <Line />}
                  {list.length === 0 && !isOverCol && <div style={{ height: 50, borderRadius: 10, border: '1.5px dashed var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--fg-quaternary)' }}>No candidates</div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Create Project modal — required fields grouped; sharing optional
// ============================================================
const NEW_PROJECT_KEY = 'thrive-new-project';

// Small labeled text field. `float` puts the label above the empty input like the
// production screenshot; on focus / with a value the label lifts and stays.
function CPField({ label, required, value, onChange, placeholder, autoFocus, hint, invalid }) {
  const [f, setF] = usePR(false);
  const filled = !!(value && value.length);
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: invalid ? 'var(--color-error-700)' : (f ? 'var(--color-brand-700)' : 'var(--fg-quaternary)'), marginBottom: 4 }}>
        {label}{required && <span style={{ color: 'var(--color-error-600)', marginLeft: 2 }}>*</span>}
      </div>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff',
          border: `1px solid ${invalid ? 'var(--color-error-500)' : (f ? 'var(--border-brand)' : 'var(--border-primary)')}`,
          borderRadius: 8, outline: 'none', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
      {hint && <div style={{ marginTop: 4, fontSize: 12, color: invalid ? 'var(--color-error-700)' : 'var(--fg-quaternary)' }}>{hint}</div>}
    </label>
  );
}

function CPToggleRow({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <button type="button" role="switch" aria-checked={checked} onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        style={{ width: 40, height: 22, borderRadius: 9999, background: checked ? 'var(--color-brand-600)' : 'var(--color-gray-200)', position: 'relative', border: 0, cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'background 140ms' }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 140ms' }} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)' }}>{label}</span>
    </label>
  );
}

function CPSection({ title, subtitle, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</div>
      {subtitle && <div style={{ marginTop: 3, fontSize: 13, color: 'var(--fg-quaternary)' }}>{subtitle}</div>}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [title, setTitle] = usePR('');
  const [company, setCompany] = usePR('');
  const [lead, setLead] = usePR('');
  const [location, setLocation] = usePR('');
  const [confidential, setConfidential] = usePR(false);
  const [showSharing, setShowSharing] = usePR(false);
  const [teamMembers, setTeamMembers] = usePR('');
  const [additionalUsers, setAdditionalUsers] = usePR('');
  const [generalAccess, setGeneralAccess] = usePR('Viewer');
  const [tried, setTried] = usePR(false);

  const missingTitle = !title.trim();
  const missingCompany = !company.trim();
  const missingLead = !lead.trim();
  const canSubmit = !missingTitle && !missingCompany && !missingLead;

  const submit = () => {
    setTried(true);
    if (!canSubmit) return;
    onCreate({
      title: title.trim(), company: company.trim(), lead: lead.trim(),
      location: location.trim(), confidential,
      teamMembers: teamMembers.trim(), additionalUsers: additionalUsers.trim(), generalAccess,
    });
  };
  const onKey = (e) => { if (e.key === 'Escape') onClose(); };

  return (
    <div onMouseDown={onClose} onKeyDown={onKey}
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(10,13,18,0.24)', display: 'flex', justifyContent: 'flex-end', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()}
        style={{ height: '100vh', width: 'min(560px, 96vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Create Project</div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.X width={20} height={20} />
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 24px' }}>
          {/* Required — all together */}
          <CPSection title="Details" subtitle="Required to create the project.">
            <CPField label="Title" required autoFocus value={title} onChange={setTitle} placeholder="e.g. VP of Engineering"
              invalid={tried && missingTitle} hint={tried && missingTitle ? 'Title is required.' : null} />
            <CPField label="Hiring company" required value={company} onChange={setCompany} placeholder="Company name"
              invalid={tried && missingCompany} hint={tried && missingCompany ? 'Hiring company is required.' : null} />
            <CPField label="Team lead" required value={lead} onChange={setLead} placeholder="Search or enter a name"
              invalid={tried && missingLead}
              hint={tried && missingLead
                ? 'Team lead is required.'
                : 'The team lead will be the main point of contact for the project and will always have editor access.'} />
            <CPField label="Location" value={location} onChange={setLocation} placeholder="City, region, country" />
            <div style={{ marginTop: 2 }}><CPToggleRow checked={confidential} onChange={setConfidential} label="This project is confidential" /></div>
          </CPSection>

          {/* Optional — collapsed by default */}
          <div style={{ marginTop: 26 }}>
            <button type="button" onClick={() => setShowSharing(s => !s)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', border: 0, background: 'transparent', cursor: 'pointer', padding: '10px 0', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
              <span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>Sharing & Access</span>
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Optional</span>
                <div style={{ marginTop: 2, fontSize: 13, color: 'var(--fg-quaternary)' }}>Choose users to share this project with. You can also update this later.</div>
              </span>
              <Icon.ChevronDown width={18} height={18} style={{ color: 'var(--fg-quaternary)', flexShrink: 0, transition: 'transform 150ms', transform: showSharing ? 'rotate(180deg)' : 'none' }} />
            </button>
            {showSharing && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <CPField label="Internal team member(s)" value={teamMembers} onChange={setTeamMembers} placeholder="Add teammates"
                  hint="Project team members will always have editor access." />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 4 }}>Additional users with access</div>
                  <CPField label="Add people" value={additionalUsers} onChange={setAdditionalUsers} placeholder="Add people outside the team" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)' }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', border: '1px solid var(--border-secondary)', color: 'var(--fg-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Lock width={16} height={16} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>Internal</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>Only internal users</div>
                  </div>
                  <select value={generalAccess} onChange={(e) => setGeneralAccess(e.target.value)}
                    style={{ height: 34, padding: '0 10px', border: '1px solid var(--border-primary)', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)', cursor: 'pointer' }}>
                    <option>Viewer</option><option>Editor</option><option>Admin</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--border-secondary)', background: '#fff', flexShrink: 0 }}>
          <button type="button" onClick={onClose}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit}
            style={{ height: 38, padding: '0 18px', borderRadius: 8, border: 0, background: canSubmit ? 'var(--bg-brand-solid)' : 'var(--color-gray-200)', color: canSubmit ? 'var(--fg-on-brand)' : 'var(--fg-quaternary)', fontSize: 14, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'default', fontFamily: 'var(--font-body)', boxShadow: canSubmit ? 'var(--shadow-skeu)' : 'none' }}>
            Create project
          </button>
        </div>
      </aside>
    </div>
  );
}

// ---- Project details drawer ----
// [spine] role: shell · name: panelDrawer · surface: panel
// Right-side record drawer for a project (scrim + sliding aside). Variance: medium.
// No separate panelHeader row here (no record prev/next nav) — identity + close live in the recordBanner.
function ProjectDrawer({ onClose }) {
  const { HubLink } = HubUI;
  const [tab, setTab] = usePR('Overview');
  const p = HubData.PROJECT; const o = p.overview;
  const Row = ({ label, children }) => (
    <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
      <div style={{ width: 150, flexShrink: 0, fontSize: 14, color: 'var(--fg-quaternary)' }}>{label}</div>
      <div style={{ flex: 1, fontSize: 15, color: 'var(--fg-secondary)' }}>{children}</div>
    </div>
  );
  return (
    <div data-spine-role="shell" data-spine-name="panelDrawer" data-spine-surface="panel" onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(10,13,18,0.18)', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100vh', width: 'min(680px, 94vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        {/* [spine] role: banner · name: recordBanner · surface: panel — project identity + close */}
        <div data-spine-role="banner" data-spine-name="recordBanner" data-spine-surface="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProjLogo size={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>{p.name}</span>{p.confidential && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 9999, padding: '1px 9px' }}>Confidential</span>}</div>
              <div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}><HubLink size={14} weight={500}>{p.company}</HubLink> · {p.location}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.X width={20} height={20} /></button>
        </div>
        {/* [spine] role: nav · name: tabsBar · surface: panel — project section tabs */}
        <div data-spine-role="nav" data-spine-name="tabsBar" data-spine-surface="panel" style={{ display: 'flex', gap: 24, overflowX: 'auto', borderBottom: '1px solid var(--border-secondary)', padding: '16px 24px 0', flexShrink: 0 }} className="cp-tabs">
          {HubData.PROJECT_TABS.map(t => {
            const on = t === tab;
            return <button key={t} type="button" onClick={() => setTab(t)} style={{ position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: 15, whiteSpace: 'nowrap', fontWeight: on ? 600 : 500, color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)' }}>{t}{on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: '2px 2px 0 0', background: 'var(--color-brand-600)' }} />}</button>;
          })}
        </div>
        {/* [spine] role: body · name: panelContent · surface: panel — active tab body. Footer intentionally absent. */}
        <div data-spine-role="body" data-spine-name="panelContent" data-spine-surface="panel" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
          {tab === 'Overview' ? (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Overview</h3>
              <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '23px', color: 'var(--fg-secondary)' }}>{o.description}</p>
              <Row label="Search lead">{o.lead}</Row>
              <Row label="Priority"><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-error-700)', background: 'var(--bg-error-primary)', borderRadius: 9999, padding: '3px 12px' }}>{o.priority}</span></Row>
              <Row label="Status"><HubUI.HubStatus status={p.overview.stageName} /></Row>
              <Row label="Open date">{o.openDate}</Row>
              <Row label="Target close">{o.targetClose}</Row>
              <Row label="Candidates">{o.candidates}</Row>
              <Row label="Location">{p.location}</Row>
            </div>
          ) : tab === 'Strategy' ? (
            <StrategyTab />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon.FileText width={26} height={26} /></div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>{tab}</div>
              <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', maxWidth: 300 }}>This tab is part of the project workspace and is ready to be built out next.</div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ---- Checkbox + toggle primitives for the report modals ----
function RptCheck({ checked, onChange, disabled }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!checked); }}
      style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, cursor: disabled ? 'default' : 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: checked ? '0' : '1.5px solid var(--border-primary)', background: checked ? 'var(--color-brand-600)' : '#fff', opacity: disabled ? 0.45 : 1, transition: 'background 120ms, border-color 120ms' }}>
      {checked && <Icon.Check width={14} height={14} style={{ color: '#fff', strokeWidth: 3 }} />}
    </button>
  );
}
function RptToggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
      <span style={{ width: 40, height: 22, borderRadius: 9999, background: checked ? 'var(--color-brand-600)' : 'var(--color-gray-200)', position: 'relative', transition: 'background 140ms', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 140ms' }} />
      </span>
      {label && <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-secondary)' }}>{label}</span>}
    </button>
  );
}

// ---- Custom select for report panels ----
function RptSelect({ value, options, onChange }) {
  const [open, setOpen] = usePR(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-primary)', background: '#fff', border: `1px solid ${open ? 'var(--color-brand-500)' : 'var(--border-primary)'}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left', boxShadow: open ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'border-color 120ms, box-shadow 120ms' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <Icon.ChevronDown width={18} height={18} style={{ color: 'var(--fg-quaternary)', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'tt-pop 120ms ease-out' }}>
          {options.map(o => {
            const active = o === value;
            return (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                style={{ display: 'block', width: '100%', padding: '10px 12px', border: 0, borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: active ? 600 : 500, color: active ? 'var(--color-brand-600)' : 'var(--fg-secondary)', background: active ? 'var(--color-brand-50)' : 'transparent', textAlign: 'left' }}>
                {o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- shared report-panel header stat ----
function rptStat(label, value) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--color-brand-700)', opacity: 0.75 }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: 'var(--fg-primary)' }}>{value}</span>
    </div>
  );
}
function RptPanelHeader({ p, daysOpen, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px', background: 'var(--color-brand-50)', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
      <ProjLogo size={44} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>{p.name}</span>
          {p.confidential && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 9999, padding: '1px 8px' }}>Confidential</span>}
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 12 }}>
          {rptStat('Candidates', p.overview.candidates)}
          {rptStat('Hiring company', p.company)}
          {rptStat('Days open', daysOpen ? `${daysOpen} days` : p.status)}
        </div>
      </div>
      <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start' }}><Icon.X width={20} height={20} /></button>
    </div>
  );
}

// ---- Generate Project Summary Report modal ----
function GenerateReportModal({ onClose }) {
  const p = HubData.PROJECT;
  const stages = HubData.PROJECT_STAGES;
  const daysOpen = (p.status.match(/(\d+)\s*day/) || [])[1] || null;
  const NOTE_STAGES = ['Recruiter Interview', 'Hiring Team Interview', 'Offer'];

  const [overviewTable, setOverviewTable] = usePR(true);
  const [candInfo, setCandInfo] = usePR(true);
  const [showHidden, setShowHidden] = usePR(false);
  const [candFields, setCandFields] = usePR({ Avatar: true, Location: true, 'LinkedIn URL': true, Email: true, Phone: true, 'Resume/CV': true });
  const [scorecards, setScorecards] = usePR(true);
  const [scFields, setScFields] = usePR({ 'Interview Scorecard Criteria': true, 'True Search Scorecards': true, 'Hiring Team Scorecards': true });
  const [rows, setRows] = usePR(() => {
    const o = {}; stages.forEach(s => { o[s] = { overview: s !== 'Rejected', notes: NOTE_STAGES.includes(s), profiles: NOTE_STAGES.includes(s) }; }); return o;
  });

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const setRow = (stage, key, val) => setRows(r => ({ ...r, [stage]: { ...r[stage], [key]: val } }));
  const anyStage = stages.some(s => rows[s].overview || rows[s].notes || rows[s].profiles);
  const generate = () => { HubUI.showHubReportToast(`${reportSlug(p.name)}_Summary_-_${reportDate()}`); onClose(); };

  const gridField = (map, setMap) => (label) => (
    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: 'var(--fg-secondary)' }}>
      <RptCheck checked={map[label]} onChange={(v) => setMap(m => ({ ...m, [label]: v }))} />{label}
    </label>
  );
  const ColHead = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--fg-secondary)' }}>{children}<Icon.Info width={15} height={15} style={{ color: 'var(--fg-quaternary)' }} /></div>
  );

  return ReactDOM.createPortal(
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,13,18,0.18)', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100vh', width: 'min(680px, 94vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <RptPanelHeader p={p} daysOpen={daysOpen} onClose={onClose} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>Generate Project Summary Report</h2>
          <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--fg-quaternary)' }}>Customize what's included in your project summary.</p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <RptCheck checked={overviewTable} onChange={setOverviewTable} />
            <span>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Project Overview Table</span>
              <span style={{ display: 'block', fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>Stage summary with candidate counts and pass-through rates.</span>
            </span>
          </label>
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '18px 0' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <RptCheck checked={candInfo} onChange={setCandInfo} />
              <span>
                <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Candidate Information</span>
                <span style={{ display: 'block', fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>Data points shown on each candidate's profile page.</span>
              </span>
            </label>
            <RptToggle checked={showHidden} onChange={setShowHidden} label="Show hidden Candidates" />
          </div>
          {candInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 24px', margin: '16px 0 0', paddingLeft: 32 }}>
              {['Avatar', 'Location', 'LinkedIn URL', 'Email', 'Phone', 'Resume/CV'].map(gridField(candFields, setCandFields))}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '18px 0' }} />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <RptCheck checked={scorecards} onChange={setScorecards} />
            <span>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Scorecards</span>
              <span style={{ display: 'block', fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>Interviewer assessments and scorecard criteria.</span>
            </span>
          </label>
          {scorecards && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 24px', margin: '16px 0 0', paddingLeft: 32 }}>
              {['Interview Scorecard Criteria', 'True Search Scorecards', 'Hiring Team Scorecards'].map(gridField(scFields, setScFields))}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '18px 0' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 600, color: 'var(--fg-primary)' }}>Pipeline Stages</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: '21px', color: 'var(--fg-quaternary)' }}>Choose which stages to include in the report. At least one stage must be selected. Candidates will appear in the Overview Table, with optional Notes and Individual Profile pages depending on your selections.</p>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 130px 150px', alignItems: 'center', padding: '0 4px 10px', borderBottom: '1px solid var(--border-secondary)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-secondary)' }}>Stage</div>
              <ColHead>Overview Table</ColHead>
              <ColHead>Notes</ColHead>
              <ColHead>Individual Profiles</ColHead>
            </div>
            {stages.map(s => (
              <div key={s} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 130px 150px', alignItems: 'center', padding: '13px 4px', borderBottom: '1px solid var(--border-secondary)' }}>
                <div style={{ fontSize: 15, color: 'var(--fg-primary)' }}>{s}</div>
                <div><RptCheck checked={rows[s].overview} onChange={(v) => setRow(s, 'overview', v)} /></div>
                <div><RptCheck checked={rows[s].notes} onChange={(v) => setRow(s, 'notes', v)} /></div>
                <div><RptCheck checked={rows[s].profiles} onChange={(v) => setRow(s, 'profiles', v)} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '16px 28px', borderTop: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', padding: '10px 16px', borderRadius: 8 }}>Cancel</button>
          <button type="button" onClick={generate} disabled={!anyStage} style={{ border: 0, cursor: anyStage ? 'pointer' : 'default', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--color-brand-600)', padding: '10px 20px', borderRadius: 8, boxShadow: 'var(--shadow-xs)', opacity: anyStage ? 1 : 0.5 }}>Generate</button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

// ---- Pre-call Agenda preview (centered modal → Close / Copy / Download) ----
function PreCallAgendaPreview({ selectedStages, onClose, onDownload }) {
  const p = HubData.PROJECT;
  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const byStage = {};
  HubData.CANDIDATES.forEach(c => { if (selectedStages.includes(c.stage)) (byStage[c.stage] = byStage[c.stage] || []).push(c); });
  const shown = selectedStages.filter(s => (byStage[s] || []).length);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const copy = () => {
    const lines = [`${p.name} Update - ${dateLabel}`, ''];
    shown.forEach(s => { lines.push(s); byStage[s].forEach(c => lines.push(`• ${c.name} - ${[c.title, c.company].filter(Boolean).join(', ')}`)); lines.push(''); });
    try { navigator.clipboard.writeText(lines.join('\n')); } catch (e) {}
    HubUI.showHubToast({ title: 'Copied to clipboard', message: 'The pre-call agenda was copied to your clipboard.' });
  };

  return ReactDOM.createPortal(
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 320, background: 'rgba(10,13,18,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'tt-fade 150ms ease-out' }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width: 'min(860px, 96vw)', maxHeight: '90vh', background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'tt-pop 160ms ease-out' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '32px 40px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>{p.name} Update - {dateLabel}</h2>
          {shown.length === 0 ? (
            <p style={{ fontSize: 15, color: 'var(--fg-quaternary)' }}>No candidates in the selected stages.</p>
          ) : shown.map(s => (
            <div key={s} style={{ marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700, color: 'var(--fg-primary)' }}>{s}</h3>
              <ul style={{ margin: 0, padding: '0 0 0 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {byStage[s].map(c => (
                  <li key={c.id} style={{ fontSize: 16, lineHeight: 1.4, color: 'var(--fg-primary)' }}>
                    <HubUI.HubLink size={16} weight={500}>{c.name}</HubUI.HubLink>
                    {(c.title || c.company) && <span> - {[c.title, c.company].filter(Boolean).join(', ')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '16px 28px', borderTop: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', padding: '10px 16px', borderRadius: 8 }}>Close</button>
          <button type="button" onClick={copy} style={{ border: '1px solid var(--border-primary)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)', padding: '10px 18px', borderRadius: 8, boxShadow: 'var(--shadow-xs)' }}>Copy to Clipboard</button>
          <button type="button" onClick={onDownload} style={{ border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--color-brand-600)', padding: '10px 20px', borderRadius: 8, boxShadow: 'var(--shadow-xs)' }}>Download</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---- Generate Pre-call Agenda modal ----
function GeneratePreCallAgendaModal({ onClose }) {
  const p = HubData.PROJECT;
  const stages = HubData.PROJECT_STAGES;
  const daysOpen = (p.status.match(/(\d+)\s*day/) || [])[1] || null;
  const eventTypes = ['Debrief', 'Meeting', 'Recruiter Interview', 'Hiring Team Interview'];
  const [showHidden, setShowHidden] = usePR(false);
  const [stageSel, setStageSel] = usePR(() => { const o = {}; stages.forEach(s => o[s] = s !== 'Research'); return o; });
  const [eventSel, setEventSel] = usePR({ 'Debrief': true, 'Meeting': true, 'Recruiter Interview': true, 'Hiring Team Interview': false });
  const [previewOpen, setPreviewOpen] = usePR(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const anyStage = stages.some(s => stageSel[s]);
  const selectedStages = stages.filter(s => stageSel[s]);
  const download = () => { HubUI.showHubReportToast(`${reportSlug(p.name)}_Pre-call_Agenda_-_${reportDate()}`); setPreviewOpen(false); onClose(); };
  const generate = () => setPreviewOpen(true);

  const SectionIcon = () => (
    <span style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--fg-secondary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg></span>
  );
  const cbGrid = (map, setMap, keys) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', margin: '16px 0 0', paddingLeft: 4 }}>
      {keys.map(k => (
        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: 'var(--fg-secondary)' }}>
          <RptCheck checked={map[k]} onChange={(v) => setMap(m => ({ ...m, [k]: v }))} />{k}
        </label>
      ))}
    </div>
  );

  return ReactDOM.createPortal(
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,13,18,0.18)', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100vh', width: 'min(680px, 94vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <RptPanelHeader p={p} daysOpen={daysOpen} onClose={onClose} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>Generate Pre-call Agenda</h2>
          <p style={{ margin: '0 0 4px', fontSize: 15, lineHeight: '22px', color: 'var(--fg-quaternary)' }}>Select which candidate stages and event types to include. Your agenda will be organized by stage with activity for each candidate.</p>
          <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: '22px', color: 'var(--fg-quaternary)' }}>Any filter or sort active on the project list will be applied to candidates within each stage.</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SectionIcon />
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Project Stages</span>
            </div>
            <RptToggle checked={showHidden} onChange={setShowHidden} label="Show hidden Candidates" />
          </div>
          <p style={{ margin: '6px 0 0', paddingLeft: 30, fontSize: 14, color: 'var(--fg-quaternary)' }}>Choose which stages to include in your agenda.</p>
          {cbGrid(stageSel, setStageSel, stages)}
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '24px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SectionIcon />
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Events</span>
          </div>
          <p style={{ margin: '6px 0 0', paddingLeft: 30, fontSize: 14, color: 'var(--fg-quaternary)' }}>Select which event types to show for each candidate.</p>
          {cbGrid(eventSel, setEventSel, eventTypes)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '16px 28px', borderTop: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', padding: '10px 16px', borderRadius: 8 }}>Cancel</button>
          <button type="button" onClick={generate} disabled={!anyStage} style={{ border: 0, cursor: anyStage ? 'pointer' : 'default', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--color-brand-600)', padding: '10px 20px', borderRadius: 8, boxShadow: 'var(--shadow-xs)', opacity: anyStage ? 1 : 0.5 }}>Generate</button>
        </div>
        {previewOpen && <PreCallAgendaPreview selectedStages={selectedStages} onClose={() => setPreviewOpen(false)} onDownload={download} />}
      </aside>
    </div>,
    document.body
  );
}

// ---- Generate Custom Report modal ----
function GenerateCustomReportModal({ onClose }) {
  const p = HubData.PROJECT;
  const daysOpen = (p.status.match(/(\d+)\s*day/) || [])[1] || null;
  const TYPES = ['Candidate Report To Hiring Manager', 'Weekly Progress Report'];
  const SORTS = ['Name', 'Rank', 'Priority', 'Company'];
  const STAGES = ['Placed', 'Offer', 'Client Interview', 'Recruiter Interview', 'Potential Interest', 'Pursuing', 'Identified', 'Rejected', 'Client Hiring Team', 'New hiring'];

  const [type, setType] = usePR(TYPES[0]);
  const [sortBy, setSortBy] = usePR('Priority');
  const [includeHidden, setIncludeHidden] = usePR(true);
  const [stageSel, setStageSel] = usePR(() => { const o = {}; STAGES.forEach(s => o[s] = true); return o; });

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const anyStage = STAGES.some(s => stageSel[s]);
  const generate = () => { HubUI.showHubReportToast(`${reportSlug(p.name)}_-_${reportDate()}`); onClose(); };
  const fieldLabel = (children) => <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 7 }}>{children}</div>;

  return ReactDOM.createPortal(
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,13,18,0.18)', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100vh', width: 'min(680px, 94vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <RptPanelHeader p={p} daysOpen={daysOpen} onClose={onClose} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>Generate Custom Report</h2>
          <h3 style={{ margin: '0 0 16px', fontSize: 19, fontWeight: 600, color: 'var(--fg-primary)' }}>Report Options</h3>
          <div style={{ maxWidth: 420 }}>
            {fieldLabel(<><span style={{ color: 'var(--fg-error)' }}>*</span> Type</>)}
            <RptSelect value={type} options={TYPES} onChange={setType} />
            <div style={{ height: 18 }} />
            {fieldLabel('Sort By')}
            <RptSelect value={sortBy} options={SORTS} onChange={setSortBy} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: 'var(--fg-secondary)', margin: '18px 0 0' }}>
            <RptCheck checked={includeHidden} onChange={setIncludeHidden} />Include Hidden Candidates
          </label>
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '24px 0' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 600, color: 'var(--fg-primary)' }}>Stages</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--fg-quaternary)' }}>Choose which stages to include in the report.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
            {STAGES.map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 15, color: 'var(--fg-secondary)' }}>
                <RptCheck checked={stageSel[s]} onChange={(v) => setStageSel(m => ({ ...m, [s]: v }))} />{s}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '16px 28px', borderTop: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', padding: '10px 16px', borderRadius: 8 }}>Cancel</button>
          <button type="button" onClick={generate} disabled={!anyStage} style={{ border: 0, cursor: anyStage ? 'pointer' : 'default', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--color-brand-600)', padding: '10px 20px', borderRadius: 8, boxShadow: 'var(--shadow-xs)', opacity: anyStage ? 1 : 0.5 }}>Generate</button>
        </div>
      </aside>
    </div>,
    document.body
  );
}

// ---- Generate menu (outlined button + dropdown) ----
function GenerateReportsMenu() {
  const [open, setOpen] = usePR(false);
  const [reportOpen, setReportOpen] = usePR(false);
  const [agendaOpen, setAgendaOpen] = usePR(false);
  const [customOpen, setCustomOpen] = usePR(false);
  const ref = React.useRef(null);
  useMenuDismiss(open, setOpen, ref);
  const pick = (fn) => { setOpen(false); fn(); };
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <OutlinedBtn icon={<Icon.FileText />} label="Generate" chevron chevronOpen={open} active={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <HdrMenu width={288}>
          <HdrMenuLabel>Generate</HdrMenuLabel>
          <HdrMenuItem featured icon={<Icon.ClipboardCheck />} title="Pre-call agenda" desc="Prep talking points for your next client call" onClick={() => pick(() => setAgendaOpen(true))} />
          <HdrMenuDivider />
          <HdrMenuItem icon={<Icon.FileDown />} title="Project report" onClick={() => pick(() => setReportOpen(true))} />
          <HdrMenuItem icon={<Icon.Sparkles />} title="Custom report" onClick={() => pick(() => setCustomOpen(true))} />
        </HdrMenu>
      )}
      {reportOpen && <GenerateReportModal onClose={() => setReportOpen(false)} />}
      {agendaOpen && <GeneratePreCallAgendaModal onClose={() => setAgendaOpen(false)} />}
      {customOpen && <GenerateCustomReportModal onClose={() => setCustomOpen(false)} />}
    </div>
  );
}

// ---- Project page ----
const mergeTags = (existing, add) => { const out = [...existing]; add.forEach(t => { if (!out.some(x => x.label === t.label)) out.push(t); }); return out; };

// ---- Project actions menu ("More" ⋮ dropdown) ----
function ProjectActionsMenu({ onManageStages }) {
  const [open, setOpen] = usePR(false);
  const [h, setH] = usePR(false);
  const ref = React.useRef(null);
  useMenuDismiss(open, setOpen, ref);
  const run = (title, message) => { setOpen(false); HubUI.showHubToast({ title, message }); };
  const downloadCsv = () => { setOpen(false); HubUI.showHubReportToast(`${reportSlug(HubData.PROJECT.name)}_Candidates_-_${reportDate()}`, 'CSV'); };
  const manageStages = () => { setOpen(false); onManageStages && onManageStages(); };
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" title="More" aria-label="More" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: HDR_H, height: HDR_H, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: (open || h) ? 'var(--bg-primary-hover)' : 'transparent', border: 0, color: 'var(--fg-tertiary)', transition: 'background 120ms ease-out', flexShrink: 0 }}>
        <Icon.DotsVertical width={20} height={20} />
      </button>
      {open && (
        <HdrMenu width={296}>
          <HdrMenuItem icon={<Icon.Trending />} title="Update project status" onClick={() => run('Update status', 'Change the status of this project.')} />
          <HdrMenuItem icon={<Icon.Sliders />} title="Manage pipeline stages" desc="Add stages and set their archetype." onClick={manageStages} />
          <HdrMenuItem icon={<Icon.Briefcase />} title="Add to another project's strategy" onClick={() => run('Added to strategy', 'Added to another project’s strategy.')} />
          <HdrMenuItem icon={<Icon.AddList />} title="Add to list" onClick={() => run('Added to list', 'This project was added to a list.')} />
          <HdrMenuItem icon={<Icon.Link />} title="Share" onClick={() => run('Share link copied', 'A link to this project was copied to your clipboard.')} />
          <HdrMenuDivider />
          <HdrMenuItem icon={<Icon.Eye />} title="View as hiring manager" onClick={() => run('Hiring manager view', 'Previewing this project as the hiring manager sees it.')} />
          <HdrMenuItem icon={<Icon.Download />} title="Download candidate CSV" onClick={downloadCsv} />
          <HdrMenuDivider />
          <HdrMenuItem danger icon={<Icon.Trash />} title="Delete project" onClick={() => run('Delete project', 'This would permanently delete the project and its pipeline.')} />
        </HdrMenu>
      )}
    </div>
  );
}

// ============================================================
// Manage Stages modal — add/edit stages + override the archetype
// ============================================================
const STAGES_KEY = 'thrive-proj-stage-defs';
const ARCH_LABEL = {
  sourcing:   { label: 'Sourcing',   desc: 'Qualifying whether a candidate fits.',       tone: 'default' },
  outreach:   { label: 'Outreach',   desc: 'Making and tracking contact.',                tone: 'brand'   },
  evaluation: { label: 'Evaluation', desc: 'Interviewing and assessing.',                 tone: 'warning' },
  close:      { label: 'Close',      desc: 'Offer and hire.',                              tone: 'success' },
  terminal:   { label: 'Terminal',   desc: 'Closed for this search (no active workflow).', tone: 'error'   },
};
const ARCH_TONE_COLORS = {
  default: { fg: 'var(--fg-secondary)',      bg: 'var(--bg-tertiary)',       bd: 'var(--border-secondary)' },
  brand:   { fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)',  bd: 'var(--color-brand-200)' },
  warning: { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)', bd: 'var(--color-warning-300)' },
  success: { fg: 'var(--color-success-700)', bg: 'var(--color-success-50)', bd: 'var(--color-success-300)' },
  error:   { fg: 'var(--color-error-700)',   bg: 'var(--bg-error-primary)',  bd: 'var(--color-error-200, #FECDCA)' },
};

function ArchetypePill({ archetype }) {
  const meta = archetype ? ARCH_LABEL[archetype] : null;
  const tc = ARCH_TONE_COLORS[meta ? meta.tone : 'default'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 9999, fontSize: 11.5, fontWeight: 600, color: tc.fg, background: tc.bg, border: `1px solid ${tc.bd}`, whiteSpace: 'nowrap' }}>
      {meta ? meta.label : 'No archetype'}
    </span>
  );
}

function ArchetypeSelect({ value, onChange }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}
      style={{ height: 30, padding: '0 8px', border: '1px solid var(--border-primary)', borderRadius: 6, background: '#fff', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
      <option value="">— none —</option>
      {HubData.STAGE_ARCHETYPES.map(a => <option key={a} value={a}>{ARCH_LABEL[a].label}</option>)}
    </select>
  );
}

function ManageStagesModal({ onClose, onChange }) {
  const [defs, setDefs] = usePR(() => HubData.PROJECT_STAGE_DEFS.map(d => ({ ...d })));
  const [addOpen, setAddOpen] = usePR(false);
  const [newName, setNewName] = usePR('');
  const [newPos, setNewPos] = usePR(defs.length); // default: end
  const [newArch, setNewArch] = usePR(HubData.inferArchetypeForCustomStage({ position: defs.length, defs }));

  // Keep the inferred archetype in sync as the user changes the position (unless they've
  // already picked one manually — we detect this by comparing to the previous inferred value).
  const inferredForPos = React.useMemo(() => HubData.inferArchetypeForCustomStage({ position: newPos, defs }), [newPos, defs]);
  const [manualArch, setManualArch] = usePR(false);
  React.useEffect(() => { if (!manualArch) setNewArch(inferredForPos); }, [inferredForPos, manualArch]);

  const apply = (nextDefs) => {
    setDefs(nextDefs);
    HubData.replaceStageDefs(nextDefs);
    try { localStorage.setItem(STAGES_KEY, JSON.stringify(nextDefs)); } catch (_) {}
    onChange && onChange(nextDefs);
  };
  const updateArchetype = (i, archetype) => {
    const next = defs.map((d, idx) => idx === i ? { ...d, archetype } : d);
    apply(next);
  };
  const removeStage = (i) => {
    const next = defs.filter((_, idx) => idx !== i);
    apply(next);
  };
  const addStage = () => {
    if (!newName.trim()) return;
    const stage = { name: newName.trim(), archetype: newArch || null };
    const next = [...defs.slice(0, newPos), stage, ...defs.slice(newPos)];
    apply(next);
    setNewName(''); setAddOpen(false); setManualArch(false);
    setNewPos(next.length);
  };

  return (
    <div onMouseDown={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(10,13,18,0.24)', display: 'flex', justifyContent: 'flex-end', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()}
        style={{ height: '100vh', width: 'min(620px, 96vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Manage pipeline stages</div>
            <div style={{ marginTop: 2, fontSize: 13, color: 'var(--fg-quaternary)' }}>Each stage's archetype drives the candidate side-panel context strip and tab order.</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.X width={20} height={20} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', marginBottom: 8 }}>Pipeline order</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {defs.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border-secondary)', borderRadius: 10, background: '#fff' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-quaternary)', marginTop: 1 }}>{d.archetype ? ARCH_LABEL[d.archetype].desc : 'No archetype — default panel behavior.'}</div>
                </div>
                <ArchetypePill archetype={d.archetype} />
                <ArchetypeSelect value={d.archetype} onChange={(a) => updateArchetype(i, a)} />
                <button type="button" onClick={() => removeStage(i)} title="Remove stage"
                  style={{ width: 28, height: 28, borderRadius: 6, border: 0, background: 'transparent', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Trash width={15} height={15} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            {addOpen ? (
              <div style={{ border: '1px solid var(--color-brand-300)', background: 'var(--bg-brand-primary)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 10 }}>Add stage</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'block' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 4 }}>Stage name<span style={{ color: 'var(--color-error-600)', marginLeft: 2 }}>*</span></div>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus placeholder="e.g. Reference Check"
                      style={{ width: '100%', boxSizing: 'border-box', height: 36, padding: '0 10px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 8, outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 4 }}>Position</div>
                      <select value={newPos} onChange={(e) => setNewPos(parseInt(e.target.value, 10))}
                        style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border-primary)', borderRadius: 8, background: '#fff', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', cursor: 'pointer' }}>
                        {defs.map((d, i) => <option key={i} value={i}>Before &quot;{d.name}&quot; (#{i + 1})</option>)}
                        <option value={defs.length}>At the end (#{defs.length + 1})</option>
                      </select>
                    </label>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 4 }}>
                        Archetype {!manualArch && <span style={{ color: 'var(--fg-quaternary)', fontWeight: 400 }}>(auto)</span>}
                      </div>
                      <select value={newArch || ''} onChange={(e) => { setManualArch(true); setNewArch(e.target.value || null); }}
                        style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--border-primary)', borderRadius: 8, background: '#fff', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', cursor: 'pointer' }}>
                        <option value="">— none —</option>
                        {HubData.STAGE_ARCHETYPES.map(a => <option key={a} value={a}>{ARCH_LABEL[a].label}</option>)}
                      </select>
                    </label>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>{newArch ? ARCH_LABEL[newArch].desc : 'No archetype — panel will use the default order with no context strip.'}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => { setAddOpen(false); setManualArch(false); setNewName(''); }}
                      style={{ height: 34, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                    <button type="button" onClick={addStage} disabled={!newName.trim()}
                      style={{ height: 34, padding: '0 14px', borderRadius: 7, border: 0, background: newName.trim() ? 'var(--bg-brand-solid)' : 'var(--color-gray-200)', color: newName.trim() ? 'var(--fg-on-brand)' : 'var(--fg-quaternary)', fontSize: 13, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default', fontFamily: 'var(--font-body)', boxShadow: newName.trim() ? 'var(--shadow-skeu)' : 'none' }}>Add stage</button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setAddOpen(true); setNewPos(defs.length); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: '1px dashed var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                <Icon.Plus width={15} height={15} />Add stage
              </button>
            )}
          </div>

          <div style={{ marginTop: 22, padding: '12px 14px', border: '1px solid var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 4 }}>How archetypes drive the candidate panel</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', lineHeight: '17px' }}>
              Every stage maps to one archetype (or none). The candidate side panel adds a subtle context strip and promotes 2–3 tabs to the front for that archetype — no tabs are hidden or removed. Stages without an archetype fall back to the default panel.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--border-secondary)', background: '#fff', flexShrink: 0 }}>
          <button type="button" onClick={onClose}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// Project Details view — Tailwind-invoice-inspired 2-column layout.
// Renders an onboarding checklist + meta rows when the project is empty; a lightweight
// summary when it has data. The sidebar mirrors the invoice screenshot: status card
// (Amount → Status) + party card (People → Team) + activity feed.
// ============================================================
function DetailsChecklistItem({ done, title, desc, cta, onClick }) {
  const [h, setH] = usePR(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', gap: 12, padding: '14px 14px', borderRadius: 10, background: h ? 'var(--bg-primary-hover)' : 'transparent', border: '1px solid var(--border-secondary)', transition: 'background 120ms' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--color-brand-600)' : '#fff', border: done ? '0' : '1.5px solid var(--border-primary)', color: '#fff', marginTop: 1 }}>
        {done && <Icon.Check width={13} height={13} style={{ strokeWidth: 3 }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg-primary)', textDecoration: done ? 'line-through' : 'none' }}>{title}</div>
        {desc && <div style={{ marginTop: 2, fontSize: 13, color: 'var(--fg-quaternary)' }}>{desc}</div>}
      </div>
      {cta && !done && (
        <button type="button" onClick={onClick}
          style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          {cta}
        </button>
      )}
    </div>
  );
}

function DetailsMetaRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
      <div style={{ width: 160, flexShrink: 0, fontSize: 13.5, color: 'var(--fg-quaternary)' }}>{label}</div>
      <div style={{ flex: 1, fontSize: 14, color: 'var(--fg-secondary)' }}>{children}</div>
    </div>
  );
}

function ProjectDetailsView({ p, candCount, onSwitchToKanban, onOpenStrategy, onAddCandidates }) {
  const [checkedMap, setCheckedMap] = usePR({});
  const check = (k) => setCheckedMap(m => ({ ...m, [k]: !m[k] }));
  const empty = candCount === 0;
  const items = [
    { k: 'strategy', title: 'Add the strategy', desc: 'Capture the role thesis, ICP and calibration notes so the team stays aligned.', cta: 'Add', onClick: onOpenStrategy },
    { k: 'candidates', title: 'Add candidates', desc: 'Source from a past project, upload a resume, import from LinkedIn or add one manually.', cta: 'Add', onClick: onAddCandidates },
    { k: 'scorecard', title: 'Add a scorecard', desc: 'Define what a great candidate looks like before you interview.', cta: 'Set up' },
    { k: 'target', title: 'Set a target close date', desc: 'Give the search a finish line the whole team can rally around.', cta: 'Set date' },
    { k: 'share', title: 'Invite the hiring team', desc: 'Bring the internal client into the workspace so feedback lives in one place.', cta: 'Invite' },
  ];

  return (
    <div style={{ padding: '24px 40px 64px', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'flex-start' }}>
        {/* ---- left main ---- */}
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, boxShadow: 'var(--shadow-xs)', padding: '28px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>{empty ? 'Get the project set up' : 'Project overview'}</h3>
            <button type="button" onClick={onSwitchToKanban}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Open kanban <Icon.ChevronRight width={14} height={14} />
            </button>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--fg-quaternary)', lineHeight: '20px' }}>
            {empty
              ? "Work through the checklist below to give the project the context it needs — you can jump between this view and the kanban at any time."
              : p.overview.description}
          </p>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(it => (
              <div key={it.k} onClick={(e) => { if (e.target.tagName !== 'BUTTON') check(it.k); }} style={{ cursor: 'pointer' }}>
                <DetailsChecklistItem done={!!checkedMap[it.k]} title={it.title} desc={it.desc} cta={it.cta} onClick={(e) => { e && e.stopPropagation(); it.onClick && it.onClick(); }} />
              </div>
            ))}
          </div>

          {/* Meta rows — the "invoice line items" analogue */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', marginBottom: 6 }}>Project details</div>
            <DetailsMetaRow label="Hiring company">{p.company}</DetailsMetaRow>
            <DetailsMetaRow label="Location">{p.location}</DetailsMetaRow>
            <DetailsMetaRow label="Confidential">{p.confidential ? 'Yes' : 'No'}</DetailsMetaRow>
            <DetailsMetaRow label="Open date">{p.overview.openDate}</DetailsMetaRow>
            <DetailsMetaRow label="Target close">{p.overview.targetClose}</DetailsMetaRow>
            <DetailsMetaRow label="Priority">{p.overview.priority}</DetailsMetaRow>
          </div>
        </div>

        {/* ---- right sidebar ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status card */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Candidates</div>
                <div style={{ marginTop: 2, fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>{candCount}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, fontSize: 12.5, fontWeight: 600, color: 'var(--color-success-700)', background: 'var(--color-success-50)', border: '1px solid var(--color-success-300)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success-500)' }} />{p.overview.stageName || 'Open'}
              </span>
            </div>
            <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px -20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)' }}>
                <Icon.User width={16} height={16} style={{ color: 'var(--fg-quaternary)' }} /> {p.overview.lead}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)' }}>
                <Icon.Calendar width={16} height={16} style={{ color: 'var(--fg-quaternary)' }} /> Target close · {p.overview.targetClose}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-secondary)' }}>
                <Icon.Building width={16} height={16} style={{ color: 'var(--fg-quaternary)' }} /> {p.company}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 12 }}>Latest activity</div>
            {empty ? (
              <React.Fragment>
                <ActivityRow bullet="brand" who={p.overview.lead} what="created the project." when="just now" />
                <div style={{ marginTop: 16, padding: '14px 12px', border: '1px dashed var(--border-primary)', borderRadius: 10, background: 'var(--bg-secondary)', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', width: 34, height: 34, borderRadius: '50%', background: '#fff', border: '1px solid var(--border-secondary)', color: 'var(--fg-quaternary)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon.Sparkles width={17} height={17} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>No activity yet</div>
                  <div style={{ marginTop: 2, fontSize: 12.5, color: 'var(--fg-quaternary)', lineHeight: '17px' }}>Add candidates or the search strategy to start populating the timeline.</div>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <ActivityRow bullet="brand" who={p.overview.lead} what="created the project." when="3d ago" />
                <ActivityRow bullet="dot" who={p.overview.lead} what="added the search strategy." when="2d ago" />
                <ActivityRow bullet="dot" who={p.overview.lead} what={`moved ${candCount} candidate${candCount === 1 ? '' : 's'} through the funnel.`} when="1d ago" />
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ bullet, who, what, when }) {
  const brand = bullet === 'brand';
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
      <span style={{ position: 'relative', width: 14, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: brand ? 'var(--color-brand-600)' : '#fff', border: brand ? '0' : '1.5px solid var(--border-primary)' }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--fg-secondary)' }}><span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{who}</span> {what}</div>
        <div style={{ marginTop: 1, fontSize: 12, color: 'var(--fg-quaternary)' }}>{when}</div>
      </div>
    </div>
  );
}

// ============================================================
// Unified project activity stream — synth data + display
// ============================================================
const PROJ_TEAM = [
  { name: 'Angela Zhou',   initials: 'AZ' },
  { name: 'Marcus Ford',   initials: 'MF' },
  { name: 'Ines Alvarez',  initials: 'IA' },
  { name: 'Devon Choi',    initials: 'DC' },
  { name: 'Priya Rangan',  initials: 'PR' },
];

const ACT_META = {
  'added':        { icon: 'UserPlus',    tone: 'brand',   verb: 'added',            noun: '' },
  'outreach':     { icon: 'MessagePlus', tone: 'default', verb: 'sent outreach to', noun: '' },
  'stage-change': { icon: 'Trending',    tone: 'default', verb: 'moved',            noun: '' },
  'scorecard':    { icon: 'Star',        tone: 'warning', verb: 'left a scorecard on', noun: '' },
  'note':         { icon: 'Note',        tone: 'default', verb: 'added a note on',  noun: '' },
  'interview':    { icon: 'Video',       tone: 'brand',   verb: 'scheduled an interview with', noun: '' },
  'rejected':     { icon: 'X',           tone: 'error',   verb: 'rejected',         noun: '' },
  'offer':        { icon: 'Star',        tone: 'success', verb: 'extended an offer to', noun: '' },
};

// Deterministic per-project activity feed derived from HubData.CANDIDATES.
// Uses a per-candidate hash so the "same" project always produces the same story.
function getProjectActivity(cands, limit = 60) {
  const events = [];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const push = (agoDays, type, actor, candidate, detail) => {
    events.push({
      id: `act-${type}-${candidate.id}-${agoDays}`,
      type, actor, candidate, detail,
      ts: now - agoDays * DAY,
      agoDays,
    });
  };
  // Hash for stable, per-candidate variation.
  const H = (s) => { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const actor = (n) => PROJ_TEAM[n % PROJ_TEAM.length];
  const list = cands.filter(c => !c.isNew).slice(0, 24); // cap synth work

  list.forEach((c, i) => {
    const h = H(c.id || c.name || String(i));
    const ownerActor = actor(h);
    const alt = actor(h + 3);
    // Everyone was added at some point
    const addedAgo = 24 + (h % 22);
    push(addedAgo, 'added', ownerActor, c, `${c.title || 'Candidate'} at ${c.company || 'unknown'}`);

    // Recruiter-only path: a note or a reject
    if (c.stage === 'Rejected') {
      push(2 + (h % 10), 'rejected', ownerActor, c, 'Not a fit — declined to move to next round.');
      return;
    }

    // Outreach for Outreach+ stages
    if (['Outreach', 'Recruiter Interview', 'Hiring Team Interview', 'Offer', 'Hired'].includes(c.stage)) {
      const outAgo = 12 + ((h >>> 2) % 10);
      push(outAgo, 'outreach', alt, c, `Sent intro email — "${(c.title || 'this role').split(',')[0]} opportunity at Thrive"`);
      push(outAgo - 3, 'stage-change', ownerActor, c, `Research → Outreach`);
    }
    // Interviews / scorecards
    if (['Recruiter Interview', 'Hiring Team Interview', 'Offer', 'Hired'].includes(c.stage)) {
      const intAgo = 6 + ((h >>> 4) % 6);
      push(intAgo, 'interview', ownerActor, c, `Recruiter screen · 30 min`);
      push(intAgo - 2, 'scorecard', alt, c, `Overall ${(3 + ((h >>> 6) % 3))}/5 — strong on scope, unsure on stage fit.`);
      push(intAgo - 3, 'stage-change', ownerActor, c, `Outreach → ${c.stage}`);
    }
    if (['Offer', 'Hired'].includes(c.stage)) {
      const offAgo = 3 + ((h >>> 5) % 4);
      push(offAgo, 'offer', ownerActor, c, c.comp ? `Base ${c.comp}` : 'Draft — awaiting final approval');
    }
    if (c.stage === 'Hired' && c.startDate) {
      push(1, 'stage-change', ownerActor, c, `Offer → Hired · start ${c.startDate}`);
    }
    // Occasional notes across the sample
    if ((h & 3) === 0) {
      push(2 + ((h >>> 3) % 4), 'note', alt, c, c.note && c.note.text ? c.note.text : 'Great backstory — worth double-clicking on scale.');
    }
  });

  // Sort newest first, cap.
  events.sort((a, b) => b.ts - a.ts);
  return events.slice(0, limit);
}

function bucketByDay(agoDays) {
  if (agoDays === 0) return 'Today';
  if (agoDays === 1) return 'Yesterday';
  if (agoDays < 7) return 'Earlier this week';
  if (agoDays < 14) return 'Last week';
  if (agoDays < 30) return 'Earlier this month';
  return 'Older';
}

function relativeAgo(agoDays) {
  if (agoDays === 0) return 'today';
  if (agoDays === 1) return '1 day ago';
  if (agoDays < 7) return `${agoDays} days ago`;
  if (agoDays < 14) return '1 week ago';
  if (agoDays < 30) return `${Math.floor(agoDays / 7)} weeks ago`;
  return `${Math.floor(agoDays / 30)} months ago`;
}

// Tone chip → colors
function toneColors(tone) {
  switch (tone) {
    case 'brand':   return { fg: 'var(--color-brand-600)',   bg: 'var(--bg-brand-primary)' };
    case 'success': return { fg: 'var(--color-success-700)', bg: 'var(--color-success-50)' };
    case 'warning': return { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' };
    case 'error':   return { fg: 'var(--color-error-700)',   bg: 'var(--bg-error-primary)' };
    default:        return { fg: 'var(--fg-tertiary)',       bg: 'var(--bg-tertiary)' };
  }
}

// A single event row in the unified activity stream
function ProjActivityEvent({ ev, onOpenCand }) {
  const meta = ACT_META[ev.type] || ACT_META['note'];
  const IconEl = Icon[meta.icon] || Icon.Clock;
  const tc = toneColors(meta.tone);
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tc.bg, color: tc.fg }}>
        <IconEl width={16} height={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: 'var(--fg-secondary)', lineHeight: '19px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, verticalAlign: 'middle' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{ev.actor.initials}</span>
            <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{ev.actor.name}</span>
          </span>
          <span style={{ color: 'var(--fg-quaternary)' }}> {meta.verb} </span>
          <span onClick={() => onOpenCand && onOpenCand(ev.candidate.id)}
            style={{ fontWeight: 600, color: 'var(--color-brand-700)', cursor: 'pointer' }}>{ev.candidate.name}</span>
        </div>
        {ev.detail && (
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--fg-quaternary)', lineHeight: '18px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {ev.detail}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--fg-quaternary)', paddingTop: 6 }}>{relativeAgo(ev.agoDays)}</div>
    </div>
  );
}

// Grouped list of events under a day-bucket label
function ProjActivityDayGroup({ label, events, onOpenCand }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', padding: '0 0 6px', borderBottom: '1px solid var(--border-secondary)' }}>{label}</div>
      {events.map(ev => <ProjActivityEvent key={ev.id} ev={ev} onOpenCand={onOpenCand} />)}
    </div>
  );
}

// Full activity stream with optional type filter
function ProjActivityStream({ events, onOpenCand }) {
  const [typeFilter, setTypeFilter] = usePR('all');
  const filtered = typeFilter === 'all' ? events : events.filter(e => e.type === typeFilter);
  const buckets = {};
  filtered.forEach(e => { const k = bucketByDay(e.agoDays); (buckets[k] = buckets[k] || []).push(e); });
  const order = ['Today', 'Yesterday', 'Earlier this week', 'Last week', 'Earlier this month', 'Older'];

  const chips = [
    { id: 'all', label: 'All', icon: null },
    { id: 'stage-change', label: 'Stage changes', icon: 'Trending' },
    { id: 'outreach', label: 'Outreach', icon: 'MessagePlus' },
    { id: 'interview', label: 'Interviews', icon: 'Video' },
    { id: 'scorecard', label: 'Scorecards', icon: 'Star' },
    { id: 'note', label: 'Notes', icon: 'Note' },
    { id: 'rejected', label: 'Rejections', icon: 'X' },
  ];

  return (
    <React.Fragment>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {chips.map(ch => {
          const on = typeFilter === ch.id;
          const IconEl = ch.icon ? Icon[ch.icon] : null;
          return (
            <button key={ch.id} type="button" onClick={() => setTypeFilter(ch.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, border: `1px solid ${on ? 'var(--color-brand-500)' : 'var(--border-secondary)'}`, background: on ? 'var(--bg-brand-primary)' : '#fff', color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)' }}>
              {IconEl && <IconEl width={13} height={13} />}
              {ch.label}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', border: '1px dashed var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--fg-quaternary)', fontSize: 13 }}>No events matching this filter yet.</div>
      ) : order.map(k => buckets[k] && buckets[k].length > 0
        ? <ProjActivityDayGroup key={k} label={k} events={buckets[k]} onOpenCand={onOpenCand} />
        : null)}
    </React.Fragment>
  );
}

// ============================================================
// Left sidebar nav for the populated details view
// ============================================================
function ProjFilledNavItem({ item, active, onClick }) {
  const [h, setH] = usePR(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 34, padding: '0 12px',
        border: 0, borderRadius: 7, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
        fontSize: 13.5, fontWeight: active ? 600 : 500,
        color: active ? 'var(--color-brand-700)' : 'var(--fg-secondary)',
        background: active ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-primary-hover)' : 'transparent'),
        transition: 'background 120ms, color 120ms',
      }}>
      <span style={{ display: 'inline-flex', color: active ? 'var(--color-brand-600)' : 'var(--fg-quaternary)' }}>
        {React.cloneElement(item.icon, { width: 16, height: 16 })}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.count != null && <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? 'var(--color-brand-700)' : 'var(--fg-quaternary)', background: active ? '#fff' : 'var(--bg-tertiary)', borderRadius: 9999, padding: '1px 8px' }}>{item.count}</span>}
    </button>
  );
}

function ProjFilledSideNav({ active, setActive, counts }) {
  const groups = [
    { title: 'Search overview', items: [
      { id: 'summary',  label: 'Summary',       icon: <Icon.Grid /> },
      { id: 'strategy', label: 'Strategy',      icon: <Icon.FileText /> },
    ] },
    { title: 'Progress', items: [
      { id: 'activity',  label: 'Activity',    icon: <Icon.Clock />, count: counts.activity },
      { id: 'candidates',label: 'Candidates',  icon: <Icon.Users />, count: counts.candidates },
      { id: 'scorecards',label: 'Scorecards',  icon: <Icon.Star />,  count: counts.scorecards },
    ] },
    { title: 'People', items: [
      { id: 'team',     label: 'Team',         icon: <Icon.UserSummary /> },
    ] },
  ];
  return (
    <nav aria-label="Project sections" style={{ position: 'sticky', top: 12, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map(g => (
        <div key={g.title}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', padding: '0 12px 6px' }}>{g.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {g.items.map(it => <ProjFilledNavItem key={it.id} item={it} active={active === it.id} onClick={() => setActive(it.id)} />)}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ============================================================
// Summary section: KPI tiles + recent activity preview
// ============================================================
function KpiTile({ label, value, sub, tone }) {
  const tc = tone ? toneColors(tone) : null;
  return (
    <div style={{ padding: '16px 18px', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600, color: tc ? tc.fg : 'var(--fg-primary)' }}>{value}</div>
      {sub && <div style={{ marginTop: 3, fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{sub}</div>}
    </div>
  );
}

function ProjFilledSummary({ p, cands, events, onOpenCand, onGoActivity }) {
  const activeCount = cands.filter(c => c.stage !== 'Rejected' && c.stage !== 'Hired').length;
  const hiredCount = cands.filter(c => c.stage === 'Hired').length;
  const rejectedCount = cands.filter(c => c.stage === 'Rejected').length;
  const scorecardCount = cands.reduce((n, c) => n + (c.scorecards ? c.scorecards.count : 0), 0);
  const avgScore = (() => {
    const rated = cands.filter(c => c.scorecards);
    if (!rated.length) return null;
    const sum = rated.reduce((s, c) => s + c.scorecards.avg, 0);
    return (sum / rated.length).toFixed(1);
  })();
  const recentDays = 7;
  const recentEvents = events.filter(e => e.agoDays < recentDays).length;
  const preview = events.slice(0, 6);
  return (
    <React.Fragment>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <KpiTile label="Active candidates" value={activeCount} sub={`${cands.length} total`} />
        <KpiTile label="Hired" value={hiredCount} tone="success" sub={hiredCount ? 'This search' : 'None yet'} />
        <KpiTile label="Rejected" value={rejectedCount} tone="error" sub={rejectedCount ? 'Not a fit' : 'None yet'} />
        <KpiTile label="Avg scorecard" value={avgScore || '—'} sub={`${scorecardCount} scorecards`} />
      </div>
      <div style={{ marginTop: 24, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>Latest activity</h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--fg-quaternary)' }}>{recentEvents} events in the last {recentDays} days.</p>
          </div>
          <button type="button" onClick={onGoActivity}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
            View all activity <Icon.ChevronRight width={13} height={13} />
          </button>
        </div>
        <div style={{ marginTop: 6 }}>
          {preview.map(ev => <ProjActivityEvent key={ev.id} ev={ev} onOpenCand={onOpenCand} />)}
        </div>
      </div>
    </React.Fragment>
  );
}

function ProjFilledCandidateList({ cands, byStage, onOpenCand }) {
  const stages = HubData.PROJECT_STAGES.filter(s => (byStage[s] || []).length > 0);
  const StageCount = ({ stage }) => (byStage[stage] || []).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {stages.map(stage => (
        <div key={stage} style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border-secondary)' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{stage}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-tertiary)', background: 'var(--bg-tertiary)', borderRadius: 9999, padding: '1px 8px' }}>{(byStage[stage] || []).length}</span>
          </div>
          <div style={{ padding: '4px 8px' }}>
            {byStage[stage].map(c => (
              <button key={c.id} type="button" onClick={() => onOpenCand(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 8px', border: 0, background: 'transparent', cursor: 'pointer', borderRadius: 8, fontFamily: 'var(--font-body)', textAlign: 'left' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <HubUI.HubAvatar name={c.name} size={30} ring={!!(c.offLimits || c.flag)} />
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[c.title, c.company].filter(Boolean).join(' · ') || '—'}</span>
                </span>
                <span style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>
                  {c.scorecards ? `${c.scorecards.count} · ${c.scorecards.avg.toFixed(1)}★` : '—'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Right meta rail (populated view)
// ============================================================
function ProjFilledMetaRail({ p, cands, events, daysOpen }) {
  const { HubAvatar } = HubUI;
  const total = cands.length;
  const stageBreak = HubData.PROJECT_STAGES.map(s => ({ stage: s, count: cands.filter(c => c.stage === s).length })).filter(x => x.count > 0);
  const maxCount = stageBreak.reduce((m, x) => Math.max(m, x.count), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Candidates</div>
            <div style={{ marginTop: 2, fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)' }}>{total}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, fontSize: 12.5, fontWeight: 600, color: 'var(--color-success-700)', background: 'var(--color-success-50)', border: '1px solid var(--color-success-300)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success-500)' }} />Open · {daysOpen}d
          </span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stageBreak.map(x => (
            <div key={x.stage} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <span style={{ flex: '0 0 132px', color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.stage}</span>
              <span style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${(x.count / maxCount) * 100}%`, background: HubData.STAGE_COLORS[x.stage] || 'var(--color-brand-500)' }} />
              </span>
              <span style={{ flex: '0 0 20px', textAlign: 'right', fontWeight: 600, color: 'var(--fg-primary)' }}>{x.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', marginBottom: 8 }}>Team</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PROJ_TEAM.slice(0, 4).map((m, i) => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{m.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-quaternary)' }}>{i === 0 ? 'Lead recruiter' : i === 1 ? 'Sourcer' : 'Coordinator'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', marginBottom: 6 }}>Search health</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--fg-secondary)' }}>
          <div><strong style={{ color: 'var(--fg-primary)' }}>{events.filter(e => e.agoDays < 7).length}</strong> events in the last 7 days</div>
          <div><strong style={{ color: 'var(--fg-primary)' }}>{events.filter(e => e.type === 'outreach' && e.agoDays < 14).length}</strong> outreaches in the last 2 weeks</div>
          <div><strong style={{ color: 'var(--fg-primary)' }}>{events.filter(e => e.type === 'scorecard').length}</strong> scorecards submitted</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ProjectFilledView — populated PersonPage-style project detail
// ============================================================
function ProjectFilledView({ p, cands, byStage, daysOpen, onOpenCand, onOpenStrategy, section, setSection }) {
  const events = React.useMemo(() => getProjectActivity(cands), [cands]);
  const counts = { activity: events.length, candidates: cands.length, scorecards: cands.reduce((n, c) => n + (c.scorecards ? c.scorecards.count : 0), 0) };
  const renderMain = () => {
    switch (section) {
      case 'summary':    return <ProjFilledSummary p={p} cands={cands} events={events} onOpenCand={onOpenCand} onGoActivity={() => setSection('activity')} />;
      case 'activity':   return (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Activity</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-quaternary)' }}>Unified feed of notes, outreaches, stage changes, scorecards, and rejections across every candidate.</p>
          <ProjActivityStream events={events} onOpenCand={onOpenCand} />
        </div>
      );
      case 'candidates': return <ProjFilledCandidateList cands={cands} byStage={byStage} onOpenCand={onOpenCand} />;
      case 'strategy':   return (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Strategy</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-quaternary)' }}>ICP, calibration notes, and target companies for this search.</p>
          <button type="button" onClick={onOpenStrategy} style={{ height: 34, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open strategy drawer</button>
        </div>
      );
      case 'scorecards': return (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Scorecards</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-quaternary)' }}>Structured feedback across candidates. Deep-dive coming soon — filter the activity stream by scorecards for now.</p>
          <ProjActivityStream events={events.filter(e => e.type === 'scorecard')} onOpenCand={onOpenCand} />
        </div>
      );
      case 'team':       return (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Team</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {PROJ_TEAM.map((m, i) => (
              <div key={m.name} style={{ padding: 12, border: '1px solid var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{m.initials}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>{i === 0 ? 'Lead recruiter' : i === 1 ? 'Sourcer' : 'Coordinator'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '216px minmax(0, 1fr) 320px', gap: 24, padding: '20px 24px 60px', alignItems: 'flex-start' }}>
      <ProjFilledSideNav active={section} setActive={setSection} counts={counts} />
      <div style={{ minWidth: 0 }}>{renderMain()}</div>
      <ProjFilledMetaRail p={p} cands={cands} events={events} daysOpen={daysOpen} />
    </div>
  );
}

// ============================================================
// Project Mapping view — spreadsheet-style, company-first grouped list.
// Inspired by recruiter target-map worksheets: candidates are grouped under
// their primary company, sub-grouped by pipeline stage, and each row shows a
// leading priority band (Strong/Second/Weaker) for at-a-glance triage.
// ============================================================

// Fit level derived from priority — mirrors the "Green/Yellow/Red" sheet legend.
// High or Urgent → strong; Medium → second; Low → weaker.
function candFit(c) {
  const p = candMeta(c).priority;
  if (p === 'High' || p === 'Urgent') return 'strong';
  if (p === 'Medium') return 'second';
  return 'weaker';
}
const FIT_LABELS = {
  strong: 'Strong profile',
  second: 'Second priority',
  weaker: 'Weaker — tagged for mapping',
};
const FIT_COLORS = {
  strong: { band: 'var(--color-success-500)', dot: 'var(--color-success-500)', bg: 'var(--color-success-50)', fg: 'var(--color-success-700)' },
  second: { band: 'var(--color-warning-500)', dot: 'var(--color-warning-500)', bg: 'var(--color-warning-50)', fg: 'var(--color-warning-700)' },
  weaker: { band: 'var(--color-error-500)',   dot: 'var(--color-error-500)',   bg: 'var(--bg-error-primary)', fg: 'var(--color-error-700)' },
};

// ---- match rating (0–5 dots) derived from fit ----
const FIT_TO_MATCH = { strong: 5, second: 4, weaker: 3 };
function MatchDots({ score }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }} title={`Match ${score}/5`}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < score ? 'var(--color-success-500)' : 'var(--color-gray-200)' }} />
      ))}
    </span>
  );
}

// ---- Tenure pill — Current (at this company) vs Former ----
function TenurePill({ tenure }) {
  const cur = tenure === 'current';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 22, padding: '0 9px', borderRadius: 9999,
      background: cur ? 'var(--color-success-50)' : 'var(--bg-tertiary)',
      color: cur ? 'var(--color-success-700)' : 'var(--fg-tertiary)',
      border: `1px solid ${cur ? 'var(--color-success-300)' : 'var(--border-secondary)'}`, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cur ? 'var(--color-success-500)' : 'var(--color-gray-400)' }} />
      {cur ? 'Current' : 'Former'}
    </span>
  );
}

// ---- Company metadata (tier / category / note) — deterministic per company ----
const MAP_CATEGORIES = ['CDP', 'Analytics', 'MarTech', 'Data Platform', 'CRM', 'Attribution', 'iPaaS'];
const MAP_NOTES = ['Direct competitor — packaged CDP', 'Mid-market CDP competitor', 'Adjacent platform — strong talent', 'Frequent source for this search', 'Watchlist account', 'Enterprise incumbent', 'Fast-growing challenger'];
function mapHash(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function companyMapMeta(company) {
  const h = mapHash(company);
  return { tier: 1 + (h % 3), category: MAP_CATEGORIES[(h >>> 2) % MAP_CATEGORIES.length], note: MAP_NOTES[(h >>> 4) % MAP_NOTES.length] };
}

// ---- Supplemental mapped people to beef out each company (deterministic) ----
const MAP_FIRST = ['Tomás', 'Jordan', 'Karina', 'Marcus', 'Anya', 'Priya', 'Devin', 'Lena', 'Omar', 'Sofia', 'Ravi', 'Grace', 'Mateo', 'Nadia', 'Felix', 'Hana', 'Ian', 'Elena', 'Sanjay', 'Clara'];
const MAP_LAST = ['Herrera', 'Hayes', 'Vasquez', 'Chen', 'Kovalenko', 'Rahman', 'Brandt', 'Holm', 'Haddad', 'Reyes', 'Park', 'Doyle', 'Costa', 'Iqbal', 'Novak', 'Tan', 'Ferreira', 'Salinas', 'Bergström', 'Mensah'];
const MAP_TITLES = ['VP Sales, Mid-Market', 'VP Sales, Enterprise', 'Area VP, East', 'Director Sales', 'Director, Growth', 'Head of Revenue', 'RVP, West', 'VP Customer Success', 'Sr. Director, Sales', 'GM, Commercial'];
const MAP_DEST = ['dbt Labs', 'Census', 'Snowflake', 'Databricks', 'Amplitude', 'Rudderstack', 'Hightouch', 'Fivetran', 'Braze', 'Iterable'];
const MAP_CITIES = ['Austin, TX', 'San Francisco, CA', 'New York, NY', 'Brooklyn, NY', 'Seattle, WA', 'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Remote'];
function mapInitials(name) { return String(name || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(); }
function supplementalMapPeople(company) {
  const h0 = mapHash('sup' + company);
  const n = 3 + (h0 % 4); // 3–6 extra mapped people
  const people = [];
  for (let i = 0; i < n; i++) {
    const h = mapHash(company + '#' + i);
    const name = `${MAP_FIRST[h % MAP_FIRST.length]} ${MAP_LAST[(h >>> 3) % MAP_LAST.length]}`;
    const former = (h % 5) < 2;
    const title = MAP_TITLES[(h >>> 5) % MAP_TITLES.length];
    const currentTitle = former ? `${MAP_TITLES[(h >>> 7) % MAP_TITLES.length].split(',')[0]}, ${MAP_DEST[(h >>> 9) % MAP_DEST.length]}` : null;
    const location = MAP_CITIES[(h >>> 11) % MAP_CITIES.length];
    const match = 3 + (h % 3);
    people.push({ synthetic: true, id: `map-${company}-${i}`, name, initials: mapInitials(name), title, company, currentTitle, tenure: former ? 'former' : 'current', location, match });
  }
  return people;
}
// Real pipeline candidate → mapped-person shape
function candToMapped(c) {
  return {
    synthetic: false, id: c.id, candidate: c, name: c.name, initials: mapInitials(c.name || '?'),
    title: c.title || '—', company: c.company, currentTitle: null,
    tenure: 'current', location: [c.city, c.region].filter(Boolean).join(', ') || (c.country || '—'),
    match: FIT_TO_MATCH[candFit(c)] || 3, offLimits: c.offLimits, eye: c.eye,
  };
}

// ---- one mapped-person row ----
const MAP_ROW_GRID = '22px minmax(0, 1.5fr) minmax(0, 1.4fr) minmax(0, 1.3fr) 118px minmax(0, 1.1fr) 84px';
function ProjMapPersonRow({ p, onOpenPerson }) {
  const { HubAvatar } = HubUI;
  const [h, setH] = usePR(false);
  return (
    <div onClick={() => onOpenPerson(p)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'grid', gridTemplateColumns: MAP_ROW_GRID, alignItems: 'center', gap: 14, minHeight: 52, padding: '6px 20px', background: h ? 'var(--bg-primary-hover)' : '#fff', borderBottom: '1px solid var(--border-secondary)', cursor: 'pointer' }}>
      <HubUI.HubCheckbox />
      {/* Name + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <HubAvatar name={p.name} size={30} ring={!!p.offLimits} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          {p.offLimits && <span title="Off limits" style={{ color: 'var(--color-error-600)', display: 'inline-flex', flexShrink: 0 }}><Icon.Flag width={11} height={11} /></span>}
        </span>
      </div>
      {/* Title at company */}
      <div style={{ fontSize: 13.5, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || '—'}</div>
      {/* Current title (where formers went) */}
      <div style={{ fontSize: 13.5, color: p.currentTitle ? 'var(--fg-secondary)' : 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.currentTitle || '—'}</div>
      {/* Tenure */}
      <div><TenurePill tenure={p.tenure} /></div>
      {/* Location */}
      <div style={{ fontSize: 13, color: 'var(--fg-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.location || '—'}</div>
      {/* Match */}
      <div style={{ justifySelf: 'start' }}><MatchDots score={p.match} /></div>
    </div>
  );
}

// ---- company section: full-width band + column header + person rows ----
function ProjMapCompanySection({ company, meta, people, expanded, onToggle, onOpenPerson }) {
  const current = people.filter(p => p.tenure === 'current').length;
  const former = people.length - current;
  const th = { fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-tertiary)' };
  return (
    <div style={{ borderTop: '1px solid var(--border-secondary)' }}>
      {/* company band — emphasized, full width */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', background: 'var(--bg-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company}</span>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', border: '1px solid var(--color-brand-200)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>Tier {meta.tier}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg-tertiary)', flexShrink: 0 }}>{meta.category}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--fg-secondary)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success-500)' }} />{current} current
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--fg-quaternary)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gray-400)' }} />{former} former
          </span>
          <span style={{ fontSize: 12.5, fontStyle: 'italic', color: 'var(--fg-quaternary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.note}</span>
          <button type="button" onClick={onToggle}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
            {expanded ? 'Hide' : `Show ${people.length}`}
            <Icon.ChevronDown width={14} height={14} style={{ transition: 'transform 150ms', transform: expanded ? 'rotate(180deg)' : 'none' }} />
          </button>
        </span>
      </div>
      {expanded && (
        <React.Fragment>
          {/* column header */}
          <div style={{ display: 'grid', gridTemplateColumns: MAP_ROW_GRID, alignItems: 'center', gap: 14, padding: '9px 20px', background: '#fff', borderBottom: '1px solid var(--border-secondary)' }}>
            <span />
            <div style={th}>Name</div>
            <div style={th}>Title at company</div>
            <div style={th}>Current title</div>
            <div style={th}>Tenure</div>
            <div style={th}>Location</div>
            <div style={th}>Match</div>
          </div>
          {people.map(p => <ProjMapPersonRow key={p.id} p={p} onOpenPerson={onOpenPerson} />)}
        </React.Fragment>
      )}
    </div>
  );
}

// ---- ProjMappingView — the whole view ----
function ProjMappingView({ cands, onOpen }) {
  // Company groups from visibleCands (respects toolbar search/filter). Each company's
  // real pipeline candidates are supplemented with deterministic mapped people so the
  // market map reads like a full talent landscape, not just the active pipeline.
  const groups = React.useMemo(() => {
    const map = new Map();
    cands.forEach(c => {
      const key = (c.company || '— No company —').trim() || '— No company —';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return Array.from(map.entries())
      .map(([company, list]) => {
        const real = list.map(candToMapped);
        const supp = supplementalMapPeople(company);
        // current first, then by match desc
        const people = [...real, ...supp].sort((a, b) => {
          if (a.tenure !== b.tenure) return a.tenure === 'current' ? -1 : 1;
          return b.match - a.match;
        });
        return { company, meta: companyMapMeta(company), people };
      })
      .sort((a, b) => a.company.localeCompare(b.company));
  }, [cands]);

  const [collapsedMap, setCollapsedMap] = usePR({});
  const toggleCompany = (c) => setCollapsedMap(s => ({ ...s, [c]: !s[c] }));
  const setAll = (collapsed) => { const m = {}; if (collapsed) groups.forEach(g => m[g.company] = true); setCollapsedMap(m); };

  // roll-up stats
  const stats = React.useMemo(() => {
    let people = 0, current = 0, former = 0;
    groups.forEach(g => { people += g.people.length; g.people.forEach(p => p.tenure === 'current' ? current++ : former++); });
    return { companies: groups.length, people, current, former };
  }, [groups]);

  // Open a mapped person: real candidate → panel; synthetic → toast (not in project yet)
  const onOpenPerson = (p) => {
    if (p.synthetic) { HubUI.showHubToast({ title: p.name, message: `Mapped at ${p.company} · not in this project yet` }); return; }
    onOpen(p.id);
  };

  if (groups.length === 0) {
    return (
      <div style={{ padding: '20px 24px 60px' }}>
        <div style={{ padding: '48px 20px', textAlign: 'center', border: '1px dashed var(--border-secondary)', borderRadius: 12, background: 'var(--bg-secondary)', color: 'var(--fg-quaternary)', fontSize: 13.5 }}>
          No companies in this view — adjust filters or add candidates to build the market map.
        </div>
      </div>
    );
  }

  const allCollapsed = groups.every(g => collapsedMap[g.company]);
  return (
    <div style={{ padding: '14px 24px 60px' }}>
      {/* stats + bulk controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 4px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg-quaternary)' }}>
          <span><strong style={{ color: 'var(--fg-primary)', fontWeight: 700 }}>{stats.companies}</strong> companies</span>
          <span style={{ color: 'var(--border-primary)' }}>·</span>
          <span><strong style={{ color: 'var(--fg-primary)', fontWeight: 700 }}>{stats.people}</strong> people mapped</span>
          <span style={{ color: 'var(--border-primary)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success-500)' }} /><strong style={{ color: 'var(--fg-primary)', fontWeight: 700 }}>{stats.current}</strong> current</span>
          <span style={{ color: 'var(--border-primary)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gray-400)' }} /><strong style={{ color: 'var(--fg-primary)', fontWeight: 700 }}>{stats.former}</strong> former</span>
        </div>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => setAll(true)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: allCollapsed ? 'var(--fg-quaternary)' : 'var(--fg-brand-tertiary)' }}>Collapse all</button>
        <button type="button" onClick={() => setAll(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-brand-tertiary)' }}>Expand all</button>
        <button type="button" onClick={() => HubUI.showHubReportToast(`${reportSlug(HubData.PROJECT.name)}_Market_Map_-_${reportDate()}`, 'CSV')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>
          <Icon.Download width={15} height={15} />Export
        </button>
      </div>
      {/* company sections */}
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
        {groups.map(g => (
          <ProjMapCompanySection key={g.company}
            company={g.company} meta={g.meta} people={g.people}
            expanded={!collapsedMap[g.company]} onToggle={() => toggleCompany(g.company)}
            onOpenPerson={onOpenPerson} />
        ))}
      </div>
    </div>
  );
}

function ProjectPage({ onBack }) {
  const { BulkActionBar } = window.ProjBulk;

  // ---- newly-created project draft (from CreateProjectModal) → empty state ----
  const [newDraft, setNewDraft] = usePR(() => {
    try { const raw = localStorage.getItem(NEW_PROJECT_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  });
  const isEmptyProject = !!newDraft;
  const clearNewDraft = () => { try { localStorage.removeItem(NEW_PROJECT_KEY); } catch (_) {} setNewDraft(null); };
  // once we've captured the draft into local state, remove the localStorage flag so
  // navigating away and returning falls back to the demo project (single-shot empty state).
  React.useEffect(() => { if (isEmptyProject) { try { localStorage.removeItem(NEW_PROJECT_KEY); } catch (_) {} } }, []);

  // synthesize a project record — override HubData.PROJECT when we have a draft
  const p = isEmptyProject ? {
    name: newDraft.title, confidential: !!newDraft.confidential,
    status: 'Open · just created', company: newDraft.company,
    location: newDraft.location || 'Location not set',
    team: [initialsOf(newDraft.lead)].filter(Boolean), teamMore: 0,
    overview: {
      lead: newDraft.lead, priority: 'Not set',
      openDate: todayLabel(), targetClose: 'Not set', stageName: 'Open', candidates: 0,
      description: 'No description yet — add a strategy to give the team context.',
    },
  } : HubData.PROJECT;

  const defaultView = isEmptyProject ? 'details' : (localStorage.getItem('thrive-proj-view') || 'kanban');
  const [view, setView] = usePR(defaultView);
  const [selId, setSelId] = usePR(null);
  const [selTab, setSelTab] = usePR('Overview');
  const [selAdd, setSelAdd] = usePR(false);
  const openCand = (id, tab, add) => { setSelId(id); setSelTab(tab || 'Overview'); setSelAdd(!!add); };
  const [projOpen, setProjOpen] = usePR(false);
  const [filterOpen, setFilterOpen] = usePR(false);
  const [sourceOpen, setSourceOpen] = usePR(false);
  const [stagesOpen, setStagesOpen] = usePR(false);
  // Bump on stage-defs changes so consumers (kanban headers, panel archetype lookup) re-render.
  const [stageRev, setStageRev] = usePR(0);
  // Hydrate any persisted stage-defs from a previous session — single-shot on mount.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          HubData.replaceStageDefs(parsed);
          setStageRev(r => r + 1);
        }
      }
    } catch (_) {}
  }, []);
  const daysOpen = isEmptyProject ? 0 : parseInt((p.status.match(/(\d+)/) || [])[1] || '0', 10);
  const setV = (v) => { setView(v); localStorage.setItem('thrive-proj-view', v); };
  const [grouped, setGroupedRaw] = usePR(() => localStorage.getItem('thrive-proj-group') !== 'flat');
  const setGrouped = (g) => { setGroupedRaw(g); localStorage.setItem('thrive-proj-group', g ? 'grouped' : 'flat'); };
  const [density, setDensityRaw] = usePR(() => localStorage.getItem('thrive-proj-density') || 'condensed');
  const setDensity = (d) => { setDensityRaw(d); localStorage.setItem('thrive-proj-density', d); };
  // Empty (checklist) vs Populated (activity-stream + KPIs + sidebar nav).
  // Newly-created projects default to empty; the demo project defaults to populated.
  const [detailsMode, setDetailsModeRaw] = usePR(() => localStorage.getItem('thrive-proj-details-mode') || (isEmptyProject ? 'empty' : 'populated'));
  const setDetailsMode = (m) => { setDetailsModeRaw(m); localStorage.setItem('thrive-proj-details-mode', m); };
  const [filledSection, setFilledSection] = usePR('activity');
  const [colState, setColState] = usePR(() => window.ProjTable.loadColState());
  const [collapsed, setCollapsed] = usePR({});
  const allCollapsed = HubData.PROJECT_STAGES.every(s => collapsed[s]);
  const toggleCollapseAll = () => { if (allCollapsed) { setCollapsed({}); } else { const all = {}; HubData.PROJECT_STAGES.forEach(s => all[s] = true); setCollapsed(all); } };

  // candidate board lives in state so bulk actions actually move/update cards.
  // A newly-created project starts empty; the demo project seeds from HubData.CANDIDATES.
  const [cands, setCands] = usePR(() => isEmptyProject ? [] : HubData.CANDIDATES.map(c => ({ ...c, tags: [...c.tags] })));
  const [selected, setSelected] = usePR(() => new Set());
  const toggleSel = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearSel = () => setSelected(new Set());

  // ---- candidate filter (search box) ----
  const [query, setQuery] = usePR('');
  const q = query.trim().toLowerCase();
  const matchesQuery = React.useCallback((c) => {
    if (!q) return true;
    const loc = [c.city, c.region, c.country].filter(Boolean).join(', ');
    const tagText = (c.tags || []).map(t => (t && t.label) || '').join(' ');
    return [c.name, c.title, c.company, loc, c.stage, tagText]
      .some(v => v && String(v).toLowerCase().includes(q));
  }, [q]);

  // ---- structured filters (drawer) ----
  const [filters, setFiltersRaw] = usePR(() => {
    try { const raw = localStorage.getItem('thrive-proj-filters'); if (raw) return { ...FILTER_EMPTY, ...JSON.parse(raw) }; } catch (_) {}
    return { ...FILTER_EMPTY };
  });
  const setFilters = (f) => { setFiltersRaw(f); try { localStorage.setItem('thrive-proj-filters', JSON.stringify(f)); } catch (_) {} };
  const activeFilterCount = countActiveFilters(filters);

  // ---- sort (lifted here so kanban + table share) ----
  const [sort, setSortRaw] = usePR(() => {
    try { const raw = localStorage.getItem('thrive-proj-sort'); if (raw) return JSON.parse(raw); } catch (_) {}
    return { key: null, dir: 'asc' };
  });
  const setSort = (s) => { setSortRaw(s); try { localStorage.setItem('thrive-proj-sort', JSON.stringify(s)); } catch (_) {} };

  // Query → structured filters → sort. One memoized pipeline that feeds both views.
  const visibleCands = React.useMemo(() => {
    let out = q ? cands.filter(matchesQuery) : cands.slice();
    out = applyCandFilters(out, filters);
    if (sort.key) out = window.ProjTable && window.ProjTable.sortRows
      ? window.ProjTable.sortRows(out.map(c => ({ c, r: window.ProjTable.rowData(c) })), sort).map(x => x.c)
      : out;
    return out;
  }, [cands, q, matchesQuery, filters, sort]);

  const byStage = {};
  HubData.PROJECT_STAGES.forEach(s => byStage[s] = []);
  visibleCands.forEach(c => { (byStage[c.stage] = byStage[c.stage] || []).push(c); });

  // ---- bulk action handlers ----
  const ids = selected;
  const nSel = selected.size;
  const noun = `${nSel} candidate${nSel !== 1 ? 's' : ''}`;
  const toast = (title, message) => HubUI.showHubToast({ title, message });
  const bulk = {
    addProjects: (k) => { toast('Added to projects', `${noun} added to ${k} other project${k > 1 ? 's' : ''}.`); clearSel(); },
    addLists: (k, name) => { toast('Added to list', name ? `${noun} added to the new list “${name}”.` : `${noun} added to ${k} list${k > 1 ? 's' : ''}.`); clearSel(); },
    addTags: (tags) => { setCands(cs => cs.map(c => ids.has(c.id) ? { ...c, tags: mergeTags(c.tags, tags) } : c)); toast('Tags added', `${tags.length} tag${tags.length > 1 ? 's' : ''} applied to ${noun}.`); clearSel(); },
    outreach: (kind) => { toast('Outreach started', `${kind} · ${noun}.`); clearSel(); },
    owner: (o) => { setCands(cs => cs.map(c => ids.has(c.id) ? { ...c, owner: o.initials } : c)); toast('Owner changed', `${o.name} now owns ${noun}.`); clearSel(); },
    moveStage: (stage) => { setCands(cs => cs.map(c => ids.has(c.id) ? { ...c, stage } : c)); toast('Stage updated', `${noun} moved to ${stage}.`); clearSel(); },
    moveTop: () => { setCands(cs => { const a = cs.filter(c => ids.has(c.id)); const b = cs.filter(c => !ids.has(c.id)); return [...a, ...b]; }); toast('Moved to top', `${noun} moved to the top of their current stage.`); clearSel(); },
    hide: () => { setCands(cs => cs.map(c => ids.has(c.id) ? { ...c, eye: true } : c)); toast('Hidden from hiring manager', `${noun} hidden from the hiring manager view.`); clearSel(); },
    reject: (reason) => { setCands(cs => cs.map(c => ids.has(c.id) ? { ...c, stage: 'Rejected' } : c)); toast('Candidates rejected', `${noun} moved to Rejected — ${reason}.`); clearSel(); },
    remove: () => { setCands(cs => cs.filter(c => !ids.has(c.id))); setSelId(curr => ids.has(curr) ? null : curr); toast('Removed from project', `${noun} removed from this project.`); clearSel(); },
  };

  // ---- hide / unhide from hiring manager ----
  const onUnhide = (id) => { const c = cands.find(x => x.id === id); setCands(cs => cs.map(x => x.id === id ? { ...x, eye: false } : x)); toast('Visible to hiring manager', `${c ? c.name : 'Candidate'} is no longer hidden from the hiring manager.`); };
  const onOwner = (id, o) => { const c = cands.find(x => x.id === id); setCands(cs => cs.map(x => x.id === id ? { ...x, owner: o.initials } : x)); toast('Owner changed', `${o.name} now owns ${c ? c.name : 'this candidate'}.`); };

  // ---- inline stage change (list table cell) ----
  const onStage = (id, stage) => { const c = cands.find(x => x.id === id); setCands(cs => cs.map(x => x.id === id ? { ...x, stage } : x)); toast('Stage updated', `${c ? c.name : 'Candidate'} moved to ${stage}.`); };

  // ---- add candidate manually: blank card in a given stage (default Research) + inline name focus ----
  const newCounter = React.useRef(0);
  const onAddManual = (stage) => {
    newCounter.current += 1;
    const id = `new-${Date.now()}-${newCounter.current}`;
    const blank = {
      id, stage: stage || HubData.PROJECT_STAGES[0], name: '', title: '', company: '',
      city: '', region: '', country: '', flag: false, eye: false, tags: [],
      up: 0, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: [],
      isNew: true,
      signal: { timeInStage: 'Just now', lead: { icon: 'user', tone: 'next', text: 'Just added — fill in details' }, cadence: [] },
    };
    setCands(cs => [blank, ...cs]);
    // clear the search filter so the new card is visible even if a query is active
    setQuery('');
    // no side panel — the empty card itself offers the next step (upload / linkedin / manual)
  };
  const onCandName = (id, name) => setCands(cs => cs.map(c => c.id === id ? { ...c, name } : c));
  const onCandNameCommit = (id) => setCands(cs => cs.map(c => {
    if (c.id !== id) return c;
    const trimmed = (c.name || '').trim();
    return { ...c, name: trimmed, isNew: trimmed ? false : c.isNew };
  }));
  const onCandNameCancel = (id) => { setCands(cs => cs.filter(c => c.id !== id)); setSelId(curr => curr === id ? null : curr); };
  // Selecting an existing match on a new inline card: fill the card from the match and
  // pop open the candidate panel on Overview so the user can confirm it's the same person.
  const onSeedFromMatch = (id, match) => {
    setCands(cs => cs.map(c => {
      if (c.id !== id) return c;
      const tags = (match.tags || []).map(t => typeof t === 'string' ? { label: t, color: 'gray' } : t);
      return {
        ...c, isNew: false, signal: null,
        name: match.name, title: match.title || '', company: match.company || '',
        city: match.city || '', region: match.region || '', country: match.country || '',
        tags, flag: !!match.flag, offLimits: match.offLimits || null,
        experience: match.experience || c.experience || [],
      };
    }));
    setSelId(id); setSelTab('Overview'); setSelAdd(false);
  };

  // ---- thumbs-up / thumbs-down vote (toggle off by re-clicking, switch by clicking the other) ----
  const onVote = (id, dir, note) => {
    const cur = cands.find(x => x.id === id); if (!cur) return;
    const prev = cur.myVote || null;
    const next = prev === dir ? null : dir;
    setCands(cs => cs.map(c => {
      if (c.id !== id) return c;
      let up = c.up, down = c.down;
      if (prev === 'up') up--; else if (prev === 'down') down--;
      if (next === 'up') up++; else if (next === 'down') down++;
      return { ...c, up, down, myVote: next, voteNote: next ? (note || '') : '' };
    }));
    if (!next) toast('Vote removed', `Your vote on ${cur.name} was removed.`);
    else toast(next === 'up' ? 'Voted thumbs up' : 'Voted thumbs down', `${cur.name}${note ? ' · note saved' : ''}.`);
  };

  // ---- drag-and-drop reorder (kanban) ----
  const moveCard = (dragId, stage, beforeId) => {
    setCands(cs => {
      const dragged = cs.find(c => c.id === dragId);
      if (!dragged) return cs;
      const moved = dragged.stage === stage ? dragged : { ...dragged, stage };
      const lists = {};
      HubData.PROJECT_STAGES.forEach(s => lists[s] = []);
      cs.forEach(c => { if (c.id === dragId) return; (lists[c.stage] = lists[c.stage] || []).push(c); });
      const tgt = lists[stage] || (lists[stage] = []);
      if (beforeId) { const i = tgt.findIndex(c => c.id === beforeId); if (i >= 0) tgt.splice(i, 0, moved); else tgt.push(moved); }
      else tgt.push(moved);
      const out = [];
      Object.keys(lists).forEach(s => { if (!HubData.PROJECT_STAGES.includes(s)) lists[s].forEach(c => out.push(c)); });
      HubData.PROJECT_STAGES.forEach(s => (lists[s] || []).forEach(c => out.push(c)));
      return out;
    });
  };

  const sel = selId ? cands.find(c => c.id === selId) : null;
  const stageList = sel ? byStage[sel.stage] : [];
  const selIdx = sel ? stageList.findIndex(c => c.id === sel.id) : -1;
  const go = (delta) => { const n = (selIdx + delta + stageList.length) % stageList.length; setSelId(stageList[n].id); };

  // "View full profile" — stash the candidate as a NEW_PERSON draft and open the
  // full PersonPage in a new browser tab. The current tab stays on the project.
  const openFullProfile = (c) => {
    if (!c) return;
    try {
      const draft = {
        name: c.name || '', title: c.title || '', company: c.company || '',
        city: c.city || '', region: c.region || '', country: c.country || '',
        offLimits: c.offLimits || null, flag: !!c.flag, inProject: true,
        tags: c.tags || [], stage: c.stage, experience: c.experience || [],
        scorecards: c.scorecards || null, note: c.note || null,
      };
      const key = (window.PersonKeys && window.PersonKeys.NEW_PERSON_KEY) || 'thrive-new-person';
      localStorage.setItem(key, JSON.stringify(draft));
    } catch (_) {}
    const url = window.location.origin + window.location.pathname + '?open=person';
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {/* sticky chrome: sub-header + bulk action bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--border-secondary)' }}>
        {/* left — project identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flexShrink: 0 }}>
          <ProjLogo size={40} onClick={() => setProjOpen(true)} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span onClick={() => setProjOpen(true)} style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-brand-tertiary)', cursor: 'pointer', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <StatusPill status={p.overview.stageName || 'Open'} daysOpen={daysOpen} />
              {p.confidential && <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: 9999, padding: '1px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>Confidential</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginTop: 3, whiteSpace: 'nowrap' }}>
              <HubUI.HubLink size={13.5} weight={500}>{p.company}</HubUI.HubLink>
              <span style={{ color: 'var(--border-primary)' }}>·</span>
              <span style={{ color: 'var(--fg-quaternary)' }}>{p.location}</span>
            </div>
          </div>
          <span style={{ width: 1, height: 34, background: 'var(--border-secondary)', margin: '0 4px', flexShrink: 0 }} />
          <TeamStack team={p.team} more={p.teamMore} />
        </div>
        <span style={{ flex: 1 }} />
        {/* right — controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <AddCandidatesMenu onSource={() => setSourceOpen(true)} onManual={onAddManual} />
          <GenerateReportsMenu />
          <ProjectActionsMenu onManageStages={() => setStagesOpen(true)} />
        </div>
      </div>
      {nSel > 0 && <BulkActionBar count={nSel} onClear={clearSel} bulk={bulk} />}
      </div>

      {/* view toolbar: search + filter + sort · [table controls] · collapse toggle + view toggle */}
      {view !== 'details' && (
        <React.Fragment>
          <ViewToolbar
            query={query} setQuery={setQuery}
            onFilter={() => setFilterOpen(true)}
            filterCount={activeFilterCount}
            sort={sort} setSort={setSort}
            resultCount={visibleCands.length} totalCount={cands.length}
            onToggleCollapse={toggleCollapseAll}
            collapseLabel={allCollapsed ? 'Expand all' : 'Collapse all'}
            allCollapsed={allCollapsed}
            showCollapse={view === 'kanban' || grouped}
            tableControls={view === 'list' ? (() => { const { ColumnsButton, GroupToggle } = window.ProjTable; return <React.Fragment><GroupToggle grouped={grouped} setGrouped={setGrouped} /><ColumnsButton colState={colState} setColState={setColState} /></React.Fragment>; })() : null}
            view={view} setView={setV}
            density={density} setDensity={setDensity} />
          <ActiveFilterRow filters={filters} teamMembers={PROJ_TEAM}
            onChange={setFilters} onClear={() => setFilters({ ...FILTER_EMPTY })} />
        </React.Fragment>
      )}
      {view === 'details' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 24px 2px' }}>
          <ModeToggle mode={detailsMode} setMode={setDetailsMode} />
          <ProjViewToggle view={view} setView={setV} />
        </div>
      )}

      {/* body */}
      <div style={{ overflowX: view === 'kanban' ? 'auto' : 'visible' }}>
        {view === 'details'
          ? (detailsMode === 'populated'
              ? <ProjectFilledView p={p} cands={cands} byStage={byStage} daysOpen={daysOpen}
                  onOpenCand={(id) => openCand(id, 'Overview')}
                  onOpenStrategy={() => setProjOpen(true)}
                  section={filledSection} setSection={setFilledSection} />
              : <ProjectDetailsView p={p} candCount={cands.length}
                  onSwitchToKanban={() => setV('kanban')}
                  onOpenStrategy={() => setProjOpen(true)}
                  onAddCandidates={() => onAddManual(HubData.PROJECT_STAGES[0])} />)
          : view === 'kanban'
            ? <KanbanView byStage={byStage} onOpen={openCand} selected={selected} onToggle={toggleSel} moveCard={moveCard} onUnhide={onUnhide} onOwner={onOwner} onVote={onVote} collapsed={collapsed} setCollapsed={setCollapsed} onCandName={onCandName} onCandNameCommit={onCandNameCommit} onCandNameCancel={onCandNameCancel} onSeedFromMatch={onSeedFromMatch} onAddManual={onAddManual} density={density} />
            : view === 'map'
              ? <ProjMappingView cands={visibleCands} onOpen={(id) => openCand(id, 'Overview')} />
              : <window.ProjTable.ProjTableView cands={visibleCands} onOpen={openCand} selected={selected} toggleSel={toggleSel} setSelected={setSelected} onUnhide={onUnhide} onVote={onVote} onOwner={onOwner} onStage={onStage} onCandName={onCandName} onCandNameCommit={onCandNameCommit} onCandNameCancel={onCandNameCancel} onSeedFromMatch={onSeedFromMatch} grouped={grouped} collapsed={collapsed} setCollapsed={setCollapsed} colState={colState} chromeSignal={nSel} sort={sort} setSort={setSort} />}
      </div>

      {sel && <CandidatePanel candidate={sel} index={selIdx} total={stageList.length} initialTab={selTab} initialAdd={selAdd} onPrev={() => go(-1)} onNext={() => go(1)} onClose={() => setSelId(null)}
        contextTabs={['Overview', 'Experience', 'Off Limits', 'Recent activity', 'Scorecards']}
        onFullProfile={() => openFullProfile(sel)} />}
      {projOpen && <ProjectDrawer onClose={() => setProjOpen(false)} />}
      {sourceOpen && <SourceCandidatesModal onClose={() => setSourceOpen(false)} />}
      {stagesOpen && <ManageStagesModal onClose={() => setStagesOpen(false)} onChange={() => setStageRev(r => r + 1)} />}
      <CandFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        teamMembers={PROJ_TEAM}
        tagOptions={Array.from(new Set(cands.flatMap(c => (c.tags || []).map(t => t.label)))).sort()} />
    </div>
  );
}

window.ProjectPage = ProjectPage;
window.ProjCreate = { CreateProjectModal, NEW_PROJECT_KEY };
