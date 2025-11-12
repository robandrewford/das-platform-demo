/**
 * DAS Platform Monitor - Retro Game Layer
 * Main entry point using PixiJS
 */

import * as PIXI from 'pixi.js';
import { GRID_CONFIG, COLOR_SCHEME } from './config/gameConfig.js';

class RetroGameLayer {
  constructor() {
    this.app = null;
    this.gameContainer = null;
    this.loadingScreen = null;

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

      // Initialize game systems
      await this.initializeGameSystems();

      // Add debug info overlay
      this.addDebugInfo();

      console.log('Retro Game Layer initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Retro Game Layer:', error);
      this.showErrorScreen(error);
    }
  }

  async initializeGameSystems() {
    // This will be expanded in future PRs
    console.log('Initializing game systems...');

    // For now, just add a simple background
    const background = new PIXI.Graphics();
    background.beginFill(COLOR_SCHEME.background);
    background.drawRect(0, 0, GRID_CONFIG.canvasWidth, GRID_CONFIG.canvasHeight);
    background.endFill();
    this.gameContainer.addChild(background);

    // Add a simple text label
    const welcomeText = new PIXI.Text('DAS Platform Monitor', {
      fontFamily: 'Courier New',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center'
    });
    welcomeText.anchor.set(0.5);
    welcomeText.position.set(GRID_CONFIG.canvasWidth / 2, GRID_CONFIG.canvasHeight / 2 - 50);
    this.gameContainer.addChild(welcomeText);

    // Add instruction text
    const instructionText = new PIXI.Text('Loading isometric grid system...', {
      fontFamily: 'Courier New',
      fontSize: 16,
      fill: 0xcccccc,
      align: 'center'
    });
    instructionText.anchor.set(0.5);
    instructionText.position.set(GRID_CONFIG.canvasWidth / 2, GRID_CONFIG.canvasHeight / 2 + 20);
    this.gameContainer.addChild(instructionText);
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
