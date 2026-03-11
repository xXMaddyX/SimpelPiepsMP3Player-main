<script setup>
import { computed } from 'vue';
import { store } from '../store';
import mascot from '../assets/PiepsmitTasse.png';

const hasTrack = computed(() => store.currentTrackIndex !== -1);
const isRadio = computed(() => store.mode === 'radio' && store.radioStation);

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

      <!-- Radio info -->
      <div v-if="isRadio" class="track-display">
        <div class="radio-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="9" width="18" height="13" rx="2"/>
            <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="12" y1="12" x2="12" y2="18"/>
            <line x1="15.5" y1="12" x2="15.5" y2="18"/>
          </svg>
          Radio
        </div>
        <p v-if="store.radioStation.country" class="artist">{{ store.radioStation.country }}</p>
        <h1 class="title">{{ store.radioStation.name }}</h1>
        <p v-if="store.radioStation.tags" class="radio-tags-line">
          {{ store.radioStation.tags.split(',').slice(0, 3).join(' · ') }}
        </p>
        <div v-if="store.isPlaying" class="badge">
          <span class="badge-dot"></span>
          Live Radio
        </div>
        <div v-else class="badge paused">
          <span class="badge-dot"></span>
          Pausiert
        </div>
      </div>

      <!-- Music track info -->
      <div v-else-if="hasTrack" class="track-display">
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

      <!-- Welcome screen -->
      <div v-else class="welcome">
        <h1 class="welcome-title">Pieps Music Player</h1>
        <p class="welcome-hint">Wähle einen Track oder Radiosender</p>
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
  background: radial-gradient(ellipse at 50% 40%, var(--bg-tint) 0%, #07101a 65%);
  overflow: hidden;
  position: relative;
}

.bg-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(var(--cpr), 0.07) 0%, transparent 65%);
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
  background: radial-gradient(circle, rgba(var(--csr), 0.18) 0%, transparent 70%);
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
  filter: drop-shadow(0 4px 24px rgba(var(--cpr), 0.25));
}

.mascot-wrap.playing .mascot {
  filter: drop-shadow(0 4px 32px rgba(var(--csr), 0.5));
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

.radio-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--cs);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.radio-tag svg {
  width: 12px;
  height: 12px;
}

.radio-tags-line {
  font-size: 11px;
  color: #334466;
  margin-bottom: 12px;
  text-transform: lowercase;
  letter-spacing: 0.02em;
}

.artist {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-artist);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #e8f0ff;
  line-height: 1.25;
  margin-bottom: 14px;
  word-break: break-word;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(var(--cpr), 0.13);
  border: 1px solid rgba(var(--csr), 0.28);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--cs);
}

.badge.paused {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: #446688;
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
  background: linear-gradient(135deg, var(--cp) 0%, var(--cs) 50%, var(--cl) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.welcome-hint {
  font-size: 13px;
  color: #334466;
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
  color: #223355;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}
</style>
