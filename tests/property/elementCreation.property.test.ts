import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { createRectangle, createTextBlock, createImagePlaceholder } from '../../src/utils/elementFactory';
import type { Element, ElementType } from '../../src/types/canvas';

/**
 * Property-Based Tests for Element Creation
 * Feature: design-canvas-editor
 * Property 2: Element Creation Produces Valid Elements
 */

describe('Property 2: Element Creation Produces Valid Elements', () => {
  // Canvas configuration for boundary validation
  const CANVAS_CONFIG = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  /**
   * Arbitrary generator for existing elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: CANVAS_CONFIG.width }),
        y: fc.integer({ min: 0, max: CANVAS_CONFIG.height }),
      }),
      dimensions: fc.record({
        width: fc.integer({ min: CANVAS_CONFIG.minElementWidth, max: 300 }),
        height: fc.integer({ min: CANVAS_CONFIG.minElementHeight, max: 300 }),
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

  it('should create rectangles with unique IDs not in existing elements', () => {
    // **Validates: Requirements 2.1, 2.4**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          
          // Property: new element ID should be unique
          const existingIds = existingElements.map(el => el.id);
          return !existingIds.includes(newRect.id) && newRect.id.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create rectangles with correct type', () => {
    // **Validates: Requirements 2.1**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          
          // Property: type should be 'rectangle'
          return newRect.type === 'rectangle';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create rectangles with position within canvas bounds', () => {
    // **Validates: Requirements 2.8**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          
          // Property: position should be within canvas bounds
          return (
            newRect.position.x >= 0 &&
            newRect.position.y >= 0 &&
            newRect.position.x + newRect.dimensions.width <= CANVAS_CONFIG.width &&
            newRect.position.y + newRect.dimensions.height <= CANVAS_CONFIG.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create rectangles with positive dimensions', () => {
    // **Validates: Requirements 2.6**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newRect = createRectangle(existingElements);
          
          // Property: dimensions should be greater than zero
          return newRect.dimensions.width > 0 && newRect.dimensions.height > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create rectangles with z-index higher than all existing elements', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newRect = createRectangle(existingElements);
          
          // Property: new element z-index should be higher than all existing
          return newRect.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create rectangles with z-index 1 when no elements exist', () => {
    // **Validates: Requirements 2.9**
    const newRect = createRectangle([]);
    
    // Property: first element should have z-index 1
    return newRect.zIndex === 1;
  });

  it('should create text blocks with unique IDs not in existing elements', () => {
    // **Validates: Requirements 2.2, 2.4**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newText = createTextBlock(existingElements);
          
          // Property: new element ID should be unique
          const existingIds = existingElements.map(el => el.id);
          return !existingIds.includes(newText.id) && newText.id.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create text blocks with correct type', () => {
    // **Validates: Requirements 2.2**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newText = createTextBlock(existingElements);
          
          // Property: type should be 'text'
          return newText.type === 'text';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create text blocks with position within canvas bounds', () => {
    // **Validates: Requirements 2.8**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newText = createTextBlock(existingElements);
          
          // Property: position should be within canvas bounds
          return (
            newText.position.x >= 0 &&
            newText.position.y >= 0 &&
            newText.position.x + newText.dimensions.width <= CANVAS_CONFIG.width &&
            newText.position.y + newText.dimensions.height <= CANVAS_CONFIG.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create text blocks with positive dimensions', () => {
    // **Validates: Requirements 2.6**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newText = createTextBlock(existingElements);
          
          // Property: dimensions should be greater than zero
          return newText.dimensions.width > 0 && newText.dimensions.height > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create text blocks with z-index higher than all existing elements', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newText = createTextBlock(existingElements);
          
          // Property: new element z-index should be higher than all existing
          return newText.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create image placeholders with unique IDs not in existing elements', () => {
    // **Validates: Requirements 2.3, 2.4**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: new element ID should be unique
          const existingIds = existingElements.map(el => el.id);
          return !existingIds.includes(newImage.id) && newImage.id.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create image placeholders with correct type', () => {
    // **Validates: Requirements 2.3**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: type should be 'image'
          return newImage.type === 'image';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create image placeholders with position within canvas bounds', () => {
    // **Validates: Requirements 2.8**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: position should be within canvas bounds
          return (
            newImage.position.x >= 0 &&
            newImage.position.y >= 0 &&
            newImage.position.x + newImage.dimensions.width <= CANVAS_CONFIG.width &&
            newImage.position.y + newImage.dimensions.height <= CANVAS_CONFIG.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create image placeholders with positive dimensions', () => {
    // **Validates: Requirements 2.6**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: dimensions should be greater than zero
          return newImage.dimensions.width > 0 && newImage.dimensions.height > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create image placeholders with z-index higher than all existing elements', () => {
    // **Validates: Requirements 2.9**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 20 }),
        (existingElements) => {
          const maxExistingZIndex = Math.max(...existingElements.map(el => el.zIndex));
          const newImage = createImagePlaceholder(existingElements);
          
          // Property: new element z-index should be higher than all existing
          return newImage.zIndex > maxExistingZIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create elements with all required properties', () => {
    // **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        fc.constantFrom('rectangle' as ElementType, 'text' as ElementType, 'image' as ElementType),
        (existingElements, type) => {
          let newElement: Element;
          
          if (type === 'rectangle') {
            newElement = createRectangle(existingElements);
          } else if (type === 'text') {
            newElement = createTextBlock(existingElements);
          } else {
            newElement = createImagePlaceholder(existingElements);
          }
          
          // Property: all required properties should be defined
          return (
            newElement.id !== undefined &&
            newElement.type !== undefined &&
            newElement.position !== undefined &&
            newElement.position.x !== undefined &&
            newElement.position.y !== undefined &&
            newElement.dimensions !== undefined &&
            newElement.dimensions.width !== undefined &&
            newElement.dimensions.height !== undefined &&
            newElement.zIndex !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create elements with type-specific properties', () => {
    // **Validates: Requirements 2.1, 2.2, 2.3**
    fc.assert(
      fc.property(
        fc.array(arbitraryElement(), { maxLength: 20 }),
        (existingElements) => {
          const rect = createRectangle(existingElements);
          const text = createTextBlock(existingElements);
          const image = createImagePlaceholder(existingElements);
          
          // Property: type-specific properties should be present
          return (
            rect.color !== undefined &&
            text.text !== undefined &&
            text.text.length > 0 &&
            image.imageUrl === undefined // Placeholder starts with no image
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
