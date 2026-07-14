# PowerDown

A small Electron app for shutting down the computer:

- **In...** — set hours/minutes (or click 15 min/30 min/1 h/2 h), and the app shuts the computer down after that time.
- **Scheduled** — pick a date and time, and the computer shuts down exactly then.

Works on Windows, macOS, and Linux — the app picks the right shutdown command for the current platform automatically.

Interface language: English (default), Ukrainian, Spanish, French, German — switch via the dropdown at the top of the window; the choice is remembered.

## Run in development

```bash
npm install
npm start
```

## Build an installer

```bash
npm run dist:win     # Windows (.exe, NSIS)
npm run dist:mac     # macOS (.dmg)
npm run dist:linux   # Linux (AppImage + .deb)
```

Built files land in the `release/` folder. Cross-building (e.g. an `.exe` on a Mac) only partly works — it's more reliable to build each target on its own OS or in CI.

## How it works

- While a shutdown is scheduled, the app keeps running in the background (tray icon). Closing the window only hides it — the shutdown still happens. Use "Quit" in the tray menu to fully stop the app.
- At the target time, it runs a native command:
  - Windows: `shutdown /s /f /t 0`
  - macOS: the AppleScript `tell application "System Events" to shut down` (macOS will ask for permission to control the system on first run — you need to grant it)
  - Linux: `systemctl poweroff` (falling back to `loginctl poweroff` / `shutdown -h now`)
