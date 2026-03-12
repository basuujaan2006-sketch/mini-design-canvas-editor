import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { snapPositionToGrid, snapDimensionsToGrid } from '../../src/utils/snapToGrid';
import { handleDragStart, handleDragMove } from '../../src/utils/dragHandler';
import { handleResizeStart, handleResizeMove } from '../../src/utils/resizeHandler';
import type { Element, CanvasConfig, ResizeHandle } from '../../src/types/canvas';

/**
 * Property-Based Tests for Snap-to-Grid Functionality
 * Feature: design-canvas-editor
 * Property 14: Snap-to-Grid Position Alignment
 * Property 15: Snap-to-Grid Dimension Alignment
 */

describe('Property 14: Snap-to-Grid Position Alignment', () => {
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
   * Arbitrary generator for positions
   */
  const arbitraryPosition = () => {
    return fc.record({
      x: fc.integer({ min: -100, max: 1000 }),
      y: fc.integer({ min: -100, max: 1000 }),
    });
  };

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

  it('should snap position coordinates to grid multiples', () => {
    // **Validates: Requirements 11.1**
    fc.assert(
      fc.property(
        arbitraryPosition(),
        (position) => {
          const snapped = snapPositionToGrid(position, defaultConfig);

          // Property: snapped coordinates should be multiples of grid size
          return (
            snapped.x % defaultConfig.gridSize === 0 &&
            snapped.y % defaultConfig.gridSize === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should snap to nearest grid point, not floor', () => {
    // **Validates: Requirements 11.1**
    fc.assert(
      fc.property(
        arbitraryPosition(),
        (position) => {
          const snapped = snapPositionToGrid(position, defaultConfig);
          const gridSize = defaultConfig.gridSize;

          // Calculate expected snap (round to nearest)
          const expectedX = Math.round(position.x / gridSize) * gridSize;
          const expectedY = Math.round(position.y / gridSize) * gridSize;

          // Property: should match rounding behavior
          return snapped.x === expectedX && snapped.y === expectedY;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different grid sizes', () => {
    // **Validates: Requirements 11.1, 11.3**
    fc.assert(
      fc.property(
        arbitraryPosition(),
        fc.integer({ min: 5, max: 50 }),
        (position, gridSize) => {
          const config: CanvasConfig = { ...defaultConfig, gridSize };
          const snapped = snapPositionToGrid(position, config);

          // Property: snapped coordinates should be multiples of the specified grid size
          return (
            snapped.x % gridSize === 0 &&
            snapped.y % gridSize === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce positions that are multiples of grid size after drag', () => {
    // **Validates: Requirements 11.1, 11.4**
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

          // Property: position should be snapped to grid OR constrained by boundaries
          const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
          const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
          
          // Boundaries can override snapping
          const isConstrainedX = 
            newPosition.x === 0 || 
            newPosition.x + element.dimensions.width === defaultConfig.width;
          const isConstrainedY = 
            newPosition.y === 0 || 
            newPosition.y + element.dimensions.height === defaultConfig.height;

          return (isSnappedX || isConstrainedX) && (isSnappedY || isConstrainedY);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain grid alignment throughout multiple drag moves', () => {
    // **Validates: Requirements 11.1, 11.4**
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

            // Property: position should always be snapped to grid OR constrained by boundaries
            const isSnappedX = newPosition.x % defaultConfig.gridSize === 0;
            const isSnappedY = newPosition.y % defaultConfig.gridSize === 0;
            
            const isConstrainedX = 
              newPosition.x === 0 || 
              newPosition.x + element.dimensions.width === defaultConfig.width;
            const isConstrainedY = 
              newPosition.y === 0 || 
              newPosition.y + element.dimensions.height === defaultConfig.height;

            if (!(isSnappedX || isConstrainedX) || !(isSnappedY || isConstrainedY)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve grid alignment when element is already on grid', () => {
    // **Validates: Requirements 11.1**
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 70 }),
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 2, max: 10 }),
        (gridX, gridY, widthMultiple, heightMultiple) => {
          // Create element already on grid
          const x = gridX * defaultConfig.gridSize;
          const y = gridY * defaultConfig.gridSize;
          const width = widthMultiple * defaultConfig.gridSize;
          const height = heightMultiple * defaultConfig.gridSize;
          
          // Ensure element fits within canvas
          if (x + width > defaultConfig.width || y + height > defaultConfig.height) {
            return true; // Skip invalid cases
          }

          const element = createElement(x, y, width, height);
          const position = { x, y };
          const snapped = snapPositionToGrid(position, defaultConfig);

          // Property: already-aligned positions should remain unchanged
          return snapped.x === x && snapped.y === y;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 15: Snap-to-Grid Dimension Alignment', () => {
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
   * Arbitrary generator for dimensions
   */
  const arbitraryDimensions = () => {
    return fc.record({
      width: fc.integer({ min: 1, max: 1000 }),
      height: fc.integer({ min: 1, max: 1000 }),
    });
  };

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

  it('should snap dimensions to grid multiples', () => {
    // **Validates: Requirements 11.2**
    fc.assert(
      fc.property(
        arbitraryDimensions(),
        (dimensions) => {
          const snapped = snapDimensionsToGrid(dimensions, defaultConfig);

          // Property: snapped dimensions should be multiples of grid size
          return (
            snapped.width % defaultConfig.gridSize === 0 &&
            snapped.height % defaultConfig.gridSize === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should snap to nearest grid increment, not floor', () => {
    // **Validates: Requirements 11.2**
    fc.assert(
      fc.property(
        arbitraryDimensions(),
        (dimensions) => {
          const snapped = snapDimensionsToGrid(dimensions, defaultConfig);
          const gridSize = defaultConfig.gridSize;

          // Calculate expected snap (round to nearest)
          const expectedWidth = Math.round(dimensions.width / gridSize) * gridSize;
          const expectedHeight = Math.round(dimensions.height / gridSize) * gridSize;

          // Property: should match rounding behavior
          return snapped.width === expectedWidth && snapped.height === expectedHeight;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different grid sizes', () => {
    // **Validates: Requirements 11.2, 11.3**
    fc.assert(
      fc.property(
        arbitraryDimensions(),
        fc.integer({ min: 5, max: 50 }),
        (dimensions, gridSize) => {
          const config: CanvasConfig = { ...defaultConfig, gridSize };
          const snapped = snapDimensionsToGrid(dimensions, config);

          // Property: snapped dimensions should be multiples of the specified grid size
          return (
            snapped.width % gridSize === 0 &&
            snapped.height % gridSize === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce dimensions that are multiples of grid size after resize', () => {
    // **Validates: Requirements 11.2, 11.5**
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

          // Property: dimensions should be snapped to grid OR constrained by boundaries/minimum
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          
          // Minimum dimensions or boundaries can override snapping
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return (isSnappedWidth || isConstrainedWidth) && (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain grid alignment for dimensions throughout multiple resize moves', () => {
    // **Validates: Requirements 11.2, 11.5**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryResizeHandle(),
        arbitraryMousePosition(),
        fc.array(arbitraryMousePosition(), { minLength: 1, maxLength: 10 }),
        (element, handle, startMouse, mouseMoves) => {
          // Start resize operation
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          // Perform multiple resize moves
          for (const mousePos of mouseMoves) {
            const result = handleResizeMove(resizeState, mousePos, element, defaultConfig);

            // Property: dimensions should always be snapped to grid OR constrained
            const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
            const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
            
            const isConstrainedWidth = 
              result.dimensions.width === defaultConfig.minElementWidth ||
              result.position.x + result.dimensions.width === defaultConfig.width;
            const isConstrainedHeight = 
              result.dimensions.height === defaultConfig.minElementHeight ||
              result.position.y + result.dimensions.height === defaultConfig.height;

            if (!(isSnappedWidth || isConstrainedWidth) || !(isSnappedHeight || isConstrainedHeight)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve grid alignment when dimensions are already on grid', () => {
    // **Validates: Requirements 11.2**
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        fc.integer({ min: 2, max: 100 }),
        (widthMultiple, heightMultiple) => {
          // Create dimensions already on grid
          const width = widthMultiple * defaultConfig.gridSize;
          const height = heightMultiple * defaultConfig.gridSize;
          
          const dimensions = { width, height };
          const snapped = snapDimensionsToGrid(dimensions, defaultConfig);

          // Property: already-aligned dimensions should remain unchanged
          return snapped.width === width && snapped.height === height;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle minimum dimension constraints with grid snapping', () => {
    // **Validates: Requirements 11.2, 5.6**
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

          // Property: dimensions should meet minimum requirements
          // AND be snapped to grid OR equal to minimum (which may not be on grid)
          const meetsMinimum = 
            result.dimensions.width >= defaultConfig.minElementWidth &&
            result.dimensions.height >= defaultConfig.minElementHeight;

          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return meetsMinimum && 
            (isSnappedWidth || isConstrainedWidth) && 
            (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle southeast resize with grid snapping', () => {
    // **Validates: Requirements 11.2, 11.5**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, startMouse, endMouse) => {
          // Start resize from southeast corner
          const resizeState = handleResizeStart(element.id, element, 'se', startMouse);

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: dimensions should be snapped to grid OR constrained
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return (isSnappedWidth || isConstrainedWidth) && (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge resize with grid snapping', () => {
    // **Validates: Requirements 11.2, 11.5**
    fc.assert(
      fc.property(
        arbitraryValidElement(),
        fc.constantFrom<ResizeHandle>('e', 's', 'w', 'n'),
        arbitraryMousePosition(),
        arbitraryMousePosition(),
        (element, handle, startMouse, endMouse) => {
          // Start resize from edge
          const resizeState = handleResizeStart(element.id, element, handle, startMouse);

          const result = handleResizeMove(resizeState, endMouse, element, defaultConfig);

          // Property: both dimensions should be snapped to grid OR constrained
          // (even the dimension that wasn't directly resized)
          const isSnappedWidth = result.dimensions.width % defaultConfig.gridSize === 0;
          const isSnappedHeight = result.dimensions.height % defaultConfig.gridSize === 0;
          
          const isConstrainedWidth = 
            result.dimensions.width === defaultConfig.minElementWidth ||
            result.position.x + result.dimensions.width === defaultConfig.width;
          const isConstrainedHeight = 
            result.dimensions.height === defaultConfig.minElementHeight ||
            result.position.y + result.dimensions.height === defaultConfig.height;

          return (isSnappedWidth || isConstrainedWidth) && (isSnappedHeight || isConstrainedHeight);
        }
      ),
      { numRuns: 100 }
    );
  });
});
