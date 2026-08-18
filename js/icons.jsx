// ============================================================
// Thrive TRM Admin — icon set (Untitled UI line style, 2px stroke)
// ============================================================
const S = (p) => ({
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...p,
});

const Icon = {
  // Sidebar — top level
  Users: (p) => <svg {...S(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>,
  RolesPerms: (p) => <svg {...S(p)}><circle cx="9" cy="7" r="3"/><path d="M3 21v-1a5 5 0 0 1 5-5h2"/><circle cx="17" cy="15" r="3"/><path d="M17 12v-1m0 8v1m3-4h1m-8 0H9m6.1-2.1.7-.7m-4.6 4.6-.7.7m5.3 0 .7.7m-4.6-4.6-.7-.7"/></svg>,
  Sliders: (p) => <svg {...S(p)}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>,
  Integrations: (p) => <svg {...S(p)}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Exit: (p) => <svg {...S(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,

  // Chevrons
  ChevronUp: (p) => <svg {...S(p)}><path d="m18 15-6-6-6 6"/></svg>,
  ChevronDown: (p) => <svg {...S(p)}><path d="m6 9 6 6 6-6"/></svg>,
  ChevronRight: (p) => <svg {...S(p)}><path d="m9 6 6 6-6 6"/></svg>,

  // Controls
  Search: (p) => <svg {...S(p)}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  Filter: (p) => <svg {...S(p)}><path d="M6 4v6m0 4v6M18 4v2m0 4v10M12 4v10m0 4v2M3 10h6M15 6h6M9 14h6"/></svg>,
  SortLines: (p) => <svg {...S(p)}><path d="M4 7h16M4 12h11M4 17h6"/></svg>,
  Plus: (p) => <svg {...S(p)}><path d="M12 5v14M5 12h14"/></svg>,
  DotsVertical: (p) => <svg {...S(p)}><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></svg>,
  Copy: (p) => <svg {...S(p)}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: (p) => <svg {...S(p)}><path d="M20 6 9 17l-5-5"/></svg>,
  Link: (p) => <svg {...S(p)}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>,
  X: (p) => <svg {...S(p)}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  User: (p) => <svg {...S(p)}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>,
  Edit: (p) => <svg {...S(p)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
  Trash: (p) => <svg {...S(p)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>,
  EyeOff: (p) => <svg {...S(p)}><path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.2 3.3M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6M1 1l22 22"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/></svg>,
  Eye: (p) => <svg {...S(p)}><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Copy2: (p) => <svg {...S(p)}><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.2a2 2 0 0 0-.6-1.4l-2.2-2.2A2 2 0 0 0 15.8 3H10a2 2 0 0 0-2 2z" /><path d="M16 18v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1"/></svg>,
  FileText: (p) => <svg {...S(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>,
  Note: (p) => <svg {...S(p)}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><path d="M11.5 8h5M11.5 12h5M11.5 16h3"/></svg>,
  UserSummary: (p) => <svg {...S(p)}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M15 9h6M15 13h6M15 17h4"/></svg>,
  Sparkles: (p) => <svg {...S(p)}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>,
  Bookmark: (p) => <svg {...S(p)}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Ban: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>,

  // ---- Hub navigation + top bar ----
  Grid: (p) => <svg {...S(p)}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  Briefcase: (p) => <svg {...S(p)}><rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2.5 13h19"/></svg>,
  Building: (p) => <svg {...S(p)}><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>,
  BarChart: (p) => <svg {...S(p)}><path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-3"/></svg>,
  Clipboard: (p) => <svg {...S(p)}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8.5 11h7M8.5 15h7"/></svg>,
  Map: (p) => <svg {...S(p)}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>,
  Download: (p) => <svg {...S(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  FileDown: (p) => <svg {...S(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11v6M9.5 14.5 12 17l2.5-2.5"/></svg>,
  FileCsv: (p) => <svg {...S(p)}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><text x="12" y="17.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="var(--font-body), sans-serif">CSV</text></svg>,
  Upload: (p) => <svg {...S(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Settings: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
  Bell: (p) => <svg {...S(p)}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  Mail: (p) => <svg {...S(p)}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>,
  Tag: (p) => <svg {...S(p)}><path d="M3 7v4.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8L11 5.6A2 2 0 0 0 9.6 5H5a2 2 0 0 0-2 2Z"/><circle cx="7.5" cy="9.5" r="1.1"/></svg>,
  Chat: (p) => <svg {...S(p)}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>,
  Cube: (p) => <svg {...S(p)}><path d="M12 3 21 8v8l-9 5-9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>,
  Shield: (p) => <svg {...S(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>,
  Lock: (p) => <svg {...S(p)}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  LockUser: (p) => <svg {...S(p)}><rect x="3" y="11" width="14" height="9" rx="2"/><path d="M6 11V8a4 4 0 0 1 7.5-1.9"/><circle cx="19" cy="7" r="2.3"/><path d="M15.4 13c.3-1.6 1.7-2.7 3.6-2.7s3.3 1.1 3.6 2.7"/></svg>,
  AlertTriangle: (p) => <svg {...S(p)}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17v.01"/></svg>,

  // ---- Parent-page chrome ----
  ChevronLeft: (p) => <svg {...S(p)}><path d="m15 18-6-6 6-6"/></svg>,
  Info: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>,
  Adjust: (p) => <svg {...S(p)}><path d="M3 6h10M19 6h2M3 18h6M15 18h6M3 12h2M11 12h10"/><circle cx="16" cy="6" r="2.2"/><circle cx="8" cy="18" r="2.2"/><circle cx="8" cy="12" r="2.2"/></svg>,
  Funnel: (p) => <svg {...S(p)}><path d="M21 4H3l7 8.5V19l4 2v-8.5z"/></svg>,
  ListView: (p) => <svg {...S(p)}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  CardView: (p) => <svg {...S(p)}><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>,
  Phone: (p) => <svg {...S(p)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>,
  LinkedIn: (p) => <svg {...S(p)}><rect x="2.5" y="2.5" width="19" height="19" rx="3.5"/><path d="M7 10.5v6M7 7.2v.01M11 16.5v-6M11 13.2a2.3 2.3 0 0 1 4.5 0v3.3"/></svg>,
  Flag: (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><path d="M5 22V3.5"/><path d="M5 4.2h12.5l-2.3 4 2.3 4H5z"/></svg>,
  AddProject: (p) => <svg {...S(p)}><rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 11.5v5M9.5 14h5"/></svg>,
  AddList: (p) => <svg {...S(p)}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 10.5v6M9 13.5h6"/></svg>,
  IdCard: (p) => <svg {...S(p)}><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0M14.5 10h4M14.5 13.5h4"/></svg>,
  Trending: (p) => <svg {...S(p)}><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>,
  Network: (p) => <svg {...S(p)}><circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4v3.6M10.3 13.2 6.7 16.8M13.7 13.2l3.6 3.6"/></svg>,
  Globe: (p) => <svg {...S(p)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>,

  // ---- Project workspace ----
  ThumbsUp: (p) => <svg {...S(p)}><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/><path d="M7 11l3.5-7.2a1.8 1.8 0 0 1 3.4 1.1L13 9h5.2a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17 20H7"/></svg>,
  ThumbsDown: (p) => <svg {...S(p)}><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1z"/><path d="M17 13l-3.5 7.2a1.8 1.8 0 0 1-3.4-1.1L11 15H5.8a2 2 0 0 1-2-2.4l1.2-6A2 2 0 0 1 7 4h10"/></svg>,
  Star: (p) => <svg {...S(p)}><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z"/></svg>,
  Calendar: (p) => <svg {...S(p)}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4"/></svg>,
  CalendarPlus: (p) => <svg {...S(p)}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>,
  MessagePlus: (p) => <svg {...S(p)}><path d="M21 11.5a8.4 8.4 0 0 1-11.7 7.7L3 21l1.8-6.3A8.4 8.4 0 1 1 21 11.5z"/><path d="M12 8.2v4.6M9.7 10.5h4.6"/></svg>,
  Video: (p) => <svg {...S(p)}><rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="m15.5 10 6-3.5v11l-6-3.5z"/></svg>,
  MapPin: (p) => <svg {...S(p)}><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.8"/></svg>,
  UserPlus: (p) => <svg {...S(p)}><path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6M16 11h6"/></svg>,
  ClipboardCheck: (p) => <svg {...S(p)}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>,
};

// 6-dot drag grip (Untitled UI "DotsGrid")
const DragGrip = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
    {[6, 10, 14].map((cy) => [6.5, 13.5].map((cx) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" />
    )))}
  </svg>
);

window.Icon = Icon;
window.DragGrip = DragGrip;
