/**
 * Snap-to-Grid Utilities for the Mini Design Canvas Editor
 * 
 * This module provides functions to snap element positions and dimensions
 * to a grid for precise alignment. The grid size is configurable through
 * the CanvasConfig.
 * 
 * Requirements: 11.1, 11.2, 11.3
 */

import type { Position, Dimensions, CanvasConfig } from '../types/canvas';

/**
 * Snaps a position to the nearest grid point.
 * 
 * Both x and y coordinates are rounded to the nearest multiple of the grid size.
 * For example, with a grid size of 10:
 * - (23, 47) -> (20, 50)
 * - (5, 5) -> (10, 10)
 * - (0, 0) -> (0, 0)
 * 
 * @param position - The position to snap
 * @param config - Canvas configuration containing grid size
 * @returns A new position snapped to the grid
 * 
 * Requirements: 11.1, 11.3
 */
export function snapPositionToGrid(
  position: Position,
  config: CanvasConfig
): Position {
  const { gridSize } = config;
  
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Snaps dimensions to grid increments.
 * 
 * Both width and height are rounded to the nearest multiple of the grid size.
 * This ensures that resized elements align with the grid system.
 * 
 * Note: The result may need to be further constrained by minimum dimension
 * requirements. This function only handles grid snapping.
 * 
 * @param dimensions - The dimensions to snap
 * @param config - Canvas configuration containing grid size
 * @returns New dimensions snapped to grid increments
 * 
 * Requirements: 11.2, 11.3
 */
export function snapDimensionsToGrid(
  dimensions: Dimensions,
  config: CanvasConfig
): Dimensions {
  const { gridSize } = config;
  
  return {
    width: Math.round(dimensions.width / gridSize) * gridSize,
    height: Math.round(dimensions.height / gridSize) * gridSize,
  };
}
