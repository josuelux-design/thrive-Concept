// ============================================================
// Thrive TRM — Candidate panel "Add ..." forms + Outreaches/Events tabs
// Loaded before hub-candidate-panel.jsx; exposes window.CandForms
// ============================================================
const { useState: useCF } = React;

// ---- shared form styling ----
const cfLabel = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 6 };
const cfControl = {
  width: '100%', boxSizing: 'border-box', height: 42, padding: '0 12px', fontSize: 14,
  fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff',
  border: '1px solid var(--border-primary)', borderRadius: 9, outline: 'none', boxShadow: 'var(--shadow-xs)',
};
const cfArea = { ...cfControl, height: 92, padding: '10px 12px', lineHeight: '20px', resize: 'vertical' };

function CFField({ label, full, children }) {
  return <div style={{ gridColumn: full ? '1 / -1' : 'auto', minWidth: 0 }}><label style={cfLabel}>{label}</label>{children}</div>;
}
function CFText(props) {
  const [f, setF] = useCF(false);
  return <input {...props} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ ...cfControl, borderColor: f ? 'var(--border-brand)' : 'var(--border-primary)', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)' }} />;
}
function CFArea(props) {
  const [f, setF] = useCF(false);
  return <textarea {...props} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ ...cfArea, borderColor: f ? 'var(--border-brand)' : 'var(--border-primary)', boxShadow: f ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)' }} />;
}
function CFSelect({ options, value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} style={{ ...cfControl, appearance: 'none', WebkitAppearance: 'none', paddingRight: 34, cursor: 'pointer' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.ChevronDown width={16} height={16} /></span>
    </div>
  );
}

// segmented control (Person / Project / Company)
function CFSegment({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
      {options.map(o => {
        const on = o === value;
        return <button key={o} type="button" onClick={() => onChange(o)} style={{ border: on ? '1px solid var(--border-secondary)' : '1px solid transparent', background: on ? '#fff' : 'transparent', color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: on ? 'var(--shadow-xs)' : 'none' }}>{o}</button>;
      })}
    </div>
  );
}

// interactive star rating
function CFStars({ value, onChange, size = 22 }) {
  const [hover, setHover] = useCF(0);
  return (
    <span style={{ display: 'inline-flex', gap: 4 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => {
        const lit = i <= (hover || value);
        return (
          <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} aria-label={`${i} star`} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', lineHeight: 0 }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill={lit ? '#F59E0B' : 'none'} stroke={lit ? '#F59E0B' : 'var(--color-gray-300)'} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z" /></svg>
          </button>
        );
      })}
    </span>
  );
}

// ---- shared helpers for the richer event form ----
const cfHelp = { gridColumn: '1 / -1', fontSize: 13, lineHeight: '18px', color: 'var(--fg-quaternary)', marginTop: -4 };
const cfReadonly = { ...cfControl, display: 'flex', alignItems: 'center', color: 'var(--fg-tertiary)', background: 'var(--bg-secondary)', boxShadow: 'none', cursor: 'default' };

// group label that segments the form into sections
function CFGroupLabel({ children, first }) {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: first ? 2 : 8, paddingTop: first ? 0 : 16, borderTop: first ? 'none' : '1px solid var(--color-brand-100, var(--border-secondary))' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-quaternary)' }}>{children}</div>
    </div>
  );
}

// pill toggle switch
function CFToggle({ checked, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => !disabled && onChange(!checked)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: 0, background: 'transparent', padding: 0, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'var(--font-body)' }}>
      <span style={{ width: 38, height: 22, borderRadius: 9999, background: checked ? 'var(--bg-brand-solid)' : 'var(--color-gray-200)', position: 'relative', transition: 'background 150ms ease-out', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left 150ms ease-out' }} />
      </span>
      {label && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)' }}>{label}</span>}
    </button>
  );
}

// chip / token input (attendees)
function CFChips({ value, onChange, placeholder }) {
  const [draft, setDraft] = useCF('');
  const [foc, setFoc] = useCF(false);
  const inputRef = React.useRef(null);
  const add = (v) => { const t = v.trim().replace(/,$/, '').trim(); if (t) onChange([...value, t]); setDraft(''); };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div onClick={() => inputRef.current && inputRef.current.focus()}
      style={{ ...cfControl, height: 'auto', minHeight: 42, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '5px 8px', cursor: 'text', borderColor: foc ? 'var(--border-brand)' : 'var(--border-primary)', boxShadow: foc ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)' }}>
      {value.map((a, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', borderRadius: 8, padding: '3px 4px 3px 10px', fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>
          {a}
          <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }} aria-label={`Remove ${a}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', padding: 2, borderRadius: 5 }}><Icon.X width={13} height={13} /></button>
        </span>
      ))}
      <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => { setFoc(false); if (draft.trim()) add(draft); }}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ',') && draft.trim()) { e.preventDefault(); add(draft); } else if (e.key === 'Backspace' && !draft && value.length) { remove(value.length - 1); } }}
        placeholder={value.length ? '' : placeholder}
        style={{ flex: 1, minWidth: 120, border: 0, outline: 'none', background: 'transparent', height: 28, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)' }} />
    </div>
  );
}

// lightweight rich-text editor (contentEditable + compact toolbar)
function CFRichText({ placeholder, onChange }) {
  const ref = React.useRef(null);
  const [foc, setFoc] = useCF(false);
  const [empty, setEmpty] = useCF(true);
  const sync = () => { const el = ref.current; if (!el) return; setEmpty(!el.textContent.trim() && !el.querySelector('li')); onChange && onChange(el.innerHTML); };
  const exec = (cmd, arg) => { ref.current && ref.current.focus(); document.execCommand(cmd, false, arg || null); sync(); };
  const link = () => { const url = window.prompt('Enter a URL'); if (url) exec('createLink', url); };
  const TBtn = ({ onClick, title, children, glyph }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      style={{ width: 32, height: 30, borderRadius: 7, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontFamily: 'var(--font-body)', ...glyph }}>{children}</button>
  );
  return (
    <div style={{ gridColumn: '1 / -1', border: `1px solid ${foc ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 10, overflow: 'hidden', boxShadow: foc ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)', background: '#fff' }}>
      <div style={{ position: 'relative' }}>
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={sync} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ minHeight: 108, padding: '12px 14px', fontSize: 14, lineHeight: '22px', color: 'var(--fg-primary)', outline: 'none', fontFamily: 'var(--font-body)' }}></div>
        {empty && <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 14, color: 'var(--fg-quaternary)', pointerEvents: 'none' }}>{placeholder}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
        <TBtn title="Bold" onClick={() => exec('bold')} glyph={{ fontWeight: 800 }}>B</TBtn>
        <TBtn title="Italic" onClick={() => exec('italic')} glyph={{ fontStyle: 'italic' }}>I</TBtn>
        <TBtn title="Underline" onClick={() => exec('underline')} glyph={{ textDecoration: 'underline' }}>U</TBtn>
        <TBtn title="Strikethrough" onClick={() => exec('strikeThrough')} glyph={{ textDecoration: 'line-through' }}>S</TBtn>
        <span style={{ width: 1, height: 18, background: 'var(--border-primary)', margin: '0 5px' }}></span>
        <TBtn title="Bulleted list" onClick={() => exec('insertUnorderedList')}><Icon.ListView width={17} height={17} /></TBtn>
        <TBtn title="Numbered list" onClick={() => exec('insertOrderedList')} glyph={{ fontSize: 13, fontWeight: 700 }}>1.</TBtn>
        <TBtn title="Add link" onClick={link}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"></path></svg></TBtn>
      </div>
    </div>
  );
}

// file dropzone
function CFDropzone() {
  const [files, setFiles] = useCF([]);
  const [over, setOver] = useCF(false);
  const inputRef = React.useRef(null);
  const add = (list) => setFiles(f => [...f, ...Array.from(list).map(x => ({ name: x.name, size: x.size }))]);
  const fmt = (b) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <div onClick={() => inputRef.current && inputRef.current.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        style={{ border: `1.5px dashed ${over ? 'var(--border-brand)' : 'var(--border-primary)'}`, borderRadius: 10, padding: '22px 16px', textAlign: 'center', cursor: 'pointer', background: over ? 'var(--bg-brand-primary)' : '#fff', transition: 'background 120ms ease-out, border-color 120ms ease-out' }}>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => add(e.target.files)} />
        <div style={{ width: 40, height: 40, borderRadius: 10, margin: '0 auto 10px', background: 'var(--bg-brand-primary)', color: 'var(--fg-brand-primary, var(--color-brand-600))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Upload width={20} height={20} /></div>
        <div style={{ fontSize: 14, color: 'var(--fg-secondary)' }}><span style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Click to upload</span> or drag and drop</div>
        <div style={{ fontSize: 13, color: 'var(--fg-quaternary)', marginTop: 2 }}>PDF, DOC, DOCX, or PNG (max 7.5MB)</div>
      </div>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {files.map((file, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--border-secondary)', borderRadius: 9, background: '#fff' }}>
              <span style={{ color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.FileText width={18} height={18} /></span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>{fmt(file.size)}</span>
              <button type="button" onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} aria-label="Remove file" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', padding: 2 }}><Icon.X width={16} height={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Add-form shell card (brand-tinted, matches HM scorecard treatment) ----
// [spine] role: shell · name: sliderDrawer · surface: formSlider
// Inline add-form shell reused across candidate tabs (note / outreach / event / scorecard).
// Owns formHeader, formFieldsContainer, and formActions. No nav or banner on this surface — intentionally omitted.
function CFAddCard({ title, onCancel, onSave, saveLabel = 'Save', footerLeft, children }) {
  return (
    <div data-spine-role="shell" data-spine-name="sliderDrawer" data-spine-surface="formSlider" style={{ position: 'relative', background: 'var(--color-brand-25, #FCFCFF)', border: '1px solid var(--color-brand-200)', borderRadius: 12, padding: '16px 18px 18px', marginBottom: 22, boxShadow: 'var(--shadow-sm)' }}>
      {/* [spine] role: header · name: formHeader · surface: formSlider — form title + dismiss */}
      <div data-spine-role="header" data-spine-name="formHeader" data-spine-surface="formSlider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</h4>
        <button type="button" onClick={onCancel} aria-label="Close form" style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.X width={18} height={18} /></button>
      </div>
      {/* [spine] role: body · name: formFieldsContainer · surface: formSlider — form fields grid */}
      <div data-spine-role="body" data-spine-name="formFieldsContainer" data-spine-surface="formSlider" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>{children}</div>
      {/* [spine] role: footer · name: formActions · surface: formSlider — cancel / save */}
      <div data-spine-role="footer" data-spine-name="formActions" data-spine-surface="formSlider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 20 }}>
        <div style={{ minWidth: 0 }}>{footerLeft}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{ height: 40, padding: '0 16px', borderRadius: 9, border: '1px solid var(--border-primary)', background: '#fff', color: 'var(--fg-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-xs)' }}>Cancel</button>
          <button type="button" onClick={onSave} style={{ height: 40, padding: '0 18px', borderRadius: 9, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

// section header with count + add toggle, shared across tabs
function CFTabHead({ title, count, adding, onAdd, addLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <h3 style={{ margin: 0, flex: 1, fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)' }}>{title} {count != null && <span style={{ color: 'var(--fg-quaternary)' }}>({count})</span>}</h3>
      {!adding && (
        <button type="button" onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 9, border: 0, background: 'var(--bg-brand-solid)', color: 'var(--fg-on-brand)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-skeu)' }}><Icon.Plus width={17} height={17} /> {addLabel}</button>
      )}
    </div>
  );
}

const cfBriefcasePill = (label) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, maxWidth: '100%', padding: '4px 10px', borderRadius: 8, background: 'var(--bg-brand-primary)', color: 'var(--color-brand-700)', fontSize: 13, fontWeight: 500 }}>
    <Icon.Briefcase width={14} height={14} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
  </span>
);
const cfMetaPill = (icon, label) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)', background: 'var(--bg-tertiary)', borderRadius: 8, padding: '4px 10px' }}>
    {React.cloneElement(icon, { width: 14, height: 14 })}{label}
  </span>
);

// ============================================================
// Outreaches tab
// ============================================================
function CandOutreaches({ c, startAdd }) {
  const detail = HubData.enrichPerson(c);
  const [items, setItems] = useCF(() => detail.outreaches || []);
  const [adding, setAdding] = useCF(!!startAdd);
  const blank = { to: c.name, project: HubData.PROJECT_OPTIONS[0], datetime: '', method: HubData.OUTREACH_METHODS[0], subject: '', notes: '' };
  const [f, setF] = useCF(blank);
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const save = () => {
    setItems(list => [{ to: f.to, method: f.method, subject: f.subject || '(No subject)', project: f.project, date: 'Just now', time: '', notes: f.notes, author: 'Angela Zhou' }, ...list]);
    setAdding(false); setF(blank);
    HubUI.showHubToast({ title: 'Outreach logged', message: `${f.method} · ${c.name}` });
  };
  return (
    <div>
      <CFTabHead title="Outreaches" count={items.length} adding={adding} onAdd={() => setAdding(true)} addLabel="Add Outreach" />
      {adding && (
        <CFAddCard title="Add Outreach" onCancel={() => setAdding(false)} onSave={save} saveLabel="Log Outreach">
          <CFField label="Outreach to"><CFText value={f.to} onChange={set('to')} placeholder="Recipient" /></CFField>
          <CFField label="Project"><CFSelect options={HubData.PROJECT_OPTIONS} value={f.project} onChange={set('project')} /></CFField>
          <CFField label="Date & Time"><CFText type="datetime-local" value={f.datetime} onChange={set('datetime')} /></CFField>
          <CFField label="Method of communication"><CFSelect options={HubData.OUTREACH_METHODS} value={f.method} onChange={set('method')} /></CFField>
          <CFField label="Subject" full><CFText value={f.subject} onChange={set('subject')} placeholder="Subject line" /></CFField>
          <CFField label="Notes" full><CFArea value={f.notes} onChange={set('notes')} placeholder="What was discussed or attempted…" /></CFField>
        </CFAddCard>
      )}
      {items.length === 0 ? (
        <CandTabEmpty icon={<Icon.MessagePlus />} title="No outreaches yet" body="Emails, calls, and messages logged for this person will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {items.map((o, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex' }}><Icon.MessagePlus width={18} height={18} /></span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{o.subject}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 10px', flexWrap: 'wrap' }}>
                {cfMetaPill(<Icon.Mail />, o.method)}
                {cfMetaPill(<Icon.Calendar />, `${o.date}${o.time ? ` · ${o.time}` : ''}`)}
                <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>to {o.to}</span>
              </div>
              {o.notes && <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: 'var(--fg-secondary)' }}>{o.notes}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {cfBriefcasePill(o.project)}
                <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Logged by <span style={{ color: 'var(--color-brand-600)', fontWeight: 500 }}>{o.author}</span></span>
              </div>
              {i < items.length - 1 && <div style={{ height: 1, background: 'var(--border-secondary)', marginTop: 22 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Events tab
// ============================================================
function CandEvents({ c, startAdd }) {
  const detail = HubData.enrichPerson(c);
  const [items, setItems] = useCF(() => detail.events || []);
  const [adding, setAdding] = useCF(!!startAdd);
  const blank = {
    type: HubData.EVENT_TYPES[0], subject: '', status: HubData.EVENT_STATUSES[0],
    start: '', end: '', method: HubData.EVENT_METHODS[0], platform: HubData.VIDEO_PLATFORMS[0],
    location: '', attendees: ['Keat Teoh'], inviteCandidate: false, description: '', sync: false,
  };
  const [f, setF] = useCF(blank);
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const patch = (k, v) => setF(s => ({ ...s, [k]: v }));
  const cancel = () => { setAdding(false); setF(blank); };
  const save = () => {
    const plain = (f.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    setItems(list => [{ type: f.type, method: f.method === 'Video Conference' ? `${f.method} · ${f.platform}` : f.method, subject: f.subject || f.type, attendees: f.attendees.join(', '), location: f.location, project: HubData.PROJECT.name, date: 'Just now', time: '', notes: plain, author: 'Angela Zhou' }, ...list]);
    cancel();
    HubUI.showHubToast({ title: f.sync ? 'Event created · invites sent' : 'Event created', message: `${f.type} · ${c.name}` });
  };
  const isVideo = f.method === 'Video Conference';
  return (
    <div>
      <CFTabHead title="Events" count={items.length} adding={adding} onAdd={() => setAdding(true)} addLabel="Add Event" />
      {adding && (
        <CFAddCard title="Add Event" onCancel={cancel} onSave={save} saveLabel="Create"
          footerLeft={<CFToggle checked={f.sync} onChange={(v) => patch('sync', v)} label="Sync & send invitation" />}>
          <CFGroupLabel first>Event</CFGroupLabel>
          <CFField label="Event type"><CFSelect options={HubData.EVENT_TYPES} value={f.type} onChange={set('type')} /></CFField>
          <CFField label="Subject"><CFText value={f.subject} onChange={set('subject')} placeholder="e.g. Recruiter interview" /></CFField>
          <CFField label="Project"><div style={cfReadonly}>{HubData.PROJECT.name}</div></CFField>
          <CFField label="Status"><CFSelect options={HubData.EVENT_STATUSES} value={f.status} onChange={set('status')} /></CFField>

          <CFGroupLabel>Schedule</CFGroupLabel>
          <CFField label="Start date & time"><CFText type="datetime-local" value={f.start} onChange={set('start')} /></CFField>
          <CFField label="End date & time"><CFText type="datetime-local" value={f.end} onChange={set('end')} /></CFField>
          <CFField label="Method"><CFSelect options={HubData.EVENT_METHODS} value={f.method} onChange={set('method')} /></CFField>
          {isVideo && <CFField label="Platform"><CFSelect options={HubData.VIDEO_PLATFORMS} value={f.platform} onChange={set('platform')} /></CFField>}
          {isVideo && <div style={cfHelp}>A {f.platform} video link will be generated automatically when you sync &amp; send the invitation.</div>}
          <CFField label="Location" full><CFText value={f.location} onChange={set('location')} placeholder="Address, place, external link, or phone number" /></CFField>

          <CFGroupLabel>Attendees</CFGroupLabel>
          <div style={{ gridColumn: '1 / -1' }}><CFChips value={f.attendees} onChange={(v) => patch('attendees', v)} placeholder="Add teammates, hiring managers, or an email address" /></div>
          <div style={cfHelp}>Invite team members or hiring managers. To invite someone who isn’t in Thrive, enter their email address.</div>
          <div style={{ gridColumn: '1 / -1' }}><CFToggle checked={f.inviteCandidate} onChange={(v) => patch('inviteCandidate', v)} label={`Send invite to ${c.name}`} /></div>

          <CFGroupLabel>Description</CFGroupLabel>
          <CFRichText placeholder="Add an agenda, prep notes, or context…" onChange={(html) => patch('description', html)} />

          <CFGroupLabel>Attachments</CFGroupLabel>
          <CFDropzone />
        </CFAddCard>
      )}
      {items.length === 0 ? (
        <CandTabEmpty icon={<Icon.Calendar />} title="No events yet" body="Interviews, calls, and meetings scheduled with this person will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {items.map((e, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--color-brand-600)', display: 'inline-flex' }}><Icon.Calendar width={18} height={18} /></span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{e.subject}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 9999, padding: '2px 10px' }}>{e.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 10px', flexWrap: 'wrap' }}>
                {cfMetaPill(<Icon.Calendar />, `${e.date}${e.time ? ` · ${e.time}` : ''}`)}
                {cfMetaPill(<Icon.Video />, e.method)}
                {e.location && cfMetaPill(<Icon.MapPin />, e.location)}
              </div>
              {e.attendees && <div style={{ fontSize: 14, color: 'var(--fg-secondary)', marginBottom: 8 }}><span style={{ color: 'var(--fg-quaternary)' }}>Attendees: </span>{e.attendees}</div>}
              {e.notes && <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: 'var(--fg-secondary)' }}>{e.notes}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {cfBriefcasePill(e.project)}
                <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>Added by <span style={{ color: 'var(--color-brand-600)', fontWeight: 500 }}>{e.author}</span></span>
              </div>
              {i < items.length - 1 && <div style={{ height: 1, background: 'var(--border-secondary)', marginTop: 22 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Note add form (rendered inside CandNotes)
// ============================================================
function NoteAddForm({ c, onCancel, onSave }) {
  const [relType, setRelType] = useCF('Person');
  const relOptions = {
    Person: [c.name, 'Angela Zhou', 'Keat Teoh', 'Andrew Banks'],
    Project: HubData.PROJECT_OPTIONS,
    Company: [c.company, 'Thrive', 'Stripe', 'Figma'].filter(Boolean),
  };
  const [f, setF] = useCF({ subject: '', related: c.name, notes: '' });
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const onRelType = (t) => { setRelType(t); setF(s => ({ ...s, related: relOptions[t][0] })); };
  const save = () => { onSave({ title: f.subject || '(No subject)', body: f.notes, related: f.related, relType }); };
  return (
    <CFAddCard title="Add Note" onCancel={onCancel} onSave={save} saveLabel="Save Note">
      <CFField label="Subject" full><CFText value={f.subject} onChange={set('subject')} placeholder="Note subject" /></CFField>
      <CFField label="Related to" full><CFSegment options={HubData.NOTE_RELATION_TYPES} value={relType} onChange={onRelType} /></CFField>
      <CFField label={relType} full><CFSelect options={relOptions[relType]} value={f.related} onChange={set('related')} /></CFField>
      <CFField label="Notes" full><CFArea value={f.notes} onChange={set('notes')} placeholder="Write your note…" /></CFField>
    </CFAddCard>
  );
}

// ============================================================
// Scorecard add form (rendered inside CandScorecards)
// ============================================================
function ScorecardAddForm({ c, onCancel, onSave }) {
  const [f, setF] = useCF({ assessor: 'Angela Zhou', role: HubData.SCORECARD_ROLES[0], context: `${c.title}, ${c.company}`, notes: '' });
  const [crit, setCrit] = useCF(() => HubData.SCORECARD_CRITERIA.map(label => ({ label, stars: 0 })));
  const set = (k) => (e) => setF(s => ({ ...s, [k]: e.target.value }));
  const setStar = (i, v) => setCrit(cs => cs.map((cr, j) => j === i ? { ...cr, stars: v } : cr));
  const save = () => {
    const rated = crit.filter(cr => cr.stars > 0);
    const avg = rated.length ? rated.reduce((s, cr) => s + cr.stars, 0) / rated.length : 0;
    const [role, ...rest] = (f.context || '').split(',');
    onSave({
      assessor: f.assessor, assessorRole: f.role, firm: f.role === 'Hiring Manager' ? 'Client Hiring Team' : 'True Team',
      date: 'Just now', editedDate: 'Just now', notes: f.notes, criteria: crit, avg: Math.round(avg * 10) / 10,
      visibility: f.role === 'Hiring Manager' ? 'all' : 'internal',
      role: (role || c.title).trim(), company: (rest.join(',') || c.company).trim(),
    });
  };
  return (
    <CFAddCard title="Add Scorecard" onCancel={onCancel} onSave={save} saveLabel="Save Scorecard">
      <CFField label="Assessor"><CFText value={f.assessor} onChange={set('assessor')} placeholder="Name" /></CFField>
      <CFField label="Assessor role"><CFSelect options={HubData.SCORECARD_ROLES} value={f.role} onChange={set('role')} /></CFField>
      <CFField label="Role & company" full><CFText value={f.context} onChange={set('context')} placeholder="Role, Company" /></CFField>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={cfLabel}>Criteria</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {crit.map((cr, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 9 }}>
              <span style={{ fontSize: 14, color: 'var(--fg-secondary)' }}>{cr.label}</span>
              <CFStars value={cr.stars} onChange={(v) => setStar(i, v)} />
            </div>
          ))}
        </div>
      </div>
      <CFField label="Notes" full><CFArea value={f.notes} onChange={set('notes')} placeholder="Assessment summary…" /></CFField>
    </CFAddCard>
  );
}

window.CandForms = { CandOutreaches, CandEvents, NoteAddForm, ScorecardAddForm };
