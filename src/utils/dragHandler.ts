/**
 * Drag Handler for the Mini Design Canvas Editor
 * 
 * This module provides functions to handle drag operations on canvas elements.
 * It manages drag state, calculates new positions during drag, and applies
 * boundary constraints to ensure elements remain within the canvas.
 * 
 * Requirements: 4.1, 4.3, 4.4
 */

import type { DragState, Position, Element, CanvasConfig } from '../types/canvas';
import { constrainPosition } from './boundaries';
import { snapPositionToGrid } from './snapToGrid';

/**
 * Initializes drag state when a drag operation begins.
 * 
 * Captures the initial mouse position and element position to calculate
 * the offset between them. This offset is used during drag to maintain
 * the relative position of the mouse within the element.
 * 
 * @param elementId - ID of the element being dragged
 * @param element - The element being dragged
 * @param mousePosition - Current mouse position when drag starts
 * @returns Initial drag state
 * 
 * Requirements: 4.1
 */
export function handleDragStart(
  elementId: string,
  element: Element,
  mousePosition: Position
): DragState {
  // Calculate offset between mouse position and element position
  // This allows us to maintain the relative position during drag
  const offset: Position = {
    x: mousePosition.x - element.position.x,
    y: mousePosition.y - element.position.y,
  };

  return {
    isDragging: true,
    elementId,
    startPosition: { ...element.position },
    offset,
  };
}

/**
 * Calculates new element position during drag operation.
 * 
 * Takes the current mouse position and drag state to calculate where
 * the element should be positioned. Applies boundary constraints to
 * ensure the element stays within the canvas.
 * 
 * @param dragState - Current drag state
 * @param mousePosition - Current mouse position
 * @param dimensions - Element dimensions (needed for boundary constraints)
 * @param config - Canvas configuration
 * @returns New position for the element, constrained to canvas bounds
 * 
 * Requirements: 4.1, 4.4
 */
export function handleDragMove(
  dragState: DragState,
  mousePosition: Position,
  dimensions: { width: number; height: number },
  config: CanvasConfig
): Position {
  // Calculate new position based on mouse position and offset
  const newPosition: Position = {
    x: mousePosition.x - dragState.offset.x,
    y: mousePosition.y - dragState.offset.y,
  };

  // Apply snap-to-grid to position
  const snappedPosition = snapPositionToGrid(newPosition, config);

  // Apply boundary constraints to keep element within canvas
  return constrainPosition(snappedPosition, dimensions, config);
}

/**
 * Completes the drag operation.
 * 
 * This function is called when the user releases the mouse button.
 * It returns the final drag state with isDragging set to false.
 * The actual position update should be committed to state by the caller.
 * 
 * @param dragState - Current drag state
 * @returns Final drag state with isDragging set to false
 * 
 * Requirements: 4.3
 */
export function handleDragEnd(dragState: DragState): DragState {
  return {
    ...dragState,
    isDragging: false,
  };
}
