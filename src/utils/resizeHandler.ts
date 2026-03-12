/**
 * Resize Handler for the Mini Design Canvas Editor
 * 
 * This module provides functions to handle resize operations on canvas elements.
 * It manages resize state, calculates new dimensions during resize based on
 * the handle being dragged, and applies boundary constraints and minimum
 * dimensions to ensure elements remain valid.
 * 
 * Requirements: 5.1, 5.4, 5.5, 5.6
 */

import type { ResizeState, ResizeHandle, Position, Dimensions, Element, CanvasConfig } from '../types/canvas';
import { constrainDimensions } from './boundaries';
import { snapDimensionsToGrid } from './snapToGrid';

/**
 * Initializes resize state when a resize operation begins.
 * 
 * Captures the initial mouse position, element position, and element dimensions
 * to calculate changes during the resize operation. The handle type determines
 * how the resize will affect the element's position and dimensions.
 * 
 * @param elementId - ID of the element being resized
 * @param element - The element being resized
 * @param handle - The resize handle being dragged (nw, n, ne, e, se, s, sw, w)
 * @param mousePosition - Current mouse position when resize starts
 * @returns Initial resize state
 * 
 * Requirements: 5.1
 */
export function handleResizeStart(
  elementId: string,
  element: Element,
  handle: ResizeHandle,
  mousePosition: Position
): ResizeState {
  return {
    isResizing: true,
    elementId,
    handle,
    startPosition: { ...mousePosition },
    startDimensions: { ...element.dimensions },
  };
}

/**
 * Calculates new element dimensions and position during resize operation.
 * 
 * Takes the current mouse position and resize state to calculate how the
 * element should be resized. Different handles affect dimensions differently:
 * - Corner handles (nw, ne, se, sw): resize both width and height
 * - Edge handles (n, e, s, w): resize only one dimension
 * - Some handles also change position (nw, n, ne, w)
 * 
 * Applies boundary constraints and minimum dimension constraints to ensure
 * the element remains valid.
 * 
 * @param resizeState - Current resize state
 * @param mousePosition - Current mouse position
 * @param element - Current element state (for position)
 * @param config - Canvas configuration
 * @returns Object with new dimensions and position for the element
 * 
 * Requirements: 5.1, 5.4, 5.6
 */
export function handleResizeMove(
  resizeState: ResizeState,
  mousePosition: Position,
  element: Element,
  config: CanvasConfig
): { dimensions: Dimensions; position: Position } {
  const { handle, startPosition, startDimensions } = resizeState;
  const { position: currentPosition } = element;
  
  // Calculate mouse delta from start position
  const deltaX = mousePosition.x - startPosition.x;
  const deltaY = mousePosition.y - startPosition.y;
  
  // Initialize new dimensions and position
  let newWidth = startDimensions.width;
  let newHeight = startDimensions.height;
  let newX = currentPosition.x;
  let newY = currentPosition.y;
  
  // Calculate new dimensions based on handle type
  switch (handle) {
    case 'nw': // Northwest corner - resize from top-left
      newWidth = startDimensions.width - deltaX;
      newHeight = startDimensions.height - deltaY;
      newX = currentPosition.x + deltaX;
      newY = currentPosition.y + deltaY;
      break;
      
    case 'n': // North edge - resize from top
      newHeight = startDimensions.height - deltaY;
      newY = currentPosition.y + deltaY;
      break;
      
    case 'ne': // Northeast corner - resize from top-right
      newWidth = startDimensions.width + deltaX;
      newHeight = startDimensions.height - deltaY;
      newY = currentPosition.y + deltaY;
      break;
      
    case 'e': // East edge - resize from right
      newWidth = startDimensions.width + deltaX;
      break;
      
    case 'se': // Southeast corner - resize from bottom-right
      newWidth = startDimensions.width + deltaX;
      newHeight = startDimensions.height + deltaY;
      break;
      
    case 's': // South edge - resize from bottom
      newHeight = startDimensions.height + deltaY;
      break;
      
    case 'sw': // Southwest corner - resize from bottom-left
      newWidth = startDimensions.width - deltaX;
      newHeight = startDimensions.height + deltaY;
      newX = currentPosition.x + deltaX;
      break;
      
    case 'w': // West edge - resize from left
      newWidth = startDimensions.width - deltaX;
      newX = currentPosition.x + deltaX;
      break;
  }
  
  // Apply minimum dimension constraints first
  const minWidth = config.minElementWidth;
  const minHeight = config.minElementHeight;
  
  // For handles that change position (nw, n, ne, w), we need to adjust
  // position if dimensions hit minimum
  if (newWidth < minWidth) {
    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      // Adjust position back if we hit minimum width
      newX = currentPosition.x + (startDimensions.width - minWidth);
    }
    newWidth = minWidth;
  }
  
  if (newHeight < minHeight) {
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      // Adjust position back if we hit minimum height
      newY = currentPosition.y + (startDimensions.height - minHeight);
    }
    newHeight = minHeight;
  }
  
  // Ensure position stays within bounds (non-negative)
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  
  // Apply snap-to-grid to dimensions
  const snappedDimensions = snapDimensionsToGrid(
    { width: newWidth, height: newHeight },
    config
  );
  
  // Ensure snapped dimensions still meet minimum requirements
  const finalWidth = Math.max(snappedDimensions.width, minWidth);
  const finalHeight = Math.max(snappedDimensions.height, minHeight);
  
  // Apply boundary constraints to dimensions based on position
  const constrainedDimensions = constrainDimensions(
    { width: finalWidth, height: finalHeight },
    { x: newX, y: newY },
    config
  );
  
  return {
    dimensions: constrainedDimensions,
    position: { x: newX, y: newY },
  };
}

/**
 * Completes the resize operation.
 * 
 * This function is called when the user releases the mouse button.
 * It returns the final resize state with isResizing set to false.
 * The actual dimension and position updates should be committed to state by the caller.
 * 
 * @param resizeState - Current resize state
 * @returns Final resize state with isResizing set to false
 * 
 * Requirements: 5.5
 */
export function handleResizeEnd(resizeState: ResizeState): ResizeState {
  return {
    ...resizeState,
    isResizing: false,
  };
}
