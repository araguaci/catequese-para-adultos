# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Catequese para Adultos** is a Progressive Web App (PWA) audiobook player for a Catholic catechesis course taught by Padre Paulo Ricardo. The app delivers 34 audio lessons organized into thematic sections covering fundamental Catholic doctrine, from creation to the afterlife.

## Technology Stack

- **Pure Vanilla JavaScript** - No build tools, frameworks, or bundlers
- **HTML5 Audio API** - Native audio playback with `<audio>` element
- **Service Worker** - Offline-first caching strategy (sw.js)
- **Web App Manifest** - PWA configuration for installability
- **Bootstrap 4** - UI styling (loaded via CDN)
- **Readium Web Publication Manifest** - Audiobook metadata format

## Architecture

### Core Files

- **index.html** - Single-page application shell with audio player UI
- **player.js** - Main application logic for audiobook playback
- **manifest.json** - Audiobook metadata following Readium spec (not PWA manifest)
- **sw.js** - Service worker for offline caching

### Key Directories

- **audio/** - 34 MP3 files (lessons 1-34), large files (~8-12 MB each)
- **image/** - Cover art, logos, and social media sharing icons
- **polyfills/** - fetch.js and urlsearchparams.js for older browser support

### Player Architecture

The player is implemented as an IIFE (Immediately Invoked Function Expression) in player.js:

1. **Manifest Loading** - Fetches manifest.json to get reading order
2. **State Persistence** - Uses localStorage to save:
   - Current track: `localStorage.setItem(manifest_url + "#track", audio_source.src)`
   - Current position: `localStorage.setItem(manifest_url + "#t", audio.currentTime)`
3. **Navigation** - Previous/Next buttons update track based on readingOrder array
4. **Auto-resume** - On page load, restores last position if available
5. **Auto-advance** - "ended" event listener automatically plays next track

### Service Worker Strategy

The sw.js implements a **cache-first** strategy, which is critical for large audio files:

```javascript
// Cache strategy: try cache first, fall back to network
caches.match(event.request).then(function(response) {
  return response || fetch(event.request);
})
```

## Development Workflow

### Testing Locally

Since this is a static site with no build process:

1. Use any static file server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (if http-server is installed)
   npx http-server -p 8000
   ```

2. Open http://localhost:8000 in browser

### Service Worker Development

- After changing sw.js, increment CACHE_NAME version to force cache refresh
- Use browser DevTools > Application > Service Workers to unregister/update
- Test offline mode by checking "Offline" in Network tab

### Audio File Naming Convention

Audio files follow strict naming pattern matched by player.js:
```
{number}-{slug-with-dashes}.mp3
```

The player extracts display names by:
- Removing "audio/" prefix and ".mp3" suffix
- Replacing underscores with spaces
- Example: `audio/1-por-que-estamos-neste-mundo.mp3` → "1-por-que-estamos-neste-mundo"

## manifest.json Structure

This is NOT a PWA manifest. It's a Readium Web Publication manifest with:

- **metadata** - Title, author, narrator, description
- **links** - Cover image reference
- **readingOrder** - Array of audio file paths in sequential order

The readingOrder array is the single source of truth for track sequence.

## URL Parameters

The player supports query parameters:

- `?href={manifest_url}` - Load alternate manifest
- `?track={track_url}` - Start at specific track

If no params provided, defaults to local manifest.json and either saved position or first track.

## State Management

No state management library. State is stored in:

1. **localStorage** - Persistent playback position and current track
2. **DOM** - Current UI state (audio element, navigation links)
3. **Manifest data** - Loaded once and kept in closure scope

## Important Notes

- **No version control** - This repo has `.history/` but is not a git repository
- **Deployed URL** - https://catequese-para-adultos.vercel.app/
- **Content source** - padrepauloricardo.org
- **Language** - Portuguese (pt-BR)
- **Audio files are large** - Total ~350MB, handle with care when testing

## Adding New Audio Lessons

1. Add MP3 file to audio/ directory following naming convention
2. Add entry to manifest.json readingOrder array with:
   ```json
   {
     "href": "audio/{filename}.mp3",
     "type": "audio/mpeg"
   }
   ```
3. Update section totals in README.md if adding to new section

## Browser Compatibility

The polyfills support:
- fetch API for older browsers
- URLSearchParams for IE11 and Edge <17

Target is modern browsers with HTML5 audio support and ES5 JavaScript.
