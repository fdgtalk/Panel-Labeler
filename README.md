# Panel Labeler

A browser-based, printable breaker-panel label maker.

The app starts with sample data only. Circuit directories are stored locally in the browser and can be exported as JSON; do not commit a real household panel map to this public repository.

## Development

```bash
npm install
npm run dev
```

Build a static deployment with `npm run build`. The legacy standalone `panel-labels.html` remains as a reference prototype while the React editor evolves.
