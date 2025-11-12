# Retro Game Layer

![DAS Platform Monitor](./assets/screenshot.png)

A Diablo II-inspired isometric visualization for monitoring the DAS (Data Analytics Services) platform. Navigate through tiers and environments as dungeon levels, discovering infrastructure treasures.

## Features

✨ **Isometric Grid Navigation**: Explore a 4×3 grid mapping bronze/silver/gold tiers across dev/stage/prod environments
🎮 **Diablo II Aesthetics**: Pixel-art visuals with retro game mechanics
📊 **Real-time Monitoring**: Watch your infrastructure health in game-like format
🎯 **Interactive Elements**: Click resources for CLI, double-click for AWS console access
🗺️ **Mini Map**: Picture-in-picture overview with player position tracking

## Development

### Prerequisites

- Node.js 18+
- npm

### Local Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000/das-platform-demo/`

### Build for Production

```bash
# Build for GitHub Pages
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
retro-game-layer/
├── src/
│   ├── main.js              # Application entry point
│   ├── config/
│   │   └── gameConfig.js    # Game constants and settings
│   ├── core/                # Core game systems
│   ├── rendering/           # Graphics and rendering
│   ├── ui/                  # Interface components
│   ├── input/               # Input handling
│   ├── data/                # Mock data and resources
│   ├── models/              # Data models
│   └── integration/         # AWS/external integrations
├── public/                  # Static assets
├── index.html              # HTML entry point
├── vite.config.js          # Build configuration
└── package.json            # Dependencies
```

### Development Roadmap

- ✅ **Foundation**: PixiJS setup, canvas rendering
- 🔄 **Grid System**: Isometric coordinate system and tile generation
- 🏗️ **Navigation**: Mouse interaction and cell selection
- 🎨 **Assets**: Programmatic sprite generation (colored rectangles)
- ⚡ **Health States**: Flashing animations for critical alerts
- 🗺️ **Mini Map**: Overview navigation widget
- 💻 **CLI Modal**: Embedded command interface
- ☁️ **AWS Integration**: Console links and real-time updates
- 🎮 **Interaction Polish**: Camera controls, zoom mechanics
- ⚡ **Performance**: Optimization for 60 FPS target

## Deployment

### GitHub Pages

The project is configured for automatic deployment to GitHub Pages:

1. Push changes to the `retro-game-layer/` directory
2. GitHub Actions will build and deploy to `gh-pages` branch
3. App will be available at: `https://yourusername.github.io/das-platform-demo/`

### Manual Deployment

```bash
# Build the project
npm run build

# Copy dist/ contents to your hosting provider
cp -r dist/* /path/to/hosting/
```

## Technology Stack

- **Framework**: PixiJS v7 (2D WebGL renderer)
- **Build Tool**: Vite (fast development and optimized builds)
- **Deployment**: GitHub Pages (automatic CI/CD)
- **Language**: ES6+ JavaScript modules
- **Styling**: CSS-in-JS with no external frameworks

## Architecture

### Game Layers

1. **Canvas Layer**: Main PixiJS WebGL canvas
2. **Grid Layer**: Isometric tile rendering
3. **Object Layer**: AWS resource sprites
4. **UI Layer**: Text overlay for tools/stats
5. **Effect Layer**: Animations and particles

### Event System

- **Mouse Events**: Grid navigation and interaction
- **Resource Events**: Health state changes and resource discovery
- **System Events**: Performance monitoring and error handling

## Contributing

1. **PR Workflow**:
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature

   # Make changes and test
   npm run dev

   # Commit and push
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   # Create PR → merge to main → auto-deploy
   ```

2. **Code Style**: Use modern ES6+ with JSDoc comments
3. **Assets**: All sprites generated programmatically (no asset files needed)
4. **Testing**: Manual testing in browser console, no test framework yet

## Future Enhancements

- 🎮 **Game Logic**: Health/mana orbs for SLO visualization
- 🏆 **Achievements**: Platform operational milestones unlocked
- 🎵 **Sound Effects**: Retro audio for alerts and interactions
- 🌐 **Multi-player**: Collaborative monitoring for teamOps
- 📱 **Mobile Support**: Touch controls and responsive design
- 🎨 **Theme System**: Custom visual themes for different platforms

---

Built with ❤️ and PixiJS for the DAS Platform Demo
