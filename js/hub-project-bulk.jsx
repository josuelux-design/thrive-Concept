// ============================================================
// Thrive TRM — Project bulk-select + bulk-action workflow
// Avatar-hover selection, selected card state, and the action bar.
// Exposed on window.ProjBulk (separate babel scope from hub-project).
// ============================================================
const { useState: useBK, useEffect: useBKE, useRef: useBKR } = React;

// ---- People who can own a candidacy (Change owner) ----
const BULK_OWNERS = [
  { initials: 'AZ', name: 'Angela Zhou', color: '#F38744' },
  { initials: 'KT', name: 'Keat Teoh', color: '#5965F5' },
  { initials: 'MI', name: 'Manoj Iyer', color: '#16A34A' },
  { initials: 'VT', name: 'Vincent Turk', color: '#7C3AED' },
  { initials: 'ER', name: 'Eleyni Rodriguez', color: '#0EA5E9' },
  { initials: 'KN', name: 'Kafui Nutakor', color: '#DB2777' },
];

const BULK_TAG_SUGGESTIONS = [
  { label: 'Priority', color: 'red' }, { label: 'NDA', color: 'green' },
  { label: 'Diversity Slate', color: 'purple' }, { label: 'Referred', color: 'blue' },
  { label: 'Passive', color: 'gray' }, { label: 'Boomerang', color: 'orange' },
  { label: '10/10 Gender', color: 'teal' }, { label: 'Backchannel', color: 'orange' },
];

const BULK_OUTREACH = [
  { id: 'email', label: 'Compose email', sub: 'Send a one-off message now', icon: 'Mail' },
  { id: 'sequence', label: 'Add to sequence', sub: 'Multi-step automated outreach', icon: 'Trending' },
  { id: 'linkedin', label: 'LinkedIn message', sub: 'Open a connection request draft', icon: 'LinkedIn' },
];

const BULK_LISTS = [
  { name: 'CFO Life Science sisterhood', count: 1 },
  { name: 'Top CROs 2026', count: 28 },
  { name: 'Series B GTM Bench', count: 38 },
  { name: 'EMEA Sales Leaders', count: 14 },
  { name: 'Product Leaders to watch', count: 52 },
];

const BULK_REJECT_REASONS = ['Pass', 'Scope', 'Timing', 'Compensation', 'Unresponsive', 'Candidate withdrew'];

// ============================================================
// Selectable avatar — avatar by default, checkbox on hover,
// solid brand check when selected. Click toggles selection.
// ============================================================
function SelectableAvatar({ c, size = 44, selected, onToggle }) {
  const { HubAvatar } = HubUI;
  const [h, setH] = useBK(false);
  return (
    <div
      role="checkbox" aria-checked={selected} aria-label={`Select ${c.name}`} tabIndex={0}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={(e) => { e.stopPropagation(); onToggle(c.id); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(c.id); } }}
      title={selected ? 'Deselect' : 'Select candidate'}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0, cursor: 'pointer', borderRadius: '50%', outline: 'none' }}>
      <HubAvatar name={c.name} size={size} ring={!!(c.flag || c.offLimits)} />

      {/* hover affordance — dim avatar + outlined check ring */}
      {h && !selected && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(16,24,40,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff', boxSizing: 'border-box',
        }}>
          <span style={{ width: size * 0.46, height: size * 0.46, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.95)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.95)' }}>
            <Icon.Check width={size * 0.3} height={size * 0.3} />
          </span>
        </div>
      )}

      {/* selected state — solid brand circle + white check */}
      {selected && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'var(--color-brand-600)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 2px #fff, 0 0 0 4px var(--color-brand-200)',
          animation: 'tt-pop 140ms ease-out',
        }}>
          <Icon.Check width={size * 0.5} height={size * 0.5} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Small shared primitives for the action panels
// ============================================================
function BulkPrimaryBtn({ children, onClick, disabled, full, danger }) {
  const [h, setH] = useBK(false);
  const base = danger ? 'var(--color-error-600)' : 'var(--color-brand-600)';
  const hov = danger ? 'var(--color-error-700)' : 'var(--color-brand-700)';
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: full ? '100%' : 'auto', height: 40, padding: '0 16px', borderRadius: 8, border: 0,
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
        color: '#fff', background: disabled ? 'var(--color-gray-200)' : (h ? hov : base),
        boxShadow: disabled ? 'none' : 'var(--shadow-skeu)', transition: 'background 120ms ease-out',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}>{children}</button>
  );
}

function BulkCheck({ on }) {
  return (
    <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${on ? 'var(--color-brand-600)' : 'var(--border-primary)'}`, background: on ? 'var(--color-brand-600)' : '#fff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms' }}>
      {on && <Icon.Check width={13} height={13} />}
    </span>
  );
}

function BulkSearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', pointerEvents: 'none', display: 'inline-flex' }}><Icon.Search width={17} height={17} /></span>
      <input autoFocus value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', height: 38, padding: '0 12px 0 34px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 8, outline: 'none' }} />
    </div>
  );
}

const bulkRow = (active) => ({
  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
  border: 0, background: active ? 'var(--bg-brand-primary)' : 'transparent', cursor: 'pointer',
  padding: '9px 10px', borderRadius: 8, fontFamily: 'var(--font-body)', transition: 'background 100ms',
});

function BulkScrollList({ children, max = 240 }) {
  return <div className="cp-tabs" style={{ maxHeight: max, overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>{children}</div>;
}

function PanelHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--fg-tertiary)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ============================================================
// Action button + anchored popover
// ============================================================
function BulkActionBtn({ icon, label, danger, kebab, panelWidth = 300, align = 'left', renderPanel, onClick }) {
  const [open, setOpen] = useBK(false);
  const [h, setH] = useBK(false);
  const [pos, setPos] = useBK(null);
  const btnRef = useBKR(null);
  const panelRef = useBKR(null);

  const place = () => {
    const b = btnRef.current; if (!b) return;
    const r = b.getBoundingClientRect();
    const p = { top: r.bottom + 8 };
    if (align === 'right') p.right = Math.max(12, window.innerWidth - r.right);
    else p.left = Math.max(12, Math.min(r.left, window.innerWidth - panelWidth - 12));
    setPos(p);
  };

  useBKE(() => {
    if (!open) return;
    place();
    const onDoc = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', place); };
  }, [open]);

  const fg = danger ? 'var(--color-error-600)' : 'var(--fg-secondary)';
  const hoverBg = danger ? 'var(--bg-error-primary)' : 'var(--bg-primary-hover)';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button ref={btnRef} type="button"
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        onClick={() => { if (renderPanel) setOpen(o => !o); else onClick && onClick(); }}
        style={{
          height: 38, padding: kebab ? 0 : '0 12px', width: kebab ? 38 : 'auto', borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          border: '1px solid var(--border-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)',
          fontSize: 14, fontWeight: 600, color: fg, whiteSpace: 'nowrap',
          background: (open || h) ? hoverBg : '#fff', boxShadow: 'var(--shadow-xs)',
          transition: 'background 120ms ease-out',
        }}>
        {React.cloneElement(icon, { width: 18, height: 18 })}
        {!kebab && label}
      </button>
      {open && renderPanel && pos && ReactDOM.createPortal(
        <div ref={panelRef} className="cp-tabs" style={{
          position: 'fixed', top: pos.top, left: pos.left, right: pos.right, width: panelWidth,
          background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12,
          boxShadow: 'var(--shadow-lg)', padding: 14, zIndex: 200,
          animation: 'tt-pop 130ms ease-out', transformOrigin: `top ${align}`,
        }}>
          {renderPanel({ close: () => setOpen(false) })}
        </div>, document.body)}
    </div>
  );
}

// ---- Add to other projects ----
function AddProjectsPanel({ close, onApply }) {
  const [q, setQ] = useBK('');
  const [sel, setSel] = useBK({});
  const items = (HubData.PROJECTS || []).filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
  const n = Object.values(sel).filter(Boolean).length;
  return (
    <div>
      <PanelHead title="Add to other projects" />
      <BulkSearchInput value={q} onChange={setQ} placeholder="Search projects" />
      <div style={{ height: 10 }} />
      <BulkScrollList>
        {items.map((p, i) => {
          const on = !!sel[p.title];
          return (
            <button key={i} type="button" onClick={() => setSel(s => ({ ...s, [p.title]: !s[p.title] }))} style={bulkRow(on)}>
              <BulkCheck on={on} />
              <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Briefcase width={17} height={17} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{p.company}</span>
              </span>
            </button>
          );
        })}
        {items.length === 0 && <div style={{ padding: '16px 10px', fontSize: 14, color: 'var(--fg-quaternary)' }}>No projects match “{q}”.</div>}
      </BulkScrollList>
      <div style={{ marginTop: 12 }}>
        <BulkPrimaryBtn full disabled={!n} onClick={() => { onApply(n); close(); }}>{n ? `Add to ${n} project${n > 1 ? 's' : ''}` : 'Select projects'}</BulkPrimaryBtn>
      </div>
    </div>
  );
}

// ---- Add to list ----
function AddListPanel({ close, onApply }) {
  const [q, setQ] = useBK('');
  const [sel, setSel] = useBK({});
  const items = BULK_LISTS.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));
  const n = Object.values(sel).filter(Boolean).length;
  return (
    <div>
      <PanelHead title="Add to list" />
      <BulkSearchInput value={q} onChange={setQ} placeholder="Search or create a list" />
      <div style={{ height: 10 }} />
      <BulkScrollList>
        {items.map((l, i) => {
          const on = !!sel[l.name];
          return (
            <button key={i} type="button" onClick={() => setSel(s => ({ ...s, [l.name]: !s[l.name] }))} style={bulkRow(on)}>
              <BulkCheck on={on} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span>
              <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', flexShrink: 0 }}>{l.count}</span>
            </button>
          );
        })}
        {q && !items.some(l => l.name.toLowerCase() === q.toLowerCase()) && (
          <button type="button" onClick={() => { onApply(1, q); close(); }} style={bulkRow(false)}>
            <span style={{ width: 18, height: 18, color: 'var(--color-brand-600)', display: 'inline-flex' }}><Icon.Plus width={18} height={18} /></span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)' }}>Create “{q}”</span>
          </button>
        )}
      </BulkScrollList>
      <div style={{ marginTop: 12 }}>
        <BulkPrimaryBtn full disabled={!n} onClick={() => { onApply(n); close(); }}>{n ? `Add to ${n} list${n > 1 ? 's' : ''}` : 'Select a list'}</BulkPrimaryBtn>
      </div>
    </div>
  );
}

// ---- Add candidate tags ----
function AddTagsPanel({ close, onApply }) {
  const { HubColorTag } = HubUI;
  const [q, setQ] = useBK('');
  const [picked, setPicked] = useBK([]);
  const toggle = (t) => setPicked(p => p.some(x => x.label === t.label) ? p.filter(x => x.label !== t.label) : [...p, t]);
  const matches = BULK_TAG_SUGGESTIONS.filter(t => t.label.toLowerCase().includes(q.toLowerCase()));
  const exact = BULK_TAG_SUGGESTIONS.some(t => t.label.toLowerCase() === q.toLowerCase());
  return (
    <div>
      <PanelHead title="Add candidate tags" />
      <BulkSearchInput value={q} onChange={setQ} placeholder="Search or create a tag" />
      {picked.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {picked.map((t, i) => (
            <span key={i} onClick={() => toggle(t)} style={{ cursor: 'pointer' }} title="Remove"><HubColorTag label={t.label} color={t.color} /></span>
          ))}
        </div>
      )}
      <div style={{ height: 10 }} />
      <BulkScrollList max={200}>
        {matches.map((t, i) => {
          const on = picked.some(x => x.label === t.label);
          return (
            <button key={i} type="button" onClick={() => toggle(t)} style={bulkRow(on)}>
              <BulkCheck on={on} />
              <HubColorTag label={t.label} color={t.color} />
            </button>
          );
        })}
        {q && !exact && (
          <button type="button" onClick={() => { toggle({ label: q, color: 'gray' }); setQ(''); }} style={bulkRow(false)}>
            <span style={{ width: 18, height: 18, color: 'var(--color-brand-600)', display: 'inline-flex' }}><Icon.Plus width={18} height={18} /></span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)' }}>Create tag “{q}”</span>
          </button>
        )}
      </BulkScrollList>
      <div style={{ marginTop: 12 }}>
        <BulkPrimaryBtn full disabled={!picked.length} onClick={() => { onApply(picked); close(); }}>{picked.length ? `Apply ${picked.length} tag${picked.length > 1 ? 's' : ''}` : 'Select tags'}</BulkPrimaryBtn>
      </div>
    </div>
  );
}

// ---- Add outreach ----
function OutreachPanel({ close, onApply }) {
  return (
    <div>
      <PanelHead title="Add outreach" sub="Start a conversation with the selected candidates." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BULK_OUTREACH.map(o => {
          const I = Icon[o.icon];
          return (
            <button key={o.id} type="button" onClick={() => { onApply(o.label); close(); }} style={bulkRow(false)}>
              <span style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I width={18} height={18} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>{o.label}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{o.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Change owner ----
function OwnerPanel({ close, onApply }) {
  const [q, setQ] = useBK('');
  const items = BULK_OWNERS.filter(o => o.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PanelHead title="Change owner" />
      <BulkSearchInput value={q} onChange={setQ} placeholder="Search people" />
      <div style={{ height: 10 }} />
      <BulkScrollList>
        {items.map((o, i) => (
          <button key={i} type="button" onClick={() => { onApply(o); close(); }} style={bulkRow(false)}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: HubUI.hubAva(o.name).bg, color: HubUI.hubAva(o.name).fg, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{o.initials}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)' }}>{o.name}</span>
          </button>
        ))}
      </BulkScrollList>
    </div>
  );
}

// ---- Move stage ----
function MoveStagePanel({ close, onApply }) {
  const stages = HubData.PROJECT_STAGES.filter(s => s !== 'Rejected');
  return (
    <div>
      <PanelHead title="Move to stage" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {stages.map((s, i) => (
          <button key={s} type="button" onClick={() => { onApply(s); close(); }} style={bulkRow(false)}>
            <span style={{ minWidth: 24, height: 22, padding: '0 7px', borderRadius: 6, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-primary)' }}>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Reject (with reason) ----
function RejectPanel({ count, close, onApply }) {
  const [reason, setReason] = useBK(null);
  return (
    <div>
      <PanelHead title={`Reject ${count} candidate${count > 1 ? 's' : ''}`} sub="They’ll move to the Rejected stage. Pick a reason." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {BULK_REJECT_REASONS.map(r => {
          const on = reason === r;
          return (
            <button key={r} type="button" onClick={() => setReason(r)}
              style={{ padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, border: `1px solid ${on ? 'var(--color-error-300)' : 'var(--border-primary)'}`, background: on ? 'var(--bg-error-primary)' : '#fff', color: on ? 'var(--color-error-700)' : 'var(--fg-secondary)', transition: 'all 120ms' }}>{r}</button>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        <BulkPrimaryBtn full danger disabled={!reason} onClick={() => { onApply(reason); close(); }}><Icon.Ban width={17} height={17} />{reason ? `Reject — ${reason}` : 'Select a reason'}</BulkPrimaryBtn>
      </div>
    </div>
  );
}

// ---- Remove from project (confirm) ----
function RemovePanel({ count, close, onApply }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--bg-error-primary)', color: 'var(--color-error-600)', border: '1px solid var(--color-error-300)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Trash width={20} height={20} /></span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>Remove from project?</div>
          <div style={{ fontSize: 13.5, lineHeight: '20px', color: 'var(--fg-tertiary)', marginTop: 3 }}>{count} candidate{count > 1 ? 's' : ''} will be removed from this project. Their profiles and history aren’t deleted.</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" onClick={close} style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-xs)' }}>Cancel</button>
        <BulkPrimaryBtn full danger onClick={() => { onApply(); close(); }}>Remove</BulkPrimaryBtn>
      </div>
    </div>
  );
}

// ============================================================
// Bulk action bar — appears above the board when ≥1 selected.
// `bulk` is a map of action callbacks supplied by ProjectPage.
// ============================================================
function BulkActionBar({ count, onClear, bulk }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px',
      background: 'var(--bg-brand-primary)', borderBottom: '1px solid var(--color-brand-200)',
      animation: 'cp-drop 200ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* selection summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--color-brand-600)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check width={15} height={15} /></span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-700)', whiteSpace: 'nowrap' }}>{count} selected</span>
        </span>
        <button type="button" onClick={onClear}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-700)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-tertiary)'}
          style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
          <Icon.X width={15} height={15} />Clear all
        </button>
      </div>

      <span style={{ width: 1, height: 28, background: 'var(--color-brand-200)', flexShrink: 0 }} />

      {/* actions — scroll horizontally if the viewport is tight */}
      <div className="cp-tabs" style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', flex: 1, paddingBottom: 1 }}>
        <BulkActionBtn icon={<Icon.AddProject />} label="Add to project" panelWidth={320} renderPanel={({ close }) => <AddProjectsPanel close={close} onApply={(n) => bulk.addProjects(n)} />} />
        <BulkActionBtn icon={<Icon.AddList />} label="Add to list" panelWidth={300} renderPanel={({ close }) => <AddListPanel close={close} onApply={(n, name) => bulk.addLists(n, name)} />} />
        <BulkActionBtn icon={<Icon.Tag />} label="Tags" panelWidth={290} renderPanel={({ close }) => <AddTagsPanel close={close} onApply={(tags) => bulk.addTags(tags)} />} />
        <BulkActionBtn icon={<Icon.MessagePlus />} label="Outreach" panelWidth={300} renderPanel={({ close }) => <OutreachPanel close={close} onApply={(kind) => bulk.outreach(kind)} />} />
        <BulkActionBtn icon={<Icon.User />} label="Owner" panelWidth={280} renderPanel={({ close }) => <OwnerPanel close={close} onApply={(o) => bulk.owner(o)} />} />
        <BulkActionBtn icon={<Icon.Trending />} label="Move stage" panelWidth={280} renderPanel={({ close }) => <MoveStagePanel close={close} onApply={(s) => bulk.moveStage(s)} />} />
        <BulkActionBtn icon={<Icon.ChevronUp />} label="Move to top" onClick={() => bulk.moveTop()} />

        <span style={{ width: 1, height: 28, background: 'var(--color-brand-200)', flexShrink: 0 }} />

        <BulkActionBtn icon={<Icon.EyeOff />} label="Hide from hiring manager" onClick={() => bulk.hide()} />
        <BulkActionBtn icon={<Icon.Ban />} label="Reject" danger panelWidth={320} renderPanel={({ close }) => <RejectPanel count={count} close={close} onApply={(r) => bulk.reject(r)} />} />
        <BulkActionBtn icon={<Icon.Trash />} label="Remove" danger align="right" panelWidth={320} renderPanel={({ close }) => <RemovePanel count={count} close={close} onApply={() => bulk.remove()} />} />
      </div>
    </div>
  );
}

// ============================================================
// Owner menu — clickable owner avatar that opens the same owner
// picker used by the bulk bar. Used on individual candidate cards.
// ============================================================
function OwnerMenu({ owner, onChange, size = 28 }) {
  const [open, setOpen] = useBK(false);
  const [pos, setPos] = useBK(null);
  const [h, setH] = useBK(false);
  const btnRef = useBKR(null);
  const panelRef = useBKR(null);
  const place = () => { const b = btnRef.current; if (!b) return; const r = b.getBoundingClientRect(); setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) }); };
  useBKE(() => {
    if (!open) return;
    place();
    const onDoc = (e) => { if (btnRef.current && btnRef.current.contains(e.target)) return; if (panelRef.current && panelRef.current.contains(e.target)) return; setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey); window.addEventListener('resize', place);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', place); };
  }, [open]);
  return (
    <React.Fragment>
      <button ref={btnRef} type="button" title="Change owner"
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 0, cursor: 'pointer', boxShadow: (open || h) ? '0 0 0 2px var(--color-brand-200)' : 'none', transition: 'box-shadow 120ms' }}>{owner}</button>
      {open && pos && ReactDOM.createPortal(
        <div ref={panelRef} className="cp-tabs" style={{ position: 'fixed', top: pos.top, right: pos.right, width: 280, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 14, zIndex: 200, animation: 'tt-pop 130ms ease-out', transformOrigin: 'top right' }}>
          <OwnerPanel close={() => setOpen(false)} onApply={(o) => { onChange && onChange(o); }} />
        </div>, document.body)}
    </React.Fragment>
  );
}

const ownerName = (init) => { const o = BULK_OWNERS.find(x => x.initials === init); return o ? o.name : (init || ''); };
window.ProjBulk = { SelectableAvatar, BulkActionBar, OwnerMenu, ownerName };
