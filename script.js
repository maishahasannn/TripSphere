const app = document.getElementById('app');
const cloneState = (value) => {
  try {
    if (typeof structuredClone === 'function') return structuredClone(value);
  } catch {}
  return JSON.parse(JSON.stringify(value));
};

window.addEventListener('error', (event) => {
  const target = document.getElementById('app');
  if (!target) return;
  const source = event && event.target;
  if (source && source !== window) {
    const tag = (source.tagName || '').toUpperCase();
    if (tag === 'IMG') {
      source.style.visibility = 'hidden';
      source.style.background = '#f3f4f6';
      source.alt = source.alt || 'Image unavailable';
      return;
    }
    return;
  }
  target.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;background:#f8fafc;padding:24px;font-family:Arial,sans-serif;"><div style="max-width:720px;background:white;border:1px solid #e2e8f0;border-radius:24px;padding:24px;box-shadow:0 10px 30px rgba(15,23,42,.08);"><h1 style="margin:0 0 12px;font-size:28px;color:#0f172a;">TripSphere hit a loading error</h1><p style="margin:0 0 10px;color:#475569;line-height:1.7;">The app ran into an unexpected JavaScript error.</p><p style="margin:0;color:#be123c;font-size:14px;word-break:break-word;">${String(event.message || 'Unknown error')}</p></div></div>`;
});

const destinations = [
  { id: 1, name: 'Paris, France', city: 'Paris', country: 'France', averageCost: 2400, bestTime: 'April to June', weather: 'Mild', activities: ['Museums', 'Food', 'Sightseeing'], attractions: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'], budgetLevel: 'medium', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { id: 2, name: 'Tokyo, Japan', city: 'Tokyo', country: 'Japan', averageCost: 2900, bestTime: 'March to May', weather: 'Mild', activities: ['Food', 'Shopping', 'Culture'], attractions: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree'], budgetLevel: 'high', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80' },
  { id: 3, name: 'Bali, Indonesia', city: 'Bali', country: 'Indonesia', averageCost: 1500, bestTime: 'April to October', weather: 'Warm', activities: ['Beach', 'Relaxation', 'Nature'], attractions: ['Ubud', 'Tanah Lot Temple', 'Seminyak Beach'], budgetLevel: 'low', flag: '🇮🇩', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80' },
  { id: 4, name: 'Rome, Italy', city: 'Rome', country: 'Italy', averageCost: 2200, bestTime: 'April to June', weather: 'Mild', activities: ['History', 'Food', 'Sightseeing'], attractions: ['Colosseum', 'Vatican Museums', 'Trevi Fountain'], budgetLevel: 'medium', flag: '🇮🇹', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80' },
  { id: 5, name: 'New York City, USA', city: 'New York City', country: 'USA', averageCost: 3100, bestTime: 'September to November', weather: 'Cool', activities: ['Shopping', 'Food', 'City Life'], attractions: ['Times Square', 'Central Park', 'Statue of Liberty'], budgetLevel: 'high', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80' },
  { id: 6, name: 'Cancun, Mexico', city: 'Cancun', country: 'Mexico', averageCost: 1800, bestTime: 'December to April', weather: 'Warm', activities: ['Beach', 'Resorts', 'Nightlife'], attractions: ['Hotel Zone', 'Isla Mujeres', 'Mayan Ruins'], budgetLevel: 'medium', flag: '🇲🇽', image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=1200&q=80' },
  { id: 7, name: 'London, England', city: 'London', country: 'England', averageCost: 2700, bestTime: 'May to September', weather: 'Cool', activities: ['Museums', 'History', 'Shopping'], attractions: ['Big Ben', 'Tower Bridge', 'Buckingham Palace'], budgetLevel: 'high', flag: '🇬🇧', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80' },
  { id: 8, name: 'Dubai, UAE', city: 'Dubai', country: 'UAE', averageCost: 3000, bestTime: 'November to March', weather: 'Warm', activities: ['Luxury', 'Shopping', 'Desert Tours'], attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'], budgetLevel: 'high', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' }
];

const DEFAULT_DEST_IMAGE = 'travel-block-1.webp';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_SUMMARY_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const imageLookupCache = {};

const popularDestinations = destinations.slice(0, 6).map(d => d.name);
const tripColors = ['slate', 'rose', 'emerald', 'amber', 'violet', 'sky'];
const colorMap = {
  slate: { solid: '#0f172a', soft: '#e2e8f0', text: '#0f172a' },
  rose: { solid: '#e11d48', soft: '#ffe4e6', text: '#9f1239' },
  emerald: { solid: '#059669', soft: '#d1fae5', text: '#065f46' },
  amber: { solid: '#d97706', soft: '#fef3c7', text: '#92400e' },
  violet: { solid: '#7c3aed', soft: '#ede9fe', text: '#5b21b6' },
  sky: { solid: '#0284c7', soft: '#e0f2fe', text: '#075985' }
};

const defaultState = {
  editTripId: null,
  editTripDraft: { name: '', color: 'slate' },
  isLoggedIn: false,
  authMode: 'register',
  currentPage: 'home',
  user: { fullName: '', username: '', email: '', password: '' },
  authForm: { fullName: '', username: '', email: '', password: '' },
  authError: '',
  showPassword: false,
  registeredUsers: [],
  tripForm: { name: '', destination: '', startDate: '', endDate: '', budget: '' },
  tripFormError: '',
  destinationSearch: '',
  searchResults: [],
  budgetFilter: 'all',
  weatherFilter: 'all',
  activityFilter: 'all',
  selectedDestinationId: null,
  selectedTripId: null,
  itineraryForm: { activity: '', date: '', time: '' },
  packingInput: '',
  categoryForm: { name: '', amount: '', goal: '' },
  savedMoneyInput: '',
  showProfileMenu: false,
  deleteProfileStep: 0,
  trips: [],
  savedPlaces: [],
  favorites: [],
  scrapbooks: [],
  selectedScrapbookId: null,
  sectionTarget: ''
};

const STORAGE_KEY = 'tripsphereStateV10';
let state = loadState();

function isValidEmail(email) {
  const value = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|io|co|us|uk|ca|info|biz)$/i.test(value);
}

function destinationMeta(name='') {
  return destinations.find(d => d.name.toLowerCase() === String(name).toLowerCase()) || null;
}

function normalizeTrip(trip) {
  const meta = destinationMeta(trip.destination) || {};
  return {
    id: trip.id || Date.now(),
    name: trip.name || '',
    destination: trip.destination || '',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    budget: Number(trip.budget || 0),
    saved: Number(trip.saved || 0),
    notes: trip.notes || '',
    color: trip.color || 'slate',
    image: trip.image || meta.image || '',
    flag: trip.flag || meta.flag || '🌍',
    itinerary: Array.isArray(trip.itinerary) ? trip.itinerary.map((item) => ({
      id: item.id || Date.now() + Math.random(),
      activity: item.activity || '',
      date: item.date || '',
      time: item.time || ''
    })) : [],
    packing: Array.isArray(trip.packing) ? trip.packing.map((item) => ({
      id: item.id || Date.now() + Math.random(),
      text: item.text || item || '',
      done: !!item.done
    })) : [],
    budgetCategories: Array.isArray(trip.budgetCategories) ? trip.budgetCategories.map((item) => ({
      id: item.id || Date.now() + Math.random(),
      name: item.name || '',
      amount: Number(item.amount || 0),
      goal: Number(item.goal || 0)
    })) : []
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('tripsphereStateV9') || localStorage.getItem('tripsphereStateV8') || localStorage.getItem('tripsphereStateV7'));
    if (!saved) return cloneState(defaultState);
    const merged = { ...cloneState(defaultState), ...saved };
    merged.registeredUsers = Array.isArray(merged.registeredUsers) ? merged.registeredUsers : [];
    merged.searchResults = Array.isArray(merged.searchResults) ? merged.searchResults : [];
    merged.trips = Array.isArray(merged.trips) ? merged.trips.map(normalizeTrip) : [];
    merged.savedPlaces = Array.isArray(merged.savedPlaces) ? merged.savedPlaces.map((p) => ({
      id: p.id || Date.now() + Math.random(),
      location: p.location || '',
      attractions: Array.isArray(p.attractions) ? p.attractions : [],
      notes: p.notes || '',
      image: p.image || DEFAULT_DEST_IMAGE,
      flag: p.flag || '🌍',
      averageCost: Number(p.averageCost || 0),
      bestTime: p.bestTime || 'Year-round',
      weather: p.weather || 'Mild',
      budgetLevel: p.budgetLevel || 'medium',
      activities: Array.isArray(p.activities) ? p.activities : []
    })) : [];
    merged.scrapbooks = Array.isArray(merged.scrapbooks) ? merged.scrapbooks.map((book) => ({
      id: book.id || Date.now() + Math.random(),
      title: book.title || 'Untitled Scrapbook',
      location: book.location || '',
      description: book.description || '',
      cover: book.cover || DEFAULT_DEST_IMAGE,
      createdAt: book.createdAt || new Date().toISOString(),
      entries: Array.isArray(book.entries) ? book.entries.map((entry) => ({
        id: entry.id || Date.now() + Math.random(),
        title: entry.title || '',
        place: entry.place || '',
        text: entry.text || '',
        dateVisited: entry.dateVisited || '',
        media: Array.isArray(entry.media) ? entry.media.map((item) => ({
          type: item.type === 'video' ? 'video' : 'image',
          src: item.src || '',
          name: item.name || ''
        })).filter((item) => item.src) : []
      })) : []
    })) : [];
    if (!merged.trips.some(t => t.id === merged.selectedTripId)) merged.selectedTripId = merged.trips[0]?.id || null;
    if (!merged.scrapbooks.some(b => b.id === merged.selectedScrapbookId)) merged.selectedScrapbookId = merged.scrapbooks[0]?.id || null;
    return merged;
  } catch {
    return cloneState(defaultState);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAndRender() {
  persist();
  render();
}

function currentTrip() {
  return state.trips.find(t => t.id === state.selectedTripId) || null;
}

function selectedDestination() {
  const savedPlace = state.savedPlaces.find(p => p.id === state.selectedDestinationId);
  if (savedPlace) {
    return {
      id: savedPlace.id,
      name: savedPlace.location,
      city: savedPlace.location,
      country: '',
      averageCost: savedPlace.averageCost || 0,
      bestTime: savedPlace.bestTime || 'Year-round',
      weather: savedPlace.weather || 'Mild',
      activities: Array.isArray(savedPlace.activities) ? savedPlace.activities : [],
      attractions: Array.isArray(savedPlace.attractions) ? savedPlace.attractions : [],
      budgetLevel: savedPlace.budgetLevel || 'medium',
      flag: savedPlace.flag || '🌍',
      image: savedPlace.image || DEFAULT_DEST_IMAGE
    };
  }
  return state.searchResults.find(d => d.id === state.selectedDestinationId) || destinations.find(d => d.id === state.selectedDestinationId) || null;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function formatStandardTime(value) {
  if (!value) return '';
  const [h, m] = value.split(':');
  const d = new Date();
  d.setHours(Number(h || 0), Number(m || 0), 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getTripDates(trip) {
  if (!trip || !trip.startDate || !trip.endDate) return [];
  const dates = [];
  let current = new Date(trip.startDate + 'T00:00:00');
  const end = new Date(trip.endDate + 'T00:00:00');
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function tripDayLabel(trip, dateValue) {
  const dates = getTripDates(trip);
  const index = dates.indexOf(dateValue);
  return index >= 0 ? `Day ${index + 1}` : 'Day';
}

function tripDateOptions(trip, selected='') {
  return getTripDates(trip).map((date) => `<option value="${date}" ${selected === date ? 'selected' : ''}>${tripDayLabel(trip, date)} • ${formatDate(date)}</option>`).join('');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cleanItineraryForExport(trip) {
  const blocked = new Set([
    'arrival and exploration',
    'sightseeing and experiences',
    'final day plans'
  ]);
  const cleaned = { ...trip };
  cleaned.itinerary = (trip.itinerary || []).filter(item => !blocked.has(String(item.activity || '').trim().toLowerCase()));
  return cleaned;
}

function downloadTripDetails(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;
  const safeTrip = cleanItineraryForExport(trip);
  const totals = budgetTotals(safeTrip);
  const grouped = getTripDates(safeTrip).map((date) => ({
    date,
    label: tripDayLabel(safeTrip, date),
    items: safeTrip.itinerary.filter(item => item.date === date).sort((a,b) => (a.time || '').localeCompare(b.time || ''))
  }));
  const categoriesHtml = safeTrip.budgetCategories.length ? safeTrip.budgetCategories.map(c => `
    <div class="budget-card">
      <div class="budget-name">${escapeHtml(c.name)}</div>
      <div class="budget-meta">Saved: $${Number(c.amount||0).toLocaleString()} / Goal: $${Number(c.goal||0).toLocaleString()}</div>
    </div>`).join('') : '<div class="muted">No budget categories added yet.</div>';
  const notesHtml = safeTrip.notes ? escapeHtml(safeTrip.notes).replace(/\n/g,'<br>') : '<span class="muted">No notes added yet.</span>';
  const packingHtml = safeTrip.packing.length ? safeTrip.packing.map(item => `<li>${item.done ? '☑' : '☐'} ${escapeHtml(item.text)}</li>`).join('') : '<li>No packing items added yet.</li>';
  const itineraryHtml = grouped.map(group => `
    <section class="day-block">
      <div class="day-head">
        <div class="day-label">${group.label}</div>
        <div class="day-date">${formatDate(group.date)}</div>
      </div>
      <div class="timeline">
        ${group.items.length ? group.items.map(item => `
          <div class="timeline-row">
            <div class="timeline-time">${formatStandardTime(item.time)}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-card">${escapeHtml(item.activity)}</div>
          </div>`).join('') : '<div class="muted">No activities added for this day.</div>'}
      </div>
    </section>`).join('');
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(safeTrip.name)} - Trip Details</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f6efe8;color:#2f2a25;margin:0;padding:32px;}
  .sheet{max-width:1000px;margin:0 auto;background:#fffdf9;border:1px solid #eadfd3;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(60,40,20,.12)}
  .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center;padding:36px;background:linear-gradient(135deg,#f4e7da,#f9f4ec)}
  .kicker{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a6f5a;margin-bottom:12px}
  h1{margin:0;font-size:42px;line-height:1.05;color:#2e2016}.sub{margin-top:12px;font-size:17px;color:#6f5b4d}
  .heroimg{width:100%;height:280px;object-fit:cover;border-radius:22px;box-shadow:0 18px 32px rgba(0,0,0,.1)}
  .meta{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:0 36px 36px;margin-top:-8px}
  .meta .card,.section{background:#fff;border:1px solid #efe4d8;border-radius:22px;padding:22px}
  .eyebrow{font-size:12px;color:#8a6f5a;text-transform:uppercase;letter-spacing:.12em}.value{font-size:20px;font-weight:700;margin-top:8px}
  .content{padding:0 36px 36px;display:grid;gap:18px}.section h2{margin:0 0 14px;font-size:24px;color:#2e2016}
  .timeline{display:grid;gap:14px}.timeline-row{display:grid;grid-template-columns:110px 24px 1fr;gap:14px;align-items:start}
  .timeline-time{font-weight:700;color:#6f5b4d;padding-top:14px}.timeline-dot{width:16px;height:16px;border-radius:999px;background:#9fe5c1;border:4px solid #dff6ea;margin-top:16px;position:relative}
  .timeline-dot:after{content:'';position:absolute;left:50%;top:16px;transform:translateX(-50%);width:2px;height:42px;background:#d8c6b5}.timeline-row:last-child .timeline-dot:after{display:none}
  .timeline-card{background:#fff8f1;border:1px solid #efe4d8;border-radius:18px;padding:14px 16px;font-size:16px}
  .day-block{padding:10px 0}.day-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #f0e5d9}
  .day-label{font-size:22px;font-weight:700}.day-date{font-size:18px;color:#6f5b4d}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.budget-card{background:#fff8f1;border:1px solid #efe4d8;border-radius:16px;padding:14px}.budget-name{font-weight:700}.budget-meta{margin-top:6px;color:#6f5b4d}
  ul{margin:0;padding-left:20px} li{margin:8px 0}.muted{color:#8a6f5a}
  @media print{body{padding:0;background:#fff}.sheet{box-shadow:none;border:none;border-radius:0}}
  @media (max-width:800px){.hero,.meta,.grid2,.budget-grid{grid-template-columns:1fr}.content,.hero{padding:24px}.meta{padding:0 24px 24px}}
</style></head><body>
  <div class="sheet">
    <div class="hero">
      <div>
        <div class="kicker">Trip details</div>
        <h1>${escapeHtml(safeTrip.flag)} ${escapeHtml(safeTrip.name)}</h1>
        <div class="sub">${escapeHtml(safeTrip.destination)} • ${formatDate(safeTrip.startDate)} – ${formatDate(safeTrip.endDate)}</div>
      </div>
      ${safeTrip.image ? `<img class="heroimg" src="${escapeHtml(safeTrip.image)}" alt="${escapeHtml(safeTrip.destination)}">` : ''}
    </div>
    <div class="meta">
      <div class="card"><div class="eyebrow">Destination</div><div class="value">${escapeHtml(safeTrip.destination)}</div></div>
      <div class="card"><div class="eyebrow">Travel dates</div><div class="value">${formatDate(safeTrip.startDate)} – ${formatDate(safeTrip.endDate)}</div></div>
      <div class="card"><div class="eyebrow">Budget goal</div><div class="value">$${Number(safeTrip.budget||0).toLocaleString()}</div></div>
      <div class="card"><div class="eyebrow">Money Saved</div><div class="value">$${Number(totals.tracked||0).toLocaleString()}</div></div>
    </div>
    <div class="content">
      <div class="section"><h2>Itinerary</h2>${itineraryHtml}</div>
      <div class="grid2">
        <div class="section"><h2>Budget</h2><div class="budget-grid">${categoriesHtml}</div></div>
        <div class="section"><h2>Notes</h2><div>${notesHtml}</div></div>
      </div>
      <div class="section"><h2>Packing List</h2><ul>${packingHtml}</ul></div>
    </div>
  </div>
</body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${String(safeTrip.name || 'trip-details').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() || 'trip-details'}-details.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

function escapeHtml(str='') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function authInputValue(id, field) {
  const el = document.getElementById(id);
  return el ? el.value : state.authForm[field];
}

function handleAuth() {
  const fullName = authInputValue('auth-fullName', 'fullName').trim();
  const username = authInputValue('auth-username', 'username').trim();
  const email = authInputValue('auth-email', 'email').trim().toLowerCase();
  const password = authInputValue('auth-password', 'password');

  state.authForm = { fullName, username, email, password };

  if (!isValidEmail(email)) {
    state.authError = 'Please enter a valid email address with @ and a domain like .com, .org, or .net.';
    return saveAndRender();
  }

  if (state.authMode === 'register') {
    if (!fullName || !username || !password) {
      state.authError = 'Please complete all fields to register.';
      return saveAndRender();
    }
    const usernameTaken = state.registeredUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (usernameTaken) {
      state.authError = 'That username is already taken.';
      return saveAndRender();
    }
    const emailTaken = state.registeredUsers.some(u => u.email.toLowerCase() === email);
    if (emailTaken) {
      state.authError = 'That email is already taken.';
      return saveAndRender();
    }
    const user = { fullName, username, email, password };
    state.registeredUsers.push(user);
    state.user = { ...user };
    state.authForm = { fullName: '', username: '', email: '', password: '' };
    state.authError = '';
    state.showPassword = false;
    state.isLoggedIn = true;
    state.currentPage = 'home';
    return saveAndRender();
  }

  const foundUser = state.registeredUsers.find(u => u.email.toLowerCase() === email);
  if (!foundUser) {
    state.authError = 'No account was found with that email.';
    return saveAndRender();
  }
  if (foundUser.password !== password) {
    state.authError = 'Incorrect password.';
    return saveAndRender();
  }
  state.user = { ...foundUser };
  state.authError = '';
  state.showPassword = false;
  state.authForm = { fullName: '', username: '', email: '', password: '' };
  state.isLoggedIn = true;
  state.currentPage = 'home';
  saveAndRender();
}

function switchAuth(mode) { cacheAuthFormFromDom(); state.authMode = mode; state.authError = ''; saveAndRender(); }
function cacheAuthFormFromDom() {
  state.authForm.fullName = document.getElementById('auth-fullName')?.value || state.authForm.fullName;
  state.authForm.username = document.getElementById('auth-username')?.value || state.authForm.username;
  state.authForm.email = document.getElementById('auth-email')?.value || state.authForm.email;
  state.authForm.password = document.getElementById('auth-password')?.value || state.authForm.password;
}
function togglePasswordVisibility() { cacheAuthFormFromDom(); state.showPassword = !state.showPassword; saveAndRender(); }
function logout() { state.isLoggedIn = false; state.showProfileMenu = false; state.deleteProfileStep = 0; saveAndRender(); }

function updateTripField(field, value) {
  state.tripForm[field] = value;
  if (field === 'startDate') {
    const endEl = document.getElementById('trip-endDate');
    if (endEl) {
      endEl.min = value || '';
      if (!endEl.value && value) endEl.value = value;
    }
    if (state.tripForm.endDate && state.tripForm.endDate < value) state.tripForm.endDate = value;
  }
  state.tripFormError = '';
  persist();
}

function createTrip() {
  const form = {
    name: (document.getElementById('trip-name')?.value || state.tripForm.name).trim(),
    destination: (document.getElementById('trip-destination')?.value || state.tripForm.destination).trim(),
    startDate: document.getElementById('trip-startDate')?.value || state.tripForm.startDate,
    endDate: document.getElementById('trip-endDate')?.value || state.tripForm.endDate,
    budget: document.getElementById('trip-budget')?.value || state.tripForm.budget
  };
  state.tripForm = { ...form };
  if (!form.name || !form.destination || !form.startDate || !form.endDate || !form.budget) {
    state.tripFormError = 'Please complete every trip field.';
    return saveAndRender();
  }
  if (form.endDate < form.startDate) {
    state.tripFormError = 'End date cannot be before the start date.';
    return saveAndRender();
  }
  const meta = destinationMeta(form.destination) || {};
  const trip = normalizeTrip({
    id: Date.now(),
    name: form.name,
    destination: form.destination,
    startDate: form.startDate,
    endDate: form.endDate,
    budget: Number(form.budget),
    saved: 0,
    color: 'slate',
    image: meta.image,
    flag: meta.flag || '🌍',
    itinerary: [],
    packing: [],
    notes: '',
    budgetCategories: []
  });
  state.trips.unshift(trip);
  state.selectedTripId = trip.id;
  state.tripForm = { name: '', destination: '', startDate: '', endDate: '', budget: '' };
  state.tripFormError = '';
  state.currentPage = 'myTrips';
  saveAndRender();
}

function normalizeWeatherLabel(value='') {
  const normalized = String(value || '').trim().toLowerCase();
  if (['warm', 'hot', 'sunny', 'tropical'].includes(normalized)) return 'Warm';
  if (['cool', 'cold', 'chilly'].includes(normalized)) return 'Cool';
  if (['mild', 'temperate'].includes(normalized)) return 'Mild';
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Mild';
}

function titleCase(value='') {
  return String(value || '').replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function buildSearchFallbackDestination(query) {
  const trimmed = String(query || '').trim();
  const weather = normalizeWeatherLabel(state.weatherFilter === 'all' ? 'Mild' : state.weatherFilter);
  const activity = state.activityFilter === 'all' ? 'Sightseeing' : state.activityFilter;
  const budgetLevel = state.budgetFilter === 'all' ? 'medium' : state.budgetFilter;
  const averageCost = budgetLevel === 'low' ? 1400 : budgetLevel === 'high' ? 3200 : 2200;
  return {
    id: `search-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') || Date.now()}`,
    name: titleCase(trimmed),
    city: titleCase(trimmed),
    country: '',
    averageCost,
    bestTime: 'Year-round',
    weather,
    activities: [activity],
    attractions: ['Top local attractions', 'City center', 'Popular food spots'],
    budgetLevel,
    flag: '🌍',
    image: DEFAULT_DEST_IMAGE,
    isDynamic: true
  };
}

async function fetchWikipediaImage(placeName) {
  const query = String(placeName || '').trim();
  if (!query) return DEFAULT_DEST_IMAGE;
  if (imageLookupCache[query]) return imageLookupCache[query];
  try {
    const searchUrl = `${WIKIPEDIA_API}?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = Array.isArray(searchData?.[1]) && searchData[1][0] ? searchData[1][0] : query;
    const summaryRes = await fetch(`${WIKIPEDIA_SUMMARY_API}${encodeURIComponent(title)}`);
    const summaryData = await summaryRes.json();
    const image = summaryData?.originalimage?.source || summaryData?.thumbnail?.source || DEFAULT_DEST_IMAGE;
    imageLookupCache[query] = image;
    return image;
  } catch (error) {
    imageLookupCache[query] = DEFAULT_DEST_IMAGE;
    return DEFAULT_DEST_IMAGE;
  }
}

async function hydrateDestinationImages(list=[]) {
  const hydrated = [];
  for (const dest of list) {
    const next = { ...dest };
    if (!next.image || next.image === DEFAULT_DEST_IMAGE) {
      const query = next.name || next.city || next.country;
      next.image = await fetchWikipediaImage(query);
    }
    hydrated.push(next);
  }
  return hydrated;
}


function currentScrapbook() {
  return state.scrapbooks.find(book => book.id === state.selectedScrapbookId) || null;
}

function readFilesAsDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(files.map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      type: file.type.startsWith('video/') ? 'video' : 'image',
      src: reader.result,
      name: file.name
    });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  }))).then((items) => items.filter(Boolean));
}

async function createScrapbook() {
  const title = (document.getElementById('scrapbook-title')?.value || '').trim();
  const location = (document.getElementById('scrapbook-location')?.value || '').trim();
  const description = (document.getElementById('scrapbook-description')?.value || '').trim();
  const coverFile = document.getElementById('scrapbook-cover')?.files?.[0] || null;

  if (!title) return;

  let cover = DEFAULT_DEST_IMAGE;
  if (coverFile) {
    const [media] = await readFilesAsDataUrls([coverFile]);
    if (media?.src) cover = media.src;
  } else if (location) {
    const matched = state.savedPlaces.find((p) => String(p.location).toLowerCase() === location.toLowerCase())
      || state.searchResults.find((p) => String(p.name).toLowerCase() === location.toLowerCase())
      || destinations.find((p) => String(p.name).toLowerCase() === location.toLowerCase());
    cover = matched?.image || DEFAULT_DEST_IMAGE;
  }

  const scrapbook = {
    id: Date.now(),
    title,
    location,
    description,
    cover,
    createdAt: new Date().toISOString(),
    entries: []
  };

  state.scrapbooks.unshift(scrapbook);
  state.selectedScrapbookId = scrapbook.id;
  state.currentPage = 'scrapbook';
  saveAndRender();
}

function openScrapbook(id) {
  state.selectedScrapbookId = id;
  state.currentPage = 'scrapbook';
  saveAndRender();
}

function backToScrapbooks() {
  state.selectedScrapbookId = null;
  state.currentPage = 'scrapbook';
  saveAndRender();
}

function deleteScrapbook(id) {
  state.scrapbooks = state.scrapbooks.filter((book) => book.id !== id);
  if (state.selectedScrapbookId === id) state.selectedScrapbookId = state.scrapbooks[0]?.id || null;
  saveAndRender();
}

async function addScrapbookEntry() {
  const book = currentScrapbook();
  if (!book) return;
  const title = (document.getElementById('scrap-entry-title')?.value || '').trim();
  const place = (document.getElementById('scrap-entry-place')?.value || '').trim();
  const dateVisited = document.getElementById('scrap-entry-date')?.value || '';
  const text = (document.getElementById('scrap-entry-text')?.value || '').trim();
  const files = document.getElementById('scrap-entry-files')?.files || [];

  if (!title && !text && !files.length) return;

  const media = await readFilesAsDataUrls(files);

  book.entries.unshift({
    id: Date.now() + Math.random(),
    title,
    place,
    dateVisited,
    text,
    media
  });

  saveAndRender();
}

function deleteScrapbookEntry(bookId, entryId) {
  const book = state.scrapbooks.find((item) => item.id === bookId);
  if (!book) return;
  book.entries = book.entries.filter((entry) => entry.id !== entryId);
  saveAndRender();
}

function scrapbookPage() {
  const book = currentScrapbook();

  if (!book || state.selectedScrapbookId == null) {
    return `
      <div class="section-title"><h1>Scrapbooks</h1><p>  </p></div>
      <div class="grid-2">
        <div class="card scrapbook-create-card">
          <h3>Create a New Scrapbook</h3>
          <div class="stack space-top">
            <div><label class="label">Scrapbook title</label><input id="scrapbook-title" class="input" placeholder="Summer in Italy"></div>
            <div><label class="label">Location</label><input id="scrapbook-location" class="input" placeholder="Rome, Italy"></div>
            <div><label class="label">Short description</label><textarea id="scrapbook-description" class="textarea scrapbook-textarea" placeholder="What made this trip memorable?"></textarea></div>
            <div><label class="label">Cover photo</label><input id="scrapbook-cover" class="input" type="file" accept="image/*"></div>
            <button class="btn btn-primary" onclick="createScrapbook()">Create Scrapbook</button>
          </div>
        </div>
        <div class="scrapbook-board">
          ${state.scrapbooks.length ? state.scrapbooks.map((item, index) => `
            <div class="card scrapbook-album-card ${index % 2 ? 'tilt-right-soft' : 'tilt-left-soft'}">
              <div class="scrapbook-album-cover">
                <img src="${escapeHtml(item.cover || DEFAULT_DEST_IMAGE)}" alt="${escapeHtml(item.title)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'">
                <span class="scrapbook-tape tape-left"></span>
                <span class="scrapbook-tape tape-right"></span>
              </div>
              <div class="space-top">
                <h3>${escapeHtml(item.title)}</h3>
                <div class="muted small">${escapeHtml(item.location || 'Travel memories')}</div>
                <div class="muted small space-top">${item.entries.length} memory${item.entries.length === 1 ? '' : 'ies'}</div>
                <div class="row space-top">
                  <button class="btn btn-primary compact-btn" onclick="openScrapbook(${item.id})">Open Scrapbook</button>
                  <button class="btn btn-danger compact-btn" onclick="deleteScrapbook(${item.id})">Delete</button>
                </div>
              </div>
            </div>
          `).join('') : `<div class="card scrapbook-empty-card"><h3>No scrapbooks yet</h3><p class="muted">Start your first travel scrapbook on the left and turn your trips into keepsakes.</p></div>`}
        </div>
      </div>
    `;
  }

  return `
    <div class="between"><div class="section-title"><h1>${escapeHtml(book.title)}</h1><p>${escapeHtml(book.location || 'Travel scrapbook')}</p></div><button class="btn btn-secondary" onclick="backToScrapbooks()">Back to All Scrapbooks</button></div>
    <div class="scrapbook-hero card">
      <div class="scrapbook-hero-cover">
        <img src="${escapeHtml(book.cover || DEFAULT_DEST_IMAGE)}" alt="${escapeHtml(book.title)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'">
      </div>
      <div>
        <div class="scrapbook-kicker">Travel scrapbook</div>
        <h2>${escapeHtml(book.title)}</h2>
        <p class="muted">${escapeHtml(book.description || 'A collection of photos, videos, and little memories from the trip.')}</p>
      </div>
    </div>
    <div class="card scrapbook-entry-form space-top">
      <h3>Add a Memory</h3>
      <div class="grid-2 space-top">
        <div><label class="label">Memory title</label><input id="scrap-entry-title" class="input" placeholder="Sunset in Positano"></div>
        <div><label class="label">Place</label><input id="scrap-entry-place" class="input" placeholder="Positano"></div>
        <div><label class="label">Date visited</label><input id="scrap-entry-date" class="input" type="date"></div>
        <div><label class="label">Photos or videos</label><input id="scrap-entry-files" class="input" type="file" accept="image/*,video/*" multiple></div>
        <div style="grid-column:1/-1"><label class="label">Story / caption</label><textarea id="scrap-entry-text" class="textarea scrapbook-textarea" placeholder="Write about what happened, what you ate, what you loved, or anything worth remembering."></textarea></div>
      </div>
      <div class="space-top"><button class="btn btn-primary" onclick="addScrapbookEntry()">Add to Scrapbook</button></div>
    </div>
    <div class="scrapbook-pages space-top">
      ${book.entries.length ? book.entries.map((entry, index) => `
        <div class="card scrapbook-page ${index % 2 ? 'tilt-right-soft' : 'tilt-left-soft'}">
          <div class="scrapbook-page-header">
            <div>
              <div class="scrapbook-stamp">${escapeHtml(entry.place || 'Memory')}</div>
              <h3>${escapeHtml(entry.title || 'Untitled memory')}</h3>
              <div class="muted small">${escapeHtml(entry.dateVisited ? formatDate(entry.dateVisited) : '')}</div>
            </div>
            <button class="icon-btn" onclick="deleteScrapbookEntry(${book.id}, ${entry.id})">🗑️</button>
          </div>
          ${entry.media?.length ? `<div class="scrap-media-grid">${entry.media.map((item, mediaIndex) => `
            <div class="scrap-polaroid ${mediaIndex % 2 ? 'tilt-right-soft' : 'tilt-left-soft'}">
              ${item.type === 'video'
                ? `<video controls src="${escapeHtml(item.src)}"></video>`
                : `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(entry.title || 'Scrapbook memory')}">`
              }
            </div>
          `).join('')}</div>` : ''}
          ${entry.text ? `<div class="scrap-note">${escapeHtml(entry.text).replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      `).join('') : `<div class="card scrapbook-empty-card"><h3>No memories yet</h3><p class="muted">Upload your first photos, videos, and notes above to start building this scrapbook.</p></div>`}
    </div>
  `;
}

function setPage(page) {
  state.currentPage = page;
  if (page === 'createTrip') {
    state.tripForm = { name: '', destination: '', startDate: '', endDate: '', budget: '' };
    state.tripFormError = '';
  }
  if (page === 'budget') state.selectedTripId = null;
  saveAndRender();
}
function openTrip(id) { state.selectedTripId = id; state.currentPage = 'tripOverview'; saveAndRender(); }
function openBudgetTrip(id) { state.selectedTripId = id; state.currentPage = 'budgetDetails'; saveAndRender(); }
function openDestination(id) { state.selectedDestinationId = id; saveAndRender(); }
function closeDestination() { state.selectedDestinationId = null; saveAndRender(); }
function toggleProfileMenu() { state.showProfileMenu = !state.showProfileMenu; state.deleteProfileStep = 0; saveAndRender(); }

async function applySearch() {
  state.destinationSearch = (document.getElementById('destination-search')?.value || '').trim();
  const matches = filteredDestinations();
  const baseResults = matches.length ? matches : (state.destinationSearch ? [buildSearchFallbackDestination(state.destinationSearch)] : destinations.slice(0, 6));
  state.searchResults = await hydrateDestinationImages(baseResults);
  saveAndRender();
}
function clearFilters() {
  state.destinationSearch = '';
  state.searchResults = [];
  state.budgetFilter = 'all';
  state.weatherFilter = 'all';
  state.activityFilter = 'all';
  saveAndRender();
}

function filteredDestinations() {
  return destinations.filter(dest => {
    const q = state.destinationSearch.toLowerCase().trim();
    const weather = String(dest.weather || '').toLowerCase();
    const activities = Array.isArray(dest.activities) ? dest.activities.map(a => String(a).toLowerCase()) : [];
    const matchesSearch = !q || dest.name.toLowerCase().includes(q) || dest.city.toLowerCase().includes(q) || dest.country.toLowerCase().includes(q);
    const matchesBudget = state.budgetFilter === 'all' || String(dest.budgetLevel || '').toLowerCase() === state.budgetFilter;
    const matchesWeather = state.weatherFilter === 'all' || weather === state.weatherFilter;
    const matchesActivity = state.activityFilter === 'all' || activities.includes(String(state.activityFilter).toLowerCase());
    return matchesSearch && matchesBudget && matchesWeather && matchesActivity;
  });
}

function openCreateTripWithDestination(dest) {
  if (!dest) return;
  state.tripForm = {
    name: '',
    destination: dest.name || dest.location || '',
    startDate: '',
    endDate: '',
    budget: dest.averageCost ? String(dest.averageCost) : ''
  };
  state.tripFormError = '';
  state.selectedDestinationId = null;
  state.currentPage = 'createTrip';
  saveAndRender();
}

function saveTripFromDestination() {
  const dest = selectedDestination();
  if (!dest) return;
  openCreateTripWithDestination(dest);
}

function addSavedPlaceFromDestination(id) {
  const dest = state.searchResults.find(d => d.id === id) || destinations.find(d => d.id === id);
  if (!dest) return;

  const alreadyExists = state.savedPlaces.some(
    p => p.location.toLowerCase() === String(dest.name).toLowerCase()
  );
  if (alreadyExists) {
    state.currentPage = 'saved';
    saveAndRender();
    return;
  }

  state.savedPlaces.unshift({
    id: Date.now(),
    location: dest.name,
    attractions: [...(dest.attractions || [])],
    notes: '',
    image: dest.image || DEFAULT_DEST_IMAGE,
    flag: dest.flag || '🌍',
    averageCost: Number(dest.averageCost || 0),
    bestTime: dest.bestTime || 'Year-round',
    weather: dest.weather || 'Mild',
    budgetLevel: dest.budgetLevel || 'medium',
    activities: [...(dest.activities || [])]
  });

  state.currentPage = 'saved';
  saveAndRender();
}

function openSavedPlaceOverview(id) {
  state.selectedDestinationId = id;
  saveAndRender();
}

function createTripFromSavedPlace(id) {
  const place = state.savedPlaces.find(p => p.id === id);
  if (!place) return;
  openCreateTripWithDestination({
    name: place.location,
    location: place.location,
    averageCost: place.averageCost || 0
  });
}

function addFavorite(id) {
  const dest = state.searchResults.find(d => d.id === id) || destinations.find(d => d.id === id);
  if (!dest) return;
  if (!state.favorites.includes(dest.name)) state.favorites.push(dest.name);
  persist();
  render();
}

function openTripEditor(id) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip) return;
  state.editTripId = id;
  state.editTripDraft = { name: trip.name, color: trip.color || 'slate' };
  saveAndRender();
}
function closeTripEditor() {
  state.editTripId = null;
  state.editTripDraft = { name: '', color: 'slate' };
  saveAndRender();
}
function updateTripEditField(field, value) {
  state.editTripDraft[field] = value;
  persist();
}
function saveTripEdit() {
  const trip = state.trips.find(t => t.id === state.editTripId);
  if (!trip) return;
  trip.name = (state.editTripDraft.name || trip.name).trim();
  trip.color = state.editTripDraft.color || trip.color || 'slate';
  closeTripEditor();
}
function editTripBudget(id) {
  const trip = state.trips.find(t => t.id === id);
  if (!trip) return;
  const next = prompt('Update total trip budget', trip.budget);
  if (next === null) return;
  const val = Number(next);
  if (!Number.isNaN(val) && val >= 0) {
    trip.budget = val;
    saveAndRender();
  }
}
function updateTripColor(color) {
  const trip = currentTrip();
  if (!trip) return;
  trip.color = color;
  persist();
  render();
}

function updateTripNotes(value) {
  const trip = currentTrip();
  if (!trip) return;
  trip.notes = value;
  persist();
}

function addItinerary() {
  const trip = currentTrip();
  if (!trip) return;
  const activity = (document.getElementById('itinerary-activity')?.value || '').trim();
  const date = document.getElementById('itinerary-date')?.value || '';
  const time = document.getElementById('itinerary-time')?.value || '';
  const validDates = getTripDates(trip);
  if (!activity || !date || !time || !validDates.includes(date)) return;
  trip.itinerary.push({ id: Date.now(), activity, date, time });
  trip.itinerary.sort((a,b) => (`${a.date} ${a.time}`).localeCompare(`${b.date} ${b.time}`));
  state.itineraryForm = { activity: '', date: trip.startDate || '', time: '' };
  saveAndRender();
}
function removeItinerary(id) {
  const trip = currentTrip();
  if (!trip) return;
  trip.itinerary = trip.itinerary.filter(item => item.id !== id);
  saveAndRender();
}
function updateItineraryItem(id, field, value) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.itinerary.find(i => i.id === id);
  if (!item) return;
  if (field === 'date' && !getTripDates(trip).includes(value)) return;
  item[field] = value;
  trip.itinerary.sort((a,b) => (`${a.date} ${a.time}`).localeCompare(`${b.date} ${b.time}`));
  persist();
  render();
}

function editItinerarySchedule(id) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.itinerary.find(i => i.id === id);
  if (!item) return;
  const validDates = getTripDates(trip);
  const optionsText = validDates.map((date, idx) => `${idx + 1}. ${tripDayLabel(trip, date)} • ${formatDate(date)}`).join('\n');
  const currentIndex = Math.max(0, validDates.indexOf(item.date));
  const selected = prompt(`Choose a trip day by number:\n\n${optionsText}`, String(currentIndex + 1));
  if (selected === null) return;
  const nextIndex = Number(selected) - 1;
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= validDates.length) return;
  const nextTime = prompt('Enter a new time in 24-hour format (HH:MM)', item.time || '');
  if (nextTime === null) return;
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(nextTime).trim())) return;
  item.date = validDates[nextIndex];
  item.time = String(nextTime).trim();
  trip.itinerary.sort((a,b) => (`${a.date} ${a.time}`).localeCompare(`${b.date} ${b.time}`));
  saveAndRender();
}

function addPacking() {
  const trip = currentTrip();
  if (!trip) return;
  const text = (document.getElementById('packing-item')?.value || '').trim();
  if (!text) return;
  trip.packing.push({ id: Date.now(), text, done: false });
  state.packingInput = '';
  saveAndRender();
}
function togglePacking(id) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.packing.find(i => i.id === id);
  if (!item) return;
  item.done = !item.done;
  persist();
  render();
}
function editPacking(id) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.packing.find(i => i.id === id);
  if (!item) return;
  const next = prompt('Edit packing item', item.text);
  if (next !== null && next.trim()) {
    item.text = next.trim();
    persist();
    render();
  }
}
function removePacking(id) {
  const trip = currentTrip();
  if (!trip) return;
  trip.packing = trip.packing.filter(item => item.id !== id);
  saveAndRender();
}

function addBudgetCategory() {
  const trip = currentTrip();
  if (!trip) return;
  const name = (document.getElementById('category-name')?.value || '').trim();
  const goal = Number(document.getElementById('category-goal')?.value || 0);
  if (!name) return;
  const existing = trip.budgetCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    if (goal >= 0) existing.goal = goal;
  } else {
    trip.budgetCategories.push({ id: Date.now(), name, amount: 0, goal });
  }
  state.categoryForm = { name: '', amount: '', goal: '' };
  saveAndRender();
}
function setBudgetCategoryValue(id, field, value) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.budgetCategories.find(c => c.id === id);
  if (!item) return;
  item[field] = Math.max(0, Number(value) || 0);
  persist();
}
function applyBudgetCategoryDelta(id, sign) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.budgetCategories.find(c => c.id === id);
  if (!item) return;
  const input = document.getElementById(`delta-${id}`);
  const delta = Math.max(0, Number(input?.value || 0));
  if (!delta) return;
  item.amount = Math.max(0, Number(item.amount || 0) + (sign * delta));
  if (input) input.value = '';
  saveAndRender();
}
function editBudgetCategory(id) {
  const trip = currentTrip();
  if (!trip) return;
  const item = trip.budgetCategories.find(c => c.id === id);
  if (!item) return;
  const name = prompt('Rename this category', item.name);
  if (name !== null && name.trim()) item.name = name.trim();
  saveAndRender();
}
function removeBudgetCategory(id) {
  const trip = currentTrip();
  if (!trip) return;
  trip.budgetCategories = trip.budgetCategories.filter(c => c.id !== id);
  saveAndRender();
}
function updateSavedMoney() { saveAndRender(); }

function deleteProfile() {
  if (state.deleteProfileStep === 0) {
    state.deleteProfileStep = 1;
    return saveAndRender();
  }
  const confirmPhrase = prompt('Type DELETE to permanently remove your profile.');
  if (confirmPhrase !== 'DELETE') return;
  state.registeredUsers = state.registeredUsers.filter(u => u.email.toLowerCase() !== state.user.email.toLowerCase());
  state.user = { fullName: '', username: '', email: '', password: '' };
  state.isLoggedIn = false;
  state.showProfileMenu = false;
  state.deleteProfileStep = 0;
  saveAndRender();
}

function editProfile() {
  const newName = prompt('Enter a new name', state.user.fullName);
  if (newName && newName.trim()) state.user.fullName = newName.trim();
  const newUsername = prompt('Enter a new username', state.user.username);
  if (newUsername && newUsername.trim()) {
    const taken = state.registeredUsers.some(u => u.email.toLowerCase() !== state.user.email.toLowerCase() && u.username.toLowerCase() === newUsername.trim().toLowerCase());
    if (taken) alert('That username is already taken.');
    else state.user.username = newUsername.trim();
  }
  const newEmail = prompt('Enter a new email', state.user.email);
  if (newEmail && newEmail.trim()) {
    const normalized = newEmail.trim().toLowerCase();
    if (!isValidEmail(normalized)) alert('Please enter a valid email address.');
    else {
      const taken = state.registeredUsers.some(u => u.email.toLowerCase() !== state.user.email.toLowerCase() && u.email.toLowerCase() === normalized);
      if (taken) alert('That email is already taken.');
      else state.user.email = normalized;
    }
  }
  const idx = state.registeredUsers.findIndex(u => u.email.toLowerCase() === (state.user.email || '').toLowerCase());
  if (idx >= 0) state.registeredUsers[idx] = { ...state.user };
  persist();
  render();
}
function changePassword() {
  const pwd = prompt('Enter a new password');
  if (!pwd) return;
  state.user.password = pwd;
  const idx = state.registeredUsers.findIndex(u => u.email.toLowerCase() === state.user.email.toLowerCase());
  if (idx >= 0) state.registeredUsers[idx].password = pwd;
  saveAndRender();
}

function editSavedPlace(id) {
  const place = state.savedPlaces.find(p => p.id === id);
  if (!place) return;
  const location = prompt('Edit saved place name', place.location);
  if (location !== null && location.trim()) place.location = location.trim();
  const attractions = prompt('Edit attractions, separated by commas', place.attractions.join(', '));
  if (attractions !== null) place.attractions = attractions.split(',').map(s => s.trim()).filter(Boolean);
  persist();
  render();
}
function removeSavedPlace(id) {
  state.savedPlaces = state.savedPlaces.filter(p => p.id !== id);
  saveAndRender();
}

function budgetTotals(trip) {
  const tracked = trip.budgetCategories.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const goals = trip.budgetCategories.reduce((sum, item) => sum + Number(item.goal || 0), 0);
  return { tracked, goals };
}

function budgetWheel(trip) {
  const categories = trip.budgetCategories;
  const count = Math.max(categories.length, 1);
  const outer = 112;
  const inner = 36;
  const step = count > 1 ? (outer - inner) / (count - 1) : 0;
  const palette = ['#0f172a', '#7c3aed', '#059669', '#d97706', '#0284c7', '#e11d48', '#16a34a', '#a855f7'];
  const circles = categories.map((cat, i) => {
    const r = outer - (step * i);
    const pct = cat && cat.goal > 0 ? Math.max(0, Math.min(1, cat.amount / cat.goal)) : 0;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct);
    const color = palette[i % palette.length];
    return `<circle cx="140" cy="140" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="16"></circle><circle cx="140" cy="140" r="${r}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" transform="rotate(-90 140 140)" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>`;
  }).join('');
  const labels = categories.map((cat, i) => `<div class="wheel-label"><span class="dot" style="background:${palette[i % palette.length]}"></span>${escapeHtml(cat.name)}: $${cat.amount}${cat.goal ? ` / $${cat.goal}` : ''}</div>`).join('') || '<div class="muted small">Add a category to build the wheel.</div>';
  const totals = budgetTotals(trip);
  return `
    <div class="budget-wheel-wrap">
      <svg viewBox="0 0 280 320" class="budget-wheel">${circles}<text x="140" y="136" text-anchor="middle" class="wheel-center-main">$${totals.tracked}</text><text x="140" y="160" text-anchor="middle" class="wheel-center-sub">money tracked</text><text x="140" y="300" text-anchor="middle" class="wheel-bottom-sub">total goal $${trip.budget}</text></svg>
      <div class="wheel-legend">${labels}</div>
    </div>
  `;
}

function destinationCardImage(trip) {
  const image = trip.image || DEFAULT_DEST_IMAGE;
  const alt = trip.destination || trip.name || 'Destination';
  return `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" class="hero-image" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'">`;
}

function profileModal() {
  return `
    <div class="modal ${state.showProfileMenu ? 'open' : ''}">
      <div class="modal-content profile-modal">
        <div class="between"><h2 style="margin:0">Profile Settings</h2><button class="icon-btn" onclick="toggleProfileMenu()">✕</button></div>
        <div class="profile-card">
          <div class="profile-row"><div class="avatar">${escapeHtml((state.user.fullName || 'U').slice(0,1).toUpperCase())}</div><div><div style="font-weight:700">${escapeHtml(state.user.fullName)}</div><div class="muted small">@${escapeHtml(state.user.username)}</div></div></div>
          <div class="stack space-top small"><div><strong>Email:</strong> ${escapeHtml(state.user.email)}</div><div><strong>Username:</strong> ${escapeHtml(state.user.username)}</div></div>
          <div class="stack space-top">
            <button class="btn btn-secondary" onclick="editProfile()">Edit Profile</button>
            <button class="btn btn-secondary" onclick="changePassword()">Change Password</button>
            <button class="btn btn-danger" onclick="deleteProfile()">${state.deleteProfileStep ? 'Click Again to Continue Delete' : 'Delete Profile'}</button>
            ${state.deleteProfileStep ? '<div class="error-text">Delete uses double confirmation. Click again, then type DELETE.</div>' : ''}
            <button class="btn btn-ghost" onclick="logout()">Log Out</button>
          </div>
        </div>
      </div>
    </div>`;
}

function welcomeScreen() {
  return `
  <div class="welcome welcome-splash">
    <section class="hero welcome-hero">
      
      <div class="welcome-globe-wrap">
        <div class="welcome-orbit orbit-one"></div>
        <div class="welcome-orbit orbit-two"></div>
        <div class="welcome-globe">🌍</div>
        <div class="welcome-plane">✈️</div>
      </div>

      <div class="welcome-copy">
        <div class="badge welcome-badge">Plan • Save • Explore • Remember</div>

        <h1>Welcome to TripSphere</h1>

        <p>
          Your all-in-one travel app to plan trips, explore destinations,
          track budgets, and turn your memories into beautiful scrapbooks.
        </p>

        <div class="feature-grid">
          <div class="feature-pill">✈️ Plan trips easily</div>
          <div class="feature-pill">🌆 Discover destinations</div>
          <div class="feature-pill">💸 Track budgets</div>
          <div class="feature-pill">📸 Save memories</div>
        </div>
      </div>
    </section>

    <section class="auth-card">
      <div class="auth-toggle">
        <button class="${state.authMode === 'register' ? 'active' : ''}" onclick="switchAuth('register')">Register</button>
        <button class="${state.authMode === 'login' ? 'active' : ''}" onclick="switchAuth('login')">Log In</button>
      </div>

      <h2>${state.authMode === 'register' ? 'Start Your Journey ✈️' : 'Welcome Back 🌍'}</h2>

      <div class="stack space-top">
        ${state.authMode === 'register' ? '<input id="auth-fullName" class="input" placeholder="Full name">' : ''}
        ${state.authMode === 'register' ? '<input id="auth-username" class="input" placeholder="Username">' : ''}
        
        <input id="auth-email" class="input" placeholder="Email">
        
        <input id="auth-password" class="input" type="password" placeholder="Password">

        <button class="btn btn-primary" onclick="handleAuth()">
          ${state.authMode === 'register' ? 'Create Account' : 'Log In'}
        </button>
      </div>
    </section>
  </div>
  `;
}

function homePage() {
  const featured = state.trips[0] || null;
  return `
    <div class="travel-home">
      <section class="travel-home-hero card">
        <div class="travel-home-map"></div>
        <div class="travel-floating-icons">
          <span class="travel-float f1">✈️</span>
          <span class="travel-float f2">🗺️</span>
          <span class="travel-float f3">📍</span>
          <span class="travel-float f4">🧳</span>
        </div>
        <div class="travel-wave travel-wave-back"></div>
        <div class="travel-wave travel-wave-front"></div>

        <div class="travel-home-copy">
          <div class="travel-kicker">Adventure starts here</div>
          <h1>${featured ? `Ready for ${escapeHtml(featured.destination)}?` : 'Plan your next escape 🌍'}</h1>
          <p>${featured ? `Your ${escapeHtml(featured.name)} trip is waiting for you. Jump back into planning, budgeting, and saving memories.` : 'TripSphere keeps your destinations, budgets, and travel memories together in one beautiful place.'}</p>
          <div class="row space-top">
            <button class="btn btn-primary" onclick="setPage('createTrip')">Create New Trip</button>
            <button class="btn btn-secondary" onclick="setPage('search')">Explore Destinations</button>
          </div>
        </div>

        <div class="travel-feature-card">
          ${featured ? `
            <div class="travel-feature-badge">Current favorite</div>
            <h3>${escapeHtml(featured.flag || '🌍')} ${escapeHtml(featured.name)}</h3>
            <div class="muted">${escapeHtml(featured.destination)}</div>
            <div class="small space-top">${formatDate(featured.startDate)} - ${formatDate(featured.endDate)}</div>
            <div class="row space-top">
              <button class="btn btn-primary compact-btn" onclick="openTrip(${featured.id})">Open Trip</button>
              <button class="btn btn-secondary compact-btn" onclick="openBudgetTrip(${featured.id})">Budget</button>
            </div>
          ` : `
            <div class="travel-feature-badge">Welcome aboard</div>
            <h3>Start your first trip</h3>
            <div class="muted">Create a trip, search destinations, and build scrapbook memories as you go.</div>
          `}
        </div>
      </section>

      <div class="grid-4 space-top">
        <div class="card travel-mini-card"><h3>Create New Trip</h3><p class="muted">Start a new trip with dates, destination, and budget.</p><div class="space-top"><button class="btn btn-primary" onclick="setPage('createTrip')">Create Trip</button></div></div>
        <div class="card travel-mini-card"><h3>My Trips</h3><p class="muted">View trips you already created and open trip overviews.</p><div class="space-top"><button class="btn btn-secondary" onclick="setPage('myTrips')">View Trips</button></div></div>
        <div class="card travel-mini-card"><h3>Search Destinations</h3><p class="muted">Explore places by budget, weather, and activities.</p><div class="space-top"><button class="btn btn-secondary" onclick="setPage('search')">Search</button></div></div>
        <div class="card travel-mini-card"><h3>Scrapbook</h3><p class="muted">Keep photos, videos, and memories from places you’ve visited.</p><div class="space-top"><button class="btn btn-secondary" onclick="setPage('scrapbook')">Open Scrapbook</button></div></div>
      </div>

      <div class="card space-top">
        <div class="between">
          <div><h3>Saved Places</h3><p class="muted">Destinations you want to come back to later.</p></div>
          <button class="btn btn-secondary" onclick="setPage('saved')">Open Saved Places</button>
        </div>
      </div>
    </div>
  `;
}


function createTripPage() {
  return `
    <div class="section-title"><h1>Create a New Trip</h1><p>Enter the trip name, destination, dates, and total budget.</p></div>
    <div class="card">
      <div class="grid-2">
        <div style="grid-column:1/-1"><label class="label">Trip name</label><input id="trip-name" class="input" autocomplete="off" placeholder="Example: Summer Italy Trip" value="${escapeHtml(state.tripForm.name)}" oninput="state.tripForm.name=this.value; persist()"></div>
        <div style="grid-column:1/-1"><label class="label">Destination</label><input id="trip-destination" class="input" autocomplete="off" list="destination-options" placeholder="Type a city or country" value="${escapeHtml(state.tripForm.destination)}" oninput="state.tripForm.destination=this.value; persist()"><datalist id="destination-options">${destinations.map(d => `<option value="${escapeHtml(d.name)}"></option>`).join('')}</datalist></div>
        <div><label class="label">Start date</label><div class="date-shell"><input id="trip-startDate" class="input date-input" type="date" autocomplete="off" value="${escapeHtml(state.tripForm.startDate)}" onchange="updateTripField('startDate', this.value)"></div></div>
        <div><label class="label">End date</label><div class="date-shell"><input id="trip-endDate" class="input date-input" type="date" autocomplete="off" value="${escapeHtml(state.tripForm.endDate)}" onchange="updateTripField('endDate', this.value)"></div></div>
        <div style="grid-column:1/-1"><label class="label">Total budget</label><input id="trip-budget" class="input" type="number" autocomplete="off" placeholder="Enter budget amount" value="${escapeHtml(state.tripForm.budget)}" oninput="state.tripForm.budget=this.value; persist()"></div>
      </div>
      ${state.tripFormError ? `<div class="error-text space-top">${escapeHtml(state.tripFormError)}</div>` : ''}
      <div class="row space-top"><button class="btn btn-primary" onclick="createTrip()">Save Trip</button><button class="btn btn-secondary" onclick="setPage('myTrips')">Go to My Trips</button></div>
    </div>`;
}

function myTripsPage() {
  if (!state.trips.length) return `<div class="section-title"><h1>My Trips</h1><p>See the trips you have created and open any trip overview.</p></div><div class="empty-state"><h3>No trips yet</h3><p class="muted">Create your first trip to start planning.</p><div class="space-top"><button class="btn btn-primary" onclick="setPage('createTrip')">Create Trip</button></div></div>`;
  const editorTrip = state.trips.find(t => t.id === state.editTripId);
  return `
    <div class="between"><div class="section-title"><h1>My Trips</h1><p> </p></div><button class="btn btn-primary" onclick="setPage('createTrip')">Create New Trip</button></div>
    <div class="grid-2 trip-card-grid">
      ${state.trips.map(trip => {
        const theme = colorMap[trip.color] || colorMap.slate;
        return `<div class="card trip-card trip-card-button" onclick="openTrip(${trip.id})" role="button" tabindex="0" style="border-top: 8px solid ${theme.solid}">
          <div class="trip-card-title">
            <div class="trip-card-main">
              <h3>${escapeHtml(trip.flag)} ${escapeHtml(trip.name)}</h3>
              <p class="muted">${escapeHtml(trip.destination)}</p>
              <div class="space-top small muted">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</div>
            </div>
            <div class="trip-card-controls" onclick="event.stopPropagation()">
              <button type="button" class="icon-btn trip-edit-btn" title="Edit trip name and color" onclick="openTripEditor(${trip.id})">✏️</button>
              <button type="button" class="money-pill budget-click budget-pill-btn" style="background:${theme.soft};color:${theme.text}" onclick="editTripBudget(${trip.id})" title="Click to edit total budget">$${trip.budget}</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="modal ${editorTrip ? 'open' : ''}">${editorTrip ? `<div class="modal-content compact-modal"><div class="between"><h2 style="margin:0">Edit Trip</h2><button class="icon-btn" onclick="closeTripEditor()">✕</button></div><div class="stack space-top"><div><label class="label">Trip name</label><input class="input" value="${escapeHtml(state.editTripDraft.name)}" oninput="updateTripEditField('name', this.value)"></div><div><label class="label">Tab color</label><div class="row color-swatches">${tripColors.map(c => `<button class="swatch ${state.editTripDraft.color===c?'active':''}" style="background:${colorMap[c].solid}" onclick="updateTripEditField('color', '${c}'); saveAndRender()"></button>`).join('')}</div></div><div class="row"><button class="btn btn-primary" onclick="saveTripEdit()">Save Changes</button><button class="btn btn-secondary" onclick="closeTripEditor()">Cancel</button></div></div></div>` : ''}</div>`;
}

function searchPage() {
  const results = state.searchResults.length ? state.searchResults : filteredDestinations();
  const dest = selectedDestination();
  return `
    <div class="section-title"><h1>Search Destinations</h1><p>  </p></div>
    <div class="card"><div class="search-grid">
      <input id="destination-search" class="input" autocomplete="off" placeholder="Search cities or countries" value="${escapeHtml(state.destinationSearch)}" onkeydown="if(event.key==='Enter'){applySearch()}">
      <select class="select" onchange="state.budgetFilter=this.value; applySearch()"><option value="all" ${state.budgetFilter==='all'?'selected':''}>All budgets</option><option value="low" ${state.budgetFilter==='low'?'selected':''}>Low budget</option><option value="medium" ${state.budgetFilter==='medium'?'selected':''}>Medium budget</option><option value="high" ${state.budgetFilter==='high'?'selected':''}>High budget</option></select>
      <select class="select" onchange="state.weatherFilter=this.value; applySearch()"><option value="all" ${state.weatherFilter==='all'?'selected':''}>All weather</option><option value="warm" ${state.weatherFilter==='warm'?'selected':''}>Warm</option><option value="mild" ${state.weatherFilter==='mild'?'selected':''}>Mild</option><option value="cool" ${state.weatherFilter==='cool'?'selected':''}>Cool</option></select>
      <select class="select" onchange="state.activityFilter=this.value; applySearch()"><option value="all" ${state.activityFilter==='all'?'selected':''}>All activities</option><option value="Beach" ${state.activityFilter==='Beach'?'selected':''}>Beach</option><option value="Food" ${state.activityFilter==='Food'?'selected':''}>Food</option><option value="Museums" ${state.activityFilter==='Museums'?'selected':''}>Museums</option><option value="Sightseeing" ${state.activityFilter==='Sightseeing'?'selected':''}>Sightseeing</option><option value="Shopping" ${state.activityFilter==='Shopping'?'selected':''}>Shopping</option><option value="Culture" ${state.activityFilter==='Culture'?'selected':''}>Culture</option><option value="Nature" ${state.activityFilter==='Nature'?'selected':''}>Nature</option></select>
      <button class="btn btn-primary" onclick="applySearch()">Search</button>
    </div><div class="row space-top"><button class="btn btn-secondary" onclick="clearFilters()">Clear Filters</button></div></div>
    <div class="card space-top"><h3>Popular destinations</h3><div class="row space-top">${popularDestinations.map(p => `<button class="btn btn-secondary" onclick="state.destinationSearch='${escapeHtml(p)}'; applySearch()">${escapeHtml(p)}</button>`).join('')}</div></div>
    <div class="grid-2 space-top">${results.map(dest => {
      const alreadySaved = state.savedPlaces.some(place => place.location.toLowerCase() === String(dest.name).toLowerCase());
      const image = dest.image || DEFAULT_DEST_IMAGE;
      return `<div class="card destination-card"><img src="${escapeHtml(image)}" class="result-image" alt="${escapeHtml(dest.name)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'"><div class="space-top between"><div><h3>${escapeHtml(dest.flag)} ${escapeHtml(dest.name)}</h3><div class="muted small">Average vacation cost: $${Number(dest.averageCost || 0).toLocaleString()}</div></div><div class="money-pill">${escapeHtml(dest.weather || 'Mild')}</div></div><div class="space-top"><div class="small"><strong>Top attractions</strong></div><div class="list space-top">${(dest.attractions || []).map(a => `<div class="small muted">• ${escapeHtml(a)}</div>`).join('')}</div></div><div class="row space-top"><button class="btn btn-secondary" onclick='openDestination(${JSON.stringify(dest.id)})'>View Details</button><button class="btn ${alreadySaved ? 'btn-secondary' : 'btn-ghost'}" onclick='addSavedPlaceFromDestination(${JSON.stringify(dest.id)})'>${alreadySaved ? 'Saved ✓' : 'Save to Saved Trips'}</button></div></div>`;
    }).join('')}</div>
    <div class="modal ${dest ? 'open' : ''}">${dest ? `<div class="modal-content"><div class="between"><div><h2 style="margin:0">Destination Details</h2><p class="muted">${escapeHtml(dest.flag)} ${escapeHtml(dest.name)}</p></div><button class="icon-btn" onclick="closeDestination()">✕</button></div><img src="${escapeHtml(dest.image || DEFAULT_DEST_IMAGE)}" class="detail-image" alt="${escapeHtml(dest.name)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'"><div class="grid-2 space-top"><div class="stat"><div class="small muted">Best time to visit</div><div class="space-top"><strong>${escapeHtml(dest.bestTime || 'Year-round')}</strong></div></div><div class="stat"><div class="small muted">Estimated budget</div><div class="space-top"><strong>$${Number(dest.averageCost || 0).toLocaleString()}</strong></div></div></div><div class="space-top"><div class="small"><strong>Top attractions</strong></div><div class="row space-top">${(dest.attractions || []).map(a => `<span class="tag">${escapeHtml(a)}</span>`).join('')}</div></div><div class="row space-top"><button class="btn btn-primary" onclick="saveTripFromDestination()">Save Trip</button><button class="btn btn-secondary" onclick='addFavorite(${JSON.stringify(dest.id)})'>Add to Favorites</button><button class="btn btn-ghost" onclick="closeDestination()">Cancel</button></div></div>` : ''}</div>
  `;
}

function itineraryCalendar(trip) {
  const dates = getTripDates(trip);
  const blockedLabels = new Set(['arrival and exploration','sightseeing and experiences','final day plans']);
  const grouped = dates.map((date) => ({
    date,
    label: tripDayLabel(trip, date),
    items: trip.itinerary.filter(item => item.date === date && !blockedLabels.has(String(item.activity || '').trim().toLowerCase())).sort((a,b) => (a.time || '').localeCompare(b.time || ''))
  }));
  const topPhotos = [trip.image || DEFAULT_DEST_IMAGE, 'itinerary-reference(1).jpg'].filter(Boolean);
  return `
    <section id="section-itinerary" class="itinerary-board">
      <div class="itinerary-header-card">
        <div>
          <div class="itinerary-kicker">Travel itinerary</div>
          <h3>Itinerary</h3>
          <p class="muted">Plan each day of your trip in standard time, grouped by Day 1, Day 2, and more.</p>
        </div>
        <div class="itinerary-mini-photos">
          ${topPhotos.map((src, idx) => `<div class="polaroid ${idx % 2 ? 'tilt-right' : 'tilt-left'}"><img src="${escapeHtml(src)}" alt="Trip photo"></div>`).join('')}
        </div>
      </div>

      <div class="card itinerary-add-card">
        <div class="grid-3">
          <div><label class="label">Activity</label><input id="itinerary-activity" class="input" autocomplete="off" placeholder="Airport arrival"></div>
          <div><label class="label">Trip day</label><select id="itinerary-date" class="select">${tripDateOptions(trip, state.itineraryForm.date || trip.startDate)}</select></div>
          <div><label class="label">Time</label><input id="itinerary-time" class="input" type="time" autocomplete="off"></div>
        </div>
        <div class="space-top"><button class="btn btn-primary" onclick="addItinerary()">Add Activity</button></div>
      </div>

      <div class="itinerary-days">
        ${grouped.map((group, idx) => `
          <div class="itinerary-day-row">
            <div class="day-photo-column">
              <div class="polaroid tall ${idx % 2 ? 'tilt-right' : 'tilt-left'}">
                <img src="${escapeHtml(trip.image || destinations[idx % destinations.length].image)}" alt="${escapeHtml(trip.destination)}">
              </div>
            </div>
            <div class="day-timeline-column">
              <div class="day-marker"></div>
              <div class="day-line"></div>
            </div>
            <div class="day-content-column">
              <div class="day-header">
                <div class="day-label">${group.label}</div>
                <div class="day-date">${formatDate(group.date)}</div>
              </div>
              ${group.items.length ? group.items.map(item => `
                <div class="day-event">
                  <div class="day-event-time">${formatStandardTime(item.time)}</div>
                  <div class="day-event-body">
                    <input class="inline-input itinerary-title" value="${escapeHtml(item.activity)}" onchange="updateItineraryItem(${item.id}, 'activity', this.value)">
                    <div class="calendar-edit-row">
                      <select class="select compact" onchange="updateItineraryItem(${item.id}, 'date', this.value)">${tripDateOptions(trip, item.date)}</select>
                      <input class="input compact" type="time" value="${escapeHtml(item.time)}" onchange="updateItineraryItem(${item.id}, 'time', this.value)">
                      <button class="icon-btn" onclick="removeItinerary(${item.id})">🗑️</button>
                    </div>
                  </div>
                </div>`).join('') : `<div class="muted small day-empty">No activities added for ${group.label.toLowerCase()} yet.</div>`}
            </div>
          </div>`).join('')}
      </div>
    </section>`;
}

function budgetSection(trip) {
  const totals = budgetTotals(trip);
  return `
    <section id="section-budget" class="card budget-section-card">
      <div class="between budget-section-top">
        <div>
          <h3>Budget Tracker</h3>
          <div class="muted">Keep your categories, goals, and saved amounts organized in one place.</div>
        </div>
        <div class="stat-mini">${trip.flag} ${escapeHtml(trip.destination)}</div>
      </div>
      <div class="budget-hero-row">
        <div class="budget-place-card">
          <img class="budget-place-image" src="${escapeHtml(trip.image || DEFAULT_DEST_IMAGE)}" alt="${escapeHtml(trip.destination)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'">
          <div class="budget-place-overlay">
            <div class="trip-badge">${trip.flag} ${escapeHtml(trip.destination)}</div>
            <div class="budget-place-name">${escapeHtml(trip.name)}</div>
          </div>
        </div>
        <div class="budget-wheel-card">
          ${budgetWheel(trip)}
          <div class="row space-top budget-header-row">
            <div class="money-inline"><strong>Total budget goal:</strong> <span class="budget-click" onclick="editTripBudget(${trip.id})">$${trip.budget}</span></div>
            <div class="money-inline"><strong>Money Saved:</strong> $${totals.tracked}</div>
          </div>
        </div>
      </div>
      <div class="budget-simple-form space-top">
        <div><label class="label">Category</label><input id="category-name" class="input" autocomplete="off" placeholder="Flights"></div>
        <div><label class="label">Goal</label><input id="category-goal" class="input" type="number" autocomplete="off" placeholder="500"></div>
        <div style="display:flex;align-items:end"><button class="btn btn-primary" onclick="addBudgetCategory()">Add Category</button></div>
      </div>
      <div class="list space-top">${trip.budgetCategories.map(item => `
        <div class="list-item budget-list-item category-editor-row colorful-category-card">
          <div class="category-main">
            <div class="row between"><strong>${escapeHtml(item.name)}</strong><div class="row"><button class="btn btn-secondary compact-btn" onclick="editBudgetCategory(${item.id})">Rename</button><button class="icon-btn" onclick="removeBudgetCategory(${item.id})">🗑️</button></div></div>
            <div class="budget-editor-grid space-top">
              <div><label class="label">Money Saved</label><input class="input" type="number" value="${item.amount}" onchange="setBudgetCategoryValue(${item.id}, 'amount', this.value)"></div>
              <div><label class="label">Goal</label><input class="input" type="number" value="${item.goal || 0}" onchange="setBudgetCategoryValue(${item.id}, 'goal', this.value)"></div>
              <div><label class="label">Add or subtract</label><input id="delta-${item.id}" class="input" type="number" placeholder="50"></div>
              <div class="category-change-buttons"><button class="btn btn-secondary compact-btn" onclick="applyBudgetCategoryDelta(${item.id}, 1)">Add</button><button class="btn btn-secondary compact-btn" onclick="applyBudgetCategoryDelta(${item.id}, -1)">Subtract</button></div>
            </div>
          </div>
        </div>`).join('') || '<div class="muted small">No budget categories yet.</div>'}</div>
    </section>`;
}

function packingSection(trip) {
  return `
    <div class="card"><h3>Packing List</h3><div class="row space-top"><input id="packing-item" class="input" autocomplete="off" placeholder="Add a packing item"><button class="btn btn-primary" onclick="addPacking()">Add</button></div><div class="list space-top">${trip.packing.map(item => `<div class="list-item"><div class="row"><input type="checkbox" ${item.done ? 'checked' : ''} onchange="togglePacking(${item.id})"><span class="${item.done ? 'checked-text' : ''}">${escapeHtml(item.text)}</span></div><div class="row"><button class="btn btn-secondary compact-btn" onclick="editPacking(${item.id})">Edit</button><button class="icon-btn" onclick="removePacking(${item.id})">🗑️</button></div></div>`).join('') || '<div class="muted small">No packing items yet.</div>'}</div></div>`;
}

function tripOverviewPage() {
  const trip = currentTrip();
  if (!trip) return `<div class="empty-state"><h3>No trip selected</h3><div class="space-top"><button class="btn btn-primary" onclick="setPage('myTrips')">Go to My Trips</button></div></div>`;
  const theme = colorMap[trip.color] || colorMap.slate;
  const totals = budgetTotals(trip);
  return `
    <div class="between section-title-row"><div class="section-title"><h1>Trip Details</h1><p>Your trip overview, itinerary, budget, notes, and packing list all live on one page and autosave as you go.</p></div><button class="btn btn-secondary" onclick="downloadTripDetails(${trip.id})">Download Trip Details</button></div>
    <div class="hero-trip" id="section-trip-details" style="--trip-solid:${theme.solid};--trip-soft:${theme.soft}">${destinationCardImage(trip)}<div class="hero-trip-overlay"><div class="trip-badge">${escapeHtml(trip.flag)} ${escapeHtml(trip.destination)}</div><h2>${escapeHtml(trip.name)}</h2><p>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)} • Budget $${trip.budget}</p></div></div>
    <div class="grid-4 space-top">
      <div class="stat"><div class="small muted">Destination</div><div class="space-top"><strong>${escapeHtml(trip.destination)}</strong></div></div>
      <div class="stat"><div class="small muted">Dates</div><div class="space-top"><strong>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</strong></div></div>
      <div class="stat"><div class="small muted">Budget goal</div><div class="space-top"><strong class="budget-click" onclick="editTripBudget(${trip.id})">$${trip.budget}</strong></div></div>
      <div class="stat"><div class="small muted">Money Saved</div><div class="space-top"><strong>$${totals.tracked}</strong></div></div>
    </div>
    <div class="tabs-row space-top sticky-tabs">
      <button class="tab-pill tab-btn" onclick="scrollToSection('section-trip-details')">Trip Details</button>
      <button class="tab-pill tab-btn" onclick="scrollToSection('section-itinerary')">Itinerary</button>
      <button class="tab-pill tab-btn" onclick="scrollToSection('section-budget')">Budget</button>
      <button class="tab-pill tab-btn" onclick="scrollToSection('section-notes')">Notes</button>
      <button class="tab-pill tab-btn" onclick="scrollToSection('section-packing')">Packing List</button>
    </div>
    <div class="space-top">${itineraryCalendar(trip)}</div>
    <div class="space-top">${budgetSection(trip)}</div>
    <div class="grid-2 space-top">
      <div class="card" id="section-notes"><h3>Notes</h3><textarea id="trip-notes" class="textarea space-top" placeholder="Write notes for this trip" oninput="updateTripNotes(this.value)">${escapeHtml(trip.notes)}</textarea></div>
      <div id="section-packing">${packingSection(trip)}</div>
    </div>`;
}

function budgetPage() {
  if (!state.trips.length) return `<div class="section-title"><h1>Budget Tracker</h1><p>Open a trip to manage its budget categories.</p></div><div class="empty-state"><h3>No trips yet</h3><p class="muted">Create a trip first to start tracking your budget.</p><div class="space-top"><button class="btn btn-primary" onclick="setPage('createTrip')">Create Trip</button></div></div>`;
  return `
    <div class="between"><div class="section-title"><h1>Budget Tracker</h1><p> </p></div></div>
    <div class="grid-2 trip-card-grid budget-trip-grid">
      ${state.trips.map(cardTrip => {
        const theme = colorMap[cardTrip.color] || colorMap.slate;
        const totals = budgetTotals(cardTrip);
        return `<div class="card trip-card trip-card-button" onclick="openBudgetTrip(${cardTrip.id})" role="button" tabindex="0" style="border-top: 8px solid ${theme.solid}">
          <img src="${escapeHtml(cardTrip.image || DEFAULT_DEST_IMAGE)}" class="result-image" alt="${escapeHtml(cardTrip.destination)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'">
          <div class="trip-card-title space-top">
            <div class="trip-card-main">
              <h3>${escapeHtml(cardTrip.flag)} ${escapeHtml(cardTrip.name)}</h3>
              <p class="muted">${escapeHtml(cardTrip.destination)}</p>
              <div class="space-top small muted">${formatDate(cardTrip.startDate)} - ${formatDate(cardTrip.endDate)}</div>
            </div>
            <div class="trip-card-controls" onclick="event.stopPropagation()">
              <button type="button" class="money-pill budget-pill-btn" style="background:${theme.soft};color:${theme.text}" onclick="editTripBudget(${cardTrip.id})">$${cardTrip.budget}</button>
            </div>
          </div>
          <div class="space-top small"><strong>Money Saved:</strong> $${totals.tracked}</div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function budgetDetailsPage() {
  const trip = currentTrip();
  if (!trip) return `<div class="empty-state"><h3>No trip selected</h3><div class="space-top"><button class="btn btn-primary" onclick="setPage('budget')">Back to Budget Tracker</button></div></div>`;
  return `
    <div class="between"><div class="section-title"><h1>${escapeHtml(trip.name)} Budget</h1><p>Track this trip's budget only.</p></div><button class="btn btn-secondary" onclick="setPage('budget')">Back to All Budgets</button></div>
    <div class="space-top">${budgetSection(trip)}</div>
  `;
}

function savedPlacesPage() {
  const dest = selectedDestination();
  return `
    <div class="section-title"><h1>Saved Trips</h1><p>  </p></div>
    <div class="grid-2">${state.savedPlaces.map(place => `<div class="card destination-card"><img src="${escapeHtml(place.image || DEFAULT_DEST_IMAGE)}" class="result-image" alt="${escapeHtml(place.location)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'"><div class="space-top between"><div><h3>${escapeHtml(place.flag || '🌍')} ${escapeHtml(place.location)}</h3><div class="muted small">Average vacation cost: $${Number(place.averageCost || 0).toLocaleString()}</div></div><div class="money-pill">${escapeHtml(place.weather || 'Mild')}</div></div><div class="space-top"><div class="small"><strong>Saved attractions</strong></div><div class="list space-top">${place.attractions.map(a => `<div class="small muted">• ${escapeHtml(a)}</div>`).join('') || '<div class="small muted">No attractions saved.</div>'}</div></div><div class="row space-top"><button class="btn btn-secondary compact-btn" onclick="openSavedPlaceOverview(${place.id})">View Overview</button><button class="btn btn-primary compact-btn" onclick="createTripFromSavedPlace(${place.id})">Create Trip</button><button class="btn btn-danger compact-btn" onclick="removeSavedPlace(${place.id})">Delete</button></div></div>`).join('') || '<div class="empty-state">No saved places yet.</div>'}</div>
    <div class="modal ${dest ? 'open' : ''}">${dest ? `<div class="modal-content"><div class="between"><div><h2 style="margin:0">Destination Details</h2><p class="muted">${escapeHtml(dest.flag)} ${escapeHtml(dest.name)}</p></div><button class="icon-btn" onclick="closeDestination()">✕</button></div><img src="${escapeHtml(dest.image || DEFAULT_DEST_IMAGE)}" class="detail-image" alt="${escapeHtml(dest.name)}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}'"><div class="grid-2 space-top"><div class="stat"><div class="small muted">Best time to visit</div><div class="space-top"><strong>${escapeHtml(dest.bestTime || 'Year-round')}</strong></div></div><div class="stat"><div class="small muted">Estimated budget</div><div class="space-top"><strong>$${Number(dest.averageCost || 0).toLocaleString()}</strong></div></div></div><div class="space-top"><div class="small"><strong>Top attractions</strong></div><div class="row space-top">${(dest.attractions || []).map(a => `<span class="tag">${escapeHtml(a)}</span>`).join('')}</div></div><div class="row space-top"><button class="btn btn-primary" onclick="saveTripFromDestination()">Create Trip</button><button class="btn btn-ghost" onclick="closeDestination()">Close</button></div></div>` : ''}</div>`;
}

function pageContent() {
  switch (state.currentPage) {
    case 'createTrip': return createTripPage();
    case 'myTrips': return myTripsPage();
    case 'search': return searchPage();
    case 'tripOverview': return tripOverviewPage();
    case 'budget': return budgetPage();
    case 'budgetDetails': return budgetDetailsPage();
    case 'saved': return savedPlacesPage();
    case 'scrapbook': return scrapbookPage();
    default: return homePage();
  }
}

function appLayout() {
  return `
  <div class="layout">
    <aside class="sidebar"><h2 class="travel-brand"><span class="travel-globe"></span><span>TripSphere</span></h2><p>Your World, In One Place</p><div class="nav"><button class="${state.currentPage==='home'?'active':''}" onclick="setPage('home')">Home</button><button class="${state.currentPage==='createTrip'?'active':''}" onclick="setPage('createTrip')">Create Trip</button><button class="${state.currentPage==='myTrips'?'active':''}" onclick="setPage('myTrips')">My Trips</button><button class="${state.currentPage==='search'?'active':''}" onclick="setPage('search')">Search Destinations</button><button class="${state.currentPage==='budget'?'active':''}" onclick="setPage('budget')">Budget Tracker</button><button class="${state.currentPage==='saved'?'active':''}" onclick="setPage('saved')">Saved Places</button><button class="${state.currentPage==='scrapbook'?'active':''}" onclick="setPage('scrapbook')">Scrapbook</button></div></aside>
    <main class="main"><div class="topbar"><div class="mobile-nav"><button class="btn btn-secondary" onclick="setPage('home')">Home</button><button class="btn btn-secondary" onclick="setPage('createTrip')">Create Trip</button><button class="btn btn-secondary" onclick="setPage('myTrips')">My Trips</button><button class="btn btn-secondary" onclick="setPage('search')">Search</button><button class="btn btn-secondary" onclick="setPage('budget')">Budget</button><button class="btn btn-secondary" onclick="setPage('saved')">Saved</button><button class="btn btn-secondary" onclick="setPage('scrapbook')">Scrapbook</button></div><div></div><div class="topbar-right"><button class="profile-icon-btn" onclick="toggleProfileMenu()" aria-label="Open profile settings">👤</button></div></div>${profileModal()}${pageContent()}</main>
  </div>`;
}

function render() {
  app.innerHTML = `<div class="page">${state.isLoggedIn ? appLayout() : welcomeScreen()}</div>`;
  hydrateInputs();
}

function hydrateInputs() {
  if (!state.isLoggedIn) {
    const pairs = [
      ['auth-fullName', state.authForm.fullName],
      ['auth-username', state.authForm.username],
      ['auth-email', state.authForm.email],
      ['auth-password', state.authForm.password]
    ];
    pairs.forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value || ''; });
    return;
  }
  const tripPairs = [
    ['trip-name', state.tripForm.name], ['trip-destination', state.tripForm.destination], ['trip-startDate', state.tripForm.startDate], ['trip-endDate', state.tripForm.endDate], ['trip-budget', state.tripForm.budget]
  ];
  tripPairs.forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value || ''; });
  const endEl = document.getElementById('trip-endDate');
  if (endEl && state.tripForm.startDate) endEl.min = state.tripForm.startDate;
}

window.saveAndRender = saveAndRender;
window.switchAuth = switchAuth;
window.handleAuth = handleAuth;
window.togglePasswordVisibility = togglePasswordVisibility;
window.updateTripField = updateTripField;
window.createTrip = createTrip;
window.setPage = setPage;
window.openTrip = openTrip;
window.openBudgetTrip = openBudgetTrip;
window.openDestination = openDestination;
window.applySearch = applySearch;
window.clearFilters = clearFilters;
window.closeDestination = closeDestination;
window.saveTripFromDestination = saveTripFromDestination;
window.addSavedPlaceFromDestination = addSavedPlaceFromDestination;
window.addFavorite = addFavorite;
window.updateTripColor = updateTripColor;
window.updateTripNotes = updateTripNotes;
window.addItinerary = addItinerary;
window.removeItinerary = removeItinerary;
window.updateItineraryItem = updateItineraryItem;
window.addPacking = addPacking;
window.togglePacking = togglePacking;
window.editPacking = editPacking;
window.removePacking = removePacking;
window.addBudgetCategory = addBudgetCategory;
window.editBudgetCategory = editBudgetCategory;
window.removeBudgetCategory = removeBudgetCategory;
window.updateSavedMoney = updateSavedMoney;
window.toggleProfileMenu = toggleProfileMenu;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.deleteProfile = deleteProfile;
window.logout = logout;
window.editSavedPlace = editSavedPlace;
window.removeSavedPlace = removeSavedPlace;
window.openSavedPlaceOverview = openSavedPlaceOverview;
window.createTripFromSavedPlace = createTripFromSavedPlace;
window.createScrapbook = createScrapbook;
window.openScrapbook = openScrapbook;
window.backToScrapbooks = backToScrapbooks;
window.deleteScrapbook = deleteScrapbook;
window.addScrapbookEntry = addScrapbookEntry;
window.deleteScrapbookEntry = deleteScrapbookEntry;
window.quickTripColor = function(id, color) { const trip = state.trips.find(t => t.id === id); if (!trip) return; trip.color = color; saveAndRender(); };
window.openTripEditor = openTripEditor;
window.closeTripEditor = closeTripEditor;
window.updateTripEditField = updateTripEditField;
window.saveTripEdit = saveTripEdit;
window.editTripBudget = editTripBudget;

render();

window.scrollToSection = scrollToSection;
window.setBudgetCategoryValue = setBudgetCategoryValue;
window.applyBudgetCategoryDelta = applyBudgetCategoryDelta;
window.downloadTripDetails = downloadTripDetails;
window.editItinerarySchedule = editItinerarySchedule;

