// ============================================================
// Thrive TRM — Project drawer → Strategy tab
//   Tags · Targeted Companies · Benchmark Candidates · Similar Projects
//   Each section supports adding (and tags support removing) items.
// ============================================================
const { useState: useStrat } = React;

// ---- section header with count + right action ----
function StratSection({ title, count, action, children }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, minHeight: 32 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>
          {title}{count != null && <span style={{ color: 'var(--fg-quaternary)', fontWeight: 600 }}> ({count})</span>}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ---- small square "+" add button ----
function StratAddBtn({ onClick, active }) {
  const [h, setH] = useStrat(false);
  return (
    <button type="button" onClick={onClick} title="Add" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: active || h ? 'var(--bg-brand-primary)' : '#fff', color: active ? 'var(--color-brand-600)' : 'var(--fg-tertiary)', boxShadow: 'var(--shadow-xs)', transition: 'background 120ms' }}>
      <Icon.Plus width={18} height={18} />
    </button>
  );
}

// ---- inline add row (text input + Add/Cancel) ----
function StratAddRow({ placeholder, onAdd, onCancel }) {
  const [v, setV] = useStrat('');
  const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        style={{ flex: 1, height: 40, padding: '0 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-brand)', borderRadius: 9, outline: 'none', boxShadow: 'var(--shadow-focus-ring)' }} />
      <button type="button" onClick={submit} style={{ height: 40, padding: '0 16px', borderRadius: 9, border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', boxShadow: 'var(--shadow-skeu)' }}>Add</button>
      <button type="button" onClick={onCancel} style={{ height: 40, padding: '0 14px', borderRadius: 9, border: '1px solid var(--border-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, background: '#fff', color: 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)' }}>Cancel</button>
    </div>
  );
}

// ---- card grid wrapper (2-up) ----
function StratGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 14 }}>{children}</div>;
}

const stratCardStyle = { background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-xs)' };

// ---- targeted company card ----
function CompanyCard({ c }) {
  const { HubLink } = HubUI;
  const initial = (c.name || '?').trim()[0].toUpperCase();
  const Metric = ({ icon, value }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--fg-tertiary)' }}>
      <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}>{React.cloneElement(icon, { width: 15, height: 15 })}</span>
      {value || '—'}
    </span>
  );
  return (
    <div style={stratCardStyle}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{initial}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <HubLink size={15}>{c.name}</HubLink>
          <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 2 }}>{c.location}</div>
          {c.tag && <div style={{ marginTop: 8 }}><span style={{ display: 'inline-block', maxWidth: '100%', fontSize: 12, fontWeight: 500, color: 'var(--fg-secondary)', background: 'var(--bg-tertiary)', borderRadius: 6, padding: '3px 9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{c.tag}</span></div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <Metric icon={<Icon.Building />} value={c.revenue} />
        <Metric icon={<Icon.Users />} value={c.size} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-secondary)' }}>
        <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }}><Icon.Link width={16} height={16} /></span>
        <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }}><Icon.LinkedIn width={16} height={16} /></span>
        <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Current and former employees</span>
      </div>
    </div>
  );
}

// ---- benchmark candidate card ----
function BenchmarkCard({ b }) {
  const { HubLink, HubAvatar } = HubUI;
  return (
    <div style={stratCardStyle}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <HubAvatar name={b.name} glyph={<Icon.User />} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <HubLink size={15}>{b.name}</HubLink>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 2 }}>{b.company}</div>
        </div>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', cursor: 'pointer', flexShrink: 0 }}><Icon.DotsVertical width={18} height={18} /></span>
      </div>
    </div>
  );
}

// ---- similar project card ----
function SimilarProjectCard({ s }) {
  const { HubLink } = HubUI;
  return (
    <div style={stratCardStyle}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Briefcase width={20} height={20} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><HubLink size={15}>{s.name}</HubLink></span>
          <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 2 }}>{s.company}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-quaternary)' }}><Icon.Globe width={14} height={14} />{s.location}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-quaternary)' }}><Icon.Tag width={14} height={14} />No tags</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-quaternary)' }}><Icon.User width={14} height={14} />{s.lead || 'No lead assigned'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-secondary)', fontSize: 13 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-quaternary)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-gray-400)' }} />{s.status}</span>
        <span style={{ color: 'var(--fg-tertiary)', fontWeight: 500 }}>{s.candidates} Candidates</span>
      </div>
    </div>
  );
}

// ============================================================
// Strategy tab
// ============================================================
function StrategyTab() {
  const init = HubData.STRATEGY;
  const [tags, setTags] = useStrat(init.tags);
  const [companies, setCompanies] = useStrat(init.targetedCompanies);
  const [benchmarks, setBenchmarks] = useStrat(init.benchmarkCandidates);
  const [similar, setSimilar] = useStrat(init.similarProjects);

  const [showAllCompanies, setShowAllCompanies] = useStrat(false);
  const [adding, setAdding] = useStrat(null);     // 'tag' | 'company' | 'benchmark' | 'similar'
  const toggleAdd = (k) => setAdding(a => a === k ? null : k);

  const companiesShown = showAllCompanies ? companies : companies.slice(0, 2);

  return (
    <div>
      {/* Tags */}
      <StratSection title="Tags" count={tags.length}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {tags.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 6px 5px 12px', borderRadius: 9999, border: '1px solid var(--border-primary)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>
              {t}
              <button type="button" onClick={() => setTags(arr => arr.filter((_, j) => j !== i))} title="Remove tag"
                style={{ width: 18, height: 18, borderRadius: '50%', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--fg-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-quaternary)'; }}>
                <Icon.X width={13} height={13} />
              </button>
            </span>
          ))}
          {adding === 'tag' ? (
            <TagInput onAdd={(t) => { setTags(arr => [...arr, t]); }} onClose={() => setAdding(null)} />
          ) : (
            <button type="button" onClick={() => toggleAdd('tag')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, border: '1px dashed var(--border-primary)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-brand-600)' }}>
              <Icon.Plus width={15} height={15} /> Add tag
            </button>
          )}
        </div>
      </StratSection>

      {/* Targeted Companies */}
      <StratSection title="Targeted Companies" count={companies.length}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {companies.length > 2 && (
              <button type="button" onClick={() => setShowAllCompanies(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)' }}>
                {showAllCompanies ? 'Show less' : 'Show all'}
                <span style={{ display: 'inline-flex', transform: showAllCompanies ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}><Icon.ChevronDown width={16} height={16} /></span>
              </button>
            )}
            <StratAddBtn onClick={() => toggleAdd('company')} active={adding === 'company'} />
          </div>
        }>
        {adding === 'company' && <StratAddRow placeholder="Company name" onCancel={() => setAdding(null)}
          onAdd={(name) => { setCompanies(arr => [...arr, { name, location: 'Location to be confirmed', tag: null, revenue: null, size: null }]); setShowAllCompanies(true); setAdding(null); }} />}
        <StratGrid>{companiesShown.map((c, i) => <CompanyCard key={i} c={c} />)}</StratGrid>
      </StratSection>

      {/* Benchmark Candidates */}
      <StratSection title="Benchmark Candidates" count={benchmarks.length}
        action={<StratAddBtn onClick={() => toggleAdd('benchmark')} active={adding === 'benchmark'} />}>
        {adding === 'benchmark' && <StratAddRow placeholder="Candidate name" onCancel={() => setAdding(null)}
          onAdd={(name) => { setBenchmarks(arr => [...arr, { name, title: 'Title to be confirmed', company: '—' }]); setAdding(null); }} />}
        <StratGrid>{benchmarks.map((b, i) => <BenchmarkCard key={i} b={b} />)}</StratGrid>
      </StratSection>

      {/* Similar Projects */}
      <StratSection title="Similar Projects" count={similar.length}
        action={<StratAddBtn onClick={() => toggleAdd('similar')} active={adding === 'similar'} />}>
        {adding === 'similar' && <StratAddRow placeholder="Project name" onCancel={() => setAdding(null)}
          onAdd={(name) => { setSimilar(arr => [...arr, { name, company: '—', location: 'Unknown location', lead: null, status: 'Not started', candidates: 0 }]); setAdding(null); }} />}
        <StratGrid>{similar.map((s, i) => <SimilarProjectCard key={i} s={s} />)}</StratGrid>
      </StratSection>
    </div>
  );
}

// tag input as its own component so it can autofocus + manage its value
function TagInput({ onAdd, onClose }) {
  const [v, setV] = useStrat('');
  const submit = () => { const t = v.trim(); if (t) { onAdd(t); setV(''); } };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Industry or sector"
        onKeyDown={(e) => { if (e.key === 'Enter') { submit(); } if (e.key === 'Escape') onClose(); }}
        onBlur={() => { if (!v.trim()) onClose(); }}
        style={{ height: 32, width: 170, padding: '0 12px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-brand)', borderRadius: 9999, outline: 'none', boxShadow: 'var(--shadow-focus-ring)' }} />
      <button type="button" onMouseDown={(e) => { e.preventDefault(); submit(); }} style={{ height: 32, width: 32, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check width={16} height={16} /></button>
    </span>
  );
}

window.StrategyTab = StrategyTab;
