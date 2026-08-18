// ============================================================
// Thrive TRM Admin — page content (the 5 screenshotted screens)
// ============================================================
const { useState: useS } = React;

function todayStr() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
// Date + time stamp for audit logs, e.g. "Jun 17, 2026 at 2:48 PM"
function auditStamp() {
  const d = new Date();
  const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} at ${time}`;
}
const CURRENT_ADMIN = 'Brendan Murphy';
function rand(n) {return Math.random().toString(36).slice(2, 2 + n);}

// ---- Top-center success toast (pure DOM; fades after 5s) ----
function showAdminToast(opts) {
  const o = typeof opts === 'string' ? { message: opts } : (opts || {});
  const title = o.title || 'Saved';
  const message = o.message || '';
  let host = document.getElementById('admin-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'admin-toast-host';
    host.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none;';
    document.body.appendChild(host);
  }
  const card = document.createElement('div');
  card.style.cssText = 'pointer-events:auto;width:420px;max-width:calc(100vw - 48px);background:#fff;border:1px solid var(--border-secondary);border-radius:12px;box-shadow:var(--shadow-lg);padding:16px;display:flex;gap:12px;align-items:flex-start;transform:translateY(-10px);opacity:0;transition:opacity 180ms ease-out, transform 180ms ease-out;font-family:var(--font-body);';
  card.innerHTML = `
    <div style="width:40px;height:40px;border-radius:10px;flex-shrink:0;background:var(--color-success-50);color:var(--color-success-600);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--color-success-300);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <div style="flex:1;min-width:0;">
      <div style="font-size:15px;font-weight:600;color:var(--fg-primary);">${title}</div>
      ${message ? `<div style="font-size:14px;line-height:20px;color:var(--fg-tertiary);margin-top:2px;">${message}</div>` : ''}
    </div>
    <button data-close aria-label="Dismiss" style="border:0;background:transparent;cursor:pointer;color:var(--fg-quaternary);padding:2px;display:inline-flex;flex-shrink:0;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>`;
  host.appendChild(card);
  requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; });
  let timer;
  const dismiss = () => { clearTimeout(timer); card.style.opacity = '0'; card.style.transform = 'translateY(-10px)'; setTimeout(() => card.remove(), 200); };
  card.querySelector('[data-close]').addEventListener('click', dismiss);
  timer = setTimeout(dismiss, 5000);
}

// content padding wrapper
function PageShell({ children }) {
  return <div style={{ padding: '32px 40px 64px', maxWidth: 1600, margin: '0 auto' }}>{children}</div>;
}

// header row with right-aligned add button (+ optional left content)
function ControlsRow({ left, onAdd, addAccent = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, minHeight: 44, gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
      {onAdd && <UIX.SquareButton icon={<Icon.Plus />} accent={addAccent} onClick={onAdd} title="Add new" />}
    </div>);

}

function StatusText({ status }) {
  const hidden = status === 'Hidden';
  return <span style={{ fontSize: 16, color: hidden ? 'var(--fg-quaternary)' : 'var(--fg-primary)' }}>{status}</span>;
}
function CreatedCell({ created, by }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{created}</div>
      {by && <div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>By {by}</div>}
    </div>);

}

// ============================================================
// 1) CUSTOM FIELDS  (grouped, search, filter, drag, menu)
// ============================================================
function CustomFieldsPage({ state, patch }) {
  const cf = state.customFields;
  const [query, setQuery] = useS('');
  const [filterOpen, setFilterOpen] = useS(false);
  const [fStatus, setFStatus] = useS('All');
  const [fType, setFType] = useS('All');
  const [modal, setModal] = useS(null); // { mode:'add'|'edit', row }

  const matches = (r) => {
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (fStatus !== 'All' && r.status !== fStatus) return false;
    if (fType !== 'All' && r.field !== fType) return false;
    return true;
  };

  const setRows = (rows) => patch('customFields', { ...cf, rows });
  const reorderGroup = (groupId, newGroupRows) => {
    const others = cf.rows.filter((r) => r.group !== groupId);
    // preserve overall ordering by group sequence
    const merged = [];
    cf.groups.forEach((g) => {
      if (g.id === groupId) merged.push(...newGroupRows);else
      merged.push(...others.filter((r) => r.group === g.id));
    });
    setRows(merged);
  };
  const deleteRow = (id) => setRows(cf.rows.filter((r) => r.id !== id));
  const toggleVisible = (id) => setRows(cf.rows.map((r) => r.id === id ? { ...r, status: r.status === 'Visible' ? 'Hidden' : 'Visible' } : r));
  const saveRow = (form) => {
    if (modal.mode === 'edit') {
      setRows(cf.rows.map((r) => r.id === form.id ? form : r));
    } else {
      setRows([...cf.rows, { ...form, id: 'cf' + Date.now(), created: todayStr(), by: 'You', status: 'Visible' }]);
    }
    setModal(null);
  };

  const columns = [
  { key: 'name', label: 'Name', grow: 1.3, sortable: true, render: (r) => <span style={{ fontSize: 16, color: r.status === 'Hidden' ? 'var(--fg-quaternary)' : 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span> },
  { key: 'field', label: 'Field', grow: 1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.field}</span> },
  { key: 'created', label: 'Created', grow: 1, sortable: true, sortVal: (r) => new Date(r.created).getTime() || 0, render: (r) => <CreatedCell created={r.created} by={r.by} /> },
  { key: 'status', label: 'Status', grow: 0.8, sortable: true, render: (r) => <StatusText status={r.status} /> }];

  const rowMenu = (r) => [
  { label: 'Edit', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) },
  { label: r.status === 'Visible' ? 'Hide' : 'Show', icon: r.status === 'Visible' ? <Icon.EyeOff /> : <Icon.Eye />, onClick: () => toggleVisible(r.id) },
  { label: 'Delete', icon: <Icon.Trash />, danger: true, onClick: () => deleteRow(r.id) }];


  const search =
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 'min(720px, 60vw)' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Search width={20} height={20} /></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name"
      onFocus={(e) => {e.target.style.borderColor = 'var(--border-brand)';e.target.style.boxShadow = 'var(--shadow-focus-ring)';}}
      onBlur={(e) => {e.target.style.borderColor = 'var(--border-secondary)';e.target.style.boxShadow = 'var(--shadow-xs)';}}
      style={{ width: '100%', boxSizing: 'border-box', height: 52, padding: '0 16px 0 48px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
      </div>
      <div style={{ position: 'relative' }}>
        <UIX.SquareButton icon={<Icon.Filter />} onClick={() => setFilterOpen((o) => !o)} title="Filter" size={52} accent={fStatus !== 'All' || fType !== 'All'} />
        {filterOpen &&
      <div style={{ position: 'absolute', top: 60, right: 0, zIndex: 60, width: 260, background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Status</div>
            <UIX.Select value={fStatus} onChange={setFStatus} options={['All', 'Visible', 'Hidden']} />
            <div style={{ height: 12 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Field type</div>
            <UIX.Select value={fType} onChange={setFType} options={['All', ...AdminData.FIELD_TYPES]} />
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <UIX.Button variant="tertiary" size="sm" onClick={() => {setFStatus('All');setFType('All');}}>Clear</UIX.Button>
              <UIX.Button size="sm" onClick={() => setFilterOpen(false)}>Apply</UIX.Button>
            </div>
          </div>
      }
      </div>
    </div>;


  return (
    <PageShell>
      <ControlsRow left={search} onAdd={() => setModal({ mode: 'add', row: { name: '', field: 'Text Field', group: cf.groups[0].id } })} />
      {cf.groups.map((g) => {
        const groupRows = cf.rows.filter((r) => r.group === g.id && matches(r));
        const anyInGroup = cf.rows.some((r) => r.group === g.id);
        if (!anyInGroup) return null;
        return (
          <div key={g.id} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', margin: '0 0 14px' }}>{g.label}</h2>
            <DataTable
              columns={columns}
              rows={groupRows}
              dragHandle
              onReorder={(nr) => reorderGroup(g.id, nr)}
              rowMenu={rowMenu}
              emptyText={query || fStatus !== 'All' || fType !== 'All' ? 'No fields match your filters' : 'No fields yet'} />
            
          </div>);

      })}
      {modal && <CustomFieldModal mode={modal.mode} initial={modal.row} groups={cf.groups} onClose={() => setModal(null)} onSave={saveRow} />}
    </PageShell>);

}

function CustomFieldModal({ mode, initial, groups, onClose, onSave }) {
  const [form, setForm] = useS({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name && form.name.trim();
  return (
    <UIX.Modal icon={<Icon.Sliders />} title={mode === 'edit' ? 'Edit custom field' : 'New custom field'} subtitle="Custom fields appear on the records you choose." onClose={onClose}
    footer={<><div style={{ flex: 1 }} /><UIX.Button variant="secondary" onClick={onClose}>Cancel</UIX.Button><UIX.Button disabled={!valid} onClick={() => valid && onSave(form)}>{mode === 'edit' ? 'Save changes' : 'Create field'}</UIX.Button></>}>
      <UIX.Field label="Name"><UIX.TextInput value={form.name} autoFocus onChange={(e) => set('name', e.target.value)} placeholder="e.g. Asset Class" /></UIX.Field>
      <UIX.Field label="Field type"><UIX.Select value={form.field} onChange={(v) => set('field', v)} options={AdminData.FIELD_TYPES} /></UIX.Field>
      <UIX.Field label="Section"><UIX.Select value={form.group} onChange={(v) => set('group', v)} options={groups.map((g) => g.id)} /></UIX.Field>
    </UIX.Modal>);

}

// ============================================================
// 2) CANDIDATE TAGS
// ============================================================
function CandidateTagsPage({ state, patch }) {
  const tags = state.candidateTags;
  const [modal, setModal] = useS(null);
  const setTags = (t) => patch('candidateTags', t);
  const del = (id) => setTags(tags.filter((t) => t.id !== id));
  const save = (form) => {
    if (modal.mode === 'edit') setTags(tags.map((t) => t.id === form.id ? form : t));else
    setTags([...tags, { ...form, id: 't' + Date.now(), projects: 0, updatedBy: 'You', updated: todayStr().replace(/(\w+) (\d+), (\d+)/, '$1 $2, $3') }]);
    setModal(null);
  };
  const columns = [
  { key: 'name', label: 'Tag Name', grow: 1.4, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.name}</span> },
  { key: 'color', label: 'Color Preview', grow: 1, render: (r) => <UIX.TagPill name={r.name} color={r.color} /> },
  { key: 'projects', label: 'Used in Projects', grow: 1, sortable: true, sortVal: (r) => r.projects, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.projects}</span> },
  { key: 'updatedBy', label: 'Last Updated By', grow: 1.2, sortable: true, render: (r) =>
    <div><div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)' }}>{r.updatedBy}</div><div style={{ fontSize: 14, color: 'var(--fg-quaternary)', marginTop: 2 }}>{r.updated}</div></div>
  }];

  const rowMenu = (r) => [
  { label: 'Edit', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) },
  { label: 'Delete', icon: <Icon.Trash />, danger: true, onClick: () => del(r.id) }];

  return (
    <PageShell>
      <ControlsRow onAdd={() => setModal({ mode: 'add', row: { name: '', color: 'blue' } })} />
      <DataTable columns={columns} rows={tags} rowMenu={rowMenu} footer={<>Total Rows: {tags.length}</>} />
      {modal && <TagModal mode={modal.mode} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
    </PageShell>);

}

function TagModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useS({ ...initial });
  const valid = form.name && form.name.trim();
  return (
    <UIX.Modal title={mode === 'edit' ? 'Edit tag' : 'New candidate tag'} subtitle="Tags help you label and group candidates across projects." onClose={onClose}
    footer={<><div style={{ flex: 1 }} /><UIX.Button variant="secondary" onClick={onClose}>Cancel</UIX.Button><UIX.Button disabled={!valid} onClick={() => valid && onSave(form)}>{mode === 'edit' ? 'Save changes' : 'Create tag'}</UIX.Button></>}>
      <UIX.Field label="Tag name"><UIX.TextInput value={form.name} autoFocus onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. NDA" /></UIX.Field>
      <UIX.Field label="Color">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.keys(AdminData.TAG_COLORS).map((c) => {
            const t = AdminData.TAG_COLORS[c];
            const sel = form.color === c;
            return (
              <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{ width: 36, height: 36, borderRadius: 9999, cursor: 'pointer', background: t.bg, border: `2px solid ${sel ? t.fg : t.bd}`, boxShadow: sel ? `0 0 0 3px ${t.bg}` : 'none', position: 'relative' }} title={c}>
                <span style={{ display: 'block', width: 14, height: 14, borderRadius: 9999, background: t.fg, margin: '0 auto' }} />
              </button>);

          })}
        </div>
      </UIX.Field>
      <div style={{ marginTop: 4 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', marginBottom: 8 }}>Preview</span>
        <UIX.TagPill name={form.name || 'Tag'} color={form.color} />
      </div>
    </UIX.Modal>);

}

// ============================================================
// 3) PROJECT STAGES
// ============================================================
function ProjectStagesPage({ state, patch }) {
  const stages = state.projectStages;
  const [modal, setModal] = useS(null);
  const setStages = (s) => patch('projectStages', s);
  const del = (id) => setStages(stages.filter((s) => s.id !== id));
  const save = (form) => {
    if (modal.mode === 'edit') setStages(stages.map((s) => s.id === form.id ? form : s));else
    setStages([...stages.filter((s) => s.type !== 'System'), { ...form, id: 's' + Date.now(), type: 'Standard', candidates: 0, created: todayStr(), draggable: true }, ...stages.filter((s) => s.type === 'System')]);
    setModal(null);
  };
  const columns = [
  { key: 'stage', label: 'Stage', grow: 1.3, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.stage}</span> },
  { key: 'type', label: 'Type', grow: 1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.type}</span> },
  { key: 'category', label: 'Category', grow: 1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.category}</span> },
  { key: 'candidates', label: 'Candidates', grow: 1, sortable: true, sortVal: (r) => r.candidates, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.candidates}</span> },
  { key: 'created', label: 'Created', grow: 1, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.created}</span> }];

  const rowMenu = (r) => r.type === 'System' ?
  [{ label: 'Edit', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) }] :
  [
  { label: 'Edit', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) },
  { label: 'Delete', icon: <Icon.Trash />, danger: true, onClick: () => del(r.id) }];

  return (
    <PageShell>
      <ControlsRow onAdd={() => setModal({ mode: 'add', row: { stage: '', category: '-' } })} />
      <DataTable columns={columns} rows={stages} dragHandle onReorder={setStages} rowMenu={rowMenu} footer={<>Total Rows: {stages.length}</>} />
      {modal && <StageModal mode={modal.mode} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
    </PageShell>);

}

function StageModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useS({ ...initial });
  const valid = form.stage && form.stage.trim();
  const isSystem = form.type === 'System';
  return (
    <UIX.Modal title={mode === 'edit' ? 'Edit stage' : 'New project stage'} subtitle={isSystem ? 'System stages are built in — only the name can be edited.' : 'Stages define the steps candidates move through.'} onClose={onClose}
    footer={<><div style={{ flex: 1 }} /><UIX.Button variant="secondary" onClick={onClose}>Cancel</UIX.Button><UIX.Button disabled={!valid} onClick={() => valid && onSave(form)}>{mode === 'edit' ? 'Save changes' : 'Create stage'}</UIX.Button></>}>
      <UIX.Field label="Stage name"><UIX.TextInput value={form.stage} autoFocus onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))} placeholder="e.g. Final Round" /></UIX.Field>
      {!isSystem && <UIX.Field label="Category"><UIX.Select value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={AdminData.STAGE_CATEGORIES} /></UIX.Field>}
    </UIX.Modal>);

}

// ============================================================
// 4) THRIVE API
// ============================================================
function ThriveApiPage({ state, patch }) {
  const keys = state.apiKeys;
  const [modal, setModal] = useS(null);
  const setKeys = (k) => patch('apiKeys', k);
  const del = (id) => setKeys(keys.filter((k) => k.id !== id));
  const save = (form) => {
    setKeys([{ id: 'k' + Date.now(), name: form.name, key: 'ey**********' + rand(4), access: form.access, lastUsed: 'Never', created: todayStr(), createdBy: 'You' }, ...keys]);
    setModal(null);
  };
  const columns = [
  { key: 'name', label: 'Name', grow: 1.2, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.name}</span> },
  { key: 'key', label: 'Key', grow: 1.3, render: (r) => <UIX.CopyKey value={r.key} /> },
  { key: 'access', label: 'Access', grow: 0.8, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.access}</span> },
  { key: 'lastUsed', label: 'Last used', grow: 1, sortable: true, sortVal: (r) => r.lastUsed === 'Never' ? 0 : new Date(r.lastUsed).getTime(), render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.lastUsed}</span> },
  { key: 'created', label: 'Created', grow: 1, sortable: true, sortVal: (r) => new Date(r.created).getTime() || 0, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.created}</span> },
  { key: 'createdBy', label: 'Created by', grow: 1.1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.createdBy}</span> }];

  const rowMenu = (r) => [{ label: 'Revoke key', icon: <Icon.Trash />, danger: true, onClick: () => del(r.id) }];
  const left =
  <div>
      <h1 style={{ fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>Thrive API</h1>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 15, fontWeight: 500, color: 'var(--fg-brand-tertiary)', textDecoration: 'none' }}>
        <Icon.Link width={16} height={16} /> View API Documentation
      </a>
    </div>;

  return (
    <PageShell>
      <ControlsRow left={left} onAdd={() => setModal({ mode: 'add', row: { name: '', access: 'Viewer' } })} />
      <DataTable columns={columns} rows={keys} rowMenu={rowMenu} />
      {modal && <ApiKeyModal onClose={() => setModal(null)} onSave={save} />}
    </PageShell>);

}

function ApiKeyModal({ onClose, onSave }) {
  const [form, setForm] = useS({ name: '', access: 'Viewer' });
  const valid = form.name && form.name.trim();
  return (
    <UIX.Modal title="New API key" subtitle="Generate a key to access the Thrive API programmatically." onClose={onClose}
    footer={<><div style={{ flex: 1 }} /><UIX.Button variant="secondary" onClick={onClose}>Cancel</UIX.Button><UIX.Button disabled={!valid} onClick={() => valid && onSave(form)}>Generate key</UIX.Button></>}>
      <UIX.Field label="Name"><UIX.TextInput value={form.name} autoFocus onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Reporting integration" /></UIX.Field>
      <UIX.Field label="Access level"><UIX.Select value={form.access} onChange={(v) => setForm((f) => ({ ...f, access: v }))} options={AdminData.ACCESS_LEVELS} /></UIX.Field>
    </UIX.Modal>);

}

// ============================================================
// 5) METAVIEW & RELYANCE (integrations toggles)
// ============================================================
function IntegrationsPage({ state, patch }) {
  const items = state.integrations;
  const setItems = (i) => patch('integrations', i);
  const toggle = (id) => setItems(items.map((it) => it.id === id ? { ...it, enabled: !it.enabled, key: !it.enabled && it.key === '-' ? '**************' : it.key } : it));
  const columns = [
  { key: 'name', label: 'Name', grow: 1.4, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)' }}>{r.name}</span> },
  { key: 'status', label: 'Status', grow: 1, render: (r) => <UIX.Toggle checked={r.enabled} onChange={() => toggle(r.id)} /> },
  { key: 'key', label: 'key', grow: 1.4, render: (r) => r.enabled && r.key !== '-' ? <UIX.CopyKey value={r.key} /> : <span style={{ fontSize: 16, color: 'var(--fg-quaternary)' }}>-</span> }];

  return (
    <PageShell>
      <div style={{ height: 12 }} />
      <DataTable columns={columns} rows={items} />
    </PageShell>);

}

// ============================================================
// 8) ROLES & PERMISSIONS  (search by name/description, add/edit/delete)
// ============================================================
function RolesPage({ state, patch }) {
  const roles = state.roles || AdminData.SEED.roles;
  const [query, setQuery] = useS('');
  const [modal, setModal] = useS(null); // { mode:'add'|'edit', row }
  const setRoles = (r) => patch('roles', r);

  const matches = (r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
  };
  const view = roles.filter(matches);

  const del = (id) => setRoles(roles.filter((r) => r.id !== id));
  const duplicate = (r) => {
    const copy = { ...r, id: 'r' + Date.now(), name: `${r.name} copy`, type: 'Custom', description: r.description || r.name };
    const idx = roles.findIndex((x) => x.id === r.id);
    const next = [...roles];
    next.splice(idx + 1, 0, copy);
    setRoles(next);
    showAdminToast({ title: 'Role duplicated', message: `“${copy.name}” was created as a custom role.` });
  };
  const save = (form) => {
    if (modal.mode === 'edit') {
      setRoles(roles.map((r) => r.id === form.id ? form : r));
      showAdminToast({ title: 'Role saved', message: `Changes to “${form.name}” have been saved.` });
    } else {
      setRoles([...roles, { ...form, id: 'r' + Date.now(), type: 'Custom' }]);
      showAdminToast({ title: 'Role created', message: `“${form.name}” was added as a custom role.` });
    }
    setModal(null);
  };

  const columns = [
    { key: 'name', label: 'Role', grow: 1.1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span> },
    { key: 'type', label: 'Type', grow: 1, sortable: true, render: (r) => <span style={{ fontSize: 16, color: 'var(--fg-secondary)' }}>{r.type}</span> },
    { key: 'description', label: 'Description', grow: 1.8, render: (r) => <span style={{ fontSize: 16, color: r.description ? 'var(--fg-secondary)' : 'var(--fg-quaternary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '—'}</span> },
  ];

  const rowMenu = (r) => r.type === 'System' ?
    [
      { label: 'Edit permissions', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) },
      { label: 'Duplicate', icon: <Icon.Copy2 />, onClick: () => duplicate(r) },
    ] :
    [
      { label: 'Edit', icon: <Icon.Edit />, onClick: () => setModal({ mode: 'edit', row: r }) },
      { label: 'Duplicate', icon: <Icon.Copy2 />, onClick: () => duplicate(r) },
      { label: 'Delete', icon: <Icon.Trash />, danger: true, onClick: () => del(r.id) },
    ];

  const search =
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 'min(720px, 60vw)' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-quaternary)', display: 'inline-flex' }}><Icon.Search width={20} height={20} /></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or description"
          onFocus={(e) => { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-secondary)'; e.target.style.boxShadow = 'var(--shadow-xs)'; }}
          style={{ width: '100%', boxSizing: 'border-box', height: 52, padding: '0 16px 0 48px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 10, outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
      </div>
    </div>;

  return (
    <PageShell>
      <ControlsRow left={search} onAdd={() => setModal({ mode: 'add', row: { name: '', description: '' } })} />
      <DataTable
        columns={columns}
        rows={view}
        rowMenu={rowMenu}
        emptyText={query ? 'No roles match your search' : 'No roles yet'}
        footer={<>Total Rows: {view.length}</>} />
      {modal && <RoleModal mode={modal.mode} initial={modal.row} onClose={() => setModal(null)} onSave={save} />}
    </PageShell>);
}

function RoleModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useS({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isSystem = form.type === 'System';
  const valid = form.name && form.name.trim();
  return (
    <UIX.Modal icon={<Icon.RolesPerms />} title={mode === 'edit' ? (isSystem ? 'Edit permissions' : 'Edit role') : 'New role'}
      subtitle={isSystem ? 'System roles are built in — the name can’t be changed.' : 'Custom roles let you tailor permissions for your team.'} onClose={onClose}
      footer={<><div style={{ flex: 1 }} /><UIX.Button variant="secondary" onClick={onClose}>Cancel</UIX.Button><UIX.Button disabled={!valid} onClick={() => valid && onSave(form)}>{mode === 'edit' ? 'Save changes' : 'Create role'}</UIX.Button></>}>
      <UIX.Field label="Role name">
        {isSystem
          ? <UIX.TextInput value={form.name} disabled style={{ background: 'var(--bg-secondary)', color: 'var(--fg-tertiary)', cursor: 'not-allowed' }} />
          : <UIX.TextInput value={form.name} autoFocus onChange={(e) => set('name', e.target.value)} placeholder="e.g. Engagement Coordinator" />}
      </UIX.Field>
      <UIX.Field label="Description"><UIX.TextInput value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Short description of this role" /></UIX.Field>
    </UIX.Modal>);
}

window.Pages = { CustomFieldsPage, CandidateTagsPage, ProjectStagesPage, ThriveApiPage, IntegrationsPage, AiFeaturesPage, ReportsBrandingPage, RolesPage };

// ============================================================
// 6) AI FEATURES  (master toggle + called-out feature list)
// ============================================================
function AiFeaturesPage({ state, patch }) {
  const ai = state.aiFeatures || { enabled: false, dataTraining: true };
  const on = !!ai.enabled;
  const dataTraining = ai.dataTraining !== false;
  const dtLog = ai.dataTrainingLog || null;
  const setDataTraining = (v) => {
    patch('aiFeatures', { ...ai, dataTraining: v, dataTrainingLog: { value: v, by: CURRENT_ADMIN, at: auditStamp() } });
    showAdminToast({ title: 'Setting saved', message: `AI training data opt-out turned ${v ? 'on' : 'off'}.` });
  };
  const features = [
  { id: 'jd', name: 'Job Description generator', desc: 'Draft job descriptions from project and company details.', icon: <Icon.FileText /> },
  { id: 'ps', name: 'Person summary generator', desc: "Summarize a candidate's background into a concise profile.", icon: <Icon.UserSummary /> },
  { id: 'cr', name: 'Candidate recommendations engine', desc: 'Surface best-fit candidates for each open search.', icon: <Icon.Sparkles /> }];


  const setEnabled = (v) => {
    patch('aiFeatures', { ...ai, enabled: v });
    showAdminToast({ title: 'Setting saved', message: `Generative AI features turned ${v ? 'on' : 'off'}.` });
  };

  return (
    <PageShell>
      <div style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>AI Enablement</h1>
        </div>

        {/* section 1: generative AI */}
        {/* master toggle */}
        <TableKit.Card style={{ borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--bg-brand-secondary)' : 'var(--bg-tertiary)', color: on ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', transition: 'all 200ms ease-out' }}>
              <Icon.Sparkles width={26} height={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)' }}>Generative AI features</span>
                <UIX.Chip variant={on ? 'success' : 'gray'}>{on ? 'On' : 'Off'}</UIX.Chip>
              </div>
              <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--fg-tertiary)', margin: '4px 0 0' }}>When on, the features below become available to your organization.</p>
            </div>
            <UIX.Toggle checked={on} onChange={setEnabled} />
          </div>
        </TableKit.Card>

        {/* feature list */}
        <TableKit.Card style={{ borderRadius: 16, marginTop: 8 }}>
          {features.map((f, i) =>
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px',
            borderBottom: i === features.length - 1 ? 'none' : '1px solid var(--border-secondary)',
            background: 'transparent',
            opacity: on ? 1 : 0.55
          }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--bg-brand-secondary)' : 'var(--bg-tertiary)', color: on ? 'var(--color-brand-600)' : 'var(--fg-quaternary)', transition: 'all 300ms ease-out' }}>
                {React.cloneElement(f.icon, { width: 22, height: 22 })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg-primary)' }}>{f.name}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-tertiary)', marginTop: 2 }}>{f.desc}</div>
              </div>
              <UIX.Chip variant={on ? 'brand' : 'gray'}>{on ? 'Active' : 'Off'}</UIX.Chip>
            </div>
          )}
        </TableKit.Card>

        {/* section 2: data & privacy */}
        <TableKit.Card style={{ borderRadius: 16, marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)' }}>
              <Icon.Shield width={24} height={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>AI training data opt-out</div>
              <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--fg-tertiary)', margin: 0 }}>When on, Thrive may use data from your organization to improve its AI models.</p>
            </div>
            <UIX.Toggle checked={dataTraining} onChange={setDataTraining} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            <Icon.Clock width={15} height={15} style={{ color: 'var(--fg-quaternary)', flexShrink: 0 }} />
            {dtLog ? (
              <span style={{ fontSize: 13, color: 'var(--fg-tertiary)' }}>
                Last set to <strong style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{dtLog.value ? 'On' : 'Off'}</strong> by <strong style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{dtLog.by}</strong> on {dtLog.at}
              </span>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--fg-quaternary)' }}>No changes recorded yet — toggling this setting logs the admin and timestamp.</span>
            )}
          </div>

        </TableKit.Card>
      </div>
    </PageShell>);

}

// ============================================================
// 7) REPORTS BRANDING  (form + live PDF style preview)
// ============================================================
function RBFloatField({ label, required, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', top: -8, left: 12, padding: '0 4px', background: '#fff', fontSize: 12, fontWeight: 500, color: 'var(--fg-tertiary)', zIndex: 1 }}>{label}{required && <span style={{ color: 'var(--fg-error)' }}> *</span>}</span>
      {children}
    </div>);
}

const rbInput = { width: '100%', boxSizing: 'border-box', padding: '14px 14px 10px', fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--fg-primary)', background: '#fff', border: '1px solid var(--border-primary)', borderRadius: 10, outline: 'none', transition: 'box-shadow 150ms, border-color 150ms' };
function rbFocus(e) { e.target.style.borderColor = 'var(--border-brand)'; e.target.style.boxShadow = 'var(--shadow-focus-ring)'; }
function rbBlur(e) { e.target.style.borderColor = 'var(--border-primary)'; e.target.style.boxShadow = 'none'; }

function RBLogoRow({ label, tip, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)' }}>{label}</span>
        <span title={tip} style={{ display: 'inline-flex', color: 'var(--color-brand-500)', cursor: 'help' }}><Icon.Info width={16} height={16} /></span>
      </div>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--border-secondary)', borderRadius: 10, background: '#fff' }}>
          <span style={{ display: 'inline-flex', color: 'var(--color-success-600)', flexShrink: 0 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg></span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          <button type="button" onClick={() => onChange(null)} title="Remove"
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error-50)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            style={{ display: 'inline-flex', border: 0, background: 'transparent', color: 'var(--fg-error)', padding: 6, borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}><Icon.Trash width={18} height={18} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => onChange(label.toLowerCase().replace(/[^a-z]+/g, '_') + '.png')}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-brand)'; e.currentTarget.style.background = 'var(--bg-brand-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.background = '#fff'; }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px 16px', border: '1px dashed var(--border-secondary)', borderRadius: 10, background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--fg-brand-tertiary)', transition: 'all 150ms ease-out' }}>
          <Icon.Upload width={18} height={18} /> Upload a file
        </button>
      )}
    </div>);
}

function RBColorField({ label, value, onChange }) {
  const [hex, setHex] = useS(value);
  React.useEffect(() => { setHex(value); }, [value]);
  const commit = (v) => { let n = v.trim(); if (n && n[0] !== '#') n = '#' + n; onChange(n); };
  return (
    <div>
      <span style={{ display: 'block', fontSize: 14, color: 'var(--fg-tertiary)', marginBottom: 8 }}>{label}</span>
      <label style={{ display: 'block', position: 'relative', height: 46, borderRadius: 8, border: '1px solid var(--border-secondary)', background: value, cursor: 'pointer', overflow: 'hidden' }}>
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 0, padding: 0 }} />
      </label>
      <input value={hex} onChange={(e) => setHex(e.target.value)} onBlur={(e) => { rbBlur(e); commit(e.target.value); }} onFocus={rbFocus}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        style={{ width: '100%', boxSizing: 'border-box', marginTop: 8, padding: '9px 12px', textAlign: 'center', fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--fg-secondary)', background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 8, outline: 'none', transition: 'box-shadow 150ms, border-color 150ms' }} />
    </div>);
}

function RBCharCount({ value, max }) {
  const over = value.length > max;
  return <div style={{ fontSize: 13, color: over ? 'var(--fg-error)' : 'var(--fg-quaternary)', marginTop: 6 }}>{value.length} / {max} characters max</div>;
}

function RBPreviewStar({ filled }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? '#F5A623' : '#D5D7DA'} strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z"/></svg>;
}

function RBReportPreview({ f }) {
  const font = `'${f.fontFamily}', 'Inter', system-ui, sans-serif`;
  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: f.primary, borderRadius: 10, padding: '30px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, color: f.titleText }}>
        <div style={{ textAlign: 'right', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '0.01em' }}>Sample Company</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>Project Report Name</div>
          <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8, opacity: 0.9 }}>DD MMM, YYYY</div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: f.titleText, opacity: 0.5 }} />
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: f.titleText, minWidth: 120, textAlign: 'center' }}>{f.brandName || 'true'}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--border-secondary)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: f.primary }}>{f.brandName || 'true'}</div>
          <span style={{ background: f.primary, color: f.titleText, borderRadius: 9999, padding: '7px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Project Stage</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: f.bodyText }}>Senior VP of Marketing</div>
        <div style={{ fontSize: 14, color: f.secondary, marginTop: 4 }}>TalentFlow Inc. · San Francisco, CA</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--border-secondary)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '16px 24px', background: 'var(--color-gray-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-gray-200)', color: 'var(--fg-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.User width={22} height={22} /></span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: f.bodyText }}>Kendra Martin</div>
              <div style={{ fontSize: 13, color: f.secondary, marginTop: 2 }}>VP of Marketing at TechCorp, Inc.</div>
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: f.secondary, whiteSpace: 'nowrap' }}><Icon.MapPin width={15} height={15} /> Rochelle Park, NJ</div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: f.bodyText, marginBottom: 14 }}>Interview Scorecard</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ display: 'flex', gap: 3, flexShrink: 0, paddingTop: 2 }}>{[0, 1, 2, 3, 4].map((i) => <RBPreviewStar key={i} filled={i < 3} />)}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: f.bodyText }}>Criteria Name</div>
              <div style={{ fontSize: 14, color: f.secondary, marginTop: 4, lineHeight: 1.5 }}>Lorem ipsum dolor sit amet, consectetur adipiscing.</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-secondary)', marginTop: 22, paddingTop: 16 }}>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: f.secondary, margin: 0 }}>{f.footerContent}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 14, fontSize: 12, color: f.secondary }}>
              <span>© {f.copyright}</span>
              {f.showPageNumbers && <span>| ###</span>}
            </div>
          </div>
        </div>
      </div>
    </div>);
}

function ReportsBrandingPage({ state, patch }) {
  const saved = state.reportsBranding || AdminData.SEED.reportsBranding;
  const [f, setF] = useS(saved);
  React.useEffect(() => { setF(saved); }, [saved]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  const cancel = () => setF(saved);
  const save = () => { patch('reportsBranding', f); showAdminToast({ title: 'Branding saved', message: 'Your report brand identity has been updated.' }); };

  const sectionTitle = { fontSize: 20, fontWeight: 600, color: 'var(--fg-primary)', margin: '0 0 20px' };
  const card = { background: '#fff', border: '1px solid var(--border-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-xs)' };

  return (
    <PageShell>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, lineHeight: '32px', fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>Report Brand Identity</h1>
        <p style={{ fontSize: 16, color: 'var(--fg-tertiary)', margin: '6px 0 0' }}>Customize your brand's report identity, colors, and visual elements.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        <div style={{ ...card, padding: 32, display: 'flex', flexDirection: 'column' }}>
          <h2 style={sectionTitle}>Brand Identity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <RBFloatField label="Brand Name" required>
              <input value={f.brandName} onChange={(e) => set('brandName', e.target.value)} onFocus={rbFocus} onBlur={rbBlur} style={rbInput} />
            </RBFloatField>
            <RBFloatField label="Font Family" required>
              <select value={f.fontFamily} onChange={(e) => set('fontFamily', e.target.value)} onFocus={rbFocus} onBlur={rbBlur}
                style={{ ...rbInput, appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717680\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38 }}>
                {AdminData.REPORT_FONTS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </RBFloatField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <RBLogoRow label="Title Page Logo" tip="Shown on the report's cover page. PNG or SVG, transparent background recommended." value={f.titleLogo} onChange={(v) => set('titleLogo', v)} />
            <RBLogoRow label="Header Logo" tip="Shown in the running header of interior pages. PNG or SVG recommended." value={f.headerLogo} onChange={(v) => set('headerLogo', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28 }}>
            <RBColorField label="Primary" value={f.primary} onChange={(v) => set('primary', v)} />
            <RBColorField label="Secondary" value={f.secondary} onChange={(v) => set('secondary', v)} />
            <RBColorField label="Body Text" value={f.bodyText} onChange={(v) => set('bodyText', v)} />
            <RBColorField label="Title Text" value={f.titleText} onChange={(v) => set('titleText', v)} />
          </div>
          <h2 style={{ ...sectionTitle, marginTop: 44 }}>Footer Settings</h2>
          <RBFloatField label="Footer Content" required>
            <textarea value={f.footerContent} maxLength={200} onChange={(e) => set('footerContent', e.target.value)} onFocus={rbFocus} onBlur={rbBlur} rows={3} style={{ ...rbInput, resize: 'vertical', minHeight: 88, lineHeight: 1.5 }} />
          </RBFloatField>
          <RBCharCount value={f.footerContent} max={200} />
          <div style={{ marginTop: 24 }}>
            <RBFloatField label="Copyright Text">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-30%)', color: 'var(--fg-quaternary)', display: 'inline-flex', pointerEvents: 'none' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M15 9.5a3.5 3.5 0 1 0 0 5" strokeLinecap="round"/></svg></span>
                <input value={f.copyright} maxLength={75} onChange={(e) => set('copyright', e.target.value)} onFocus={rbFocus} onBlur={rbBlur} style={{ ...rbInput, paddingLeft: 42 }} />
              </div>
            </RBFloatField>
            <RBCharCount value={f.copyright} max={75} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 24 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg-primary)' }}>Show Page Numbers</span>
            <UIX.Toggle checked={f.showPageNumbers} onChange={(v) => set('showPageNumbers', v)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 40 }}>
            <UIX.Button variant="tertiary" onClick={cancel} disabled={!dirty} size="lg">Cancel</UIX.Button>
            <UIX.Button onClick={save} disabled={!dirty} size="lg">Save</UIX.Button>
          </div>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: 16, padding: 24, position: 'sticky', top: 24 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 20 }}>PDF Style Preview</h2>
          <RBReportPreview f={f} />
        </div>
      </div>
    </PageShell>);
}