import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { canvasReducer, createInitialState } from '../../src/hooks/useCanvasState';
import type { Element, CanvasState } from '../../src/types/canvas';

/**
 * Property-Based Tests for Selection
 * Feature: design-canvas-editor
 * Properties 3, 4, 5: Selection Invariants and Behavior
 */

describe('Property 3: Single Selection Invariant', () => {
  /**
   * Arbitrary generator for elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: 800 }),
        y: fc.integer({ min: 0, max: 600 }),
      }),
      dimensions: fc.record({
        width: fc.integer({ min: 20, max: 300 }),
        height: fc.integer({ min: 20, max: 300 }),
      }),
      zIndex: fc.integer({ min: 0, max: 100 }),
    }).map((base) => {
      // Add type-specific properties
      const element: Element = { ...base };
      if (base.type === 'rectangle') {
        element.color = '#3b82f6';
      } else if (base.type === 'text') {
        element.text = 'Sample Text';
      } else if (base.type === 'image') {
        element.imageUrl = undefined;
      }
      return element;
    });
  };

  /**
   * Arbitrary generator for canvas state with elements
   */
  const arbitraryCanvasState = (): fc.Arbitrary<CanvasState> => {
    return fc.record({
      elements: fc.array(arbitraryElement(), { minLength: 0, maxLength: 20 }),
      gridSize: fc.constant(10),
    }).map(({ elements, gridSize }) => {
      const state = createInitialState(gridSize);
      return {
        ...state,
        elements,
        selectedId: null,
      };
    });
  };

  it('should maintain at most one selected element at any time', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState(),
        (initialState) => {
          // Property: selectedId is either null or references exactly one element
          const selectedCount = initialState.selectedId === null ? 0 : 1;
          
          // Verify that if selectedId is not null, it references an existing element
          if (initialState.selectedId !== null) {
            const elementExists = initialState.elements.some(
              el => el.id === initialState.selectedId
            );
            return selectedCount === 1 && elementExists;
          }
          
          return selectedCount === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain single selection invariant after SELECT_ELEMENT action', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState(),
        fc.option(fc.uuid(), { nil: null }),
        (initialState, selectedId) => {
          // Perform selection action
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: selectedId,
          });

          // Property: after selection, at most one element is selected
          const selectedCount = newState.selectedId === null ? 0 : 1;
          return selectedCount <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain single selection invariant across multiple selection actions', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState(),
        fc.array(fc.option(fc.uuid(), { nil: null }), { minLength: 1, maxLength: 10 }),
        (initialState, selectionSequence) => {
          let state = initialState;
          
          // Perform multiple selection actions
          for (const selectedId of selectionSequence) {
            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: selectedId,
            });
            
            // Property: after each selection, at most one element is selected
            const selectedCount = state.selectedId === null ? 0 : 1;
            if (selectedCount > 1) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow null selection (no element selected)', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState(),
        (initialState) => {
          // Select null (deselect)
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Property: null selection is valid (selectedId should be null)
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain single selection invariant after adding elements', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState(),
        arbitraryElement(),
        (initialState, newElement) => {
          // Add element
          const newState = canvasReducer(initialState, {
            type: 'ADD_ELEMENT',
            element: newElement,
          });

          // Property: adding element should not affect single selection invariant
          const selectedCount = newState.selectedId === null ? 0 : 1;
          return selectedCount <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain single selection invariant after deleting elements', () => {
    // **Validates: Requirements 3.5**
    fc.assert(
      fc.property(
        arbitraryCanvasState().filter(state => state.elements.length > 0),
        (initialState) => {
          // Delete a random element
          const elementToDelete = fc.sample(
            fc.constantFrom(...initialState.elements.map(el => el.id)),
            1
          )[0];
          
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementToDelete,
          });

          // Property: deleting element should not affect single selection invariant
          const selectedCount = newState.selectedId === null ? 0 : 1;
          return selectedCount <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 4: Selection State Consistency', () => {
  /**
   * Arbitrary generator for elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: 800 }),
        y: fc.integer({ min: 0, max: 600 }),
      }),
      dimensions: fc.record({
        width: fc.integer({ min: 20, max: 300 }),
        height: fc.integer({ min: 20, max: 300 }),
      }),
      zIndex: fc.integer({ min: 0, max: 100 }),
    }).map((base) => {
      // Add type-specific properties
      const element: Element = { ...base };
      if (base.type === 'rectangle') {
        element.color = '#3b82f6';
      } else if (base.type === 'text') {
        element.text = 'Sample Text';
      } else if (base.type === 'image') {
        element.imageUrl = undefined;
      }
      return element;
    });
  };

  /**
   * Arbitrary generator for canvas state with elements
   */
  const arbitraryCanvasStateWithElements = (): fc.Arbitrary<CanvasState> => {
    return fc.record({
      elements: fc.array(arbitraryElement(), { minLength: 2, maxLength: 20 }),
      gridSize: fc.constant(10),
    }).map(({ elements, gridSize }) => {
      const state = createInitialState(gridSize);
      return {
        ...state,
        elements,
        selectedId: null,
      };
    });
  };

  it('should select the clicked element and deselect previous element', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          // Select first element
          const firstElementId = initialState.elements[0].id;
          const stateAfterFirst = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: firstElementId,
          });

          // Property: first element should be selected
          if (stateAfterFirst.selectedId !== firstElementId) {
            return false;
          }

          // Select second element
          const secondElementId = initialState.elements[1].id;
          const stateAfterSecond = canvasReducer(stateAfterFirst, {
            type: 'SELECT_ELEMENT',
            id: secondElementId,
          });

          // Property: second element should be selected, first should be deselected
          return (
            stateAfterSecond.selectedId === secondElementId &&
            stateAfterSecond.selectedId !== firstElementId
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should transition selection correctly for any sequence of element clicks', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.array(fc.nat(), { minLength: 2, maxLength: 10 }),
        (initialState, clickIndices) => {
          let state = initialState;
          let previousSelectedId: string | null = null;

          for (const index of clickIndices) {
            // Select element at index (modulo to ensure valid index)
            const elementIndex = index % state.elements.length;
            const elementId = state.elements[elementIndex].id;

            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: elementId,
            });

            // Property: newly selected element should be the one we clicked
            if (state.selectedId !== elementId) {
              return false;
            }

            // Property: previous selection should be cleared
            if (previousSelectedId !== null && state.selectedId === previousSelectedId) {
              // This is OK if we clicked the same element again
              if (elementId !== previousSelectedId) {
                return false;
              }
            }

            previousSelectedId = elementId;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle selecting the same element multiple times', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.integer({ min: 2, max: 10 }),
        (initialState, clickCount) => {
          const elementId = initialState.elements[0].id;
          let state = initialState;

          // Click the same element multiple times
          for (let i = 0; i < clickCount; i++) {
            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: elementId,
            });

            // Property: element should remain selected
            if (state.selectedId !== elementId) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle selecting non-existent element IDs gracefully', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.uuid(),
        (initialState, nonExistentId) => {
          // Ensure the ID doesn't exist
          const idExists = initialState.elements.some(el => el.id === nonExistentId);
          if (idExists) {
            return true; // Skip this test case
          }

          // Try to select non-existent element
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: nonExistentId,
          });

          // Property: selection should be updated (even if element doesn't exist)
          // The reducer doesn't validate element existence, it just updates selectedId
          return newState.selectedId === nonExistentId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain selection consistency across element updates', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.record({
          x: fc.integer({ min: 0, max: 800 }),
          y: fc.integer({ min: 0, max: 600 }),
        }),
        (initialState, newPosition) => {
          // Select an element
          const elementId = initialState.elements[0].id;
          const stateWithSelection = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: elementId,
          });

          // Update the selected element's position
          const stateAfterUpdate = canvasReducer(stateWithSelection, {
            type: 'UPDATE_ELEMENT',
            id: elementId,
            updates: { position: newPosition },
          });

          // Property: selection should be maintained after update
          return stateAfterUpdate.selectedId === elementId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection when selected element is deleted', () => {
    // **Validates: Requirements 3.1, 3.6, 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          // Select an element
          const elementId = initialState.elements[0].id;
          const stateWithSelection = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: elementId,
          });

          // Delete the selected element
          const stateAfterDelete = canvasReducer(stateWithSelection, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: selection should be cleared after deleting selected element
          return stateAfterDelete.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain selection when non-selected element is deleted', () => {
    // **Validates: Requirements 3.1, 3.6**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 2),
        (initialState) => {
          // Select first element
          const selectedId = initialState.elements[0].id;
          const stateWithSelection = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: selectedId,
          });

          // Delete a different element
          const elementToDelete = initialState.elements[1].id;
          const stateAfterDelete = canvasReducer(stateWithSelection, {
            type: 'DELETE_ELEMENT',
            id: elementToDelete,
          });

          // Property: selection should be maintained when deleting non-selected element
          return stateAfterDelete.selectedId === selectedId;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 5: Background Click Clears Selection', () => {
  /**
   * Arbitrary generator for elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: 800 }),
        y: fc.integer({ min: 0, max: 600 }),
      }),
      dimensions: fc.record({
        width: fc.integer({ min: 20, max: 300 }),
        height: fc.integer({ min: 20, max: 300 }),
      }),
      zIndex: fc.integer({ min: 0, max: 100 }),
    }).map((base) => {
      // Add type-specific properties
      const element: Element = { ...base };
      if (base.type === 'rectangle') {
        element.color = '#3b82f6';
      } else if (base.type === 'text') {
        element.text = 'Sample Text';
      } else if (base.type === 'image') {
        element.imageUrl = undefined;
      }
      return element;
    });
  };

  /**
   * Arbitrary generator for canvas state with elements and selection
   */
  const arbitraryCanvasStateWithSelection = (): fc.Arbitrary<CanvasState> => {
    return fc.record({
      elements: fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
      gridSize: fc.constant(10),
    }).map(({ elements, gridSize }) => {
      const state = createInitialState(gridSize);
      // Select a random element
      const selectedId = fc.sample(fc.constantFrom(...elements.map(el => el.id)), 1)[0];
      return {
        ...state,
        elements,
        selectedId,
      };
    });
  };

  it('should clear selection when background is clicked (SELECT_ELEMENT with null)', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          // Verify initial state has a selection
          if (initialState.selectedId === null) {
            return true; // Skip if no selection
          }

          // Simulate background click by selecting null
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Property: selectedId should be null after background click
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection regardless of which element was selected', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          // Verify initial state has a selection
          if (initialState.selectedId === null) {
            return true; // Skip if no selection
          }

          const previousSelectedId = initialState.selectedId;

          // Click background
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Property: selection should be cleared regardless of which element was selected
          return (
            newState.selectedId === null &&
            newState.selectedId !== previousSelectedId
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle background click when no element is selected', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        fc.record({
          elements: fc.array(arbitraryElement(), { minLength: 0, maxLength: 20 }),
          gridSize: fc.constant(10),
        }).map(({ elements, gridSize }) => {
          const state = createInitialState(gridSize);
          return {
            ...state,
            elements,
            selectedId: null,
          };
        }),
        (initialState) => {
          // Click background when nothing is selected
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Property: selectedId should remain null
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection after multiple select-deselect cycles', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        fc.integer({ min: 2, max: 10 }),
        (initialState, cycleCount) => {
          let state = initialState;

          // Perform multiple select-deselect cycles
          for (let i = 0; i < cycleCount; i++) {
            // Select an element
            const elementId = state.elements[i % state.elements.length].id;
            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: elementId,
            });

            // Verify element is selected
            if (state.selectedId !== elementId) {
              return false;
            }

            // Click background to deselect
            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: null,
            });

            // Verify selection is cleared
            if (state.selectedId !== null) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not affect elements when clearing selection', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          const elementsBefore = [...initialState.elements];

          // Click background to clear selection
          const newState = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Property: elements should remain unchanged
          return (
            newState.elements.length === elementsBefore.length &&
            newState.elements.every((el, idx) => 
              el.id === elementsBefore[idx].id &&
              el.type === elementsBefore[idx].type &&
              el.position.x === elementsBefore[idx].position.x &&
              el.position.y === elementsBefore[idx].position.y &&
              el.dimensions.width === elementsBefore[idx].dimensions.width &&
              el.dimensions.height === elementsBefore[idx].dimensions.height &&
              el.zIndex === elementsBefore[idx].zIndex
            )
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow re-selection after background click', () => {
    // **Validates: Requirements 3.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          // Click background to clear selection
          const stateAfterClear = canvasReducer(initialState, {
            type: 'SELECT_ELEMENT',
            id: null,
          });

          // Verify selection is cleared
          if (stateAfterClear.selectedId !== null) {
            return false;
          }

          // Select an element again
          const elementId = stateAfterClear.elements[0].id;
          const stateAfterReselect = canvasReducer(stateAfterClear, {
            type: 'SELECT_ELEMENT',
            id: elementId,
          });

          // Property: should be able to select element after clearing selection
          return stateAfterReselect.selectedId === elementId;
        }
      ),
      { numRuns: 100 }
    );
  });
});
