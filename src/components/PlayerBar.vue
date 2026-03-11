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

const playTrack = (trackPath, index) => {
  const audio = audioRef.value;
  audio.src = trackPath;
  audio.volume = store.isMuted ? 0 : store.volume;
  audio.play();
  store.currentTrackIndex = index;
  store.isPlaying = true;
  const parts = trackPath.replace(/\\/g, '/').split('/');
  store.currentTrackName = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
};

const togglePlay = () => {
  if (store.currentTrackIndex === -1) return;
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
  const audio = audioRef.value;
  if (!audio) return;
  audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, store.duration));
};

const onTimeUpdate = () => {
  if (!seeking.value) {
    store.currentTime = audioRef.value.currentTime;
    seekValue.value = audioRef.value.currentTime;
  }
  store.duration = audioRef.value.duration || 0;
};

const onLoadedMetadata = () => {
  store.duration = audioRef.value.duration || 0;
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

defineExpose({ playTrack, togglePlay, playNextTrack, playPrevTrack, seekRelative, toggleMute });
</script>

<template>
  <div class="player-bar">
    <audio
      ref="audioRef"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="playNextTrack"
    />

    <div class="progress-row">
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

    <div class="controls-row">

      <div class="controls-side left">
        <button
          :class="['ctrl-btn', { active: store.shuffleMode }]"
          @click="toggleShuffle"
          title="Shuffle"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
          </svg>
        </button>

        <button
          :class="['ctrl-btn', { active: store.repeatMode > 0 }]"
          @click="toggleRepeat"
          :title="repeatTitle"
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
        <button class="ctrl-btn" @click="playPrevTrack" title="Vorheriger Track (P)">
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

        <button class="ctrl-btn" @click="playNextTrack" title="Nächster Track (N)">
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
  background: #0c0c1a;
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

.time {
  font-size: 11px;
  color: #555577;
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
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.55);
}

.seek-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
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
  background: #c084fc;
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
  background: linear-gradient(90deg, #7c3aed, #a855f7);
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
  color: #555577;
  cursor: pointer;
  padding: 6px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
  position: relative;
}

.ctrl-btn svg {
  width: 17px;
  height: 17px;
}

.ctrl-btn:hover {
  color: #c0c0e0;
  background: rgba(255, 255, 255, 0.05);
}

.ctrl-btn.active {
  color: #a855f7;
}

.ctrl-btn.active:hover {
  color: #c084fc;
}

.repeat-badge {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 7px;
  font-weight: 800;
  color: #a855f7;
  line-height: 1;
}

.play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 18px rgba(124, 58, 237, 0.45);
  transition: transform 0.12s, box-shadow 0.2s;
}

.play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 28px rgba(168, 85, 247, 0.65);
}

.play-btn:active {
  transform: scale(0.96);
}

.play-btn svg {
  width: 17px;
  height: 17px;
}
</style>
