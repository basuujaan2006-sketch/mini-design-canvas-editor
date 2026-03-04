/**
 * History Management Hook
 * 
 * This hook provides undo/redo functionality for the canvas editor.
 * It maintains past, present, and future state stacks to enable time-travel debugging
 * and user-friendly undo/redo operations.
 * 
 * Requirements: 13.3, 13.4, 13.5, 13.6
 */

import { useState, useCallback } from 'react';

/**
 * History state interface for managing undo/redo stacks
 * 
 * @template T - The type of state being tracked in history
 */
export interface HistoryState<T> {
  past: T[];      // States before current
  present: T;     // Current state
  future: T[];    // States after undo operations
}

/**
 * Return type for the useHistory hook
 * 
 * @template T - The type of state being tracked in history
 */
export interface UseHistoryReturn<T> {
  state: T;
  pushState: (newState: T | ((currentState: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Custom hook for managing history with undo/redo functionality
 * 
 * This hook implements a history stack pattern where:
 * - past: array of previous states
 * - present: current state
 * - future: array of states that can be redone
 * 
 * When a new action is performed, the current state is pushed to past
 * and the future stack is cleared (branching behavior).
 * 
 * @template T - The type of state being tracked in history
 * @param initialState - The initial state value
 * @returns Object containing current state and history management functions
 * 
 * @example
 * const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialCanvasState);
 * 
 * // Perform an action
 * pushState(newCanvasState);
 * 
 * // Undo the action
 * if (canUndo) undo();
 * 
 * // Redo the action
 * if (canRedo) redo();
 */
export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  /**
   * Push a new state to history
   * 
   * Adds the current state to the past stack and sets the new state as present.
   * Clears the future stack (branching behavior - new actions invalidate redo history).
   * 
   * Requirement 13.6: When a new action is performed after undo, clear the redo stack
   * 
   * @param newState - The new state to push to history, or a function that receives the current state and returns the new state
   */
  const pushState = useCallback((newState: T | ((currentState: T) => T)) => {
    setHistory((current) => {
      const resolvedNewState = typeof newState === 'function' 
        ? (newState as (currentState: T) => T)(current.present)
        : newState;
      
      return {
        past: [...current.past, current.present],
        present: resolvedNewState,
        future: [], // Clear future stack when new action is performed
      };
    });
  }, []);

  /**
   * Undo the last action
   * 
   * Moves the current state to the future stack and restores the previous state
   * from the past stack.
   * 
   * Requirement 13.4: When an action is undone, restore the previous canvas state
   * 
   * Does nothing if there are no past states to undo to.
   */
  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) {
        return current; // Nothing to undo
      }

      const previous = current.past[current.past.length - 1]!;
      const newPast = current.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  /**
   * Redo the last undone action
   * 
   * Moves the current state to the past stack and restores the next state
   * from the future stack.
   * 
   * Requirement 13.5: When an action is redone, restore the next canvas state
   * 
   * Does nothing if there are no future states to redo to.
   */
  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) {
        return current; // Nothing to redo
      }

      const next = current.future[0]!;
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Derived state: whether undo/redo operations are available
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
