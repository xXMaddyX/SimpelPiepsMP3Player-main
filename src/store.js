import { reactive } from 'vue';

export const store = reactive({
  currentTrackIndex: -1,
  currentTrackName: '',
  isPlaying: false,
  shuffleMode: false,
  repeatMode: 0, // 0 = kein Repeat, 1 = Repeat All, 2 = Repeat One
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
});
