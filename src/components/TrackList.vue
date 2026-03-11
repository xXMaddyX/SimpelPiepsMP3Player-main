<script setup>
import { inject, ref, computed } from 'vue';
import { store } from '../store';

const tracklist = inject('musicFiles');
const emit = defineEmits(['trackSelected']);

const searchQuery = ref('');

const getTrackName = (filePath) => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1].replace(/\.[^/.]+$/, '');
};

const filteredTracks = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return tracklist.value
    .map((path, index) => ({ path, index }))
    .filter(({ path }) => !q || getTrackName(path).toLowerCase().includes(q));
});

const selectTrack = (path, index) => {
  emit('trackSelected', path, index);
};
</script>

<template>
  <div class="sidebar">
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
        :class="{ playing: item.index === store.currentTrackIndex }"
        @click="selectTrack(item.path, item.index)"
      >
        <div class="track-num">
          <span v-if="item.index !== store.currentTrackIndex" class="num">{{ item.index + 1 }}</span>
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

.sidebar-header {
  padding: 18px 16px 10px;
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
  border-color: rgba(29, 78, 216, 0.4);
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
  color: #c0c0e0;
}

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
  color: #1d4ed8;
}

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
  background: rgba(29, 78, 216, 0.14);
}

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

.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 13px;
}

.bar {
  width: 3px;
  background: #3b82f6;
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
  color: #3b82f6;
}

.track-info {
  flex: 1;
  min-width: 0;
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
</style>
