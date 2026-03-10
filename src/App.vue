<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue';
import TitleBar from './components/TitleBar.vue';
import TrackList from './components/TrackList.vue';
import MainView from './components/MainView.vue';
import PlayerBar from './components/PlayerBar.vue';

const musicFiles = ref([]);
provide('musicFiles', musicFiles);

const playerBarRef = ref(null);

const playSelectedTrack = (trackPath, index) => {
  playerBarRef.value.playTrack(trackPath, index);
};

// Globale Keyboard-Shortcuts
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
  <div class="app">
    <TitleBar />
    <div class="content">
      <TrackList @trackSelected="playSelectedTrack" />
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
  background: #0d0d14;
  color: #f0f0ff;
  user-select: none;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
