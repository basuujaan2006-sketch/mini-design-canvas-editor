/**
 * Canvas State Management Hook
 * 
 * This hook provides centralized state management for the canvas using React's useReducer.
 * It handles all state transitions for elements, selection, and maintains immutability.
 * Integrates with history management for undo/redo functionality.
 * 
 * Requirements: 8.1, 8.2, 8.3, 13.7
 */

import { useCallback } from 'react';
import { useHistory } from './useHistory';
import type { CanvasState, CanvasAction } from '../types/canvas';

/**
 * Creates the initial canvas state
 * 
 * @param gridSize - The grid size for snap-to-grid functionality (default: 10)
 * @returns Initial canvas state with empty elements and no selection
 */
export function createInitialState(gridSize: number = 10): CanvasState {
  return {
    elements: [],
    selectedId: null,
    gridSize,
  };
}

/**
 * Canvas state reducer function
 * 
 * Handles all state transitions for the canvas in an immutable way.
 * Each action returns a new state object to ensure predictable updates.
 * 
 * @param state - Current canvas state
 * @param action - Action to perform
 * @returns New canvas state
 */
export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      // Add new element to the canvas
      // Requirements: 2.1, 2.2, 2.3, 2.4, 8.1
      return {
        ...state,
        elements: [...state.elements, action.element],
      };
    }

    case 'DELETE_ELEMENT': {
      // Remove element from canvas and clear selection if it was selected
      // Requirements: 7.1, 7.3, 7.4, 8.1
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }

    case 'UPDATE_ELEMENT': {
      // Update specific properties of an element
      // Requirements: 4.3, 5.5, 8.1, 8.6
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.id
            ? { ...el, ...action.updates }
            : el
        ),
      };
    }

    case 'SELECT_ELEMENT': {
      // Update the selected element ID
      // Requirements: 3.1, 3.4, 3.5, 3.6, 8.2
      return {
        ...state,
        selectedId: action.id,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      // Duplicate the selected element with offset position and higher z-index
      // Requirements: 10.2, 10.3
      const elementToDuplicate = state.elements.find(el => el.id === action.id);
      
      if (!elementToDuplicate) {
        return state;
      }

      // Find the highest z-index to ensure new element appears on top
      const maxZIndex = state.elements.reduce(
        (max, el) => Math.max(max, el.zIndex),
        0
      );

      // Create new element with same properties but new ID, offset position, and higher z-index
      const duplicatedElement = {
        ...elementToDuplicate,
        id: crypto.randomUUID(),
        position: {
          x: elementToDuplicate.position.x + 20,
          y: elementToDuplicate.position.y + 20,
        },
        zIndex: maxZIndex + 1,
      };

      return {
        ...state,
        elements: [...state.elements, duplicatedElement],
      };
    }

    default:
      return state;
  }
}

/**
 * Custom hook for canvas state management with integrated history
 * 
 * Wraps useHistory to provide canvas state with undo/redo functionality.
 * This hook is the primary interface for managing canvas state throughout the application.
 * 
 * Automatically tracks state changes for:
 * - Element creation (ADD_ELEMENT)
 * - Element deletion (DELETE_ELEMENT)
 * - Element movement and resizing (UPDATE_ELEMENT)
 * - Element duplication (DUPLICATE_ELEMENT)
 * 
 * Selection changes (SELECT_ELEMENT) are NOT tracked in history as they don't modify
 * the canvas content itself.
 * 
 * @param initialGridSize - Initial grid size for snap-to-grid (default: 10)
 * @returns Tuple of [state, dispatch, historyControls] for canvas state management
 * 
 * @example
 * const [canvasState, dispatch, { undo, redo, canUndo, canRedo }] = useCanvasState();
 * 
 * // Add an element (tracked in history)
 * dispatch({ type: 'ADD_ELEMENT', element: newElement });
 * 
 * // Select an element (not tracked in history)
 * dispatch({ type: 'SELECT_ELEMENT', id: elementId });
 * 
 * // Undo the last action
 * if (canUndo) undo();
 * 
 * Requirements: 8.1, 8.2, 8.3, 13.7
 */
export function useCanvasState(initialGridSize?: number) {
  const initialState = createInitialState(initialGridSize);
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory<CanvasState>(initialState);

  /**
   * Enhanced dispatch function that integrates history tracking
   * 
   * For actions that modify canvas content (creation, deletion, movement, resizing, duplication),
   * the new state is pushed to history. For other actions (like selection), state is updated
   * without history tracking.
   * 
   * Special handling for UNDO and REDO actions which directly call history functions.
   */
  const dispatch = useCallback((action: CanvasAction) => {
    if (action.type === 'UNDO') {
      undo();
      return;
    }

    if (action.type === 'REDO') {
      redo();
      return;
    }

    // Use a function to get the latest state
    pushState((currentState) => {
      const newState = canvasReducer(currentState, action);
      return newState;
    });
  }, [pushState, undo, redo]);

  return [state, dispatch, { undo, redo, canUndo, canRedo }] as const;
}
