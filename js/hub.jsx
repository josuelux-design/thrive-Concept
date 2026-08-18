// ============================================================
// Thrive TRM — Hub (landing) + slide-out left navigation
// Shares icons.jsx + tokens.css with the Admin app.
// ============================================================
const { useState: useS, useEffect: useE, useRef: useR } = React;
const HUB_ROUTE_KEY = 'thrive-hub-route-v1';

const RAIL_W = 88;     // collapsed rail width
const PANEL_W = 288;   // expanded panel width
const TOPBAR_H = 56;

// ---- navigation model: every top-level parent page of the app ----
const HUB_NAV = [
  { id: 'hub',        label: 'Hub',         icon: <Icon.Grid /> },
  { id: 'projects',   label: 'Projects',    icon: <Icon.Briefcase /> },
  { id: 'people',     label: 'People',      icon: <Icon.Users /> },
  { id: 'companies',  label: 'Companies',   icon: <Icon.Building /> },
  { id: 'analytics',  label: 'Analytics',   icon: <Icon.BarChart />, children: [
      { id: 'analytics-user-report', label: 'User Report' },
      { id: 'analytics-capacity-reports', label: 'Capacity Reports' },
      { id: 'analytics-introductions', label: 'Introductions' },
  ] },
  { id: 'lists',      label: 'Lists',       icon: <Icon.Clipboard /> },
  { id: 'market-maps',label: 'Market Maps', icon: <Icon.Map /> },
  { id: 'exports',    label: 'Exports',     icon: <Icon.FileDown /> },
];

const HUB_LABELS = (() => {
  const m = {};
  HUB_NAV.forEach(n => { m[n.id] = n.label; (n.children || []).forEach(c => m[c.id] = c.label); });
  return m;
})();

// ============================================================
// Logo
// ============================================================
function HubLogoMark({ size = 38 }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, borderRadius: 9, background: 'linear-gradient(135deg, #6675EE, #4758EB)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 16a4 4 0 0 1 .9-7.9A5.5 5.5 0 0 1 17.7 8.2 3.9 3.9 0 0 1 18 16" />
        <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" />
      </svg>
    </div>
  );
}

// ============================================================
// Slide-out left navigation
// ============================================================
// [spine] role: nav · name: navRail · surface: mainContent
// Slide-out left navigation (hover-expands rail → panel). Variance: low.
function SideNav({ route, setRoute }) {
  const [expanded, setExpanded] = useS(false);
  const [openSection, setOpenSection] = useS({});
  const collapseTimer = useR(null);

  const open = () => { clearTimeout(collapseTimer.current); setExpanded(true); };
  const scheduleClose = () => {
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => { setExpanded(false); setOpenSection({}); }, 120);
  };
  useE(() => () => clearTimeout(collapseTimer.current), []);

  const NavRow = ({ node }) => {
    const active = route === node.id || (node.id === 'projects' && route === 'project') || (node.id === 'people' && route === 'person');
    const hasChildren = !!node.children;
    const sectionOpen = !!openSection[node.id];
    const [hover, setHover] = useS(false);

    const onClick = () => {
      if (hasChildren && expanded) { setOpenSection(s => ({ ...s, [node.id]: !s[node.id] })); }
      else { setRoute(node.id); }
    };

    const bandBg = active ? 'var(--bg-brand-primary)' : (hover ? 'var(--bg-primary-hover)' : 'transparent');

    return (
      <div>
        <button type="button" onClick={onClick}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
            width: '100%', height: 50, paddingLeft: 32, paddingRight: 16,
            border: 0, background: expanded ? bandBg : 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-body)', textAlign: 'left',
            transition: 'background 120ms ease-out',
          }}>
          {/* active accent bar (expanded) */}
          {active && expanded && (
            <span style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, borderRadius: '0 3px 3px 0', background: 'var(--color-brand-600)' }} />
          )}
          {/* icon — stays at fixed x in both states */}
          <span style={{
            width: 40, height: 40, marginLeft: -8, borderRadius: 10, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: !expanded && active ? 'var(--bg-brand-primary)' : (!expanded && hover ? 'var(--bg-primary-hover)' : 'transparent'),
            color: active ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)',
            transition: 'background 120ms ease-out',
          }}>
            {React.cloneElement(node.icon, { width: 24, height: 24 })}
          </span>
          {/* label */}
          <span style={{
            flex: 1, fontSize: 16, fontWeight: active ? 600 : 500,
            color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            whiteSpace: 'nowrap', opacity: expanded ? 1 : 0,
            transition: 'opacity 140ms ease-out', pointerEvents: 'none',
          }}>{node.label}</span>
          {hasChildren && (
            <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', opacity: expanded ? 1 : 0, transition: 'opacity 140ms ease-out' }}>
              {sectionOpen ? <Icon.ChevronUp width={18} height={18} /> : <Icon.ChevronDown width={18} height={18} />}
            </span>
          )}
        </button>
        {/* sub-items */}
        {hasChildren && expanded && sectionOpen && node.children.map(child => {
          const cActive = route === child.id;
          return (
            <SubRow key={child.id} child={child} active={cActive} onClick={() => setRoute(child.id)} />
          );
        })}
      </div>
    );
  };

  const SubRow = ({ child, active, onClick }) => {
    const [h, setH] = useS(false);
    return (
      <button type="button" onClick={onClick}
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{
          display: 'flex', alignItems: 'center', width: '100%', height: 40,
          paddingLeft: 70, paddingRight: 16, border: 0, cursor: 'pointer',
          background: active ? 'var(--bg-brand-primary)' : (h ? 'var(--bg-primary-hover)' : 'transparent'),
          fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'background 120ms ease-out',
        }}>
        <span style={{ fontSize: 15, fontWeight: active ? 600 : 500, color: active ? 'var(--fg-primary)' : 'var(--fg-tertiary)', whiteSpace: 'nowrap' }}>{child.label}</span>
      </button>
    );
  };

  return (
    <nav
      data-spine-role="nav" data-spine-name="navRail" data-spine-surface="mainContent"
      onMouseEnter={open} onMouseLeave={scheduleClose}
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        width: expanded ? PANEL_W : RAIL_W,
        background: '#fff', borderRight: '1px solid var(--border-secondary)',
        boxShadow: expanded ? 'var(--shadow-lg)' : 'none',
        display: 'flex', flexDirection: 'column',
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms ease-out',
        overflow: 'hidden',
      }}>
      {/* logo header — aligns with top bar */}
      <div style={{ height: TOPBAR_H, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 25, borderBottom: '1px solid var(--border-secondary)' }}>
        <HubLogoMark />
        <span style={{ fontSize: 22, fontWeight: 500, color: 'var(--fg-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity 140ms ease-out' }}>truesearch</span>
      </div>

      {/* nav items */}
      <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {HUB_NAV.map(node => <NavRow key={node.id} node={node} />)}
      </div>

      {/* footer — Go to Admin Portal */}
      <a href="Thrive%20Admin.html"
        title="Go to Admin Portal"
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, height: 64, flexShrink: 0,
          paddingLeft: 32, paddingRight: 16, borderTop: '1px solid var(--border-secondary)',
          textDecoration: 'none', transition: 'background 120ms ease-out',
        }}>
        <span style={{ width: 40, height: 40, marginLeft: -8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-quaternary)' }}>
          <Icon.Settings width={24} height={24} />
        </span>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg-secondary)', whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity 140ms ease-out' }}>Go to Admin Portal</span>
      </a>
    </nav>
  );
}

// ============================================================
// Notifications — activity feed dropdown
// ============================================================
// type -> { icon, tint bg, icon color } for the small activity badge
const NOTIF_KIND = {
  note:      { icon: 'MessagePlus',     bg: 'var(--bg-brand-primary)',   fg: 'var(--color-brand-600)' },
  scorecard: { icon: 'ClipboardCheck',  bg: 'var(--color-success-50)',   fg: 'var(--color-success-600)' },
  stage:     { icon: 'Trending',        bg: 'var(--color-warning-50)',   fg: 'var(--color-warning-600)' },
  candidate: { icon: 'UserPlus',        bg: 'var(--bg-brand-primary)',   fg: 'var(--color-brand-600)' },
  interview: { icon: 'Calendar',        bg: 'var(--color-success-50)',   fg: 'var(--color-success-600)' },
};

const NOTIFICATIONS = [
  { id: 'n1', kind: 'note', unread: true,
    actor: { name: 'Angela Zhou', initials: 'AZ', color: '#F38744' },
    text: ['Angela Zhou', ' added a note on ', 'Marcus Bell', ' for ', 'Chief Product Officer'],
    date: 'Mar 16, 2026', time: '2:48 PM' },
  { id: 'n2', kind: 'scorecard', unread: true,
    actor: { name: 'Keat Teoh', initials: 'KT', color: '#5965F5' },
    text: ['Keat Teoh', ' added a scorecard for ', 'Priya Raman', ' on ', 'Director of Engineering'],
    date: 'Mar 16, 2026', time: '2:12 PM' },
  { id: 'n3', kind: 'stage', unread: true,
    actor: { name: 'Daniela Marsh', initials: 'DM', color: '#16A34A' },
    text: ['Daniela Marsh', ' moved ', 'Tomas Eriksson', ' to ', 'Client Submission'],
    date: 'Mar 16, 2026', time: '12:30 PM' },
  { id: 'n4', kind: 'candidate', unread: false,
    actor: { name: 'John Parsons', initials: 'JP', color: '#7C3AED' },
    text: ['John Parsons', ' added ', 'Aisha Bello', ' to ', 'VP of Product'],
    date: 'Mar 15, 2026', time: '4:12 PM' },
  { id: 'n5', kind: 'interview', unread: false,
    actor: { name: 'Kafui Nutakor', initials: 'KN', color: '#0EA5E9' },
    text: ['Kafui Nutakor', ' scheduled a final-round interview with ', 'Marcus Bell'],
    date: 'Mar 14, 2026', time: '9:30 AM' },
  { id: 'n6', kind: 'note', unread: false,
    actor: { name: 'Angela Zhou', initials: 'AZ', color: '#F38744' },
    text: ['Angela Zhou', ' added a note on ', 'Daniel Cho', ' for ', 'Head of Platform'],
    date: 'Mar 13, 2026', time: '2:05 PM' },
];

function NotifText({ parts }) {
  // odd-indexed segments are emphasized (names / projects)
  return (
    <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fg-secondary)' }}>
      {parts.map((seg, i) => i % 2 === 1
        ? <span key={i} style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{seg}</span>
        : <span key={i}>{seg}</span>)}
    </span>
  );
}

function NotifRow({ n, onRead }) {
  const [hover, setHover] = useS(false);
  const k = NOTIF_KIND[n.kind];
  const KindIcon = Icon[k.icon];
  return (
    <button type="button" onClick={() => onRead(n.id)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
        padding: '14px 16px 14px 20px', position: 'relative',
        background: n.unread ? 'var(--bg-brand-primary)' : (hover ? 'var(--bg-secondary)' : '#fff'),
        transition: 'background 120ms ease-out',
      }}>
      {/* avatar with activity-kind badge */}
      <span style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: HubUI.hubAva(n.actor.name).bg, color: HubUI.hubAva(n.actor.name).fg, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n.actor.initials}</span>
        <span style={{ position: 'absolute', bottom: -3, right: -3, width: 20, height: 20, borderRadius: '50%', background: k.bg, color: k.fg, border: '2px solid #fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <KindIcon width={12} height={12} />
        </span>
      </span>
      {/* body */}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
        <NotifText parts={n.text} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-quaternary)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--fg-tertiary)' }}>{n.actor.name}</span>
          <span aria-hidden="true">·</span>
          <span>{n.date}</span>
          <span aria-hidden="true">·</span>
          <span>{n.time}</span>
        </span>
      </span>
      {/* unread dot */}
      {n.unread && <span style={{ flexShrink: 0, alignSelf: 'center', width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand-600)' }} />}
    </button>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useS(false);
  const [items, setItems] = useS(NOTIFICATIONS);
  const [hover, setHover] = useS(false);
  const wrapRef = useR(null);
  const unread = items.filter(i => i.unread).length;

  useE(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const markRead = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, unread: false } : i));
  const markAll = () => setItems(prev => prev.map(i => ({ ...i, unread: false })));

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ width: 40, height: 40, borderRadius: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: (open || hover) ? 'var(--bg-primary-hover)' : 'transparent', border: 0, color: 'var(--fg-quaternary)', transition: 'background 120ms ease-out', position: 'relative' }}>
        <Icon.Bell width={20} height={20} />
        {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 6, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: 'var(--color-error-600)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unread}</span>}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 400,
          background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 50,
          animation: 'tt-pop 140ms ease-out', transformOrigin: 'top right',
        }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>Notifications</span>
              {unread > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 9999, padding: '2px 8px' }}>{unread} new</span>}
            </span>
            {unread > 0 && <button type="button" onClick={markAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-brand-600)', padding: 0 }}>Mark all as read</button>}
          </div>
          {/* list */}
          <div style={{ maxHeight: 460, overflowY: 'auto' }}>
            {items.map((n, i) => (
              <div key={n.id} style={{ borderTop: i === 0 ? 0 : '1px solid var(--border-secondary)' }}>
                <NotifRow n={n} onRead={markRead} />
              </div>
            ))}
          </div>
          {/* footer */}
          <div style={{ borderTop: '1px solid var(--border-secondary)', padding: 12, textAlign: 'center' }}>
            <button type="button" onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)', padding: '6px 12px' }}>View all activity</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Top bar (right-side controls; logo lives in the nav panel)
// ============================================================
// [spine] role: header · name: appBar · surface: mainContent
// Global top bar: search, notifications, quick-add, account. Variance: low.
function HubTopBar() {
  const ctrl = (active) => ({
    width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: active ? 'var(--bg-primary-hover)' : 'transparent', border: 0,
    color: 'var(--fg-quaternary)', transition: 'background 120ms ease-out', position: 'relative',
  });
  const Hoverable = ({ children, accent }) => {
    const [h, setH] = useS(false);
    return (
      <button type="button"
        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={accent
          ? { width: 40, height: 40, borderRadius: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: h ? 'var(--bg-brand-primary)' : '#fff', border: `1px solid ${h ? 'var(--color-brand-200)' : 'var(--border-secondary)'}`, color: 'var(--color-brand-600)', boxShadow: 'var(--shadow-xs)', transition: 'all 120ms ease-out' }
          : ctrl(h)}>
        {children}
      </button>
    );
  };

  return (
    <header data-spine-role="header" data-spine-name="appBar" data-spine-surface="mainContent" style={{ height: TOPBAR_H, flexShrink: 0, background: '#fff', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, padding: '0 16px', position: 'relative', zIndex: 20 }}>
      <Hoverable><Icon.Search width={20} height={20} /></Hoverable>
      <NotificationsMenu />
      <Hoverable accent><Icon.Plus width={20} height={20} /></Hoverable>
      <button type="button" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-gray-100)', border: '1px solid var(--border-secondary)', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
        <Icon.User width={22} height={22} />
      </button>
    </header>
  );
}

// ============================================================
// Hub content — greeting + Projects panel
// ============================================================
const PROJECT_TABS = ['Not Started', 'Opportunity', 'Open', 'On Hold', 'Closed', 'Lost', 'Canceled'];

const HUB_PROJECTS = [
  {
    id: 'p1', name: 'Chief Product Officer', confidential: true, account: 'Thrive',
    accountColor: 'brand', mark: 'logo',
    location: 'Haddonfield, NJ, United States',
    tags: ['Strategic Account', 'Software - SaaS/Cloud'], overflow: 0,
    owner: { initials: 'AZ', name: 'Angela Zhou', color: '#F38744' },
    days: 109, stage: 'Hired', candidates: 99,
  },
  {
    id: 'p2', name: 'Director of Engineering', confidential: false, account: "Kohl's",
    accountColor: 'brand', mark: 'briefcase',
    location: 'Seattle, WA, United States',
    tags: ['Consumer - Retail Omnichannel'], overflow: 2,
    owner: { initials: 'KT', name: 'Keat Teoh', color: '#5965F5' },
    days: 48, stage: 'Outreach', candidates: 24,
  },
];

const STAGE_STYLE = {
  Hired:    { bg: 'var(--bg-brand-primary)',   fg: 'var(--color-brand-700)' },
  Outreach: { bg: 'var(--bg-brand-primary)',   fg: 'var(--color-brand-700)' },
};

function ProjectCard({ p, onOpenProject }) {
  const [hover, setHover] = useS(false);
  const stage = STAGE_STYLE[p.stage] || { bg: 'var(--bg-tertiary)', fg: 'var(--fg-tertiary)' };
  // Match the Projects page: open the full project workspace, landing on the kanban view.
  const openProject = () => {
    localStorage.setItem('thrive-proj-view', 'kanban');
    onOpenProject && onOpenProject();
  };
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14,
        padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transform: hover ? 'translateY(-1px)' : 'none', transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
      }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {p.mark === 'logo'
          ? <HubLogoMark size={46} />
          : <div style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Briefcase width={24} height={24} /></div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span role="link" tabIndex={0} onClick={openProject}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(); } }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-brand-tertiary)', cursor: 'pointer' }}>{p.name}</span>
            {p.confidential && (
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 9999, padding: '2px 10px' }}>Confidential</span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', marginTop: 2, cursor: 'pointer' }}>{p.account}</div>
        </div>
      </div>

      {/* location */}
      <div style={{ fontSize: 15, color: 'var(--fg-quaternary)' }}>{p.location}</div>

      {/* tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0 }}><Icon.Tag width={18} height={18} /></span>
        {p.tags.map(t => (
          <span key={t} style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap' }}>{t}</span>
        ))}
        {p.overflow > 0 && (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-quaternary)' }}>+{p.overflow}</span>
        )}
      </div>

      {/* owner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: HubUI.hubAva(p.owner.name).bg, color: HubUI.hubAva(p.owner.name).fg, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.owner.initials}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-secondary)' }}>{p.owner.name}</span>
        <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }}><Icon.Mail width={18} height={18} /></span>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '2px 0' }} />

      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, fontSize: 14, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--fg-quaternary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand-500)' }} />
          Open for {p.days} days
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: stage.fg, background: stage.bg, borderRadius: 9999, padding: '3px 12px' }}>{p.stage}</span>
        <span style={{ color: 'var(--fg-tertiary)', fontWeight: 500 }}>{p.candidates} Candidates</span>
      </div>
    </div>
  );
}

function ProjectsPanel({ onOpenProject }) {
  const [tab, setTab] = useS('Open');
  const showProjects = tab === 'Open';
  return (
    <section style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px 0' }}>
        <h2 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)' }}>Projects</h2>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 28, padding: '18px 28px 0', borderBottom: '1px solid var(--border-secondary)', overflowX: 'auto' }}>
        {PROJECT_TABS.map(t => {
          const active = t === tab;
          return (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{
                position: 'relative', border: 0, background: 'transparent', cursor: 'pointer',
                padding: '0 0 14px', fontFamily: 'var(--font-body)', fontSize: 16, whiteSpace: 'nowrap',
                fontWeight: active ? 600 : 500, color: active ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)',
                transition: 'color 120ms ease-out',
              }}>
              {t}
              {active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: '2px 2px 0 0', background: 'var(--color-brand-600)' }} />}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 28 }}>
        {showProjects ? (
          <React.Fragment>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 18 }}>{HUB_PROJECTS.length} projects</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {HUB_PROJECTS.map(p => <ProjectCard key={p.id} p={p} onOpenProject={onOpenProject} />)}
            </div>
          </React.Fragment>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon.Briefcase width={26} height={26} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>No {tab.toLowerCase()} projects</div>
            <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', maxWidth: 320 }}>Projects in the {tab} stage will appear here.</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// My Activity — personal cross-project feed + quick access + calendar
// ============================================================
const MY_USER = { name: 'Keat Teoh', initials: 'KT' };

// Interaction types shown in the personal feed (color + icon + verb template)
const MY_ACT_TYPES = {
  outreach:  { label: 'Outreach',    icon: 'MessagePlus', fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)' },
  note:      { label: 'Note',        icon: 'Note',        fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)' },
  contact:   { label: 'Contact',     icon: 'Phone',       fg: 'var(--color-success-700)', bg: 'var(--color-success-50)' },
  stage:     { label: 'Stage change',icon: 'Trending',    fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
  scorecard: { label: 'Scorecard',   icon: 'Star',        fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
  add:       { label: 'Added',       icon: 'UserPlus',    fg: 'var(--fg-secondary)',      bg: 'var(--bg-tertiary)' },
};
const MY_CHANNEL_ICON = { LinkedIn: 'LinkedIn', Email: 'Mail', Phone: 'Phone' };

// Team roster for cross-project activity. Every project below is one I own or am on,
// so teammate actions surface in the "Your projects" scope.
const ACT_TEAM = [
  { name: 'Angela Zhou',  initials: 'AZ' },
  { name: 'Marcus Ford',  initials: 'MF' },
  { name: 'Ines Alvarez', initials: 'IA' },
];
const isMeActor = (a) => a && a.initials === MY_USER.initials;

// Deterministic activity across every project I own or am on. Actions are attributed
// to real actors — mostly me, some by teammates — so the "Your projects" scope shows
// what the whole team has done, not just my own actions.
function myActivityData() {
  const projects = ['Chief Product Officer · Thrive', 'Director of Engineering · Kohl\'s', 'VP Marketing · Datadog'];
  const cands = (HubData.CANDIDATES || []).slice(0, 14);
  const out = [];
  const hash = (s) => { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  cands.forEach((c, i) => {
    const h = hash(c.id || c.name || i);
    const project = projects[h % projects.length];
    const chan = ['LinkedIn', 'Email', 'Phone'][h % 3];
    // ~60% of primary actions are mine; the rest are teammates on my projects.
    const primaryActor = (h % 5 < 3) ? MY_USER : ACT_TEAM[h % ACT_TEAM.length];
    const primaryKind = ['outreach', 'note', 'contact', 'stage'][h % 4];
    const primaryDay = h % 9; // 0..8 days ago
    const body = {
      outreach: { channel: chan, action: `Sent a ${chan} outreach — "${(c.title || 'senior role').split(',')[0]} opportunity"` },
      note:     { action: `Left a note — ${((c.up||0) >= (c.down||0)) ? 'strong scope fit, worth prioritizing.' : 'comp likely high, flagged for the team.'}` },
      contact:  { channel: 'Phone', action: 'Logged a call — 20 min intro, receptive to hearing more.' },
      stage:    { action: `Moved to ${c.stage || 'Outreach'}` },
    }[primaryKind];
    out.push({ id: `${c.id}-p`, type: primaryKind, actor: primaryActor, dayAgo: primaryDay, candidate: c, project, ...body });
    // A teammate action for depth — surfaces the "someone else already touched this
    // person" signal that helps you ask for a warm intro vs cold outreach.
    if (h % 3 === 0) {
      const mate = ACT_TEAM[(h + 1) % ACT_TEAM.length];
      out.push({ id: `${c.id}-s`, type: 'add', actor: mate, dayAgo: primaryDay + 5 + (h % 6), candidate: c, project, action: `Added to ${project.split(' · ')[0]}` });
    }
    if (c.scorecards && h % 4 === 1) {
      const mate = ACT_TEAM[(h + 2) % ACT_TEAM.length];
      out.push({ id: `${c.id}-sc`, type: 'scorecard', actor: mate, dayAgo: primaryDay + 2, candidate: c, project, action: `Submitted a scorecard — ${c.scorecards.avg.toFixed(1)}/5` });
    }
  });
  out.sort((a, b) => a.dayAgo - b.dayAgo);
  return out;
}

function dayBucket(d) {
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return 'Earlier this week';
  if (d < 14) return 'Last week';
  return 'Earlier';
}
function agoLabel(d) {
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  if (d < 7) return `${d} days ago`;
  if (d < 14) return '1 week ago';
  return `${Math.floor(d / 7)} weeks ago`;
}

// Google-Calendar-style events. `cal` maps to a Google calendar color.
const GCAL_COLORS = {
  blue:   '#4285F4',   // "Interviews"
  green:  '#0B8043',   // "Intro calls"
  purple: '#8E24AA',   // "Team"
  orange: '#F4511E',   // "Personal"
};
function myCalendarEvents() {
  return [
    { id: 'e1', day: 'Today',    time: '10:30 AM', dur: '30m', title: 'Recruiter screen — Sofia Marchetti', cal: 'blue',   meet: true,  who: ['SM', 'KT'], project: 'Director of Engineering' },
    { id: 'e2', day: 'Today',    time: '1:00 PM',  dur: '45m', title: 'Debrief — Chief Product Officer panel', cal: 'purple', meet: true,  who: ['AZ', 'MF', 'KT'], project: 'Chief Product Officer' },
    { id: 'e3', day: 'Today',    time: '3:30 PM',  dur: '30m', title: 'Intro call — Daniel Okafor', cal: 'green',  meet: true,  who: ['DO', 'KT'], project: 'VP Marketing' },
    { id: 'e4', day: 'Tomorrow', time: '9:00 AM',  dur: '60m', title: 'Client sync — Thrive weekly', cal: 'purple', meet: true,  who: ['AZ', 'KT'], project: 'Chief Product Officer' },
    { id: 'e5', day: 'Tomorrow', time: '11:00 AM', dur: '30m', title: 'Hiring team interview — Amaro Luna', cal: 'blue',   meet: false, who: ['AL', 'KT'], location: 'Zoom', project: 'Chief Product Officer' },
  ];
}

// ---- Google Calendar mark (4-color) ----
function GoogleCalMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2.5" fill="#fff" stroke="#E0E0E0" strokeWidth="0.5" />
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H8v4H4z" fill="#4285F4" />
      <path d="M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8h-4z" fill="#EA4335" />
      <path d="M20 16v1.5A2.5 2.5 0 0 1 17.5 20H16v-4z" fill="#FBBC04" />
      <path d="M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16h4z" fill="#34A853" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#4285F4" fontFamily="Arial, sans-serif">31</text>
    </svg>
  );
}

// ---- Quick-access project rows (minimized) ----
function QuickAccessProjects({ onOpenProject }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>Quick access</span>
        <button type="button" onClick={() => window.hubNavigate && window.hubNavigate('projects')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, border: 0, background: 'transparent', color: 'var(--color-brand-700)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>
          All projects <Icon.ChevronRight width={13} height={13} />
        </button>
      </div>
      {HUB_PROJECTS.map((p, i) => {
        const st = STAGE_STYLE[p.stage] || { bg: 'var(--bg-tertiary)', fg: 'var(--fg-tertiary)' };
        return (
          <button key={p.id} type="button"
            onClick={() => { localStorage.setItem('thrive-proj-view', 'kanban'); onOpenProject && onOpenProject(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', border: 0, borderTop: i === 0 ? 0 : '1px solid var(--border-secondary)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            {p.mark === 'logo'
              ? <HubLogoMark size={34} />
              : <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Briefcase width={18} height={18} /></span>}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.account} · {p.candidates} candidates</span>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: st.fg, background: st.bg, borderRadius: 9999, padding: '2px 9px', flexShrink: 0 }}>{p.stage}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---- Google Calendar synced card ----
function GoogleCalendarCard() {
  const events = myCalendarEvents();
  const groups = [];
  events.forEach(e => { let g = groups.find(x => x.day === e.day); if (!g) { g = { day: e.day, items: [] }; groups.push(g); } g.items.push(e); });
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
      {/* synced header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderBottom: '1px solid var(--border-secondary)' }}>
        <GoogleCalMark size={20} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>Google Calendar</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--color-success-700)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success-500)' }} />
            Synced · keat@thrivetrm.com
          </div>
        </div>
        <button type="button" title="Open in Google Calendar"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Open
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
        </button>
      </div>
      {/* event groups */}
      <div style={{ padding: '4px 0 8px' }}>
        {groups.map(g => (
          <div key={g.day}>
            <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>{g.day}</div>
            {g.items.map(e => {
              const color = GCAL_COLORS[e.cal] || GCAL_COLORS.blue;
              return (
                <div key={e.id} style={{ display: 'flex', gap: 12, padding: '8px 16px' }}>
                  <div style={{ width: 58, flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-primary)' }}>{e.time}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-quaternary)' }}>{e.dur}</div>
                  </div>
                  <span style={{ width: 3, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      {/* attendee pips */}
                      <span style={{ display: 'inline-flex' }}>
                        {e.who.map((w, wi) => (
                          <span key={wi} style={{ width: 20, height: 20, borderRadius: '50%', background: HubUI.hubAva(w).bg, color: HubUI.hubAva(w).fg, fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff', marginLeft: wi === 0 ? 0 : -6 }}>{w}</span>
                        ))}
                      </span>
                      {e.meet ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#1a73e8', cursor: 'pointer' }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" style={{ display: 'block' }}><rect x="2" y="7" width="13" height="10" rx="2" fill="#00832d"/><path d="M15 10l6-3v10l-6-3z" fill="#00ac47"/><rect x="2" y="7" width="13" height="10" rx="2" fill="none"/></svg>
                          Join
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--fg-quaternary)' }}>
                          <Icon.MapPin width={12} height={12} />{e.location || 'In person'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Scope toggle: You (my actions) vs Your projects (team, across owned/joined) ----
function ActivityScopeToggle({ scope, setScope }) {
  const items = [
    { id: 'you', label: 'You' },
    { id: 'projects', label: 'Your projects' },
  ];
  return (
    <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-tertiary)', borderRadius: 9, flexShrink: 0 }}>
      {items.map(it => {
        const on = scope === it.id;
        return (
          <button key={it.id} type="button" onClick={() => setScope(it.id)}
            style={{ height: 28, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: on ? '#fff' : 'transparent', border: on ? '1px solid var(--border-secondary)' : '1px solid transparent',
              color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- My activity feed (main column) ----
function MyActivityFeed() {
  const [filter, setFilter] = useS('all');
  const [scope, setScope] = useS('you');       // 'you' | 'projects'
  const [query, setQuery] = useS('');
  const [qFocus, setQFocus] = useS(false);
  const items = React.useMemo(() => myActivityData(), []);

  // Scope + search applied first; type-chip counts reflect this base so numbers stay honest.
  const q = query.trim().toLowerCase();
  const base = React.useMemo(() => {
    let list = scope === 'you' ? items.filter(it => isMeActor(it.actor)) : items;
    if (q) {
      list = list.filter(it => {
        const c = it.candidate || {};
        const typeLabel = (MY_ACT_TYPES[it.type] || {}).label || '';
        return [c.name, c.title, c.company, it.project, it.action, it.channel, typeLabel, (it.actor || {}).name]
          .some(v => v && String(v).toLowerCase().includes(q));
      });
    }
    return list;
  }, [items, scope, q]);

  const counts = React.useMemo(() => {
    const b = { total: base.length, outreach: 0, note: 0, contact: 0, stage: 0, scorecard: 0, add: 0 };
    base.forEach(it => { b[it.type] = (b[it.type] || 0) + 1; });
    return b;
  }, [base]);
  const chips = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'outreach', label: 'Outreach', count: counts.outreach },
    { id: 'note', label: 'Notes', count: counts.note },
    { id: 'contact', label: 'Contacts', count: counts.contact },
    { id: 'stage', label: 'Stage moves', count: counts.stage },
    { id: 'scorecard', label: 'Scorecards', count: counts.scorecard },
  ].filter(ch => ch.id === 'all' || ch.count > 0);

  const visible = filter === 'all' ? base : base.filter(it => it.type === filter);
  // group by day bucket
  const groups = [];
  visible.forEach(it => { const key = dayBucket(it.dayAgo); let g = groups.find(x => x.key === key); if (!g) { g = { key, items: [] }; groups.push(g); } g.items.push(it); });
  const order = ['Today', 'Yesterday', 'Earlier this week', 'Last week', 'Earlier'];
  groups.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  // ---- side-panel: unique candidates in the visible order drive prev/next ----
  const [selCandId, setSelCandId] = useS(null);
  const uniqueCands = [];
  const seenC = new Set();
  visible.forEach(it => { const c = it.candidate; if (c && c.id && !seenC.has(c.id)) { seenC.add(c.id); uniqueCands.push(c); } });
  const selIdx = selCandId ? uniqueCands.findIndex(c => c.id === selCandId) : -1;
  const selCand = selIdx >= 0 ? uniqueCands[selIdx] : null;
  const go = (delta) => { if (!uniqueCands.length) return; const n = ((selIdx < 0 ? 0 : selIdx) + delta + uniqueCands.length) % uniqueCands.length; setSelCandId(uniqueCands[n].id); };

  return (
    <React.Fragment>
    <section style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Activity</h2>
            <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{scope === 'you' ? 'Everything you’ve done across all projects' : 'Everything the team has done on projects you own or are on'}</span>
          </div>
          <ActivityScopeToggle scope={scope} setScope={setScope} />
        </div>
        {/* search */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', pointerEvents: 'none', display: 'inline-flex' }}><Icon.Search width={16} height={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activity, candidate, or project…"
            onFocus={() => setQFocus(true)} onBlur={() => setQFocus(false)}
            style={{ width: '100%', boxSizing: 'border-box', height: 38, padding: query ? '0 34px 0 36px' : '0 12px 0 36px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: `1px solid ${qFocus ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 9, outline: 'none', boxShadow: qFocus ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', transition: 'box-shadow 150ms, border-color 150ms' }} />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: 6, border: 0, background: 'transparent', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.X width={14} height={14} />
            </button>
          )}
        </div>
        {/* filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0 4px' }}>
          {chips.map(ch => {
            const on = filter === ch.id;
            return (
              <button key={ch.id} type="button" onClick={() => setFilter(ch.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 11px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, border: `1px solid ${on ? 'var(--color-brand-500)' : 'var(--border-secondary)'}`, background: on ? 'var(--bg-brand-primary)' : '#fff', color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)' }}>
                {ch.label}
                <span style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--color-brand-700)' : 'var(--fg-quaternary)', background: on ? '#fff' : 'var(--bg-tertiary)', borderRadius: 9999, padding: '0px 6px' }}>{ch.count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '8px 24px 20px' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--fg-quaternary)', fontSize: 13.5, marginTop: 12 }}>
            {q ? <span>No activity matches <strong style={{ color: 'var(--fg-secondary)' }}>“{query}”</strong>{filter !== 'all' ? ' with this filter' : ''}.</span> : 'No activity for this view yet.'}
          </div>
        ) : groups.map(g => (
          <div key={g.key} style={{ marginTop: 12 }}>
            <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '4px 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)', borderBottom: '1px solid var(--border-secondary)', zIndex: 1 }}>{g.key}</div>
            {g.items.map(it => <MyActivityRow key={it.id} it={it} onOpenCand={(c) => setSelCandId(c.id)} />)}
          </div>
        ))}
      </div>
    </section>
    {/* candidate side panel — opens over the Hub; "View full profile" expands to the full page */}
    {selCand && window.CandidatePanel && (
      <window.CandidatePanel
        candidate={selCand} index={selIdx < 0 ? 0 : selIdx} total={uniqueCands.length}
        initialTab="Overview"
        contextTabs={['Overview', 'Experience', 'Off Limits', 'Recent activity', 'Scorecards']}
        onPrev={() => go(-1)} onNext={() => go(1)}
        onClose={() => setSelCandId(null)}
        onFullProfile={() => { const c = selCand; setSelCandId(null); openCandidateProfile(c); }} />
    )}
    </React.Fragment>
  );
}

// Open a candidate's full profile — stash them as a person draft (same mechanism
// as the panel's "View full profile") and route to the person page.
function openCandidateProfile(c) {
  try {
    const draft = {
      name: c.name || '', title: c.title || '', company: c.company || '',
      city: c.city || '', region: c.region || '', country: c.country || '',
      offLimits: c.offLimits || null, flag: !!c.flag, inProject: true,
      tags: c.tags || [], stage: c.stage, experience: c.experience || [],
      scorecards: c.scorecards || null, note: c.note || null,
    };
    if (window.PersonKeys) localStorage.setItem(window.PersonKeys.NEW_PERSON_KEY, JSON.stringify(draft));
  } catch (_) {}
  if (window.hubNavigate) window.hubNavigate('person');
}

function MyActivityRow({ it, onOpenCand }) {
  const [h, setH] = useS(false);
  const meta = MY_ACT_TYPES[it.type] || MY_ACT_TYPES.note;
  const TypeIcon = Icon[meta.icon] || Icon.Note;
  const ChanIcon = it.channel ? Icon[MY_CHANNEL_ICON[it.channel]] : null;
  const c = it.candidate || {};
  const sub = [c.title, c.company].filter(Boolean).join(' · ');
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => onOpenCand && onOpenCand(c)}
      style={{ display: 'flex', gap: 12, padding: '12px 8px', borderRadius: 10, cursor: 'pointer', background: h ? 'var(--bg-primary-hover)' : 'transparent', borderBottom: '1px solid var(--border-secondary)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: meta.bg, color: meta.fg, marginTop: 1 }}>
        {ChanIcon ? <ChanIcon width={15} height={15} /> : <TypeIcon width={15} height={15} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* candidate headline — the star of the row: clickable, primary color */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenCand && onOpenCand(c); }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-brand-tertiary)', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.name || 'Candidate'}
          </button>
          {sub && <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{sub}</span>}
          <span style={{ flex: 1 }} />
          <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--fg-quaternary)', whiteSpace: 'nowrap' }}>{agoLabel(it.dayAgo)}</span>
        </div>
        {/* action — secondary line, prefixed by actor (You, or a teammate) */}
        <div style={{ marginTop: 3, fontSize: 13.5, color: 'var(--fg-secondary)', lineHeight: '19px' }}>
          {isMeActor(it.actor)
            ? <span style={{ color: 'var(--fg-quaternary)' }}>You</span>
            : <span style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{(it.actor || {}).name || 'Someone'}</span>}
          {' '}{(it.action || '').charAt(0).toLowerCase() + (it.action || '').slice(1)}
        </div>
        {/* context chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--fg-tertiary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 6, padding: '1px 8px' }}>
            <Icon.Briefcase width={11} height={11} />{it.project}
          </span>
          {it.channel && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: meta.fg, background: meta.bg, borderRadius: 6, padding: '1px 8px', fontWeight: 600 }}>
              {ChanIcon && <ChanIcon width={11} height={11} />}{it.channel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function HubHome({ onOpenProject }) {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 40px 64px' }}>
      <h1 style={{ margin: 0, fontSize: 30, lineHeight: '38px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>Good morning, Keat!</h1>
      <p style={{ margin: '8px 0 0', fontSize: 16, color: 'var(--fg-quaternary)' }}>Here's everything you've been working on — your activity, schedule, and projects in one place.</p>
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>
        {/* main: personal activity feed */}
        <MyActivityFeed />
        {/* rail: quick access + google calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <QuickAccessProjects onOpenProject={onOpenProject} />
          <GoogleCalendarCard />
        </div>
      </div>
    </div>
  );
}

// ---- placeholder for not-yet-built parent pages ----
function HubEmpty({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon.Cube width={28} height={28} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--fg-primary)', margin: '0 0 8px' }}>{label}</h2>
      <p style={{ fontSize: 15, lineHeight: '22px', color: 'var(--fg-tertiary)', margin: 0, maxWidth: 400 }}>
        This page is part of the sitemap and hasn't been built yet. Send the spec for <strong style={{ color: 'var(--fg-secondary)', fontWeight: 600 }}>{label}</strong> and it'll be designed here.
      </p>
    </div>
  );
}

// ============================================================
// Root
// ============================================================
function renderHubPage(route, setRoute) {
  switch (route) {
    case 'hub':                  return <HubHome onOpenProject={() => setRoute('project')} />;
    case 'projects':             return <HubPages.ProjectsPage onOpenProject={() => setRoute('project')} />;
    case 'project':              return <ProjectPage onBack={() => setRoute('projects')} />;
    case 'people':               return <HubPages.PeoplePage onOpenPerson={() => setRoute('person')} />;
    case 'person':               return <PersonPage onBack={() => setRoute('people')} />;
    case 'companies':            return <HubPages.CompaniesPage />;
    case 'lists':                return <HubPages.ListsPage />;
    case 'market-maps':          return <HubPages.MarketMapsPage />;
    case 'exports':              return <HubPages.ExportsPage />;
    case 'analytics-user-report':return <HubPages.UserReportPage />;
    case 'analytics-capacity-reports': return <HubPages.CapacityReportPage />;
    case 'analytics-introductions': return <HubPages.IntroductionsReportPage />;
    default:                     return <HubEmpty label={HUB_LABELS[route] || 'Page'} />;
  }
}

// [spine] role: shell · name: layoutWrapper · surface: mainContent
// App frame: fixed navRail (left) + column of appBar over contentOutlet.
// No banner and no footer on this surface — intentionally omitted.
function HubApp() {
  // ?open=person forces the person route on this tab only (used by "View full profile")
  const initialRoute = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const open = params.get('open');
      if (open === 'person' || open === 'project') return open;
    } catch (_) {}
    return localStorage.getItem(HUB_ROUTE_KEY) || 'hub';
  })();
  const [route, setRouteRaw] = useS(initialRoute);
  const setRoute = (r) => { setRouteRaw(r); localStorage.setItem(HUB_ROUTE_KEY, r); };
  // expose navigation so non-React helpers (e.g. export toast) can route to Exports
  window.hubNavigate = setRoute;

  return (
    <div data-spine-role="shell" data-spine-name="layoutWrapper" data-spine-surface="mainContent" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <SideNav route={route} setRoute={setRoute} />
      {/* [spine] banner (mainContent): intentionally absent — no app-frame banner region */}
      <div style={{ marginLeft: RAIL_W, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HubTopBar />
        {/* [spine] role: body · name: contentOutlet · surface: mainContent — routed page content */}
        <main data-spine-role="body" data-spine-name="contentOutlet" data-spine-surface="mainContent" style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
          {renderHubPage(route, setRoute)}
        </main>
        {/* [spine] footer (mainContent): intentionally absent — no app-frame footer region */}
      </div>
    </div>
  );
}

window.HubApp = HubApp;
