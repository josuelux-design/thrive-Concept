// ============================================================
// Thrive TRM — Project list view (dense functional data table)
// The spreadsheet-feel counterpart of the kanban card: same data,
// same design language, one candidate = one dense row (name + title stacked).
// Exposed on window.ProjTable (separate babel scope).
// ============================================================
const { useState: useTB, useRef: useTBR, useLayoutEffect: useTBL, useEffect: useTBE } = React;

const COLS_KEY = 'thrive-proj-table-cols-v3';

// ---- column catalogue (select / name+title / actions are fixed & not listed here) ----
// Stage is hidden automatically while grouped-by-stage (redundant with the section headers).
const TABLE_COLUMNS = [
  { key: 'company',     label: 'Company',            width: 168, sortable: true,  defaultVisible: true },
  { key: 'activity',    label: 'Last / next activity', width: 250, sortable: true, defaultVisible: true },
  { key: 'stage',       label: 'Stage',              width: 186, sortable: true,  defaultVisible: true },
  { key: 'timeInStage', label: 'Time in stage',      width: 128, sortable: true,  defaultVisible: true },
  { key: 'owner',       label: 'Owner',              width: 176, sortable: true,  defaultVisible: true },
  { key: 'outreaches',  label: 'Outreaches',         width: 116, sortable: true,  defaultVisible: true,  align: 'center' },
  { key: 'scorecards',  label: 'Scorecards',         width: 140, sortable: true,  defaultVisible: true,  align: 'center' },
  { key: 'sentiment',   label: 'Sentiment',          width: 120, sortable: true,  defaultVisible: true,  align: 'center' },
  { key: 'tags',        label: 'Tags',               width: 236, sortable: false, defaultVisible: true },
  { key: 'location',    label: 'Location',           width: 194, sortable: true,  defaultVisible: false },
];
const COL_META = Object.fromEntries(TABLE_COLUMNS.map(c => [c.key, c]));

const SELECT_W = 46;
const NAME_W = 256;
const ROW_H = 52;

function defaultColState() {
  return { order: TABLE_COLUMNS.map(c => c.key), hidden: Object.fromEntries(TABLE_COLUMNS.filter(c => !c.defaultVisible).map(c => [c.key, true])) };
}
function loadColState() {
  try {
    const raw = JSON.parse(localStorage.getItem(COLS_KEY));
    if (!raw || !Array.isArray(raw.order)) return defaultColState();
    // reconcile with catalogue (drop unknown, append new)
    const known = raw.order.filter(k => COL_META[k]);
    TABLE_COLUMNS.forEach(c => { if (!known.includes(c.key)) known.push(c.key); });
    return { order: known, hidden: raw.hidden || {} };
  } catch (_) { return defaultColState(); }
}
function saveColState(s) { try { localStorage.setItem(COLS_KEY, JSON.stringify(s)); } catch (_) {} }

// ---- deterministic hash (stable per candidate id) ----
function tbHash(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// outreach count — plausible per stage, stable per candidate
const OUTREACH_BASE = { 'Research': 0, 'Outreach': 5, 'Recruiter Interview': 7, 'Hiring Team Interview': 9, 'Offer': 11, 'Hired': 12, 'Rejected': 3 };
function outreachCount(c) {
  const h = tbHash('o' + c.id);
  if (c.stage === 'Research') return h % 2;
  const base = OUTREACH_BASE[c.stage] != null ? OUTREACH_BASE[c.stage] : 2;
  return base + (h % 5);
}

const ACT_ICONS = { user: 'User', message: 'MessagePlus', video: 'Video', calendar: 'Calendar', offer: 'Star', star: 'Star', clock: 'Clock', note: 'Note', phone: 'Phone' };

// derive the per-row projection once
function rowData(c) {
  const sig = HubData.candidateSignal(c);
  const days = parseInt(String(sig.timeInStage).match(/\d+/) || 0, 10) || 0;
  const lead = sig.lead || { text: '', tone: 'last', icon: 'clock' };
  const actDays = parseInt((String(lead.text).match(/\d+/) || [])[0] || '999', 10);
  const activitySort = (lead.tone === 'next' ? 0 : 100000) + actDays;
  const loc = [c.city, c.region, c.country].filter(Boolean).join(', ');
  return {
    days, sig, lead, activitySort, loc,
    outreaches: outreachCount(c),
    net: (c.up || 0) - (c.down || 0),
  };
}

// ---- comparable value per sort key ----
function sortVal(key, c, r) {
  switch (key) {
    case 'name': return (c.name || '').toLowerCase();
    case 'title': return (c.title || '').toLowerCase();
    case 'company': return (c.company || '').toLowerCase();
    case 'stage': return HubData.PROJECT_STAGES.indexOf(c.stage);
    case 'timeInStage': return r.days;
    case 'owner': return (window.ProjBulk.ownerName(c.owner) || '').toLowerCase();
    case 'activity': return r.activitySort;
    case 'outreaches': return r.outreaches;
    case 'scorecards': return c.scorecards ? c.scorecards.count * 10 + c.scorecards.avg : -1;
    case 'sentiment': return r.net;
    case 'location': return (r.loc || '').toLowerCase();
    default: return 0;
  }
}
function sortRows(rows, sort) {
  if (!sort.key) return rows;
  const dir = sort.dir === 'desc' ? -1 : 1;
  const emptyKeys = { title: 1, company: 1, location: 1 };
  return [...rows].sort((A, B) => {
    const a = sortVal(sort.key, A.c, A.r), b = sortVal(sort.key, B.c, B.r);
    // keep blank text fields at the bottom regardless of direction
    if (emptyKeys[sort.key]) { if (!a && b) return 1; if (a && !b) return -1; }
    if (a < b) return -1 * dir; if (a > b) return 1 * dir; return 0;
  });
}

// ============================================================
// Small cell primitives
// ============================================================
const EmDash = () => <span style={{ color: 'var(--fg-disabled)' }}>—</span>;

function RowCheck({ checked, indeterminate, onChange, label }) {
  return (
    <button type="button" role="checkbox" aria-checked={indeterminate ? 'mixed' : checked} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: (checked || indeterminate) ? 0 : '1.5px solid var(--border-primary)', background: (checked || indeterminate) ? 'var(--color-brand-600)' : '#fff', color: '#fff', transition: 'background 120ms, border-color 120ms' }}>
      {checked && <Icon.Check width={13} height={13} />}
      {!checked && indeterminate && <span style={{ width: 9, height: 2, borderRadius: 2, background: '#fff' }} />}
    </button>
  );
}

// inline stage editor — click pill → dropdown of stages (Phoenix rule: single-field = inline)
function StageCell({ c, onStage }) {
  const [open, setOpen] = useTB(false);
  const [pos, setPos] = useTB(null);
  const [h, setH] = useTB(false);
  const btnRef = useTBR(null);
  const dot = HubData.STAGE_COLORS[c.stage] || 'var(--bg-tertiary)';
  const place = () => { const b = btnRef.current; if (!b) return; const r = b.getBoundingClientRect(); setPos({ top: Math.min(r.bottom + 6, window.innerHeight - 320), left: Math.min(r.left, window.innerWidth - 236) }); };
  useTBE(() => {
    if (!open) return; place();
    const onDoc = (e) => { if (btnRef.current && btnRef.current.contains(e.target)) return; setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey); window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);
  return (
    <React.Fragment>
      <button ref={btnRef} type="button" title="Change stage" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, maxWidth: '100%', height: 26, padding: '0 9px 0 8px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)', background: h ? 'var(--bg-primary-hover)' : 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', transition: 'background 120ms' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.stage}</span>
        <Icon.ChevronDown width={13} height={13} style={{ color: 'var(--fg-quaternary)', flexShrink: 0, opacity: h ? 1 : 0.55 }} />
      </button>
      {open && pos && ReactDOM.createPortal(
        <React.Fragment>
          <div onMouseDown={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 201, width: 224, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'cp-drop 130ms ease-out', fontFamily: 'var(--font-body)' }}>
            {HubData.PROJECT_STAGES.map(s => {
              const on = s === c.stage;
              return (
                <button key={s} type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); if (!on) onStage(c.id, s); }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', border: 0, borderRadius: 8, cursor: 'pointer', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: on ? 600 : 500, color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)', background: on ? 'var(--bg-brand-primary)' : 'transparent', textAlign: 'left' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: HubData.STAGE_COLORS[s], flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{s}</span>
                  {on && <Icon.Check width={15} height={15} style={{ color: 'var(--color-brand-600)' }} />}
                </button>
              );
            })}
          </div>
        </React.Fragment>, document.body)}
    </React.Fragment>
  );
}

// compact sentiment — thumbs up/down, inline vote (no note popover here)
function SentimentCell({ c, onVote }) {
  const Thumb = ({ dir }) => {
    const active = c.myVote === dir;
    const count = dir === 'up' ? (c.up || 0) : (c.down || 0);
    const Ic = dir === 'up' ? Icon.ThumbsUp : Icon.ThumbsDown;
    const activeColor = dir === 'up' ? 'var(--color-brand-600)' : 'var(--color-error-600)';
    const [h, setH] = useTB(false);
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); onVote(c.id, dir); }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        title={active ? 'Click to remove your vote' : (dir === 'up' ? 'Vote up' : 'Vote down')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 500, padding: '2px 3px', color: active ? activeColor : (h ? 'var(--fg-tertiary)' : 'var(--fg-quaternary)'), transition: 'color 120ms' }}>
        <Ic width={16} height={16} fill={active ? 'currentColor' : 'none'} />{count > 0 ? count : ''}
      </button>
    );
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Thumb dir="up" /><Thumb dir="down" /></span>;
}

// hover-revealed quick actions (floated over the right edge of the row)
function RowActions({ c, onOpen }) {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
  const Act = ({ icon, title, accent, onClick }) => {
    const [h, setH] = useTB(false);
    return (
      <button type="button" title={title} aria-label={title} onClick={stop(onClick)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 30, height: 30, borderRadius: 7, border: 0, background: h ? 'var(--bg-primary-hover)' : 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: accent ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', transition: 'background 120ms' }}>
        {React.cloneElement(icon, { width: 17, height: 17 })}
      </button>
    );
  };
  const toast = (t) => HubUI.showHubToast({ title: t, message: c.name });
  return (
    <React.Fragment>
      <Act icon={<Icon.Note />} accent title="Add note" onClick={() => onOpen(c.id, 'Notes', true)} />
      <Act icon={<Icon.MessagePlus />} accent title="Add outreach" onClick={() => onOpen(c.id, 'Outreaches', true)} />
      <Act icon={<Icon.Mail />} title="Email" onClick={() => toast('Email address')} />
      <Act icon={<Icon.Phone />} title="Phone" onClick={() => toast('Phone number')} />
    </React.Fragment>
  );
}

// ============================================================
// Row
// ============================================================
function TableRow({ c, cols, onOpen, selected, onToggle, onUnhide, onVote, onOwner, onStage, onCandName, onCandNameCommit, onCandNameCancel, onSeedFromMatch }) {
  const { HubAvatar, HubLink, HubColorTag, hubAva } = HubUI;
  const { OwnerMenu, ownerName } = window.ProjBulk;
  const [h, setH] = useTB(false);
  const r = rowData(c);
  const bg = selected ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-secondary)' : '#fff');
  const frozenSh = '4px 0 6px -4px rgba(16,24,40,0.10)';

  const td = (extra) => ({ height: ROW_H, padding: '0 14px', fontSize: 13.5, color: 'var(--fg-secondary)', borderBottom: '1px solid var(--border-secondary)', background: bg, whiteSpace: 'nowrap', overflow: 'hidden', transition: 'background 120ms', ...extra });

  const off = c.offLimits ? (typeof c.offLimits === 'string' ? c.offLimits : 'Off limits') : (c.flag ? 'Off limits' : null);

  const cell = (key) => {
    const meta = COL_META[key];
    const align = meta.align || 'left';
    const base = td({ textAlign: align });
    switch (key) {
      case 'title':
        return <td key={key} style={base}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{c.title || <EmDash />}</span></td>;
      case 'company':
        return <td key={key} style={base}>{c.company ? <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom' }}><HubLink size={13.5} weight={500}>{c.company}</HubLink></span> : <EmDash />}</td>;
      case 'stage':
        return <td key={key} style={base}><StageCell c={c} onStage={onStage} /></td>;
      case 'timeInStage':
        return <td key={key} style={base}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-tertiary)' }}><Icon.Clock width={13} height={13} style={{ color: 'var(--fg-quaternary)' }} />{r.days ? `${r.days}d` : <EmDash />}</span></td>;
      case 'owner':
        return <td key={key} style={base}><span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%' }}><OwnerMenu owner={c.owner} onChange={(o) => onOwner(c.id, o)} size={24} /><span style={{ fontSize: 13.5, color: 'var(--fg-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ownerName(c.owner)}</span></span></td>;
      case 'activity': {
        const next = r.lead.tone === 'next';
        const LeadIc = Icon[ACT_ICONS[r.lead.icon] || 'Clock'];
        if (!r.lead.text) return <td key={key} style={base}><EmDash /></td>;
        return <td key={key} style={base}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%' }}><span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: next ? 'var(--bg-brand-primary)' : 'var(--bg-tertiary)', color: next ? 'var(--color-brand-600)' : 'var(--fg-tertiary)' }}><LeadIc width={13} height={13} /></span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: next ? 600 : 400, color: next ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>{r.lead.text}</span></span></td>;
      }
      case 'outreaches':
        return <td key={key} style={base}>{r.outreaches > 0 ? <span style={{ color: 'var(--fg-secondary)', fontWeight: 500 }}>{r.outreaches}</span> : <EmDash />}</td>;
      case 'scorecards':
        return <td key={key} style={base}>{c.scorecards ? <span title={`${c.scorecards.count} scorecard${c.scorecards.count !== 1 ? 's' : ''} · ${c.scorecards.avg.toFixed(1)} avg`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-secondary)' }}><span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{c.scorecards.count}</span><span style={{ color: 'var(--border-primary)' }}>·</span><Icon.Star width={13} height={13} style={{ color: 'var(--color-warning-500)' }} fill="currentColor" /><span style={{ fontWeight: 500 }}>{c.scorecards.avg.toFixed(1)}</span></span> : <EmDash />}</td>;
      case 'sentiment':
        return <td key={key} style={base}><span onClick={(e) => e.stopPropagation()}><SentimentCell c={c} onVote={onVote} /></span></td>;
      case 'tags':
        return <td key={key} style={base}>{c.tags && c.tags.length ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, maxWidth: '100%' }}>{c.tags.slice(0, 2).map((t, i) => <HubColorTag key={i} label={t.label} color={t.color} />)}{c.tags.length > 2 && <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', fontWeight: 600 }}>+{c.tags.length - 2}</span>}</span> : <EmDash />}</td>;
      case 'location':
        return <td key={key} style={base}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', color: 'var(--fg-tertiary)' }}>{r.loc || <EmDash />}</span></td>;
      default:
        return <td key={key} style={base} />;
    }
  };

  const isNew = !!c.isNew;
  return (
    <tr onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => { if (!isNew) onOpen(c.id); }}
      style={{ cursor: isNew ? 'default' : 'pointer', background: isNew ? 'var(--bg-brand-primary)' : undefined }}>
      {/* select — frozen */}
      <td style={td({ position: 'sticky', left: 0, zIndex: 2, width: SELECT_W, textAlign: 'center', paddingLeft: 0, paddingRight: 0 })}>
        <RowCheck checked={selected} onChange={() => onToggle(c.id)} label={`Select ${c.name || 'new candidate'}`} />
      </td>
      {/* name + title (stacked) — frozen; inline duplicate-check when isNew */}
      <td style={td({ position: 'sticky', left: SELECT_W, zIndex: 2, width: NAME_W, boxShadow: frozenSh, overflow: 'visible' })}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '100%' }}>
          <HubAvatar name={c.name || '?'} size={32} ring={!!off} />
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1, flex: 1 }}>
            {isNew ? (
              (() => {
                const NF = window.PersonNameField;
                return (
                  <div style={{ minWidth: 0, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                    {NF ? (
                      <NF
                        value={c.name || ''}
                        onChange={(v) => onCandName && onCandName(c.id, v)}
                        onCommit={() => onCandNameCommit && onCandNameCommit(c.id)}
                        onSelectExisting={(match) => onSeedFromMatch && onSeedFromMatch(c.id, match)}
                        autoFocus placeholder="Candidate name"
                        label={null} required={false} size="sm" hint={null} />
                    ) : (
                      /* fallback: PersonNameField failed to load — plain input so users can still type */
                      <input autoFocus value={c.name || ''} placeholder="Candidate name"
                        onChange={(e) => onCandName && onCandName(c.id, e.target.value)}
                        onBlur={() => onCandNameCommit && onCandNameCommit(c.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onCandNameCommit && onCandNameCommit(c.id); e.currentTarget.blur(); } else if (e.key === 'Escape') { e.preventDefault(); onCandNameCancel && onCandNameCancel(c.id); } }}
                        style={{ width: '100%', boxSizing: 'border-box', height: 30, padding: '0 10px', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--color-brand-500)', borderRadius: 6, outline: 'none', boxShadow: 'var(--shadow-focus-ring)' }} />
                    )}
                  </div>
                );
              })()
            ) : (
              <React.Fragment>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span onClick={(e) => { e.stopPropagation(); onOpen(c.id); }} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={14}>{c.name}</HubLink></span>
                  {off && <span role="button" title={`${off} — click to see details`} onClick={(e) => { e.stopPropagation(); onOpen(c.id, 'Off Limits'); }} style={{ color: 'var(--color-error-600)', display: 'inline-flex', flexShrink: 0, cursor: 'pointer' }}><Icon.Flag width={14} height={14} /></span>}
                  {c.dup && <span role="button" title="Possible duplicate — click to see details" onClick={(e) => { e.stopPropagation(); HubUI.showHubToast({ title: 'Possible duplicate', message: `Review potential matches for ${c.name}` }); }} style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0, cursor: 'pointer' }}><Icon.Copy2 width={14} height={14} /></span>}
                  {c.eye && <span role="button" title="Hidden from hiring manager — click to unhide" onClick={(e) => { e.stopPropagation(); onUnhide(c.id); }} style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0, cursor: 'pointer' }}><Icon.EyeOff width={14} height={14} /></span>}
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || '—'}</span>
              </React.Fragment>
            )}
          </span>
        </span>
      </td>
      {cols.map(k => cell(k))}
      {/* actions — hover overlay floated at the right edge (no reserved column width) */}
      <td style={{ position: 'sticky', right: 0, zIndex: 3, width: 0, padding: 0, background: 'transparent', borderBottom: '1px solid var(--border-secondary)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, height: ROW_H, display: 'flex', alignItems: 'center', gap: 1, paddingLeft: 34, paddingRight: 8, background: h ? `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${bg} 28px)` : 'transparent', opacity: h ? 1 : 0, pointerEvents: h ? 'auto' : 'none', transition: 'opacity 120ms ease-out' }}>
          <RowActions c={c} onOpen={onOpen} />
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// Header cell
// ============================================================
function HeadCell({ col, sort, onSort, style }) {
  const [h, setH] = useTB(false);
  const active = sort.key === col.key;
  const align = col.align || 'left';
  const base = { position: 'sticky', top: 0, zIndex: 3, height: 40, padding: '0 14px', fontSize: 12, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: active ? 'var(--color-brand-700)' : 'var(--fg-tertiary)', background: h && col.sortable ? 'var(--bg-secondary)' : 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-secondary)', whiteSpace: 'nowrap', userSelect: 'none', cursor: col.sortable ? 'pointer' : 'default', transition: 'background 120ms', ...style };
  return (
    <th scope="col" onClick={col.sortable ? () => onSort(col.key) : undefined} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={base}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: align === 'center' ? 'center' : 'flex-start', width: '100%' }}>
        {col.label}
        {col.sortable && (
          active
            ? (sort.dir === 'desc' ? <Icon.ChevronDown width={14} height={14} /> : <Icon.ChevronUp width={14} height={14} />)
            : <Icon.ChevronDown width={13} height={13} style={{ color: 'var(--fg-quaternary)', opacity: h ? 0.7 : 0 }} />
        )}
      </span>
    </th>
  );
}

// ============================================================
// Group section header row (colSpan; label pinned to the left)
// ============================================================
function GroupRow({ stage, count, collapsed, onToggle, totalCols }) {
  return (
    <tr>
      <td colSpan={totalCols} onClick={onToggle} style={{ position: 'sticky', top: 40, zIndex: 2, padding: 0, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-secondary)', cursor: 'pointer' }}>
        <div style={{ position: 'sticky', left: 0, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 16px' }}>
          <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', transition: 'transform 150ms', transform: collapsed ? 'rotate(-90deg)' : 'none' }}><Icon.ChevronDown width={17} height={17} /></span>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: HubData.STAGE_COLORS[stage], flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>{stage}</span>
          <span style={{ minWidth: 22, height: 20, padding: '0 7px', borderRadius: 9999, background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-secondary)' }}>{count}</span>
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// Columns button + popover (show/hide + drag-reorder)
// ============================================================
function ColumnsButton({ colState, setColState }) {
  const [open, setOpen] = useTB(false);
  const [h, setH] = useTB(false);
  const [dragKey, setDragKey] = useTB(null);
  const ref = useTBR(null);
  useTBE(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const update = (next) => { setColState(next); saveColState(next); };
  const toggleVis = (key) => { const hidden = { ...colState.hidden }; if (hidden[key]) delete hidden[key]; else hidden[key] = true; update({ ...colState, hidden }); };
  const reorder = (from, to) => {
    if (from === to) return;
    const order = [...colState.order];
    const fi = order.indexOf(from), ti = order.indexOf(to);
    order.splice(fi, 1); order.splice(ti, 0, from);
    update({ ...colState, order });
  };
  const shownCount = colState.order.filter(k => !colState.hidden[k]).length;
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', color: open ? 'var(--color-brand-700)' : 'var(--fg-secondary)', background: open ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-primary-hover)' : '#fff'), border: `1px solid ${open ? 'var(--color-brand-500)' : 'var(--border-primary)'}`, boxShadow: 'var(--shadow-xs)', transition: 'background 120ms' }}>
        <Icon.Sliders width={17} height={17} style={{ color: open ? 'var(--color-brand-600)' : 'var(--fg-tertiary)' }} />Columns
      </button>
      {open && (
        <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 60, width: 268, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'tt-pop 130ms ease-out', transformOrigin: 'top right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 8px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>Columns · {shownCount} shown</span>
            <button type="button" onClick={() => update(defaultColState())} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--color-brand-600)', padding: 0, fontFamily: 'var(--font-body)' }}>Reset</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', opacity: 0.65 }}>
            <Icon.User width={15} height={15} style={{ color: 'var(--fg-quaternary)' }} />
            <span style={{ flex: 1, fontSize: 14, color: 'var(--fg-tertiary)' }}>Candidate</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Pinned</span>
          </div>
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '2px 8px 4px' }} />
          <div className="cp-tabs" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {colState.order.map(key => {
              const meta = COL_META[key];
              const visible = !colState.hidden[key];
              const dragging = dragKey === key;
              return (
                <div key={key} draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragKey(key); }}
                  onDragEnd={() => setDragKey(null)}
                  onDragOver={(e) => { e.preventDefault(); if (dragKey && dragKey !== key) reorder(dragKey, key); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, cursor: 'grab', background: dragging ? 'var(--bg-brand-primary)' : 'transparent', opacity: dragging ? 0.6 : 1 }}>
                  <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0, cursor: 'grab' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg></span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.label}</span>
                  <button type="button" onClick={() => toggleVis(key)} title={visible ? 'Hide column' : 'Show column'} style={{ width: 34, height: 20, borderRadius: 9999, border: 0, cursor: 'pointer', flexShrink: 0, background: visible ? 'var(--color-brand-600)' : 'var(--color-gray-200)', position: 'relative', transition: 'background 140ms' }}>
                    <span style={{ position: 'absolute', top: 2, left: visible ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left 140ms' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Group-by-stage toggle (segmented)
// ============================================================
function GroupToggle({ grouped, setGrouped }) {
  const Item = ({ on, label, onClick }) => (
    <button type="button" onClick={onClick} style={{ height: 28, padding: '0 11px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, border: on ? '1px solid var(--border-secondary)' : '1px solid transparent', background: on ? '#fff' : 'transparent', color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', boxShadow: on ? 'var(--shadow-xs)' : 'none', transition: 'all 120ms' }}>{label}</button>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-quaternary)', whiteSpace: 'nowrap' }}>Group by stage</span>
      <span style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-tertiary)', borderRadius: 9 }}>
        <Item on={grouped} label="On" onClick={() => setGrouped(true)} />
        <Item on={!grouped} label="Off" onClick={() => setGrouped(false)} />
      </span>
    </span>
  );
}

// ============================================================
// Main table view
// ============================================================
function ProjTableView({ cands, onOpen, selected, toggleSel, setSelected, onUnhide, onVote, onOwner, onStage, onCandName, onCandNameCommit, onCandNameCancel, onSeedFromMatch, grouped, collapsed, setCollapsed, colState, chromeSignal, sort, setSort }) {
  // Sort state is lifted to ProjectPage so header-driven sort and toolbar sort share truth.
  // Header click cycles: none → asc → desc → none (returns to the parent's rank order).
  const onSort = (key) => setSort(s => s.key !== key ? { key, dir: 'asc' } : (s.dir === 'asc' ? { key, dir: 'desc' } : { key: null, dir: 'asc' }));

  const cols = colState.order.filter(k => !colState.hidden[k] && !(grouped && k === 'stage'));
  const totalCols = cols.length + 3; // select + name + cols + actions

  // rows with derived projection
  const allRows = cands.map(c => ({ c, r: rowData(c) }));

  // fill remaining viewport height so the table scrolls internally (sticky header + frozen columns)
  const wrapRef = useTBR(null);
  const [vh, setVh] = useTB(480);
  useTBL(() => {
    const calc = () => { if (!wrapRef.current) return; const top = wrapRef.current.getBoundingClientRect().top; setVh(Math.max(320, window.innerHeight - top - 24)); };
    calc();
    const id = requestAnimationFrame(calc);
    window.addEventListener('resize', calc);
    return () => { window.removeEventListener('resize', calc); cancelAnimationFrame(id); };
  }, [chromeSignal, grouped, cols.length]);

  // select-all (over currently shown rows)
  const shownIds = allRows.map(x => x.c.id);
  const selCount = shownIds.filter(id => selected.has(id)).length;
  const allSel = shownIds.length > 0 && selCount === shownIds.length;
  const someSel = selCount > 0 && !allSel;
  const toggleAll = () => setSelected(prev => { const n = new Set(prev); if (allSel) shownIds.forEach(id => n.delete(id)); else shownIds.forEach(id => n.add(id)); return n; });

  const rowProps = { cols, onOpen, onToggle: toggleSel, onUnhide, onVote, onOwner, onStage, onCandName, onCandNameCommit, onCandNameCancel, onSeedFromMatch };

  const header = (
    <thead>
      <tr>
        <th scope="col" style={{ position: 'sticky', top: 0, left: 0, zIndex: 5, width: SELECT_W, height: 40, padding: 0, textAlign: 'center', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-secondary)' }}>
          <RowCheck checked={allSel} indeterminate={someSel} onChange={toggleAll} label="Select all" />
        </th>
        <HeadCell col={{ key: 'name', label: 'Name', sortable: true }} sort={sort} onSort={onSort} style={{ left: SELECT_W, zIndex: 5, width: NAME_W, boxShadow: '4px 0 6px -4px rgba(16,24,40,0.10)' }} />
        {cols.map(k => <HeadCell key={k} col={COL_META[k]} sort={sort} onSort={onSort} style={{ width: COL_META[k].width }} />)}
        <th scope="col" style={{ position: 'sticky', top: 0, right: 0, zIndex: 5, width: 0, padding: 0, background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-secondary)' }} aria-hidden="true" />
      </tr>
    </thead>
  );

  let body;
  if (grouped) {
    const stages = HubData.PROJECT_STAGES.filter(s => allRows.some(x => x.c.stage === s));
    body = (
      <tbody>
        {stages.map(stage => {
          const groupRows = sortRows(allRows.filter(x => x.c.stage === stage), sort);
          const isCol = !!collapsed[stage];
          return (
            <React.Fragment key={stage}>
              <GroupRow stage={stage} count={groupRows.length} collapsed={isCol} totalCols={totalCols} onToggle={() => setCollapsed(s => ({ ...s, [stage]: !s[stage] }))} />
              {!isCol && groupRows.map(({ c }) => <TableRow key={c.id} c={c} selected={selected.has(c.id)} {...rowProps} />)}
            </React.Fragment>
          );
        })}
      </tbody>
    );
  } else {
    const flat = sortRows(allRows, sort);
    body = <tbody>{flat.map(({ c }) => <TableRow key={c.id} c={c} selected={selected.has(c.id)} {...rowProps} />)}</tbody>;
  }

  return (
    <div style={{ padding: '4px 24px 20px' }}>
      <div ref={wrapRef} className="cp-tabs" style={{ height: vh, overflow: 'auto', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: '100%', tableLayout: 'fixed', fontFamily: 'var(--font-body)' }}>
          <colgroup>
            <col style={{ width: SELECT_W }} />
            <col style={{ width: NAME_W }} />
            {cols.map(k => <col key={k} style={{ width: COL_META[k].width }} />)}
            <col style={{ width: 0 }} />
          </colgroup>
          {header}
          {body}
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--fg-quaternary)' }}>
        <span>{cands.length} candidate{cands.length !== 1 ? 's' : ''}</span>
        {selCount > 0 && <><span style={{ color: 'var(--border-primary)' }}>·</span><span style={{ color: 'var(--color-brand-700)', fontWeight: 600 }}>{selCount} selected</span></>}
      </div>
    </div>
  );
}

window.ProjTable = { ProjTableView, ColumnsButton, GroupToggle, loadColState, defaultColState, TABLE_COLUMNS, sortRows, sortVal, rowData };
