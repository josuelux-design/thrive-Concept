// ============================================================
// Thrive TRM — Candidate profile panel (right drawer)
// ============================================================
const { useState: useCP, useRef: useCPRef } = React;

// ---- Deterministic fake contact info per candidate (name/id-seeded, stable across renders) ----
function candSlug(name) { return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'candidate'; }
function candHandle(name) { return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'candidate'; }
function candSeed(c) { let h = 0; const s = String(c.id || c.name || '?'); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function candContact(c) {
  const domain = (c.company || 'example').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || 'example';
  const email = `${candSlug(c.name)}@${domain}.com`;
  const linkedin = `linkedin.com/in/${candHandle(c.name)}`;
  const h = candSeed(c);
  const area = 200 + (h % 799);
  const mid = 100 + ((h >> 5) % 899);
  const end = 1000 + ((h >> 10) % 8999);
  const phone = `+1 (${area}) ${mid}-${end}`;
  const resume = `${(c.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
  return { email, phone, linkedin, resume };
}

// ---- ContactField: quiet inline label + value + hover-revealed copy button ----
// One cell in the 2-col contact grid. No card surface — reads as text that happens
// to be structured. Copy icon is hidden at rest (opacity 0) and revealed on row
// hover OR button keyboard focus. Desktop-pointer only per product decision.
function ContactField({ label, value, ariaLabel, href, accent }) {
  const [copied, setCopied] = useCP(false);
  const [rowHover, setRowHover] = useCP(false);
  const [btnFocus, setBtnFocus] = useCP(false);
  const revealed = rowHover || btnFocus;
  const doCopy = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (value && navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  const valueStyle = {
    flex: 1, minWidth: 0, fontSize: 13, lineHeight: '17px', fontFamily: 'var(--font-body)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    color: accent ? 'var(--color-brand-700)' : 'var(--fg-primary)',
    textDecoration: 'none',
  };
  return (
    <div onMouseEnter={() => setRowHover(true)} onMouseLeave={() => setRowHover(false)}
      style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-quaternary)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {accent && href ? (
          <a href={href} target={href.startsWith('http') || href.startsWith('#') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            title={value} style={valueStyle}>{value}</a>
        ) : (
          <span title={value} style={valueStyle}>{value}</span>
        )}
        <button type="button" onClick={doCopy}
          onFocus={() => setBtnFocus(true)} onBlur={() => setBtnFocus(false)}
          aria-label={copied ? `${ariaLabel} copied` : ariaLabel}
          title={copied ? 'Copied' : ariaLabel}
          style={{
            width: 20, height: 20, flexShrink: 0, borderRadius: 4, border: 0, padding: 0,
            cursor: 'pointer', background: 'transparent',
            color: copied ? 'var(--color-success-600)' : 'var(--fg-quaternary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: revealed || copied ? 1 : 0,
            transition: 'opacity 120ms ease-out, color 120ms',
          }}>
          {copied ? <Icon.Check width={12} height={12} style={{ strokeWidth: 3 }} /> : <Icon.Copy2 width={12} height={12} />}
        </button>
      </div>
    </div>
  );
}

// ---- CandContactBar: inline 2-col grid, no surface. Sits directly under the
// ---- name/title/company header as quiet structured text.
function CandContactBar({ c }) {
  const { email, phone, linkedin, resume } = candContact(c);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', columnGap: 24, rowGap: 8 }}>
      <ContactField label="Email"    value={email}    ariaLabel="Copy email address" />
      <ContactField label="Phone"    value={phone}    ariaLabel="Copy phone number" />
      <ContactField label="LinkedIn" value={linkedin} ariaLabel="Copy LinkedIn URL"     href={`https://${linkedin}`} accent />
      <ContactField label="Resume"   value={resume}   ariaLabel="Copy resume filename" href="#" accent />
    </div>
  );
}

function CandPill({ children, tone }) {
  const tones = {
    red: { fg: 'var(--color-error-700)', bg: 'var(--bg-error-primary)' },
    blue: { fg: 'var(--color-brand-700)', bg: 'var(--bg-brand-primary)' },
  };
  const t = tones[tone] || tones.blue;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: t.fg, background: t.bg, borderRadius: 9999, padding: '3px 12px' }}>{children}</span>;
}

// ---- Experience tab ----
function CandExperience({ c }) {
  const { HubLink, HubAvatar } = HubUI;
  const [open, setOpen] = useCP({});
  const detail = HubData.enrichPerson(c);
  const exp = detail.experience || [];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Work</h3>
        <button type="button" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-secondary)', background: '#fff', cursor: 'pointer', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}><Icon.Plus width={18} height={18} /></button>
      </div>
      {exp.map((e, i) => e.group ? (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <HubAvatar name={e.group} glyph={<Icon.Building />} size={40} square />
            <div><HubLink size={16}>{e.group}</HubLink><div style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>{e.total}</div></div>
          </div>
          <div style={{ position: 'relative', paddingLeft: 20, marginLeft: 19, borderLeft: '2px solid var(--border-secondary)' }}>
            {e.roles.map((r, j) => {
              const isOpen = open[`${i}-${j}`];
              return (
                <div key={j} style={{ position: 'relative', paddingBottom: 22 }}>
                  <span style={{ position: 'absolute', left: -27, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid var(--color-gray-300)' }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{r.role}</div>
                  <div style={{ fontSize: 14, color: 'var(--fg-quaternary)', margin: '2px 0 8px' }}>{r.dates} • {r.months}</div>
                  {r.desc && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: '21px', color: 'var(--fg-secondary)', display: '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{r.desc}</p>
                      <button type="button" onClick={() => setOpen(o => ({ ...o, [`${i}-${j}`]: !isOpen }))} style={{ border: 0, background: 'transparent', color: 'var(--color-brand-600)', fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0, fontFamily: 'var(--font-body)' }}>More <Icon.ChevronDown width={14} height={14} /></button>
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', marginTop: 8 }}>Position Area</div>
                  <div style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>{r.area}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div key={i} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <HubAvatar name={e.company} glyph={<Icon.Building />} size={40} square />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{e.role}</span>
                {e.primary && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 9999, padding: '1px 9px' }}>Primary</span>}
              </div>
              <div style={{ marginTop: 2 }}><HubLink size={15}>{e.company}</HubLink></div>
              <div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 4 }}>{e.dates}{e.months ? ` • ${e.months}` : ''}</div>
              <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', marginTop: 10 }}>Position Area</div>
              <div style={{ fontSize: 14, color: 'var(--fg-quaternary)' }}>{e.area}</div>
            </div>
          </div>
        </div>
      ))}
      {detail.skills && detail.skills.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Skills &amp; Expertise</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {detail.skills.map((s, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 9999, fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)', background: 'var(--bg-tertiary)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Notes tab ----
function CandNotes({ c, startAdd }) {
  const detail = HubData.enrichPerson(c);
  const [notes, setNotes] = useCP(() => detail.notes || []);
  const [adding, setAdding] = useCP(!!startAdd);
  const addNote = (n) => {
    setNotes(list => [{ title: n.title, body: n.body, author: 'Angela Zhou', date: 'Just now', project: n.relType === 'Project' ? n.related : 'Chief Product Officer', related: n.related, relType: n.relType }, ...list]);
    setAdding(false);
    HubUI.showHubToast({ title: 'Note added', message: c.name });
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', display: 'inline-flex', pointerEvents: 'none' }}><Icon.Search width={18} height={18} /></span>
          <input placeholder="Search by keyword, people, projects..." style={{ width: '100%', boxSizing: 'border-box', height: 42, padding: '0 14px 0 38px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10, outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
        </div>
        <button type="button" title="Sort" style={{ width: 42, height: 42, borderRadius: 10, border: '1px solid var(--border-primary)', background: '#fff', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}><Icon.Adjust width={18} height={18} /></button>
        <button type="button" title="Filter" style={{ width: 42, height: 42, borderRadius: 10, border: '1px solid var(--border-primary)', background: '#fff', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}><Icon.Funnel width={18} height={18} /></button>
        <button type="button" title="Add note" onClick={() => setAdding(true)} style={{ width: 42, height: 42, borderRadius: 10, border: 0, background: 'var(--bg-brand-solid)', cursor: 'pointer', color: 'var(--fg-on-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-skeu)' }}><Icon.Plus width={18} height={18} /></button>
      </div>
      {adding && <window.CandForms.NoteAddForm c={c} onCancel={() => setAdding(false)} onSave={addNote} />}
      {notes.length === 0 ? (
        !adding && <CandTabEmpty icon={<Icon.Chat />} title="No notes yet" body="Notes added for this person across your searches will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {notes.map((n, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Ban width={18} height={18} /></span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{n.title}</span>
                <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }} title="Shared with team"><Icon.Globe width={15} height={15} /></span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', margin: '6px 0 10px' }}>Created {n.date} <span style={{ color: 'var(--color-brand-600)', fontWeight: 500 }}>{n.author}</span></div>
              <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: 'var(--fg-secondary)' }}>{n.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, maxWidth: '70%', padding: '5px 11px', borderRadius: 8, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 13, fontWeight: 500 }}>
                  <Icon.Briefcase width={14} height={14} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.project}</span>
                </span>
                <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-600)', flexShrink: 0 }}><Icon.Plus width={15} height={15} /> Add Response</button>
              </div>
              {i < notes.length - 1 && <div style={{ height: 1, background: 'var(--border-secondary)', marginTop: 24 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Projects tab ----
function CandProjects({ c }) {
  const { HubLink } = HubUI;
  const detail = HubData.enrichPerson(c);
  const ADV = ['Hiring Team Interview', 'Offer', 'Hired'];
  const active = (detail.activeProjects || []).map(ap => ({ title: ap.name, company: ap.company, city: '', region: '', country: '', status: 'Open', stage: ap.stage, stageSub: '', active: true }));
  const projects = [...active, ...(detail.projects || [])];
  const lists = detail.lists || [];
  const statusColor = { Canceled: 'var(--color-error-500)', Open: 'var(--color-brand-500)', Closed: 'var(--color-success-500)', 'On Hold': 'var(--color-warning-500)' };
  const th = { textAlign: 'left', padding: '0 12px 10px', fontSize: 13, fontWeight: 600, color: 'var(--fg-tertiary)', whiteSpace: 'nowrap' };
  const td = { padding: '14px 12px', fontSize: 14, color: 'var(--fg-secondary)', borderTop: '1px solid var(--border-secondary)', verticalAlign: 'top' };
  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Associated Projects <span style={{ color: 'var(--fg-quaternary)' }}>({projects.length})</span></h3>
      {projects.length === 0 ? (
        <CandTabEmpty icon={<Icon.Briefcase />} title="No associated projects" body="Projects this person is part of will appear here." />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Title</th><th style={th}>Company</th><th style={th}>Location</th><th style={th}>Status</th><th style={th}>Stage</th><th style={{ ...th, width: 36 }}></th></tr></thead>
          <tbody>
            {projects.map((pr, i) => (
              <tr key={i}>
                <td style={{ ...td, maxWidth: 170 }}><div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}><HubLink size={14}>{pr.title}</HubLink>{pr.active ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 9999, padding: '1px 8px' }}><Icon.Briefcase width={11} height={11} />Active</span> : null}</div></td>
                <td style={td}>{pr.company}</td>
                <td style={{ ...td, color: 'var(--fg-quaternary)' }}>{pr.city ? <>{pr.city}{pr.region ? `, ${pr.region}` : ''}<br />{pr.country}</> : (pr.country || '—')}</td>
                <td style={td}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[pr.status] || 'var(--color-gray-400)' }} />{pr.status}</span></td>
                <td style={td}><span style={{ color: pr.stage === 'Rejected' ? 'var(--color-error-700)' : (pr.active && ADV.includes(pr.stage)) ? 'var(--fg-warning)' : 'var(--fg-secondary)', fontWeight: pr.active ? 600 : 400 }}>{pr.stage}</span>{pr.stageSub ? <div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>{pr.stageSub}</div> : null}</td>
                <td style={td}><span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }} title="Move"><Icon.Trending width={16} height={16} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {projects.length > 0 && <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 12 }}>Total Rows: {projects.length}</div>}

      <h3 style={{ margin: '36px 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Associated Lists <span style={{ color: 'var(--fg-quaternary)' }}>({lists.length})</span></h3>
      {lists.length === 0 ? (
        <CandTabEmpty icon={<Icon.Clipboard />} title="There are no associated lists" body="Lists that include this person will appear here." />
      ) : (
        <React.Fragment>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Name</th><th style={th}>People</th><th style={th}>Created</th><th style={th}>Last Updated</th></tr></thead>
            <tbody>
              {lists.map((l, i) => (
                <tr key={i}>
                  <td style={td}><HubLink size={14}>{l.name}</HubLink></td>
                  <td style={td}>{l.people}</td>
                  <td style={td}>{l.created}<div style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>{l.by}</div></td>
                  <td style={td}>{l.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 12 }}>Total Rows: {lists.length}</div>
        </React.Fragment>
      )}
    </div>
  );
}

// ---- Off limits record card ----
function OffLimitsCard({ rec, muted }) {
  const { HubLink } = HubUI;
  const [open, setOpen] = useCP(false);
  const hasNote = !!rec.note;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-xs)', opacity: muted ? 0.92 : 1 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-error-700)', background: 'var(--bg-error-primary)', borderRadius: 9999, padding: '3px 11px' }}>
        <Icon.Flag width={13} height={13} /> {rec.type}
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 12 }}>
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <HubLink size={15} weight={600}>{rec.company}</HubLink>
          <span style={{ color: 'var(--fg-quaternary)' }}>•</span>
          <HubLink size={15}>{rec.role}</HubLink>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, maxWidth: '44%', fontSize: 14, color: 'var(--fg-quaternary)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          Contract: <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}><HubLink size={14}>{rec.contract}</HubLink></span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 8, fontSize: 14, color: 'var(--fg-tertiary)', flexWrap: 'wrap' }}>
        <div>Start: <span style={{ color: 'var(--fg-secondary)', fontWeight: 500 }}>{rec.start}</span>{rec.end ? <> • End: <span style={{ color: 'var(--fg-secondary)', fontWeight: 500 }}>{rec.end}</span></> : null}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Lead: <span style={{ color: 'var(--fg-secondary)', fontWeight: 500 }}>{rec.lead}</span><span style={{ color: 'var(--color-brand-600)', display: 'inline-flex', cursor: 'pointer' }} title={`Email ${rec.lead}`}><Icon.Mail width={15} height={15} /></span></div>
      </div>
      <div style={{ height: 1, background: 'var(--border-secondary)', marginTop: 14 }} />
      {hasNote ? (
        <div>
          <button type="button" onClick={() => setOpen(o => !o)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 10, border: 0, background: 'transparent', cursor: 'pointer', padding: '12px 0 0', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)' }}>{rec.duration || 'Notes'}</span>
            <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', transition: 'transform 200ms ease', transform: open ? 'rotate(180deg)' : 'none' }}><Icon.ChevronDown width={18} height={18} /></span>
          </button>
          <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 220ms cubic-bezier(0.4,0,0.2,1)' }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '21px', color: 'var(--fg-secondary)' }}>{rec.note}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ paddingTop: 12 }}>
          {rec.duration ? <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', marginBottom: 6 }}>{rec.duration}</div> : null}
          <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-quaternary)' }}>No notes available.</p>
        </div>
      )}
    </div>
  );
}

// ---- Off Limits tab ----
function CandOffLimits({ c }) {
  const detail = HubData.enrichPerson(c);
  const ol = detail.offLimits || { active: [], previous: [] };
  const [prevOpen, setPrevOpen] = useCP(false);
  if (!ol.active.length && !ol.previous.length) {
    return <CandTabEmpty icon={<Icon.Flag />} title="Not off limits" body="This person has no active or previous off-limits records. Add one to track placement, employment, or client restrictions." />;
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: 'var(--color-error-600)', display: 'inline-flex' }}><Icon.Flag width={18} height={18} /></span>
        <h3 style={{ margin: 0, flex: 1, fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Active Off Limits</h3>
        <button type="button" title="Add off limits" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-secondary)', background: '#fff', cursor: 'pointer', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}><Icon.Plus width={18} height={18} /></button>
      </div>
      {ol.active.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{ol.active.map((r, i) => <OffLimitsCard key={i} rec={r} />)}</div>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--fg-quaternary)', margin: 0 }}>No active off-limits records.</p>
      )}

      <button type="button" onClick={() => setPrevOpen(o => !o)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, marginTop: 28, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Flag width={18} height={18} /></span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 18, fontWeight: 600, color: 'var(--fg-primary)' }}>Previous Off Limits <span style={{ color: 'var(--fg-quaternary)', fontWeight: 500 }}>({ol.previous.length})</span></span>
        <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', transition: 'transform 200ms ease', transform: prevOpen ? 'rotate(180deg)' : 'none' }}><Icon.ChevronDown width={18} height={18} /></span>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: prevOpen ? '1fr' : '0fr', transition: 'grid-template-rows 260ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ol.previous.length ? ol.previous.map((r, i) => <OffLimitsCard key={i} rec={r} muted />) : <p style={{ fontSize: 14, color: 'var(--fg-quaternary)', margin: 0 }}>No previous off-limits records.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandTabEmpty({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{React.cloneElement(icon, { width: 26, height: 26 })}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: '21px', color: 'var(--fg-tertiary)', maxWidth: 320 }}>{body}</div>
    </div>
  );
}

// ---- compact star rating ----
function ScoreStars({ value, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? '#F59E0B' : 'none'} stroke={i <= value ? '#F59E0B' : 'var(--color-gray-300)'} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z" /></svg>
      ))}
    </span>
  );
}

// ---- single compact scorecard ----
function ScorecardCard({ sc }) {
  const { HubAvatar } = HubUI;
  const [expanded, setExpanded] = useCP(false);
  const isHM = sc.assessorRole === 'Hiring Manager';
  const noteParas = (sc.notes || '').split('\n\n').filter(Boolean);
  const plainNote = (sc.notes || '').replace(/^[\-•]\s*/gm, '').replace(/\s*\n\s*/g, ' ').trim();
  const longNote = (sc.notes || '').length > 150 || noteParas.length > 1;
  const renderBlock = (para, i) => {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
    const isList = lines.length > 0 && lines.every(l => /^[\-•]\s/.test(l));
    if (isList) {
      return (
        <ul key={i} style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((l, j) => <li key={j} style={{ fontSize: 14, lineHeight: '21px', color: 'var(--fg-secondary)' }}>{l.replace(/^[\-•]\s*/, '')}</li>)}
        </ul>
      );
    }
    return <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: '21px', color: 'var(--fg-secondary)' }}>{para}</p>;
  };
  const rolePill = isHM
    ? { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' }
    : { fg: 'var(--fg-secondary)', bg: 'var(--bg-tertiary)' };
  return (
    <div style={{ position: 'relative', background: '#fff', border: `1px solid var(--border-secondary)`, borderRadius: 12, padding: '15px 16px 15px 18px', boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
      {isHM && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--color-warning-500)' }} />}
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <HubAvatar name={sc.assessor} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>{sc.assessor}</span>
            {sc.draft
              ? <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 9999, padding: '2px 10px' }}>Draft</span>
              : <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: rolePill.fg, background: rolePill.bg, borderRadius: 9999, padding: '2px 10px' }}>{sc.assessorRole}</span>}
            {sc.draft
              ? <span title="Scorecard is only visible to you." style={{ display: 'inline-flex', color: 'var(--fg-quaternary)' }}><Icon.LockUser width={16} height={16} /></span>
              : sc.visibility === 'internal'
                ? <span title="Visible to internal users only" style={{ display: 'inline-flex', color: 'var(--fg-quaternary)' }}><Icon.Users width={15} height={15} /></span>
                : <span title="Visible to all users" style={{ display: 'inline-flex', color: 'var(--fg-quaternary)' }}><Icon.Globe width={15} height={15} /></span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 2 }}>Assessed on {sc.date}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex', cursor: 'pointer' }}><Icon.DotsVertical width={18} height={18} /></span>
        </div>
      </div>
      {/* notes */}
      {expanded ? (
        <div style={{ margin: '11px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {noteParas.map(renderBlock)}
        </div>
      ) : (
        <p style={{ margin: '11px 0 0', fontSize: 14, lineHeight: '21px', color: 'var(--fg-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{plainNote}</p>
      )}
      {longNote && <button type="button" onClick={() => setExpanded(v => !v)} style={{ border: 0, background: 'transparent', padding: '4px 0 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-brand-600)' }}>{expanded ? 'Show less' : 'Show more'}</button>}
      {/* criteria — compact 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 20px', marginTop: 14 }}>
        {sc.criteria.map((cr, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <ScoreStars value={cr.stars} size={14} />
            <span style={{ fontSize: 13.5, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cr.label}</span>
          </div>
        ))}
      </div>
      {/* footer */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, maxWidth: '100%', padding: '4px 10px', borderRadius: 8, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 13, fontWeight: 500 }}>
          <Icon.Briefcase width={14} height={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.role}, {sc.company}</span>
        </span>
      </div>
    </div>
  );
}

// ---- popover wrapper (click-outside to close) ----
function ScPopover({ open, onClose, children, align = 'right' }) {
  const ref = useCPRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} style={{ position: 'absolute', top: 52, [align]: 0, zIndex: 80, width: 360, maxWidth: 'calc(100vw - 48px)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xl)', padding: 20 }}>
      {children}
    </div>
  );
}

// ---- small labeled select used in the filter/sort popovers ----
function ScSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      {label && value && <span style={{ position: 'absolute', top: -7, left: 12, padding: '0 4px', background: '#fff', fontSize: 12, fontWeight: 500, color: 'var(--color-brand-600)', zIndex: 1 }}>{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-secondary)'; e.target.style.boxShadow = 'none'; }}
        style={{ width: '100%', boxSizing: 'border-box', height: 52, padding: '0 40px 0 16px', fontSize: 15, fontFamily: 'var(--font-body)', color: value ? 'var(--fg-primary)' : 'var(--fg-quaternary)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, outline: 'none', appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717680\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ---- toggle used inside the filter popover ----
function ScToggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 9999, border: 0, padding: 2, cursor: 'pointer', background: checked ? 'var(--bg-brand-solid)' : 'var(--color-gray-300)', transition: 'background 150ms ease-out', flexShrink: 0 }}>
      <span style={{ display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease-out', transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );
}

const SC_SORTS = ['Created - Newest', 'Created - Oldest', 'Edited - Newest', 'Edited - Oldest'];
const SC_DEFAULT_SORT = 'Created - Newest';
const emptyScFilters = { hmOnly: false, project: '', template: '', assessedBy: '' };

// ---- circular icon button for the controls row ----
function ScIconBtn({ icon, active, onClick, title }) {
  const [hover, setHover] = useCP(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', border: 0, background: hover ? 'var(--bg-primary-hover)' : 'transparent', color: 'var(--fg-tertiary)', transition: 'background 150ms ease-out' }}>
      {React.cloneElement(icon, { width: 22, height: 22 })}
      {active && <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand-600)', border: '1.5px solid #fff' }} />}
    </button>
  );
}

// ---- Scorecards tab ----
function CandScorecards({ c, startAdd }) {
  const detail = HubData.enrichPerson(c);
  const [cards, setCards] = useCP(() => [...(detail.scorecards || [])]);
  const [adding, setAdding] = useCP(!!startAdd);
  const [query, setQuery] = useCP('');
  const [filterOpen, setFilterOpen] = useCP(false);
  const [sortOpen, setSortOpen] = useCP(false);
  const [filters, setFilters] = useCP(emptyScFilters);
  const [draftFilters, setDraftFilters] = useCP(emptyScFilters);
  const [sort, setSort] = useCP(SC_DEFAULT_SORT);

  const addCard = (sc) => {
    setCards(list => [sc, ...list]);
    setAdding(false);
    HubUI.showHubToast({ title: 'Scorecard added', message: `${sc.avg.toFixed(1)} avg · ${c.name}` });
  };

  // option lists derived from the candidate's cards
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const projectOpts = uniq(cards.map(s => `${s.role}, ${s.company}`));
  const templateOpts = uniq(cards.map(s => s.template));
  const assessedByOpts = uniq(cards.map(s => s.assessor));

  const ts = (d) => { const t = new Date(d).getTime(); return isNaN(t) ? 0 : t; };
  const filtersActive = filters.hmOnly || filters.project || filters.template || filters.assessedBy;
  const sortActive = sort !== SC_DEFAULT_SORT;

  let view = cards.filter(s => {
    if (query) {
      const q = query.toLowerCase();
      const hay = `${s.assessor} ${s.role} ${s.company} ${s.template} ${s.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.hmOnly && s.assessorRole !== 'Hiring Manager') return false;
    if (filters.project && `${s.role}, ${s.company}` !== filters.project) return false;
    if (filters.template && s.template !== filters.template) return false;
    if (filters.assessedBy && s.assessor !== filters.assessedBy) return false;
    return true;
  });
  view = [...view].sort((a, b) => {
    switch (sort) {
      case 'Created - Oldest': return ts(a.date) - ts(b.date);
      case 'Edited - Newest': return ts(b.editedDate) - ts(a.editedDate);
      case 'Edited - Oldest': return ts(a.editedDate) - ts(b.editedDate);
      default: return ts(b.date) - ts(a.date); // Created - Newest
    }
  });

  const openFilter = () => { setDraftFilters(filters); setSortOpen(false); setFilterOpen(o => !o); };
  const applyFilter = () => { setFilters(draftFilters); setFilterOpen(false); };
  const resetFilter = () => setDraftFilters(emptyScFilters);
  const setDraft = (k, v) => setDraftFilters(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, flex: 1, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Scorecards <span style={{ color: 'var(--fg-quaternary)' }}>({cards.length})</span></h3>
        {!adding && <button type="button" onClick={() => setAdding(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 9, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}><Icon.Plus width={17} height={17} /> Add Scorecard</button>}
      </div>

      {/* search / filter / sort row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Search width={18} height={18} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by keyword, projects..."
            onFocus={(e) => { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-secondary)'; e.target.style.boxShadow = 'none'; }}
            style={{ width: '100%', boxSizing: 'border-box', height: 46, padding: '0 14px 0 42px', fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, outline: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <ScIconBtn icon={<Icon.Sliders />} active={!!filtersActive} onClick={openFilter} title="Filter" />
          <ScPopover open={filterOpen} onClose={() => setFilterOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--fg-secondary)' }}>
              <Icon.Sliders width={20} height={20} />
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Filter</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <ScToggle checked={draftFilters.hmOnly} onChange={(v) => setDraft('hmOnly', v)} />
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-primary)' }}>Hiring Managers Only</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ScSelect label="Projects" placeholder="Projects" value={draftFilters.project} onChange={(v) => setDraft('project', v)} options={projectOpts} />
              <ScSelect label="Scorecard Template" placeholder="Scorecard Template" value={draftFilters.template} onChange={(v) => setDraft('template', v)} options={templateOpts} />
              <ScSelect label="Assessed By" placeholder="Assessed By" value={draftFilters.assessedBy} onChange={(v) => setDraft('assessedBy', v)} options={assessedByOpts} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <button type="button" onClick={resetFilter} style={{ border: 0, background: 'transparent', color: 'var(--color-brand-600)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 4 }}>Reset</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" onClick={() => setFilterOpen(false)} style={{ border: 0, background: 'transparent', color: 'var(--fg-secondary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '9px 14px' }}>Cancel</button>
                <button type="button" onClick={applyFilter} style={{ border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '9px 20px', borderRadius: 9, boxShadow: 'var(--shadow-skeu)' }}>Apply</button>
              </div>
            </div>
          </ScPopover>
        </div>
        <div style={{ position: 'relative' }}>
          <ScIconBtn icon={<Icon.SortLines />} active={sortActive} onClick={() => { setFilterOpen(false); setSortOpen(o => !o); }} title="Sort" />
          <ScPopover open={sortOpen} onClose={() => setSortOpen(false)} align="right">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--fg-secondary)' }}>
              <Icon.SortLines width={20} height={20} />
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Sort</span>
            </div>
            <ScSelect label="Sort Type" placeholder="Sort Type" value={sort} onChange={(v) => { setSort(v || SC_DEFAULT_SORT); }} options={SC_SORTS} />
          </ScPopover>
        </div>
      </div>

      {adding && <window.CandForms.ScorecardAddForm c={c} onCancel={() => setAdding(false)} onSave={addCard} />}
      {cards.length === 0 ? (
        !adding && <CandTabEmpty icon={<Icon.Star />} title="No scorecards yet" body="Assessments from hiring managers and your search team will appear here." />
      ) : view.length === 0 ? (
        <CandTabEmpty icon={<Icon.Search />} title="No scorecards match" body="Try adjusting your search or filters to see more results." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {view.map((sc, i) => <ScorecardCard key={i} sc={sc} />)}
        </div>
      )}
    </div>
  );
}

// ---- Overview tab ----
// Layout:
//   1. Archetype snapshot — the main section at the top (Sourcing/Outreach/Evaluation/Close/Terminal chips)
//   2. Project-context rows (only when the candidate has a stage)
//   3. Person-of-record rows
// No secondary "In this project" heading — the tab itself is the section header.
function CandOverview({ c, archetype, ctx }) {
  const { HubColorTag, HubLink } = HubUI;
  const Row = ({ label, children }) => (
    <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
      <div style={{ width: 150, flexShrink: 0, fontSize: 14, color: 'var(--fg-quaternary)' }}>{label}</div>
      <div style={{ flex: 1, fontSize: 15, color: 'var(--fg-secondary)' }}>{children}</div>
    </div>
  );
  const inProject = !!c.stage;
  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Overview</h3>
      {/* main section: archetype snapshot — the reason this candidate matters right now */}
      {archetype && ctx && <ArchetypeStrip archetype={archetype} c={c} ctx={ctx} />}
      {/* latest interactions preview — recruiters read this before outreaching */}
      {ctx && <LatestInteractionsPreview c={c} onOpenAll={() => ctx.selectTab && ctx.selectTab('Recent activity')} />}
      <div>
        {/* project-context rows */}
        {inProject && (
          <React.Fragment>
            <Row label="Stage"><HubUI.HubStageBadge stage={c.stage} /></Row>
            <Row label="Candidate start date">{c.startDate || '—'}</Row>
            <Row label="Compensation">{c.comp || 'Compensation info unavailable'}</Row>
            {c.scorecards && <Row label="Scorecards"><span><strong style={{ color: 'var(--fg-primary)' }}>{c.scorecards.count}</strong> in this project · <strong style={{ color: 'var(--fg-primary)' }}>{c.scorecards.avg.toFixed(1)}</strong> avg · last by {c.scorecards.lastBy} {c.scorecards.lastAge}</span></Row>}
          </React.Fragment>
        )}
        {/* person-of-record rows */}
        <Row label="Current role"><span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{c.title}</span> at <HubLink size={15}>{c.company}</HubLink></Row>
        <Row label="Location">{[c.city, c.region, c.country].filter(Boolean).join(', ') || 'Unknown location'}</Row>
        {c.tags.length > 0 && <Row label="Tags"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{c.tags.map((t, i) => <HubColorTag key={i} label={t.label} color={t.color} />)}</div></Row>}
      </div>
    </div>
  );
}

// ---- Documents tab ----
const DOC_TYPES = [
  { type: 'Resume', desc: 'Most recent CV', required: true },
  { type: 'Offer Letter', desc: 'Signed offer of employment', required: false },
  { type: 'NDA', desc: 'Non-disclosure agreement', required: false },
  { type: 'Cover Letter', desc: 'Candidate cover letter', required: false },
  { type: 'Verification of Approval', desc: 'Internal sign-off to proceed', required: true },
];

function fmtBytes(b) {
  if (b == null) return '';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toUpperCase() : 'FILE';
}

function DocSlot({ cfg, doc, onUpload, onRemove }) {
  const inputRef = useCPRef(null);
  const [drag, setDrag] = useCP(false);
  const pick = () => inputRef.current && inputRef.current.click();
  const take = (file) => {
    if (!file) return;
    onUpload(cfg.type, { name: file.name, size: file.size, ext: extOf(file.name), date: 'Just now', by: 'Angela Zhou' });
  };
  const onChange = (e) => { take(e.target.files && e.target.files[0]); e.target.value = ''; };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files && e.dataTransfer.files[0]); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)' }}>{cfg.type}</span>
        {cfg.required && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-quaternary)', letterSpacing: '0.02em' }}>REQUIRED</span>}
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={onChange} style={{ display: 'none' }} />
      {doc ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, padding: '14px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 9, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Icon.FileText width={20} height={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-quaternary)', marginTop: 2 }}>{doc.ext}{doc.size ? ' · ' + fmtBytes(doc.size) : ''}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-success-700, #067647)', marginTop: 6 }}><Icon.Check width={13} height={13} /> Uploaded {doc.date}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 10, borderTop: '1px solid var(--border-secondary)' }}>
            <DocAction icon={<Icon.Eye width={15} height={15} />} label="View" onClick={() => HubUI.showHubToast({ title: 'Opening document', message: doc.name })} />
            <DocAction icon={<Icon.Download width={15} height={15} />} label="Download" onClick={() => HubUI.showHubToast({ title: 'Downloading', message: doc.name })} />
            <DocAction icon={<Icon.Upload width={15} height={15} />} label="Replace" onClick={pick} />
            <span style={{ flex: 1 }} />
            <DocAction icon={<Icon.Trash width={15} height={15} />} title="Remove" danger onClick={() => onRemove(cfg.type)} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{ flex: 1, minHeight: 132, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, padding: '16px', borderRadius: 12, border: `1.5px dashed ${drag ? 'var(--color-brand-400)' : 'var(--border-primary)'}`, background: drag ? 'var(--bg-brand-primary)' : 'var(--bg-secondary, #FCFCFD)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 120ms ease, border-color 120ms ease' }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', border: '1px solid var(--border-secondary)', color: 'var(--color-brand-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}><Icon.Upload width={18} height={18} /></span>
          <div style={{ fontSize: 13, color: 'var(--fg-tertiary)', lineHeight: '18px' }}>
            <span style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Click to upload</span> or drag & drop
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>PDF or DOC · up to 10MB</div>
        </button>
      )}
    </div>
  );
}

function DocAction({ icon, label, title, danger, onClick }) {
  return (
    <button type="button" onClick={onClick} title={title || label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: label ? '0 9px' : '0 7px', borderRadius: 7, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: danger ? 'var(--color-error-600)' : 'var(--fg-secondary)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? 'var(--bg-error-primary)' : 'var(--bg-tertiary)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {icon}{label && <span>{label}</span>}
    </button>
  );
}

function CandDocuments({ c }) {
  const [docs, setDocs] = useCP(() => ({ 'Resume': { name: `${(c.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`, ext: 'PDF', size: 248 * 1024, date: '3 days ago', by: 'Angela Zhou' } }));
  const upload = (type, doc) => { setDocs(d => ({ ...d, [type]: doc })); HubUI.showHubToast({ title: 'Document uploaded', message: `${type} · ${c.name}` }); };
  const remove = (type) => { setDocs(d => { const n = { ...d }; delete n[type]; return n; }); HubUI.showHubToast({ title: 'Document removed', message: type }); };
  const have = DOC_TYPES.filter(t => docs[t.type]).length;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h3 style={{ margin: 0, flex: 1, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Documents <span style={{ color: 'var(--fg-quaternary)' }}>({have}/{DOC_TYPES.length})</span></h3>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--fg-tertiary)' }}>Upload the required documents for this candidate. Each slot accepts one file.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {DOC_TYPES.map(cfg => <DocSlot key={cfg.type} cfg={cfg} doc={docs[cfg.type]} onUpload={upload} onRemove={remove} />)}
      </div>
    </div>
  );
}

// ============================================================
// Team activity — notes + outreaches + rejections + scorecards + stage changes
// ============================================================
// Recruiter mental model: "Before I outreach, what's already happened?" — every
// panel-open should immediately tell the recruiter who's touched the record,
// which channel, what was said, whether there's a warm-intro path, and any
// flags in prior notes. One unified feed serves that need better than separate
// silos; each entry carries type + author + timestamp + content + optional
// response thread + project context.

const TEAM_ROSTER = [
  { name: 'Angela Zhou',    initials: 'AZ' },
  { name: 'Marcus Ford',    initials: 'MF' },
  { name: 'Ines Alvarez',   initials: 'IA' },
  { name: 'Charly Varghese',initials: 'CV' },
  { name: 'Brendan Murphy', initials: 'BM' },
];

// Interaction type registry — colors + icon per kind, keyed off spec so it's
// easy to add or reorder without touching render code.
const INT_TYPES = {
  note:      { label: 'Note',            icon: 'Note',        fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)' },
  outreach:  { label: 'Outreach',        icon: 'MessagePlus', fg: 'var(--fg-secondary)',       bg: 'var(--bg-tertiary)' },
  rejection: { label: 'Rejection',       icon: 'X',           fg: 'var(--color-error-700)',   bg: 'var(--bg-error-primary)' },
  scorecard: { label: 'Scorecard',       icon: 'Star',        fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
  stage:     { label: 'Stage change',    icon: 'Trending',    fg: 'var(--color-success-700)', bg: 'var(--color-success-50)' },
  intro:     { label: 'Warm intro',      icon: 'Users',       fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)' },
};
const OUTREACH_CHANNEL_ICON = { LinkedIn: 'LinkedIn', Email: 'Mail', Phone: 'Phone' };

// Hash → deterministic per-candidate list; cached on the object so filters +
// re-renders reuse the same order.
function candInteractions(c) {
  if (c._interactions) return c._interactions;
  let h = 0; const s = String(c.id || c.name || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const pick = (arr, off = 0) => arr[(h + off) % arr.length];
  const days = (n) => `${n} day${n === 1 ? '' : 's'} ago`;
  const first = (c.name || 'Candidate').split(' ')[0];
  const items = [];

  // Every candidate: an "added" stage event to anchor the timeline
  const owner = pick(TEAM_ROSTER, 1);
  items.push({ id: `stage-added-${c.id}`, type: 'stage', actor: owner, dagoDays: 24 + (h % 14), text: `${c.name} added to ${c.stage || 'the pipeline'}`, project: null, responses: [] });

  // A hiring-manager note if the candidate has one on record
  if (c.note && c.note.text) {
    items.push({ id: `note-hm-${c.id}`, type: 'note', subtype: 'hiring-manager', actor: { name: 'Brendan Hiring Manager', initials: 'BH' }, dagoDays: 10, text: c.note.text, project: 'This project', responses: [] });
  }

  // Fit signal — a prioritization or deprioritization tied to up/down votes
  if ((c.up || 0) > (c.down || 0)) {
    items.push({ id: `note-up-${c.id}`, type: 'stage', subtype: 'prioritized', actor: pick(TEAM_ROSTER, 3), dagoDays: 6 + (h % 4), text: `${first} was prioritized · strong scope fit`, project: 'This project', responses: [] });
  } else if ((c.down || 0) > 0) {
    items.push({ id: `note-down-${c.id}`, type: 'stage', subtype: 'deprioritized', actor: pick(TEAM_ROSTER, 4), dagoDays: 6 + (h % 4), text: `${first} was deprioritized · comp likely too high`, project: 'This project', responses: [] });
  }

  // Outreach once the candidate has moved past Research
  if (c.stage && c.stage !== 'Research') {
    const channels = ['LinkedIn', 'Email', 'Phone'];
    const channel = channels[h % 3];
    const templates = {
      LinkedIn: `Hi ${first} — saw your work at ${c.company || 'your company'}. We're leading a search for a ${c.title || 'senior leader'} role and would love 15 minutes to see if it's worth exploring.`,
      Email: `Hi ${first},\n\nHope this finds you well. We're partnering with a Series C company on a ${c.title || 'senior leadership'} role and your background stood out. Open to a quick chat next week?`,
      Phone: `Left VM re: ${c.title || 'a senior role'} opportunity. Followed up with LinkedIn message. Awaiting reply.`,
    };
    items.push({
      id: `out-${c.id}`, type: 'outreach', subtype: channel.toLowerCase(),
      actor: pick(TEAM_ROSTER, 2), dagoDays: 5 + (h % 5),
      channel, text: templates[channel], project: 'This project',
      responses: (h % 3 === 0) ? [{ actor: { name: c.name, initials: initialsOf(c.name) }, when: '3 days ago', text: 'Thanks — happy to chat. Best times are Thu after 4pm PT.' }] : [],
    });
  }

  // A scorecard mention if we have scorecard data
  if (c.scorecards) {
    items.push({
      id: `score-${c.id}`, type: 'scorecard',
      actor: { name: c.scorecards.lastBy || 'Angela Zhou', initials: initialsOf(c.scorecards.lastBy || 'Angela Zhou') },
      dagoDays: 8, text: `Scored ${c.scorecards.avg.toFixed(1)} · "Strong on scope, want more depth on stage-fit before advancing"`,
      project: 'This project', responses: [],
    });
  }

  // Warm-intro surfacing — sometimes another recruiter has spoken to them
  if (h % 5 === 0) {
    const introSpeaker = pick(TEAM_ROSTER, 0);
    items.push({
      id: `intro-${c.id}`, type: 'intro',
      actor: introSpeaker, dagoDays: 60 + (h % 30),
      text: `${introSpeaker.name} spoke to ${first} for a prior search — you may be able to ask for a warm intro instead of cold outreach.`,
      project: 'Prior search · not in this project', responses: [],
    });
  }

  // Rejection reason (only if stage is Rejected) — carry the "why" front and center
  if (c.stage === 'Rejected') {
    const REASONS = ['Not qualified', 'Not interested', 'Comp misalignment', 'Location mismatch', 'Timing', 'Culture fit'];
    const reason = REASONS[h % REASONS.length];
    items.push({
      id: `rej-${c.id}`, type: 'rejection',
      actor: pick(TEAM_ROSTER, 5),
      dagoDays: 3, text: `Rejected by Hiring Team · ${reason}. Client wants more scale exp; keep on the bench for future searches.`,
      project: 'This project', responses: [],
    });
  }

  // Sort newest first
  items.sort((a, b) => a.dagoDays - b.dagoDays);
  c._interactions = items;
  return items;
}
function initialsOf(name) {
  return (name || '').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

// ---- Interaction card — the atomic unit used in both the Overview preview and the Activity tab ----
function InteractionCard({ item, dense, onResponse }) {
  const [openReply, setOpenReply] = useCP(false);
  const [reply, setReply] = useCP('');
  const [responses, setResponses] = useCP(item.responses || []);
  const [expanded, setExpanded] = useCP(false);
  const meta = INT_TYPES[item.type] || INT_TYPES.note;
  const TypeIcon = Icon[meta.icon] || Icon.Note;
  const channel = item.channel;
  const ChanIcon = channel ? Icon[OUTREACH_CHANNEL_ICON[channel]] : null;
  const submit = () => {
    if (!reply.trim()) return;
    const next = [...responses, { actor: { name: 'Angela Zhou', initials: 'AZ' }, when: 'just now', text: reply.trim() }];
    setResponses(next);
    setReply(''); setOpenReply(false);
    if (onResponse) onResponse(item, next);
  };
  const text = item.text || '';
  const clamped = !expanded && text.length > 220;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, padding: dense ? '11px 12px' : '14px 16px', marginBottom: 10, boxShadow: 'var(--shadow-xs)' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: meta.bg, color: meta.fg }}>
          <TypeIcon width={16} height={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 9.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{item.actor.initials}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)' }}>{item.actor.name}</span>
            </span>
            <span style={{ color: 'var(--fg-quaternary)' }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: meta.fg, background: meta.bg, borderRadius: 4, padding: '1px 7px', fontWeight: 600 }}>
              {ChanIcon ? <ChanIcon width={11} height={11} /> : <TypeIcon width={11} height={11} />}
              {channel ? `Outreach · ${channel}` : meta.label}
            </span>
            <span style={{ color: 'var(--fg-quaternary)' }}>·</span>
            <span style={{ fontSize: 12.5, color: 'var(--fg-quaternary)' }}>{item.dagoDays === 0 ? 'today' : item.dagoDays === 1 ? '1 day ago' : `${item.dagoDays} days ago`}</span>
          </div>
          {item.project && (
            <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-tertiary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 6, padding: '1px 8px' }}>
              <Icon.Briefcase width={11} height={11} />{item.project}
            </div>
          )}
        </div>
      </div>
      {/* body */}
      <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: '20px', color: 'var(--fg-secondary)', whiteSpace: 'pre-wrap' }}>
        {clamped ? text.slice(0, 220) + '…' : text}
        {text.length > 220 && (
          <button type="button" onClick={() => setExpanded(e => !e)}
            style={{ marginLeft: 4, border: 0, background: 'transparent', color: 'var(--color-brand-700)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)' }}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      {/* response thread */}
      {responses.length > 0 && (
        <div style={{ marginTop: 12, borderLeft: '2px solid var(--border-secondary)', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {responses.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.actor.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5 }}><span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{r.actor.name}</span> <span style={{ color: 'var(--fg-quaternary)' }}>· {r.when}</span></div>
                <div style={{ marginTop: 1, fontSize: 13, color: 'var(--fg-secondary)' }}>{r.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        {responses.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--fg-quaternary)' }}>{responses.length} response{responses.length === 1 ? '' : 's'}</span>
        )}
        <span style={{ flex: 1 }} />
        {!openReply && (
          <button type="button" onClick={() => setOpenReply(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', border: 0, background: 'transparent', color: 'var(--color-brand-700)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 6 }}>
            <Icon.Plus width={13} height={13} />Add response
          </button>
        )}
      </div>
      {openReply && (
        <div style={{ marginTop: 10, padding: 10, border: '1px solid var(--color-brand-300)', background: 'var(--bg-brand-primary)', borderRadius: 8 }}>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} autoFocus placeholder="Add context, share an intro, flag something for the team…"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); if (e.key === 'Escape') { setOpenReply(false); setReply(''); } }}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 60, padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 6, outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--fg-quaternary)' }}>⌘⏎ to send · Esc to cancel</span>
            <div style={{ display: 'inline-flex', gap: 6 }}>
              <button type="button" onClick={() => { setOpenReply(false); setReply(''); }}
                style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button type="button" onClick={submit} disabled={!reply.trim()}
                style={{ height: 30, padding: '0 12px', borderRadius: 6, border: 0, background: reply.trim() ? 'var(--bg-brand-solid)' : 'var(--color-gray-200)', color: reply.trim() ? 'var(--fg-on-brand)' : 'var(--fg-quaternary)', fontSize: 12.5, fontWeight: 600, cursor: reply.trim() ? 'pointer' : 'default', fontFamily: 'var(--font-body)', boxShadow: reply.trim() ? 'var(--shadow-skeu)' : 'none' }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Latest interactions preview (used in Overview) — compact 3-item strip ----
function LatestInteractionsPreview({ c, onOpenAll }) {
  const items = candInteractions(c).slice(0, 3);
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>Latest team interactions</div>
        <button type="button" onClick={onOpenAll}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, background: 'transparent', color: 'var(--color-brand-700)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>
          View all activity <Icon.ChevronRight width={13} height={13} />
        </button>
      </div>
      <div style={{ border: '1px solid var(--border-secondary)', borderRadius: 10, background: '#fff' }}>
        {items.map((item, i) => {
          const meta = INT_TYPES[item.type] || INT_TYPES.note;
          const TypeIcon = Icon[meta.icon] || Icon.Note;
          const ChanIcon = item.channel ? Icon[OUTREACH_CHANNEL_ICON[item.channel]] : null;
          return (
            <div key={item.id}
              style={{ display: 'flex', gap: 10, padding: '10px 12px', borderTop: i === 0 ? 0 : '1px solid var(--border-secondary)' }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: meta.bg, color: meta.fg }}>
                {ChanIcon ? <ChanIcon width={13} height={13} /> : <TypeIcon width={13} height={13} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-quaternary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{item.actor.name}</span>
                  <span>·</span>
                  <span>{item.channel ? `Outreach · ${item.channel}` : meta.label}</span>
                  <span>·</span>
                  <span>{item.dagoDays === 0 ? 'today' : item.dagoDays === 1 ? '1 day ago' : `${item.dagoDays}d ago`}</span>
                </div>
                <div style={{ marginTop: 3, fontSize: 13, color: 'var(--fg-secondary)', lineHeight: '18px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Recent activity tab body — unified feed with filter chips + inline add ----
function CandRecentActivity({ c }) {
  const [items, setItems] = useCP(() => candInteractions(c));
  const [filter, setFilter] = useCP('all');
  const [addKind, setAddKind] = useCP(null); // 'note' | 'outreach' | null
  const [addChannel, setAddChannel] = useCP('Email');
  const [text, setText] = useCP('');
  const counts = React.useMemo(() => {
    const b = { total: items.length, note: 0, outreach: 0, rejection: 0, scorecard: 0, stage: 0, intro: 0 };
    items.forEach(it => { b[it.type] = (b[it.type] || 0) + 1; });
    return b;
  }, [items]);
  const chips = [
    { id: 'all',       label: 'All',       count: counts.total },
    { id: 'note',      label: 'Notes',     count: counts.note },
    { id: 'outreach',  label: 'Outreach',  count: counts.outreach },
    { id: 'intro',     label: 'Warm intros', count: counts.intro },
    { id: 'rejection', label: 'Rejections',count: counts.rejection },
    { id: 'scorecard', label: 'Scorecards',count: counts.scorecard },
    { id: 'stage',     label: 'Stage',     count: counts.stage },
  ].filter(ch => ch.id === 'all' || ch.count > 0);
  const visible = filter === 'all' ? items : items.filter(it => it.type === filter);

  const openAdd = (kind) => { setAddKind(kind); setText(''); setAddChannel('Email'); };
  const cancelAdd = () => { setAddKind(null); setText(''); };
  const submitAdd = () => {
    if (!text.trim()) return;
    const newItem = addKind === 'outreach'
      ? { id: `new-out-${Date.now()}`, type: 'outreach', channel: addChannel, subtype: addChannel.toLowerCase(), actor: { name: 'Angela Zhou', initials: 'AZ' }, dagoDays: 0, text: text.trim(), project: 'This project', responses: [] }
      : { id: `new-note-${Date.now()}`, type: 'note', actor: { name: 'Angela Zhou', initials: 'AZ' }, dagoDays: 0, text: text.trim(), project: 'This project', responses: [] };
    setItems(list => [newItem, ...list]);
    c._interactions = [newItem, ...(c._interactions || [])];
    cancelAdd();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>Team activity</h3>
          <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--fg-quaternary)' }}>What the team has done and said about {(c.name || '').split(' ')[0] || 'this candidate'} — read this before you outreach.</p>
        </div>
        <div style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
          <button type="button" onClick={() => openAdd('note')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-xs)' }}>
            <Icon.Plus width={13} height={13} />Note
          </button>
          <button type="button" onClick={() => openAdd('outreach')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 7, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}>
            <Icon.Plus width={13} height={13} />Outreach
          </button>
        </div>
      </div>

      {/* inline add form */}
      {addKind && (
        <div style={{ marginTop: 14, padding: 12, border: '1px solid var(--color-brand-300)', background: 'var(--bg-brand-primary)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>{addKind === 'outreach' ? 'New outreach' : 'New note'}</span>
            {addKind === 'outreach' && (
              <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
                {['LinkedIn', 'Email', 'Phone'].map(ch => {
                  const on = addChannel === ch;
                  const ChIcon = Icon[OUTREACH_CHANNEL_ICON[ch]];
                  return (
                    <button key={ch} type="button" onClick={() => setAddChannel(ch)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 5, border: 0, cursor: 'pointer', background: on ? '#fff' : 'transparent', color: on ? 'var(--color-brand-700)' : 'var(--fg-quaternary)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>
                      <ChIcon width={11} height={11} />{ch}
                    </button>
                  );
                })}
              </span>
            )}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus
            placeholder={addKind === 'outreach' ? `Draft your outreach to ${(c.name || 'this candidate').split(' ')[0]}…` : 'What did you learn? Any red flags? Any warm-intro paths for the team?'}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitAdd(); if (e.key === 'Escape') cancelAdd(); }}
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 96, padding: '10px 12px', fontSize: 13.5, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 7, outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--fg-quaternary)' }}>⌘⏎ to save · Esc to cancel</span>
            <div style={{ display: 'inline-flex', gap: 6 }}>
              <button type="button" onClick={cancelAdd}
                style={{ height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              <button type="button" onClick={submitAdd} disabled={!text.trim()}
                style={{ height: 30, padding: '0 14px', borderRadius: 6, border: 0, background: text.trim() ? 'var(--bg-brand-solid)' : 'var(--color-gray-200)', color: text.trim() ? 'var(--fg-on-brand)' : 'var(--fg-quaternary)', fontSize: 12.5, fontWeight: 600, cursor: text.trim() ? 'pointer' : 'default', fontFamily: 'var(--font-body)', boxShadow: text.trim() ? 'var(--shadow-skeu)' : 'none' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '16px 0 12px' }}>
        {chips.map(ch => {
          const on = filter === ch.id;
          return (
            <button key={ch.id} type="button" onClick={() => setFilter(ch.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, border: `1px solid ${on ? 'var(--color-brand-500)' : 'var(--border-secondary)'}`, background: on ? 'var(--bg-brand-primary)' : '#fff', color: on ? 'var(--color-brand-700)' : 'var(--fg-secondary)', boxShadow: 'var(--shadow-xs)' }}>
              {ch.label}
              <span style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--color-brand-700)' : 'var(--fg-quaternary)', background: on ? '#fff' : 'var(--bg-tertiary)', borderRadius: 9999, padding: '0px 6px' }}>{ch.count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', border: '1px dashed var(--border-secondary)', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--fg-quaternary)', fontSize: 13 }}>
          Nothing here yet for this filter. Try another chip or add a new {addKind === 'outreach' ? 'outreach' : 'note'}.
        </div>
      ) : (
        <div>{visible.map(item => <InteractionCard key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}

function CandTabPlaceholder({ tab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--bg-tertiary)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon.FileText width={26} height={26} /></div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>{tab}</div>
      <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', maxWidth: 300 }}>This tab is part of the candidate profile and is ready to be built out next.</div>
    </div>
  );
}

// ============================================================
// Archetype-driven panel content — spec + strips
// ============================================================
// Every pairing (priority tabs + strip renderer) lives here. Do not scatter these
// conditionals through the render logic — extend this object instead.
const ARCHETYPE_SPEC = {
  sourcing: {
    priorityTabs: ['Overview', 'Experience', 'Off Limits'],
    strip: 'SourcingStrip',
    stripLabel: 'Sourcing',
  },
  outreach: {
    priorityTabs: ['Outreaches', 'Compensation', 'Overview'],
    strip: 'OutreachStrip',
    stripLabel: 'Outreach',
  },
  evaluation: {
    priorityTabs: ['Events', 'Scorecards', 'Notes'],
    strip: 'EvaluationStrip',
    stripLabel: 'Evaluation',
  },
  close: {
    priorityTabs: ['Compensation', 'Documents', 'Overview'],
    strip: 'CloseStrip',
    stripLabel: 'Close',
  },
  terminal: {
    priorityTabs: ['Notes', 'Overview', 'Experience'],
    strip: 'TerminalStrip',
    stripLabel: 'Closed for this search',
  },
};

// Move an archetype's priorityTabs to the front of the active tab set (preserving
// the original order of everything else). Only priority tabs that actually exist
// in the active set get promoted — so this works in both the full 12-tab set and
// the reduced project-context set without hiding anything.
//
// Overview is always pinned to index 0 when present, regardless of archetype —
// it's the landing tab for every candidate. Archetype priority tabs come after.
function orderTabsForArchetype(tabs, archetype) {
  const pinned = tabs.includes('Overview') ? ['Overview'] : [];
  if (!archetype || !ARCHETYPE_SPEC[archetype]) {
    if (pinned.length === 0) return tabs;
    return [...pinned, ...tabs.filter(t => t !== 'Overview')];
  }
  const priority = ARCHETYPE_SPEC[archetype].priorityTabs.filter(t => tabs.includes(t) && t !== 'Overview');
  const rest = tabs.filter(t => t !== 'Overview' && !priority.includes(t));
  return [...pinned, ...priority, ...rest];
}

// ---- shared building blocks for the strip ----
// Subordinate visual weight — muted surface, small type, clickable chips.
function StripChip({ icon, label, value, tone, onClick }) {
  const tc = tone === 'error'   ? { fg: 'var(--color-error-700)',   bg: 'var(--bg-error-primary)',    bd: 'var(--color-error-200, #FECDCA)' }
           : tone === 'success' ? { fg: 'var(--color-success-700)', bg: 'var(--color-success-50)',   bd: 'var(--color-success-300)' }
           : tone === 'warning' ? { fg: 'var(--color-warning-700)', bg: 'var(--color-warning-50)',   bd: 'var(--color-warning-300)' }
           : tone === 'brand'   ? { fg: 'var(--color-brand-700)',   bg: 'var(--bg-brand-primary)',    bd: 'var(--color-brand-200)' }
           :                       { fg: 'var(--fg-secondary)',      bg: '#fff',                       bd: 'var(--border-secondary)' };
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px',
        borderRadius: 999, border: `1px solid ${tc.bd}`, background: tc.bg, color: tc.fg,
        cursor: onClick ? 'pointer' : 'default', fontFamily: 'var(--font-body)',
        fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', minWidth: 0,
      }}>
      {icon && React.cloneElement(icon, { width: 13, height: 13, style: { flexShrink: 0 } })}
      {label && <span style={{ opacity: 0.75 }}>{label}</span>}
      {value && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{value}</span>}
    </button>
  );
}

function StripAction({ icon, label, onClick }) {
  const [h, setH] = useCP(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px',
        borderRadius: 6, border: 0, cursor: 'pointer', flexShrink: 0,
        background: h ? 'var(--color-brand-100)' : 'transparent', color: 'var(--color-brand-700)',
        fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600,
      }}>
      {React.cloneElement(icon, { width: 13, height: 13 })}{label}
    </button>
  );
}

// ---- five archetype strips ----
function SourcingStrip({ c, ctx }) {
  const net = (c.up || 0) - (c.down || 0);
  const olLabel = c.offLimits ? (typeof c.offLimits === 'string' ? c.offLimits : 'Off limits') : (c.flag ? 'Off limits' : null);
  const refCount = c.tags ? c.tags.filter(t => (t.label || '').toLowerCase().includes('ref')).length : 0;
  return (
    <React.Fragment>
      <StripChip icon={<Icon.User />} label="Fit" value={`${net >= 0 ? '+' : ''}${net} team vote${Math.abs(net) === 1 ? '' : 's'}`} tone={net > 0 ? 'brand' : net < 0 ? 'error' : 'default'} />
      <StripChip icon={<Icon.Network />} label="References" value={refCount ? `${refCount} on file` : 'Not started'} onClick={() => ctx.selectTab('Network')} />
      {olLabel && <StripChip icon={<Icon.Flag />} label="Off limits" value={olLabel} tone="error" onClick={() => ctx.selectTab('Off Limits')} />}
    </React.Fragment>
  );
}

function OutreachStrip({ c, ctx }) {
  const sig = HubData.candidateSignal(c);
  const latest = (sig.cadence && sig.cadence[0]) || sig.lead.text;
  return (
    <React.Fragment>
      <StripChip icon={<Icon.MessagePlus />} label="Latest outreach" value={latest} onClick={() => ctx.selectTab('Outreaches')} />
      <StripChip icon={<Icon.Star />} label="Comp expectations" value={c.comp || 'Not captured'} tone={c.comp ? 'default' : 'warning'} onClick={() => ctx.selectTab('Compensation')} />
      <span style={{ flex: 1, minWidth: 0 }} />
      <StripAction icon={<Icon.Plus />} label="Add outreach" onClick={() => ctx.openAdd('Outreaches')} />
    </React.Fragment>
  );
}

function EvaluationStrip({ c, ctx }) {
  const sig = HubData.candidateSignal(c);
  const nextText = sig.lead.tone === 'next' ? sig.lead.text : null;
  const outstanding = c.scorecards && c.scorecards.outstanding ? c.scorecards.outstanding : 0;
  return (
    <React.Fragment>
      <StripChip icon={<Icon.Calendar />} label="Next" value={nextText || 'Nothing scheduled'} tone={nextText ? 'brand' : 'default'} onClick={() => ctx.selectTab('Events')} />
      <StripChip icon={<Icon.Star />} label="Scorecards" value={c.scorecards ? `${c.scorecards.count} · ${c.scorecards.avg.toFixed(1)}` : 'None yet'} onClick={() => ctx.selectTab('Scorecards')} />
      {outstanding > 0 && <StripChip icon={<Icon.AlertTriangle />} label="Outstanding" value={`${outstanding} to submit`} tone="warning" onClick={() => ctx.selectTab('Scorecards')} />}
      <span style={{ flex: 1, minWidth: 0 }} />
      <StripAction icon={<Icon.Plus />} label="Schedule" onClick={() => ctx.openAdd('Events')} />
    </React.Fragment>
  );
}

function CloseStrip({ c, ctx }) {
  const status = c.stage === 'Hired' ? 'Hired' : (c.note && c.note.text) ? c.note.text : 'Offer drafted';
  return (
    <React.Fragment>
      <StripChip icon={<Icon.Star />} label="Comp" value={c.comp || 'Not set'} tone={c.comp ? 'default' : 'warning'} onClick={() => ctx.selectTab('Compensation')} />
      <StripChip icon={<Icon.Flag />} label="Offer" value={status} tone={c.stage === 'Hired' ? 'success' : 'brand'} />
      <StripChip icon={<Icon.FileText />} label="Documents" value={c.stage === 'Hired' ? 'Signed' : 'In progress'} onClick={() => ctx.selectTab('Documents')} />
      {c.startDate && <StripChip icon={<Icon.Calendar />} label="Start" value={c.startDate} />}
    </React.Fragment>
  );
}

function TerminalStrip({ c, ctx }) {
  // Rejection reason: prefer the freeform note; fall back to a stage-derived label.
  const reason = (c.note && c.note.text) || (c.stage === 'Rejected' ? 'No reason recorded' : `Closed as ${c.stage}`);
  const when = (c.note && c.note.age) || HubData.candidateSignal(c).timeInStage;
  return (
    <React.Fragment>
      <StripChip icon={<Icon.X />} label="Reason" value={reason} tone="error" onClick={() => ctx.selectTab('Notes')} />
      <StripChip icon={<Icon.Clock />} label="When" value={when} />
      <span style={{ flex: 1, minWidth: 0 }} />
      <StripAction icon={<Icon.Trending />} label="Reactivate" onClick={() => ctx.reactivate && ctx.reactivate(c)} />
    </React.Fragment>
  );
}

// Dispatcher — renders the archetype's chips as the top section INSIDE the
// Overview tab (not a floating strip above the tabs). Elevated visual weight so
// it reads as the main section of the tab, not subordinate chrome.
function ArchetypeStrip({ archetype, c, ctx }) {
  if (!archetype || !ARCHETYPE_SPEC[archetype]) return null;
  const spec = ARCHETYPE_SPEC[archetype];
  const StripEl = { SourcingStrip, OutreachStrip, EvaluationStrip, CloseStrip, TerminalStrip }[spec.strip];
  if (!StripEl) return null;
  return (
    <div data-spine-name="archetypeSection" data-archetype={archetype} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>
          {spec.stripLabel}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 10 }}>
        <StripEl c={c} ctx={ctx} />
      </div>
    </div>
  );
}

// ---- Candidate panel shell ----
// [spine] role: shell · name: panelDrawer · surface: panel
// Right-side record drawer for a candidate (scrim + sliding aside). Variance: high.
// Owns all four panel sub-regions: panelHeader, recordBanner, tabsBar, panelContent.
function CandidatePanel({ candidate, index, total, onPrev, onNext, onClose, initialTab, initialAdd, contextTabs, onFullProfile }) {
  const { HubAvatar, HubLink, HubColorTag, HubMiniIcon } = HubUI;
  const TABS_BASE = contextTabs || HubData.CANDIDATE_TABS;
  // Resolve the current candidate's archetype from the customer-configurable stage catalog.
  // Null archetype (or missing) → default panel with no strip and default tab order.
  const archetype = candidate ? (HubData.stageArchetype ? HubData.stageArchetype(candidate.stage) : null) : null;
  const TABS = orderTabsForArchetype(TABS_BASE, archetype);
  const initial = initialTab && TABS.includes(initialTab) ? initialTab : TABS[0];
  const [tab, setTab] = useCP(initial);
  const [showAdd, setShowAdd] = useCP(!!initialAdd);
  const tabsRef = useCPRef(null);
  const c = candidate;
  React.useEffect(() => {
    const t = initialTab && TABS.includes(initialTab) ? initialTab : TABS[0];
    setTab(t); setShowAdd(!!initialAdd);
  }, [candidate && candidate.id, initialTab, initialAdd, archetype]);
  if (!c) return null;
  const olLabel = (c.offLimits || c.flag) ? HubData.enrichPerson(c).offLimits.label : null;
  const selectTab = (t) => { if (TABS.includes(t)) { setTab(t); setShowAdd(false); } };
  // Context object passed to every strip renderer — keeps behavior wired to real panel actions.
  const stripCtx = {
    selectTab,
    openAdd: (t) => { if (TABS.includes(t)) { setTab(t); setShowAdd(true); } },
    reactivate: () => { HubUI.showHubToast({ title: 'Reactivate candidate', message: `${c.name} would be moved back into the pipeline.` }); },
  };

  const scrollTabs = (dir) => { if (tabsRef.current) tabsRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' }); };

  return (
    <div data-spine-role="shell" data-spine-name="panelDrawer" data-spine-surface="panel" onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(10,13,18,0.18)', animation: 'tt-fade 150ms ease-out' }}>
      <aside onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, height: '100vh', width: 'min(680px, 94vw)', background: '#fff', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', animation: 'cp-slide 200ms cubic-bezier(0.4,0,0.2,1)' }}>
        {/* top bar */}
        {/* [spine] role: header · name: panelHeader · surface: panel — record nav (prev/next) + close */}
        <div data-spine-role="header" data-spine-name="panelHeader" data-spine-surface="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 52, flexShrink: 0, borderBottom: '1px solid var(--border-secondary)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--fg-tertiary)' }}>
            <button type="button" onClick={onPrev} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronLeft width={18} height={18} /></button>
            <span>{index + 1} of {total}</span>
            <button type="button" onClick={onNext} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronRight width={18} height={18} /></button>
          </div>
          <button type="button" onClick={onClose} style={{ position: 'absolute', right: 12, top: 10, width: 32, height: 32, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.X width={20} height={20} /></button>
        </div>

        {/* header */}
        {/* [spine] role: banner · name: recordBanner · surface: panel — candidate identity + quick actions */}
        <div data-spine-role="banner" data-spine-name="recordBanner" data-spine-surface="panel" style={{ padding: '18px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <HubAvatar name={c.name} size={48} ring={!!(c.offLimits || c.flag)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <HubLink size={20}>{c.name}</HubLink>
                {c.eye && <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.EyeOff width={16} height={16} /></span>}
                {olLabel && <CandPill tone="red"><Icon.Flag width={12} height={12} /> {olLabel}</CandPill>}
                {c.inProject && <CandPill tone="blue"><Icon.Briefcase width={12} height={12} /> In Project</CandPill>}
                {contextTabs && (
                  <button type="button" onClick={onFullProfile}
                    style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 10px', border: '1px solid var(--border-primary)', borderRadius: 6, background: '#fff', color: 'var(--color-brand-700)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-xs)', flexShrink: 0 }}>
                    View full profile
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M7 17L17 7M9 7h8v8" /></svg>
                  </button>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)', marginTop: 2 }}>{c.title}</div>
              <div style={{ marginTop: 2 }}><HubLink size={15} weight={500}>{c.company}</HubLink></div>
              <div style={{ fontSize: 15, color: 'var(--fg-quaternary)', marginTop: 2 }}>{[c.city, c.region, c.country].filter(Boolean).join(', ')}</div>
              {c.tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>{c.tags.map((t, i) => <HubColorTag key={i} label={t.label} color={t.color} />)}</div>}
            </div>
          </div>
          {/* contact bar — surfaces resume, LinkedIn, email, phone inline instead of forcing a click */}
          <div style={{ marginTop: 16 }}>
            <CandContactBar c={c} />
          </div>
          {/* action row — non-project contexts keep quick add-shortcuts. Skipped entirely
              in project context (stage/owner surface elsewhere: Overview archetype snapshot + View full profile). */}
          {!contextTabs && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 12 }}>
              <HubMiniIcon icon={<Icon.MessagePlus />} accent title="Add note" onClick={() => { setTab('Notes'); setShowAdd(true); }} />
              <HubMiniIcon icon={<Icon.CalendarPlus />} accent title="Add outreach" onClick={() => { setTab('Outreaches'); setShowAdd(true); }} />
              <HubMiniIcon icon={<Icon.Calendar />} accent title="Add event" onClick={() => { setTab('Events'); setShowAdd(true); }} />
            </div>
          )}
        </div>

        {/* archetype context — now rendered as the top section inside the Overview tab (see CandOverview) */}

        {/* tabs */}
        {/* [spine] role: nav · name: tabsBar · surface: panel — candidate profile section tabs */}
        <div data-spine-role="nav" data-spine-name="tabsBar" data-spine-surface="panel" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-secondary)', padding: '14px 12px 0', flexShrink: 0 }}>
          <button type="button" onClick={() => scrollTabs(-1)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', padding: '0 6px 12px' }}><Icon.ChevronLeft width={18} height={18} /></button>
          <div ref={tabsRef} style={{ display: 'flex', gap: 24, overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }} className="cp-tabs">
            {TABS.map(t => {
              const on = t === tab;
              return (
                <button key={t} type="button" onClick={() => selectTab(t)} style={{ position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: '0 0 12px', fontFamily: 'var(--font-body)', fontSize: 15, whiteSpace: 'nowrap', fontWeight: on ? 600 : 500, color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)' }}>
                  {t}
                  {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: '2px 2px 0 0', background: 'var(--color-brand-600)' }} />}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => scrollTabs(1)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', padding: '0 6px 12px' }}><Icon.ChevronRight width={18} height={18} /></button>
        </div>

        {/* content */}
        {/* [spine] role: body · name: panelContent · surface: panel — active tab body */}
        <div data-spine-role="body" data-spine-name="panelContent" data-spine-surface="panel" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px' }}>
          {tab === 'Experience' ? <CandExperience c={c} /> : tab === 'Overview' ? <CandOverview c={c} archetype={archetype} ctx={stripCtx} /> : tab === 'Off Limits' ? <CandOffLimits c={c} /> : tab === 'Recent activity' ? <CandRecentActivity c={c} /> : tab === 'Notes' ? <CandNotes c={c} startAdd={showAdd} /> : tab === 'Outreaches' ? <window.CandForms.CandOutreaches c={c} startAdd={showAdd} /> : tab === 'Events' ? <window.CandForms.CandEvents c={c} startAdd={showAdd} /> : tab === 'Projects' ? <CandProjects c={c} /> : tab === 'Scorecards' ? <CandScorecards c={c} startAdd={showAdd} /> : tab === 'Documents' ? <CandDocuments c={c} /> : <CandTabPlaceholder tab={tab} />}
        </div>
        {/* [spine] footer (panel): intentionally absent — candidate panel has no persistent footer region */}
      </aside>
    </div>
  );
}

window.CandidatePanel = CandidatePanel;
window.CandParts = {
  CandExperience, CandOverview, CandOffLimits, CandProjects, CandNotes,
  CandScorecards, CandDocuments, CandContactBar, CandPill,
  candContact,
  // Team-activity primitives — reused by the full-page PersonPage
  CandRecentActivity, LatestInteractionsPreview, InteractionCard, candInteractions,
};
