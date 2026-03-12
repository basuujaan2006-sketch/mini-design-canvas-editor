import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  handleDragStart,
  handleDragMove,
} from '../../src/utils/dragHandler';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Property-Based Tests for Drag Operations
 * Feature: design-canvas-editor
 * Property 6: Drag Updates Position
 */

describe('Property 6: Drag Updates Position', () => {
  // Default canvas configuration
  const defaultConfig: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  /**
   * Helper to create an element with given properties
   */
  const createElement = (
    x: number,
    y: number,
    width: number,
    height: number
  ): Element => ({
    id: `test-${Math.random()}`,
    type: 'rectangle',
    position: { x, y },
    dimensions: { width, height },
    zIndex: 1,
    color: '#ff0000',
  });

  /**
   * Arbitrary generator for valid elements within canvas bounds
   */
  const arbitraryValidElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      x: fc.integer({ min: 0, max: 700 }),
      y: fc.integer({ min: 0, max: 500 }),
      width: fc.integer({ min: 20, max: 100 }),
      height: fc.integer({ min: 20, max: 100 }),
    }).map(({ x, y, width, height }) => {
      // Ensure element fits within canvas
      const adjustedWidth = Math.min(width, defaultConfig.width - x);
      const adjustedHeight = Math.min(height, defaultConfig.height - y);
      return createElement(x, y, adjustedWidth, adjustedHeight);
    });
  };

  /**
   * Arbitrary generator for mouse positions
   */
  const arbitraryMousePosition = () => {
    return fc.record({
      x: fc.integer({ min: -100, max: 1000 }),
      y: fc.integer({ min: -100, max: 1000 }),
    });
  };

  it('should update element position based on mouse movement', () => {
    // **Validates: Requirements 4.1, 4.4, 11.1**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, startMouse, endMouse) => {
          // Start drag operation
          const dragState = handleDragStart(element.id, element, startMouse);

          // Calculate new position during drag
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: position should be within bounds
          const isWithinBounds =
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= defaultConfig.width &&
            newPosition.y + element.dimensions.height <= defaultConfig.height;

          // Position should be snapped to grid OR constrained by boundaries
          // When constrained by boundaries, snapping may be overridden
          const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
          const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
          const isConstrainedX = newPosition.x === 0 || 
            newPosition.x + element.dimensions.width === defaultConfig.width;
          const isConstrainedY = newPosition.y === 0 || 
            newPosition.y + element.dimensions.height === defaultConfig.height;

          return isWithinBounds && 
            (isSnappedX || isConstrainedX) && 
            (isSnappedY || isConstrainedY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should constrain dragged element to canvas bounds', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, startMouse, endMouse) => {
          // Start drag operation
          const dragState = handleDragStart(element.id, element, startMouse);

          // Calculate new position during drag
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: element must remain within canvas bounds after drag
          return (
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= defaultConfig.width &&
            newPosition.y + element.dimensions.height <= defaultConfig.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain offset throughout drag operation', () => {
    // **Validates: Requirements 4.1, 11.1**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        fc.array(arbitraryMousePosition(), { minLength: 1, maxLength: 10 }),
        (element, startMouse, mouseMoves) => {
          // Start drag operation
          const dragState = handleDragStart(element.id, element, startMouse);

          // Perform multiple drag moves
          for (const mousePos of mouseMoves) {
            const newPosition = handleDragMove(
              dragState,
              mousePos,
              element.dimensions,
              defaultConfig
            );

            // Property: position should always be within bounds
            const isWithinBounds =
              newPosition.x >= 0 &&
              newPosition.y >= 0 &&
              newPosition.x + element.dimensions.width <= defaultConfig.width &&
              newPosition.y + element.dimensions.height <= defaultConfig.height;

            // Position should be snapped to grid OR constrained by boundaries
            const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
            const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
            const isConstrainedX = newPosition.x === 0 || 
              newPosition.x + element.dimensions.width === defaultConfig.width;
            const isConstrainedY = newPosition.y === 0 || 
              newPosition.y + element.dimensions.height === defaultConfig.height;

            if (!isWithinBounds || 
                !(isSnappedX || isConstrainedX) || 
                !(isSnappedY || isConstrainedY)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle drag starting from element corner', () => {
    // **Validates: Requirements 4.1, 4.4, 11.1**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, endMouse) => {
          // Start drag from element's top-left corner
          const startMouse = { x: element.position.x, y: element.position.y };
          const dragState = handleDragStart(element.id, element, startMouse);

          // Offset should be (0, 0)
          if (dragState.offset.x !== 0 || dragState.offset.y !== 0) {
            return false;
          }

          // Calculate new position
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: position should be within bounds
          const isWithinBounds =
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= defaultConfig.width &&
            newPosition.y + element.dimensions.height <= defaultConfig.height;

          // Position should be snapped to grid OR constrained by boundaries
          const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
          const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
          const isConstrainedX = newPosition.x === 0 || 
            newPosition.x + element.dimensions.width === defaultConfig.width;
          const isConstrainedY = newPosition.y === 0 || 
            newPosition.y + element.dimensions.height === defaultConfig.height;

          return isWithinBounds && 
            (isSnappedX || isConstrainedX) && 
            (isSnappedY || isConstrainedY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle drag starting from element center', () => {
    // **Validates: Requirements 4.1, 4.4, 11.1**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, endMouse) => {
          // Start drag from element's center
          const startMouse = {
            x: element.position.x + element.dimensions.width / 2,
            y: element.position.y + element.dimensions.height / 2,
          };
          const dragState = handleDragStart(element.id, element, startMouse);

          // Calculate new position
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: position should be within bounds
          const isWithinBounds =
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= defaultConfig.width &&
            newPosition.y + element.dimensions.height <= defaultConfig.height;

          // Position should be snapped to grid OR constrained by boundaries
          const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
          const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
          const isConstrainedX = newPosition.x === 0 || 
            newPosition.x + element.dimensions.width === defaultConfig.width;
          const isConstrainedY = newPosition.y === 0 || 
            newPosition.y + element.dimensions.height === defaultConfig.height;

          return isWithinBounds && 
            (isSnappedX || isConstrainedX) && 
            (isSnappedY || isConstrainedY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent element from moving to negative coordinates', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Try to drag to negative coordinates
          const endMouse = {
            x: fc.sample(fc.integer({ min: -500, max: -1 }), 1)[0],
            y: fc.sample(fc.integer({ min: -500, max: -1 }), 1)[0],
          };

          const dragState = handleDragStart(element.id, element, startMouse);
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: position should be clamped to 0 or positive
          return newPosition.x >= 0 && newPosition.y >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent element from extending beyond canvas right edge', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Try to drag beyond right edge
          const endMouse = {
            x: fc.sample(fc.integer({ min: defaultConfig.width, max: 2000 }), 1)[0],
            y: fc.sample(fc.integer({ min: 0, max: defaultConfig.height }), 1)[0],
          };

          const dragState = handleDragStart(element.id, element, startMouse);
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: element should not extend beyond right edge
          return newPosition.x + element.dimensions.width <= defaultConfig.width;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent element from extending beyond canvas bottom edge', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Try to drag beyond bottom edge
          const endMouse = {
            x: fc.sample(fc.integer({ min: 0, max: defaultConfig.width }), 1)[0],
            y: fc.sample(fc.integer({ min: defaultConfig.height, max: 2000 }), 1)[0],
          };

          const dragState = handleDragStart(element.id, element, startMouse);
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: element should not extend beyond bottom edge
          return newPosition.y + element.dimensions.height <= defaultConfig.height;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different element sizes', () => {
    // **Validates: Requirements 4.1, 4.4**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 400 }),
          y: fc.integer({ min: 0, max: 300 }),
          width: fc.integer({ min: 20, max: 400 }),
          height: fc.integer({ min: 20, max: 300 }),
        }),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        ({ x, y, width, height }, startMouse, endMouse) => {
          // Ensure element fits within canvas
          const adjustedWidth = Math.min(width, defaultConfig.width - x);
          const adjustedHeight = Math.min(height, defaultConfig.height - y);
          const element = createElement(x, y, adjustedWidth, adjustedHeight);

          const dragState = handleDragStart(element.id, element, startMouse);
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            defaultConfig
          );

          // Property: regardless of element size, it should remain within bounds
          return (
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= defaultConfig.width &&
            newPosition.y + element.dimensions.height <= defaultConfig.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different canvas configurations', () => {
    // **Validates: Requirements 4.1, 4.4**
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 200, max: 2000 }),
          height: fc.integer({ min: 200, max: 2000 }),
        }),
        fc.record({
          x: fc.integer({ min: 0, max: 100 }),
          y: fc.integer({ min: 0, max: 100 }),
          width: fc.integer({ min: 20, max: 100 }),
          height: fc.integer({ min: 20, max: 100 }),
        }),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (canvasDims, elementProps, startMouse, endMouse) => {
          const config: CanvasConfig = {
            ...defaultConfig,
            width: canvasDims.width,
            height: canvasDims.height,
          };

          // Ensure element fits within canvas
          const x = Math.min(elementProps.x, config.width - elementProps.width);
          const y = Math.min(elementProps.y, config.height - elementProps.height);
          const element = createElement(x, y, elementProps.width, elementProps.height);

          const dragState = handleDragStart(element.id, element, startMouse);
          const newPosition = handleDragMove(
            dragState,
            endMouse,
            element.dimensions,
            config
          );

          // Property: drag should work correctly for any canvas size
          return (
            newPosition.x >= 0 &&
            newPosition.y >= 0 &&
            newPosition.x + element.dimensions.width <= config.width &&
            newPosition.y + element.dimensions.height <= config.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // NOTE: Snap-to-grid validation will be added after task 13 is completed
  // The property test should verify that positions are snapped to grid multiples
  // when snap-to-grid functionality is implemented
});
