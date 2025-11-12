/**
 * Info panel for displaying selected cell details
 * DAS Platform Monitor - Retro Game Layer
 */

import * as PIXI from 'pixi.js';
import { COLOR_SCHEME } from '../config/gameConfig.js';

/**
 * Displays information about the currently selected grid cell
 */
export class CellInfoPanel {
  constructor() {
    this.panel = new PIXI.Container();
    this.background = null;
    this.titleText = null;
    this.detailText = null;

    this.selectedCell = null;
    this.visible = false;

    this.createPanel();

    console.log('CellInfoPanel initialized');
  }

  /**
   * Create the info panel graphics and text elements
   */
  createPanel() {
    // Panel background
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.8);
    this.background.lineStyle(2, COLOR_SCHEME.ops, 1);
    this.background.drawRoundedRect(0, 0, 250, 120, 8);
    this.background.endFill();
    this.panel.addChild(this.background);

    // Title text (cell name)
    this.titleText = new PIXI.Text('No Cell Selected', {
      fontFamily: 'Courier New',
      fontSize: 14,
      fill: 0xffffff,
      align: 'left'
    });
    this.titleText.position.set(10, 10);
    this.panel.addChild(this.titleText);

    // Detail text (tier description + service name)
    this.detailText = new PIXI.Text('', {
      fontFamily: 'Courier New',
      fontSize: 11,
      fill: 0xcccccc,
      align: 'left'
    });
    this.detailText.position.set(10, 35);
    this.panel.addChild(this.detailText);

    // Position the panel (top-right corner)
    this.panel.position.set(10, 30);

    // Initially hidden
    this.panel.visible = false;
  }

  /**
   * Show information for the selected cell
   */
  showCellInfo(cell) {
    this.selectedCell = cell;

    if (cell) {
      // Update title with cell display label
      this.titleText.text = cell.getDisplayLabel();

      // Update details with tier description and service name
      const tierDesc = cell.getTierDescription();
      const serviceName = cell.serviceName;
      this.detailText.text = `${tierDesc}\nService: ${serviceName}`;

      this.showPanel();
    } else {
      this.hidePanel();
    }
  }

  /**
   * Show the info panel
   */
  showPanel() {
    this.panel.visible = true;
    this.visible = true;
    console.log('Showing cell info panel');
  }

  /**
   * Hide the info panel
   */
  hidePanel() {
    this.panel.visible = false;
    this.visible = false;
    this.selectedCell = null;
    console.log('Hiding cell info panel');
  }

  /**
   * Update panel position (responsive to screen size)
   */
  updatePosition(screenWidth, screenHeight) {
    // Keep panel in top-right but adjust if too close to edge
    const panelWidth = 250;
    const panelHeight = 120;
    const margin = 10;

    let x = margin;
    let y = margin + 20; // Below FPS counter

    // If panel would go off screen, adjust position
    if (x + panelWidth > screenWidth) {
      x = screenWidth - panelWidth - margin;
    }

    this.panel.position.set(x, y);
  }

  /**
   * Get the PixiJS container for adding to stage
   */
  getContainer() {
    return this.panel;
  }

  /**
   * Get current selection state
   */
  getSelectedCell() {
    return this.selectedCell;
  }

  /**
   * Check if panel is visible
   */
  isVisible() {
    return this.visible;
  }
}

// Default export
export default CellInfoPanel;
