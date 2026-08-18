// ============================================================
// Thrive TRM — Hub shared page primitives
// ============================================================
const { useState: useShS } = React;

// ---- avatar color seeds (Phoenix 7-hue avatar palette, flat fill) ----
const HUB_AVA = [
  { bg: 'rgb(245,170,163)', fg: '#7A271A' }, // salmon
  { bg: 'rgb(240,168,117)', fg: '#7A2E0E' }, // orange
  { bg: 'rgb(247,193,110)', fg: '#7A4E0C' }, // amber
  { bg: 'rgb(240,220,117)', fg: '#6B550C' }, // yellow
  { bg: 'rgb(204,234,255)', fg: '#0B4A6F' }, // light blue
  { bg: 'rgb(140,174,242)', fg: '#15357A' }, // blue
  { bg: 'rgb(167,157,225)', fg: '#3B2E7A' }, // purple
];
function hubSeed(name) {
  let h = 0; const s = String(name || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % HUB_AVA.length;
}
// Phoenix avatar fill for a given name (bg + fg) — shared with solid-fill avatars.
function hubAva(name) { return HUB_AVA[hubSeed(name)]; }

// ---- Avatar (monogram or glyph; optional colored ring) ----
function HubAvatar({ name = '', glyph, size = 44, ring = false, logo = null, square = false }) {
  const c = HUB_AVA[hubSeed(name)];
  const initials = String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const [imgOk, setImgOk] = useShS(true);
  const showImg = !!logo && imgOk;
  const radius = square ? Math.max(8, Math.round(size * 0.26)) : '50%';
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden',
      background: showImg ? '#fff' : c.bg, color: glyph ? 'rgba(0,0,0,0.6)' : c.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: '0.02em',
      border: showImg ? '1px solid var(--border-secondary)' : 'none',
    }}>
      {showImg
        ? <img src={logo} alt={name} loading="lazy" onError={() => setImgOk(false)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: Math.round(size * 0.16), boxSizing: 'border-box', display: 'block' }} />
        : (glyph ? React.cloneElement(glyph, { width: Math.round(size * 0.5), height: Math.round(size * 0.5) }) : initials)}
    </div>
  );
}

// ---- Page header (title + subtitle + right controls) ----
function HubPageHead({ title, subtitle, right, count, countLabel = 'results' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 16, color: 'var(--fg-quaternary)' }}>{subtitle}</p>}
        </div>
        {right && <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>{right}</div>}
      </div>
      {count != null && <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: 'var(--fg-quaternary)' }}>{count.toLocaleString()} {countLabel}</div>}
    </div>
  );
}

// ---- Search input ----
function HubSearch({ placeholder = 'Search...', width = 300, center = false }) {
  const [v, setV] = useShS('');
  const [focus, setFocus] = useShS(false);
  return (
    <div style={{ position: 'relative', width: center ? '100%' : width, maxWidth: center ? 720 : width }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', pointerEvents: 'none', display: 'inline-flex' }}>
        <Icon.Search width={20} height={20} />
      </span>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', boxSizing: 'border-box', height: 44, padding: '0 14px 0 42px',
          fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)',
          background: '#fff', border: `1px solid ${focus ? 'var(--border-brand)' : 'var(--border-primary)'}`,
          borderRadius: 10, outline: 'none', boxShadow: focus ? 'var(--shadow-focus-ring)' : 'var(--shadow-xs)',
          transition: 'box-shadow 150ms, border-color 150ms',
        }} />
    </div>
  );
}

// ---- Ghost icon button (filter / sort / export) ----
function HubIconBtn({ icon, title, badge, accent, onClick }) {
  const [h, setH] = useShS(false);
  return (
    <button type="button" title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: 'relative', width: 44, height: 44, borderRadius: 10, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: h ? 'var(--bg-primary-hover)' : 'transparent', border: 0,
        color: accent ? 'var(--color-brand-600)' : 'var(--fg-tertiary)', transition: 'background 120ms ease-out',
      }}>
      {React.cloneElement(icon, { width: 22, height: 22 })}
      {badge != null && (
        <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: 'var(--color-brand-600)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-secondary)' }}>{badge}</span>
      )}
    </button>
  );
}

// ---- View toggle (list / card) ----
function HubViewToggle({ view, setView }) {
  const Item = ({ id, icon }) => {
    const active = view === id;
    return (
      <button type="button" onClick={() => setView(id)}
        style={{
          width: 40, height: 36, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: active ? '#fff' : 'transparent', border: active ? '1px solid var(--border-secondary)' : '1px solid transparent',
          color: active ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', boxShadow: active ? 'var(--shadow-xs)' : 'none',
          transition: 'all 120ms ease-out',
        }}>
        {React.cloneElement(icon, { width: 20, height: 20 })}
      </button>
    );
  };
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
      <Item id="list" icon={<Icon.ListView />} />
      <Item id="card" icon={<Icon.CardView />} />
    </div>
  );
}

// ---- Underline tabs ----
function HubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border-secondary)', marginBottom: 24 }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} type="button" onClick={() => onChange(t.id)}
            style={{
              position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: '0 0 12px',
              fontFamily: 'var(--font-body)', fontSize: 16, whiteSpace: 'nowrap',
              fontWeight: on ? 600 : 500, color: on ? 'var(--fg-brand-tertiary)' : 'var(--fg-quaternary)', transition: 'color 120ms ease-out',
            }}>
            {t.label}
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, borderRadius: '2px 2px 0 0', background: 'var(--color-brand-600)' }} />}
          </button>
        );
      })}
    </div>
  );
}

// ---- Tag chip ----
function HubTag({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', maxWidth: 240, padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)', background: 'var(--bg-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>;
}

// ---- Off-limits flag ----
function HubFlag({ on = true, size = 18 }) {
  return <span style={{ color: on ? 'var(--color-error-600)' : 'var(--color-gray-300)', display: 'inline-flex' }}><Icon.Flag width={size} height={size} /></span>;
}

// ---- Brand link text ----
function HubLink({ children, size = 16, weight = 600 }) {
  const [h, setH] = useShS(false);
  return <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontSize: size, fontWeight: weight, color: h ? 'var(--color-brand-700)' : 'var(--fg-brand-tertiary)', cursor: 'pointer', textDecoration: h ? 'underline' : 'none' }}>{children}</span>;
}

// ---- Card wrapper ----
function HubCard({ children, onClick, pad = 20 }) {
  const [h, setH] = useShS(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 14, padding: pad,
        boxShadow: h ? 'var(--shadow-md)' : 'var(--shadow-xs)', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease-out',
      }}>
      {children}
    </div>
  );
}

// ---- Status dot + label ----
function HubStatus({ status }) {
  const map = {
    'Not Started': 'var(--color-gray-400)', 'Not started': 'var(--color-gray-400)',
    'Open': 'var(--color-brand-500)', 'On Hold': 'var(--color-warning-500)',
    'Closed': 'var(--color-success-500)', 'Lost': 'var(--color-error-500)', 'Canceled': 'var(--color-gray-400)',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg-tertiary)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: map[status] || 'var(--color-gray-400)' }} />
      {status}
    </span>
  );
}

// ---- Stage badge (indigo pill) ----
function HubStageBadge({ stage }) {
  if (!stage) return null;
  return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-700)', background: 'var(--bg-brand-primary)', borderRadius: 9999, padding: '3px 12px', whiteSpace: 'nowrap' }}>{stage}</span>;
}

// ---- Pagination footer ----
function HubPagination({ start = 1, end, total, label }) {
  const Btn = ({ icon }) => {
    const [h, setH] = useShS(false);
    return (
      <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-secondary)', background: h ? 'var(--bg-primary-hover)' : '#fff', color: 'var(--fg-tertiary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}>
        {React.cloneElement(icon, { width: 18, height: 18 })}
      </button>
    );
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, padding: '16px 4px 4px' }}>
      <span style={{ fontSize: 14, color: 'var(--fg-tertiary)' }}>{label || `${start}–${end} of ${total.toLocaleString()}`}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn icon={<Icon.ChevronLeft />} />
        <Btn icon={<Icon.ChevronRight />} />
      </div>
    </div>
  );
}

// ---- Table primitives ----
const hubTh = { textAlign: 'left', padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--fg-secondary)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-secondary)', background: '#fff' };
const hubTd = { padding: '16px 20px', fontSize: 15, color: 'var(--fg-secondary)', borderBottom: '1px solid var(--border-secondary)', verticalAlign: 'middle' };

function HubCheckbox() {
  const [c, setC] = useShS(false);
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); setC(v => !v); }}
      style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${c ? 'var(--color-brand-600)' : 'var(--border-primary)'}`, background: c ? 'var(--color-brand-600)' : '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>
      {c && <Icon.Check width={13} height={13} />}
      <span style={{ color: '#fff', display: c ? 'inline-flex' : 'none' }} />
    </button>
  );
}

// ---- small contact-icon button (people/companies) ----
function HubMiniIcon({ icon, accent, title, onClick }) {
  const [h, setH] = useShS(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" aria-label={title} onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 32, height: 32, borderRadius: 7, border: 0, background: h ? 'var(--bg-primary-hover)' : 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: accent ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', transition: 'background 120ms' }}>
        {React.cloneElement(icon, { width: 19, height: 19 })}
      </button>
      {h && title && (
        <span role="tooltip" style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-gray-900)', color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1, padding: '6px 8px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)', pointerEvents: 'none', zIndex: 90, animation: 'tt-fade 120ms ease-out' }}>
          {title}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--color-gray-900)' }} />
        </span>
      )}
    </span>
  );
}

// ---- colored tag chip (outline, per-tag color) ----
// DS color-picker tokens: fill = X-50, outline = deep X step, border = mid X step.
const HUB_TAGCOLORS = {
  red:    { fg: 'rgb(183,28,28)',  bd: 'rgb(239,154,154)', bg: 'rgb(254,235,238)' },
  orange: { fg: 'rgb(230,81,0)',   bd: 'rgb(255,183,77)',  bg: 'rgb(255,243,224)' },
  green:  { fg: 'rgb(46,125,50)',  bd: 'rgb(129,199,132)', bg: 'rgb(232,245,233)' },
  blue:   { fg: 'rgb(21,101,192)', bd: 'rgb(100,181,246)', bg: 'rgb(227,242,253)' },
  teal:   { fg: 'rgb(0,121,107)',  bd: 'rgb(77,182,172)',  bg: 'rgb(224,242,241)' },
  purple: { fg: 'rgb(69,39,160)',  bd: 'rgb(179,157,219)', bg: 'rgb(237,231,246)' },
  gray:   { fg: 'rgb(66,66,66)',   bd: 'rgb(189,189,189)', bg: 'rgb(250,250,250)' },
  pink:    { fg: 'rgb(194,24,91)',  bd: 'rgb(244,143,177)', bg: 'rgb(252,228,236)' },
  fuchsia: { fg: 'rgb(123,31,162)', bd: 'rgb(206,147,216)', bg: 'rgb(243,229,245)' },
  yellow:  { fg: 'rgb(245,127,23)', bd: 'rgb(255,241,118)', bg: 'rgb(255,253,231)' },
  indigo:  { fg: 'rgb(26,35,126)',  bd: 'rgb(159,168,218)', bg: 'rgb(232,234,246)' },
  cyan:    { fg: 'rgb(0,131,143)',  bd: 'rgb(77,208,225)',  bg: 'rgb(224,247,250)' },
  lime:    { fg: 'rgb(130,119,23)', bd: 'rgb(220,231,117)', bg: 'rgb(249,251,231)' },
};
function HubColorTag({ label, color = 'gray' }) {
  const c = HUB_TAGCOLORS[color] || HUB_TAGCOLORS.gray;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 4, fontSize: 13, fontWeight: 400, color: c.fg, border: `1px solid ${c.bd}`, background: c.bg, whiteSpace: 'nowrap' }}>{label}</span>;
}

// ---- Toast host (top-center, shared across scripts) ----
function hubToastHost() {
  let host = document.getElementById('hub-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'hub-toast-host';
    host.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none;';
    document.body.appendChild(host);
  }
  return host;
}

// Shared store of generated exports (newest first). ExportsPage listens for 'hub-export-added'.
window.hubExports = window.hubExports || [];
function hubExportTimestamp() {
  const d = new Date();
  let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0'), yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy} ${h}:${m} ${ap}`;
}
function addHubExport(report, type) {
  window.hubExports.unshift({ report, type: type || 'PDF', generated: hubExportTimestamp(), downloaded: '' });
  window.dispatchEvent(new CustomEvent('hub-export-added'));
}

// ---- Two-phase report toast (in-progress → success + Go to Exports) ----
function showHubReportToast(reportName, fileType, opts) {
  const showGoTo = !(opts && opts.hideGoToExports);
  if (!document.getElementById('hub-toast-spin')) {
    const st = document.createElement('style');
    st.id = 'hub-toast-spin';
    st.textContent = '@keyframes hub-spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }
  const host = hubToastHost();
  const card = document.createElement('div');
  card.style.cssText = 'pointer-events:auto;width:392px;max-width:calc(100vw - 48px);border-radius:12px;box-shadow:var(--shadow-lg);padding:16px;display:flex;gap:12px;align-items:center;transform:translateY(-10px);opacity:0;transition:opacity 180ms ease-out, transform 180ms ease-out;font-family:var(--font-body);background:var(--color-brand-50);border:1px solid var(--color-brand-200);';
  card.innerHTML = `
    <div data-icon style="width:36px;height:36px;border-radius:9px;flex-shrink:0;color:var(--color-brand-600);display:inline-flex;align-items:center;justify-content:center;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>
    </div>
    <div data-body style="flex:1;min-width:0;font-size:16px;font-weight:600;color:var(--fg-primary);">Report generation in progress</div>
    <div data-spin style="width:18px;height:18px;flex-shrink:0;border:2px solid var(--color-brand-200);border-top-color:var(--color-brand-600);border-radius:50%;animation:hub-spin 700ms linear infinite;"></div>
    <button data-close aria-label="Dismiss" style="border:0;background:transparent;cursor:pointer;color:var(--fg-tertiary);padding:2px;display:inline-flex;flex-shrink:0;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>`;
  host.appendChild(card);
  requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
  let timer;
  const dismiss = () => { clearTimeout(timer); card.style.opacity = '0'; card.style.transform = 'translateY(-10px)'; setTimeout(() => card.remove(), 200); };
  card.querySelector('[data-close]').addEventListener('click', dismiss);
  setTimeout(() => {
    if (!card.isConnected) return;
    addHubExport(reportName, fileType);
    card.style.background = 'var(--color-success-50)';
    card.style.borderColor = 'var(--color-success-300)';
    card.querySelector('[data-icon]').style.color = 'var(--color-success-600)';
    card.querySelector('[data-icon]').innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>';
    card.querySelector('[data-body]').innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${reportName} successfully generated</span>`;
    const spin = card.querySelector('[data-spin]');
    if (showGoTo) {
      const btn = document.createElement('button');
      btn.textContent = 'Go to Exports';
      btn.style.cssText = 'flex-shrink:0;border:1px solid var(--color-success-600);background:transparent;color:var(--color-success-700);font-family:var(--font-body);font-size:14px;font-weight:600;padding:7px 14px;border-radius:8px;cursor:pointer;';
      btn.addEventListener('click', () => { dismiss(); if (window.hubNavigate) window.hubNavigate('exports'); });
      spin.replaceWith(btn);
    } else {
      spin.remove();
    }
    timer = setTimeout(dismiss, 6000);
  }, 2400);
}

// ---- Success toast (pure DOM so it works across script scopes) ----
function showHubToast(opts) {
  const o = typeof opts === 'string' ? { message: opts } : (opts || {});
  const title = o.title || 'Generating report';
  const message = o.message || '';
  const host = hubToastHost();
  const card = document.createElement('div');
  card.style.cssText = 'pointer-events:auto;width:392px;max-width:calc(100vw - 48px);background:#fff;border:1px solid var(--border-secondary);border-radius:12px;box-shadow:var(--shadow-lg);padding:16px;display:flex;gap:12px;align-items:flex-start;transform:translateY(-10px);opacity:0;transition:opacity 180ms ease-out, transform 180ms ease-out;font-family:var(--font-body);';
  card.innerHTML = `
    <div style="width:40px;height:40px;border-radius:10px;flex-shrink:0;background:var(--color-success-50);color:var(--color-success-600);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--color-success-300);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <div style="flex:1;min-width:0;">
      <div style="font-size:15px;font-weight:600;color:var(--fg-primary);">${title}</div>
      <div style="font-size:14px;line-height:20px;color:var(--fg-tertiary);margin-top:2px;">${message}</div>
      ${o.actionLabel ? `<button data-act style="margin-top:10px;border:0;background:transparent;padding:0;color:var(--color-brand-600);font-weight:600;font-size:14px;cursor:pointer;font-family:var(--font-body);">${o.actionLabel}</button>` : ''}
    </div>
    <button data-close aria-label="Dismiss" style="border:0;background:transparent;cursor:pointer;color:var(--fg-quaternary);padding:2px;display:inline-flex;flex-shrink:0;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>`;
  host.appendChild(card);
  requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
  let timer;
  const dismiss = () => { clearTimeout(timer); card.style.opacity = '0'; card.style.transform = 'translateY(-10px)'; setTimeout(() => card.remove(), 200); };
  card.querySelector('[data-close]').addEventListener('click', dismiss);
  const actBtn = card.querySelector('[data-act]');
  if (actBtn) actBtn.addEventListener('click', () => { dismiss(); o.onAction && o.onAction(); });
  timer = setTimeout(dismiss, 5200);
}

window.HubUI = {
  HubAvatar, HubPageHead, HubSearch, HubIconBtn, HubViewToggle, HubTabs, HubTag, HubFlag,
  HubLink, HubCard, HubStatus, HubStageBadge, HubPagination, HubCheckbox, HubMiniIcon, hubTh, hubTd,
  HubColorTag, showHubToast, showHubReportToast, hubAva,
};
