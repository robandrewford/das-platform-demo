/**
 * DAS Platform Monitor - Retro Game Layer
 * Main entry point using PixiJS
 */

import * as PIXI from 'pixi.js';
import { GRID_CONFIG, COLOR_SCHEME } from './config/gameConfig.js';
import GridSystem from './core/GridSystem.js';
import TileRenderer from './rendering/TileRenderer.js';
import MouseController from './input/MouseController.js';
import CellInfoPanel from './ui/CellInfoPanel.js';

class RetroGameLayer {
  constructor() {
    this.app = null;
    this.gameContainer = null;
    this.gridSystem = null;
    this.tileRenderer = null;
    this.mouseController = null;
    this.cellInfoPanel = null;
    this.loadingScreen = null;

    this.textContainer = null; // For text labels

    this.init();
  }

  async init() {
    try {
      this.hideLoadingScreen();

      // Initialize PixiJS application
      this.app = new PIXI.Application({
        width: GRID_CONFIG.canvasWidth,
        height: GRID_CONFIG.canvasHeight,
        backgroundColor: COLOR_SCHEME.background,
        resizeTo: window
      });

      // Append to DOM
      const gameContainer = document.getElementById('game-container');
      gameContainer.appendChild(this.app.view);

      // Set up resize handling
      window.addEventListener('resize', this.onResize.bind(this));

      // Create main game container
      this.gameContainer = new PIXI.Container();
      this.app.stage.addChild(this.gameContainer);

      // Create text overlay container (above tiles)
      this.textContainer = new PIXI.Container();
      this.app.stage.addChild(this.textContainer);

      // Create UI overlay container (above text)
      this.uiContainer = new PIXI.Container();
      this.app.stage.addChild(this.uiContainer);

      // Initialize game systems
      await this.initializeGameSystems();

      // Add debug info overlay
      this.addDebugInfo();

      console.log('Retro Game Layer initialized successfully');
      console.log('Grid stats:', this.gridSystem ? this.gridSystem.getStats() : 'No grid system');

    } catch (error) {
      console.error('Failed to initialize Retro Game Layer:', error);
      this.showErrorScreen(error);
    }
  }

  async initializeGameSystems() {
    console.log('Initializing isometric grid system...');

    // Initialize grid system
    this.gridSystem = new GridSystem();

    // Center the grid on screen
    this.gridSystem.updateOffset(GRID_CONFIG.canvasWidth, GRID_CONFIG.canvasHeight);

    // Initialize tile renderer
    this.tileRenderer = new TileRenderer(this.gridSystem);

    // Initialize mouse controller
    this.mouseController = new MouseController(this.gridSystem, this.app);

    // Initialize cell info panel
    this.cellInfoPanel = new CellInfoPanel();

    // Add background
    const background = new PIXI.Graphics();
    background.beginFill(COLOR_SCHEME.background);
    background.drawRect(0, 0, GRID_CONFIG.canvasWidth, GRID_CONFIG.canvasHeight);
    background.endFill();
    this.gameContainer.addChild(background);

    // Render the isometric grid
    const gridGraphics = this.tileRenderer.renderGrid();
    this.gameContainer.addChild(gridGraphics);

    // Store reference to grid graphics for mouse controller
    this.gridSystem.gridGraphics = gridGraphics;

    // Add text labels
    this.addTextLabels();

    // Add UI panel
    this.uiContainer.addChild(this.cellInfoPanel.getContainer());

    // Set up interaction callbacks
    this.setupInteractionCallbacks();

    console.log(`Rendered ${this.gridSystem.getAllCells().length} isometric tiles`);
    console.log('Mouse interaction enabled');
  }

  /**
   * Set up callbacks for mouse interactions
   */
  setupInteractionCallbacks() {
    // Update info panel when cell is selected
    this.mouseController.onCellSelect = (selectedCell, previousCell) => {
      this.cellInfoPanel.showCellInfo(selectedCell);
    };

    // Handle cell clicks (could trigger additional actions)
    this.mouseController.onCellClick = (cell) => {
      console.log('Cell clicked:', cell.serviceName);
    };

    // Handle hover changes (optional)
    this.mouseController.onCellHover = (hoveredCell, previousCell) => {
      // Could add hover effect to UI elements
    };
  }

  /**
   * Update UI positions on resize
   */
  updateUI() {
    if (this.cellInfoPanel && this.cellInfoPanel.isVisible()) {
      this.cellInfoPanel.updatePosition(this.app.screen.width, this.app.screen.height);
    }
  }

  /**
   * Add text labels for each grid cell
   */
  addTextLabels() {
    const cells = this.gridSystem.getAllCells();

    cells.forEach(cell => {
      // Create label text
      const label = cell.getDisplayLabel();

      // Create PixiJS Text object
      const text = new PIXI.Text(label, {
        fontFamily: 'Courier New',
        fontSize: 10,
        fill: 0xffffff,
        align: 'center'
      });

      // Position text at tile center
      const bounds = {
        centerX: cell.gridX * GRID_CONFIG.tileWidth / 2 + this.gridSystem.offsetX,
        centerY: cell.gridY * GRID_CONFIG.tileHeight / 2 + this.gridSystem.offsetY
      };

      text.anchor.set(0.5);
      text.position.set(bounds.centerX, bounds.centerY);

      this.textContainer.addChild(text);
    });

    console.log(`Added ${cells.length} text labels`);
  }

  addDebugInfo() {
    // Add FPS counter
    this.fpsText = new PIXI.Text('FPS: 0', {
      fontFamily: 'Courier New',
      fontSize: 12,
      fill: 0xffffff,
      align: 'left'
    });
    this.fpsText.position.set(10, 10);
    this.app.stage.addChild(this.fpsText);

    // Update FPS display in game loop
    this.app.ticker.add(() => {
      this.fpsText.text = `FPS: ${Math.round(this.app.ticker.FPS)}`;
    });
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }

  showErrorScreen(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <h1>Error Loading Game</h1>
        <p>${error.message}</p>
        <p>Check console for details.</p>
      `;
    }
  }

  onResize() {
    // Handle window resize to maintain aspect ratio
    const gameContainer = document.getElementById('game-container');
    const canvas = this.app.view;

    // Maintain aspect ratio while fitting viewport
    const aspectRatio = GRID_CONFIG.canvasWidth / GRID_CONFIG.canvasHeight;
    const viewportWidth = gameContainer.clientWidth;
    const viewportHeight = gameContainer.clientHeight;

    let newWidth = viewportWidth;
    let newHeight = viewportHeight;

    if (viewportWidth / viewportHeight > aspectRatio) {
      // Viewport is wider than game aspect ratio
      newWidth = viewportHeight * aspectRatio;
    } else {
      // Viewport is taller than game aspect ratio
      newHeight = viewportWidth / aspectRatio;
    }

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RetroGameLayer();
});
