<script setup>
// ------->>>>TrackList - sidebar with music library and radio station browser<<<<-------
import { inject, ref, computed, watch } from 'vue';
import { store } from '../store';

// ------->>>>get the shared music file list injected from App.vue<<<<-------
const tracklist = inject('musicFiles');
const emit = defineEmits(['trackSelected', 'stationSelected']);

// ------->>>>MUSIC MODE - local file search and track selection<<<<-------
const searchQuery = ref('');

// ------->>>>strip directory path and file extension to get a clean track name<<<<-------
const getTrackName = (filePath) => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1].replace(/\.[^/.]+$/, '');
};

// ------->>>>filter tracks live as the user types in the search box<<<<-------
const filteredTracks = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return tracklist.value
    .map((path, index) => ({ path, index }))
    .filter(({ path }) => !q || getTrackName(path).toLowerCase().includes(q));
});

const selectTrack = (path, index) => emit('trackSelected', path, index);

// ------->>>>RADIO MODE - fetch stations from radio-browser.info API<<<<-------
const stations = ref([]);
const radioLoading = ref(false);
const radioError = ref(false);
const radioSearch = ref('');
let fetchTimeout = null;

// ------->>>>fetch top stations or search by name - sorted by votes, broken ones hidden<<<<-------
const fetchStations = async (search = '') => {
  radioLoading.value = true;
  radioError.value = false;
  try {
    const params = new URLSearchParams({
      limit: '80',
      order: 'votes',
      reverse: 'true',
      hidebroken: 'true',
    });
    if (search) params.set('name', search);
    const res = await fetch(
      `https://de1.api.radio-browser.info/json/stations/search?${params}`,
      { headers: { 'User-Agent': 'PiepsMusicPlayer/1.0' } }
    );
    if (!res.ok) throw new Error('API error');
    stations.value = await res.json();
  } catch {
    radioError.value = true;
  } finally {
    radioLoading.value = false;
  }
};

// ------->>>>auto-load stations when switching to radio mode for the first time<<<<-------
watch(() => store.mode, (mode) => {
  if (mode === 'radio' && stations.value.length === 0 && !radioLoading.value) {
    fetchStations();
  }
});

// ------->>>>debounce radio search so we don't spam the API on every keystroke<<<<-------
watch(radioSearch, (q) => {
  clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => fetchStations(q), 450);
});

const selectStation = (station) => emit('stationSelected', station);

// ------->>>>check if this specific station is the one currently playing<<<<-------
const isStationPlaying = (station) =>
  store.mode === 'radio' &&
  store.radioStation?.stationuuid === station.stationuuid;
</script>

<template>
  <div class="sidebar">

    <!-- Mode tabs -->
    <div class="mode-tabs">
      <button
        :class="['tab', { active: store.mode === 'music' }]"
        @click="store.mode = 'music'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        Musik
      </button>
      <button
        :class="['tab', { active: store.mode === 'radio' }]"
        @click="store.mode = 'radio'; stations.length === 0 && !radioLoading && fetchStations()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8.56 2.9A7 7 0 0 1 19 9v4"/>
          <path d="M5 9A10 10 0 0 1 19.36 4"/>
          <rect x="3" y="9" width="18" height="13" rx="2"/>
          <circle cx="8.5" cy="16" r="1.5" fill="currentColor" stroke="none"/>
          <line x1="12" y1="14" x2="12" y2="18"/>
          <line x1="16" y1="14" x2="16" y2="18"/>
        </svg>
        Radio
      </button>
    </div>

    <!-- MUSIK MODE -->
    <template v-if="store.mode === 'music'">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Bibliothek</h2>
        <span class="track-count">{{ tracklist.length }}</span>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Suchen…"
          class="search-input"
          spellcheck="false"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="track-list">
        <div v-if="tracklist.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <p>Klicke auf <strong>Ordner öffnen</strong><br>um Musik zu laden</p>
        </div>

        <div v-else-if="filteredTracks.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Keine Ergebnisse</p>
        </div>

        <div
          v-for="item in filteredTracks"
          :key="item.index"
          class="track-item"
          :class="{ playing: item.index === store.currentTrackIndex && store.mode === 'music' }"
          @click="selectTrack(item.path, item.index)"
        >
          <div class="track-num">
            <span v-if="item.index !== store.currentTrackIndex || store.mode !== 'music'" class="num">{{ item.index + 1 }}</span>
            <div v-else class="bars">
              <span v-if="store.isPlaying" class="bar b1"></span>
              <span v-if="store.isPlaying" class="bar b2"></span>
              <span v-if="store.isPlaying" class="bar b3"></span>
              <svg v-if="!store.isPlaying" viewBox="0 0 24 24" fill="currentColor" class="paused-icon">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>

          <div class="track-info">
            <span class="track-name">{{ getTrackName(item.path) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- RADIO MODE -->
    <template v-else>
      <div class="sidebar-header">
        <h2 class="sidebar-title">Radio</h2>
        <span v-if="stations.length > 0" class="track-count">{{ stations.length }}</span>
      </div>

      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="radioSearch"
          type="text"
          placeholder="Sender suchen…"
          class="search-input"
          spellcheck="false"
        />
        <button v-if="radioSearch" class="clear-btn" @click="radioSearch = ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="track-list">
        <!-- Loading -->
        <div v-if="radioLoading" class="empty-state">
          <div class="spinner"></div>
          <p>Sender werden geladen…</p>
        </div>

        <!-- Error -->
        <div v-else-if="radioError" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Verbindung fehlgeschlagen</p>
          <button class="retry-btn" @click="fetchStations(radioSearch)">Erneut versuchen</button>
        </div>

        <!-- Station list -->
        <div
          v-else
          v-for="station in stations"
          :key="station.stationuuid"
          class="track-item"
          :class="{ playing: isStationPlaying(station) }"
          @click="selectStation(station)"
        >
          <div class="station-icon">
            <img
              v-if="station.favicon"
              :src="station.favicon"
              :alt="station.name"
              @error="e => e.target.style.display = 'none'"
            />
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="9" width="18" height="13" rx="2"/>
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
              <line x1="12" y1="12" x2="12" y2="18"/>
              <line x1="15.5" y1="12" x2="15.5" y2="18"/>
            </svg>
          </div>

          <div class="track-info">
            <span class="track-name">{{ station.name }}</span>
            <span class="station-meta">
              {{ station.country }}
              <template v-if="station.bitrate > 0"> · {{ station.bitrate }}kbps</template>
            </span>
          </div>

          <div v-if="isStationPlaying(station)" class="bars small">
            <span v-if="store.isPlaying" class="bar b1"></span>
            <span v-if="store.isPlaying" class="bar b2"></span>
            <span v-if="store.isPlaying" class="bar b3"></span>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
.sidebar {
  width: 275px;
  min-width: 200px;
  background: #080f1a;
  border-right: 1px solid rgba(255, 255, 255, 0.055);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

/* Mode tabs */
.mode-tabs {
  display: flex;
  padding: 8px 8px 0;
  gap: 4px;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  color: #446688;
  cursor: pointer;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  transition: color 0.15s, background 0.15s;
  letter-spacing: 0.02em;
}

.tab svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.tab:hover {
  color: #88aacc;
  background: rgba(255, 255, 255, 0.04);
}

.tab.active {
  color: var(--cs);
  background: rgba(var(--csr), 0.12);
}

/* Header */
.sidebar-header {
  padding: 12px 16px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #c0d4f0;
  flex: 1;
}

.track-count {
  font-size: 11px;
  font-weight: 600;
  color: #334466;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 7px;
  border-radius: 10px;
}

/* Search */
.search-box {
  margin: 0 10px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 7px;
  transition: border-color 0.15s;
}

.search-box:focus-within {
  border-color: rgba(var(--cpr), 0.4);
}

.search-icon {
  width: 13px;
  height: 13px;
  color: #334466;
  flex-shrink: 0;
}

.search-input {
  background: none;
  border: none;
  outline: none;
  color: #d0e4ff;
  font-size: 12px;
  padding: 8px 0;
  width: 100%;
}

.search-input::placeholder {
  color: #334466;
}

.clear-btn {
  background: none;
  border: none;
  color: #446688;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.15s;
}

.clear-btn svg {
  width: 13px;
  height: 13px;
}

.clear-btn:hover {
  color: #c0d4f0;
}

/* Track list */
.track-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2px 6px 12px;
}

.track-list::-webkit-scrollbar {
  width: 3px;
}

.track-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.track-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Empty / loading states */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #223355;
  text-align: center;
  gap: 14px;
}

.empty-state svg {
  width: 38px;
  height: 38px;
}

.empty-state p {
  font-size: 12px;
  line-height: 1.7;
}

.empty-state strong {
  color: var(--cp);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(var(--csr), 0.15);
  border-top-color: var(--cs);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  background: rgba(var(--cpr), 0.15);
  border: 1px solid rgba(var(--csr), 0.3);
  color: var(--cs);
  cursor: pointer;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.15s;
}

.retry-btn:hover {
  background: rgba(var(--cpr), 0.25);
}

/* Track item */
.track-item {
  display: flex;
  align-items: center;
  padding: 7px 8px;
  gap: 10px;
  cursor: pointer;
  border-radius: 7px;
  transition: background 0.12s;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.track-item.playing {
  background: rgba(var(--cpr), 0.14);
}

/* Track number */
.track-num {
  width: 22px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.num {
  font-size: 11px;
  color: #334466;
}

.track-item:hover .num {
  color: #6699cc;
}

/* Station icon */
.station-icon {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #334466;
}

.station-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.station-icon svg {
  width: 16px;
  height: 16px;
}

/* Bars animation */
.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 13px;
}

.bars.small {
  height: 11px;
  flex-shrink: 0;
}

.bar {
  width: 3px;
  background: var(--cs);
  border-radius: 1.5px;
  animation: barBounce 0.7s ease-in-out infinite;
  transform-origin: bottom;
}

.b1 { height: 55%; animation-delay: 0s; }
.b2 { height: 100%; animation-delay: 0.12s; }
.b3 { height: 40%; animation-delay: 0.25s; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}

.paused-icon {
  width: 11px;
  height: 11px;
  color: var(--cs);
}

/* Track info */
.track-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-name {
  font-size: 12px;
  color: #88aacc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  transition: color 0.12s;
}

.track-item:hover .track-name {
  color: #d0e4ff;
}

.track-item.playing .track-name {
  color: #e8f0ff;
  font-weight: 600;
}

.station-meta {
  font-size: 10px;
  color: #334466;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
