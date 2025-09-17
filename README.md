# Minimalist Task Manager Chrome Extension

A sophisticated Chrome extension that combines task management with meditation features, enhanced with a smooth cursor follower effect.

## 🚀 Features

- **Task Management**: Daily and weekly task lists with drag-and-drop, starring, and aging indicators
- **Meditation Zone**: Multi-mode meditation with breathing animations, timers, and ambient sounds
- **Cursor Follower**: Smooth, fluid cursor following effect with dot and circle elements
- **Customization**: Multiple themes, dark mode, custom AI tool links
- **Chrome Integration**: Badge notifications, storage sync, new tab override

## 📁 Project Structure

```
taskman/
├── manifest.json           # Chrome extension manifest
├── popup.html             # Main UI HTML
├── README.md              # Project documentation
├── assets/                # Static assets
│   ├── icons/            # Extension icons
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

### Themes
- **Serene Focus**: Calm, minimalist design
- **Natural Balance**: Earth-toned, organic feel
- **Modern Minimalist**: Clean, contemporary look

### Cursor Follower Settings
- Dot size: 3px (configurable in CSS)
- Circle size: 24px (configurable in CSS)
- Animation speed: Adjustable via lerp factors in JS
- Colors: Theme-aware, customizable in CSS

## 🔧 Technical Details

- **Manifest Version**: 3
- **Permissions**: storage, action, notifications
- **Browser Compatibility**: Chrome, Edge, other Chromium-based browsers
- **Performance**: Optimized for 60fps animations and minimal memory usage

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
