/**
 * Grid system for managing the 4×3 isometric platform tiers
 * DAS Platform Monitor - Retro Game Layer
 */

import { GRID_CONFIG, COLOR_SCHEME } from '../config/gameConfig.js';

/**
 * Represents a single grid cell mapping environment and tier
 */
export class GridCell {
  constructor(env, tier, gridX = null, gridY = null) {
    this.env = env;        // 'dev', 'stage', or 'prod'
    this.tier = tier;      // 'bronze', 'silver', 'gold', or 'ops'
    this.gridX = gridX;    // Column index (0-3)
    this.gridY = gridY;    // Row index (0-2)

    this.serviceName = this.getServiceName();
    this.color = this.getColor();
  }

  /**
   * Get the service name for this grid cell
   */
  getServiceName() {
    const prefixes = {
      dev: 'brook-commerce-dev-',
      stage: 'brook-commerce-stage-',
      prod: 'brook-commerce-prod-'
    };

    return `${prefixes[this.env]}${this.tier}`;
  }

  /**
   * Get the color for this tier/environment combination
   */
  getColor() {
    // Base color by tier
    const baseColor = COLOR_SCHEME[this.tier];
    if (!baseColor) return 0xffffff;

    // Apply environment-specific tint
    const envMultiplier = COLOR_SCHEME[this.env];
    if (!envMultiplier) return baseColor;

    // Simple color blending - combine base and environment colors
    return baseColor; // For now, just use base tier color
  }

  /**
   * Get display label for the cell
   */
  getDisplayLabel() {
    return `${this.env.toUpperCase()} ${this.tier.toUpperCase()}`;
  }

  /**
   * Get short description of the tier
   */
  getTierDescription() {
    const descriptions = {
      bronze: 'Raw data ingestion',
      silver: 'Data processing & cleaning',
      gold: 'Business-ready datasets',
      ops: 'Observability & compliance'
    };
    return descriptions[this.tier] || '';
  }
}

/**
 * Manages the 4×3 grid of platform tiers
 */
export class GridSystem {
  constructor() {
    this.grid = [];     // 2D array of GridCell objects
    this.offsetX = 0;   // Screen offset for centering
    this.offsetY = 0;   // Screen offset for centering

    this.initializeGrid();
  }

  /**
   * Initialize the grid with cells for each environment/tier combination
   */
  initializeGrid() {
    this.grid = [];

    // Create grid: rows = environments, columns = tiers
    for (let envIndex = 0; envIndex < GRID_CONFIG.environments.length; envIndex++) {
      const env = GRID_CONFIG.environments[envIndex];
      this.grid[envIndex] = [];

      for (let tierIndex = 0; tierIndex < GRID_CONFIG.tiers.length; tierIndex++) {
        const tier = GRID_CONFIG.tiers[tierIndex];

        const cell = new GridCell(env, tier, tierIndex, envIndex);
        this.grid[envIndex][tierIndex] = cell;
      }
    }

    console.log('Initialized 4×3 grid system:', `${this.grid.length} environments × ${this.grid[0]?.length} tiers`);
  }

  /**
   * Get a cell by grid coordinates
   * @param {number} x - Column (tier) index
   * @param {number} y - Row (environment) index
   */
  getCell(x, y) {
    if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length) {
      return this.grid[y][x];
    }
    return null;
  }

  /**
   * Get a cell by environment and tier names
   */
  getCellByEnvTier(env, tier) {
    const envIndex = GRID_CONFIG.environments.indexOf(env);
    const tierIndex = GRID_CONFIG.tiers.indexOf(tier);

    return this.getCell(tierIndex, envIndex);
  }

  /**
   * Get all cells as a flat array
   */
  getAllCells() {
    return this.grid.flat();
  }

  /**
   * Get cells for a specific environment (row)
   */
  getTierCellsForEnvironment(env) {
    const envIndex = GRID_CONFIG.environments.indexOf(env);
    return envIndex >= 0 ? this.grid[envIndex] : [];
  }

  /**
   * Get cells for a specific tier (column)
   */
  getEnvironmentCellsForTier(tier) {
    const tierIndex = GRID_CONFIG.tiers.indexOf(tier);
    return this.grid.map(row => row[tierIndex]).filter(cell => cell);
  }

  /**
   * Update grid offset for centering on screen
   */
  updateOffset(screenWidth, screenHeight) {
    // Center the entire grid on screen
    const totalGridWidth = GRID_CONFIG.cols * GRID_CONFIG.tileWidth / 2;
    const totalGridHeight = GRID_CONFIG.rows * GRID_CONFIG.tileHeight / 2;

    this.offsetX = (screenWidth - totalGridWidth) / 2;
    this.offsetY = (screenHeight - totalGridHeight) / 2;
  }

  /**
   * Get grid configuration
   */
  getConfig() {
    return {
      ...GRID_CONFIG,
      offsetX: this.offsetX,
      offsetY: this.offsetY
    };
  }

  /**
   * Validate grid coordinates
   */
  isValidCoord(x, y) {
    return x >= 0 && x < GRID_CONFIG.cols && y >= 0 && y < GRID_CONFIG.rows;
  }

  /**
   * Get grid dimensions
   */
  getDimensions() {
    return {
      cols: GRID_CONFIG.cols,
      rows: GRID_CONFIG.rows,
      totalCells: GRID_CONFIG.cols * GRID_CONFIG.rows
    };
  }

  /**
   * Get statistics about the grid
   */
  getStats() {
    return {
      dimensions: this.getDimensions(),
      environments: GRID_CONFIG.environments,
      tiers: GRID_CONFIG.tiers,
      serviceNames: this.getAllCells().map(cell => cell.serviceName)
    };
  }
}

// Default export
export default GridSystem;
