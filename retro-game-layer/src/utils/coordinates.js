/**
 * Coordinate transformation utilities for isometric grid
 * DAS Platform Monitor - Retro Game Layer
 */

/**
 * Convert Cartesian coordinates to isometric screen coordinates
 * @param {number} x - Cartesian X coordinate
 * @param {number} y - Cartesian Y coordinate
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @returns {Object} Screen coordinates {x, y}
 */
export function cartToIso(x, y, tileWidth = 64, tileHeight = 32) {
  return {
    x: (x - y) * (tileWidth / 2),
    y: (x + y) * (tileHeight / 2)
  };
}

/**
 * Convert isometric screen coordinates to Cartesian grid coordinates
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @returns {Object} Cartesian grid coordinates {x, y}
 */
export function isoToCart(screenX, screenY, tileWidth = 64, tileHeight = 32) {
  // Inverse transformation matrix
  const isoX = screenX / (tileWidth / 2);
  const isoY = screenY / (tileHeight / 2);

  return {
    x: (isoX + isoY) / 2,
    y: (isoY - isoX) / 2
  };
}

/**
 * Get the screen bounds of an isometric tile
 * @param {number} gridX - Grid column
 * @param {number} gridY - Grid row
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @param {number} offsetX - X offset for centering
 * @param {number} offsetY - Y offset for centering
 * @returns {Object} Bounding box {left, top, right, bottom, centerX, centerY}
 */
export function getIsoTileBounds(gridX, gridY, tileWidth = 64, tileHeight = 32, offsetX = 0, offsetY = 0) {
  const { x: screenX, y: screenY } = cartToIso(gridX, gridY, tileWidth, tileHeight);

  // Diamond shape points relative to center
  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;

  const centerX = screenX + offsetX;
  const centerY = screenY + offsetY;

  return {
    left: centerX - halfWidth,
    top: centerY - halfHeight,
    right: centerX + halfWidth,
    bottom: centerY + halfHeight,
    centerX,
    centerY,
    points: [
      { x: centerX, y: centerY - halfHeight }, // Top
      { x: centerX + halfWidth, y: centerY },  // Right
      { x: centerX, y: centerY + halfHeight }, // Bottom
      { x: centerX - halfWidth, y: centerY }   // Left
    ]
  };
}

/**
 * Check if a point is inside an isometric tile bounds
 * @param {number} pointX - Screen X coordinate
 * @param {number} pointY - Screen Y coordinate
 * @param {number} gridX - Grid column
 * @param {number} gridY - Grid row
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @param {number} offsetX - X offset for centering
 * @param {number} offsetY - Y offset for centering
 * @returns {boolean} True if point is inside tile
 */
export function isPointInIsoTile(pointX, pointY, gridX, gridY, tileWidth = 64, tileHeight = 32, offsetX = 0, offsetY = 0) {
  const bounds = getIsoTileBounds(gridX, gridY, tileWidth, tileHeight, offsetX, offsetY);

  // Use the diamond shape check (simplified bounding box for performance)
  return pointX >= bounds.left && pointX <= bounds.right &&
         pointY >= bounds.top && pointY <= bounds.bottom;
}

/**
 * Get the grid coordinates from screen position
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @param {number} offsetX - X offset for centering
 * @param {number} offsetY - Y offset for centering
 * @returns {Object} Grid coordinates {gridX, gridY} or null if not found
 */
export function getGridFromScreen(screenX, screenY, tileWidth = 64, tileHeight = 32, offsetX = 0, offsetY = 0) {
  // Adjust for offset
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;

  const { x: gridX, y: gridY } = isoToCart(adjustedX, adjustedY, tileWidth, tileHeight);

  // Round to nearest grid position
  return {
    gridX: Math.round(gridX),
    gridY: Math.round(gridY)
  };
}

/**
 * Center the isometric grid on screen
 * @param {number} gridCols - Number of columns
 * @param {number} gridRows - Number of rows
 * @param {number} tileWidth - Width of isometric tile
 * @param {number} tileHeight - Height of isometric tile
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @returns {Object} Offset coordinates {offsetX, offsetY}
 */
export function centerGridOnScreen(gridCols, gridRows, tileWidth, tileHeight, screenWidth, screenHeight) {
  // Calculate total grid dimensions in screen space
  const lastTile = cartToIso(gridCols - 1, gridRows - 1, tileWidth, tileHeight);
  const gridWidth = lastTile.x + tileWidth;
  const gridHeight = lastTile.y + tileHeight;

  return {
    offsetX: (screenWidth - gridWidth) / 2,
    offsetY: (screenHeight - gridHeight) / 2
  };
}
