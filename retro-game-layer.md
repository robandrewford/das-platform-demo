# Retro Game Layer

![Isometric Grid Layout](./assets/grid-layout.png)

## Overview

The Retro Game Layer is an interactive, game-inspired visualization
system that transforms data platform monitoring into an immersive
Diablo II-style experience. Instead of traditional dashboards, users
navigate a pixel-art isometric world where each "dungeon level"
represents a slice of the data platform estate.

**Core Metaphor**: Like exploring catacombs in a classic RPG, data engineers "descend" through platform tiers, uncovering treasure troves of data resources. Blocked corridors and flashing dangers represent failing pipelines and stuck feeds.

## User Experience Goals

- **Immersion**: Feel like playing a retro RPG while managing data infrastructure
- **Intuition**: Platform health instantly recognizable through visual metaphor
- **Efficiency**: Quick navigation and interaction patterns familiar to gamers
- **Accessibility**: Gamification makes complex infrastructure approachable

## Architecture

### Grid Structure

The canvas implements a **4×3 isometric grid** mapping platform tiers to game levels:

| Environment | Tier | Description |
|-------------|------|-------------|
| Development | Bronze | Raw data landing zones |
| Development | Silver | Data cleaning & pipeline stages |
| Development | Gold | Business view datasets |
| Development | Operations | Performance metrics |
| Staging | Bronze | Schema validation & PIT |
| Staging | Silver | ETL transformation & quality checks |
| Staging | Gold | Release candidate data products |
| Staging | Operations | SLO tracking & compliance |
| Production | Bronze | Live ingestion & volume metrics |
| Production | Silver | Real-time transforms |
| Production | Gold | Customer-facing APIs |
| Production | Operations | Alert monitoring & incidents |

**Isometric Perspective**: Grid cells render as diamond-shaped tiles with 30° rotation, creating depth perception similar to 1990s isometric games.

### Component Layers

```html
<div id="game-viewport">
  <!-- Main isometric canvas -->
  <canvas id="isometric-canvas" width="1024" height="768"></canvas>

  <!-- Picture-in-picture minimap -->
  <div id="minimap-container">
    <canvas id="minimap-canvas" width="256" height="192"></canvas>
  </div>

  <!-- UI overlays (health bars, tooltips) -->
  <div id="ui-overlays"></div>

  <!-- Embedded CLI popup -->
  <div id="cli-popup" class="hidden">
    <textarea id="cli-terminal"></textarea>
  </div>
</div>
```

## Components

### Isometric Renderer

**Technology Choices**:

- **Vanilla `<canvas>` API** for direct pixel control and performance
- **Optional**: Phaser.js or PixiJS for advanced game features
- **Pixel Art Style**: 32×32 sprites with hand-drawn aesthetics

**Render Pipeline**:

1. **Ground Layer**: Isometric grid tiles with subtle gradients
2. **Object Layer**: Platform resources (buckets, tables, pipelines) as sprites
3. **UI Layer**: Stats bars, tooltips, navigation markers
4. **Effect Layer**: Animations (flashing warnings, particles)

### Location System

Each grid cell `[env, tier]` represents a service location:

```javascript
// Grid coordinate to service mapping
const SERVICE_MAP = {
  dev: {
    bronze: 'brook-commerce-bronze-dev',
    silver: 'brook-commerce-silver-dev',
    gold: 'brook-commerce-gold-dev',
    ops: 'brook-commerce-ops-dev'
  },
  stage: {
    bronze: 'brook-commerce-bronze-stage',
    silver: 'brook-commerce-silver-stage',
    gold: 'brook-commerce-gold-stage',
    ops: 'brook-commerce-ops-stage'
  },
  prod: {
    bronze: 'brook-commerce-bronze-prod',
    silver: 'brook-commerce-silver-prod',
    gold: 'brook-commerce-gold-prod',
    ops: 'brook-commerce-ops-prod'
  }
};
```

### Resource Visualization

**Sprite Types**:

- **🪣 S3 Buckets**: Blue chests with golden locks
- **📊 Snowflake Tables**: Crystal formations of varying sizes
- **🔥 Data Feeds**: Flaming torches (green = flowing, red = stuck)
- **⚡ Stream Processing**: Electrical sparks and gear animations
- **🔒 Access Policies**: Medieval locks and keys

**Visual States**:

- **Healthy**: Bright colors, subtle glows
- **Warning**: Amber hue, gentle pulsing
- **Critical**: Red flashing (similar to low-health monsters)
- **Blocked**: Grayed out with particle effects

### Zoom Mechanics

**Implementation**: Orthogonal camera controls with smooth interpolation

1. **Overview Mode**: Full grid visible, minimap active
2. **Focus Mode**: Zoomed into single cell, 2-cell radius context
3. **Detail Mode**: Individual resources visible with descriptions
4. **Navigation**: WASD/arrow keys + mouse wheel zoom

### Mini Map

**Picture-in-Picture Widget**:

- **Position**: Bottom-right corner, semi-transparent
- **Scale**: 1:4 reduction of main canvas
- **Features**: Player position marker, region heatmaps
- **Interaction**: Click to teleport to different grid areas

### Embedded CLI

**Modal Popup**:

- **Trigger**: Single-click resource sprites
- **Functionality**: Placeholder AWS CLI command echo
- **Styling**: Terminal aesthetic with green-on-black text
- **Commands**: Sample queries like `aws s3 ls s3://bucket-name/`

### AWS Console Launch

**Double-Click Handler**:

- Opens browser tabs targeting specific AWS service consoles
- Constructs URLs dynamically: `https://console.aws.amazon.com/{service}?region=us-east-1#{resource}`

## Implementation Strategy

### Phase 1: Core Grid (Week 1-2)

- Basic isometric renderer with 4×3 grid
- Simple tile sprites and navigation
- Mouse hover detection and tooltips

### Phase 2: Resource Integration (Week 2-3)

- AWS SDK integration for resource listing
- Sprite sheet creation and animation
- Real-time health status visualization

### Phase 3: Interaction Polish (Week 3-4)

- CLI popup implementation
- Console launch integration
- Minimap completion
- Performance optimization

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+) for performance
- **Rendering**: HTML5 Canvas 2D API
- **Assets**: Pixel art sprites (created with Aseprite)
- **Backend**: Node.js proxy for AWS API calls
- **Styling**: Custom CSS for UI overlays

### Performance Considerations

- **Framerate Target**: 60 FPS for smooth scrolling
- **Memory Management**: Object pooling for sprites/animations
- **LOD System**: Lower detail when zoomed out
- **Lazy Loading**: Resources fetched on-demand per cell

## API Design

### External Interfaces

```javascript
// Initialize game layer
const gameLayer = new RetroGameLayer({
  canvas: document.getElementById('isometric-canvas'),
  awsRegion: 'us-east-1',
  gridConfig: { cols: 4, rows: 3 }
});

// Zoom controls
gameLayer.zoomToCell(rowIndex, colIndex);
gameLayer.zoomOut();

// Resource discovery
gameLayer.discoverResources('dev', 'bronze')
  .then(resources => renderResources(resources));

// Health monitoring
gameLayer.onResourceStateChange((resourceId, newState) => {
  updateSpriteAnimation(resourceId, newState);
});
```

### Event System

```javascript
// User interactions
gameLayer.on('cellClick', (env, tier) => { /* handle zoom */ });
gameLayer.on('resourceDoubleClick', (resourceType, resourceId) => {
  launchAWSConsole(resourceType, resourceId);
});

// System events
gameLayer.on('resourceHealthChange', (resource) => {
  animateHealthState(resource);
});
```

## Usage Examples

### Basic Setup

```html
<!DOCTYPE html>
<html>
  <canvas id="isometric-canvas"></canvas>
  <script src="retro-game-layer.js"></script>
  <script>
    const game = new RetroGameLayer({
      canvas: document.getElementById('isometric-canvas')
    });
  </script>
</html>
```

### Custom Resource Icon

```javascript
// Add custom sprite for new resource type
game.addSprite('data-warehouse', {
  image: 'sprites/data-warehouse.png',
  frames: { idle: [0, 1], working: [2, 3, 4], error: [5] }
});
```

## Testing Strategy

### Visual Testing

- **Canvas Rendering**: Correct isometric perspective and proportions
- **Sprite Animation**: Smooth 60fps animations with proper state transitions
- **UI Responsiveness**: Tooltips and overlays position correctly

### Integration Testing

- **AWS API Calls**: Proper error handling and rate limiting
- **CLI Execution**: Command echo and mock responses
- **Console Launch**: Correct URL generation and browser behavior

### User Experience Testing

- **Navigation Flow**: Intuitive zoom and pan controls
- **Accessibility**: Keyboard-only navigation support
- **Performance**: Smooth interaction at all zoom levels

## Contributing

### Asset Creation Guidelines

1. **Pixel Art Style**: 32×32 sprites with 4-color palette
2. **Consistent Lighting**: Top-down perspective with highlights left-top
3. **Animation Frames**: Idle (1-2), active (2-4), error (1) states
4. **Color Coding**: Green = healthy, amber = warning, red = error

### Code Standards

1. **ES6+ Features**: Async/await, destructuring, arrow functions
2. **Canvas Performance**: Minimize DOM updates, use requestAnimationFrame
3. **Modular Structure**: One class per major component
4. **Documentation**: JSDoc comments for all public methods
