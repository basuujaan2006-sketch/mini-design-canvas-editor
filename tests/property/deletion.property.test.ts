import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { canvasReducer, createInitialState } from '../../src/hooks/useCanvasState';
import type { Element, CanvasState } from '../../src/types/canvas';

/**
 * Property-Based Tests for Element Deletion
 * Feature: design-canvas-editor
 * Properties 11, 12: Deletion Behavior
 */

describe('Property 11: Element Deletion Removes Element', () => {
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
      elements: fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
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

  it('should remove the deleted element from canvas state', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          // Select an element to delete
          const elementToDelete = initialState.elements[0];
          const elementId = elementToDelete.id;

          // Delete the element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: deleted element should no longer exist in canvas state
          const elementExists = newState.elements.some(el => el.id === elementId);
          return !elementExists;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reduce element count by one after deletion', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const initialCount = initialState.elements.length;
          const elementId = initialState.elements[0].id;

          // Delete the element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: element count should decrease by exactly one
          return newState.elements.length === initialCount - 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all other elements after deletion', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 2),
        (initialState) => {
          const elementToDelete = initialState.elements[0];
          const otherElements = initialState.elements.slice(1);

          // Delete the first element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementToDelete.id,
          });

          // Property: all other elements should remain unchanged
          return otherElements.every(originalEl => {
            const foundEl = newState.elements.find(el => el.id === originalEl.id);
            return (
              foundEl !== undefined &&
              foundEl.type === originalEl.type &&
              foundEl.position.x === originalEl.position.x &&
              foundEl.position.y === originalEl.position.y &&
              foundEl.dimensions.width === originalEl.dimensions.width &&
              foundEl.dimensions.height === originalEl.dimensions.height &&
              foundEl.zIndex === originalEl.zIndex
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deletion of any element regardless of position in array', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 3),
        fc.nat(),
        (initialState, indexSeed) => {
          // Select element at random position
          const index = indexSeed % initialState.elements.length;
          const elementId = initialState.elements[index].id;

          // Delete the element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: element should be removed regardless of position
          const elementExists = newState.elements.some(el => el.id === elementId);
          return !elementExists && newState.elements.length === initialState.elements.length - 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deletion of non-existent element gracefully', () => {
    // **Validates: Requirements 7.1, 7.3**
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

          const initialCount = initialState.elements.length;

          // Try to delete non-existent element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: nonExistentId,
          });

          // Property: state should remain unchanged when deleting non-existent element
          return newState.elements.length === initialCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple sequential deletions correctly', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 3),
        fc.integer({ min: 1, max: 3 }),
        (initialState, deleteCount) => {
          let state = initialState;
          const idsToDelete = initialState.elements.slice(0, deleteCount).map(el => el.id);
          const initialCount = initialState.elements.length;

          // Delete multiple elements sequentially
          for (const id of idsToDelete) {
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id,
            });
          }

          // Property: all deleted elements should be removed
          const allDeleted = idsToDelete.every(id => 
            !state.elements.some(el => el.id === id)
          );
          
          return allDeleted && state.elements.length === initialCount - deleteCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should result in empty canvas when all elements are deleted', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          let state = initialState;
          const allIds = initialState.elements.map(el => el.id);

          // Delete all elements
          for (const id of allIds) {
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id,
            });
          }

          // Property: canvas should be empty after deleting all elements
          return state.elements.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should delete elements of any type correctly', () => {
    // **Validates: Requirements 7.1, 7.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          // Find elements of each type if they exist
          const rectangles = initialState.elements.filter(el => el.type === 'rectangle');
          const texts = initialState.elements.filter(el => el.type === 'text');
          const images = initialState.elements.filter(el => el.type === 'image');

          let state = initialState;
          let deletedCount = 0;

          // Delete one of each type if available
          if (rectangles.length > 0) {
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id: rectangles[0].id,
            });
            deletedCount++;
          }
          if (texts.length > 0) {
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id: texts[0].id,
            });
            deletedCount++;
          }
          if (images.length > 0) {
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id: images[0].id,
            });
            deletedCount++;
          }

          // Property: element count should decrease by number of deletions
          return state.elements.length === initialState.elements.length - deletedCount;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 12: Deletion Clears Selection', () => {
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

  it('should clear selection when deleting the selected element', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          const selectedId = initialState.selectedId;
          
          // Verify we have a selection
          if (selectedId === null) {
            return true; // Skip if no selection
          }

          // Delete the selected element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: selectedId,
          });

          // Property: selection should be cleared (null) after deleting selected element
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain selection when deleting a non-selected element', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection().filter(state => state.elements.length >= 2),
        (initialState) => {
          const selectedId = initialState.selectedId;
          
          // Find a different element to delete
          const elementToDelete = initialState.elements.find(el => el.id !== selectedId);
          if (!elementToDelete) {
            return true; // Skip if we can't find a different element
          }

          // Delete the non-selected element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementToDelete.id,
          });

          // Property: selection should be maintained when deleting non-selected element
          return newState.selectedId === selectedId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection regardless of element type', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          const selectedId = initialState.selectedId;
          
          if (selectedId === null) {
            return true; // Skip if no selection
          }

          // Get the type of selected element
          const selectedElement = initialState.elements.find(el => el.id === selectedId);
          if (!selectedElement) {
            return true; // Skip if element not found
          }

          // Delete the selected element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: selectedId,
          });

          // Property: selection should be cleared regardless of element type
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deletion when no element is selected', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        fc.record({
          elements: fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
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
          const elementId = initialState.elements[0].id;

          // Delete an element when nothing is selected
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: selection should remain null
          return newState.selectedId === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection after deleting last element', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        fc.record({
          element: arbitraryElement(),
          gridSize: fc.constant(10),
        }).map(({ element, gridSize }) => {
          const state = createInitialState(gridSize);
          return {
            ...state,
            elements: [element],
            selectedId: element.id,
          };
        }),
        (initialState) => {
          const elementId = initialState.elements[0].id;

          // Delete the only element (which is selected)
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: elementId,
          });

          // Property: selection should be cleared and canvas should be empty
          return newState.selectedId === null && newState.elements.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should clear selection correctly in sequence of select-delete operations', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        fc.record({
          elements: fc.array(arbitraryElement(), { minLength: 3, maxLength: 10 }),
          gridSize: fc.constant(10),
        }).map(({ elements, gridSize }) => {
          const state = createInitialState(gridSize);
          return {
            ...state,
            elements,
            selectedId: null,
          };
        }),
        fc.integer({ min: 1, max: 3 }),
        (initialState, iterations) => {
          let state = initialState;

          // Perform multiple select-delete cycles
          for (let i = 0; i < iterations && state.elements.length > 0; i++) {
            // Select an element
            const elementId = state.elements[0].id;
            state = canvasReducer(state, {
              type: 'SELECT_ELEMENT',
              id: elementId,
            });

            // Verify element is selected
            if (state.selectedId !== elementId) {
              return false;
            }

            // Delete the selected element
            state = canvasReducer(state, {
              type: 'DELETE_ELEMENT',
              id: elementId,
            });

            // Property: selection should be cleared after each deletion
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

  it('should allow re-selection after deleting selected element', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection().filter(state => state.elements.length >= 2),
        (initialState) => {
          const selectedId = initialState.selectedId;
          
          if (selectedId === null) {
            return true; // Skip if no selection
          }

          // Delete the selected element
          const stateAfterDelete = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: selectedId,
          });

          // Verify selection is cleared
          if (stateAfterDelete.selectedId !== null) {
            return false;
          }

          // Select a different element
          const newElementId = stateAfterDelete.elements[0].id;
          const stateAfterReselect = canvasReducer(stateAfterDelete, {
            type: 'SELECT_ELEMENT',
            id: newElementId,
          });

          // Property: should be able to select another element after deletion
          return stateAfterReselect.selectedId === newElementId;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not affect other state properties when clearing selection', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithSelection(),
        (initialState) => {
          const selectedId = initialState.selectedId;
          
          if (selectedId === null) {
            return true; // Skip if no selection
          }

          const initialGridSize = initialState.gridSize;
          const initialHistoryIndex = initialState.historyIndex;

          // Delete the selected element
          const newState = canvasReducer(initialState, {
            type: 'DELETE_ELEMENT',
            id: selectedId,
          });

          // Property: other state properties should remain unchanged
          return (
            newState.gridSize === initialGridSize &&
            newState.historyIndex === initialHistoryIndex
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
