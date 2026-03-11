<script setup>
// ------->>>>App.vue - root component, wires together all parts of the player<<<<-------
import { ref, provide, watch, onMounted, onBeforeUnmount } from 'vue';
import { store } from './store';
import TitleBar from './components/TitleBar.vue';
import TrackList from './components/TrackList.vue';
import MainView from './components/MainView.vue';
import PlayerBar from './components/PlayerBar.vue';

// ------->>>>music file list shared down to TrackList and PlayerBar via provide/inject<<<<-------
const musicFiles = ref([]);
provide('musicFiles', musicFiles);

// ------->>>>save theme to localStorage whenever it changes<<<<-------
watch(() => store.theme, (t) => localStorage.setItem('pieps-theme', t));

const playerBarRef = ref(null);

// ------->>>>called by TrackList when the user clicks a song<<<<-------
const playSelectedTrack = (trackPath, index) => {
  playerBarRef.value.playTrack(trackPath, index);
};

// ------->>>>called by TrackList when the user clicks a radio station<<<<-------
const playSelectedStation = (station) => {
  playerBarRef.value.playStation(station);
};

// ------->>>>global keyboard shortcuts - Space, arrows, N, P, M<<<<-------
const handleKeydown = (e) => {
  if (e.target.tagName === 'INPUT') return;
  const pb = playerBarRef.value;
  if (!pb) return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      pb.togglePlay();
      break;
    case 'ArrowRight':
      e.preventDefault();
      pb.seekRelative(5);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      pb.seekRelative(-5);
      break;
    case 'n':
    case 'N':
      pb.playNextTrack();
      break;
    case 'p':
    case 'P':
      pb.playPrevTrack();
      break;
    case 'm':
    case 'M':
      pb.toggleMute();
      break;
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div :class="['app', 'theme-' + store.theme]">
    <TitleBar />
    <div class="content">
      <TrackList
        @trackSelected="playSelectedTrack"
        @stationSelected="playSelectedStation"
      />
      <MainView />
    </div>
    <PlayerBar ref="playerBarRef" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #07101a;
  color: #e8f0ff;
  user-select: none;

  /* Blue (default) */
  --cp: #1d4ed8;
  --cs: #3b82f6;
  --cl: #60a5fa;
  --cpr: 29, 78, 216;
  --csr: 59, 130, 246;
  --clr: 96, 165, 250;
  --bg-tint: #08132a;
  --c-artist: #3366cc;
}

.app.theme-purple {
  --cp: #7c3aed;
  --cs: #a855f7;
  --cl: #c084fc;
  --cpr: 124, 58, 237;
  --csr: 168, 85, 247;
  --clr: 192, 132, 252;
  --bg-tint: #120828;
  --c-artist: #7755cc;
}

.app.theme-green {
  --cp: #16a34a;
  --cs: #22c55e;
  --cl: #4ade80;
  --cpr: 22, 163, 74;
  --csr: 34, 197, 94;
  --clr: 74, 222, 128;
  --bg-tint: #082812;
  --c-artist: #22803a;
}

.app.theme-pink {
  --cp: #be185d;
  --cs: #ec4899;
  --cl: #f9a8d4;
  --cpr: 190, 24, 93;
  --csr: 236, 72, 153;
  --clr: 249, 168, 212;
  --bg-tint: #280820;
  --c-artist: #cc3399;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
