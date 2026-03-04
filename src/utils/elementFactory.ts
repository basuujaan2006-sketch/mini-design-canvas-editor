/**
 * Element factory functions for the Mini Design Canvas Editor
 * 
 * This module provides factory functions to create new elements (rectangles, text blocks,
 * and image placeholders) with proper initialization of all required properties.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.9
 */

import type { Element, ElementType } from '../types/canvas';

/**
 * Default initial dimensions for new elements
 */
const DEFAULT_DIMENSIONS = {
  width: 150,
  height: 100,
};

/**
 * Default initial position for new elements (centered-ish on canvas)
 */
const DEFAULT_POSITION = {
  x: 100,
  y: 100,
};

/**
 * Default color for rectangles
 */
const DEFAULT_RECTANGLE_COLOR = '#3b82f6'; // Blue

/**
 * Default text for text blocks
 */
const DEFAULT_TEXT = 'Text';

/**
 * Calculates the highest z-index from existing elements.
 * Returns 0 if no elements exist.
 * 
 * @param existingElements - Array of existing elements on the canvas
 * @returns The highest z-index value, or 0 if no elements exist
 */
function getHighestZIndex(existingElements: Element[]): number {
  if (existingElements.length === 0) {
    return 0;
  }
  return Math.max(...existingElements.map(el => el.zIndex));
}

/**
 * Creates a new rectangle element with default properties.
 * 
 * The rectangle is created with:
 * - A unique ID generated using crypto.randomUUID()
 * - Default position and dimensions
 * - A z-index higher than all existing elements
 * - A default blue color
 * 
 * Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.9
 * 
 * @param existingElements - Array of existing elements (used to determine z-index)
 * @param config - Canvas configuration (for future constraint validation)
 * @returns A new rectangle element
 */
export function createRectangle(
  existingElements: Element[]
): Element {
  const highestZIndex = getHighestZIndex(existingElements);
  
  return {
    id: crypto.randomUUID(),
    type: 'rectangle' as ElementType,
    position: { ...DEFAULT_POSITION },
    dimensions: { ...DEFAULT_DIMENSIONS },
    zIndex: highestZIndex + 1,
    color: DEFAULT_RECTANGLE_COLOR,
  };
}

/**
 * Creates a new text block element with default properties.
 * 
 * The text block is created with:
 * - A unique ID generated using crypto.randomUUID()
 * - Default position and dimensions
 * - A z-index higher than all existing elements
 * - Default text content
 * 
 * Requirements: 2.2, 2.4, 2.5, 2.6, 2.7, 2.9
 * 
 * @param existingElements - Array of existing elements (used to determine z-index)
 * @param config - Canvas configuration (for future constraint validation)
 * @returns A new text block element
 */
export function createTextBlock(
  existingElements: Element[]
): Element {
  const highestZIndex = getHighestZIndex(existingElements);
  
  return {
    id: crypto.randomUUID(),
    type: 'text' as ElementType,
    position: { ...DEFAULT_POSITION },
    dimensions: { ...DEFAULT_DIMENSIONS },
    zIndex: highestZIndex + 1,
    text: DEFAULT_TEXT,
  };
}

/**
 * Creates a new image placeholder element with default properties.
 * 
 * The image placeholder is created with:
 * - A unique ID generated using crypto.randomUUID()
 * - Default position and dimensions
 * - A z-index higher than all existing elements
 * - No imageUrl (placeholder state)
 * 
 * Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.9
 * 
 * @param existingElements - Array of existing elements (used to determine z-index)
 * @param config - Canvas configuration (for future constraint validation)
 * @returns A new image placeholder element
 */
export function createImagePlaceholder(
  existingElements: Element[]
): Element {
  const highestZIndex = getHighestZIndex(existingElements);
  
  return {
    id: crypto.randomUUID(),
    type: 'image' as ElementType,
    position: { ...DEFAULT_POSITION },
    dimensions: { ...DEFAULT_DIMENSIONS },
    zIndex: highestZIndex + 1,
    imageUrl: undefined, // Placeholder has no image initially
  };
}
