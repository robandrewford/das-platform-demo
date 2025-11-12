/**
 * Tile renderer for drawing isometric diamond-shaped tiles
 * DAS Platform Monitor - Retro Game Layer
 */

import * as PIXI from 'pixi.js';
import { getIsoTileBounds } from '../utils/coordinates.js';
import { GRID_CONFIG } from '../config/gameConfig.js';

/**
 * Renders isometric tiles using PixiJS Graphics
 */
export class TileRenderer {
  constructor(gridSystem) {
    this.gridSystem = gridSystem;
    this.graphics = new PIXI.Graphics();

    // Cache for tile graphics to avoid recreating them
    this.tileCache = new Map();
  }

  /**
   * Render the entire grid
   */
  renderGrid() {
    this.graphics.clear();

    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        this.renderTile(col, row);
      }
    }

    return this.graphics;
  }

  /**
   * Render a single tile at grid coordinates
   */
  renderTile(gridX, gridY) {
    const cell = this.gridSystem.getCell(gridX, gridY);
    if (!cell) return;

    const bounds = getIsoTileBounds(
      gridX,
      gridY,
      GRID_CONFIG.tileWidth,
      GRID_CONFIG.tileHeight,
      this.gridSystem.offsetX,
      this.gridSystem.offsetY
    );

    // Draw diamond-shaped tile
    this.drawDiamondTile(bounds, cell.color);
    this.drawTileOutline(bounds);
    this.drawTileLabel(bounds, cell);
  }

  /**
   * Draw a diamond-shaped tile
   */
  drawDiamondTile(bounds, color) {
    this.graphics.beginFill(color);

    // Draw diamond shape using the 4 corner points
    this.graphics.moveTo(bounds.points[0].x, bounds.points[0].y); // Top
    this.graphics.lineTo(bounds.points[1].x, bounds.points[1].y); // Right
    this.graphics.lineTo(bounds.points[2].x, bounds.points[2].y); // Bottom
    this.graphics.lineTo(bounds.points[3].x, bounds.points[3].y); // Left
    this.graphics.lineTo(bounds.points[0].x, bounds.points[0].y); // Back to top

    this.graphics.endFill();
  }

  /**
   * Draw tile outline for definition
   */
  drawTileOutline(bounds) {
    this.graphics.lineStyle(1, 0x000000, 0.3);
    this.graphics.moveTo(bounds.points[0].x, bounds.points[0].y);
    this.graphics.lineTo(bounds.points[1].x, bounds.points[1].y);
    this.graphics.lineTo(bounds.points[2].x, bounds.points[2].y);
    this.graphics.lineTo(bounds.points[3].x, bounds.points[3].y);
    this.graphics.lineTo(bounds.points[0].x, bounds.points[0].y);

    this.graphics.lineStyle(0); // Reset line style
  }

  /**
   * Draw tile label with environment and tier
   */
  drawTileLabel(bounds, cell) {
    // Simple text label for now
    // In a more complete implementation, we'd create a separate text layer
    const label = cell.getDisplayLabel();

    // Calculate small font size based on tile size
    const fontSize = Math.min(GRID_CONFIG.tileWidth / 8, GRID_CONFIG.tileHeight / 4);
    if (fontSize < 8) return; // Skip text if tile is too small

    // Note: Text rendering is simplified here
    // Production code would use PIXI.Text objects added to a separate container
    console.log(`Tile ${cell.gridX},${cell.gridY}: ${label}`);
  }

  /**
   * Highlight a specific tile (e.g., on hover)
   */
  highlightTile(gridX, gridY, highlightColor = 0xffff00) {
    this.clear();

    // Re-render whole grid
    this.renderGrid();

    // Add highlight overlay
    const cell = this.gridSystem.getCell(gridX, gridY);
    if (!cell) return;

    const bounds = getIsoTileBounds(
      gridX,
      gridY,
      GRID_CONFIG.tileWidth,
      GRID_CONFIG.tileHeight,
      this.gridSystem.offsetX,
      this.gridSystem.offsetY
    );

    // Draw highlight border
    this.graphics.lineStyle(3, highlightColor, 1);
    this.graphics.moveTo(bounds.points[0].x, bounds.points[0].y);
    this.graphics.lineTo(bounds.points[1].x, bounds.points[1].y);
    this.graphics.lineTo(bounds.points[2].x, bounds.points[2].y);
    this.graphics.lineTo(bounds.points[3].x, bounds.points[3].y);
    this.graphics.lineTo(bounds.points[0].x, bounds.points[0].y);

    this.graphics.lineStyle(0); // Reset line style
  }

  /**
   * Clear the renderer
   */
  clear() {
    this.graphics.clear();
  }

  /**
   * Update the renderer when screen size changes
   */
  onResize() {
    // Refresh the entire render when resizing
    this.clear();
    this.renderGrid();
  }

  /**
   * Get the PixiJS Graphics object for adding to stage
   */
  getGraphicsObject() {
    return this.graphics;
  }
}

// Default export
export default TileRenderer;
