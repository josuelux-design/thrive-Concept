// ============================================================
// Thrive TRM — Source Candidates (full-page modal)
//   • Recommended candidates (from search strategy)
//   • Extract from past projects with similar criteria
//   • Actions: add to project (pick stage) / save for later / not a fit
//   • Click a name → profile panel (reuses CandidatePanel) without losing flow
// ============================================================
const { useState: useSrc, useRef: useSrcRef, useEffect: useSrcEff } = React;

// stages a candidate can be added into (active pipeline; "Rejected" is handled by "Not a fit")
const SRC_ADD_STAGES = ['Sourced', 'Screening', 'Hiring Team Interview', 'Offer', 'Hired'];

// reached-stage colour tones
const SRC_STAGE_TONE = {
  'Sourced': { fg: 'var(--color-gray-700)', bg: 'var(--color-gray-100)', dot: 'var(--color-gray-500)' },
  'Screening': { fg: 'var(--color-brand-700)', bg: 'var(--bg-brand-primary)', dot: 'var(--color-brand-500)' },
  'Hiring Team Interview': { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)', dot: 'var(--color-warning-500)' },
  'Offer': { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)', dot: 'var(--color-warning-500)' },
  'Hired': { fg: 'var(--color-success-700)', bg: 'var(--color-success-50)', dot: 'var(--color-success-500)' },
  'Rejected': { fg: 'var(--color-error-700)', bg: 'var(--color-error-50)', dot: 'var(--color-error-500)' }
};

function SrcStageBadge({ stage, prefix }) {
  const t = SRC_STAGE_TONE[stage] || SRC_STAGE_TONE['Sourced'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 11px', borderRadius: 9999, background: t.bg, color: t.fg, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
      {prefix ? <span style={{ fontWeight: 500, opacity: 0.85 }}>{prefix}</span> : null}{stage}
    </span>);

}

function SrcMatchChip({ value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 9999, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ display: 'inline-flex' }}><Icon.Sparkles width={13} height={13} /></span>
      {value}% match
    </span>);

}

// ---- "Add to project" split button with stage dropdown ----
function AddToProjectMenu({ onPick, compact }) {
  const [open, setOpen] = useSrc(false);
  const [hover, setHover] = useSrc(false);
  const [pos, setPos] = useSrc(null);
  const ref = useSrcRef(null);
  const btnRef = useSrcRef(null);
  const place = () => {
    const b = btnRef.current;if (!b) return;
    const r = b.getBoundingClientRect();
    const MENU_H = 280,MENU_W = 232;
    const up = r.bottom + MENU_H > window.innerHeight - 12;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - MENU_W - 12));
    setPos(up ? { left, bottom: window.innerHeight - r.top + 6 } : { left, top: r.bottom + 6 });
  };
  useSrcEff(() => {
    if (!open) return;
    const onDoc = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {document.removeEventListener('mousedown', onDoc);window.removeEventListener('scroll', onMove, true);window.removeEventListener('resize', onMove);};
  }, [open]);
  const toggle = () => {if (!open) place();setOpen((o) => !o);};
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button ref={btnRef} type="button" onClick={toggle}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 14px',
        borderRadius: 9, border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
        background: hover || open ? 'var(--bg-brand-solid-hover)' : 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)',
        boxShadow: 'var(--shadow-skeu)', transition: 'background 120ms ease-out'
      }}>
        <Icon.Plus width={17} height={17} /> Add to project
        <Icon.ChevronDown width={15} height={15} style={{ opacity: 0.85 }} />
      </button>
      {open && pos &&
      <div style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, zIndex: 130, minWidth: 232, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 11, boxShadow: 'var(--shadow-lg)', padding: 6 }}>
          <div style={{ padding: '6px 10px 8px', fontSize: 12, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add to stage</div>
          {SRC_ADD_STAGES.map((s) => {
          const t = SRC_STAGE_TONE[s];
          return (
            <button key={s} type="button" onClick={() => {setOpen(false);onPick(s);}}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', border: 0, background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', textAlign: 'left' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                {s}
              </button>);

        })}
        </div>
      }
    </div>);

}

// ---- ghost text/icon action button ----
function SrcGhostBtn({ icon, label, onClick, danger }) {
  const [h, setH] = useSrc(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 12px', borderRadius: 9,
      border: '1px solid var(--border-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
      background: h ? 'var(--bg-primary-hover)' : '#fff',
      color: danger ? 'var(--color-error-600)' : 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)', transition: 'background 120ms ease-out'
    }}>
      {React.cloneElement(icon, { width: 17, height: 17 })} {label}
    </button>);

}

// ---- candidate result card ----
// ---- match dots (1-5, tier-colored) ----
const srcDots = (m) => Math.max(1, Math.min(5, Math.round(m / 20)));
const srcTier = (m) => m >= 80 ? 'high' : m >= 65 ? 'mid' : 'low';
const SRC_DOT_COLOR = { high: 'var(--color-success-600)', mid: 'var(--color-warning-600)', low: 'var(--color-gray-400)' };
function SrcMatchDots({ score }) {
  const n = srcDots(score);const color = SRC_DOT_COLOR[srcTier(score)];
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i <= n ? color : 'var(--color-gray-200)' }} />)}
    </span>);

}
function SrcGreenChip({ icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 20, padding: '0 8px', borderRadius: 9999, border: '1px solid var(--color-success-100)', background: 'var(--color-success-50)', color: 'var(--color-success-700)', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1 }}>
      <span style={{ display: 'inline-flex', color: 'var(--color-success-600)', opacity: 0.85 }}>{icon}</span>{children}
    </span>);

}
const SrcTargetIcon = (p) => <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg>;
const SrcClockIcon = (p) => <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
const SrcLinkedIn = () => <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}><rect width="24" height="24" rx="3" fill="#0A66C2" /><path fill="#fff" d="M7.6 9.7H4.9V19h2.7V9.7Zm.2-2.8a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0ZM19 19h-2.7v-4.6c0-1.1-.4-1.9-1.4-1.9-.8 0-1.2.5-1.4 1-.1.2-.1.4-.1.7V19H10.7s.03-7.6 0-9.3h2.7v1.3a2.7 2.7 0 0 1 2.5-1.4c1.8 0 3.2 1.2 3.2 3.7V19Z" /></svg>;

// ---- candidate result card (profile | match two-panel + action footer) ----
function SrcCard({ c, ctx, sourceProject, bucket, onAdd, onSave, onNotFit, onRestore, onOpenProfile }) {
  const { HubAvatar } = HubUI;
  const [h, setH] = useSrc(false);
  const loc = [c.city, c.region].filter(Boolean).join(', ') || c.country || 'Unknown location';
  const isPast = ctx === 'past' || !!sourceProject;
  const rt = SRC_STAGE_TONE[c.reached] || SRC_STAGE_TONE['Sourced'];
  const [exiting, setExiting] = useSrc(false);
  // Fade + collapse the card before the parent removes it from the list.
  const act = (fn) => {if (exiting) return;setExiting(true);setTimeout(fn, 320);};
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, overflow: 'hidden', boxShadow: h ? 'var(--shadow-sm)' : 'var(--shadow-xs)', transition: 'opacity 280ms ease, transform 280ms ease, margin 320ms ease 60ms, max-height 320ms ease 60ms, box-shadow 150ms ease-out', opacity: exiting ? 0 : 1, transform: exiting ? 'translateX(12px)' : 'none', maxHeight: exiting ? 0 : 1200, pointerEvents: exiting ? 'none' : 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Profile */}
        <div style={{ display: 'flex', gap: 14, padding: 16, minWidth: 0 }}>
          <HubAvatar name={c.name} size={44} ring={!!(c.offLimits || c.flag)} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span onClick={() => onOpenProfile(c.id)} style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-700)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-primary)'}>{c.name}</span>
              <a href="#" onClick={(e) => e.preventDefault()} title={`${c.name} on LinkedIn`} style={{ display: 'inline-flex', flexShrink: 0 }}><SrcLinkedIn /></a>
              {c.eye && <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.EyeOff width={15} height={15} /></span>}
              {c.offLimits && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-error-700)', background: 'var(--bg-error-primary)', borderRadius: 9999, padding: '2px 8px' }}><Icon.Flag width={11} height={11} />Off-limits</span>}
            </div>
            <div style={{ fontSize: 14, marginTop: 3 }}>
              <span style={{ color: 'var(--fg-primary)', fontWeight: 500 }}>{c.title}</span>
              <span style={{ color: 'var(--border-primary)', margin: '0 6px' }}>·</span>
              <span style={{ color: 'var(--fg-tertiary)' }}>{c.company}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 3 }}>{loc}</div>
            {c.priorRoles && c.priorRoles.length ?
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {c.priorRoles.map((r, i) =>
              <div key={i} style={{ fontSize: 13, lineHeight: '18px', color: 'var(--fg-primary)' }}>
                    <span style={{ fontWeight: 600 }}>{r.title} at {r.company}</span> <span style={{ color: 'var(--fg-tertiary)' }}>({r.dates})</span>
                  </div>
              )}
              </div> :

            <div style={{ marginTop: 10, fontSize: 13, fontStyle: 'italic', color: 'var(--fg-quaternary)' }}>No prior experience listed</div>
            }
          </div>
        </div>
        {/* Match */}
        <div style={{ background: '#F9F7F5', borderLeft: '1px solid var(--border-secondary)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>Match</span>
            <SrcMatchDots score={c.match} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', whiteSpace: 'nowrap', flexShrink: 0 }}>Target co.</span>
            <SrcGreenChip icon={<SrcTargetIcon />}>{c.company}</SrcGreenChip>
            {isPast && <SrcGreenChip icon={<SrcClockIcon />}>Past project</SrcGreenChip>}
          </div>
          {isPast && c.reached ?
          <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              Reached
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 9999, background: rt.bg, color: rt.fg, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: rt.dot }} />{c.reached}</span>
              {sourceProject ? <span>· {sourceProject.name}</span> : null}
            </div> :
          null}
          <ul style={{ listStyle: 'none', margin: '2px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.matchReasons.map((r, i) =>
            <li key={i} style={{ position: 'relative', paddingLeft: 14, fontSize: 13, lineHeight: '18px', color: 'var(--fg-secondary)' }}>
                <span style={{ position: 'absolute', left: 2, top: 7, width: 4, height: 4, borderRadius: '50%', background: 'var(--color-gray-400)' }} />{r}
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '12px 16px', borderTop: '1px solid var(--border-secondary)', background: '#fff' }}>
        <AddToProjectMenu onPick={(stage) => act(() => onAdd(stage))} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {bucket ?
          <SrcGhostBtn icon={<Icon.ChevronLeft />} label="Move back to results" onClick={() => act(onRestore)} /> :

          <React.Fragment>
              <SrcGhostBtn icon={<Icon.Bookmark />} label="Save for later" onClick={() => act(onSave)} />
              <SrcGhostBtn icon={<Icon.Ban />} label="Not a fit" onClick={() => act(onNotFit)} danger />
            </React.Fragment>
          }
        </div>
      </div>
    </div>);

}

// ---- left-rail nav item ----
function SrcNavItem({ icon, label, count, active, onClick }) {
  const [h, setH] = useSrc(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{
      display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px', borderRadius: 8, border: 0, cursor: 'pointer',
      background: active ? 'var(--bg-brand-primary)' : h ? 'var(--bg-primary-hover)' : 'transparent',
      fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'background 120ms ease-out'
    }}>
      <span style={{ color: active ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0 }}>{React.cloneElement(icon, { width: 18, height: 18 })}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 600 : 500, color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
      {count != null && <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--color-brand-700)' : 'var(--fg-quaternary)', background: active ? '#fff' : 'var(--bg-tertiary)', borderRadius: 9999, padding: '1px 8px', minWidth: 22, textAlign: 'center' }}>{count}</span>}
    </button>);

}

// ---- past-project selector chip ----
function SrcProjectChip({ p, selected, onToggle }) {
  const [h, setH] = useSrc(false);
  return (
    <button type="button" onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%', padding: 14, borderRadius: 11, cursor: 'pointer',
      background: selected ? 'var(--bg-brand-primary)' : h ? 'var(--bg-primary-hover)' : '#fff',
      border: `1px solid ${selected ? 'var(--border-brand-solid)' : 'var(--border-secondary)'}`,
      fontFamily: 'var(--font-body)', transition: 'background 120ms, border-color 120ms', boxShadow: 'var(--shadow-xs)'
    }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${selected ? 'var(--color-brand-600)' : 'var(--border-primary)'}`, background: selected ? 'var(--color-brand-600)' : '#fff', color: '#fff' }}>
        {selected && <Icon.Check width={13} height={13} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{p.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 13, color: 'var(--fg-quaternary)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Building width={13} height={13} />{p.company}</span>
          <span style={{ color: 'var(--border-primary)' }}>•</span>
          <span>{p.closed}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: p.similarity === 'High' ? 'var(--color-success-700)' : 'var(--fg-tertiary)', background: p.similarity === 'High' ? 'var(--color-success-50)' : 'var(--bg-tertiary)', borderRadius: 9999, padding: '1px 8px' }}>{p.similarity} similarity</span>
          <span>· {p.candidates.length} candidates</span>
        </span>
      </span>
    </button>);

}

// ---- section header for the main area ----
function SrcSectionHead({ title, caption, count }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>{title}</h2>
        {count != null && <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-quaternary)' }}>{count}</span>}
      </div>
      {caption && <p style={{ margin: '5px 0 0', fontSize: 15, color: 'var(--fg-quaternary)' }}>{caption}</p>}
    </div>);

}

function SrcEmpty({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 20px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{React.cloneElement(icon, { width: 28, height: 28 })}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: '21px', color: 'var(--fg-tertiary)', maxWidth: 360 }}>{body}</div>
    </div>);

}

// ---- filter dropdown (multi-select checkboxes, or single-select radio) ----
function SrcFilter({ label, icon, options, value, onChange, multi = true }) {
  const [open, setOpen] = useSrc(false);
  const ref = useSrcRef(null);
  useSrcEff(() => {
    if (!open) return;
    const f = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open]);
  const sel = multi ? value : value ? [value] : [];
  const active = sel.length > 0;
  const toggle = (o) => {
    if (multi) onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);else
    {onChange(value === o ? '' : o);setOpen(false);}
  };
  const triggerLabel = multi ? label : value || label;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 11px', borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
        border: `1px solid ${active ? 'var(--border-brand-solid)' : 'var(--border-primary)'}`,
        background: active ? 'var(--bg-brand-primary)' : '#fff',
        color: active ? 'var(--color-brand-700)' : 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)'
      }}>
        {React.cloneElement(icon, { width: 16, height: 16 })}
        {triggerLabel}
        {multi && active && <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: 'var(--color-brand-600)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{sel.length}</span>}
        <Icon.ChevronDown width={15} height={15} style={{ opacity: 0.7 }} />
      </button>
      {open &&
      <div style={{ position: 'absolute', left: 0, top: 'calc(100% + 6px)', zIndex: 40, minWidth: 220, maxHeight: 300, overflowY: 'auto', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 11, boxShadow: 'var(--shadow-lg)', padding: 6 }}>
          {options.length === 0 && <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--fg-quaternary)' }}>No options</div>}
          {options.map((o) => {
          const on = multi ? value.includes(o) : value === o;
          return (
            <button key={o} type="button" onClick={() => toggle(o)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', border: 0, background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', textAlign: 'left' }}>
                <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: multi ? 5 : '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${on ? 'var(--color-brand-600)' : 'var(--border-primary)'}`, background: on ? 'var(--color-brand-600)' : '#fff', color: '#fff' }}>
                  {on && (multi ? <Icon.Check width={12} height={12} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />)}
                </span>
                {o}
              </button>);

        })}
        </div>
      }
    </div>);

}

// ---- search & add more past searches ----
function SrcProjectSearch({ pool, onAdd }) {
  const [q, setQ] = useSrc('');
  const [open, setOpen] = useSrc(false);
  const ref = useSrcRef(null);
  useSrcEff(() => {
    if (!open) return;
    const f = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open]);
  const ql = q.trim().toLowerCase();
  const matches = pool.filter((p) => !ql || p.name.toLowerCase().includes(ql) || p.company.toLowerCase().includes(ql));
  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 26 }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', display: 'inline-flex', pointerEvents: 'none' }}><Icon.Search width={18} height={18} /></span>
        <input value={q} onChange={(e) => {setQ(e.target.value);setOpen(true);}} onFocus={() => setOpen(true)}
        placeholder="Search and add more past searches…"
        style={{ width: '100%', boxSizing: 'border-box', height: 44, padding: '0 14px 0 40px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: `1px solid ${open ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 10, outline: 'none', boxShadow: open ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
      </div>
      {open &&
      <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 40, maxHeight: 320, overflowY: 'auto', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 11, boxShadow: 'var(--shadow-lg)', padding: 6 }}>
          {pool.length === 0 ?
        <div style={{ padding: '14px 12px', fontSize: 14, color: 'var(--fg-quaternary)' }}>All available past searches have been added.</div> :
        matches.length === 0 ?
        <div style={{ padding: '14px 12px', fontSize: 14, color: 'var(--fg-quaternary)' }}>No past searches match “{q}”.</div> :
        matches.map((p) =>
        <button key={p.id} type="button" onClick={() => {onAdd(p);setQ('');setOpen(false);}}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 10px', border: 0, background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Briefcase width={18} height={18} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.company} · {p.closed} · {p.similarity} similarity · {p.candidates.length} candidates</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 8, padding: '5px 10px' }}><Icon.Plus width={14} height={14} /> Add</span>
            </button>
        )}
        </div>
      }
    </div>);

}

// ============================================================
// Main modal
// ============================================================
// [spine] role: shell · name: dialogShell · surface: modal
// Full-screen "Source candidates" dialog (scrim + centered container). Variance: high.
// Owns dialogTitle + dialogContent; no dialogActions footer on this dialog — intentionally omitted.
function SourceCandidatesModal({ onClose }) {
  const data = HubData.SOURCING;
  const project = HubData.PROJECT;
  const SRC_LS = 'thrive-src-modal-v1';
  const saved0 = React.useMemo(() => {try {return JSON.parse(localStorage.getItem(SRC_LS)) || {};} catch (e) {return {};}}, []);
  const [mode, setMode] = useSrc(saved0.mode || 'recommended'); // recommended | past | saved | notfit
  const [status, setStatus] = useSrc(saved0.status || {}); // id -> 'added' | 'saved' | 'notfit'
  const [selectedPP, setSelectedPP] = useSrc(saved0.selectedPP || [data.pastProjects[0].id]);
  const [profileId, setProfileId] = useSrc(null);
  const [addedProjects, setAddedProjects] = useSrc(saved0.addedProjects || []);
  // past-projects filters
  const [fLocations, setFLocations] = useSrc(saved0.fLocations || []);
  const [fMinStage, setFMinStage] = useSrc(saved0.fMinStage || '');
  const [fReasons, setFReasons] = useSrc(saved0.fReasons || []);
  const [fCompanies, setFCompanies] = useSrc(saved0.fCompanies || []);
  // Persist the whole working state so reopening the modal restores results + filters.
  useSrcEff(() => {
    try {localStorage.setItem(SRC_LS, JSON.stringify({ mode, status, selectedPP, addedProjects, fLocations, fMinStage, fReasons, fCompanies }));} catch (e) {}
  }, [mode, status, selectedPP, addedProjects, fLocations, fMinStage, fReasons, fCompanies]);

  // index every candidate by id + remember its source project (for past candidates)
  const allPastProjects = [...data.pastProjects, ...addedProjects];
  const byId = {};
  const projectOf = {};
  data.recommended.forEach((c) => {byId[c.id] = c;});
  allPastProjects.forEach((p) => p.candidates.forEach((c) => {byId[c.id] = c;projectOf[c.id] = p;}));
  const allCands = [...data.recommended, ...allPastProjects.flatMap((p) => p.candidates)];

  const recResults = data.recommended.filter((c) => !status[c.id]);
  const pastSource = allPastProjects.filter((p) => selectedPP.includes(p.id)).flatMap((p) => p.candidates);
  // filter options + predicate for past-projects mode
  const locOpts = [...new Set(pastSource.map((c) => c.country).filter(Boolean))].sort();
  const reasonOpts = [...new Set(pastSource.map((c) => c.rejectionReason).filter(Boolean))].sort();
  const coOpts = [...new Set(pastSource.flatMap((c) => c.companies || [c.company]).filter(Boolean))].sort();
  const anyFilter = fLocations.length || fMinStage || fReasons.length || fCompanies.length;
  const clearFilters = () => {setFLocations([]);setFMinStage('');setFReasons([]);setFCompanies([]);};
  const passesFilters = (c) => {
    if (fLocations.length && !fLocations.includes(c.country)) return false;
    if (fMinStage) {const idx = SRC_ADD_STAGES.indexOf(c.reached);if (idx < SRC_ADD_STAGES.indexOf(fMinStage)) return false;}
    if (fReasons.length && !fReasons.includes(c.rejectionReason)) return false;
    if (fCompanies.length && !(c.companies || [c.company]).some((co) => fCompanies.includes(co))) return false;
    return true;
  };
  const pastResults = pastSource.filter((c) => !status[c.id] && passesFilters(c));
  const savedList = allCands.filter((c) => status[c.id] === 'saved');
  const notfitList = allCands.filter((c) => status[c.id] === 'notfit');

  const setStat = (id, val) => setStatus((s) => ({ ...s, [id]: val }));

  const addToProject = (c, stage) => {
    const newId = 'src-' + c.id;
    if (!HubData.CANDIDATES.some((x) => x.id === newId)) {
      HubData.CANDIDATES.push({
        id: newId, stage, name: c.name, title: c.title, company: c.company,
        city: c.city, region: c.region, country: c.country,
        flag: false, eye: false, tags: [], up: 0, down: 0, owner: 'AZ',
        note: null, startDate: '', scorecards: null, experience: c.experience
      });
    }
    setStat(c.id, 'added');
    HubUI.showHubToast({ title: 'Added to project', message: `${c.name} was added to the ${stage} stage of ${project.name}.` });
  };

  const cardFor = (c, ctx) => {
    const pp = projectOf[c.id];
    const bucket = status[c.id] === 'saved' ? 'saved' : status[c.id] === 'notfit' ? 'notfit' : null;
    return (
      <SrcCard key={c.id} c={c} ctx={ctx} sourceProject={pp} bucket={bucket}
      onAdd={(stage) => addToProject(c, stage)}
      onSave={() => setStat(c.id, 'saved')}
      onNotFit={() => setStat(c.id, 'notfit')}
      onRestore={() => setStat(c.id, undefined)}
      onOpenProfile={setProfileId} />);

  };

  const NAV = [
  { id: 'recommended', icon: <Icon.Sparkles />, label: 'Recommended', count: recResults.length },
  { id: 'past', icon: <Icon.Briefcase />, label: 'Past projects', count: pastResults.length }];


  let body;
  if (mode === 'recommended') {
    body =
    <React.Fragment>
        <SrcSectionHead title="Recommended candidates" count={`${recResults.length} results`} caption={`Generated from ${project.name}'s strategy and ideal candidate profile.`} />
        {recResults.length ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{recResults.map((c) => cardFor(c, 'recommended'))}</div> :
      <SrcEmpty icon={<Icon.Sparkles />} title="No more recommendations" body="You've actioned every recommended candidate. Check Saved for later or pull from past projects." />}
      </React.Fragment>;

  } else if (mode === 'past') {
    body =
    <React.Fragment>
        <SrcSectionHead title="Pull from past projects" caption="Select past searches with similar criteria to extract their candidates." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
          {allPastProjects.map((p) =>
        <SrcProjectChip key={p.id} p={p} selected={selectedPP.includes(p.id)}
        onToggle={() => setSelectedPP((arr) => arr.includes(p.id) ? arr.filter((x) => x !== p.id) : [...arr, p.id])} />
        )}
        </div>
        <SrcProjectSearch
        pool={data.morePastProjects.filter((mp) => !allPastProjects.some((p) => p.id === mp.id))}
        onAdd={(proj) => {setAddedProjects((arr) => [...arr, proj]);setSelectedPP((arr) => arr.includes(proj.id) ? arr : [...arr, proj.id]);}} />
        {selectedPP.length === 0 ?
      <SrcEmpty icon={<Icon.Briefcase />} title="Select past searches above" body="Choose one or more past searches to see the candidates who were considered for them." /> :

      <React.Fragment>
            {/* filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 2 }}>Filter</span>
              <SrcFilter label="Location" icon={<Icon.Globe />} options={locOpts} value={fLocations} onChange={setFLocations} />
              <SrcFilter label="Min. stage reached" icon={<Icon.Trending />} options={SRC_ADD_STAGES} value={fMinStage} onChange={setFMinStage} multi={false} />
              <SrcFilter label="Rejection reason" icon={<Icon.Ban />} options={reasonOpts} value={fReasons} onChange={setFReasons} />
              <SrcFilter label="Company" icon={<Icon.Building />} options={coOpts} value={fCompanies} onChange={setFCompanies} />
              {anyFilter ? <button type="button" onClick={clearFilters} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)' }}>Clear all</button> : null}
            </div>
            {pastResults.length ?
        <React.Fragment>
                <SrcSectionHead title="Candidates" count={`${pastResults.length} from ${selectedPP.length} ${selectedPP.length === 1 ? 'search' : 'searches'}`} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{pastResults.map((c) => cardFor(c, 'past'))}</div>
              </React.Fragment> :
        anyFilter ?
        <SrcEmpty icon={<Icon.Funnel />} title="No candidates match these filters" body={<span>Try widening your criteria or <button type="button" onClick={clearFilters} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)' }}>clear all filters</button>.</span>} /> :

        <SrcEmpty icon={<Icon.Check />} title="All candidates actioned" body="Every candidate from the selected searches has been added or set aside." />
        }
          </React.Fragment>
      }
      </React.Fragment>;

  } else if (mode === 'saved') {
    body =
    <React.Fragment>
        <SrcSectionHead title="Saved for later" count={`${savedList.length} candidates`} caption="Candidates you've set aside to revisit. They stay out of your active results." />
        {savedList.length ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{savedList.map((c) => cardFor(c, projectOf[c.id] ? 'past' : 'recommended'))}</div> :
      <SrcEmpty icon={<Icon.Bookmark />} title="Nothing saved yet" body="Use “Save for later” on a candidate to park them here without adding them to the project." />}
      </React.Fragment>;

  } else {
    body =
    <React.Fragment>
        <SrcSectionHead title="Not a fit" count={`${notfitList.length} candidates`} caption="Candidates you've ruled out. Move any back to results if you change your mind." />
        {notfitList.length ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{notfitList.map((c) => cardFor(c, projectOf[c.id] ? 'past' : 'recommended'))}</div> :
      <SrcEmpty icon={<Icon.Ban />} title="Nothing here" body="Candidates you mark as “Not a fit” are moved here and off your results list." />}
      </React.Fragment>;

  }

  const profile = profileId ? byId[profileId] : null;

  return (
    <div data-spine-role="shell" data-spine-name="dialogShell" data-spine-surface="modal" onMouseDown={(e) => {if (e.target === e.currentTarget) onClose();}} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(10,13,18,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 'min(1240px, 100%)', height: 'min(900px, 100%)', background: 'var(--bg-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* header */}
        {/* [spine] role: header · name: dialogTitle · surface: modal — dialog title + close */}
        <div data-spine-role="header" data-spine-name="dialogTitle" data-spine-surface="modal" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: '#fff', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.UserPlus width={19} height={19} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>Source candidates</h1>
            <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 1 }}>for <span style={{ color: 'var(--fg-secondary)', fontWeight: 500 }}>{project.name}</span> · {project.company}</div>
          </div>
          <button type="button" onClick={onClose} title="Close"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          style={{ width: 34, height: 34, borderRadius: 9, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}><Icon.X width={20} height={20} /></button>
        </div>

        {/* body: rail + main */}
        {/* [spine] role: body · name: dialogContent · surface: modal — mode rail + results. dialogActions footer intentionally absent. */}
        <div data-spine-role="body" data-spine-name="dialogContent" data-spine-surface="modal" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          {/* left rail */}
          <nav style={{ width: 194, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border-secondary)', padding: 10, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
            <div style={{ padding: '4px 10px 4px', fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Find</div>
            {NAV.map((n) => <SrcNavItem key={n.id} icon={n.icon} label={n.label} count={n.count} active={mode === n.id} onClick={() => setMode(n.id)} />)}
            <div style={{ height: 1, background: 'var(--border-secondary)', margin: '8px 8px' }} />
            <div style={{ padding: '4px 10px 4px', fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Set aside</div>
            <SrcNavItem icon={<Icon.Bookmark />} label="Saved for later" count={savedList.length} active={mode === 'saved'} onClick={() => setMode('saved')} />
            <SrcNavItem icon={<Icon.Ban />} label="Not a fit" count={notfitList.length} active={mode === 'notfit'} onClick={() => setMode('notfit')} />
          </nav>

          {/* main */}
          <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 28px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>{body}</div>
          </div>
        </div>
      </div>

      {/* profile panel — opens on top, modal stays open underneath */}
      {profile &&
      <CandidatePanel candidate={profile} index={0} total={1} onPrev={() => {}} onNext={() => {}} onClose={() => setProfileId(null)} />
      }
    </div>);

}

window.SourceCandidatesModal = SourceCandidatesModal;