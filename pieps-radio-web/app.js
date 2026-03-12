// ------->>>>Pieps Radio - vanilla JS web version<<<<-------

// ------->>>>App state<<<<-------
const state = {
  stations:       [],
  currentStation: null,
  isPlaying:      false,
  volume:         0.2,
  isMuted:        false,
  isLoading:      false,
  isError:        false,
  searchQuery:    '',
};

// ------->>>>DOM references<<<<-------
const app           = document.getElementById('app');
const stationList   = document.getElementById('station-list');
const stationCount  = document.getElementById('station-count');
const searchInput   = document.getElementById('search-input');
const clearBtn      = document.getElementById('clear-btn');
const playBtn       = document.getElementById('play-btn');
const muteBtn       = document.getElementById('mute-btn');
const volSlider     = document.getElementById('vol-slider');
const volFill       = document.getElementById('vol-fill');
const liveBadge     = document.getElementById('live-badge');
const liveTrackName = document.getElementById('live-track-name');
const npNameRight   = document.getElementById('np-name-right');
const trackDisplay  = document.getElementById('track-display');
const bgGlow        = document.getElementById('bg-glow');
const mascotWrap    = document.getElementById('mascot-wrap');
const mascotRing    = document.getElementById('mascot-ring');
const audio         = document.getElementById('audio');

// ------->>>>SVG icon strings<<<<-------
const ICONS = {
  play:    `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  pause:   `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1.5"/><rect x="15" y="3" width="4" height="18" rx="1.5"/></svg>`,
  volHigh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  volLow:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  muted:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  radio:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="9" width="18" height="13" rx="2"/><circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="15.5" y1="12" x2="15.5" y2="18"/></svg>`,
};

const BARS_HTML = `<div class="bars small"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></div>`;

// ------->>>>Theme switcher - persist choice in localStorage<<<<-------
const savedTheme = localStorage.getItem('pieps-theme') || 'blue';
applyTheme(savedTheme);

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    localStorage.setItem('pieps-theme', btn.dataset.theme);
  });
});

function applyTheme(theme) {
  app.className = `app theme-${theme}`;
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
}

// ------->>>>Fetch stations from radio-browser.info API<<<<-------
let fetchTimeout = null;

async function fetchStations(search = '') {
  state.isLoading = true;
  state.isError   = false;
  renderList();

  try {
    const params = new URLSearchParams({
      limit:      '80',
      order:      'votes',
      reverse:    'true',
      hidebroken: 'true',
    });
    if (search) params.set('name', search);

    const res = await fetch(
      `https://de1.api.radio-browser.info/json/stations/search?${params}`,
      { headers: { 'User-Agent': 'PiepsMusicPlayer/1.0' } }
    );
    if (!res.ok) throw new Error('API error');
    state.stations = await res.json();
  } catch {
    state.isError  = true;
    state.stations = [];
  } finally {
    state.isLoading = false;
    renderList();
  }
}

// ------->>>>Search input with 450ms debounce - same as original<<<<-------
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  state.searchQuery = q;
  clearBtn.style.visibility = q ? 'visible' : 'hidden';
  clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => fetchStations(q), 450);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearBtn.style.visibility = 'hidden';
  fetchStations('');
});

// ------->>>>Station list click - single delegated handler set once, never inside renderList<<<<-------
stationList.addEventListener('click', (e) => {
  const item = e.target.closest('.track-item');
  if (!item) return;
  const station = state.stations[parseInt(item.dataset.idx, 10)];
  if (!station) return;
  // ------->>>>clicking the active station toggles play/pause<<<<-------
  if (state.currentStation?.stationuuid === station.stationuuid) {
    togglePlay();
  } else {
    playStation(station);
  }
});

// ------->>>>Render the station list into the DOM<<<<-------
function renderList() {
  if (state.isLoading) {
    stationList.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <p>Sender werden geladen…</p>
      </div>`;
    stationCount.textContent = '';
    return;
  }

  if (state.isError) {
    stationList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>Verbindung fehlgeschlagen</p>
        <button class="retry-btn" id="retry-btn">Erneut versuchen</button>
      </div>`;
    stationCount.textContent = '';
    document.getElementById('retry-btn')?.addEventListener('click', () => fetchStations(state.searchQuery));
    return;
  }

  if (state.stations.length === 0) {
    stationList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>Keine Sender gefunden</p>
      </div>`;
    stationCount.textContent = '';
    return;
  }

  stationCount.textContent = state.stations.length;

  stationList.innerHTML = state.stations.map((station, idx) => {
    const isActive = state.currentStation?.stationuuid === station.stationuuid;
    const meta     = [station.country, station.bitrate > 0 ? `${station.bitrate}kbps` : ''].filter(Boolean).join(' · ');
    const iconHtml = station.favicon
      ? `<img src="${esc(station.favicon)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">${ICONS.radio}`
      : ICONS.radio;

    return `
      <div class="track-item${isActive ? ' playing' : ''}" data-idx="${idx}">
        <div class="station-icon">${iconHtml}</div>
        <div class="track-info">
          <span class="track-name">${esc(station.name)}</span>
          ${meta ? `<span class="station-meta">${esc(meta)}</span>` : ''}
        </div>
        ${isActive && state.isPlaying ? BARS_HTML : ''}
      </div>`;
  }).join('');
}

// ------->>>>Play a station and update all UI<<<<-------
function playStation(station) {
  state.currentStation = station;
  state.isPlaying      = true;
  audio.src    = station.url_resolved || station.url;
  audio.volume = state.isMuted ? 0 : state.volume;

  audio.play().catch(() => {
    // ------->>>>fallback to non-resolved URL if the resolved stream fails<<<<-------
    audio.src = station.url;
    audio.play().catch(() => {
      state.isPlaying = false;
      updateAll();
    });
  });

  updateAll();
}

function togglePlay() {
  if (!state.currentStation) return;
  if (state.isPlaying) {
    audio.pause();
    state.isPlaying = false;
  } else {
    audio.play().catch(() => {});
    state.isPlaying = true;
  }
  updateAll();
}

// ------->>>>Mute toggle<<<<-------
function toggleMute() {
  state.isMuted = !state.isMuted;
  audio.volume  = state.isMuted ? 0 : state.volume;
  updateVolUI();
}

// ------->>>>Volume slider<<<<-------
volSlider.addEventListener('input', () => {
  state.volume = parseFloat(volSlider.value);
  audio.volume = state.volume;
  if (state.volume > 0) state.isMuted = false;
  updateVolUI();
});

function updateVolUI() {
  const pct       = state.isMuted ? 0 : state.volume * 100;
  volFill.style.width = pct + '%';
  volSlider.value = state.isMuted ? 0 : state.volume;
  muteBtn.innerHTML = (state.isMuted || state.volume === 0)
    ? ICONS.muted
    : state.volume > 0.5 ? ICONS.volHigh : ICONS.volLow;
}

// ------->>>>Update all UI sections at once<<<<-------
function updateAll() {
  updatePlayerBar();
  updateMainView();
  renderList();
}

// ------->>>>Player bar<<<<-------
function updatePlayerBar() {
  playBtn.innerHTML = state.isPlaying ? ICONS.pause : ICONS.play;

  if (state.currentStation) {
    liveBadge.classList.add('visible');
    liveTrackName.textContent = state.currentStation.name;
    npNameRight.textContent   = state.currentStation.name;
  } else {
    liveBadge.classList.remove('visible');
    liveTrackName.textContent = 'Kein Sender ausgewählt';
    npNameRight.textContent   = '—';
  }
}

// ------->>>>Main view display - mascot + station info<<<<-------
function updateMainView() {
  // ------->>>>glow + mascot float animation when playing<<<<-------
  bgGlow.classList.toggle('active', state.isPlaying);
  mascotWrap.classList.toggle('playing', state.isPlaying);
  mascotRing.style.display = state.isPlaying ? '' : 'none';

  if (!state.currentStation) {
    // ------->>>>welcome screen when nothing is selected<<<<-------
    trackDisplay.innerHTML = `
      <div class="welcome">
        <h1 class="welcome-title">Pieps Radio</h1>
        <p class="welcome-hint">Wähle einen Sender aus der Liste</p>
        <div class="shortcuts">
          <span>Space · Play/Pause</span>
          <span>M · Mute</span>
        </div>
      </div>`;
    return;
  }

  const s    = state.currentStation;
  const tags = s.tags ? s.tags.split(',').slice(0, 3).filter(Boolean).join(' · ') : '';

  trackDisplay.innerHTML = `
    <div class="track-display">
      <div class="radio-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="9" width="18" height="13" rx="2"/>
          <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
          <line x1="12" y1="12" x2="12" y2="18"/>
          <line x1="15.5" y1="12" x2="15.5" y2="18"/>
        </svg>
        Radio
      </div>
      ${s.country ? `<p class="artist">${esc(s.country)}</p>` : ''}
      <h1 class="title">${esc(s.name)}</h1>
      ${tags ? `<p class="radio-tags-line">${esc(tags)}</p>` : ''}
      <div class="badge${state.isPlaying ? '' : ' paused'}">
        <span class="badge-dot"></span>
        ${state.isPlaying ? 'Live Radio' : 'Pausiert'}
      </div>
    </div>`;
}

// ------->>>>Button listeners<<<<-------
playBtn.addEventListener('click', togglePlay);
muteBtn.addEventListener('click', toggleMute);

// ------->>>>Keyboard shortcuts<<<<-------
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === ' ')                  { e.preventDefault(); togglePlay(); }
  if (e.key === 'm' || e.key === 'M') toggleMute();
});

// ------->>>>Sync state when browser controls audio (e.g. media keys)<<<<-------
audio.addEventListener('play',  () => { state.isPlaying = true;  updateAll(); });
audio.addEventListener('pause', () => { state.isPlaying = false; updateAll(); });
audio.addEventListener('error', () => { state.isPlaying = false; updateAll(); });

// ------->>>>Escape HTML to prevent XSS when injecting API data into innerHTML<<<<-------
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ------->>>>Boot<<<<-------
clearBtn.style.visibility = 'hidden';
mascotRing.style.display  = 'none';
updatePlayerBar();
updateVolUI();
updateMainView();
fetchStations();
