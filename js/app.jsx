// ============================================================
// Thrive TRM Admin — shell (top bar + sidebar) + router
// ============================================================
const { useState: useSt, useEffect: useEf } = React;
const ROUTE_KEY = 'thrive-admin-route-v1';
const EXPAND_KEY = 'thrive-admin-expand-v1';

// ---- nav model ----
const NAV = [
  { type: 'item', id: 'users', label: 'Users', icon: <Icon.Users /> },
  { type: 'item', id: 'roles', label: 'Roles & Permissions', icon: <Icon.RolesPerms /> },
  { type: 'section', id: 'customization', label: 'Customization', icon: <Icon.Sliders />, children: [
    { id: 'ai-features', label: 'AI Features' },
    { id: 'candidate-tags', label: 'Candidate Tags' },
    { id: 'contract-terms', label: 'Contract Terms' },
    { id: 'custom-fields', label: 'Custom Fields' },
    { id: 'document-labels', label: 'Document Labels' },
    { id: 'event-type', label: 'Event Type' },
    { id: 'project-stages', label: 'Project Stages' },
    { id: 'reports-branding', label: 'Reports Branding' },
    { id: 'scorecard-templates', label: 'Scorecard Templates' },
    { id: 'tags', label: 'Tags' },
    { id: 'team-function-labels', label: 'Team Function Labels' },
  ] },
  { type: 'section', id: 'integrations', label: 'Integrations', icon: <Icon.Integrations />, children: [
    { id: 'metaview-relyance', label: 'Metaview & Relyance' },
    { id: 'thrive-api', label: 'Thrive API' },
  ] },
];

const ALL_LABELS = (() => {
  const m = {};
  NAV.forEach(n => { if (n.type === 'item') m[n.id] = n.label; else n.children.forEach(c => m[c.id] = c.label); });
  return m;
})();

// ---- Logo mark (solid indigo — Phoenix) ----
function LogoMark({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, borderRadius: 8, background: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 16a4 4 0 0 1 .9-7.9A5.5 5.5 0 0 1 17.7 8.2 3.9 3.9 0 0 1 18 16" />
        <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" />
      </svg>
    </div>
  );
}

// slim content-top strip — just the account avatar, floating over the page
function ContentTopBar() {
  return (
    <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', background: 'transparent' }}>
      <AvatarMenu />
    </div>
  );
}

function AvatarMenu() {
  const [open, setOpen] = useSt(false);
  const ref = React.useRef(null);
  useEf(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-gray-100)', border: '1px solid var(--border-secondary)', color: 'var(--fg-quaternary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.User width={20} height={20} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 52, right: 0, width: 240, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 60 }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-secondary)', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)' }}>Brendan Murphy</div>
            <div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>admin@truesearch.com</div>
          </div>
          {['Profile settings', 'Organization', 'Sign out'].map((t) => (
            <button key={t} type="button" onClick={() => setOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 0, background: 'transparent', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: t === 'Sign out' ? 'var(--fg-error)' : 'var(--fg-secondary)', fontFamily: 'var(--font-body)' }}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ route, setRoute, expanded, setExpanded }) {
  const itemBase = { display: 'flex', alignItems: 'center', width: '100%', border: 0, cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'background 120ms ease-out' };

  const TopItem = ({ node }) => {
    const active = route === node.id;
    return (
      <button type="button" onClick={() => setRoute(node.id)}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
        style={{ ...itemBase, gap: 12, padding: '10px 20px', background: active ? 'var(--bg-brand-primary)' : 'transparent' }}>
        <span style={{ color: active ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', display: 'inline-flex' }}>{React.cloneElement(node.icon, { width: 20, height: 20 })}</span>
        <span style={{ fontSize: 15, fontWeight: active ? 500 : 400, color: active ? 'var(--fg-primary)' : 'var(--fg-secondary)' }}>{node.label}</span>
      </button>
    );
  };

  const Section = ({ node }) => {
    const open = expanded[node.id];
    const inSection = node.children.some(c => c.id === route);
    return (
      <div>
        <button type="button" onClick={() => setExpanded(e => ({ ...e, [node.id]: !e[node.id] }))}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          style={{ ...itemBase, gap: 12, padding: '10px 20px', justifyContent: 'flex-start' }}>
          <span style={{ color: inSection ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', display: 'inline-flex' }}>{React.cloneElement(node.icon, { width: 20, height: 20 })}</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: inSection ? 'var(--fg-brand-tertiary)' : 'var(--fg-secondary)', flex: 1 }}>{node.label}</span>
          <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}>{open ? <Icon.ChevronUp width={18} height={18} /> : <Icon.ChevronDown width={18} height={18} />}</span>
        </button>
        {open && node.children.map(child => {
          const active = route === child.id;
          return (
            <button key={child.id} type="button" onClick={() => setRoute(child.id)}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              style={{ ...itemBase, padding: '9px 20px 9px 52px', background: active ? 'var(--bg-brand-primary)' : 'transparent' }}>
              <span style={{ fontSize: 14, fontWeight: active ? 500 : 400, color: active ? 'var(--fg-primary)' : 'var(--fg-tertiary)' }}>{child.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <nav style={{ width: 256, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border-secondary)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px 14px' }}>
        <LogoMark size={28} />
        <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>Thrive</span>
      </div>
      <div style={{ flex: 1, padding: '4px 0' }}>
        {NAV.map(node => node.type === 'item' ? <TopItem key={node.id} node={node} /> : <Section key={node.id} node={node} />)}
      </div>
      <a href="Thrive%20Hub.html"
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        style={{ ...itemBase, gap: 12, padding: '14px 20px', textDecoration: 'none' }}>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Exit width={20} height={20} /></span>
        <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--fg-secondary)' }}>Exit</span>
      </a>
    </nav>
  );
}

// ---- empty state for not-yet-built pages ----
function EmptyPage({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon.Sliders width={28} height={28} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', margin: '0 0 8px' }}>{label}</h2>
      <p style={{ fontSize: 15, lineHeight: '22px', color: 'var(--fg-tertiary)', margin: 0, maxWidth: 380 }}>
        This page hasn't been built yet. Send a screenshot of <strong style={{ color: 'var(--fg-secondary)', fontWeight: 600 }}>{label}</strong> and it'll be recreated here.
      </p>
    </div>
  );
}

// ---- root app ----
function App() {
  const [state, setState] = useSt(() => AdminData.loadState());
  const [route, setRouteRaw] = useSt(() => localStorage.getItem(ROUTE_KEY) || 'custom-fields');
  const [expanded, setExpanded] = useSt(() => {
    try { const r = localStorage.getItem(EXPAND_KEY); if (r) return JSON.parse(r); } catch (e) {}
    return { customization: true, integrations: true };
  });

  const setRoute = (r) => { setRouteRaw(r); localStorage.setItem(ROUTE_KEY, r); };
  useEf(() => { localStorage.setItem(EXPAND_KEY, JSON.stringify(expanded)); }, [expanded]);

  const patch = (key, value) => {
    setState(prev => {
      const next = { ...prev, [key]: value };
      AdminData.saveState(next);
      return next;
    });
  };

  const renderPage = () => {
    const props = { state, patch };
    switch (route) {
      case 'roles': return <Pages.RolesPage {...props} />;
      case 'custom-fields': return <Pages.CustomFieldsPage {...props} />;
      case 'candidate-tags': return <Pages.CandidateTagsPage {...props} />;
      case 'project-stages': return <Pages.ProjectStagesPage {...props} />;
      case 'thrive-api': return <Pages.ThriveApiPage {...props} />;
      case 'metaview-relyance': return <Pages.IntegrationsPage {...props} />;
      case 'ai-features': return <Pages.AiFeaturesPage {...props} />;
      case 'reports-branding': return <Pages.ReportsBrandingPage {...props} />;
      case 'document-labels': return <AdminCustom.DocumentLabelsPage />;
      case 'event-type': return <AdminCustom.EventTypePage />;
      case 'team-function-labels': return <AdminCustom.TeamFunctionLabelsPage />;
      default: return <EmptyPage label={ALL_LABELS[route] || 'Page'} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar route={route} setRoute={setRoute} expanded={expanded} setExpanded={setExpanded} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <ContentTopBar />
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--bg-primary)' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

window.AdminApp = App;
