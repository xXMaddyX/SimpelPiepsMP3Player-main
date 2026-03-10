<script setup>
import { inject } from 'vue';

const musicFiles = inject('musicFiles');

const minimize = () => window.API.minimizeWindow();
const maximize = () => window.API.maximizeWindow();
const close = () => window.API.exitApp();

const openFolder = async () => {
  const result = await window.API.selectDirectory();
  if (result) {
    const { directoryPath, musicFiles: files } = result;
    musicFiles.value = files.map(f => `${directoryPath}/${f}`);
  }
};
</script>

<template>
  <div class="titlebar">
    <div class="drag-region">
      <div class="app-info">
        <svg class="app-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#7c3aed" stroke-width="1.5"/>
          <path d="M9 8l8 4-8 4V8z" fill="#a855f7"/>
        </svg>
        <span class="app-name">Pieps Music Player</span>
      </div>
    </div>

    <div class="actions">
      <button class="folder-btn" @click="openFolder" title="Ordner öffnen (Ctrl+O)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Ordner öffnen</span>
      </button>

      <div class="separator"></div>

      <div class="window-controls">
        <button class="win-btn min-btn" @click="minimize" title="Minimieren">
          <svg viewBox="0 0 12 12">
            <rect x="1" y="5.5" width="10" height="1" fill="currentColor"/>
          </svg>
        </button>
        <button class="win-btn max-btn" @click="maximize" title="Maximieren">
          <svg viewBox="0 0 12 12">
            <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.2"/>
          </svg>
        </button>
        <button class="win-btn close-btn" @click="close" title="Schließen">
          <svg viewBox="0 0 12 12">
            <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.3"/>
            <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" stroke-width="1.3"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  height: 40px;
  background: #08080f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 14px;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.drag-region {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.app-name {
  font-size: 12px;
  font-weight: 600;
  color: #6666aa;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.folder-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #7777aa;
  cursor: pointer;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  margin-right: 4px;
}

.folder-btn svg {
  width: 13px;
  height: 13px;
}

.folder-btn:hover {
  color: #f0f0ff;
  background: rgba(124, 58, 237, 0.18);
}

.separator {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 2px;
}

.window-controls {
  display: flex;
  height: 40px;
}

.win-btn {
  width: 46px;
  height: 40px;
  background: none;
  border: none;
  color: #666688;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s;
}

.win-btn svg {
  width: 12px;
  height: 12px;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #f0f0ff;
}

.close-btn:hover {
  background: #c42b1c;
  color: white;
}
</style>
