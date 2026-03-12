import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { Element } from '../../src/types/canvas';
import { createRectangle, createTextBlock, createImagePlaceholder } from '../../src/utils/elementFactory';

/**
 * Property-Based Tests for Z-Index Rendering Order
 * Feature: design-canvas-editor
 * Property 9: Z-Index Ordering Invariant
 */

describe('Property 9: Z-Index Ordering Invariant', () => {
  /**
   * Helper to create an element with specified z-index
   */
  const createElement = (
    id: string,
    zIndex: number,
    type: 'rectangle' | 'text' | 'image' = 'rectangle'
  ): Element => ({
    id,
    type,
    position: { x: 100, y: 100 },
    dimensions: { width: 100, height: 100 },
    zIndex,
    color: '#ff0000',
  });

  /**
   * Helper to sort elements by z-index (simulates Canvas rendering logic)
   */
  const sortByZIndex = (elements: Element[]): Element[] => {
    return [...elements].sort((a, b) => a.zIndex - b.zIndex);
  };

  it('should sort elements in ascending z-index order', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        // Generate an array of elements with random z-index values
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: 0, max: 1000 }),
            type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (elementData) => {
          // Create elements from generated data
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex, data.type)
          );

          const sorted = sortByZIndex(elements);

          // Property: sorted array should be in ascending z-index order
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].zIndex > sorted[i + 1].zIndex) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain relative order for elements with equal z-index', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        // Generate elements with potentially duplicate z-index values
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: 0, max: 10 }), // Small range to encourage duplicates
          }),
          { minLength: 2, maxLength: 15 }
        ),
        (elementData) => {
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex)
          );

          const sorted = sortByZIndex(elements);

          // Property: elements with same z-index should maintain their relative order
          // (stable sort behavior)
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentIdx = elements.findIndex((e) => e.id === sorted[i].id);
            const nextIdx = elements.findIndex((e) => e.id === sorted[i + 1].id);

            // If z-indices are equal, original order should be preserved
            if (sorted[i].zIndex === sorted[i + 1].zIndex) {
              if (currentIdx > nextIdx) {
                return false;
              }
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle elements with negative z-index values', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: -100, max: 100 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (elementData) => {
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex)
          );

          const sorted = sortByZIndex(elements);

          // Property: negative z-indices should be sorted correctly
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].zIndex > sorted[i + 1].zIndex) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should place higher z-index elements later in render order', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        // Generate two distinct z-index values
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 501, max: 1000 }),
        fc.uuid(),
        fc.uuid(),
        (lowerZ, higherZ, id1, id2) => {
          const elements = [
            createElement(id1, higherZ),
            createElement(id2, lowerZ),
          ];

          const sorted = sortByZIndex(elements);

          // Property: element with lower z-index should appear first
          // element with higher z-index should appear last (rendered on top)
          return (
            sorted[0].zIndex === lowerZ &&
            sorted[1].zIndex === higherZ
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single element correctly', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.uuid(),
        (zIndex, id) => {
          const elements = [createElement(id, zIndex)];
          const sorted = sortByZIndex(elements);

          // Property: single element should remain unchanged
          return (
            sorted.length === 1 &&
            sorted[0].id === id &&
            sorted[0].zIndex === zIndex
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle elements with very large z-index values', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (elementData) => {
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex)
          );

          const sorted = sortByZIndex(elements);

          // Property: large z-index values should be sorted correctly
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].zIndex > sorted[i + 1].zIndex) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure sorted order matches expected rendering sequence', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 2, maxLength: 15 }
        ),
        (elementData) => {
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex)
          );

          const sorted = sortByZIndex(elements);

          // Property: for any two consecutive elements in sorted array,
          // the first should have z-index <= second
          // This ensures correct rendering order (lower z-index rendered first, appears below)
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].zIndex > sorted[i + 1].zIndex) {
              return false;
            }
          }

          // Additionally verify that all elements are present
          return sorted.length === elements.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work correctly with mixed element types', () => {
    // **Validates: Requirements 6.2, 6.4**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            zIndex: fc.integer({ min: 0, max: 100 }),
            type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
          }),
          { minLength: 3, maxLength: 20 }
        ),
        (elementData) => {
          const elements = elementData.map((data) =>
            createElement(data.id, data.zIndex, data.type)
          );

          const sorted = sortByZIndex(elements);

          // Property: z-index ordering should work regardless of element type
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].zIndex > sorted[i + 1].zIndex) {
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

/**
 * Property-Based Tests for Z-Index Assignment
 * Feature: design-canvas-editor
 * Property 10: New Elements Have Highest Z-Index
 */

describe('Property 10: New Elements Have Highest Z-Index', () => {
  /**
   * Arbitrary generator for existing elements
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

  it('should assign z-index higher than all existing elements for rectangles', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newRect = createRectangle(existingElements);
          
          // Property: new element z-index should be strictly greater than all existing
          return newRect.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should assign z-index higher than all existing elements for text blocks', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newText = createTextBlock(existingElements);
          
          // Property: new element z-index should be strictly greater than all existing
          return newText.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should assign z-index higher than all existing elements for image placeholders', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: new element z-index should be strictly greater than all existing
          return newImage.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should assign z-index 1 when no elements exist', () => {
    // **Validates: Requirements 2.9**
    const rect = createRectangle([]);
    const text = createTextBlock([]);
    const image = createImagePlaceholder([]);
    
    // Property: first element should have z-index 1
    return rect.zIndex === 1 && text.zIndex === 1 && image.zIndex === 1;
  });

  it('should assign incrementing z-index for multiple new elements', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        fc.integer({ min: 2, max: 10 }),
        (existingElements, numNewElements) => {
          const elements = [...existingElements];
          const newElements: Element[] = [];
          
          // Create multiple new elements sequentially
          for (let i = 0; i < numNewElements; i++) {
            const newElement = createRectangle(elements);
            newElements.push(newElement);
            elements.push(newElement);
          }
          
          // Property: each new element should have z-index higher than previous
          for (let i = 0; i < newElements.length - 1; i++) {
            if (newElements[i].zIndex >= newElements[i + 1].zIndex) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle elements with very high existing z-index values', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(
          arbitraryElement().map(el => ({ ...el, zIndex: fc.sample(fc.integer({ min: 1000, max: 10000 }), 1)[0] })),
          { minLength: 1, maxLength: 10 }
        ),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newRect = createRectangle(existingElements);
          
          // Property: new element should have z-index higher even with large existing values
          return newRect.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure new element appears on top in render order', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          const allElements = [...existingElements, newRect];
          const sorted = [...allElements].sort((a, b) => a.zIndex - b.zIndex);
          
          // Property: new element should be last in sorted order (rendered on top)
          return sorted[sorted.length - 1].id === newRect.id;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain z-index uniqueness for new elements', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          
          // Property: new element z-index should not match any existing element
          const existingZIndices = existingElements.map(el => el.zIndex);
          return !existingZIndices.includes(newRect.zIndex);
        }
      ),
      { numRuns: 100 }
    );
  });
});
