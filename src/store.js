import { reactive } from 'vue';

export const store = reactive({
  currentTrackIndex: -1,
  currentTrackName: '',
  isPlaying: false,
  shuffleMode: false,
  repeatMode: 0,
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  theme: localStorage.getItem('pieps-theme') || 'blue',
  mode: 'music',
  radioStation: null,
});
