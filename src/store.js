// ------->>>>Global reactive store - shared state for the whole app<<<<-------
import { reactive } from 'vue';

// ------->>>>all components read and write from this one store object<<<<-------
export const store = reactive({
  currentTrackIndex: -1,        // ------->>>>-1 means nothing is loaded yet<<<<-------
  currentTrackName: '',
  isPlaying: false,
  shuffleMode: false,
  repeatMode: 0,                // ------->>>>0 = off, 1 = repeat all, 2 = repeat one<<<<-------
  volume: 0.1,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  theme: localStorage.getItem('pieps-theme') || 'blue',  // ------->>>>persist theme across sessions<<<<-------
  mode: 'music',                // ------->>>>'music' or 'radio'<<<<-------
  radioStation: null,
});
