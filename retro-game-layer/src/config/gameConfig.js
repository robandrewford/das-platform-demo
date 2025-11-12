/**
 * Game Configuration Constants
 * DAS Platform Monitor - Retro Game Layer
 */

export const GRID_CONFIG = {
  // Grid dimensions: 4×3 (tiers × environments)
  rows: 3,      // Development, Staging, Production
  cols: 4,      // Bronze, Silver, Gold, Operations

  // Isometric tile dimensions
  tileWidth: 64,
  tileHeight: 32,

  // Canvas dimensions
  canvasWidth: 1024,
  canvasHeight: 768,

  // Environment names (rows)
  environments: ['dev', 'stage', 'prod'],

  // Tier names (columns)
  tiers: ['bronze', 'silver', 'gold', 'ops']
};

export const COLOR_SCHEME = {
  // Background and UI
  background: 0x111111,
  uiText: 0xffffff,

  // Grid colors by tier
  bronze: 0x8B4513,    // Saddle brown
  silver: 0xC0C0C0,    // Silver
  gold: 0xFFD700,      // Gold
  ops: 0x800080,       // Purple

  // Environment row colors for subtle tinting
  dev: 0x1144aa,       // Blue-tinted
  stage: 0x116633,      // Green-tinted
  prod: 0x771144       // Red-tinted
};

export const SPRITE_CONFIG = {
  // Asset dimensions (rectangles for now)
  width: 32,
  height: 32,

  // Resource type colors
  s3Bucket: 0x3498db,
  snowflakeTable: 0x9b59b6,
  dataFeed: 0xe67e22,
  dataStream: 0xf39c12,
  accessPolicy: 0x95a5a6
};

export const ANIMATION_CONFIG = {
  // Health state animations
  flashDuration: 0.5,    // seconds for red flashing
  pulseDuration: 1.0,    // seconds for amber pulsing
  healthyGlowIntensity: 0.3,

  // Zoom transitions
  zoomTransition: 0.3,   // seconds
  zoomLevels: [1.0, 2.0, 4.0] // overview, focus, detail
};

export const INPUT_CONFIG = {
  // Movement speeds
  cameraPanSpeed: 200,   // pixels per second
  zoomSpeed: 1.0,        // zoom factor per second

  // Mouse settings
  doubleClickDelay: 300  // milliseconds
};

export default {
  GRID_CONFIG,
  COLOR_SCHEME,
  SPRITE_CONFIG,
  ANIMATION_CONFIG,
  INPUT_CONFIG
};
