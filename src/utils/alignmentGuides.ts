/**
 * Alignment Guide Utilities for the Mini Design Canvas Editor
 * 
 * This module provides functions to detect when elements align with each other
 * during drag operations. It checks for edge and center alignments within a
 * configurable threshold and returns guide information for visual rendering.
 * 
 * Requirements: 12.1, 12.5, 12.6
 */

import type { Element, AlignmentGuide } from '../types/canvas';

/**
 * Detects alignment between a moving element and other elements on the canvas.
 * 
 * This function checks for the following alignment types:
 * - Horizontal alignments: left edge, center-x, right edge
 * - Vertical alignments: top edge, center-y, bottom edge
 * 
 * An alignment is detected when the difference between corresponding edges or
 * centers is within the specified threshold (e.g., 5 pixels).
 * 
 * @param movingElement - The element being dragged
 * @param otherElements - All other elements on the canvas to check against
 * @param threshold - Maximum distance in pixels to consider an alignment (default: 5)
 * @returns Array of alignment guides to render
 * 
 * Requirements: 12.1, 12.5, 12.6
 */
export function detectAlignments(
  movingElement: Element,
  otherElements: Element[],
  threshold: number = 5
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];

  // Calculate edges and center for the moving element
  const movingLeft = movingElement.position.x;
  const movingRight = movingElement.position.x + movingElement.dimensions.width;
  const movingTop = movingElement.position.y;
  const movingBottom = movingElement.position.y + movingElement.dimensions.height;
  const movingCenterX = movingElement.position.x + movingElement.dimensions.width / 2;
  const movingCenterY = movingElement.position.y + movingElement.dimensions.height / 2;

  // Check alignment with each other element
  for (const element of otherElements) {
    // Skip the moving element itself
    if (element.id === movingElement.id) {
      continue;
    }

    // Calculate edges and center for the comparison element
    const elementLeft = element.position.x;
    const elementRight = element.position.x + element.dimensions.width;
    const elementTop = element.position.y;
    const elementBottom = element.position.y + element.dimensions.height;
    const elementCenterX = element.position.x + element.dimensions.width / 2;
    const elementCenterY = element.position.y + element.dimensions.height / 2;

    // Check vertical alignments (left, center-x, right)
    
    // Left edge alignment
    if (Math.abs(movingLeft - elementLeft) <= threshold) {
      addOrUpdateGuide(guides, 'vertical', elementLeft, element.id);
    }

    // Center-x alignment
    if (Math.abs(movingCenterX - elementCenterX) <= threshold) {
      addOrUpdateGuide(guides, 'vertical', elementCenterX, element.id);
    }

    // Right edge alignment
    if (Math.abs(movingRight - elementRight) <= threshold) {
      addOrUpdateGuide(guides, 'vertical', elementRight, element.id);
    }

    // Check horizontal alignments (top, center-y, bottom)
    
    // Top edge alignment
    if (Math.abs(movingTop - elementTop) <= threshold) {
      addOrUpdateGuide(guides, 'horizontal', elementTop, element.id);
    }

    // Center-y alignment
    if (Math.abs(movingCenterY - elementCenterY) <= threshold) {
      addOrUpdateGuide(guides, 'horizontal', elementCenterY, element.id);
    }

    // Bottom edge alignment
    if (Math.abs(movingBottom - elementBottom) <= threshold) {
      addOrUpdateGuide(guides, 'horizontal', elementBottom, element.id);
    }
  }

  return guides;
}

/**
 * Helper function to add a new guide or update an existing one.
 * 
 * If a guide already exists at the same position with the same type,
 * this function adds the element ID to the matchedElements array.
 * Otherwise, it creates a new guide.
 * 
 * @param guides - Array of existing guides
 * @param type - Type of guide (vertical or horizontal)
 * @param position - Position of the guide line
 * @param elementId - ID of the element that matches this alignment
 */
function addOrUpdateGuide(
  guides: AlignmentGuide[],
  type: 'vertical' | 'horizontal',
  position: number,
  elementId: string
): void {
  // Check if a guide already exists at this position with this type
  const existingGuide = guides.find(
    (guide) => guide.type === type && guide.position === position
  );

  if (existingGuide) {
    // Add element ID to existing guide if not already present
    if (!existingGuide.matchedElements.includes(elementId)) {
      existingGuide.matchedElements.push(elementId);
    }
  } else {
    // Create new guide
    guides.push({
      type,
      position,
      matchedElements: [elementId],
    });
  }
}
