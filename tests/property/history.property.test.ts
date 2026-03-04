/**
 * Property-Based Tests for History Management Hook
 * Feature: design-canvas-editor
 * Properties 18, 19, 20, 21: Undo/Redo Functionality
 * 
 * These tests validate the generic history management hook behavior.
 * Canvas-specific undo/redo integration will be tested in later tasks.
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../src/hooks/useHistory';

describe('Property 18: Undo Restores Previous State', () => {
  it('should restore previous state after any action', () => {
    // **Validates: Requirements 13.4**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 1, maxLength: 20 }),
        (initialValue, actions) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          const states: number[] = [initialValue];
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
              states.push(action);
            }
          });

          // Undo each action and verify state restoration
          for (let i = states.length - 1; i > 0; i--) {
            const expectedState = states[i - 1];
            
            act(() => {
              result.current.undo();
            });

            // Property: undo should restore the previous state
            if (result.current.state !== expectedState) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should restore complex object states correctly', () => {
    // **Validates: Requirements 13.4**
    interface TestState {
      count: number;
      items: string[];
    }

    fc.assert(
      fc.property(
        fc.record({
          count: fc.integer(),
          items: fc.array(fc.string(), { maxLength: 5 }),
        }),
        fc.array(
          fc.record({
            count: fc.integer(),
            items: fc.array(fc.string(), { maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (initialState: TestState, stateSequence: TestState[]) => {
          const { result } = renderHook(() => useHistory(initialState));

          // Push states
          act(() => {
            for (const state of stateSequence) {
              result.current.pushState(state);
            }
          });

          // Undo and verify
          const lastState = stateSequence[stateSequence.length - 1];
          const secondLastState = stateSequence.length > 1 
            ? stateSequence[stateSequence.length - 2] 
            : initialState;

          // Current state should be the last pushed state
          if (JSON.stringify(result.current.state) !== JSON.stringify(lastState)) {
            return false;
          }

          act(() => {
            result.current.undo();
          });

          // After undo, should be the second last state
          return JSON.stringify(result.current.state) === JSON.stringify(secondLastState);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle undo when no history exists', () => {
    // **Validates: Requirements 13.4**
    fc.assert(
      fc.property(
        fc.anything(),
        (initialState) => {
          const { result } = renderHook(() => useHistory(initialState));

          const stateBefore = result.current.state;

          act(() => {
            result.current.undo();
          });

          // Property: undo with no history should not change state
          return JSON.stringify(result.current.state) === JSON.stringify(stateBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 19: Redo Restores Next State', () => {
  it('should restore next state after undo', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 2, maxLength: 20 }),
        (initialValue, actions) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          const finalState = result.current.state;

          // Undo all actions
          act(() => {
            for (let i = 0; i < actions.length; i++) {
              result.current.undo();
            }
          });

          // Redo all actions
          act(() => {
            for (let i = 0; i < actions.length; i++) {
              result.current.redo();
            }
          });

          // Property: after redoing all actions, should be back to final state
          return result.current.state === finalState;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle redo when no future exists', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.anything(),
        fc.array(fc.anything(), { minLength: 1, maxLength: 10 }),
        (initialState, actions) => {
          const { result } = renderHook(() => useHistory(initialState));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          const stateBefore = result.current.state;

          act(() => {
            result.current.redo();
          });

          // Property: redo with no future should not change state
          return JSON.stringify(result.current.state) === JSON.stringify(stateBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should restore correct state after partial undo sequence', () => {
    // **Validates: Requirements 13.5**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 3, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (initialValue, actions, undoCount) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          const states: number[] = [initialValue];
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
              states.push(action);
            }
          });

          // Undo some actions
          const actualUndoCount = Math.min(undoCount, actions.length);
          act(() => {
            for (let i = 0; i < actualUndoCount; i++) {
              result.current.undo();
            }
          });

          // After undoing, we're at position: states.length - 1 - actualUndoCount
          const currentPosition = states.length - 1 - actualUndoCount;
          const stateBeforeRedo = result.current.state;
          
          // Verify we're at the expected position
          if (stateBeforeRedo !== states[currentPosition]) {
            return false;
          }

          // Redo one action - should move forward one position
          const expectedState = states[currentPosition + 1];
          
          act(() => {
            result.current.redo();
          });

          // Property: redo should restore the next state in sequence
          return result.current.state === expectedState;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 20: Undo-Redo Round Trip', () => {
  it('should return to same state after undo then redo', () => {
    // **Validates: Requirements 13.1, 13.2**
    fc.assert(
      fc.property(
        fc.anything(),
        fc.array(fc.anything(), { minLength: 1, maxLength: 20 }),
        (initialState, actions) => {
          const { result } = renderHook(() => useHistory(initialState));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          const stateAfterActions = result.current.state;

          // Undo then redo
          act(() => {
            result.current.undo();
            result.current.redo();
          });

          // Property: state should be the same after undo-redo round trip
          return JSON.stringify(result.current.state) === JSON.stringify(stateAfterActions);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain state consistency through multiple round trips', () => {
    // **Validates: Requirements 13.1, 13.2**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (initialValue, actions, roundTripCount) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          const expectedState = result.current.state;

          // Perform multiple round trips
          act(() => {
            for (let i = 0; i < roundTripCount; i++) {
              result.current.undo();
              result.current.redo();
            }
          });

          // Property: state should remain consistent after multiple round trips
          return result.current.state === expectedState;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle round trips at different points in history', () => {
    // **Validates: Requirements 13.1, 13.2**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 3, maxLength: 15 }),
        fc.integer({ min: 1, max: 10 }),
        (initialValue, actions, undoCount) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo some actions
          const actualUndoCount = Math.min(undoCount, actions.length);
          act(() => {
            for (let i = 0; i < actualUndoCount; i++) {
              result.current.undo();
            }
          });

          const stateAfterUndo = result.current.state;

          // Only perform round trip if we can undo further
          if (!result.current.canUndo) {
            return true; // Skip this test case
          }

          // Perform round trip
          act(() => {
            result.current.undo();
            result.current.redo();
          });

          // Property: state should be the same after round trip
          return result.current.state === stateAfterUndo;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 21: New Action Clears Redo Stack', () => {
  it('should clear redo stack when pushing new state after undo', () => {
    // **Validates: Requirements 13.6**
    fc.assert(
      fc.property(
        fc.anything(),
        fc.array(fc.anything(), { minLength: 2, maxLength: 20 }),
        fc.anything(),
        (initialState, actions, newAction) => {
          const { result } = renderHook(() => useHistory(initialState));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo some actions
          act(() => {
            result.current.undo();
            result.current.undo();
          });

          // Verify redo is available
          if (!result.current.canRedo) {
            return false;
          }

          // Push new action
          act(() => {
            result.current.pushState(newAction);
          });

          // Property: redo should no longer be available
          return !result.current.canRedo;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear entire redo stack regardless of size', () => {
    // **Validates: Requirements 13.6**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 3, maxLength: 20 }),
        fc.integer({ min: 1, max: 15 }),
        fc.integer(),
        (initialValue, actions, undoCount, newAction) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo multiple actions
          const actualUndoCount = Math.min(undoCount, actions.length);
          act(() => {
            for (let i = 0; i < actualUndoCount; i++) {
              result.current.undo();
            }
          });

          // Verify redo is available
          if (!result.current.canRedo) {
            return true; // Skip if no redo available
          }

          // Push new action
          act(() => {
            result.current.pushState(newAction);
          });

          // Property: all redo history should be cleared
          return !result.current.canRedo;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not affect undo stack when clearing redo', () => {
    // **Validates: Requirements 13.6**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 2, maxLength: 10 }),
        fc.integer(),
        (initialValue, actions, newAction) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo one action
          act(() => {
            result.current.undo();
          });

          const canUndoBefore = result.current.canUndo;

          // Push new action
          act(() => {
            result.current.pushState(newAction);
          });

          // Property: undo should still be available
          return result.current.canUndo && canUndoBefore;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow redo after new action sequence', () => {
    // **Validates: Requirements 13.6**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 2, maxLength: 10 }),
        fc.array(fc.integer(), { minLength: 1, maxLength: 5 }),
        (initialValue, firstActions, secondActions) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // First action sequence
          act(() => {
            for (const action of firstActions) {
              result.current.pushState(action);
            }
          });

          // Undo
          act(() => {
            result.current.undo();
          });

          // New action sequence (clears redo)
          act(() => {
            for (const action of secondActions) {
              result.current.pushState(action);
            }
          });

          // Verify redo is cleared
          if (result.current.canRedo) {
            return false;
          }

          // Undo new actions
          act(() => {
            result.current.undo();
          });

          // Property: should be able to redo the new actions
          return result.current.canRedo;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle branching history correctly', () => {
    // **Validates: Requirements 13.6**
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 3, maxLength: 10 }),
        fc.integer(),
        (initialValue, actions, branchAction) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Build initial history
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo to middle of history
          const undoCount = Math.floor(actions.length / 2);
          act(() => {
            for (let i = 0; i < undoCount; i++) {
              result.current.undo();
            }
          });

          const stateBeforeBranch = result.current.state;

          // Create branch by pushing new action
          act(() => {
            result.current.pushState(branchAction);
          });

          // Property: cannot redo to old branch
          if (result.current.canRedo) {
            return false;
          }

          // Undo the branch action
          act(() => {
            result.current.undo();
          });

          // Property: should be back at branch point
          return result.current.state === stateBeforeBranch;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('History Hook - State Immutability', () => {
  it('should not mutate past states when pushing new state', () => {
    fc.assert(
      fc.property(
        fc.record({ value: fc.integer() }),
        fc.array(fc.record({ value: fc.integer() }), { minLength: 2, maxLength: 10 }),
        (initialState, actions) => {
          const { result } = renderHook(() => useHistory(initialState));

          const firstState = result.current.state;

          // Perform actions
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          // Undo to first state
          act(() => {
            for (let i = 0; i < actions.length; i++) {
              result.current.undo();
            }
          });

          // Property: first state should be unchanged
          return JSON.stringify(result.current.state) === JSON.stringify(firstState);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('History Hook - canUndo and canRedo Flags', () => {
  it('should correctly report canUndo and canRedo at all times', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.array(fc.integer(), { minLength: 1, maxLength: 20 }),
        (initialValue, actions) => {
          const { result } = renderHook(() => useHistory(initialValue));

          // Initially no undo/redo
          if (result.current.canUndo || result.current.canRedo) {
            return false;
          }

          // After actions, can undo but not redo
          act(() => {
            for (const action of actions) {
              result.current.pushState(action);
            }
          });

          if (!result.current.canUndo || result.current.canRedo) {
            return false;
          }

          // After undo, can both undo and redo
          act(() => {
            result.current.undo();
          });

          if (actions.length > 1) {
            if (!result.current.canUndo || !result.current.canRedo) {
              return false;
            }
          } else {
            if (result.current.canUndo || !result.current.canRedo) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
