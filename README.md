# Pieps Music Player

A simple desktop MP3 player built with Electron + Vue 3.

## Features

- Select a folder and load all MP3 files from it
- Displays the current track name
- Automatically plays the next track when one ends
- Custom title bar with window controls (minimize, maximize, close)
- Open folder via button or `Ctrl+O`

## Tech Stack

- [Electron](https://www.electronjs.org/) — Desktop app framework
- [Vue 3](https://vuejs.org/) — UI framework
- [Vite](https://vitejs.dev/) — Build tool

## Setup

```sh
npm install
```

### Development mode (browser)

```sh
npm run dev
```

### Run with Electron

```sh
npm start
```

### Build + package as Electron app (Windows x64)

```sh
npm run dist
```

The packaged `.exe` will be in `release/PiepsMusicPlayer-win32-x64/`.

## Project Structure

```
├── main.js          # Electron main process
├── preload.js       # Preload script (IPC bridge)
├── src/
│   ├── main.js      # Vue app entry point
│   ├── components/
│   │   ├── MusicPlayer.vue   # Audio player component
│   │   └── TitleBar.vue      # Custom title bar
│   └── assets/
│       └── PiepsmitTasse.png # Pieps with a cup :)
└── release/         # Packaged app output (after npm run dist)
```
