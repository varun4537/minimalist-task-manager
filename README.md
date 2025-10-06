# Minimalist Task Manager Chrome Extension

A sophisticated Chrome extension that combines task management with meditation features, enhanced with a smooth cursor follower effect.

## 🚀 What's New in v1.3.1
- **Enhanced URL Validation**: AI tools now require full URLs (https:// or http://) for reliable links
- **Improved Zen Cursor Mode**: Now shows actual cursor while the dot/circle follow as decorative elements

### Previous v1.3.0 Updates
- **Comprehensive Settings Panel**: Access font size, cursor mode, and quick links visibility controls
- **Productivity Statistics**: Track meditation sessions, completed tasks, and completion rates
- **Resizable Task Cards**: Dynamically adjust task card height with bottom resize handle
- **Improved Quick Links**: All quick links remain accessible with sticky "Add Quick Link" button
- **Zen Cursor Mode**: Smooth cursor following effect (now disabled by default)
- **Font Size Controls**: Customize text size with small/medium/large options

## 🚀 Features

### Task Management
- **Daily Tasks**: Add, edit, delete, and mark tasks as complete with visual indicators
- **Weekly Tasks**: Long-term task planning with starring for priority tasks
- **Drag & Drop**: Reorder tasks easily with intuitive drag-and-drop functionality
- **Resizable Task Cards**: Adjust task card heights with snap-to-grid functionality for precise layout control
- **Aging Indicators**: Visual cues for task age to help prioritize
- **Starring**: Mark important tasks with stars for quick identification

### Meditation Zone
- **Multi-Mode Meditation**: Choose from different meditation styles (breathing, focus, etc.)
- **Breathing Animations**: Guided breathing with visual animations
- **Timers**: Customizable session lengths with countdown timers
- **Ambient Sounds**: Background sounds like forest, rain, and waves to enhance meditation
- **Session Notifications**: Gentle browser notifications for session start and end

### Quick Notes
- **Instant Access**: Toggle quick notes panel with Ctrl+S
- **Persistent Storage**: Notes are saved locally and synced across devices

### Keyboard Shortcuts
- `Ctrl+N` / `Cmd+N`: Focus on new daily task input
- `Ctrl+W` / `Cmd+W`: Focus on new weekly task input
- `Ctrl+M` / `Cmd+M`: Toggle meditation zone
- `Ctrl+S` / `Cmd+S`: Toggle quick notes panel
- `Escape`: Close modals or exit meditation

### Visual Enhancements
- **Cursor Follower**: Smooth, fluid cursor following effect with dot and circle elements
- **Themes**: Multiple color themes including dark mode
- **Daily Backgrounds**: Rotating gradient backgrounds for visual variety

### Customization
- **Custom AI Tools**: Add quick links to your favorite AI tools
- **Dark Mode**: Toggle between light and dark themes
- **Settings Sync**: All preferences sync across your Chrome browsers

### Chrome Integration
- **New Tab Override**: Extension loads as your new tab page
- **Badge Notifications**: Visual indicators on the extension icon
- **Storage Sync**: Data syncs across signed-in Chrome browsers

## 📁 Project Structure

```
taskman/
├── manifest.json           # Chrome extension manifest
├── popup.html             # Main UI HTML
├── README.md              # Project documentation
├── assets/                # Static assets
│   ├── icons/            # Extension icons
│   │   ├── LOGO.png
│   │   ├── list.png
│   │   ├── list (1).png
│   │   ├── list (2).png
│   │   ├── check-mark.png
│   │   ├── check-mark (1).png
│   │   ├── check-mark (2).png
│   │   ├── star.png
│   │   ├── star (1).png
│   │   └── star (2).png
│   └── sounds/           # Meditation audio files
│       ├── forest.mp3
│       ├── rain.mp3
│       └── waves.mp3
├── css/                   # Stylesheets
│   └── style.css         # Main stylesheet with themes and cursor effects
├── js/                    # JavaScript modules
│   └── popup.js          # Main application logic
└── src/                   # Future modular components (ready for expansion)
```

## 🎯 Cursor Follower Effect

The extension features a premium cursor follower effect with:

- **Dot**: 3px circle that follows cursor with slight delay (0.8 lerp factor)
- **Circle**: 24px outline circle that smoothly follows the dot (0.15 lerp factor)
- **GPU Acceleration**: Uses `translate3d()` for smooth 60fps animation
- **Theme Aware**: Adapts colors for light/dark modes
- **Performance Optimized**: Lightweight with `requestAnimationFrame`

## 🛠️ Development

### File Organization

- **`assets/`**: All static resources (icons, sounds, images)
- **`css/`**: Stylesheets and theme definitions
- **`js/`**: JavaScript modules and components
- **`src/`**: Reserved for future modular components

### Adding New Features

The structure is optimized for extensibility:

1. **New UI Components**: Add to `src/components/`
2. **New Themes**: Extend CSS custom properties in `css/style.css`
3. **New Audio**: Add files to `assets/sounds/`
4. **New Icons**: Add to `assets/icons/`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. The extension will appear in your toolbar and as new tab page

## 🎨 Customization

### Keyboard Shortcuts
- `Ctrl+N` / `Cmd+N`: Focus on new daily task input
- `Ctrl+W` / `Cmd+W`: Focus on new weekly task input
- `Ctrl+M` / `Cmd+M`: Toggle meditation zone
- `Ctrl+S` / `Cmd+S`: Toggle quick notes panel
- `Escape`: Close modals or exit meditation

### Cursor Follower Settings
- Dot size: 3px (configurable in CSS)
- Circle size: 24px (configurable in CSS)
- Animation speed: Adjustable via lerp factors in JS
- Colors: Theme-aware, customizable in CSS

## 🔧 Technical Details

- **Manifest Version**: 3
- **Permissions**: storage, notifications
- **Browser Compatibility**: Chrome, Edge, other Chromium-based browsers
- **Performance**: Optimized for 60fps animations and minimal memory usage

## 🔒 Privacy Policy

This extension respects your privacy. All data is stored locally in your browser and synced using Chrome's built-in synchronization. No personal data is collected or transmitted to external servers. For complete details, see [PRIVACY.md](PRIVACY.md).

## 📈 Future Enhancements

The modular structure supports easy addition of:
- Task categories and filters
- Advanced meditation modes
- Productivity analytics
- Team collaboration features
- Custom cursor effects
- Plugin system for third-party integrations

## 🤝 Contributing

The organized file structure makes contributions straightforward:
1. Fork the repository
2. Create feature branches
3. Follow the established folder structure
4. Test thoroughly before submitting PRs

---

*Built with modern web technologies and optimized for performance and extensibility.*
