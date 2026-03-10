/**
 * Canvas State Management Hook
 * 
 * This hook provides centralized state management for the canvas using React's useReducer.
 * It handles all state transitions for elements, selection, and maintains immutability.
 * Integrates with history management for undo/redo functionality.
 */

import { useCallback } from 'react';
import { useHistory } from './useHistory';
import type { CanvasState, CanvasAction } from '../types/canvas';

/**
 * Creates the initial canvas state
 */
export function createInitialState(gridSize: number = 10): CanvasState {
  return {
    elements: [],
    selectedId: null,
    gridSize,
    zoom: 1,
    showGrid: true,
  };
}

/**
 * Canvas reducer
 */
export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {

    case 'ADD_ELEMENT': {
      return {
        ...state,
        elements: [...state.elements, action.element],
      };
    }

    case 'DELETE_ELEMENT': {
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }

    case 'UPDATE_ELEMENT': {
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
      return {
        ...state,
        selectedId: action.id,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const elementToDuplicate = state.elements.find(el => el.id === action.id);

      if (!elementToDuplicate) {
        return state;
      }

      const maxZIndex = state.elements.reduce(
        (max, el) => Math.max(max, el.zIndex),
        0
      );

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
 * Canvas state hook
 */
export function useCanvasState(initialGridSize?: number) {

  const initialState = createInitialState(initialGridSize);

  const {
    state,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    commitPendingState
  } = useHistory<CanvasState>(initialState);

  const dispatch = useCallback((action: CanvasAction, debounce: boolean = false) => {

    if (action.type === 'UNDO') {
      undo();
      return;
    }

    if (action.type === 'REDO') {
      redo();
      return;
    }

    // Determine if this action should be debounced
    // Debounce continuous operations like rotation, resize, and property updates
    const shouldDebounce = debounce || (
      action.type === 'UPDATE_ELEMENT' && 
      action.updates && 
      (
        'rotation' in action.updates ||
        'opacity' in action.updates ||
        'textColor' in action.updates ||
        'backgroundColor' in action.updates ||
        'color' in action.updates
      )
    );

    pushState((currentState) => {
      const newState = canvasReducer(currentState, action);
      return newState;
    }, shouldDebounce);

  }, [pushState, undo, redo]);

  return [state, dispatch, { undo, redo, canUndo, canRedo, commitPendingState }] as const;
}