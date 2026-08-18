// ============================================================
// Thrive TRM — Hub parent-page sample data
// Representative records (not full datasets) for each parent page.
// ============================================================

const HubData = {};

// ---- Companies ----
HubData.COMPANIES = [
  { name: 'Netflix', city: 'Los Gatos', region: 'CA', country: 'United States', revenue: '$31B', headcount: '10001+', offLimits: true, web: true, li: true, tags: ['GEMS - Digital Rights Management (DRM)', 'Consumer - Omnichannel Media Content'] },
  { name: 'Airbnb', city: 'San Francisco', region: 'CA', country: 'United States', revenue: '$8.4B', headcount: '5001-10000', offLimits: true, web: true, li: true, tags: ['Internet - Marketplace', 'Technology', 'Telecoms/TMT', 'Internet - Travel'] },
  { name: 'SwitchCo 1', city: '', region: '', country: '', revenue: '-', headcount: '-', offLimits: true, web: true, li: true, tags: [] },
  { name: 'SurveyMonkey', city: 'San Mateo', region: 'CA', country: 'United States', revenue: '$481M', headcount: '1001-5000', offLimits: true, web: true, li: true, tags: ['Software - Business Application', 'Technology', 'Telecoms/TMT', 'Software - Artificial Intelligence'] },
  { name: 'ezCater', city: 'Boston', region: 'MA', country: 'United States', revenue: '$102M', headcount: '501-1000', offLimits: true, web: true, li: true, tags: ['Software - Business Application', 'Food > Restaurants', 'Internet - Marketplace'] },
  { name: 'Netwrix', city: 'Frisco', region: 'TX', country: 'United States', revenue: '$200M', headcount: '501-1000', offLimits: true, web: true, li: true, tags: ['Software - IT Infrastructure', 'Software - Security'] },
  { name: 'Catbird', city: 'Brooklyn', region: 'NY', country: 'United States', revenue: '$56M', headcount: '251-500', offLimits: true, web: true, li: true, tags: ['Consumer - Retail E-commerce', 'Consumer - Fashion/Luxury'] },
  { name: 'Faherty Brand', city: 'New York', region: 'NY', country: 'United States', revenue: '$15M', headcount: '251-500', offLimits: true, web: true, li: true, tags: ['Consumer - Fashion/Luxury'] },
  { name: 'Chase', city: 'New York', region: 'NY', country: 'United States', revenue: '-', headcount: '-', offLimits: true, web: true, li: true, tags: ['Industrial - Manufacturing'] },
  { name: 'LeoLabs', city: 'Menlo Park', region: 'CA', country: 'United States', revenue: '$93M', headcount: '51-100', offLimits: true, web: true, li: true, tags: ['Software - Business Application'] },
  { name: 'JPMorgan Chase & Co.', city: 'New York', region: 'NY', country: 'United States', revenue: '$136B', headcount: '10001+', offLimits: true, web: true, li: true, tags: ['Software - MegaTech', 'Software - Supply Chain'] },
  { name: 'General Electric', city: 'Boston', region: 'MA', country: 'United States', revenue: '$77B', headcount: '10001+', offLimits: true, web: true, li: true, tags: ['Internet - MegaTech', 'Banking and Asset Management'] },
];

// ---- Company logos (real-world domains → Clearbit logo API; graceful fallback to glyph) ----
HubData.LOGO_DOMAINS = {
  'Netflix': 'netflix.com',
  'Airbnb': 'airbnb.com',
  'SurveyMonkey': 'surveymonkey.com',
  'ezCater': 'ezcater.com',
  'Netwrix': 'netwrix.com',
  'Faherty Brand': 'fahertybrand.com',
  'Chase': 'chase.com',
  'JPMorgan Chase & Co.': 'jpmorganchase.com',
  'General Electric': 'ge.com',
  'LeoLabs': 'leolabs.space',
  'Catbird': 'catbirdnyc.com',
  'Lightspeed Commerce': 'lightspeedhq.com',
  'EagleView Technologies': 'eagleview.com',
  'Outreach': 'outreach.io',
  'QuickBase': 'quickbase.com',
  "Kohl's": 'kohls.com',
  'Samsung Electronics': 'samsung.com',
  'Yum! Brands': 'yum.com',
};
HubData.companyLogo = (name) => {
  const d = HubData.LOGO_DOMAINS[name];
  return d ? `https://icons.duckduckgo.com/ip3/${d}.ico` : null;
};

// ---- People ----
HubData.PEOPLE = [
  { name: 'Tina Yuan', title: 'Vice President', company: 'Brighton Park Capital', city: 'New York City', region: 'NY', country: 'United States', offLimits: true, inProject: true, tags: [] },
  { name: 'Khaled Barazi', title: 'Member', company: 'LaunchPad Venture Group', city: 'Boston', region: 'MA', country: 'United States', offLimits: false, inProject: false, tags: [] },
  { name: 'Kate Shepard', title: 'Vice President Operations', company: 'ApolloMD', city: 'Los Angeles', region: 'CA', country: 'United States', offLimits: true, inProject: false, tags: [] },
  { name: 'Drew Blackard', title: 'Vice President, Mobile Product Management', company: 'Samsung Electronics', city: 'Dallas', region: 'TX', country: 'United States', offLimits: false, inProject: false, tags: [] },
  { name: 'Ellen Ibrahim', title: 'Chief People Officer', company: 'Droit', city: 'New York City', region: 'NY', country: 'United States', offLimits: false, inProject: true, inProjectStage: 'early', tags: ['10/10 Gender'] },
  { name: 'Renee Tulenko', title: '', company: '', city: 'New York City', region: 'NY', country: 'United States', offLimits: false, inProject: false, tags: [] },
  { name: 'Alexandra Barsk', title: 'Global CFO, Pizza Hut', company: 'Yum! Brands', city: 'Dallas', region: 'TX', country: 'United States', offLimits: false, inProject: false, tags: ['10/10 Gender'] },
  { name: 'Belinda Chan', title: 'Regional Project Manager, Fulfillment', company: 'DHL eCommerce', city: '', region: '', country: 'Singapore', offLimits: false, inProject: false, tags: [] },
  { name: 'Adam Rakvica', title: 'Vice President - Finance', company: 'CBS Corporation', city: 'New York City', region: 'NY', country: 'United States', offLimits: false, inProject: false, tags: [] },
  { name: 'Markus Müller', title: 'Product Coach, Advisor and Maker', company: 'Freelance Product Coach & Consultant', city: 'Berlin', region: '', country: 'Germany', offLimits: false, inProject: false, tags: [] },
  { name: 'Bruce Traub', title: '', company: '', city: '', region: '', country: '', offLimits: false, inProject: false, tags: [] },
  { name: 'Philip D. Clark', title: 'Executive Director, Business Development', company: 'Medpoint, LLC', city: 'New York City', region: 'NY', country: 'United States', offLimits: false, inProject: false, tags: [] },
];

// Double the People roster with deterministic, randomly-generated profiles —
// weighted toward Off Limits / In Project so those statuses are well represented.
(function () {
  const FIRST = ['Olivia', 'Liam', 'Sofia', 'Mateo', 'Aisha', 'Noah', 'Priya', 'Lucas', 'Hana', 'Ethan', 'Yuki', 'Diego', 'Maya', 'Omar', 'Clara', 'Andre', 'Nadia', 'Felix', 'Grace', 'Ravi', 'Ingrid', 'Marcus', 'Lena', 'Tomas', 'Amara', 'Victor', 'Elena', 'Sanjay'];
  const LAST = ['Okonkwo', 'Bergström', 'Nakamura', 'Costa', 'Rahman', 'Whitfield', 'Castellano', 'Vasquez', 'Petrov', 'Lindqvist', 'Haddad', 'Mensah', 'Park', 'Salinas', 'Doyle', 'Brandt', 'Holm', 'Iqbal', 'Romano', 'Eze', 'Novak', 'Tan', 'Schmidt', 'Ferreira', 'Kowalski', 'Reyes'];
  const TITLES = ['Chief Financial Officer', 'VP of Engineering', 'Chief Marketing Officer', 'Head of Product', 'Chief People Officer', 'SVP, Sales', 'Chief Technology Officer', 'VP, Operations', 'General Counsel', 'Chief Revenue Officer', 'Head of Data Science', 'VP, Corporate Development', 'Director of Engineering', 'Chief Product Officer', 'VP, Talent Acquisition', 'Head of Growth'];
  const COMPANIES = ['Stripe', 'Datadog', 'Figma', 'Snowflake', 'Plaid', 'Affirm', 'Square', 'Klarna', 'Shopify', 'Chime', 'Wise', 'Brex', 'Notion', 'Ramp', 'Gusto', 'Asana', 'Coupa', 'Anaplan', 'Braze', 'Amplitude', 'Carta', 'Toast'];
  const LOCS = [['San Francisco', 'CA', 'United States'], ['New York City', 'NY', 'United States'], ['Austin', 'TX', 'United States'], ['Seattle', 'WA', 'United States'], ['Boston', 'MA', 'United States'], ['Chicago', 'IL', 'United States'], ['London', '', 'United Kingdom'], ['Toronto', '', 'Canada'], ['Berlin', '', 'Germany'], ['Singapore', '', 'Singapore'], ['Amsterdam', '', 'Netherlands'], ['Sydney', '', 'Australia']];
  const TAGSETS = [[], [], [], ['10/10 Gender'], ['Diversity Slate'], ['Boomerang']];
  let s = 0x9e3779b9 >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const used = new Set(HubData.PEOPLE.map(p => p.name));
  const target = HubData.PEOPLE.length; // double the roster
  let made = 0, guard = 0;
  while (made < target && guard++ < 600) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (used.has(name)) continue;
    used.add(name);
    const loc = pick(LOCS);
    const inProject = rnd() < 0.5;
    HubData.PEOPLE.push({
      name, title: pick(TITLES), company: pick(COMPANIES),
      city: loc[0], region: loc[1], country: loc[2],
      offLimits: rnd() < 0.45, inProject,
      inProjectStage: inProject ? (rnd() < 0.5 ? 'early' : undefined) : undefined,
      tags: pick(TAGSETS),
    });
    made++;
  }
})();

// ---- Projects ----
HubData.PROJECTS = [
  { title: 'Director, Product Management, Capital (Agent Test v4)', company: 'Lightspeed Commerce', city: 'Montréal', region: 'QC', country: 'Canada', tags: ['Software - Business Application'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: 'Research', candidates: 100, confidential: false, openDate: '-' },
  { title: 'VP of Product - Eagleview', company: 'EagleView Technologies', city: 'Bellevue', region: 'WA', country: 'United States', tags: ['Software - Business Application', 'FinTech'], lead: 'Kafui Nutakor', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Prudentia Head of AI', company: 'Prudentia Sciences, Inc.', city: 'Cambridge', region: 'MA', country: 'United States', tags: ['Commercial', 'Agriculture'], lead: 'Kafui Nutakor', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'test 9', company: 'Ju-Ju-Be International', city: '', region: '', country: '', tags: ['Consumer - Fashion/Luxury'], lead: 'John Parsons', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Head of Forward Deployed Research (Agent Test v4)', company: 'ISARA', city: '', region: '', country: '', tags: [], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Vice President, Product Management, NextGen', company: 'QuickBase', city: 'Boston', region: 'MA', country: 'United States', tags: ['Software - Business Application'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Applied Science and Engineering Director (Agent Test v4)', company: 'Outreach', city: 'Seattle', region: 'WA', country: 'United States', tags: ['Software - Business Application', 'Technology'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Head of AI (Agent Test v4)', company: 'Prudentia Sciences, Inc.', city: 'Cambridge', region: 'MA', country: 'United States', tags: ['Commercial', 'Agriculture'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Chief Product Officer (Agent Test v4)', company: 'SurveyMonkey', city: 'San Mateo', region: 'CA', country: 'United States', tags: ['Software - Business Application', 'Technology'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Chief Technology Officer (Agent Test v4)', company: 'Netwrix', city: 'Frisco', region: 'TX', country: 'United States', tags: ['Software - IT Infrastructure', 'Software - Security'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Chief Financial Officer (Agent Test v4)', company: 'Catbird', city: 'Brooklyn', region: 'NY', country: 'United States', tags: ['Consumer - Retail E-commerce'], lead: 'Eleyni Rodriguez', status: 'Not Started', stage: '', candidates: 0, confidential: false, openDate: '-' },
  { title: 'Director of Engineering', company: "Kohl's", city: 'Seattle', region: 'WA', country: 'United States', tags: ['Consumer - Retail Omnichannel'], lead: 'Keat Teoh', status: 'Open', stage: 'Outreach', candidates: 24, confidential: false, openDate: 'Apr 28, 2026' },
];

// ---- Lists (3 tabs) ----
HubData.LISTS = {
  people: [
    { name: 'Cardiovascular Commercial Biotech Leaders', desc: 'Senior Commercial Biotech Leaders with Launch Experience & CV experience', created: 'June 10, 2026', createdBy: "Margot O'Brien", updated: 'June 10, 2026', updatedBy: "Margot O'Brien", count: 3 },
    { name: 'Brainlabs Managing Director', desc: '', created: 'June 10, 2026', createdBy: 'Vincent Turk', updated: 'June 11, 2026', updatedBy: 'Raunak Sharma', count: 198 },
    { name: 'CFO Life Science sisterhood', desc: 'female CFOs and senior finance leader in Life Science and HC', created: 'June 10, 2026', createdBy: 'Cristine Amess', updated: 'June 10, 2026', updatedBy: 'Cristine Amess', count: 1 },
    { name: 'thatch (mJ added)', desc: '', created: 'June 05, 2026', createdBy: 'Haley Gordon', updated: 'June 05, 2026', updatedBy: 'Haley Gordon', count: 0 },
    { name: 'Comp Pull', desc: '', created: 'June 04, 2026', createdBy: 'Sarah Carrington', updated: 'June 04, 2026', updatedBy: 'Sarah Carrington', count: 0 },
    { name: 'ANZ Public CFO', desc: '', created: 'June 03, 2026', createdBy: 'Ben Denaro', updated: 'June 03, 2026', updatedBy: 'Ben Denaro', count: 6 },
    { name: 'new rad ai group', desc: '', created: 'June 03, 2026', createdBy: 'Haley Gordon', updated: 'June 03, 2026', updatedBy: 'Haley Gordon', count: 38 },
    { name: 'CROs, Australia - 2026', desc: '', created: 'June 01, 2026', createdBy: 'Ana Forero', updated: 'June 01, 2026', updatedBy: 'Ana Forero', count: 28 },
    { name: 'Anela - CEOs/Chairs to watch', desc: '', created: 'June 01, 2026', createdBy: 'Anela Hasa', updated: 'June 01, 2026', updatedBy: 'Anela Hasa', count: 2 },
  ],
  company: [
    { name: 'Company Lists', created: 'May 27, 2026', createdBy: 'Manoj PM', updated: 'June 01, 2026', updatedBy: 'Manoj PM', count: 18 },
    { name: 'Thrive IQ: Education', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 70 },
    { name: 'Private Equity SaaS: Summit Partners', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 99 },
    { name: 'Thrive IQ: Human Resources', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 181 },
    { name: 'Thrive IQ: B2C M&A', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 216 },
    { name: 'Thrive IQ: Private Equity M&A', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 87 },
    { name: 'Private Equity SaaS: Goldman Sachs', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 29 },
    { name: 'Thrive IQ: Insurance', created: 'February 27, 2025', createdBy: 'Thrive Success-USD', updated: 'February 27, 2025', updatedBy: 'Thrive Success-USD', count: 68 },
    { name: 'FinTech | PE BD', created: 'February 27, 2025', createdBy: 'Tyler Reed', updated: 'February 27, 2025', updatedBy: 'Tyler Reed', count: 0 },
  ],
  project: [
    { name: 'B List', created: 'May 26, 2026', createdBy: 'Brendan Murphy', updated: 'May 26, 2026', updatedBy: 'Brendan Murphy', count: 1 },
    { name: 'Test Performance Project List', created: 'October 09, 2025', createdBy: 'Manoj PM', updated: 'October 09, 2025', updatedBy: 'Manoj PM', count: 88 },
  ],
};
HubData.LIST_COUNTS = { people: 929, company: 187, project: 2 };

// ---- Market Maps ----
HubData.MARKET_MAPS = [
  { name: 'Payer SaaS CROs', desc: 'Healthcare payer SaaS CRO talent', created: 'May 20, 2026', by: 'Amber Graves', companies: 36, people: 100 },
  { name: 'Krishnan backchannel', desc: 'trying to find people at finastra', created: 'Apr 13, 2026', by: 'David Dubow', companies: 1, people: 13 },
  { name: 'LatAm Technical Sales Leaders', desc: 'Latam Technical Sales Leaders', created: 'Mar 19, 2026', by: 'Andrea Toledo Cortes', companies: 1, people: 20 },
  { name: 'google product ecosystem (senior director level and above)', desc: 'i need a list of current product leaders at google - senior director of product, vp of product or vp/gm of product', created: 'Mar 17, 2026', by: 'Mariyam Fatima', companies: 1, people: 157 },
  { name: 'Vincent Test', desc: 'Testing', created: 'Mar 4, 2026', by: 'Vincent Turk', companies: 1, people: 3 },
  { name: 'Dragos VP of Pruduct Marketing', desc: "We're looking for a VP of Product Marketing for Dragos and the candidates will be a Director or Vice President today fro...", created: 'Mar 3, 2026', by: 'Caitlin Iseler', companies: 0, people: 0 },
  { name: 'Tellius V2 Map', desc: 'Only BI companies', created: 'Mar 2, 2026', by: 'David Dubow', companies: 11, people: 107 },
  { name: 'Tellius Map', desc: 'test', created: 'Feb 25, 2026', by: 'David Dubow', companies: 27, people: 279 },
  { name: 'HealthEdge CMO', desc: 'ERP CMOs', created: 'Jan 25, 2026', by: 'David Dubow', companies: 13, people: 52 },
];
HubData.MARKET_MAPS_COUNT = 37;

// ---- Exports ----
HubData.EXPORTS = [
  { report: 'introductions', type: 'CSV', generated: '06/04/26 2:57 PM', downloaded: '06/04/26 2:57 PM' },
  { report: 'CTO at Thrive - candidacy report', type: 'CSV', generated: '05/26/26 2:17 PM', downloaded: null },
];

// ---- Analytics → User Report ----
HubData.USER_REPORT = {
  stats: [
    { value: 62, label: 'Users' },
    { value: 27, label: 'Monthly Active Users' },
    { value: 29, label: 'Inactive Users' },
  ],
  usersByMonth: [
    { x: 'Jan 26', v: 34 }, { x: 'Feb 26', v: 36 }, { x: 'Mar 26', v: 47 },
    { x: 'Apr 26', v: 50 }, { x: 'May 26', v: 55 }, { x: 'Jun 26', v: 62 },
  ],
  mau: [
    { x: 'Jan 26', v: 8 }, { x: 'Feb 26', v: 12 }, { x: 'Mar 26', v: 30 },
    { x: 'Apr 26', v: 26 }, { x: 'May 26', v: 33 }, { x: 'Jun 26', v: 19 },
  ],
  roles: [
    { label: 'Admin', v: 38 }, { label: 'Recruiter', v: 9 }, { label: 'User', v: 4 },
    { label: 'API Viewer', v: 2 }, { label: 'Hiring Manager No Com...', v: 2 },
    { label: 'API Admin', v: 2 }, { label: "Gill's QA Warrior", v: 2 }, { label: 'Other', v: 3 },
  ],
};

// ---- Analytics → Capacity Report (synthetic / randomized — contains no real user data) ----
HubData.CAPACITY_REPORT = (() => {
  const rnd = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const firsts = ['Maya', 'Theo', 'Priya', 'Dev', 'Aria', 'Noah', 'Lena', 'Omar', 'Iris', 'Cole', 'Nina', 'Ravi', 'Jonas', 'Elsa', 'Marco', 'Tess', 'Hugo', 'Sana', 'Liv', 'Quinn', 'Bram', 'Yuki', 'Dario', 'Faye', 'Kian', 'Petra'];
  const lasts = ['Hartwell', 'Okonkwo', 'Bauer', 'Castellano', 'Nyberg', 'Halloran', 'Vance', 'Sorensen', 'Mehta', 'Larkin', 'Dupont', 'Avila', 'Knutsen', 'Bianchi', 'Forsythe', 'Reyes', 'Albright', 'Connolly', 'Mauer', 'Rinaldi', 'Stahl', 'Okafor', 'Vega', 'Lindqvist', 'Salib'];

  // Open Projects by User — synthetic, unique names, randomized counts, sorted desc
  const used = new Set(); const names = [];
  while (names.length < 18) {
    const n = `${pick(firsts)} ${pick(lasts)}`;
    if (!used.has(n)) { used.add(n); names.push(n); }
  }
  const openByUser = names
    .map(label => ({ label, v: Math.round(rnd(3, 42)) }))
    .sort((a, b) => b.v - a.v);

  // Average Open Projects per User by Month — gentle random walk over 12 months
  const months = ['Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26'];
  let cur = rnd(1.4, 2.4);
  const avgByMonth = months.map(x => {
    cur = Math.max(0.6, Math.min(4.2, cur + rnd(-0.55, 0.7)));
    return { x, v: +cur.toFixed(2) };
  });

  // Average Open Projects by Role — randomized, sorted desc
  const roleNames = ['User', 'Talent Specialist', 'Super Admin', 'Hiring Manager', 'Admin', 'Recruiter', 'Coordinator'];
  const byRole = roleNames
    .map(label => ({ label, v: +rnd(0.9, 8).toFixed(2) }))
    .sort((a, b) => b.v - a.v);

  return { openByUser, avgByMonth, byRole };
})();

// ---- Analytics → Introductions (matches the Introductions Report screen) ----
HubData.INTRODUCTIONS = {
  totalIntroductions: 368,
  relatedToSearch: 214,
  byCompany: [
    { label: 'Sequoia Capital', v: 74 },
    { label: 'Andreessen Horowitz', v: 62 },
    { label: 'Y Combinator', v: 52 },
    { label: 'Benchmark', v: 40 },
    { label: 'Accel Partners', v: 37 },
    { label: 'General Catalyst', v: 30 },
    { label: 'Lightspeed Venture', v: 22 },
  ],
  byMonth: [
    { x: 'Jan 24', v: 18 }, { x: 'Feb 24', v: 34 }, { x: 'Mar 24', v: 48 },
    { x: 'Apr 24', v: 62 }, { x: 'May 24', v: 90 }, { x: 'Jun 24', v: 116 },
  ],
};

// ---- Runtime: append a generated report to the Exports table ----
HubData.addExport = (report, type = 'CSV') => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  let h = d.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const stamp = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${String(d.getFullYear()).slice(2)} ${h}:${pad(d.getMinutes())} ${ampm}`;
  HubData.EXPORTS.unshift({ report, type, generated: stamp, downloaded: null });
  return stamp;
};

// ============================================================
// Project workspace — "Chief Product Officer" project + candidates
// ============================================================
HubData.PROJECT = {
  name: 'Chief Product Officer', confidential: true, status: 'Open for 109 days',
  company: 'Thrive', location: 'Haddonfield, NJ, United States',
  team: ['AZ', 'HW', 'MI', 'VT'], teamMore: 37,
  overview: {
    lead: 'Angela Zhou', priority: 'High', openDate: 'Feb 26, 2026',
    targetClose: 'Aug 14, 2026', stageName: 'Open', candidates: 14,
    description: 'Confidential search for a hands-on CTO to lead platform and AI engineering through the next growth phase. Reports directly to the CEO.',
  },
};

// ---- Stage archetypes ----
// Every pipeline stage maps to one of these underlying recruiting workflows. Stage
// NAMES are customer-configurable and cannot be relied on for behavior; the archetype
// is what drives the candidate side-panel context strip and tab ordering.
HubData.STAGE_ARCHETYPES = ['sourcing', 'outreach', 'evaluation', 'close', 'terminal'];

// Structured stage catalog (single source of truth). Names are what everything
// else in the app keys off (kanban columns, byStage grouping, STAGE_COLORS lookups).
// Archetype is opt-in: null → panel falls back to default order with no strip.
HubData.PROJECT_STAGE_DEFS = [
  { name: 'Research',              archetype: 'sourcing'   },
  { name: 'Outreach',              archetype: 'outreach'   },
  { name: 'Recruiter Interview',   archetype: 'evaluation' },
  { name: 'Hiring Team Interview', archetype: 'evaluation' },
  { name: 'Offer',                 archetype: 'close'      },
  { name: 'Hired',                 archetype: 'close'      },
  { name: 'Rejected',              archetype: 'terminal'   },
];
// Backwards-compatible string array — every existing caller reads this.
HubData.PROJECT_STAGES = HubData.PROJECT_STAGE_DEFS.map(s => s.name);

// name → archetype ('sourcing'|'outreach'|'evaluation'|'close'|'terminal'|null)
HubData.stageArchetype = (name) => {
  const s = HubData.PROJECT_STAGE_DEFS.find(x => x.name === name);
  return s ? s.archetype : null;
};

// Default archetype for a custom stage. Rule: pipeline-position → archetype ladder,
// with the neighboring stage's archetype as a fallback when position is ambiguous.
// The last stage in the list is treated as terminal.
HubData.inferArchetypeForCustomStage = ({ position, defs = HubData.PROJECT_STAGE_DEFS }) => {
  const n = defs.length;
  if (n === 0) return 'sourcing';
  // Terminal position (appended to end) → mirror the current last entry.
  if (position >= n) {
    const last = defs[n - 1];
    return last.archetype === 'terminal' ? 'terminal' : (last.archetype || 'close');
  }
  // Same-slot neighbor: prefer the archetype at that index, else look before/after.
  const at = defs[position] && defs[position].archetype;
  if (at) return at;
  const before = position > 0 ? defs[position - 1].archetype : null;
  const after = position < n - 1 ? defs[position + 1].archetype : null;
  return after || before || 'sourcing';
};

// Live setter — mutates PROJECT_STAGE_DEFS + PROJECT_STAGES in place so all
// downstream reads (kanban headers, tab reordering, strip) refresh on next render.
HubData.replaceStageDefs = (defs) => {
  HubData.PROJECT_STAGE_DEFS.length = 0;
  defs.forEach(d => HubData.PROJECT_STAGE_DEFS.push(d));
  HubData.PROJECT_STAGES.length = 0;
  defs.forEach(d => HubData.PROJECT_STAGES.push(d.name));
};

// Fixed Phoenix 6-color stage palette (recruiters read pipelines by color).
HubData.STAGE_COLORS = {
  'Research':               'rgb(205,210,254)',
  'Outreach':              'rgb(136,181,240)',
  'Recruiter Interview':   'rgb(240,230,136)',
  'Hiring Team Interview': 'rgb(240,180,136)',
  'Offer':                 'rgb(182,136,240)',
  'Hired':                 'rgb(144,240,136)',
  'Rejected':              'rgb(240,136,136)',
};

// ---- Project → Strategy tab ----
HubData.STRATEGY = {
  tags: ['Strategic Account', 'Software - SaaS/Cloud', 'Technology', 'HR/Recruiting', 'CRM'],
  targetedCompanies: [
    { name: 'Russell Reynolds', location: 'New York, NY, United States', tag: 'Software - Business Application', revenue: '$170M', size: '501-1000' },
    { name: 'Spencer Stuart', location: 'Chicago, IL, United States', tag: null, revenue: null, size: null },
    { name: 'Heidrick & Struggles', location: 'Chicago, IL, United States', tag: 'Professional Services', revenue: '$1.0B', size: '1001-5000' },
    { name: 'Korn Ferry', location: 'Los Angeles, CA, United States', tag: 'Software - HR', revenue: '$2.9B', size: '5001-10000' },
    { name: 'Egon Zehnder', location: 'Zürich, Switzerland', tag: null, revenue: '$900M', size: '1001-5000' },
  ],
  benchmarkCandidates: [
    { name: 'LPEC Ellen Fairchild', title: 'Vice President and Chief Compliance Officer', company: 'Evergy' },
    { name: 'Kevin CH Chang', title: 'Vice President of Global Sales', company: 'Stealth' },
  ],
  similarProjects: [
    { name: 'Job Title 2 - TEST', company: 'test', location: 'Unknown location', lead: null, status: 'Not started', candidates: 14 },
    { name: 'TEST - AboveBoard Thrive Integration', company: 'AboveBoard', location: 'Unknown location', lead: null, status: 'Not started', candidates: 5 },
  ],
};

const expFor = (title, company) => [{ role: title || 'Role', company: company || '—', primary: true, dates: '—', months: '', area: '—' }];

HubData.CANDIDATES = [
  // ---- Research ----
  { id: 'c1', stage: 'Research', name: 'Priya Nair', title: 'VP, Engineering', company: 'Stripe', city: 'San Francisco', region: 'CA', country: 'United States', flag: false, eye: false, tags: [], up: 0, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('VP, Engineering', 'Stripe') },
  { id: 'c2', stage: 'Research', name: 'Daniel Okafor', title: 'Head of Platform', company: 'Datadog', city: 'New York City', region: 'NY', country: 'United States', flag: false, eye: false, tags: [], up: 0, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Head of Platform', 'Datadog') },
  // ---- Outreach ----
  { id: 'c3', stage: 'Outreach', name: 'Sofia Marchetti', title: 'Director of Product', company: 'Figma', city: 'San Francisco', region: 'CA', country: 'United States', flag: false, eye: false, tags: [{ label: 'NDA', color: 'green' }], up: 1, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Director of Product', 'Figma') },
  { id: 'c4', stage: 'Outreach', name: 'Wei Chen', title: 'Principal Engineer', company: 'Snowflake', city: 'Seattle', region: 'WA', country: 'United States', flag: false, eye: false, dup: true, tags: [], up: 0, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Principal Engineer', 'Snowflake') },
  // ---- Hiring Team Interview ----
  { id: 'c5', stage: 'Hiring Team Interview', name: 'Amaro Luna', title: 'Co-Founder + Chief Product & Technology Officer', company: 'Telegraph', city: 'San Francisco', region: 'CA', country: 'United States', flag: false, eye: true, tags: [], up: 2, down: 1, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Co-Founder + Chief Product & Technology Officer', 'Telegraph') },
  { id: 'c6', stage: 'Hiring Team Interview', name: 'Leah Beirne', title: 'Account Supervisor', company: '360i', city: 'New York City', region: 'NY', country: 'United States', flag: true, eye: false, tags: [], up: 3, down: 1, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Account Supervisor', '360i') },
  { id: 'c7', stage: 'Hiring Team Interview', name: 'Loi Nguyen', title: 'Managing Director - Vietnam', company: 'BeepBeep!', city: '', region: '', country: 'Vietnam', flag: false, eye: false, tags: [], up: 4, down: 1, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Managing Director - Vietnam', 'BeepBeep!') },
  { id: 'c8', stage: 'Hiring Team Interview', name: 'Josh Stiling', title: 'Investor', company: 'Anzu Partners', city: '', region: '', country: '', flag: false, eye: false, tags: [], up: 4, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Investor', 'Anzu Partners') },
  // ---- Offer ----
  { id: 'c9', stage: 'Offer', name: 'Matt Long', title: 'Chief Financial Officer', company: 'Zenitech', city: 'London', region: '', country: 'United Kingdom', flag: false, eye: true, tags: [], up: 2, down: 0, owner: 'AZ', note: { text: 'Verbal offer extended, awaiting response.', age: '2 days ago' }, startDate: 'Jul 01, 2026', comp: '£280,000 base', scorecards: { count: 2, avg: 4.5, lastBy: 'Angela Zhou', lastAge: '1 week ago', outstanding: 0 }, experience: expFor('Chief Financial Officer', 'Zenitech') },
  // ---- Recruiter Interview (Hired kept empty by default) ----
  {
    id: 'c10', stage: 'Recruiter Interview', name: 'Benedikt Oehmen', title: 'CTO', company: 'Thrive', city: 'Versailles', region: '', country: 'France',
    flag: true, eye: true, offLimits: 'Employee Off Limits', inProject: true,
    tags: [{ label: 'mayorca', color: 'orange' }, { label: 'NDA', color: 'green' }, { label: 'Peasant', color: 'blue' }, { label: 'Queen', color: 'teal' }, { label: 'sween', color: 'gray' }],
    up: 1, down: 0, owner: 'AZ',
    note: { text: 'hmmm >?...', age: '10 days ago' }, startDate: 'Apr 27, 2026', comp: null,
    scorecards: { count: 1, avg: 3.0, lastBy: 'Angela Renee', lastAge: '3 months ago', outstanding: 0 },
    experience: [
      { role: 'CTO', company: 'Thrive', primary: true, dates: 'Apr 2026 - Present', months: '3 months', area: '—' },
      {
        group: 'Activision Blizzard', total: '20 years 11 months', roles: [
          { role: 'Team Manager, Localization', dates: 'Sep 2019 - Present', months: '6 years 10 months', desc: 'Creation and execution of personal leadership workshops, promoting autonomy, mastery and purpose especially during global pandemic. Individual coaching to further support team members during global pandemic. Chair multicultural network.', area: '—' },
          { role: 'Team Manager, Community Development', dates: 'Feb 2016 - Sep 2019', months: '3 years 8 months', desc: 'Additional responsibilities in the area of Operations management, not only working with the regional Community Managers, but also facilitating Hearthstone and Diablo operational needs and activities. Change management and transitioning a team.', area: '—' },
          { role: 'Assistant Manager, Community Development', dates: 'Jan 2012 - Feb 2016', months: '4 years 2 months', desc: 'Managing and leading a team of seven regional Community Managers for the European English-, German-, French-, Russian-, Spanish-, Polish-, and Italian-speaking territories for World of Warcraft and Hearthstone franchises. Supporting.', area: '—' },
          { role: 'Senior Community Manager', dates: 'Jul 2008 - Dec 2011', months: '3 years 6 months', desc: '', area: '—' },
          { role: 'Community Manager', dates: 'Apr 2006 - Jun 2008', months: '2 years 3 months', desc: '', area: '—' },
        ],
      },
    ],
  },
  { id: 'c11', stage: 'Recruiter Interview', name: 'Rich Moore', title: 'CTO', company: 'Thrive', city: 'Burlingame', region: 'CA', country: 'United States', flag: true, eye: true, tags: [{ label: 'NDA', color: 'green' }, { label: 'Peasant', color: 'blue' }], up: 3, down: 0, owner: 'AZ', note: { text: 'test', age: 'a month ago' }, startDate: 'Apr 29, 2026', comp: null, scorecards: { count: 2, avg: 3.2, lastBy: 'Angela Zhou', lastAge: '3 months ago', outstanding: 0 }, experience: expFor('CTO', 'Thrive') },
  { id: 'c12', stage: 'Recruiter Interview', name: 'Catherine Cho', title: 'Sr. PRODUCT MANAGER', company: 'MobiTV', city: 'Sacramento', region: 'CA', country: 'United States', flag: false, eye: true, biz: true, tags: [], up: 2, down: 1, owner: 'AZ', note: { text: 'test internal note', age: '3 months ago' }, startDate: '', comp: null, scorecards: { count: 2, avg: 5.0, lastBy: 'Gill Hughes', lastAge: '2 months ago', outstanding: 0 }, experience: expFor('Sr. Product Manager', 'MobiTV') },
  // ---- Rejected ----
  { id: 'c13', stage: 'Rejected', name: 'Amanda Smith', title: 'Board Certified Behavior Analyst', company: 'Invo Healthcare', city: 'Redding', region: 'CA', country: 'United States', flag: true, eye: false, tags: [], up: 0, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Board Certified Behavior Analyst', 'Invo Healthcare') },
  { id: 'c14', stage: 'Rejected', name: 'Matt Pennino', title: 'Vice President', company: 'Neuberger Berman', city: 'Stamford', region: 'CT', country: 'United States', flag: false, eye: false, biz: true, tags: [], up: 1, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('Vice President', 'Neuberger Berman') },
  { id: 'c15', stage: 'Rejected', name: 'Lisa Dockins', title: 'SVP, Corporate Controller', company: 'SmartBear', city: 'Boston', region: 'MA', country: 'United States', flag: true, eye: false, tags: [], up: 1, down: 0, owner: 'AZ', note: null, startDate: '', scorecards: null, experience: expFor('SVP, Corporate Controller', 'SmartBear') },
];

// ---- Candidate activity signal (lead line + cadence + time in stage) ----
// Derived deterministically per id, blended with real fields (note, scorecards,
// comp, startDate). A candidate may carry an explicit `signal` to override.
HubData.INTERVIEWERS = ['Sarah Burke', 'Marcus Reed', 'Elena Volkov', 'Tom Whitfield', 'Priya Shah', 'Dana Cole', 'Raj Patel'];
HubData.candidateSignal = (c) => {
  if (c.signal) return c.signal;
  let h = 0; const id = String(c.id || c.name || '?');
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const at = (arr) => arr[h % arr.length];
  const n = (base) => (h % base) + 1;
  const dl = (x) => `${x} day${x === 1 ? '' : 's'}`;
  const who = at(HubData.INTERVIEWERS);
  const timeInStage = dl(n(9) + 1);
  const soon = h % 2 === 0;
  const sc = c.scorecards;
  const scCad = sc ? `${sc.count} scorecard${sc.count !== 1 ? 's' : ''} · ${sc.avg.toFixed(1)} avg` : 'No scorecards yet';
  switch (c.stage) {
    case 'Research':
      return { timeInStage, lead: { icon: 'user', tone: 'last', text: `Added to research ${dl(n(4))} ago` }, cadence: ['Not yet contacted'] };
    case 'Outreach': {
      const sent = n(3) + 2;
      return soon
        ? { timeInStage, lead: { icon: 'message', tone: 'next', text: `Follow-up outreach due in ${dl(n(3))}` }, cadence: [`${sent} outreaches · last ${dl(n(3))} ago`, 'No reply yet'] }
        : { timeInStage, lead: { icon: 'message', tone: 'last', text: `Last outreach ${dl(n(3))} ago` }, cadence: [`${sent} outreaches sent`, 'Awaiting reply'] };
    }
    case 'Recruiter Interview':
    case 'Hiring Team Interview': {
      const kind = c.stage === 'Recruiter Interview' ? 'Recruiter interview' : 'Interview';
      const cad = [scCad];
      if (sc && sc.outstanding) cad.push(`${sc.outstanding} outstanding`);
      return soon
        ? { timeInStage, lead: { icon: 'video', tone: 'next', text: `${kind} with ${who} in ${dl(n(4))}` }, cadence: cad }
        : { timeInStage, lead: { icon: 'video', tone: 'last', text: `${kind} ${dl(n(6))} ago · awaiting scorecard` }, cadence: cad };
    }
    case 'Offer': {
      const cad = [];
      if (c.comp) cad.push(c.comp);
      if (c.startDate) cad.push(`Start ${c.startDate}`);
      if (!cad.length) cad.push('Terms in negotiation');
      return { timeInStage, lead: { icon: 'offer', tone: 'next', text: c.note ? c.note.text : `Offer extended ${dl(n(3))} ago` }, cadence: cad };
    }
    case 'Hired':
      return { timeInStage, lead: { icon: 'offer', tone: 'next', text: c.startDate ? `Starts ${c.startDate}` : 'Hired · onboarding' }, cadence: c.comp ? [c.comp] : [] };
    case 'Rejected':
      return { timeInStage, lead: { icon: 'clock', tone: 'last', text: `Rejected ${dl(n(8))} ago` }, cadence: c.note ? [c.note.text] : [] };
    default:
      return { timeInStage, lead: { icon: 'clock', tone: 'last', text: `Updated ${dl(n(6))} ago` }, cadence: [] };
  }
};

// ---- Randomized candidate tags (0–5 per candidate, seeded per id) ----
HubData.TAG_POOL = [
  { label: '10/10 Gender', color: 'indigo' },
  { label: '10/10 Race', color: 'orange' },
  { label: '4+ Outreaches', color: 'fuchsia' },
  { label: 'Active', color: 'green' },
  { label: 'Assessment Completed', color: 'green' },
  { label: 'Benchmark Profile', color: 'cyan' },
  { label: 'Board/Advisory Candidate', color: 'cyan' },
  { label: 'Bullseye', color: 'purple' },
  { label: 'Calibration Profile', color: 'gray' },
  { label: 'Candidate Sensitivity', color: 'purple' },
  { label: 'Capacity/Schedule Conflict', color: 'indigo' },
  { label: 'Carve-Out Candidate', color: 'red' },
  { label: 'Central Time Zone', color: 'yellow' },
  { label: 'Check Off Limits', color: 'indigo' },
  { label: 'Client Approved', color: 'cyan' },
  { label: 'Client Directly Engaging', color: 'pink' },
  { label: 'Client Flagged', color: 'yellow' },
  { label: 'Client Introduction', color: 'purple' },
  { label: 'Client Previously Met and Rejected', color: 'blue' },
  { label: 'Consultant Agreement Signed', color: 'teal' },
  { label: 'DO NOT CONTACT', color: 'red' },
  { label: 'East Coast', color: 'orange' },
  { label: 'High Priority Candidate', color: 'blue' },
  { label: 'Hold OR', color: 'lime' },
  { label: 'Internal Candidate', color: 'teal' },
  { label: 'Internal Referral', color: 'fuchsia' },
  { label: 'Investor Overlap', color: 'indigo' },
  { label: 'Junior', color: 'teal' },
  { label: 'Location Flag', color: 'orange' },
];

(() => {
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  HubData.CANDIDATES.forEach((c) => {
    const r = rng(hash('tags:' + c.id));
    const n = Math.floor(r() * 6); // 0–5
    const pool = HubData.TAG_POOL.slice();
    const picked = [];
    for (let i = 0; i < n && pool.length; i++) picked.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    c.tags = picked;
  });
})();

// ============================================================
// Source candidates — recommended + extract-from-past-projects (synthetic)
// ============================================================
HubData.SOURCING = (() => {
  const exp = (title, company) => [{ role: title, company, primary: true, dates: '—', months: '', area: '—' }];
  // deterministic per-id enrichment for prior roles + match reasons
  const PRIOR_TITLES = ['Director of Engineering', 'Senior Engineering Manager', 'Head of Platform', 'Principal Engineer', 'VP, Engineering', 'Director, Infrastructure', 'Engineering Manager', 'Director, Strategic Sales', 'Senior Account Executive', 'Regional VP, Sales'];
  const PRIOR_COS = ['Tableau', 'Salesforce', 'Sumo Logic', 'Informatica', 'Akamai', 'Atlassian', 'Twilio', 'Segment', 'MongoDB', 'Elastic', 'HashiCorp', 'GitLab', 'Cloudflare', 'Splunk'];
  const PRIOR_DATES = ['Feb 2017 – May 2020', 'Jan 2014 – Jan 2017'];
  const REACHED_MATCH = { Sourced: 62, Screening: 70, 'Hiring Team Interview': 80, Offer: 88, Hired: 93, Rejected: 58 };
  const sHash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const sRng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const mk = (id, name, title, company, city, region, country, extra = {}) => {
    const base = {
      id, name, title, company, city, region, country,
      tags: [], eye: false, flag: false, up: 0, down: 0, owner: 'AZ',
      stage: 'Sourced', startDate: '', comp: null, scorecards: null, note: null,
      experience: exp(title, company), ...extra,
    };
    const rr = sRng(sHash(id));
    const rpick = (a) => a[Math.floor(rr() * a.length)];
    if (base.match == null) base.match = base.reached ? (REACHED_MATCH[base.reached] || 70) : 75;
    const roll = rr();
    const nPR = roll < 0.15 ? 0 : roll < 0.55 ? 2 : 1;
    const prs = [];
    for (let i = 0; i < nPR; i++) prs.push({ title: rpick(PRIOR_TITLES), company: rpick(PRIOR_COS), dates: PRIOR_DATES[i] || PRIOR_DATES[1] });
    base.priorRoles = prs;
    const strong = base.match >= 80;
    base.matchReasons = [strong ? 'Strong scorecard alignment' : 'Partial scorecard alignment', 'Stage and motion fit', 'Available; no conflicts flagged'];
    return base;
  };

  const recommended = [
    mk('rec1', 'Daniela Marsh', 'VP of Engineering', 'Plaid', 'Oakland', 'CA', 'United States', { match: 96, reason: 'Platform scaling + fintech leadership' }),
    mk('rec2', 'Marcus Bell', 'Head of Platform Engineering', 'Affirm', 'San Francisco', 'CA', 'United States', { match: 93, reason: 'Led 0→1 payments platform' }),
    mk('rec3', 'Priya Raman', 'Director of Engineering', 'Square', 'San Jose', 'CA', 'United States', { match: 91, reason: 'Scaled engineering org 40→180' }),
    mk('rec4', 'Tomas Eriksson', 'VP Engineering', 'Klarna', 'Stockholm', '', 'Sweden', { match: 89, reason: 'Global fintech & retail commerce' }),
    mk('rec5', 'Aisha Bello', 'Senior Director, Engineering', 'Shopify', 'Toronto', '', 'Canada', { match: 88, reason: 'Retail omnichannel platform' }),
    mk('rec6', 'Daniel Cho', 'Head of Engineering', 'Chime', 'San Francisco', 'CA', 'United States', { match: 86, reason: 'Consumer fintech growth' }),
    mk('rec7', 'Lena Vogt', 'VP Engineering', 'Wise', 'London', '', 'United Kingdom', { match: 84, reason: 'Cross-border payments at scale' }),
    mk('rec8', 'Rahul Mehta', 'Director of Engineering', 'Stripe', 'Seattle', 'WA', 'United States', { match: 82, reason: 'Infrastructure & reliability' }),
  ];

  const pastProjects = [
    {
      id: 'pp1', name: 'Director of Engineering — Retail', company: 'Target', closed: 'Closed Nov 2025', similarity: 'High',
      candidates: [
        mk('pp1c1', 'Jordan Pruitt', 'Director of Engineering', 'Walmart Global Tech', 'Bentonville', 'AR', 'United States', { reached: 'Offer' }),
        mk('pp1c2', 'Sofia Almeida', 'Engineering Director', 'Wayfair', 'Boston', 'MA', 'United States', { reached: 'Hiring Team Interview' }),
        mk('pp1c3', 'Kevin Tran', 'Head of Platform', 'Instacart', 'San Francisco', 'CA', 'United States', { reached: 'Screening' }),
        mk('pp1c4', 'Megan Doyle', 'VP Engineering', 'Etsy', 'Brooklyn', 'NY', 'United States', { reached: 'Hired' }),
        mk('pp1c5', 'Andre Costa', 'Director of Engineering', 'Chewy', 'Dania Beach', 'FL', 'United States', { reached: 'Sourced' }),
      ],
    },
    {
      id: 'pp2', name: 'VP Engineering — Marketplace', company: 'eBay', closed: 'Closed Aug 2025', similarity: 'Medium',
      candidates: [
        mk('pp2c1', 'Hannah Weiss', 'VP Engineering', 'DoorDash', 'San Francisco', 'CA', 'United States', { reached: 'Offer' }),
        mk('pp2c2', 'Omar Haddad', 'Senior Director, Engineering', 'Uber', 'Amsterdam', '', 'Netherlands', { reached: 'Screening' }),
        mk('pp2c3', 'Grace Lin', 'Director of Engineering', 'Lyft', 'San Francisco', 'CA', 'United States', { reached: 'Hiring Team Interview' }),
        mk('pp2c4', 'Felix Braun', 'Head of Engineering', 'Delivery Hero', 'Berlin', '', 'Germany', { reached: 'Rejected' }),
      ],
    },
    {
      id: 'pp3', name: 'Head of Engineering — Commerce', company: 'Wayfair', closed: 'Closed Mar 2026', similarity: 'Medium',
      candidates: [
        mk('pp3c1', 'Natalie Park', 'Head of Engineering', 'Faire', 'San Francisco', 'CA', 'United States', { reached: 'Hiring Team Interview' }),
        mk('pp3c2', 'Victor Salas', 'Director of Engineering', 'Mercado Libre', 'Buenos Aires', '', 'Argentina', { reached: 'Offer' }),
        mk('pp3c3', 'Ingrid Holm', 'VP Engineering', 'Zalando', 'Berlin', '', 'Germany', { reached: 'Sourced' }),
        mk('pp3c4', 'Sam Whitfield', 'Director, Platform', 'Best Buy', 'Minneapolis', 'MN', 'United States', { reached: 'Screening' }),
      ],
    },
  ];

  // Additional past searches that can be found via "search and add more projects"
  const morePastProjects = [
    {
      id: 'pp4', name: 'Chief Technology Officer — Fintech', company: 'Stripe', closed: 'Closed Jun 2025', similarity: 'High',
      candidates: [
        mk('pp4c1', 'Daniel Okonkwo', 'SVP Engineering', 'Block', 'Oakland', 'CA', 'United States', { reached: 'Offer' }),
        mk('pp4c2', 'Ruth Castellano', 'VP Platform', 'Plaid', 'San Francisco', 'CA', 'United States', { reached: 'Hiring Team Interview' }),
        mk('pp4c3', 'Tobias Lindqvist', 'Head of Infrastructure', 'Klarna', 'Stockholm', '', 'Sweden', { reached: 'Screening' }),
        mk('pp4c4', 'Maya Forsythe', 'Director of Engineering', 'Brex', 'New York City', 'NY', 'United States', { reached: 'Hired' }),
      ],
    },
    {
      id: 'pp5', name: 'VP Product — Marketplace', company: 'Faire', closed: 'Closed Feb 2026', similarity: 'Medium',
      candidates: [
        mk('pp5c1', 'Priya Anand', 'VP Product', 'Shopify', 'Toronto', '', 'Canada', { reached: 'Offer' }),
        mk('pp5c2', 'Lucas Moreau', 'Director of Product', 'BackMarket', 'Paris', '', 'France', { reached: 'Screening' }),
        mk('pp5c3', 'Hana Suzuki', 'Group PM', 'Mercari', 'Tokyo', '', 'Japan', { reached: 'Sourced' }),
      ],
    },
    {
      id: 'pp6', name: 'Head of Data — Logistics', company: 'Flexport', closed: 'Closed Oct 2025', similarity: 'Medium',
      candidates: [
        mk('pp6c1', 'Elena Vargas', 'Head of Data Science', 'Convoy', 'Seattle', 'WA', 'United States', { reached: 'Hiring Team Interview' }),
        mk('pp6c2', 'Mark Boateng', 'Director, Data Platform', 'Samsara', 'San Francisco', 'CA', 'United States', { reached: 'Screening' }),
        mk('pp6c3', 'Yuki Tanaka', 'VP Analytics', 'Project44', 'Chicago', 'IL', 'United States', { reached: 'Sourced' }),
      ],
    },
    {
      id: 'pp7', name: 'Chief Revenue Officer — SaaS', company: 'Notion', closed: 'Closed Dec 2025', similarity: 'Low',
      candidates: [
        mk('pp7c1', 'Grace Whitfield', 'CRO', 'Airtable', 'San Francisco', 'CA', 'United States', { reached: 'Offer' }),
        mk('pp7c2', 'Dario Bianchi', 'SVP Sales', 'Miro', 'Amsterdam', '', 'Netherlands', { reached: 'Screening' }),
        mk('pp7c3', 'Aisha Rahman', 'VP Revenue', 'Loom', 'Austin', 'TX', 'United States', { reached: 'Hiring Team Interview' }),
      ],
    },
  ];

  // Enrich past candidates with filterable criteria: companies worked at
  // (current + a prior one), a rejection reason where applicable, and a
  // normalized pipeline stage for "minimum stage reached".
  const REJECTION_REASONS = ['Pass', 'Scope', 'Timing', 'Unresponsive', 'Compensation'];
  const PRIOR_COMPANIES = ['Cisco', 'Oracle', 'SAP', 'Salesforce', 'Microsoft', 'Adobe', 'Workday', 'ServiceNow', 'Atlassian', 'Twilio'];
  let _k = 0;
  [...pastProjects, ...morePastProjects].forEach(pp => pp.candidates.forEach(c => {
    if (c.reached === 'Rejected') c.reached = 'Screening';
    c.companies = [c.company, PRIOR_COMPANIES[_k % PRIOR_COMPANIES.length]];
    c.rejectionReason = c.reached === 'Hired' ? null : REJECTION_REASONS[_k % REJECTION_REASONS.length];
    _k++;
  }));

  return { recommended, pastProjects, morePastProjects };
})();

// Candidate panel tab set & Project details tab set
HubData.CANDIDATE_TABS = ['Overview', 'Experience', 'Off Limits', 'Projects', 'Notes', 'Outreaches', 'Scorecards', 'Events', 'Activities', 'Compensation', 'Documents', 'Network'];
HubData.PROJECT_TABS = ['Overview', 'Strategy', 'Notes', 'Outreaches', 'Events', 'Offers', 'Activities', 'Analytics', 'Contract', 'Documents', 'Off Limits', 'Tasks', 'Team'];

// ---- Form option sets (outreach / event / note / scorecard add forms) ----
HubData.OUTREACH_METHODS = ['Email', 'Phone Call', 'LinkedIn', 'Text Message', 'Video Call', 'In Person'];
HubData.EVENT_TYPES = ['Phone Screen', 'Recruiter Interview', 'Hiring Team Interview', 'Final Interview', 'Reference Call', 'Debrief', 'Offer Discussion'];
HubData.MEETING_METHODS = ['Video Call', 'Phone Call', 'In Person'];
HubData.EVENT_STATUSES = ['Scheduling in Progress', 'Scheduled', 'Completed', 'Canceled'];
HubData.EVENT_METHODS = ['Video Conference', 'Phone Call', 'In Person'];
HubData.VIDEO_PLATFORMS = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Webex'];
HubData.PROJECT_OPTIONS = ['Chief Product Officer', 'VP, Engineering, NextGen', 'Head of AI', 'Chief Technology Officer', 'Chief Financial Officer'];
HubData.NOTE_RELATION_TYPES = ['Person', 'Project', 'Company'];
HubData.SCORECARD_ROLES = ['Hiring Manager', 'Search Partner', 'Recruiter', 'Analyst', 'Principal', 'Advisor'];
HubData.SCORECARD_CRITERIA = ['Technical Ability', 'Leadership', 'Cultural Fit/Chemistry', 'Domain Expertise', 'Communication'];

// ============================================================
// Person enrichment — deterministic synthetic detail (experience, skills,
// notes, associated projects/lists) so every person/candidate panel is
// populated and stable across prev/next. Keyed + cached by name.
// ============================================================
(function () {
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const SKILLS = ['Leadership', 'Go-to-Market Strategy', 'Team Building', 'P&L Management', 'Enterprise Sales', 'SaaS', 'Negotiation', 'Product Strategy', 'Channel Partnerships', 'Revenue Growth', 'Operations', 'Stakeholder Management', 'Forecasting', 'Solution Selling', 'Telecommunications', 'Unified Communications'];
  const NOTE_TYPES = [
    { label: 'Rejected by Recruiter: Pass', body: 'Unlikely to be relevant in comparison to other candidates.' },
    { label: 'Initial screen complete', body: 'Strong background and open to a conversation. Flagging for the hiring team to review.' },
    { label: 'Left voicemail', body: 'Reached out via phone and LinkedIn. Awaiting a response before next steps.' },
    { label: 'Not pursuing — compensation', body: 'Current compensation expectations are outside the approved range for this search.' },
  ];
  const AUTHORS = ['Andrew Banks', 'Keat Teoh', 'Angela Zhou', 'Matt Dempsey', 'True Team'];
  const MONTHS = ['Jan', 'Mar', 'Apr', 'Jun', 'Jul', 'Sep', 'Oct', 'Nov'];
  const PROJ_TITLES = ['VP Commercial Operations EMEA', 'Vice President, Sales', 'Chief Revenue Officer', 'Executive Vice President, Sales', 'VP, Global Sales Development', 'Vice President, Sales Americas', 'Head of Revenue'];
  const PROJ_COMPANIES = ['RingCentral', 'Yoobic', 'nTopology', 'Clause', 'Better', 'Procore', 'Causal'];
  const PROJ_LOCS = [['New York', 'NY', 'United States'], ['London', '', 'United Kingdom'], ['San Mateo', 'CA', 'United States'], ['Carpinteria', 'CA', 'United States']];
  const OUTCOMES = [{ stage: 'Identified', sub: '' }, { stage: 'Rejected', sub: 'Pass' }, { stage: 'Rejected', sub: 'Scope' }, { stage: 'Rejected', sub: 'Timing' }, { stage: 'Pursuing', sub: '' }];
  const LIST_NAMES = ['VP Inside Sales w/ SaaS', 'Top CROs 2025', 'EMEA Sales Leaders', 'Series B GTM Bench'];
  const CRITERIA_SETS = [
    ['Technical Ability', 'Early Stage Venture', 'Cultural Fit/Chemistry', 'Sales', 'Domain Expertise'],
    ['Board Experience', 'Cultural Fit', 'Tech/Digital', 'Growth/International', 'FTSE/RemCo'],
    ['Enterprise Sales', 'Infrastructure Software', 'Sales Excellence', 'Team Building & Management', 'Leadership'],
  ];
  const ASSESSORS = [
    { name: 'Margaret Ellison', role: 'Hiring Manager', firm: 'Client Hiring Team' },
    { name: 'Theodore Marchetti', role: 'Hiring Manager', firm: 'Client Hiring Team' },
    { name: 'Beatrice Sutcliffe', role: 'Hiring Manager', firm: 'Client Hiring Team' },
    { name: 'Rupert Hollingsworth', role: 'Search Partner', firm: 'True Team' },
    { name: 'Cordelia Ashby', role: 'Recruiter', firm: 'True Team' },
    { name: 'Desmond Fairweather', role: 'Recruiter', firm: 'True Team' },
    { name: 'Winifred Abernathy', role: 'Analyst', firm: 'True Team' },
    { name: 'Sylvester Pennington', role: 'Principal', firm: 'True Team' },
    { name: 'Ottoline Prewitt', role: 'Advisor', firm: 'True Team' },
  ];
  const SCORECARD_TEMPLATES = ['Executive Leadership', 'Go-to-Market', 'Technical Assessment', 'Culture & Values'];
  const SCORECARD_NOTES = [
    'Good mix of technical and sales backgrounds — will understand our identity. Still hungry and willing to learn. Low profile, the kind of behavior that fits with our engineering team.\n\nStrengths: genuinely curious about the product and asked sharper technical questions than most candidates at this level. References describe him as the person who quietly makes the team better.\n\nConcern: close to no sales-executive experience and inherited an already-experienced team, so we have not yet seen him build from zero. I would want to pressure-test how he thinks about hiring his first five reps before we commit.',
    'Very smart, technical sales leader with transactional & mid-market/enterprise experience and relevant domain knowledge. Strong cultural fit — no-ego and willing to take things on. Positive back-channel from a former boss.\n\nWhere he shines is the second-meeting depth: he walked me through a deal he lost and was refreshingly honest about his own mistakes rather than blaming the team or the product.\n\nOpen question: is he at the low end of the scale we want for this role? The comp expectations suggest he sees himself a level above where his track record currently sits.',
    'A stretch for the level, but exceeded expectations. If you love him, take the risk.\n\nVPS experience is limited but real — he has carried a number and built a small team, just not at our scale. What he lacks in reps he makes up for in slope; every reference used some version of "he is the fastest learner I have worked with."\n\nRecommend two AE references plus 1–2 customer references before moving forward. I would specifically dig into how he handled his first board-level forecast miss.',
    'Strong infrastructure-software and enterprise-sales pedigree. Built and scaled multiple teams through acquisition. Loves customer conversations and is ready to move.\n\nThe operating rigor is the standout — he came in with a clear point of view on our pipeline coverage ratio and where our current motion is likely leaking. That level of preparation is rare.\n\nWatch for fit with an earlier-stage, faster-moving environment. His last three roles were all post-Series C, and a few of his instincts (process, headcount, tooling) may be heavier than what we need for the next 18 months.',
    '- True recommends the candidate for the VP Sales role.\n- While he lacks direct domain experience in eCommerce infrastructure technology, he does have deep experience selling SaaS solutions to SMB, Mid Market and Enterprise customers. He will require some additional ramp to come up to speed in the space, but he has repeatedly shown the ability to enter new companies and learn new technologies quickly.\n- Strong track record of building teams and growing revenue. In his most recent role he was instrumental in redeveloping the go-to-market model and growing both new business and existing-customer revenue. Earlier in his career he led Eastern-region sales for a company that grew from roughly $10M to $60M and was acquired.\n- Has led teams with varying go-to-market models — direct, indirect, and a mix of inside and field sales — servicing SMB through enterprise customers.\n- Knows how to sell complex solutions at our price point, typically deals ranging from $10K to $100K+, and has closed very large enterprise deals as well.\n\nQuestions / concerns: he has had a couple of short stops that we will want to reference further. That said, we have received very strong references from his most recent two roles.\n\nTiming: he left his last company due to corporate restructuring and is now actively pursuing his next opportunity. Based in northern NJ and able to be in the NYC office most of the time.',
    'Overall a very strong candidate with the profile we set out to find, though not without a few areas to probe in references.\n\n- Deep functional expertise: ran a $180M P&L and rebuilt the entire forecasting cadence in his first two quarters. The board credited him with restoring predictability to the number.\n- Excellent people leader. Every backchannel independently used the word "magnet" — engineers and sellers alike follow him between companies, which tells you something about how he operates day to day.\n- Commercially sharp. He reframed our pricing question in the interview and, unprompted, sketched a packaging change that our own team has been debating for months.\n\nReservations: his last two environments were both large and well-resourced. We should reference specifically for how he behaves when the tooling, budget, and headcount are not already in place — because that is the environment he is walking into here.\n\nRecommendation: advance to the final panel and line up two peer references plus one direct report from his most recent role.',
  ];
  const cache = {};

  HubData.enrichPerson = (p) => {
    const key = p.name || 'unknown';
    if (cache[key]) return cache[key];
    const r = rng(hash(key));
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const date = () => `${pick(MONTHS)} ${1 + Math.floor(r() * 27)}, ${2016 + Math.floor(r() * 9)}`;

    const experience = (p.experience && p.experience.length) ? p.experience : [
      { role: p.title || 'Senior Leader', company: p.company || 'Confidential', primary: true, dates: 'Jan 2019 - Present', months: `${3 + Math.floor(r() * 6)} years`, area: '—', desc: `${p.title || 'Senior leader'} at ${p.company || 'a confidential company'}.` },
      { role: pick(['Director', 'Vice President', 'Head of Sales', 'General Manager']), company: pick(PROJ_COMPANIES), primary: false, dates: 'Jun 2014 - Dec 2018', months: '4 years 6 months', area: '—', desc: '' },
    ];

    const skills = []; const want = 5 + Math.floor(r() * 5);
    while (skills.length < want) { const s = pick(SKILLS); if (!skills.includes(s)) skills.push(s); }

    const notes = []; const nN = Math.floor(r() * 3);
    for (let i = 0; i < nN; i++) { const t = pick(NOTE_TYPES); notes.push({ title: t.label, body: t.body, author: pick(AUTHORS), date: date(), project: pick(PROJ_TITLES) }); }

    const projects = []; const nP = 1 + Math.floor(r() * 4);
    for (let i = 0; i < nP; i++) { const loc = pick(PROJ_LOCS); const o = pick(OUTCOMES); projects.push({ title: pick(PROJ_TITLES), company: pick(PROJ_COMPANIES), city: loc[0], region: loc[1], country: loc[2], status: r() < 0.7 ? 'Canceled' : 'Open', stage: o.stage, stageSub: o.sub }); }

    const lists = []; const nL = Math.floor(r() * 2);
    for (let i = 0; i < nL; i++) lists.push({ name: pick(LIST_NAMES), people: 10 + Math.floor(r() * 60), created: date(), updated: date(), by: pick(AUTHORS) });

    const scorecards = []; const nS = 4 + Math.floor(r() * 3); // 4–6
    const usedAssessors = [];
    for (let i = 0; i < nS; i++) {
      let a; let guard = 0;
      do { a = pick(ASSESSORS); guard++; } while ((usedAssessors.includes(a.name) || a.name === p.name) && guard < 24);
      usedAssessors.push(a.name);
      const crit = pick(CRITERIA_SETS).map(label => ({ label, stars: 1 + Math.floor(r() * 5) }));
      const avg = crit.reduce((s, c) => s + c.stars, 0) / crit.length;
      const created = date();
      const edited = r() < 0.5 ? created : date();
      scorecards.push({
        role: p.title || pick(PROJ_TITLES), company: p.company || pick(PROJ_COMPANIES),
        assessorRole: a.role, assessor: a.name, firm: a.firm, date: created, editedDate: edited,
        template: pick(SCORECARD_TEMPLATES),
        notes: pick(SCORECARD_NOTES), criteria: crit, avg: Math.round(avg * 10) / 10,
        visibility: a.role === 'Hiring Manager' ? 'all' : (r() < 0.45 ? 'internal' : 'all'),
        draft: i === 0 && r() < 0.4,
      });
    }

    // ---- Outreaches & Events ----
    const OUTREACH_SUBJECTS = ['Intro — Chief Product Officer search', 'Following up on our conversation', 'Exploring a confidential opportunity', 'Re: scheduling an intro call', 'Quick question about your background'];
    const OUTREACH_NOTES = ['Left a voicemail and followed up over email. Awaiting a response.', 'Sent a LinkedIn note referencing mutual connection. Opened, no reply yet.', 'Had a great 20-minute intro call. Genuinely interested — sending the brief.', 'Reconnected after a few weeks. Timing may be better now.'];
    const EVENT_SUBJECTS = ['Initial recruiter screen', 'Hiring team panel — product deep dive', 'Final round with CEO', 'Reference conversation', 'Offer & comp discussion'];
    const ATTENDEES_POOL = ['Angela Zhou', 'Keat Teoh', 'Andrew Banks', 'Matt Dempsey', 'Joe Molinelli'];
    const LOCATIONS = ['Zoom — link sent in invite', 'Google Meet', 'Thrive HQ — Conf Room A', 'Phone', 'Candidate to share dial-in'];
    const TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

    const outreaches = []; const nO = Math.floor(r() * 4); // 0–3
    for (let i = 0; i < nO; i++) {
      outreaches.push({
        to: p.name || 'Candidate', method: pick(HubData.OUTREACH_METHODS), subject: pick(OUTREACH_SUBJECTS),
        project: 'Chief Product Officer', date: date(), time: pick(TIMES), notes: pick(OUTREACH_NOTES), author: pick(AUTHORS),
      });
    }
    const events = []; const nE = Math.floor(r() * 3); // 0–2
    for (let i = 0; i < nE; i++) {
      const method = pick(HubData.MEETING_METHODS);
      const att = []; const na = 2 + Math.floor(r() * 2);
      while (att.length < na) { const a = pick(ATTENDEES_POOL); if (!att.includes(a)) att.push(a); }
      events.push({
        type: pick(HubData.EVENT_TYPES), method, subject: pick(EVENT_SUBJECTS), attendees: att.join(', '),
        location: method === 'In Person' ? 'Thrive HQ — Conf Room A' : pick(LOCATIONS),
        project: 'Chief Product Officer', date: date(), time: pick(TIMES), notes: pick(OUTREACH_NOTES), author: pick(AUTHORS),
      });
    }
    const OL_TYPES = ['Placed Candidate', 'Employee Off Limits', 'Current Client'];
    const OL_COMPANIES = ['Crunchr', 'General Catalyst Partners', 'Juxtapose', 'ComplyAdvantage', 'Welocalize', 'Flip', 'Sapphire Ventures'];
    const OL_ROLES = ['Chief Revenue Officer', 'Senior Associate', 'Vice President, Marketing', 'Principal Product Manager', 'Head of Growth Marketing, Project Evolve', 'Chief Executive Officer, NoHo Protocol', 'Human Resources Business Partner'];
    const OL_LEADS = ['Ben Paterson', 'Diane Tseng', 'Christina Stevens', 'Steve Tutelman', 'Kate Turner', 'David Winch', 'Emily Lewis-LaMonica', 'Alex Howman'];
    const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const fdate = (yr) => `${pick(FULL_MONTHS)} ${1 + Math.floor(r() * 27)}, ${yr}`;
    const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const isOL = !!(p.offLimits || p.flag);
    const offLimits = { active: [], previous: [], label: null };
    if (isOL) {
      const mkRec = (prev) => {
        const type = pick(OL_TYPES);
        const company = pick(OL_COMPANIES);
        const role = pick(OL_ROLES);
        const isClient = type === 'Current Client';
        const startYr = (prev ? 2022 : 2025) + Math.floor(r() * 2);
        const start = fdate(startYr);
        const end = isClient ? null : fdate(startYr + 1 + Math.floor(r() * 2));
        const contract = isClient && r() < 0.4 ? 'Confidential' : `${slug(company)}_${slug(role)}_SIGNED.docx`;
        const duration = isClient ? null : `${pick(['12', '12', '24'])} Months - Candidate Start Date`;
        let note;
        if (isClient) note = `${company} is a current client on an open project.`;
        else note = r() < 0.35 ? null : `Direct reports to the ${role}`;
        return { type, company, role, contract, start, end, lead: pick(OL_LEADS), duration, note };
      };
      const nA = 1 + Math.floor(r() * 4);
      for (let i = 0; i < nA; i++) offLimits.active.push(mkRec(false));
      const nP = Math.floor(r() * 3);
      for (let i = 0; i < nP; i++) offLimits.previous.push(mkRec(true));
      offLimits.label = offLimits.active[0].type;
    }

    // Active candidacies — drives the "in project" briefcase indicator on people cards.
    const ADV_STAGES = ['Hiring Team Interview', 'Offer', 'Hired'];
    const activeProjects = [];
    if (p.inProject) {
      const stagePool = p.inProjectStage === 'early' ? ['Sourced', 'Screening']
        : p.inProjectStage === 'advanced' ? ['Hiring Team Interview', 'Offer', 'Hired']
        : ['Sourced', 'Screening', 'Screening', 'Hiring Team Interview', 'Offer', 'Hired'];
      const nAP = 1 + Math.floor(r() * 2);
      const seen = {};
      for (let i = 0; i < nAP; i++) {
        let nm = pick(PROJ_TITLES); if (seen[nm]) nm = pick(PROJ_TITLES); seen[nm] = 1;
        activeProjects.push({ name: nm, company: pick(PROJ_COMPANIES), stage: pick(stagePool) });
      }
    }
    const advancedInProject = activeProjects.some(ap => ADV_STAGES.includes(ap.stage));

    const d = { experience, skills, notes, projects, lists, scorecards, offLimits, activeProjects, advancedInProject, outreaches, events };
    cache[key] = d; return d;
  };
})();

window.HubData = HubData;
