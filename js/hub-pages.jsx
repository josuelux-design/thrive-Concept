// ============================================================
// Thrive TRM — Hub parent pages
// ============================================================
const { useState: useP } = React;
const {
  HubAvatar, HubPageHead, HubSearch, HubIconBtn, HubViewToggle, HubTabs, HubTag, HubFlag,
  HubLink, HubCard, HubStatus, HubStageBadge, HubPagination, HubCheckbox, HubMiniIcon, hubTh, hubTd,
} = HubUI;

const hubLoc = (o) => [o.city, o.region, o.country].filter(Boolean).join(', ');
const hubPageWrap = { padding: '32px 40px 64px', minHeight: '100%' };

// ---- "Actively considered in a project" briefcase indicator ----
// Orange when the person has reached an advanced stage (past Screening, excl. Rejected).
// Hover → tooltip of the project(s); click → open the Projects tab in the person panel.
const IPB_ADV = ['Hiring Team Interview', 'Offer', 'Hired'];
function InProjectBriefcase({ p, onOpen, size = 16 }) {
  const [hover, setHover] = useP(false);
  const detail = HubData.enrichPerson(p);
  const aps = detail.activeProjects || [];
  const advanced = !!detail.advancedInProject;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span onClick={(e) => { e.stopPropagation(); onOpen(); }} style={{ color: advanced ? 'var(--fg-warning)' : 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }}>
        <Icon.Briefcase width={size} height={size} />
      </span>
      {hover && aps.length > 0 && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', zIndex: 60, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: '10px 12px', minWidth: 210, maxWidth: 290, pointerEvents: 'none', whiteSpace: 'normal' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 7 }}>Actively considered in</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aps.map((ap, i) => {
              const adv = IPB_ADV.includes(ap.stage);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6, background: adv ? 'var(--color-warning-500)' : 'var(--color-brand-500)' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>{ap.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-quaternary)', marginTop: 1 }}>{ap.company} · <span style={{ color: adv ? 'var(--fg-warning)' : 'var(--fg-tertiary)', fontWeight: 500 }}>{ap.stage}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #fff', filter: 'drop-shadow(0 1px 0 var(--border-secondary))' }} />
        </div>
      )}
    </span>
  );
}

// ============================================================
// COMPANIES
// ============================================================
function CompaniesPage() {
  const [view, setView] = useP('card');
  const data = HubData.COMPANIES;
  const head = (
    <HubPageHead title="Companies" subtitle="Search for companies to view details including financials, employees, related projects, and much more." count={10000}
      right={<>
        <HubSearch placeholder="Search by name" width={260} />
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" badge={1} />
        <HubViewToggle view={view} setView={setView} />
        <div style={{ width: 1, height: 28, background: 'var(--border-secondary)' }} />
        <HubIconBtn icon={<Icon.Download />} title="Export" />
      </>} />
  );

  const Card = ({ c }) => (
    <HubCard>
      <div style={{ display: 'flex', gap: 14 }}>
        <HubAvatar name={c.name} glyph={<Icon.Building />} logo={HubData.companyLogo(c.name)} size={46} square />
        <div style={{ flex: 1, minWidth: 0 }}>
          <HubLink size={18}>{c.name}</HubLink>
          <div style={{ fontSize: 15, color: 'var(--fg-quaternary)', marginTop: 4 }}>{hubLoc(c) || ' '}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap', minHeight: 26 }}>
        <HubFlag on={c.offLimits} />
        {c.tags.length === 0 ? <span style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>No tags</span>
          : <>{c.tags.slice(0, 2).map(t => <HubTag key={t}>{t}</HubTag>)}{c.tags.length > 2 && <span style={{ fontSize: 14, color: 'var(--fg-quaternary)', fontWeight: 600 }}>…</span>}</>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14, fontSize: 14, color: 'var(--fg-tertiary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Trending width={18} height={18} /> {c.revenue}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Users width={18} height={18} /> {c.headcount}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Network width={18} height={18} /> -</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <HubMiniIcon icon={<Icon.Link />} title="Website" />
        <HubMiniIcon icon={<Icon.LinkedIn />} title="LinkedIn" />
      </div>
    </HubCard>
  );

  return (
    <div style={hubPageWrap}>
      {head}
      {view === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {data.map((c, i) => <Card key={i} c={c} />)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ ...hubTh, width: 44 }}><HubCheckbox /></th>
              <th style={hubTh}>Name</th><th style={hubTh}>Off Limits</th><th style={hubTh}>Location</th>
              <th style={hubTh}>Links</th><th style={hubTh}>Revenue</th><th style={hubTh}>Headcount</th><th style={hubTh}>Tags</th>
            </tr></thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={hubTd}><HubCheckbox /></td>
                  <td style={hubTd}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><HubAvatar name={c.name} glyph={<Icon.Building />} logo={HubData.companyLogo(c.name)} size={40} square /><div><HubLink size={15}>{c.name}</HubLink><div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>{hubLoc(c) || '-'}</div></div></div></td>
                  <td style={hubTd}><HubFlag on={c.offLimits} /></td>
                  <td style={{ ...hubTd, lineHeight: '20px' }}>{c.city ? <>{c.city}<br /><span style={{ color: 'var(--fg-quaternary)', fontSize: 14 }}>{c.region}</span><br /><span style={{ color: 'var(--fg-quaternary)', fontSize: 14 }}>{c.country}</span></> : '-'}</td>
                  <td style={hubTd}><div style={{ display: 'flex', gap: 4 }}><HubMiniIcon icon={<Icon.Link />} /><HubMiniIcon icon={<Icon.LinkedIn />} /></div></td>
                  <td style={hubTd}>{c.revenue}</td>
                  <td style={hubTd}>{c.headcount}</td>
                  <td style={{ ...hubTd, minWidth: 240 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{c.tags.slice(0, 2).map(t => <HubTag key={t}>{t}</HubTag>)}{c.tags.length > 2 && <span style={{ fontSize: 13, color: 'var(--fg-quaternary)', fontWeight: 600, alignSelf: 'center' }}>…</span>}{c.tags.length === 0 && '-'}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 20px' }}><HubPagination start={1} end={24} total={10000} /></div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PEOPLE
// ============================================================
function PeoplePage({ onOpenPerson }) {
  const [view, setView] = useP('card');
  const [selIdx, setSelIdx] = useP(null);
  const [selTab, setSelTab] = useP('Experience');
  const [createOpen, setCreateOpen] = useP(false);
  const openPanel = (idx, tab) => { setSelIdx(idx); setSelTab(tab || 'Experience'); };
  // Clicking a person from the People index now opens the full-page profile
  // (side panel remains for in-project contexts). Deep links like "off limits" or
  // "projects" still work — we store the desired anchor via the profile section id.
  const openPerson = (idx) => {
    try {
      localStorage.setItem(window.PersonKeys.PERSON_IDX_KEY, String(idx));
      localStorage.removeItem(window.PersonKeys.NEW_PERSON_KEY);
    } catch (_) {}
    onOpenPerson && onOpenPerson();
  };
  const onCreatePerson = (draft) => {
    try {
      localStorage.setItem(window.PersonKeys.NEW_PERSON_KEY, JSON.stringify(draft));
    } catch (_) {}
    setCreateOpen(false);
    onOpenPerson && onOpenPerson();
  };
  const data = HubData.PEOPLE;
  const head = (
    <HubPageHead title="People" subtitle="Search for people across your network and easily contact them, add them to projects, and much more." count={1362288}
      right={<>
        <HubSearch placeholder="Search by name" width={260} />
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" badge={1} />
        <HubViewToggle view={view} setView={setView} />
        <div style={{ width: 1, height: 28, background: 'var(--border-secondary)' }} />
        <HubIconBtn icon={<Icon.Download />} title="Export" />
        <button type="button" onClick={() => setCreateOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-on-brand)', background: 'var(--bg-brand-solid)', boxShadow: 'var(--shadow-skeu)' }}>
          <Icon.Plus width={16} height={16} />New person
        </button>
      </>} />
  );

  const Actions = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <HubMiniIcon icon={<Icon.IdCard />} title="Summary" />
      <HubMiniIcon icon={<Icon.LinkedIn />} title="LinkedIn" />
      <HubMiniIcon icon={<Icon.Mail />} title="Email" />
      <HubMiniIcon icon={<Icon.Phone />} title="Call" />
      <span style={{ width: 1, height: 22, background: 'var(--border-secondary)', margin: '0 6px' }} />
      <HubMiniIcon icon={<Icon.AddProject />} accent title="Add to project" />
      <HubMiniIcon icon={<Icon.AddList />} accent title="Add to list" />
    </div>
  );

  const Card = ({ p, idx }) => (
    <HubCard>
      <div style={{ display: 'flex', gap: 14 }}>
        <HubAvatar name={p.name} size={48} ring={!!(p.offLimits || p.flag)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={() => openPerson(idx)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={18}>{p.name}</HubLink></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: p.title ? 'var(--fg-primary)' : 'var(--fg-quaternary)', marginTop: 2 }}>{p.title || 'No primary Position'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, minWidth: 0, whiteSpace: 'nowrap' }}>
            {p.offLimits && <span onClick={(e) => { e.stopPropagation(); openPerson(idx); }} title="View off limits" style={{ flexShrink: 0, display: 'inline-flex', cursor: 'pointer' }}><HubFlag /></span>}
            {p.inProject && <InProjectBriefcase p={p} onOpen={() => openPerson(idx)} />}
            {p.company ? <span style={{ flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}><HubLink size={15}>{p.company}</HubLink></span> : <span style={{ fontSize: 15, color: 'var(--fg-quaternary)' }}>No Primary Company</span>}
          </div>
          <div style={{ fontSize: 15, color: 'var(--fg-quaternary)', marginTop: 4 }}>{hubLoc(p) || 'Unknown location'}</div>
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px 0 12px' }} />
      <Actions />
    </HubCard>
  );

  return (
    <div style={hubPageWrap}>
      {head}
      {view === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
          {data.map((p, i) => <Card key={i} p={p} idx={i} />)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ ...hubTh, width: 44 }}><HubCheckbox /></th>
              <th style={hubTh}>Name</th><th style={hubTh}>Off Limits</th><th style={hubTh}>Primary Title</th>
              <th style={hubTh}>Primary Company</th><th style={hubTh}>Location</th><th style={hubTh}>Contact Info</th><th style={hubTh}>Tags</th>
            </tr></thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={hubTd}><HubCheckbox /></td>
                  <td style={hubTd}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><HubAvatar name={p.name} size={38} ring={!!(p.offLimits || p.flag)} /><span onClick={() => openPerson(i)} style={{ display: 'inline-flex', cursor: 'pointer' }}><HubLink size={15}>{p.name}</HubLink></span></div></td>
                  <td style={hubTd}><div style={{ display: 'flex', gap: 8 }}>{p.offLimits && <span onClick={() => openPerson(i)} title="View off limits" style={{ display: 'inline-flex', cursor: 'pointer' }}><HubFlag /></span>}{p.inProject && <InProjectBriefcase p={p} onOpen={() => openPerson(i)} />}{!p.offLimits && !p.inProject && '-'}</div></td>
                  <td style={{ ...hubTd, maxWidth: 220 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title || '-'}</span></td>
                  <td style={hubTd}>{p.company ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><HubAvatar name={p.company} glyph={<Icon.Building />} logo={HubData.companyLogo(p.company)} size={32} square /><HubLink size={15}>{p.company.length > 18 ? p.company.slice(0, 18) + '…' : p.company}</HubLink></div> : <span style={{ color: 'var(--fg-quaternary)' }}>{p.title ? '-' : 'No Primary Company'}</span>}</td>
                  <td style={{ ...hubTd, lineHeight: '20px' }}>{p.city ? <>{p.city}<br /><span style={{ color: 'var(--fg-quaternary)', fontSize: 14 }}>{p.region}</span><br /><span style={{ color: 'var(--fg-quaternary)', fontSize: 14 }}>{p.country}</span></> : '-'}</td>
                  <td style={hubTd}><div style={{ display: 'flex', gap: 2 }}><HubMiniIcon icon={<Icon.IdCard />} /><HubMiniIcon icon={<Icon.LinkedIn />} /><HubMiniIcon icon={<Icon.Mail />} /><HubMiniIcon icon={<Icon.Phone />} /></div></td>
                  <td style={hubTd}>{p.tags.length ? <div style={{ display: 'flex', gap: 6 }}>{p.tags.map(t => <HubTag key={t}>{t}</HubTag>)}</div> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 20px' }}><HubPagination start={1} end={24} total={1362288} /></div>
        </div>
      )}
      {selIdx != null && (
        <CandidatePanel candidate={data[selIdx]} index={selIdx} total={1597632} initialTab={selTab}
          onPrev={() => setSelIdx((selIdx - 1 + data.length) % data.length)}
          onNext={() => setSelIdx((selIdx + 1) % data.length)}
          onClose={() => setSelIdx(null)} />
      )}
      {createOpen && <window.CreatePersonModal onClose={() => setCreateOpen(false)} onCreate={onCreatePerson}
        onViewExisting={(match) => {
          const i = data.findIndex(x => x.name === match.name);
          if (i >= 0) openPanel(i, 'Overview');
        }} />}
    </div>
  );
}

// ============================================================
// PROJECTS
// ============================================================
function ProjectsPage({ onOpenProject }) {
  const [view, setView] = useP('card');
  const [createOpen, setCreateOpen] = useP(false);
  const data = HubData.PROJECTS;
  const onCreate = (draft) => {
    try { localStorage.setItem(window.ProjCreate.NEW_PROJECT_KEY, JSON.stringify(draft)); } catch (_) {}
    setCreateOpen(false);
    onOpenProject && onOpenProject();
  };
  const head = (
    <HubPageHead title="Projects" subtitle="Manage your projects and search for projects across your company." count={10000}
      right={<>
        <HubSearch placeholder="Search by title, lead" width={260} />
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" badge={1} />
        <HubViewToggle view={view} setView={setView} />
        <div style={{ width: 1, height: 28, background: 'var(--border-secondary)' }} />
        <HubIconBtn icon={<Icon.Download />} title="Export" />
        <button type="button" onClick={() => setCreateOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-on-brand)', background: 'var(--bg-brand-solid)', boxShadow: 'var(--shadow-skeu)' }}>
          <Icon.Plus width={16} height={16} />New project
        </button>
      </>} />
  );

  const initials = (n) => n.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const Card = ({ p }) => (
    <HubCard onClick={() => onOpenProject && onOpenProject()}>
      <div style={{ display: 'flex', gap: 14 }}>
        <HubAvatar name={p.company} glyph={<Icon.Briefcase />} logo={HubData.companyLogo(p.company)} size={46} square />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={18}>{p.title}</HubLink></div>
          <div style={{ marginTop: 2 }}><HubLink size={15}>{p.company}</HubLink></div>
        </div>
      </div>
      <div style={{ fontSize: 15, color: 'var(--fg-quaternary)', marginTop: 12 }}>{hubLoc(p) || 'Unknown location'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0 }}><Icon.Tag width={18} height={18} /></span>
        {p.tags.length ? <>{p.tags.slice(0, 2).map(t => <HubTag key={t}>{t}</HubTag>)}{p.tags.length > 2 && <span style={{ fontSize: 14, color: 'var(--fg-quaternary)', fontWeight: 600 }}>…</span>}</> : <span style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>No tags</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(p.lead)}</span>
        <span style={{ fontSize: 15, color: 'var(--fg-secondary)', fontWeight: 500 }}>{p.lead}</span>
        <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }}><Icon.Mail width={18} height={18} /></span>
      </div>
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px 0 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <HubStatus status={p.status} />
        <HubStageBadge stage={p.stage} />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-tertiary)' }}>{p.candidates} Candidates</span>
      </div>
    </HubCard>
  );

  return (
    <div style={hubPageWrap}>
      {head}
      {view === 'card' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {data.map((p, i) => <Card key={i} p={p} />)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ ...hubTh, width: 44 }}><HubCheckbox /></th>
              <th style={hubTh}>Title</th><th style={hubTh}>Company</th><th style={hubTh}>Status</th>
              <th style={hubTh}>Lead</th><th style={hubTh}>Open Date</th><th style={hubTh}>Candidates</th><th style={hubTh}>Confidential</th>
            </tr></thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i} onClick={() => onOpenProject && onOpenProject()} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={hubTd}><HubCheckbox /></td>
                  <td style={{ ...hubTd, maxWidth: 260 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={15}>{p.title}</HubLink></span></td>
                  <td style={hubTd}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><HubAvatar name={p.company} glyph={<Icon.Building />} logo={HubData.companyLogo(p.company)} size={32} square /><HubLink size={15}>{p.company.length > 16 ? p.company.slice(0, 16) + '…' : p.company}</HubLink></div></td>
                  <td style={hubTd}><HubStatus status={p.status} /></td>
                  <td style={hubTd}>{p.lead}</td>
                  <td style={hubTd}>{p.openDate}</td>
                  <td style={hubTd}>{p.candidates}</td>
                  <td style={hubTd}>{p.confidential ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 20px' }}><HubPagination start={1} end={24} total={10000} /></div>
        </div>
      )}
      {createOpen && <window.ProjCreate.CreateProjectModal onClose={() => setCreateOpen(false)} onCreate={onCreate} />}
    </div>
  );
}

// ============================================================
// LISTS (People / Company / Project tabs)
// ============================================================
function ListsPage() {
  const [tab, setTab] = useP('people');
  const counts = HubData.LIST_COUNTS;
  const data = HubData.LISTS[tab];
  const glyphFor = { people: <Icon.User />, company: <Icon.Building />, project: <Icon.Briefcase /> }[tab];
  const placeholder = { people: 'Search by list name, person and creator', company: 'Search by name, location, sector...', project: 'Search by list name, title, hiring company and creator' }[tab];

  const Card = ({ l }) => (
    <HubCard>
      <HubLink size={18}>{l.name}</HubLink>
      {l.desc ? <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', margin: '6px 0 0' }}>{l.desc}</div> : null}
      <div style={{ display: 'flex', gap: 40, marginTop: 14 }}>
        <div><div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Created</div><div style={{ fontSize: 15, color: 'var(--fg-primary)', marginTop: 2 }}>{l.created}</div><div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>{l.createdBy}</div></div>
        <div><div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Last Updated</div><div style={{ fontSize: 15, color: 'var(--fg-primary)', marginTop: 2 }}>{l.updated}</div><div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>{l.updatedBy}</div></div>
      </div>
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px 0 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-quaternary)' }}>
        {React.cloneElement(glyphFor, { width: 20, height: 20 })}
        {l.count > 0 && <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-brand-600)' }}>{l.count}</span>}
      </div>
    </HubCard>
  );

  return (
    <div style={hubPageWrap}>
      <HubPageHead title="Lists" subtitle="Collect project, people and company records to help you organize, plan, and execute more effectively." />
      <HubTabs active={tab} onChange={setTab} tabs={[{ id: 'people', label: 'People' }, { id: 'company', label: 'Company' }, { id: 'project', label: 'Project' }]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><HubSearch placeholder={placeholder} center /></div>
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" />
        <HubIconBtn icon={<Icon.Funnel />} title="Sort" />
        <HubIconBtn icon={<Icon.Plus />} title="New list" accent />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 18 }}>{counts[tab].toLocaleString()} results</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {data.map((l, i) => <Card key={i} l={l} />)}
      </div>
    </div>
  );
}

// ============================================================
// MARKET MAPS
// ============================================================
function MarketMapsPage() {
  const data = HubData.MARKET_MAPS;
  const Card = ({ m }) => (
    <HubCard>
      <div style={{ display: 'flex', gap: 14 }}>
        <HubAvatar name={m.name} glyph={<Icon.Map />} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={18}>{m.name}</HubLink></div>
        </div>
      </div>
      <div style={{ fontSize: 15, color: 'var(--fg-secondary)', margin: '12px 0 0', minHeight: 44, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.desc}</div>
      <div style={{ display: 'flex', gap: 40, marginTop: 12 }}>
        <div><div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Created:</div><div style={{ fontSize: 15, color: 'var(--fg-primary)', marginTop: 2 }}>{m.created}</div><div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>{m.by}</div></div>
        <div><div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Last updated:</div><div style={{ fontSize: 15, color: 'var(--fg-primary)', marginTop: 2 }}>{m.created}</div><div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>{m.by}</div></div>
      </div>
      <div style={{ height: 1, background: 'var(--border-secondary)', margin: '14px 0 12px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: 'var(--fg-quaternary)', fontSize: 15 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon.Building width={18} height={18} /><span style={{ color: m.companies ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', fontWeight: 600 }}>{m.companies}</span></span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon.Users width={18} height={18} /><span style={{ color: m.people ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', fontWeight: 600 }}>{m.people}</span></span>
      </div>
    </HubCard>
  );
  return (
    <div style={hubPageWrap}>
      <HubPageHead title="Market Maps" subtitle="Create a visual breakdown of potential candidates by company, level, and function, helping you track research progress and identify gaps." />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><HubSearch placeholder="Search..." center /></div>
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" />
        <HubIconBtn icon={<Icon.Funnel />} title="Sort" />
        <HubIconBtn icon={<Icon.Plus />} title="New map" accent />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 18 }}>{HubData.MARKET_MAPS_COUNT} results</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        {data.map((m, i) => <Card key={i} m={m} />)}
      </div>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================
function ExportsMenu() {
  const [open, setOpen] = useP(false);
  const [h, setH] = useP(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const items = ['Monthly Available Talent', 'Monthly Available Talent without Reference', 'Introductions'];
  const gen = (label) => { HubUI.showHubReportToast(`${label.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_-_${new Date().toISOString().slice(0, 10)}`, 'CSV', { hideGoToExports: true }); setOpen(false); };
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" onClick={() => setOpen(o => !o)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 44, height: 44, borderRadius: 10, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: (open || h) ? 'var(--bg-primary-hover)' : 'transparent', border: 0, color: 'var(--color-brand-600)', transition: 'background 120ms ease-out' }}>
        <Icon.FileDown width={22} height={22} />
      </button>
      {h && !open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', zIndex: 70, padding: '6px 10px', background: 'var(--fg-primary)', color: '#fff', fontSize: 13, fontWeight: 500, borderRadius: 7, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)', pointerEvents: 'none' }}>Export</div>
      )}
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 60, minWidth: 300, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6, animation: 'tt-pop 130ms ease-out', transformOrigin: 'top right' }}>
          <div style={{ padding: '6px 12px 8px', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>Export CSV</div>
          {items.map((label, i) => (
            <button key={i} type="button" onClick={() => gen(label)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', border: 0, background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--fg-secondary)', textAlign: 'left' }}>
              <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', flexShrink: 0 }}><Icon.FileCsv width={20} height={20} /></span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExportsPage() {
  const [added, setAdded] = useP(() => window.hubExports || []);
  React.useEffect(() => {
    const onAdd = () => setAdded([...(window.hubExports || [])]);
    window.addEventListener('hub-export-added', onAdd);
    return () => window.removeEventListener('hub-export-added', onAdd);
  }, []);
  const data = [...added, ...HubData.EXPORTS];
  return (
    <div style={hubPageWrap}>
      <HubPageHead title="Exports" subtitle="View a history of reports and CSVs you have generated." />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><HubSearch placeholder="Search..." center /></div>
        <ExportsMenu />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-quaternary)', marginBottom: 18 }}>{data.length} results</div>
      <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={hubTh}>Report</th><th style={hubTh}>File Type</th><th style={hubTh}>Generated</th><th style={hubTh}>Downloaded</th><th style={{ ...hubTh, width: 64 }}></th>
          </tr></thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...hubTd, fontWeight: 500, color: 'var(--fg-primary)' }}>{r.report}</td>
                <td style={hubTd}>{r.type}</td>
                <td style={hubTd}>{r.generated}</td>
                <td style={hubTd}>{r.downloaded || '-'}</td>
                <td style={hubTd}><HubMiniIcon icon={<Icon.Download />} title="Download" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, fontSize: 14, color: 'var(--fg-tertiary)' }}>Total Results: {data.length}</div>
    </div>
  );
}

// ============================================================
// ANALYTICS → USER REPORT
// ============================================================
const HUB_CHART_BLUE = '#4F9CE8';

function HubLineChart({ data, color = HUB_CHART_BLUE }) {
  const W = 580, H = 250, padL = 46, padR = 14, padT = 12, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const max = Math.max(...data.map(d => d.v));
  const yMax = max; const ticks = 5;
  const x = (i) => padL + plotW * (i / (data.length - 1));
  const y = (v) => padT + plotH * (1 - v / yMax);
  const fmt = (n) => Number.isInteger(n) ? n : n.toFixed(1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {Array.from({ length: ticks }).map((_, i) => {
        const val = yMax * (1 - i / (ticks - 1)); const yy = padT + plotH * (i / (ticks - 1));
        return <g key={i}>
          <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--color-gray-200)" strokeWidth="1" />
          <text x={padL - 10} y={yy + 4} textAnchor="end" fontSize="12" fill="var(--color-gray-500)" fontFamily="var(--font-body)">{fmt(val)}</text>
        </g>;
      })}
      <polyline points={data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--color-gray-500)" fontFamily="var(--font-body)">{d.x}</text>)}
    </svg>
  );
}

function HubBarChart({ rows, color = HUB_CHART_BLUE, labelW = 150, barMax = 320 }) {
  const max = Math.max(...rows.map(r => r.v));
  const rowH = 34;
  const W = labelW + barMax + 60, H = rows.length * rowH + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {rows.map((r, i) => {
        const yy = i * rowH + 8; const bw = Math.max(8, (r.v / max) * barMax);
        return <g key={i}>
          <text x={labelW - 10} y={yy + rowH / 2 - 2} textAnchor="end" fontSize="13" fill="var(--color-gray-700)" fontFamily="var(--font-body)">{r.label}</text>
          <rect x={labelW} y={yy} width={bw} height={rowH - 14} rx="3" fill={color} />
          <text x={labelW + bw + 8} y={yy + rowH / 2 - 2} fontSize="13" fontWeight="600" fill="var(--color-gray-900)" fontFamily="var(--font-body)">{r.v}</text>
        </g>;
      })}
    </svg>
  );
}

// ---- nice axis maximum (rounds up to a clean tick value) ----
function hubNiceMax(v, ticks = 4) {
  if (v <= 0) return ticks;
  const raw = v / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const steps = [1, 2, 2.5, 3, 5, 10];
  let step = 10 * pow;
  for (const s of steps) { if (s * pow >= raw) { step = s * pow; break; } }
  return step * ticks;
}

// ---- wrap a long label onto (max) 2 lines for SVG ----
function hubWrapLabel(label, maxChars = 17) {
  if (label.length <= maxChars) return [label];
  const words = label.split(' ');
  if (words.length === 1) return [label];
  let l1 = '', l2 = '';
  for (const w of words) {
    if (!l1 || (l1 + ' ' + w).trim().length <= maxChars) l1 = (l1 + ' ' + w).trim();
    else l2 = (l2 + ' ' + w).trim();
  }
  return l2 ? [l1, l2] : [l1];
}

// ---- Horizontal bar chart with x-axis + highlighted leader (Introductions by Company) ----
function HubHBarChart({ rows }) {
  const max = hubNiceMax(Math.max(...rows.map(r => r.v)), 4);
  const labelW = 142, barArea = 360, padR = 24, rowH = 46, axisH = 30, barH = 22;
  const W = labelW + barArea + padR, H = rows.length * rowH + axisH;
  const ticks = 5;
  const x = (v) => labelW + (v / max) * barArea;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {Array.from({ length: ticks }).map((_, i) => {
        const val = (max / (ticks - 1)) * i; const xx = x(val);
        return <g key={`g${i}`}>
          <line x1={xx} y1={4} x2={xx} y2={rows.length * rowH} stroke="var(--color-gray-200)" strokeWidth="1" strokeDasharray="3 4" />
          <text x={xx} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--color-gray-500)" fontFamily="var(--font-body)">{Math.round(val)}</text>
        </g>;
      })}
      {rows.map((r, i) => {
        const cy = i * rowH + rowH / 2;
        const bw = Math.max(3, (r.v / max) * barArea);
        const fill = i === 0 ? 'var(--color-brand-600)' : 'var(--color-brand-200)';
        const lines = hubWrapLabel(r.label);
        return <g key={i}>
          <text x={labelW - 14} y={cy} textAnchor="end" dominantBaseline="middle" fontSize="13" fill="var(--color-gray-700)" fontFamily="var(--font-body)">
            {lines.length === 1
              ? lines[0]
              : lines.map((ln, k) => <tspan key={k} x={labelW - 14} dy={k === 0 ? '-0.55em' : '1.2em'}>{ln}</tspan>)}
          </text>
          <rect x={labelW} y={cy - barH / 2} width={bw} height={barH} rx="4" fill={fill} />
        </g>;
      })}
    </svg>
  );
}

// ---- Vertical column chart, clickable (Introductions by Month) ----
function HubColumnChart({ bars }) {
  const [sel, setSel] = useP(null);
  const max = hubNiceMax(Math.max(...bars.map(b => b.v)), 4);
  const W = 560, H = 290, padL = 42, padR = 14, padT = 16, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const ticks = 5;
  const n = bars.length, slot = plotW / n, bw = Math.min(66, slot * 0.56);
  const y = (v) => padT + plotH * (1 - v / max);
  return (
    <div>
      <div style={{ minHeight: 22, marginBottom: 10, fontSize: 14, color: sel == null ? 'var(--fg-quaternary)' : 'var(--fg-secondary)' }}>
        {sel == null
          ? "Click a bar to see that month's introductions"
          : <span><strong style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>{bars[sel].x}</strong> — {bars[sel].v} introductions</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {Array.from({ length: ticks }).map((_, i) => {
          const val = max * (1 - i / (ticks - 1)); const yy = padT + plotH * (i / (ticks - 1));
          return <g key={`g${i}`}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--color-gray-200)" strokeWidth="1" strokeDasharray="3 4" />
            <text x={padL - 10} y={yy + 4} textAnchor="end" fontSize="12" fill="var(--color-gray-500)" fontFamily="var(--font-body)">{Math.round(val)}</text>
          </g>;
        })}
        {bars.map((b, i) => {
          const bx = padL + slot * i + (slot - bw) / 2;
          const by = y(b.v); const bh = Math.max(2, padT + plotH - by);
          const active = sel === i;
          const fill = sel == null || active ? 'var(--color-brand-600)' : 'var(--color-brand-200)';
          return <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSel(active ? null : i)}>
            <rect x={padL + slot * i} y={padT} width={slot} height={plotH} fill="transparent" />
            <rect x={bx} y={by} width={bw} height={bh} rx="5" fill={fill} style={{ transition: 'fill 120ms ease-out' }} />
            {active && <text x={bx + bw / 2} y={by - 8} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-gray-900)" fontFamily="var(--font-body)">{b.v}</text>}
            <text x={padL + slot * i + slot / 2} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--color-gray-500)" fontFamily="var(--font-body)">{b.x}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}

function HubChartCard({ title, children }) {
  const [open, setOpen] = useP(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const doExport = () => {
    setOpen(false);
    HubData.addExport(`${title} report`);
    HubUI.showHubToast({
      title: 'Generating report',
      message: `Your “${title}” report is being generated. It’ll appear on the Exports page shortly.`,
      actionLabel: 'Go to Exports',
      onAction: () => window.hubNavigate && window.hubNavigate('exports'),
    });
  };
  const [mh, setMh] = useP(false);
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</h3>
        <div ref={ref} style={{ position: 'relative' }}>
          <button type="button" onClick={() => setOpen(o => !o)} title="Options"
            onMouseEnter={() => setMh(true)} onMouseLeave={() => setMh(false)}
            style={{ width: 34, height: 34, borderRadius: 8, border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: open || mh ? 'var(--bg-primary-hover)' : 'transparent', color: 'var(--fg-quaternary)', transition: 'background 120ms ease-out' }}>
            <Icon.DotsVertical width={20} height={20} />
          </button>
          {open && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 30, minWidth: 184, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 6 }}>
              <button type="button" onClick={doExport}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', border: 0, background: 'transparent', borderRadius: 7, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', textAlign: 'left' }}>
                <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Download width={18} height={18} /></span>
                Export report
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function UserReportPage() {
  const r = HubData.USER_REPORT;
  return (
    <div style={hubPageWrap}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>User Report</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        {r.stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 600, color: 'var(--color-brand-600)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 16, color: 'var(--fg-secondary)' }}>
              {s.label}<span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Info width={16} height={16} /></span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        <HubChartCard title="Users by Month"><HubLineChart data={r.usersByMonth} /></HubChartCard>
        <HubChartCard title="Monthly Active Users"><HubLineChart data={r.mau} /></HubChartCard>
        <HubChartCard title="Internal Users by Role"><HubBarChart rows={r.roles} /></HubChartCard>
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS → CAPACITY REPORT
// ============================================================
function CapacityReportPage() {
  const r = HubData.CAPACITY_REPORT;
  return (
    <div style={hubPageWrap}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>Capacity Report</h1>
        <HubIconBtn icon={<Icon.Adjust />} title="Filters" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)', gap: 24, alignItems: 'start' }}>
        {/* Left — tall: Open Projects by User */}
        <div style={{ gridRow: '1 / span 2' }}>
          <HubChartCard title="Open Projects by User"><HubBarChart rows={r.openByUser} /></HubChartCard>
        </div>
        {/* Right top — line: Average Open Projects per User by Month */}
        <HubChartCard title="Average Open Projects per User by Month"><HubLineChart data={r.avgByMonth} /></HubChartCard>
        {/* Right bottom — bar: Average Open Projects by Role */}
        <HubChartCard title="Average Open Projects by Role"><HubBarChart rows={r.byRole} labelW={172} /></HubChartCard>
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS → INTRODUCTIONS
// ============================================================
function IntroStatCard({ value, label }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)', padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--color-brand-600)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value.toLocaleString()}</div>
      <div style={{ marginTop: 14, fontSize: 17, color: 'var(--fg-secondary)' }}>{label}</div>
    </div>
  );
}

function IntroductionsReportPage() {
  const r = HubData.INTRODUCTIONS;
  return (
    <div style={hubPageWrap}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>Introductions Report</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        <IntroStatCard value={r.totalIntroductions} label="Total Introductions" />
        <IntroStatCard value={r.relatedToSearch} label="Introductions Related to a Search" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, alignItems: 'start' }}>
        <HubChartCard title="Introductions by Company"><HubHBarChart rows={r.byCompany} /></HubChartCard>
        <HubChartCard title="Introductions by Month"><HubColumnChart bars={r.byMonth} /></HubChartCard>
      </div>
    </div>
  );
}

window.HubPages = {
  CompaniesPage, PeoplePage, ProjectsPage, ListsPage, MarketMapsPage, ExportsPage, UserReportPage, CapacityReportPage, IntroductionsReportPage,
};
