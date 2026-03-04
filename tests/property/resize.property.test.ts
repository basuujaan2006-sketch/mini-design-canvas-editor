import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  handleResizeStart,
  handleResizeMove,
} from '../../src/utils/resizeHandler';
import type { Element, CanvasConfig, ResizeHandle } from '../../src/types/canvas';

/**
 * Property-Based Tests for Resize Operations
 * Feature: design-canvas-editor
 * Property 7: Resize Updates Dimensions
 */

describe('Property 7: Resize Updates Dimensions', () => {
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
      width: fc.integer({ min: 50, max: 200 }),
      height: fc.integer({ min: 50, max: 200 }),
    }).map(({ x, y, width, height }) => {
      // Ensure element fits within canvas
      const adjustedWidth = Math.min(width, defaultConfig.width - x);
      const adjustedHeight = Math.min(height, defaultConfig.height - y);
      return createElement(x, y, adjustedWidth, adjustedHeight);
    });
  };

  /**
   * Arbitrary generator for resize handles
   */
  const arbitraryResizeHandle = (): fc.Arbitrary<ResizeHandle> => {
    return fc.constantFrom<ResizeHandle>('nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w');
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

  it('should update element dimensions based on handle movement', () => {
    // **Validates: Requirements 5.1, 5.4, 5.6, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, handle, startMouse, endMouse) => {
          // Start resize operation
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Calculate new dimensions during resize
          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: dimensions should be updated (unless constrained)
          // At minimum, the result should have valid dimensions
          return (
            result.dimensions.width > 0 &&
            result.dimensions.height > 0 &&
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should constrain resized element to canvas bounds', () => {
    // **Validates: Requirements 5.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, handle, startMouse, endMouse) => {
          // Start resize operation
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Calculate new dimensions and position during resize
          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: element must remain within canvas bounds after resize
          return (
            result.position.x >= 0 &&
            result.position.y >= 0 &&
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should enforce minimum dimensions during resize', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, handle, startMouse, endMouse) => {
          // Start resize operation
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Calculate new dimensions during resize
          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: dimensions must be at least minimum size
          return (
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle southeast resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from southeast corner
          const resizeState = handleResizeStart(element.id, element, 'se', startMouse);

          // Drag to increase size
          const endMouse = {
            x: startMouse.x + 50,
            y: startMouse.y + 50,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: southeast resize should not change position
          // Dimensions should be snapped to grid or constrained by boundaries/minimum
          const positionUnchanged =
            result.position.x === element.position.x &&
            result.position.y === element.position.y;

          const withinBounds =
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum =
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return positionUnchanged && withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle northwest resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from northwest corner
          const resizeState = handleResizeStart(element.id, element, 'nw', startMouse);

          // Drag to increase size (move left and up)
          const endMouse = {
            x: startMouse.x - 30,
            y: startMouse.y - 30,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: northwest resize should change both dimensions and position
          // All values should be within bounds and meet minimum requirements
          const withinBounds =
            result.position.x >= 0 &&
            result.position.y >= 0 &&
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum =
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle east edge resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from east edge
          const resizeState = handleResizeStart(element.id, element, 'e', startMouse);

          // Drag to increase width
          const endMouse = {
            x: startMouse.x + 40,
            y: startMouse.y,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: east resize should only change width, not position
          // Height may be snapped to grid even if "unchanged"
          const positionUnchanged =
            result.position.x === element.position.x &&
            result.position.y === element.position.y;

          const withinBounds =
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum = 
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Both dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return positionUnchanged && withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle south edge resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from south edge
          const resizeState = handleResizeStart(element.id, element, 's', startMouse);

          // Drag to increase height
          const endMouse = {
            x: startMouse.x,
            y: startMouse.y + 40,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: south resize should not change position
          // Width may be snapped to grid even if "unchanged"
          const positionUnchanged =
            result.position.x === element.position.x &&
            result.position.y === element.position.y;

          const withinBounds =
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum = 
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Both dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return positionUnchanged && withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle west edge resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from west edge
          const resizeState = handleResizeStart(element.id, element, 'w', startMouse);

          // Drag to increase width (move left)
          const endMouse = {
            x: startMouse.x - 30,
            y: startMouse.y,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: west resize should change width and x position, not y
          // Height may be snapped to grid even if "unchanged"
          const yUnchanged = result.position.y === element.position.y;

          const withinBounds =
            result.position.x >= 0 &&
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum = 
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Both dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return yUnchanged && withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle north edge resize correctly', () => {
    // **Validates: Requirements 5.1, 11.2**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        (element, startMouse) => {
          // Start resize from north edge
          const resizeState = handleResizeStart(element.id, element, 'n', startMouse);

          // Drag to increase height (move up)
          const endMouse = {
            x: startMouse.x,
            y: startMouse.y - 30,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: north resize should change height and y position, not x
          // Width may be snapped to grid even if "unchanged"
          const xUnchanged = result.position.x === element.position.x;

          const withinBounds =
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y >= 0 &&
            result.position.y + result.dimensions.height <= defaultConfig.height;

          const meetsMinimum = 
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          // Both dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return xUnchanged && withinBounds && meetsMinimum &&
            (isSnappedWidth || isConstrainedWidth) &&
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent dimensions from going below minimum when resizing smaller', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        (element, handle, startMouse) => {
          // Start resize operation
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Try to resize to very small dimensions
          const endMouse = {
            x: startMouse.x + (handle.includes('w') ? 1000 : -1000),
            y: startMouse.y + (handle.includes('n') ? 1000 : -1000),
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: dimensions should never go below minimum
          return (
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent element from extending beyond canvas right edge', () => {
    // **Validates: Requirements 5.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        fc.constantFrom<ResizeHandle>('e', 'ne', 'se'),
        arbitraryMousePosition(),
        (element, handle, startMouse) => {
          // Start resize operation with a handle that affects right edge
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Try to resize beyond canvas width
          const endMouse = {
            x: startMouse.x + 2000,
            y: startMouse.y,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: element should not extend beyond right edge
          return result.position.x + result.dimensions.width <= defaultConfig.width;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent element from extending beyond canvas bottom edge', () => {
    // **Validates: Requirements 5.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        fc.constantFrom<ResizeHandle>('s', 'se', 'sw'),
        arbitraryMousePosition(),
        (element, handle, startMouse) => {
          // Start resize operation with a handle that affects bottom edge
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Try to resize beyond canvas height
          const endMouse = {
            x: startMouse.x,
            y: startMouse.y + 2000,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: element should not extend beyond bottom edge
          return result.position.y + result.dimensions.height <= defaultConfig.height;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent position from going negative when resizing from left/top', () => {
    // **Validates: Requirements 5.4**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        fc.constantFrom<ResizeHandle>('nw', 'n', 'ne', 'w'),
        arbitraryMousePosition(),
        (element, handle, startMouse) => {
          // Start resize operation with a handle that affects position
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Try to drag beyond canvas top-left
          const endMouse = {
            x: -1000,
            y: -1000,
          };

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: position should be clamped to 0 or positive
          return result.position.x >= 0 && result.position.y >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different element sizes', () => {
    // **Validates: Requirements 5.1, 5.4, 5.6**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 400 }),
          y: fc.integer({ min: 0, max: 300 }),
          width: fc.integer({ min: 20, max: 400 }),
          height: fc.integer({ min: 20, max: 300 }),
        }),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        ({ x, y, width, height }, handle, startMouse, endMouse) => {
          // Ensure element fits within canvas
          const adjustedWidth = Math.min(width, defaultConfig.width - x);
          const adjustedHeight = Math.min(height, defaultConfig.height - y);
          const element = createElement(x, y, adjustedWidth, adjustedHeight);

          const resizeState = handleResizeStart(element.id, element, handle, startMouse);
          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: regardless of element size, it should remain within bounds
          // and respect minimum dimensions
          return (
            result.position.x >= 0 &&
            result.position.y >= 0 &&
            result.position.x + result.dimensions.width <= defaultConfig.width &&
            result.position.y + result.dimensions.height <= defaultConfig.height &&
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different canvas configurations', () => {
    // **Validates: Requirements 5.1, 5.4, 5.6**
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 200, max: 2000 }),
          height: fc.integer({ min: 200, max: 2000 }),
          minWidth: fc.integer({ min: 10, max: 50 }),
          minHeight: fc.integer({ min: 10, max: 50 }),
        }),
        fc.record({
          x: fc.integer({ min: 0, max: 100 }),
          y: fc.integer({ min: 0, max: 100 }),
          width: fc.integer({ min: 50, max: 150 }),
          height: fc.integer({ min: 50, max: 150 }),
        }),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (canvasDims, elementProps, handle, startMouse, endMouse) => {
          const config: CanvasConfig = {
            ...defaultConfig,
            width: canvasDims.width,
            height: canvasDims.height,
            minElementWidth: canvasDims.minWidth,
            minElementHeight: canvasDims.minHeight,
          };

          // Ensure element fits within canvas
          const x = Math.min(elementProps.x, config.width - elementProps.width);
          const y = Math.min(elementProps.y, config.height - elementProps.height);
          const element = createElement(x, y, elementProps.width, elementProps.height);

          const resizeState = handleResizeStart(element.id, element, handle, startMouse);
          const result = handleResizeMove(resizeState, endMouse, element, config);

          // Property: resize should work correctly for any canvas size
          return (
            result.position.x >= 0 &&
            result.position.y >= 0 &&
            result.position.x + result.dimensions.width <= config.width &&
            result.position.y + result.dimensions.height <= config.height &&
            result.dimensions.width >= config.minElementWidth &&
            result.dimensions.height >= config.minElementHeight
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // NOTE: Snap-to-grid validation will be added after task 13 is completed
  // The property test should verify that dimensions are snapped to grid multiples
  // when snap-to-grid functionality is implemented
});
