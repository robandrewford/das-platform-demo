/**
 * Mouse interaction controller for isometric grid
 * DAS Platform Monitor - Retro Game Layer
 */

import * as PIXI from 'pixi.js';
import { getGridFromScreen, isPointInIsoTile } from '../utils/coordinates.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

/**
 * Handles mouse interactions with the isometric grid
 */
export class MouseController {
  constructor(gridSystem, app) {
    this.gridSystem = gridSystem;
    this.app = app;

    // Selection state
    this.selectedCell = null;
    this.hoveredCell = null;

    // Highlight graphics
    this.highlightGraphics = new PIXI.Graphics();

    // Event tracking
    this.mousePosition = { x: 0, y: 0 };
    this.isMouseDown = false;

    // Callbacks
    this.onCellHover = null;
    this.onCellClick = null;
    this.onCellSelect = null;

    this.setupInteraction();
    this.setupMouseTracking();

    console.log('MouseController initialized');
  }

  /**
   * Set up PixiJS interaction event listeners
   */
  setupInteraction() {
    this.app.stage.interactive = true;
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, this.app.screen.width, this.app.screen.height);

    // Mouse move - hover detection
    this.app.stage.on('mousemove', this.onMouseMove.bind(this));

    // Pointer down - click detection
    this.app.stage.on('pointerdown', this.onPointerDown.bind(this));

    // Global mouse up
    this.app.stage.on('pointerup', this.onPointerUp.bind(this));
    this.app.stage.on('pointerupoutside', this.onPointerUp.bind(this));

    console.log('Interaction events set up');
  }

  /**
   * Set up mouse position tracking
   */
  setupMouseTracking() {
    this.app.stage.on('mousemove', (event) => {
      this.mousePosition.x = event.data.global.x;
      this.mousePosition.y = event.data.global.y;
    });

    this.app.stage.on('pointermove', (event) => {
      this.mousePosition.x = event.data.global.x;
      this.mousePosition.y = event.data.global.y;
    });
  }

  /**
   * Handle mouse movement (hover detection)
   */
  onMouseMove(event) {
    const mousePos = event.data.global;

    // Check if mouse is over a valid grid cell
    const gridCoords = getGridFromScreen(
      mousePos.x, mousePos.y,
      GRID_CONFIG.tileWidth, GRID_CONFIG.tileHeight,
      this.gridSystem.offsetX, this.gridSystem.offsetY
    );

    const newHoveredCell = this.gridSystem.isValidCoord(gridCoords.gridX, gridCoords.gridY)
      ? this.gridSystem.getCell(gridCoords.gridX, gridCoords.gridY)
      : null;

    // If hover cell changed, update highlight
    if (this.hoveredCell !== newHoveredCell) {
      this.setHoveredCell(newHoveredCell);
    }
  }

  /**
   * Handle pointer down (click start)
   */
  onPointerDown(event) {
    this.isMouseDown = true;
    console.log('Mouse down at:', event.data.global);
  }

  /**
   * Handle pointer up (click complete)
   */
  onPointerUp(event) {
    if (!this.isMouseDown) return;

    this.isMouseDown = false;
    const mousePos = event.data.global;

    // Check if clicked on a valid grid cell
    const gridCoords = getGridFromScreen(
      mousePos.x, mousePos.y,
      GRID_CONFIG.tileWidth, GRID_CONFIG.tileHeight,
      this.gridSystem.offsetX, this.gridSystem.offsetY
    );

    if (this.gridSystem.isValidCoord(gridCoords.gridX, gridCoords.gridY)) {
      const clickedCell = this.gridSystem.getCell(gridCoords.gridX, gridCoords.gridY);
      this.selectCell(clickedCell);

      // Callback if provided
      if (this.onCellClick) {
        this.onCellClick(clickedCell);
      }

      console.log('Clicked cell:', clickedCell.getDisplayLabel());
    }
  }

  /**
   * Set the currently hovered cell and update highlighting
   */
  setHoveredCell(cell) {
    const previousHover = this.hoveredCell;
    this.hoveredCell = cell;

    // Update highlight if it's not the selected cell
    if (cell && cell !== this.selectedCell) {
      this.updateHoverHighlight();
    } else if (!cell && previousHover) {
      // Clear highlight if moving away from any cell
      this.clearHoverHighlight();
    }

    // Callback if provided
    if (this.onCellHover && cell !== previousHover) {
      this.onCellHover(cell, previousHover);
    }
  }

  /**
   * Select a cell (different from hover - persists)
   */
  selectCell(cell) {
    const previousSelection = this.selectedCell;
    this.selectedCell = cell;

    // Update selection highlighting
    this.updateSelectionHighlight();

    // If selecting same cell, deselect it
    if (previousSelection === cell) {
      this.selectedCell = null;
    }

    // Clear hover highlight if selecting (they shouldn't overlap visually)
    if (this.selectedCell) {
      this.clearHoverHighlight();
      this.hoveredCell = null;
    }

    // Callback if provided
    if (this.onCellSelect && this.selectedCell !== previousSelection) {
      this.onCellSelect(this.selectedCell, previousSelection);
    }

    console.log('Selected cell:', cell ? cell.getDisplayLabel() : 'None');
  }

  /**
   * Update the hover highlight visual
   */
  updateHoverHighlight() {
    this.clearHoverHighlight(); // Clear first

    if (this.hoveredCell && this.hoveredCell !== this.selectedCell) {
      // Use the existing tile renderer to add a highlight border
      const gridGraphics = this.gridSystem.gridGraphics;
      if (gridGraphics) {
        // Add highlight border with yellow color
        gridGraphics.lineStyle(3, 0xffff00, 0.8); // Yellow highlight

        // Draw highlight around the tile
        const bounds = {
          left: this.hoveredCell.gridX * GRID_CONFIG.tileWidth / 2 + this.gridSystem.offsetX - GRID_CONFIG.tileWidth / 2,
          top: this.hoveredCell.gridY * GRID_CONFIG.tileHeight / 2 + this.gridSystem.offsetY - GRID_CONFIG.tileHeight / 2,
          right: this.hoveredCell.gridX * GRID_CONFIG.tileWidth / 2 + this.gridSystem.offsetX + GRID_CONFIG.tileWidth / 2,
          bottom: this.hoveredCell.gridY * GRID_CONFIG.tileHeight / 2 + this.gridSystem.offsetY + GRID_CONFIG.tileHeight / 2
        };

        gridGraphics.drawRect(bounds.left, bounds.top,
                            bounds.right - bounds.left,
                            bounds.bottom - bounds.top);

        gridGraphics.lineStyle(0); // Reset line style
      }
    }
  }

  /**
   * Clear the hover highlight
   */
  clearHoverHighlight() {
    // For now, we need to re-render the grid to clear highlights
    // In production, we'd track highlight elements separately for better performance
    if (this.gridSystem.gridGraphics) {
      this.gridSystem.gridGraphics.clear();
      // Re-render the base grid
      const cells = this.gridSystem.getAllCells();
      cells.forEach(cell => this.renderTile(cell));
    }
  }

  /**
   * Update selection highlighting (persistent selection markers)
   */
  updateSelectionHighlight() {
    // Selection could be shown differently - maybe a different colored highlight
    // or separate visual layer. For now, we'll track selection for future use.
    if (this.selectedCell) {
      console.log(`Selected: ${this.selectedCell.getDisplayLabel()} - ${this.selectedCell.serviceName}`);
    }
  }

  /**
   * Simple tile rendering (could be moved to TileRenderer)
   */
  renderTile(cell) {
    // Basic tile rendering for clearing/re-drawing
    // This is a simplified version - ideally would use TileRenderer
    const gridGraphics = this.gridSystem.gridGraphics;
    if (!gridGraphics) return;

    // Placeholder - in full implementation, integrate with TileRenderer
  }

  /**
   * Get current hover state
   */
  getHoveredCell() {
    return this.hoveredCell;
  }

  /**
   * Get current selection state
   */
  getSelectedCell() {
    return this.selectedCell;
  }

  /**
   * Set grid graphics reference (for highlighting)
   */
  setGridGraphics(graphics) {
    this.gridSystem.gridGraphics = graphics;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.app.stage.off('mousemove', this.onMouseMove.bind(this));
    this.app.stage.off('pointerdown', this.onPointerDown.bind(this));
    this.app.stage.off('pointerup', this.onPointerUp.bind(this));
    this.app.stage.off('pointerupoutside', this.onPointerUp.bind(this));

    console.log('MouseController cleaned up');
  }
}

// Default export
export default MouseController;
