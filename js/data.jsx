// ============================================================
// Thrive TRM Admin — seed data + localStorage persistence
// ============================================================
const STORAGE_KEY = 'thrive-admin-state-v1';

// ---- seed data (matches the uploaded screenshots) ----
const SEED = {
  customFields: {
    // grouped sections, in display order
    groups: [
      { id: 'project-overview', label: 'Project/ Overview' },
      { id: 'project-contract', label: 'Project/ Contract' },
      { id: 'candidate-overview', label: 'Candidate/ Overview' },
      { id: 'people-overview', label: 'People/ Overview' },
    ],
    rows: [
      { id: 'cf1', group: 'project-overview', name: 'Testing add Candidate', field: 'Person Lookup', created: 'Jun 03, 2026', by: 'Manoj PM', status: 'Visible' },
      { id: 'cf2', group: 'project-overview', name: 'search firm', field: 'Company Lookup', created: 'Jun 01, 2026', by: 'Angela Zhou', status: 'Visible' },
      { id: 'cf3', group: 'project-overview', name: 'Asset Class', field: 'Single Select', created: 'Feb 27, 2025', by: 'Migration Support', status: 'Visible' },
      { id: 'cf4', group: 'project-overview', name: 'External URL', field: 'Text Field', created: 'Feb 27, 2025', by: 'Migration Support', status: 'Visible' },
      { id: 'cf5', group: 'project-overview', name: 'Redo Search', field: 'Boolean', created: 'Feb 27, 2025', by: 'Migration Support', status: 'Visible' },
      { id: 'cf6', group: 'project-overview', name: 'Search Number', field: 'Text Field', created: 'Feb 27, 2025', by: 'Migration Support', status: 'Visible' },
      { id: 'cf7', group: 'project-contract', name: 'Custom MK field', field: 'Percentage', created: 'Apr 15, 2026', by: 'Recruiter Manjeet', status: 'Visible' },
      { id: 'cf8', group: 'candidate-overview', name: 'NDA Status', field: 'Single Select', created: 'Nov 03, 2025', by: 'Louise Hughes', status: 'Visible' },
      { id: 'cf9', group: 'people-overview', name: 'LinkedIn Headline', field: 'Text Field', created: 'Dec 12, 2025', by: 'Migration Support', status: 'Visible' },
    ],
  },

  roles: [
    { id: 'r1', name: 'Admin', type: 'System', description: '' },
    { id: 'r2', name: 'Candidate', type: 'System', description: '' },
    { id: 'r3', name: 'Hiring Manager', type: 'System', description: '' },
    { id: 'r4', name: 'Hiring Manager No Compensation', type: 'System', description: '' },
    { id: 'r5', name: 'User', type: 'System', description: '' },
    { id: 'r6', name: 'Advisor', type: 'Custom', description: 'Advisor' },
    { id: 'r7', name: 'Analyst', type: 'Custom', description: 'Analyst' },
    { id: 'r8', name: 'Associate', type: 'Custom', description: 'Associate' },
    { id: 'r9', name: 'Engagement Coordinator', type: 'Custom', description: 'Engagement Coordinator' },
    { id: 'r10', name: 'Partner', type: 'Custom', description: 'Partner' },
    { id: 'r11', name: 'Principal', type: 'Custom', description: 'Principal' },
    { id: 'r12', name: 'Recruiter', type: 'Custom', description: 'Recruiter' },
    { id: 'r13', name: 'Researcher', type: 'Custom', description: 'Researcher' },
  ],

  candidateTags: [
    { id: 't1', name: 'mayorca', color: 'orange', projects: 1, updatedBy: 'Keat Teoh', updated: 'April 20, 2026' },
    { id: 't2', name: 'NDA', color: 'green', projects: 2, updatedBy: 'Keat Teoh', updated: 'April 21, 2026' },
    { id: 't3', name: 'NDA 2', color: 'green', projects: 1, updatedBy: 'Keat Teoh', updated: 'April 21, 2026' },
    { id: 't4', name: 'Peasant', color: 'blue', projects: 1, updatedBy: 'Gill Hughes', updated: 'April 03, 2026' },
    { id: 't5', name: 'Queen', color: 'teal', projects: 3, updatedBy: 'Gill Hughes', updated: 'April 03, 2026' },
    { id: 't6', name: 'sween', color: 'gray', projects: 1, updatedBy: 'Keat Teoh', updated: 'April 20, 2026' },
  ],

  projectStages: [
    { id: 's1', stage: 'Research', type: 'Standard', category: '-', candidates: 1636912, created: '-', draggable: false },
    { id: 's2', stage: 'Outreach', type: 'Standard', category: 'Vetting', candidates: 586107, created: '-', draggable: true },
    { id: 's3', stage: 'Recruiter Interview', type: 'Standard', category: 'Interview', candidates: 33421, created: '-', draggable: true },
    { id: 's4', stage: 'Hiring Team Interview', type: 'Standard', category: 'Interview', candidates: 38422, created: '-', draggable: true },
    { id: 's5', stage: 'Offer', type: 'System', category: '-', candidates: 815, created: '-', draggable: false },
    { id: 's6', stage: 'Hired', type: 'System', category: '-', candidates: 13668, created: '-', draggable: false },
    { id: 's7', stage: 'Rejected', type: 'System', category: '-', candidates: 2411343, created: '-', draggable: false },
  ],

  apiKeys: [
    { id: 'k1', name: 'Eleyni Test Editor', key: 'ey**********RH-4', access: 'Editor', lastUsed: 'Jun 05, 2026', created: 'Jun 05, 2026', createdBy: 'Eleyni Rodriguez' },
    { id: 'k2', name: 'New key', key: 'ey**********eosE', access: 'Viewer', lastUsed: 'Jun 05, 2026', created: 'Jun 04, 2026', createdBy: 'Brendan Murphy' },
    { id: 'k3', name: 'jd test', key: 'ey**********CUgY', access: 'Viewer', lastUsed: 'Jun 04, 2026', created: 'Jun 01, 2026', createdBy: 'John Depippo' },
    { id: 'k4', name: 'b-key', key: 'ey**********kmsA', access: 'Admin', lastUsed: 'Jun 05, 2026', created: 'May 20, 2026', createdBy: 'Brendan Murphy' },
    { id: 'k5', name: 'Dan test', key: 'ey**********0OlM', access: 'Admin', lastUsed: 'Never', created: 'Feb 02, 2026', createdBy: 'John Parsons' },
  ],

  integrations: [
    { id: 'i1', name: 'Metaview', enabled: true, key: '**************' },
    { id: 'i2', name: 'Relyance', enabled: false, key: '-' },
  ],

  aiFeatures: { enabled: false },

  reportsBranding: {
    brandName: 'true search',
    fontFamily: 'Montserrat',
    titleLogo: 'title_page_logo.png',
    headerLogo: 'header_logo.png',
    primary: '#e10e0e',
    secondary: '#c7c7c7',
    bodyText: '#3D3D3E',
    titleText: '#ffffff',
    footerContent: 'Strictly confidential. Because this report may contain information that is confidential, proprietary or otherwise legally protected, it may not be further copied, distributed or displayed.',
    copyright: '2026 true search. All rights reserved.',
    showPageNumbers: true,
  },
};

const REPORT_FONTS = ['Montserrat', 'Inter', 'Lato', 'Open Sans', 'Roboto', 'Georgia', 'Arial'];

// ---- persistence helpers ----
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // shallow-merge so newly-added seed keys still appear
      return { ...structuredClone(SEED), ...parsed };
    }
  } catch (e) { /* ignore */ }
  return structuredClone(SEED);
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  return structuredClone(SEED);
}

// tag color tokens — outline pill, light tinted bg
const TAG_COLORS = {
  orange: { fg: 'rgb(230,81,0)',   bd: 'rgb(255,183,77)',  bg: 'rgb(255,243,224)' },
  green:  { fg: 'rgb(46,125,50)',  bd: 'rgb(129,199,132)', bg: 'rgb(232,245,233)' },
  blue:   { fg: 'rgb(21,101,192)', bd: 'rgb(100,181,246)', bg: 'rgb(227,242,253)' },
  teal:   { fg: 'rgb(0,121,107)',  bd: 'rgb(77,182,172)',  bg: 'rgb(224,242,241)' },
  gray:   { fg: 'rgb(66,66,66)',   bd: 'rgb(189,189,189)', bg: 'rgb(250,250,250)' },
  purple: { fg: 'rgb(69,39,160)',  bd: 'rgb(179,157,219)', bg: 'rgb(237,231,246)' },
};

const FIELD_TYPES = ['Text Field', 'Single Select', 'Multi Select', 'Boolean', 'Percentage', 'Number', 'Date', 'Person Lookup', 'Company Lookup'];
const ACCESS_LEVELS = ['Viewer', 'Editor', 'Admin'];
const STAGE_CATEGORIES = ['-', 'Vetting', 'Interview', 'Reference'];

window.AdminData = { SEED, loadState, saveState, resetState, TAG_COLORS, FIELD_TYPES, ACCESS_LEVELS, STAGE_CATEGORIES, REPORT_FONTS };
