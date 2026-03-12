import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { constrainToCanvas, isWithinBounds } from '../../src/utils/boundaries';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Property-Based Tests for Boundary Constraints
 * Feature: design-canvas-editor
 * Property 1: Element Boundary Constraints
 */

describe('Property 1: Element Boundary Constraints', () => {
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
    id: `test-${x}-${y}-${width}-${height}`,
    type: 'rectangle',
    position: { x, y },
    dimensions: { width, height },
    zIndex: 1,
    color: '#ff0000',
  });

  it('should ensure any element constrained to canvas remains within bounds', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate arbitrary positions (including negative and beyond canvas)
        fc.integer({ min: -500, max: 1500 }),
        fc.integer({ min: -500, max: 1500 }),
        // Generate arbitrary dimensions (including very small and very large)
        fc.integer({ min: 1, max: 2000 }),
        fc.integer({ min: 1, max: 2000 }),
        (x, y, width, height) => {
          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: constrained element must satisfy boundary constraints
          return (
            constrained.position.x >= 0 &&
            constrained.position.y >= 0 &&
            constrained.position.x + constrained.dimensions.width <= defaultConfig.width &&
            constrained.position.y + constrained.dimensions.height <= defaultConfig.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve elements already within bounds', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate positions and dimensions that are guaranteed to be within bounds
        fc.integer({ min: 0, max: 700 }),
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 20, max: 100 }),
        fc.integer({ min: 20, max: 100 }),
        (x, y, width, height) => {
          // Ensure element fits within canvas
          const adjustedWidth = Math.min(width, defaultConfig.width - x);
          const adjustedHeight = Math.min(height, defaultConfig.height - y);
          
          const element = createElement(x, y, adjustedWidth, adjustedHeight);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: elements already within bounds should remain unchanged
          return (
            constrained.position.x === element.position.x &&
            constrained.position.y === element.position.y &&
            constrained.dimensions.width === element.dimensions.width &&
            constrained.dimensions.height === element.dimensions.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle elements larger than canvas by clamping dimensions', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate positions
        fc.integer({ min: -100, max: 1000 }),
        fc.integer({ min: -100, max: 1000 }),
        // Generate dimensions larger than canvas
        fc.integer({ min: 801, max: 2000 }),
        fc.integer({ min: 601, max: 2000 }),
        (x, y, width, height) => {
          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: dimensions should be clamped to canvas size
          return (
            constrained.dimensions.width <= defaultConfig.width &&
            constrained.dimensions.height <= defaultConfig.height &&
            // And element should still be within bounds
            constrained.position.x >= 0 &&
            constrained.position.y >= 0 &&
            constrained.position.x + constrained.dimensions.width <= defaultConfig.width &&
            constrained.position.y + constrained.dimensions.height <= defaultConfig.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle negative positions by clamping to zero', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate negative positions
        fc.integer({ min: -1000, max: -1 }),
        fc.integer({ min: -1000, max: -1 }),
        // Generate reasonable dimensions
        fc.integer({ min: 20, max: 400 }),
        fc.integer({ min: 20, max: 300 }),
        (x, y, width, height) => {
          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: negative positions should be clamped to 0
          return (
            constrained.position.x >= 0 &&
            constrained.position.y >= 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate isWithinBounds correctly for any element', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 1500 }),
        fc.integer({ min: -500, max: 1500 }),
        fc.integer({ min: 1, max: 2000 }),
        fc.integer({ min: 1, max: 2000 }),
        (x, y, width, height) => {
          const element = createElement(x, y, width, height);
          const withinBounds = isWithinBounds(element, defaultConfig);

          // Property: isWithinBounds should return true only if all constraints are met
          const expectedWithinBounds =
            x >= 0 &&
            y >= 0 &&
            x + width <= defaultConfig.width &&
            y + height <= defaultConfig.height;

          return withinBounds === expectedWithinBounds;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure constrained elements always pass isWithinBounds check', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        fc.integer({ min: -500, max: 1500 }),
        fc.integer({ min: -500, max: 1500 }),
        fc.integer({ min: 1, max: 2000 }),
        fc.integer({ min: 1, max: 2000 }),
        (x, y, width, height) => {
          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: any element after constrainToCanvas must pass isWithinBounds
          return isWithinBounds(constrained, defaultConfig);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should work with different canvas configurations', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate arbitrary canvas dimensions
        fc.record({
          width: fc.integer({ min: 100, max: 2000 }),
          height: fc.integer({ min: 100, max: 2000 }),
        }),
        // Generate arbitrary element properties
        fc.integer({ min: -500, max: 2500 }),
        fc.integer({ min: -500, max: 2500 }),
        fc.integer({ min: 1, max: 3000 }),
        fc.integer({ min: 1, max: 3000 }),
        (canvasDims, x, y, width, height) => {
          const config: CanvasConfig = {
            ...defaultConfig,
            width: canvasDims.width,
            height: canvasDims.height,
          };

          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, config);

          // Property: constraints should work for any canvas size
          return (
            constrained.position.x >= 0 &&
            constrained.position.y >= 0 &&
            constrained.position.x + constrained.dimensions.width <= config.width &&
            constrained.position.y + constrained.dimensions.height <= config.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case of element at exact canvas boundary', () => {
    // **Validates: Requirements 1.3, 2.8, 4.4, 5.4**
    fc.assert(
      fc.property(
        // Generate dimensions that fit within canvas
        fc.integer({ min: 20, max: 800 }),
        fc.integer({ min: 20, max: 600 }),
        (width, height) => {
          // Position element exactly at boundary
          const x = defaultConfig.width - width;
          const y = defaultConfig.height - height;
          
          const element = createElement(x, y, width, height);
          const constrained = constrainToCanvas(element, defaultConfig);

          // Property: elements at exact boundary should remain unchanged
          return (
            constrained.position.x === x &&
            constrained.position.y === y &&
            constrained.dimensions.width === width &&
            constrained.dimensions.height === height &&
            isWithinBounds(constrained, defaultConfig)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
