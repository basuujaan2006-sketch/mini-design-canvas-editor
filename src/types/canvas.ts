/**
 * Type definitions for the Mini Design Canvas Editor
 * 
 * This file defines all core types used throughout the application,
 * including element types, state structures, and action types for the reducer.
 */

// Element type enumeration
export type ElementType = 'rectangle' | 'text' | 'image';

// Position interface for x, y coordinates
export interface Position {
  x: number;
  y: number;
}

// Dimensions interface for width and height
export interface Dimensions {
  width: number;
  height: number;
}

// Core Element interface representing visual objects on the canvas
export interface Element {
  id: string;
  type: ElementType;
  position: Position;
  dimensions: Dimensions;
  zIndex: number;
  // Type-specific optional properties
  color?: string;      // for rectangles
  text?: string;       // for text blocks
  imageUrl?: string;   // for image placeholders
}

// Canvas configuration interface
export interface CanvasConfig {
  width: number;
  height: number;
  gridSize: number;
  minElementWidth: number;
  minElementHeight: number;
}

// Canvas state interface - the single source of truth
export interface CanvasState {
  elements: Element[];
  selectedId: string | null;
  gridSize: number;
}

// Action types for the state reducer
export type CanvasAction =
  | { type: 'ADD_ELEMENT'; element: Element }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<Element> }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DUPLICATE_ELEMENT'; id: string };

// Resize handle type for corner and edge handles
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

// Drag state interface for tracking drag operations
export interface DragState {
  isDragging: boolean;
  elementId: string;
  startPosition: Position;
  offset: Position;
}

// Resize state interface for tracking resize operations
export interface ResizeState {
  isResizing: boolean;
  elementId: string;
  handle: ResizeHandle;
  startPosition: Position;
  startDimensions: Dimensions;
}

// Alignment guide interface for visual alignment indicators
export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  matchedElements: string[];
}

// History state interface for undo/redo functionality
export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}
