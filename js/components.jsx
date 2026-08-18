// ============================================================
// Thrive TRM Admin — shared UI primitives
// ============================================================
const { useState, useEffect, useRef, useCallback } = React;

// ---- Primary solid button (brand) ----
function Button({ children, variant = 'primary', size = 'md', onClick, leftIcon, type = 'button', disabled }) {
  const sizes = {
    sm: { padding: '8px 12px', fontSize: 14 },
    md: { padding: '10px 16px', fontSize: 14 },
    lg: { padding: '12px 18px', fontSize: 16 },
  };
  const variants = {
    primary: { background: 'var(--bg-brand-solid)', color: '#fff', border: '1px solid transparent', boxShadow: 'var(--shadow-skeu)' },
    secondary: { background: '#fff', color: 'var(--fg-secondary)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-xs)' },
    tertiary: { background: 'transparent', color: 'var(--fg-secondary)', border: '1px solid transparent' },
    destructive: { background: 'var(--bg-error-solid)', color: '#fff', border: '1px solid transparent', boxShadow: 'var(--shadow-skeu)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.background = 'var(--bg-brand-solid-hover)'; if (!disabled && variant === 'secondary') e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
      onMouseLeave={(e) => { if (variant === 'primary') e.currentTarget.style.background = 'var(--bg-brand-solid)'; if (variant === 'secondary') e.currentTarget.style.background = '#fff'; }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'background 150ms ease-out', whiteSpace: 'nowrap', ...sizes[size], ...variants[variant],
      }}>
      {leftIcon}{children}
    </button>
  );
}

// ---- Square icon button (filter / add "+") ----
function SquareButton({ icon, onClick, accent = false, title, size = 44 }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10, cursor: 'pointer', transition: 'all 150ms ease-out',
        background: hover ? (accent ? 'var(--bg-brand-primary)' : 'var(--bg-primary-hover)') : '#fff',
        border: `1px solid ${accent ? 'var(--color-brand-200)' : 'var(--border-secondary)'}`,
        color: accent ? 'var(--color-brand-600)' : 'var(--fg-tertiary)',
        boxShadow: 'var(--shadow-xs)',
      }}>
      {React.cloneElement(icon, { width: 22, height: 22 })}
    </button>
  );
}

// ---- Toggle switch ----
function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 9999, border: 0, padding: 2, cursor: 'pointer',
        background: checked ? 'var(--bg-brand-solid)' : 'var(--color-gray-300)',
        transition: 'background 150ms ease-out', position: 'relative', flexShrink: 0,
      }}>
      <span style={{
        display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease-out',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
      }} />
    </button>
  );
}

// ---- Copy-to-clipboard inline button ----
function CopyKey({ value, mono = true }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    const text = (value || '').replace(/[*]/g, '') || value;
    try { navigator.clipboard.writeText(value); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: mono ? 15 : 'inherit', color: 'var(--fg-primary)', letterSpacing: mono ? '0.5px' : 0 }}>{value}</span>
      <button type="button" onClick={doCopy} title="Copy"
        style={{ display: 'inline-flex', background: 'none', border: 0, padding: 4, borderRadius: 6, cursor: 'pointer', color: copied ? 'var(--color-success-600)' : 'var(--color-brand-600)' }}>
        {copied ? <Icon.Check width={18} height={18} /> : <Icon.Copy2 width={18} height={18} />}
      </button>
    </span>
  );
}

// ---- Tag pill (outline) ----
function TagPill({ name, color }) {
  const c = AdminData.TAG_COLORS[color] || AdminData.TAG_COLORS.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 4,
      fontSize: 13, fontWeight: 400, color: c.fg, border: `1px solid ${c.bd}`, background: '#fff',
    }}>{name}</span>
  );
}

// ---- Status chip (rounded pill + dot) ----
function Chip({ children, variant = 'gray', dot = true }) {
  const styles = {
    gray:    { bg: 'var(--color-gray-50)',    fg: 'var(--color-gray-700)',    bd: 'var(--color-gray-200)',    dot: 'var(--color-gray-500)' },
    brand:   { bg: 'var(--color-brand-50)',   fg: 'var(--color-brand-700)',   bd: 'var(--color-brand-200)',   dot: 'var(--color-brand-600)' },
    success: { bg: 'var(--color-success-50)', fg: 'var(--color-success-700)', bd: 'var(--color-success-300)', dot: 'var(--color-success-500)' },
    warning: { bg: 'var(--color-warning-50)', fg: 'var(--color-warning-700)', bd: 'var(--color-warning-300)', dot: 'var(--color-warning-500)' },
    error:   { bg: 'var(--color-error-50)',   fg: 'var(--color-error-700)',   bd: 'var(--color-error-300)',   dot: 'var(--color-error-500)' },
  }[variant] || null;
  const c = styles || { bg: 'var(--color-gray-50)', fg: 'var(--color-gray-700)', bd: 'var(--color-gray-200)', dot: 'var(--color-gray-500)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 10px', borderRadius: 9999,
      fontSize: 14, lineHeight: '20px', fontWeight: 500,
      color: c.fg, background: c.bg, border: `1px solid ${c.bd}`,
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

// ---- Row "⋮" dropdown menu ----
function RowMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = open ? 'var(--bg-primary-hover)' : 'transparent'}
        style={{ width: 36, height: 36, borderRadius: 8, border: 0, cursor: 'pointer', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: open ? 'var(--bg-primary-hover)' : 'transparent' }}>
        <Icon.DotsVertical width={20} height={20} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 42, right: 0, minWidth: 180, zIndex: 50,
          background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10,
          boxShadow: 'var(--shadow-lg)', padding: 4, overflow: 'hidden',
        }}>
          {items.map((it, i) => (
            <button key={i} type="button"
              onClick={() => { setOpen(false); it.onClick(); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                padding: '9px 12px', border: 0, background: 'transparent', cursor: 'pointer',
                borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                color: it.danger ? 'var(--fg-error)' : 'var(--fg-secondary)',
              }}>
              {it.icon && React.cloneElement(it.icon, { width: 16, height: 16 })}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Modal shell ----
// [spine] role: shell · name: dialogShell · surface: modal
// Shared dialog shell (scrim + centered card). Owns dialogTitle, dialogContent, dialogActions. Variance: low.
function Modal({ title, subtitle, onClose, children, footer, icon }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onMouseDown={onClose} data-spine-role="shell" data-spine-name="dialogShell" data-spine-surface="modal" style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,13,18,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'tt-fade 150ms ease-out',
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16,
        boxShadow: 'var(--shadow-2xl)', animation: 'tt-pop 150ms ease-out', overflow: 'hidden',
      }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }} data-spine-role="header" data-spine-name="dialogTitle" data-spine-surface="modal">
          {icon && (
            <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-brand-secondary)', color: 'var(--color-brand-600)' }}>
              {React.cloneElement(icon, { width: 22, height: 22 })}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, lineHeight: '28px', fontWeight: 600, color: 'var(--fg-primary)' }}>{title}</h3>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--fg-tertiary)' }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--fg-quaternary)', padding: 4, borderRadius: 6, display: 'inline-flex' }}>
            <Icon.X width={20} height={20} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }} data-spine-role="body" data-spine-name="dialogContent" data-spine-surface="modal">{children}</div>
        {footer && (
          <div data-spine-role="footer" data-spine-name="dialogActions" data-spine-surface="modal" style={{ display: 'flex', gap: 12, padding: '16px 24px', borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Form field wrapper ----
function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 15,
  fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff',
  border: '1px solid var(--border-primary)', borderRadius: 8, outline: 'none',
  transition: 'box-shadow 150ms, border-color 150ms',
};
function focusRing(e) { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }
function blurRing(e) { e.target.style.borderColor = 'var(--border-primary)'; e.target.style.boxShadow = 'none'; }

function TextInput(props) {
  return <input {...props} onFocus={(e) => { focusRing(e); props.onFocus && props.onFocus(e); }} onBlur={(e) => { blurRing(e); props.onBlur && props.onBlur(e); }} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={focusRing} onBlur={blurRing}
      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717680\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38 }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

window.UIX = { Button, SquareButton, Toggle, CopyKey, TagPill, Chip, RowMenu, Modal, Field, TextInput, Select };
