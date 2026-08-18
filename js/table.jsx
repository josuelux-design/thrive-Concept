// ============================================================
// Thrive TRM Admin — DataTable + layout cards
// ============================================================
const { useState: useStateT } = React;

// White rounded card container
function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border-secondary)',
      borderRadius: 16, boxShadow: 'var(--shadow-xs)', overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

// Sort indicator
function SortCaret({ dir }) {
  return (
    <span style={{ display: 'inline-flex', marginLeft: 6, color: dir ? 'var(--fg-brand-tertiary)' : 'var(--color-gray-400)', opacity: dir ? 1 : 0.45 }}>
      {dir === 'desc'
        ? <Icon.ChevronDown width={16} height={16} />
        : <Icon.ChevronUp width={16} height={16} />}
    </span>
  );
}

// columns: [{ key, label, grow, width, align, sortable, sortVal, render }]
function DataTable({ columns, rows, dragHandle = false, onReorder, rowMenu, footer, emptyText }) {
  const [sort, setSort] = useStateT({ key: null, dir: null }); // dir: 'asc' | 'desc' | null
  const [dragId, setDragId] = useStateT(null);
  const [overId, setOverId] = useStateT(null);

  const sorting = !!sort.key;
  const handleSort = (col) => {
    if (!col.sortable) return;
    setSort((s) => {
      if (s.key !== col.key) return { key: col.key, dir: 'asc' };
      if (s.dir === 'asc') return { key: col.key, dir: 'desc' };
      return { key: null, dir: null };
    });
  };

  let view = rows;
  if (sorting) {
    const col = columns.find(c => c.key === sort.key);
    const val = (r) => (col.sortVal ? col.sortVal(r) : r[col.key]);
    view = [...rows].sort((a, b) => {
      let av = val(a), bv = val(b);
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      av = ('' + av).toLowerCase(); bv = ('' + bv).toLowerCase();
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  // grid template
  const tracks = [];
  if (dragHandle) tracks.push('44px');
  columns.forEach(c => tracks.push(c.width || (c.grow ? `minmax(0, ${c.grow}fr)` : 'minmax(0, 1fr)')));
  if (rowMenu) tracks.push('56px');
  const gridTemplate = tracks.join(' ');

  const canDrag = dragHandle && !sorting && onReorder;
  const onDrop = (targetId) => {
    if (dragId == null || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const from = rows.findIndex(r => r.id === dragId);
    const to = rows.findIndex(r => r.id === targetId);
    if (from < 0 || to < 0) { setDragId(null); setOverId(null); return; }
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setDragId(null); setOverId(null);
  };

  const cellPadV = 18;
  return (
    <Card>
      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-secondary)' }}>
        {dragHandle && <span />}
        {columns.map(c => (
          <div key={c.key} onClick={() => handleSort(c)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start', fontSize: 15, fontWeight: 600, color: 'var(--fg-secondary)', cursor: c.sortable ? 'pointer' : 'default', userSelect: 'none' }}>
            {c.label}
            {c.sortable && sort.key === c.key && <SortCaret dir={sort.dir} />}
          </div>
        ))}
        {rowMenu && <span />}
      </div>

      {/* rows */}
      {view.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--fg-quaternary)', fontSize: 15 }}>{emptyText || 'No results'}</div>
      )}
      {view.map((row, idx) => {
        const rowDraggable = canDrag && row.draggable !== false;
        const isOver = overId === row.id && dragId != null && dragId !== row.id;
        const menuItems = rowMenu ? rowMenu(row) : null;
        return (
          <div key={row.id}
            draggable={rowDraggable}
            onDragStart={(e) => { if (!rowDraggable) { e.preventDefault(); return; } setDragId(row.id); e.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(e) => { if (canDrag && dragId != null) { e.preventDefault(); setOverId(row.id); } }}
            onDragLeave={() => { if (overId === row.id) setOverId(null); }}
            onDrop={(e) => { e.preventDefault(); onDrop(row.id); }}
            onMouseEnter={(e) => { if (dragId == null) e.currentTarget.style.background = 'var(--bg-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = dragId === row.id ? 'var(--bg-brand-primary)' : 'transparent'; }}
            style={{
              display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center',
              padding: `${cellPadV}px 24px`,
              borderBottom: idx === view.length - 1 ? 'none' : '1px solid var(--border-secondary)',
              background: dragId === row.id ? 'var(--bg-brand-primary)' : 'transparent',
              boxShadow: isOver ? 'inset 0 2px 0 var(--color-brand-500)' : 'none',
              transition: 'background 120ms ease-out',
            }}>
            {dragHandle && (
              <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gray-400)', cursor: rowDraggable ? 'grab' : 'default', opacity: rowDraggable ? 1 : 0 }}>
                <DragGrip size={20} />
              </span>
            )}
            {columns.map(c => (
              <div key={c.key} style={{ minWidth: 0, display: 'flex', justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                {c.render ? c.render(row) : <span style={{ fontSize: 16, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row[c.key]}</span>}
              </div>
            ))}
            {rowMenu && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {menuItems && menuItems.length > 0 ? <UIX.RowMenu items={menuItems} /> : <span />}
              </div>
            )}
          </div>
        );
      })}

      {footer && (
        <div style={{ padding: '16px 24px', textAlign: 'right', fontSize: 15, color: 'var(--fg-secondary)', borderTop: view.length ? '1px solid var(--border-secondary)' : 'none' }}>{footer}</div>
      )}
    </Card>
  );
}

window.TableKit = { Card, DataTable };
window.DataTable = DataTable;
window.Card = Card;
