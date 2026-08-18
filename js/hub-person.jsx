// ============================================================
// Thrive TRM — Person profile (full page)
// ============================================================
// Layout inspired by the Tailwind UI "Detail" screens:
//  · breadcrumb bar (People > Name)
//  · person header (avatar + identity + contact bar + primary actions)
//  · main grid: left sidebar nav (grouped) · main content · right meta/activity sidebar
//
// Priority items (Overview / Experience / Off-Limits) merge into a single
// "Who they are" section. Everything else (Projects & Lists, Recent activity,
// Scorecards & Notes, Network) is its own nav destination.
// ============================================================
const { useState: usePS } = React;

const PERSON_IDX_KEY = 'thrive-person-idx';
const NEW_PERSON_KEY = 'thrive-new-person';

// ---- deterministic contact info (reuses candContact from the panel module) ----
function personContact(p) {
  const fn = (window.CandParts && window.CandParts.candContact) || null;
  return fn ? fn(p) : { email: '', phone: '', linkedin: '', resume: '' };
}

// ---- ContactBar (reused from candidate panel) ----
function PersonContactBar({ p }) {
  const CandContactBar = window.CandParts && window.CandParts.CandContactBar;
  if (!CandContactBar) return null;
  return <CandContactBar c={p} />;
}

// ---- shared section shell — matches the Tailwind detail-panel look ----
function PSection({ id, title, subtitle, right, children, sub }) {
  return (
    <section id={id} style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, boxShadow: 'var(--shadow-xs)', padding: '24px 26px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: subtitle ? 4 : 14 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: sub ? 16 : 18, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</h3>
          {subtitle && <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--fg-quaternary)' }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {subtitle && <div style={{ height: 14 }} />}
      {children}
    </section>
  );
}

// ---- meta row inside sidebar ----
function PMetaRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
      <span style={{ flexShrink: 0, width: 96, fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{label}</span>
      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
    </div>
  );
}

// ---- Activity row (mirrors ActivityRow from ProjectDetailsView) ----
function PActivityRow({ bullet, who, what, when }) {
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
// Breadcrumb
// ============================================================
function PersonBreadcrumb({ p, onBack }) {
  const { HubLink } = HubUI;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#fff', borderBottom: '1px solid var(--border-secondary)' }}>
      <button type="button" onClick={onBack} title="Back to People"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 10px 0 6px', border: '1px solid var(--border-primary)', borderRadius: 7, background: '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
        <Icon.ChevronLeft width={15} height={15} /> Back
      </button>
      <span style={{ width: 1, height: 20, background: 'var(--border-secondary)' }} />
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
        <span onClick={onBack} style={{ cursor: 'pointer', display: 'inline-flex' }}>
          <HubLink size={13.5} weight={500}>People</HubLink>
        </span>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronRight width={14} height={14} /></span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
      </nav>
    </div>
  );
}

// ============================================================
// Header — avatar + identity + contact + primary actions
// ============================================================
function PersonHeader({ p }) {
  const { HubAvatar, HubLink, HubColorTag } = HubUI;
  const CandPill = window.CandParts && window.CandParts.CandPill;
  const olLabel = p.offLimits ? (typeof p.offLimits === 'string' ? p.offLimits : 'Off Limits') : (p.flag ? 'Off Limits' : null);
  const loc = [p.city, p.region, p.country].filter(Boolean).join(', ');
  return (
    <div style={{ background: '#fff', padding: '24px 32px', borderBottom: '1px solid var(--border-secondary)' }}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
        <HubAvatar name={p.name} size={80} ring={!!(p.offLimits || p.flag)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: 'var(--fg-primary)' }}>{p.name}</h1>
            {olLabel && CandPill && <CandPill tone="red"><Icon.Flag width={13} height={13} /> {olLabel}</CandPill>}
            {p.inProject && CandPill && <CandPill tone="blue"><Icon.Briefcase width={13} height={13} /> In Project</CandPill>}
          </div>
          {p.title && <div style={{ marginTop: 6, fontSize: 15, fontWeight: 500, color: 'var(--fg-primary)' }}>{p.title}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
            {p.company && <HubLink size={14} weight={500}>{p.company}</HubLink>}
            {loc && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--fg-quaternary)' }}>
                <Icon.MapPin width={14} height={14} /> {loc}
              </span>
            )}
          </div>
          {p.tags && p.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {p.tags.map((t, i) => typeof t === 'string' ? <HubColorTag key={i} label={t} /> : <HubColorTag key={i} label={t.label} color={t.color} />)}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <PersonContactBar p={p} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <PActionBtn icon={<Icon.AddProject />} label="Add to project" />
          <PActionBtn icon={<Icon.AddList />} label="Add to list" />
          <PActionBtn icon={<Icon.Edit />} label="Edit" primary />
        </div>
      </div>
    </div>
  );
}

function PActionBtn({ icon, label, primary }) {
  const [h, setH] = usePS(false);
  return (
    <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8,
        border: primary ? 0 : `1px solid var(--border-primary)`, cursor: 'pointer',
        background: primary ? (h ? 'var(--bg-brand-solid-hover)' : 'var(--bg-brand-solid)') : (h ? 'var(--bg-primary-hover)' : '#fff'),
        color: primary ? 'var(--fg-on-brand)' : 'var(--fg-secondary)',
        boxShadow: primary ? 'var(--shadow-skeu)' : 'var(--shadow-xs)',
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 120ms',
      }}>
      {React.cloneElement(icon, { width: 16, height: 16 })}{label}
    </button>
  );
}

// ============================================================
// Left sidebar nav
// ============================================================
function PersonSideNav({ active, setActive }) {
  const groups = [
    { title: 'Who they are', items: [{ id: 'overview', label: 'Overview', icon: <Icon.User /> }] },
    { title: 'More', items: [
      { id: 'projects',   label: 'Projects & Lists',   icon: <Icon.Briefcase /> },
      { id: 'activity',   label: 'Team activity',      icon: <Icon.Clock /> },
      { id: 'scorecards', label: 'Scorecards',         icon: <Icon.Star /> },
      { id: 'network',    label: 'Network',            icon: <Icon.Network /> },
    ] },
  ];
  return (
    <nav aria-label="Person sections" style={{ position: 'sticky', top: 20, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map(g => (
        <div key={g.title}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', padding: '0 12px 6px' }}>{g.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {g.items.map(it => <PNavItem key={it.id} item={it} active={active === it.id} onClick={() => setActive(it.id)} />)}
          </div>
        </div>
      ))}
    </nav>
  );
}

function PNavItem({ item, active, onClick }) {
  const [h, setH] = usePS(false);
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
      {item.label}
    </button>
  );
}

// ============================================================
// Right meta/activity sidebar
// ============================================================
function PersonMetaSidebar({ p }) {
  const { HubAvatar } = HubUI;
  const loc = [p.city, p.region, p.country].filter(Boolean).join(', ') || 'Unknown';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', marginBottom: 6 }}>Owner</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>AZ</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>Angela Zhou</div>
            <div style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>Recruiter · Thrive TRM</div>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px -18px' }} />
        <PMetaRow label="Location">{loc}</PMetaRow>
        {p.company && <PMetaRow label="Company">{p.company}</PMetaRow>}
        {p.title && <PMetaRow label="Title">{p.title}</PMetaRow>}
        <PMetaRow label="Off limits">{p.offLimits ? (typeof p.offLimits === 'string' ? p.offLimits : 'Off Limits') : 'No'}</PMetaRow>
        <PMetaRow label="Added">Feb 12, 2026</PMetaRow>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 10 }}>Latest activity</div>
        <PActivityRow bullet="brand" who="Angela Zhou" what={`added ${p.name} to Chief Product Officer.`} when="3d ago" />
        <PActivityRow bullet="dot" who="Marcus Ford" what={`sent an outreach.`} when="6d ago" />
        <PActivityRow bullet="dot" who="Angela Zhou" what={`left a note.`} when="9d ago" />
      </div>
    </div>
  );
}

// ============================================================
// Section renderers — merge Overview + Experience + Off-Limits into "Who they are"
// ============================================================
function personToCandidate(p) {
  // Provide the shape CandExperience / CandOffLimits / CandOverview expect.
  return {
    id: p.id || `person-${p.name}`,
    stage: p.inProjectStage || p.stage || 'Research',
    name: p.name, title: p.title || '', company: p.company || '',
    city: p.city || '', region: p.region || '', country: p.country || '',
    flag: !!p.flag, eye: !!p.eye,
    offLimits: p.offLimits || null,
    inProject: !!p.inProject,
    tags: (p.tags || []).map(t => typeof t === 'string' ? { label: t, color: 'gray' } : t),
    up: p.up || 0, down: p.down || 0,
    owner: p.owner || 'AZ', note: p.note || null,
    startDate: p.startDate || '', comp: p.comp || null,
    scorecards: p.scorecards || null,
    experience: p.experience || [],
  };
}

function SectionOverview({ p, onOpenActivity }) {
  const c = personToCandidate(p);
  const CandOverview = window.CandParts && window.CandParts.CandOverview;
  const CandExperience = window.CandParts && window.CandParts.CandExperience;
  const CandOffLimits = window.CandParts && window.CandParts.CandOffLimits;
  const LatestInteractionsPreview = window.CandParts && window.CandParts.LatestInteractionsPreview;
  // ctx mimics the side-panel ctx shape so CandOverview's embedded preview can also
  // route "View all activity" back to the person Activity section on this page.
  const ctx = { selectTab: (name) => (name === 'Recent activity') && onOpenActivity && onOpenActivity() };
  return (
    <React.Fragment>
      {/* Team interactions preview — always the first thing under Overview, as on the side panel */}
      {LatestInteractionsPreview && (
        <PSection id="team-activity" title="Team activity" subtitle={`What the team has done and said about ${(p.name || '').split(' ')[0] || 'this person'} — read this before you outreach.`}>
          <LatestInteractionsPreview c={c} onOpenAll={onOpenActivity} />
        </PSection>
      )}
      <PSection id="overview" title="Overview" subtitle="Snapshot of who this person is — role, location, contact, and what's active on their record.">
        {CandOverview ? <CandOverview c={c} ctx={ctx} /> : <p>Overview unavailable</p>}
      </PSection>
      <PSection id="experience" title="Experience" subtitle="Career history, roles, and tenure across companies.">
        {CandExperience ? <CandExperience c={c} /> : <p>Experience unavailable</p>}
      </PSection>
      <PSection id="off-limits" title="Off-Limits" subtitle="Active restrictions and prior blocks that affect outreach.">
        {CandOffLimits ? <CandOffLimits c={c} /> : <p>No off-limits data</p>}
      </PSection>
    </React.Fragment>
  );
}

function SectionProjectsLists({ p }) {
  const c = personToCandidate(p);
  const CandProjects = window.CandParts && window.CandParts.CandProjects;
  return (
    <PSection id="projects" title="Projects & Lists" subtitle="Everywhere this person is being actively considered.">
      {CandProjects ? <CandProjects c={c} /> : <p>No project data</p>}
    </PSection>
  );
}

// Team activity for the full-page profile — reuses the same unified feed the
// side panel uses, so recruiters get the identical mental model in both places.
function SectionActivity({ p }) {
  const c = personToCandidate(p);
  const CandRecentActivity = window.CandParts && window.CandParts.CandRecentActivity;
  return (
    <PSection id="activity" title="Team activity" subtitle="Every note, outreach, scorecard, and stage change on this record across the team.">
      {CandRecentActivity ? <CandRecentActivity c={c} /> : <p>Activity feed unavailable</p>}
    </PSection>
  );
}

// Notes are now part of the unified Team activity feed above — the dedicated
// Notes section is intentionally removed to avoid a duplicate second copy of
// the same content. Deep-drill on scorecards stays as its own section.
function SectionScorecards({ p }) {
  const c = personToCandidate(p);
  const CandScorecards = window.CandParts && window.CandParts.CandScorecards;
  return (
    <PSection id="scorecards" title="Scorecards" subtitle="Structured feedback from every interviewer.">
      {CandScorecards ? <CandScorecards c={c} /> : <p>No scorecards</p>}
    </PSection>
  );
}

function SectionNetwork({ p }) {
  return (
    <PSection id="network" title="Network" subtitle="Colleagues, mutual connections, and shared history.">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon.Network width={26} height={26} /></div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>Network is coming next</div>
        <div style={{ fontSize: 13.5, color: 'var(--fg-tertiary)', maxWidth: 320, lineHeight: '20px' }}>We'll surface {p.name}'s colleagues, shared past companies, and mutual introducers here.</div>
      </div>
    </PSection>
  );
}

// ============================================================
// Create Person modal (mirrors CreateProjectModal in shape)
// ============================================================
// ============================================================
// PersonNameField — input with debounced duplicate check
// ============================================================
// Reused anywhere a user types a NEW person's name (Create modal, inline kanban).
// While typing, we simulate a network check against HubData.PEOPLE (350ms debounce),
// show a spinner in the field, and reveal a dropdown of potential existing matches.
// Users can click "View" on a match (parent decides how to display) or press Enter
// to commit the typed name as a new person.

// Small rotating spinner glyph
function CPSpinner({ size = 16 }) {
  const box = size + 4;
  return (
    <svg width={box} height={box} viewBox="0 0 24 24" style={{ display: 'block', animation: 'cp-spin 900ms linear infinite' }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-brand-100)" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="var(--color-brand-600)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
// Inject the keyframe once (idempotent — tokens.css doesn't ship this).
if (typeof document !== 'undefined' && !document.getElementById('cp-spin-kf')) {
  const s = document.createElement('style');
  s.id = 'cp-spin-kf';
  s.textContent = '@keyframes cp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}

// A single row inside the potential-match dropdown
function PersonMatchRow({ p, onView, size }) {
  const { HubAvatar, HubLink } = HubUI;
  const [h, setH] = usePS(false);
  const [bh, setBh] = usePS(false);
  const sub = [p.title, p.company].filter(Boolean).join(' · ') || 'No primary role';
  const loc = [p.city, p.region, p.country].filter(Boolean).join(', ');
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: size === 'sm' ? '6px 8px' : '8px 10px', borderRadius: 8, background: h ? 'var(--bg-primary-hover)' : 'transparent' }}>
      <HubAvatar name={p.name} size={size === 'sm' ? 28 : 34} ring={!!(p.offLimits || p.flag)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          {p.offLimits && <span title="Off Limits" style={{ color: 'var(--color-error-600)', display: 'inline-flex', flexShrink: 0 }}><Icon.Flag width={11} height={11} /></span>}
        </div>
        <div style={{ marginTop: 1, fontSize: 12, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub}{loc ? ` · ${loc}` : ''}
        </div>
      </div>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onView} onMouseEnter={() => setBh(true)} onMouseLeave={() => setBh(false)}
        style={{ flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-primary)', background: bh ? 'var(--bg-primary-hover)' : '#fff', color: 'var(--fg-secondary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
        View
      </button>
    </div>
  );
}

function findPersonMatches(query, limit = 5) {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const pool = HubData.PEOPLE || [];
  const scored = [];
  for (const p of pool) {
    if (!p || !p.name) continue;
    const name = p.name.toLowerCase();
    let score;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.split(/\s+/).some(w => w.startsWith(q))) score = 60;
    else if (name.includes(q)) score = 40;
    else continue;
    scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(x => x.p);
}

function PersonNameField({
  value, onChange, onCommit, onSelectExisting,
  label = 'Name', required = true, placeholder, autoFocus, invalid, hint, size = 'md',
}) {
  const [f, setF] = usePS(false);
  const [checking, setChecking] = usePS(false);
  const [matches, setMatches] = usePS([]);
  const [showList, setShowList] = usePS(false);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    const q = (value || '').trim();
    if (q.length < 2) {
      setMatches([]); setShowList(false); setChecking(false);
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }
    setChecking(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const found = findPersonMatches(q, 5);
      setMatches(found);
      setShowList(true);
      setChecking(false);
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value]);

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); setShowList(false); onCommit && onCommit(); }
    else if (e.key === 'Escape') { setShowList(false); }
  };

  const height = size === 'sm' ? 30 : 40;
  const inputStyle = {
    width: '100%', boxSizing: 'border-box', height, padding: `0 ${height} 0 12px`,
    fontSize: size === 'sm' ? 13.5 : 14, fontFamily: 'var(--font-body)', fontWeight: size === 'sm' ? 600 : 400,
    color: 'var(--fg-primary)', background: '#fff',
    border: `1px solid ${invalid ? 'var(--color-error-500)' : (f ? 'var(--border-brand)' : 'var(--border-primary)')}`,
    borderRadius: size === 'sm' ? 6 : 8, outline: 'none',
    boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)',
    transition: 'box-shadow 150ms, border-color 150ms',
  };

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 500, color: invalid ? 'var(--color-error-700)' : (f ? 'var(--color-brand-700)' : 'var(--fg-quaternary)'), marginBottom: 4 }}>
          {label}{required && <span style={{ color: 'var(--color-error-600)', marginLeft: 2 }}>*</span>}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input value={value || ''} onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setF(true); if (matches.length) setShowList(true); }}
          onBlur={() => { setF(false); setTimeout(() => setShowList(false), 160); }}
          onKeyDown={onKey}
          placeholder={placeholder} autoFocus={autoFocus}
          style={inputStyle} />
        {checking && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <CPSpinner size={size === 'sm' ? 14 : 16} />
          </span>
        )}
      </div>
      {hint && <div style={{ marginTop: 4, fontSize: 12, color: invalid ? 'var(--color-error-700)' : 'var(--fg-quaternary)' }}>{hint}</div>}

      {showList && (matches.length > 0 || (value && value.trim().length >= 2 && !checking)) && (
        <div onMouseDown={(e) => e.preventDefault()}
          style={{ position: 'absolute', top: label ? 68 : 44, left: 0, right: 0, zIndex: 20, marginTop: 2, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'tt-pop 130ms ease-out', transformOrigin: 'top center' }}>
          {matches.length > 0 ? (
            <React.Fragment>
              <div style={{ padding: '6px 10px 2px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>
                Potential duplicates ({matches.length})
              </div>
              {matches.map(p => (
                <PersonMatchRow key={p.name} p={p} size={size} onView={(e) => { e && e.preventDefault(); onSelectExisting && onSelectExisting(p); }} />
              ))}
            </React.Fragment>
          ) : (
            <div style={{ padding: '10px 12px', fontSize: 12.5, color: 'var(--fg-quaternary)' }}>No existing matches.</div>
          )}
          <div style={{ height: 1, background: 'var(--border-secondary)', margin: '6px 8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '6px 10px 8px' }}>
            <span style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>
              None of these? Add <span style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>"{value.trim()}"</span> as new.
            </span>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); setShowList(false); onCommit && onCommit(); }}
              style={{ flexShrink: 0, height: 28, padding: '0 12px', borderRadius: 6, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-skeu)' }}>
              Add as new · ⏎
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Featured option card ("Upload resume" / "Connect LinkedIn profile") ----
function CPQuickOption({ icon, label, desc, brand, onClick }) {
  const [h, setH] = usePS(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', minWidth: 0,
        width: '100%', padding: '14px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
        border: `1px solid ${h ? 'var(--color-brand-400)' : 'var(--border-secondary)'}`,
        background: h ? 'var(--bg-brand-primary)' : '#fff',
        boxShadow: 'var(--shadow-xs)', transition: 'background 120ms, border-color 120ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: brand ? '#0A66C2' : 'var(--bg-brand-primary)', color: brand ? '#fff' : 'var(--color-brand-600)' }}>
          {React.cloneElement(icon, { width: 17, height: 17 })}
        </span>
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--fg-primary)' }}>{label}</span>
        <Icon.ChevronRight width={16} height={16} style={{ color: 'var(--fg-quaternary)', flexShrink: 0 }} />
      </div>
      <div style={{ fontSize: 12.5, lineHeight: '17px', color: 'var(--fg-quaternary)' }}>{desc}</div>
    </button>
  );
}

function CreatePersonModal({ onClose, onCreate, onViewExisting }) {
  const [name, setName] = usePS('');
  const [title, setTitle] = usePS('');
  const [company, setCompany] = usePS('');
  const [tried, setTried] = usePS(false);
  const missingName = !name.trim();

  const submit = () => { setTried(true); if (missingName) return; onCreate({ name: name.trim(), title: title.trim(), company: company.trim(), source: 'manual' }); };
  const startUploadResume = () => { onCreate({ name: '', title: '', company: '', source: 'resume' }); };
  const startLinkedIn = () => { onCreate({ name: '', title: '', company: '', source: 'linkedin' }); };
  const viewExisting = (p) => { onClose && onClose(); onViewExisting && onViewExisting(p); };

  const Field = ({ label, required, value, onChange, placeholder, autoFocus, invalid, hint }) => {
    const [f, setF] = usePS(false);
    return (
      <label style={{ display: 'block' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: invalid ? 'var(--color-error-700)' : (f ? 'var(--color-brand-700)' : 'var(--fg-quaternary)'), marginBottom: 4 }}>
          {label}{required && <span style={{ color: 'var(--color-error-600)', marginLeft: 2 }}>*</span>}
        </div>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff',
            border: `1px solid ${invalid ? 'var(--color-error-500)' : (f ? 'var(--border-brand)' : 'var(--border-primary)')}`,
            borderRadius: 8, outline: 'none', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
        {hint && <div style={{ marginTop: 4, fontSize: 12, color: invalid ? 'var(--color-error-700)' : 'var(--fg-quaternary)' }}>{hint}</div>}
      </label>
    );
  };

  return (
    <div onMouseDown={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(10,13,18,0.24)', display: 'flex', justifyContent: 'flex-end', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()}
        style={{ height: '100vh', width: 'min(520px, 96vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-secondary)', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Add person</div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.X width={20} height={20} />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 24px' }}>
          {/* Quick paths — populate the profile from a resume file or a LinkedIn URL */}
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>Get started quickly</div>
          <div style={{ marginTop: 3, fontSize: 13, color: 'var(--fg-quaternary)' }}>Pull most of the details in automatically — you can still edit the profile afterward.</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <CPQuickOption icon={<Icon.Upload />} label="Upload resume" desc="Parse a PDF or DOCX to prefill the profile." onClick={startUploadResume} />
            <CPQuickOption icon={<Icon.LinkedIn />} label="Connect LinkedIn profile" desc="Paste a LinkedIn URL — we'll pull role, company and history." brand onClick={startLinkedIn} />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 4px' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-secondary)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>Or enter manually</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border-secondary)' }} />
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-quaternary)' }}>Just the name is required — you can fill the rest in on the profile.</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PersonNameField value={name} onChange={setName}
              onCommit={submit} onSelectExisting={viewExisting}
              autoFocus placeholder="e.g. Priya Nair"
              invalid={tried && missingName} hint={tried && missingName ? 'Name is required.' : 'We check for potential duplicates as you type.'} />
            <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. VP of Engineering" />
            <Field label="Company" value={company} onChange={setCompany} placeholder="e.g. Stripe" />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--border-secondary)', background: '#fff', flexShrink: 0 }}>
          <button type="button" onClick={onClose}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={missingName}
            style={{ height: 38, padding: '0 18px', borderRadius: 8, border: 0, background: missingName ? 'var(--color-gray-200)' : 'var(--bg-brand-solid)', color: missingName ? 'var(--fg-quaternary)' : 'var(--fg-on-brand)', fontSize: 14, fontWeight: 600, cursor: missingName ? 'default' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: missingName ? 'none' : 'var(--shadow-skeu)' }}>
            Add person
          </button>
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// PersonPage — full-page person profile
// ============================================================
function PersonPage({ onBack }) {
  const [person] = usePS(() => {
    try {
      const draftRaw = localStorage.getItem(NEW_PERSON_KEY);
      if (draftRaw) return JSON.parse(draftRaw);
    } catch (_) {}
    const idx = parseInt(localStorage.getItem(PERSON_IDX_KEY) || '0', 10);
    return HubData.PEOPLE[idx] || HubData.PEOPLE[0];
  });

  // single-shot cleanup so revisiting doesn't reuse the draft
  React.useEffect(() => { try { localStorage.removeItem(NEW_PERSON_KEY); } catch (_) {} }, []);

  const [section, setSection] = usePS('overview');
  const renderSection = () => {
    switch (section) {
      case 'overview':   return <SectionOverview p={person} onOpenActivity={() => setSection('activity')} />;
      case 'projects':   return <SectionProjectsLists p={person} />;
      case 'activity':   return <SectionActivity p={person} />;
      case 'scorecards': return <SectionScorecards p={person} />;
      case 'network':    return <SectionNetwork p={person} />;
      default:           return <SectionOverview p={person} />;
    }
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-secondary)' }}>
      <PersonBreadcrumb p={person} onBack={onBack} />
      <PersonHeader p={person} />
      <div style={{ display: 'grid', gridTemplateColumns: '216px minmax(0, 1fr) 320px', gap: 28, padding: '24px 32px 64px', alignItems: 'flex-start' }}>
        <PersonSideNav active={section} setActive={setSection} />
        <div style={{ minWidth: 0 }}>{renderSection()}</div>
        <PersonMetaSidebar p={person} />
      </div>
    </div>
  );
}

// ============================================================
// Exports
// ============================================================
window.PersonPage = PersonPage;
window.PersonKeys = { PERSON_IDX_KEY, NEW_PERSON_KEY };
window.CreatePersonModal = CreatePersonModal;
window.PersonNameField = PersonNameField;
window.findPersonMatches = findPersonMatches;
