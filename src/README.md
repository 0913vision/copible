# Developer Documentation

## Project Structure

```
src/
├── electron/
│   └── main.js                 # Main Electron process
├── renderer/
│   ├── index.js               # React app entry point
│   ├── index.html             # HTML template
│   ├── styles.css             # Global styles
│   └── components/
│       ├── App.js             # Root React component
│       ├── App.css            # Component styles
│       ├── SearchPanel/       # Search input components
│       │   ├── SearchPanel.js
│       │   ├── BibleSearchForm.js
│       │   └── BookDropdown.js
│       ├── ResultsPanel/      # Search results components
│       │   ├── ResultsPanel.js
│       │   ├── VersesList.js
│       │   └── VerseCard.js
│       └── shared/
│           └── constants.js
└── data/
    ├── bible-metadata.js      # Bible book metadata (66 books)
    ├── bible-search.js        # Book search logic
    ├── bible-crawler.js       # Web scraping functions
    └── __tests__/             # Unit tests
```

## Architecture

### Main Process (`src/electron/main.js`)
- Creates main window (800x550, resizable)
- Handles global shortcuts (Ctrl+F, Ctrl+R, Ctrl+Q)
- Auto-update functionality (Windows only)
- Custom application menu

### Renderer Process (`src/renderer/`)
- React-based UI with SearchPanel and ResultsPanel
- Form validation and keyboard navigation
- IPC communication for shortcuts
- Web scraping for Bible verses

### Data Layer (`src/data/`)
- **bible-metadata.js**: 66 Bible books with Korean/English names
- **bible-search.js**: Book name matching with QWERTY conversion
- **bible-crawler.js**: Web scraping from bskorea.or.kr

## Build Commands

```bash
# Development
npm install
npm start

# Production
npm run build
npm run dist:win
```

## Development Notes

### Environment
- `NODE_ENV=development`: Loads from localhost:3000
- `NODE_ENV=production`: Loads from file system

### Important Implementation Details
- **Korean Input Handling**: Must use `onCompositionStart/End` to prevent keyboard navigation during Korean typing
- **Tab Navigation Logic**: Complex validation chain - each field blocks Tab until valid, check `canProceedToNextField()`
- **Chapter Data Loading**: Triggered on startVerse focus, not chapter input - see `handleStartVerseFocus()`
- **Clipboard Fallback**: Uses `execCommand` as fallback when `navigator.clipboard` fails
- **Process Cleanup**: Windows requires explicit `app.quit()` in multiple event handlers to prevent zombie processes
- **Menu Override**: Custom menu completely replaces default to prevent browser shortcuts (Ctrl+F, etc)
- **QWERTY Conversion**: `es-hangul` library handles "ckdtprl" → "창세기" conversion