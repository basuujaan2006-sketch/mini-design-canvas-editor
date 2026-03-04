import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { canvasReducer, createInitialState } from '../../src/hooks/useCanvasState';
import type { Element, CanvasState } from '../../src/types/canvas';

/**
 * Property-Based Tests for Element Duplication
 * Feature: design-canvas-editor
 * Property 13: Element Duplication Creates Copy
 */

describe('Property 13: Element Duplication Creates Copy', () => {
  /**
   * Arbitrary generator for elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: 760 }), // Leave room for offset
        y: fc.integer({ min: 0, max: 560 }), // Leave room for offset
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
        element.color = fc.sample(fc.constantFrom('#ff0000', '#00ff00', '#0000ff', '#3b82f6'), 1)[0];
      } else if (base.type === 'text') {
        element.text = fc.sample(fc.constantFrom('Sample Text', 'Hello World', 'Test'), 1)[0];
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

  it('should create a new element with a different unique ID', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          const originalId = elementToDuplicate.id;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: originalId,
          });

          // Find the duplicated element (should be the last one added)
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated element should have a different ID
          return (
            duplicatedElement.id !== originalId &&
            duplicatedElement.id.length > 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create a duplicate with the same type', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          const originalType = elementToDuplicate.type;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated element should have the same type
          return duplicatedElement.type === originalType;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create a duplicate with the same dimensions', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          const originalWidth = elementToDuplicate.dimensions.width;
          const originalHeight = elementToDuplicate.dimensions.height;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated element should have the same dimensions
          return (
            duplicatedElement.dimensions.width === originalWidth &&
            duplicatedElement.dimensions.height === originalHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create a duplicate with offset position', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          const originalX = elementToDuplicate.position.x;
          const originalY = elementToDuplicate.position.y;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated element should have offset position (20px offset)
          return (
            duplicatedElement.position.x === originalX + 20 &&
            duplicatedElement.position.y === originalY + 20
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create a duplicate with higher z-index', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          
          // Find the highest z-index in the initial state
          const maxZIndex = initialState.elements.reduce(
            (max, el) => Math.max(max, el.zIndex),
            0
          );

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated element should have z-index higher than all existing elements
          return duplicatedElement.zIndex === maxZIndex + 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve type-specific properties for rectangles', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => 
          state.elements.some(el => el.type === 'rectangle')
        ),
        (initialState) => {
          // Find a rectangle element
          const rectangleElement = initialState.elements.find(el => el.type === 'rectangle');
          if (!rectangleElement) {
            return true; // Skip if no rectangle found
          }

          const originalColor = rectangleElement.color;

          // Duplicate the rectangle
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: rectangleElement.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated rectangle should have the same color
          return (
            duplicatedElement.type === 'rectangle' &&
            duplicatedElement.color === originalColor
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve type-specific properties for text blocks', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => 
          state.elements.some(el => el.type === 'text')
        ),
        (initialState) => {
          // Find a text element
          const textElement = initialState.elements.find(el => el.type === 'text');
          if (!textElement) {
            return true; // Skip if no text found
          }

          const originalText = textElement.text;

          // Duplicate the text block
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: textElement.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated text block should have the same text
          return (
            duplicatedElement.type === 'text' &&
            duplicatedElement.text === originalText
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve type-specific properties for image placeholders', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => 
          state.elements.some(el => el.type === 'image')
        ),
        (initialState) => {
          // Find an image element
          const imageElement = initialState.elements.find(el => el.type === 'image');
          if (!imageElement) {
            return true; // Skip if no image found
          }

          const originalImageUrl = imageElement.imageUrl;

          // Duplicate the image placeholder
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: imageElement.id,
          });

          // Find the duplicated element
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplicated image should have the same imageUrl
          return (
            duplicatedElement.type === 'image' &&
            duplicatedElement.imageUrl === originalImageUrl
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should increase element count by one after duplication', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const initialCount = initialState.elements.length;
          const elementId = initialState.elements[0].id;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementId,
          });

          // Property: element count should increase by exactly one
          return newState.elements.length === initialCount + 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all other elements after duplication', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 2),
        (initialState) => {
          const elementToDuplicate = initialState.elements[0];
          const otherElements = initialState.elements.slice(1);

          // Duplicate the first element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
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

  it('should handle duplication of any element regardless of position in array', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements().filter(state => state.elements.length >= 3),
        fc.nat(),
        (initialState, indexSeed) => {
          // Select element at random position
          const index = indexSeed % initialState.elements.length;
          const elementToDuplicate = initialState.elements[index];
          const initialCount = initialState.elements.length;

          // Duplicate the element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: elementToDuplicate.id,
          });

          // Find the duplicated element (should be the last one)
          const duplicatedElement = newState.elements[newState.elements.length - 1];

          // Property: duplication should work regardless of position
          return (
            newState.elements.length === initialCount + 1 &&
            duplicatedElement.type === elementToDuplicate.type &&
            duplicatedElement.id !== elementToDuplicate.id
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle duplication of non-existent element gracefully', () => {
    // **Validates: Requirements 10.2, 10.3**
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

          // Try to duplicate non-existent element
          const newState = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: nonExistentId,
          });

          // Property: state should remain unchanged when duplicating non-existent element
          return newState.elements.length === initialCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple sequential duplications correctly', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.integer({ min: 1, max: 3 }),
        (initialState) => {
          let state = initialState;
          const elementId = initialState.elements[0].id;
          const initialCount = initialState.elements.length;

          // Duplicate the same element multiple times
          for (let i = 0; i < 3; i++) {
            state = canvasReducer(state, {
              type: 'DUPLICATE_ELEMENT',
              id: elementId,
            });
          }

          // Property: element count should increase by number of duplications
          return state.elements.length === initialCount + 3;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create duplicates with incrementing z-indices', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          const elementId = initialState.elements[0].id;
          
          // Find the highest z-index in the initial state
          const maxZIndex = initialState.elements.reduce(
            (max, el) => Math.max(max, el.zIndex),
            0
          );

          // Duplicate the element three times
          let state = initialState;
          const duplicatedZIndices: number[] = [];

          for (let i = 0; i < 3; i++) {
            state = canvasReducer(state, {
              type: 'DUPLICATE_ELEMENT',
              id: elementId,
            });
            const lastElement = state.elements[state.elements.length - 1];
            duplicatedZIndices.push(lastElement.zIndex);
          }

          // Property: each duplicate should have incrementing z-index
          return (
            duplicatedZIndices[0] === maxZIndex + 1 &&
            duplicatedZIndices[1] === maxZIndex + 2 &&
            duplicatedZIndices[2] === maxZIndex + 3
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should duplicate elements of any type correctly', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        (initialState) => {
          // Find elements of each type if they exist
          const rectangles = initialState.elements.filter(el => el.type === 'rectangle');
          const texts = initialState.elements.filter(el => el.type === 'text');
          const images = initialState.elements.filter(el => el.type === 'image');

          let state = initialState;
          let duplicatedCount = 0;

          // Duplicate one of each type if available
          if (rectangles.length > 0) {
            state = canvasReducer(state, {
              type: 'DUPLICATE_ELEMENT',
              id: rectangles[0].id,
            });
            duplicatedCount++;
          }
          if (texts.length > 0) {
            state = canvasReducer(state, {
              type: 'DUPLICATE_ELEMENT',
              id: texts[0].id,
            });
            duplicatedCount++;
          }
          if (images.length > 0) {
            state = canvasReducer(state, {
              type: 'DUPLICATE_ELEMENT',
              id: images[0].id,
            });
            duplicatedCount++;
          }

          // Property: element count should increase by number of duplications
          return state.elements.length === initialState.elements.length + duplicatedCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create truly independent copies (modifying original does not affect duplicate)', () => {
    // **Validates: Requirements 10.2, 10.3**
    fc.assert(
      fc.property(
        arbitraryCanvasStateWithElements(),
        fc.record({
          x: fc.integer({ min: 0, max: 800 }),
          y: fc.integer({ min: 0, max: 600 }),
        }),
        (initialState, newPosition) => {
          const originalId = initialState.elements[0].id;

          // Duplicate the element
          const stateAfterDuplicate = canvasReducer(initialState, {
            type: 'DUPLICATE_ELEMENT',
            id: originalId,
          });

          const duplicateId = stateAfterDuplicate.elements[stateAfterDuplicate.elements.length - 1].id;
          const duplicatePositionBefore = stateAfterDuplicate.elements[stateAfterDuplicate.elements.length - 1].position;

          // Modify the original element
          const stateAfterUpdate = canvasReducer(stateAfterDuplicate, {
            type: 'UPDATE_ELEMENT',
            id: originalId,
            updates: { position: newPosition },
          });

          // Find the duplicate element
          const duplicateAfterUpdate = stateAfterUpdate.elements.find(el => el.id === duplicateId);

          // Property: duplicate should remain unchanged when original is modified
          return (
            duplicateAfterUpdate !== undefined &&
            duplicateAfterUpdate.position.x === duplicatePositionBefore.x &&
            duplicateAfterUpdate.position.y === duplicatePositionBefore.y
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
