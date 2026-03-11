<script setup>
import { ref, inject, computed, onMounted, onBeforeUnmount } from 'vue';
import { store } from '../store';

const audioRef = ref(null);
const tracklist = inject('musicFiles');
const seeking = ref(false);
const seekValue = ref(0);

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const progressPercent = computed(() =>
  store.duration ? (seekValue.value / store.duration) * 100 : 0
);

const volPercent = computed(() =>
  store.isMuted ? 0 : store.volume * 100
);

// --- Music playback ---
const playTrack = (trackPath, index) => {
  store.mode = 'music';
  store.radioStation = null;
  const audio = audioRef.value;
  audio.src = trackPath;
  audio.volume = store.isMuted ? 0 : store.volume;
  audio.play();
  store.currentTrackIndex = index;
  store.isPlaying = true;
  const parts = trackPath.replace(/\\/g, '/').split('/');
  store.currentTrackName = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
};

// --- Radio playback ---
const playStation = (station) => {
  store.mode = 'radio';
  store.radioStation = station;
  store.currentTrackName = station.name;
  store.currentTrackIndex = 0;
  store.currentTime = 0;
  store.duration = 0;
  seekValue.value = 0;
  const audio = audioRef.value;
  audio.src = station.url_resolved;
  audio.volume = store.isMuted ? 0 : store.volume;
  audio.play().catch(() => {
    // Some streams may need a retry with the non-resolved URL
    audio.src = station.url;
    audio.play().catch(() => { store.isPlaying = false; });
  });
  store.isPlaying = true;
};

const togglePlay = () => {
  if (store.currentTrackIndex === -1 && !store.radioStation) return;
  const audio = audioRef.value;
  if (store.isPlaying) {
    audio.pause();
    store.isPlaying = false;
  } else {
    audio.play();
    store.isPlaying = true;
  }
};

const playNextTrack = () => {
  if (store.mode === 'radio') return;
  if (!tracklist.value.length) return;

  if (store.repeatMode === 2) {
    audioRef.value.currentTime = 0;
    audioRef.value.play();
    return;
  }

  let nextIndex;
  if (store.shuffleMode) {
    do {
      nextIndex = Math.floor(Math.random() * tracklist.value.length);
    } while (nextIndex === store.currentTrackIndex && tracklist.value.length > 1);
  } else {
    nextIndex = store.currentTrackIndex + 1;
    if (nextIndex >= tracklist.value.length) {
      if (store.repeatMode === 1) nextIndex = 0;
      else { store.isPlaying = false; return; }
    }
  }
  playTrack(tracklist.value[nextIndex], nextIndex);
};

const playPrevTrack = () => {
  if (store.mode === 'radio') return;
  if (!tracklist.value.length) return;
  const audio = audioRef.value;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  let prevIndex = store.currentTrackIndex - 1;
  if (prevIndex < 0) prevIndex = tracklist.value.length - 1;
  if (prevIndex < 0) return;
  playTrack(tracklist.value[prevIndex], prevIndex);
};

const seekRelative = (seconds) => {
  if (store.mode === 'radio') return;
  const audio = audioRef.value;
  if (!audio) return;
  audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, store.duration));
};

const onTimeUpdate = () => {
  if (store.mode === 'radio') return;
  if (!seeking.value) {
    store.currentTime = audioRef.value.currentTime;
    seekValue.value = audioRef.value.currentTime;
  }
  store.duration = audioRef.value.duration || 0;
};

const onLoadedMetadata = () => {
  if (store.mode === 'radio') return;
  store.duration = audioRef.value.duration || 0;
};

const onEnded = () => {
  if (store.mode === 'music') playNextTrack();
};

const onSeekMousedown = () => { seeking.value = true; };

const onSeekInput = (e) => {
  seekValue.value = parseFloat(e.target.value);
};

const onSeekChange = (e) => {
  audioRef.value.currentTime = parseFloat(e.target.value);
  seekValue.value = parseFloat(e.target.value);
  seeking.value = false;
};

const onVolumeChange = (e) => {
  store.volume = parseFloat(e.target.value);
  audioRef.value.volume = store.volume;
  if (store.volume > 0) store.isMuted = false;
};

const toggleMute = () => {
  store.isMuted = !store.isMuted;
  audioRef.value.volume = store.isMuted ? 0 : store.volume;
};

const toggleShuffle = () => { store.shuffleMode = !store.shuffleMode; };
const toggleRepeat = () => { store.repeatMode = (store.repeatMode + 1) % 3; };

const repeatTitle = computed(() => {
  if (store.repeatMode === 0) return 'Kein Repeat';
  if (store.repeatMode === 1) return 'Repeat All';
  return 'Repeat One';
});

defineExpose({ playTrack, playStation, togglePlay, playNextTrack, playPrevTrack, seekRelative, toggleMute });
</script>

<template>
  <div class="player-bar">
    <audio
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <!-- Music: progress bar -->
    <div v-if="store.mode === 'music'" class="progress-row">
      <span class="time">{{ formatTime(store.currentTime) }}</span>
      <div class="seek-track">
        <div class="seek-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="seek-thumb" :style="{ left: progressPercent + '%' }"></div>
        <input
          type="range"
          class="range-overlay"
          min="0"
          :max="store.duration || 100"
          step="0.1"
          :value="seekValue"
          @mousedown="onSeekMousedown"
          @input="onSeekInput"
          @change="onSeekChange"
        />
      </div>
      <span class="time right">{{ formatTime(store.duration) }}</span>
    </div>

    <!-- Radio: live indicator -->
    <div v-else class="progress-row radio-row">
      <div class="live-badge">
        <span class="live-dot"></span>
        LIVE
      </div>
      <div class="live-track-name">{{ store.radioStation?.name || '' }}</div>
    </div>

    <div class="controls-row">

      <div class="controls-side left">
        <button
          :class="['ctrl-btn', { active: store.shuffleMode, disabled: store.mode === 'radio' }]"
          @click="toggleShuffle"
          title="Shuffle"
          :disabled="store.mode === 'radio'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </button>

        <button
          :class="['ctrl-btn', { active: store.repeatMode > 0, disabled: store.mode === 'radio' }]"
          @click="toggleRepeat"
          :title="repeatTitle"
          :disabled="store.mode === 'radio'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          <span v-if="store.repeatMode === 2" class="repeat-badge">1</span>
        </button>
      </div>

      <div class="controls-center">
        <button
          class="ctrl-btn"
          @click="playPrevTrack"
          :disabled="store.mode === 'radio'"
          :class="{ disabled: store.mode === 'radio' }"
          title="Vorheriger Track (P)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20"/>
            <rect x="4" y="4" width="3" height="16" rx="1"/>
          </svg>
        </button>

        <button class="play-btn" @click="togglePlay" :title="store.isPlaying ? 'Pause (Space)' : 'Play (Space)'">
          <svg v-if="!store.isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 3 20 12 6 21 6 3"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="4" height="18" rx="1.5"/>
            <rect x="15" y="3" width="4" height="18" rx="1.5"/>
          </svg>
        </button>

        <button
          class="ctrl-btn"
          @click="playNextTrack"
          :disabled="store.mode === 'radio'"
          :class="{ disabled: store.mode === 'radio' }"
          title="Nächster Track (N)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <rect x="17" y="4" width="3" height="16" rx="1"/>
          </svg>
        </button>
      </div>

      <div class="controls-side right">
        <button class="ctrl-btn" @click="toggleMute" :title="store.isMuted ? 'Unmute (M)' : 'Mute (M)'">
          <svg v-if="!store.isMuted && store.volume > 0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <svg v-else-if="!store.isMuted && store.volume > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>

        <div class="vol-track">
          <div class="vol-fill" :style="{ width: volPercent + '%' }"></div>
          <input
            type="range"
            class="range-overlay"
            min="0"
            max="1"
            step="0.01"
            :value="store.isMuted ? 0 : store.volume"
            @input="onVolumeChange"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.player-bar {
  height: 88px;
  background: #07101a;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 24px 8px;
  gap: 6px;
  flex-shrink: 0;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-row {
  justify-content: center;
  gap: 12px;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--cs);
  background: rgba(var(--csr), 0.12);
  border: 1px solid rgba(var(--csr), 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cs);
  animation: dotBlink 1.2s ease-in-out infinite;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.live-track-name {
  font-size: 12px;
  color: #88aacc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 340px;
}

.time {
  font-size: 11px;
  color: #446688;
  width: 34px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.time.right {
  text-align: right;
}

.seek-track {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.seek-track:hover .seek-fill {
  box-shadow: 0 0 8px rgba(var(--csr), 0.55);
}

.seek-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, var(--cp), var(--cs));
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.05s linear;
}

.seek-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--cl);
  pointer-events: none;
  transition: transform 0.1s;
}

.seek-track:hover .seek-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.vol-track {
  width: 88px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.vol-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, var(--cp), var(--cs));
  border-radius: 2px;
  pointer-events: none;
}

.range-overlay {
  position: absolute;
  inset: -7px 0;
  width: 100%;
  height: 17px;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  padding: 0;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-center {
  display: flex;
  align-items: center;
  gap: 6px;
}

.controls-side {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 175px;
}

.controls-side.right {
  justify-content: flex-end;
}

.ctrl-btn {
  background: none;
  border: none;
  color: #446688;
  cursor: pointer;
  padding: 6px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s, opacity 0.15s;
  position: relative;
}

.ctrl-btn svg {
  width: 17px;
  height: 17px;
}

.ctrl-btn:hover:not(:disabled) {
  color: #a0c4e8;
  background: rgba(255, 255, 255, 0.05);
}

.ctrl-btn.active {
  color: var(--cs);
}

.ctrl-btn.active:hover {
  color: var(--cl);
}

.ctrl-btn.disabled,
.ctrl-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.repeat-badge {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 7px;
  font-weight: 800;
  color: var(--cs);
  line-height: 1;
}

.play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cp), var(--cs));
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 18px rgba(var(--cpr), 0.45);
  transition: transform 0.12s, box-shadow 0.2s;
}

.play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 28px rgba(var(--csr), 0.65);
}

.play-btn:active {
  transform: scale(0.96);
}

.play-btn svg {
  width: 17px;
  height: 17px;
}
</style>
