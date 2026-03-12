/**
 * Boundary constraint utilities for the Mini Design Canvas Editor
 * 
 * This module provides functions to ensure elements remain within canvas bounds
 * and to validate element positions and dimensions.
 * 
 * Requirements: 1.3, 2.8, 4.4, 5.4
 */

import type { Element, Position, Dimensions, CanvasConfig } from '../types/canvas';

/**
 * Constrains an element's position and dimensions to remain within canvas bounds.
 * 
 * This function ensures that:
 * - Element position is non-negative (x >= 0, y >= 0)
 * - Element stays fully within canvas (x + width <= canvasWidth, y + height <= canvasHeight)
 * - Handles edge cases like elements larger than canvas or negative positions
 * 
 * @param element - The element to constrain
 * @param config - Canvas configuration with width and height
 * @returns A new element with constrained position and dimensions
 */
export function constrainToCanvas(
  element: Element,
  config: CanvasConfig
): Element {
  const { position, dimensions } = element;
  const { width: canvasWidth, height: canvasHeight } = config;

  // Handle edge case: element larger than canvas
  // Clamp dimensions to canvas size
  const constrainedWidth = Math.min(dimensions.width, canvasWidth);
  const constrainedHeight = Math.min(dimensions.height, canvasHeight);

  // Clamp position to ensure element stays within bounds
  // x must be: 0 <= x <= canvasWidth - elementWidth
  // y must be: 0 <= y <= canvasHeight - elementHeight
  const constrainedX = Math.max(
    0,
    Math.min(position.x, canvasWidth - constrainedWidth)
  );
  const constrainedY = Math.max(
    0,
    Math.min(position.y, canvasHeight - constrainedHeight)
  );

  return {
    ...element,
    position: {
      x: constrainedX,
      y: constrainedY,
    },
    dimensions: {
      width: constrainedWidth,
      height: constrainedHeight,
    },
  };
}

/**
 * Validates whether an element is fully within canvas bounds.
 * 
 * An element is considered within bounds if:
 * - position.x >= 0
 * - position.y >= 0
 * - position.x + dimensions.width <= canvasWidth
 * - position.y + dimensions.height <= canvasHeight
 * 
 * @param element - The element to validate
 * @param config - Canvas configuration with width and height
 * @returns true if element is fully within bounds, false otherwise
 */
export function isWithinBounds(
  element: Element,
  config: CanvasConfig
): boolean {
  const { position, dimensions } = element;
  const { width: canvasWidth, height: canvasHeight } = config;

  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + dimensions.width <= canvasWidth &&
    position.y + dimensions.height <= canvasHeight
  );
}

/**
 * Constrains a position to remain within canvas bounds for a given element size.
 * 
 * This is useful for drag operations where you want to constrain just the position
 * without modifying the element dimensions.
 * 
 * @param position - The position to constrain
 * @param dimensions - The dimensions of the element
 * @param config - Canvas configuration with width and height
 * @returns A new position constrained to canvas bounds
 */
export function constrainPosition(
  position: Position,
  dimensions: Dimensions,
  config: CanvasConfig
): Position {
  const { width: canvasWidth, height: canvasHeight } = config;

  return {
    x: Math.max(0, Math.min(position.x, canvasWidth - dimensions.width)),
    y: Math.max(0, Math.min(position.y, canvasHeight - dimensions.height)),
  };
}

/**
 * Constrains dimensions to remain within canvas bounds for a given position.
 * 
 * This is useful for resize operations where you want to constrain dimensions
 * while respecting minimum size constraints.
 * 
 * @param dimensions - The dimensions to constrain
 * @param position - The position of the element
 * @param config - Canvas configuration with width, height, and minimum dimensions
 * @returns New dimensions constrained to canvas bounds and minimum sizes
 */
export function constrainDimensions(
  dimensions: Dimensions,
  position: Position,
  config: CanvasConfig
): Dimensions {
  const { width: canvasWidth, height: canvasHeight, minElementWidth, minElementHeight } = config;

  // Calculate maximum allowed dimensions based on position
  const maxWidth = canvasWidth - position.x;
  const maxHeight = canvasHeight - position.y;

  return {
    width: Math.max(
      minElementWidth,
      Math.min(dimensions.width, maxWidth)
    ),
    height: Math.max(
      minElementHeight,
      Math.min(dimensions.height, maxHeight)
    ),
  };
}
