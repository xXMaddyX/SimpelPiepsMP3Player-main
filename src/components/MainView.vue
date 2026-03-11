<script setup>
import { computed } from 'vue';
import { store } from '../store';
import mascot from '../assets/PiepsmitTasse.png';

const hasTrack = computed(() => store.currentTrackIndex !== -1);

const parsedTrack = computed(() => {
  if (!store.currentTrackName) return { artist: null, title: '' };
  const parts = store.currentTrackName.split(' - ');
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }
  return { artist: null, title: store.currentTrackName };
});
</script>

<template>
  <div class="main-view">
    <div class="bg-glow" :class="{ active: store.isPlaying }"></div>

    <div class="content-wrapper">
      <div class="mascot-wrap" :class="{ playing: store.isPlaying }">
        <div class="ring" v-if="store.isPlaying"></div>
        <img :src="mascot" class="mascot" alt="Pieps" draggable="false" />
      </div>

      <div v-if="hasTrack" class="track-display">
        <p v-if="parsedTrack.artist" class="artist">{{ parsedTrack.artist }}</p>
        <h1 class="title">{{ parsedTrack.title }}</h1>
        <div v-if="store.isPlaying" class="badge">
          <span class="badge-dot"></span>
          Wird abgespielt
        </div>
        <div v-else class="badge paused">
          <span class="badge-dot"></span>
          Pausiert
        </div>
      </div>

      <div v-else class="welcome">
        <h1 class="welcome-title">Pieps Music Player</h1>
        <p class="welcome-hint">Wähle einen Track aus der Bibliothek</p>
        <div class="shortcuts">
          <span>Space · Play/Pause</span>
          <span>N · Nächster</span>
          <span>P · Vorheriger</span>
          <span>M · Mute</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 50% 40%, #13132a 0%, #0d0d14 65%);
  overflow: hidden;
  position: relative;
}

.bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.07) 0%, transparent 65%);
  opacity: 0;
  transition: opacity 1s ease;
  pointer-events: none;
}

.bg-glow.active {
  opacity: 1;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  z-index: 1;
  padding: 20px;
}

.mascot-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%);
  animation: ringPulse 2.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 1; }
}

.mascot {
  width: 170px;
  height: auto;
  max-height: 210px;
  object-fit: contain;
  transition: filter 0.5s, transform 0.5s;
  filter: drop-shadow(0 4px 24px rgba(124, 58, 237, 0.25));
}

.mascot-wrap.playing .mascot {
  filter: drop-shadow(0 4px 32px rgba(168, 85, 247, 0.5));
  animation: mascotFloat 3s ease-in-out infinite;
}

@keyframes mascotFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.track-display {
  text-align: center;
  max-width: 420px;
}

.artist {
  font-size: 12px;
  font-weight: 600;
  color: #7755cc;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #f0f0ff;
  line-height: 1.25;
  margin-bottom: 14px;
  word-break: break-word;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(124, 58, 237, 0.13);
  border: 1px solid rgba(168, 85, 247, 0.28);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #a855f7;
}

.badge.paused {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: #555577;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: dotBlink 1.4s ease-in-out infinite;
}

.badge.paused .badge-dot {
  animation: none;
  opacity: 0.4;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.welcome {
  text-align: center;
}

.welcome-title {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.welcome-hint {
  font-size: 13px;
  color: #444466;
  margin-bottom: 24px;
}

.shortcuts {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.shortcuts span {
  font-size: 10px;
  font-weight: 600;
  color: #333355;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}
</style>
