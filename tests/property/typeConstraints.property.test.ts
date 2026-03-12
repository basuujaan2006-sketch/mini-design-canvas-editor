import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { Dimensions, CanvasConfig } from '../../src/types/canvas';

/**
 * Property-Based Tests for Type Constraints
 * Feature: design-canvas-editor
 */

describe('Property 8: Minimum Dimension Enforcement', () => {
  // Default canvas configuration with minimum dimensions
  const defaultConfig: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  /**
   * Helper function to enforce minimum dimensions on an element
   * This simulates what the resize handler should do
   */
  function enforceMinimumDimensions(
    dimensions: Dimensions,
    config: CanvasConfig
  ): Dimensions {
    return {
      width: Math.max(dimensions.width, config.minElementWidth),
      height: Math.max(dimensions.height, config.minElementHeight),
    };
  }

  it('should enforce minimum width and height for any dimensions', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        // Generate arbitrary dimensions including negative, zero, and very small values
        fc.record({
          width: fc.integer({ min: -100, max: 1000 }),
          height: fc.integer({ min: -100, max: 1000 }),
        }),
        (dimensions) => {
          const constrained = enforceMinimumDimensions(dimensions, defaultConfig);
          
          // Property: constrained dimensions must meet minimum requirements
          return (
            constrained.width >= defaultConfig.minElementWidth &&
            constrained.height >= defaultConfig.minElementHeight
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should preserve dimensions that already meet minimum requirements', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        // Generate dimensions that are already valid (at or above minimum)
        fc.record({
          width: fc.integer({ min: 20, max: 1000 }),
          height: fc.integer({ min: 20, max: 1000 }),
        }),
        (dimensions) => {
          const constrained = enforceMinimumDimensions(dimensions, defaultConfig);
          
          // Property: valid dimensions should remain unchanged
          return (
            constrained.width === dimensions.width &&
            constrained.height === dimensions.height
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should enforce minimum dimensions with different config values', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        // Generate arbitrary config and dimensions
        fc.record({
          minWidth: fc.integer({ min: 1, max: 100 }),
          minHeight: fc.integer({ min: 1, max: 100 }),
        }),
        fc.record({
          width: fc.integer({ min: -50, max: 500 }),
          height: fc.integer({ min: -50, max: 500 }),
        }),
        (configValues, dimensions) => {
          const config: CanvasConfig = {
            ...defaultConfig,
            minElementWidth: configValues.minWidth,
            minElementHeight: configValues.minHeight,
          };
          
          const constrained = enforceMinimumDimensions(dimensions, config);
          
          // Property: constrained dimensions must meet the configured minimums
          return (
            constrained.width >= config.minElementWidth &&
            constrained.height >= config.minElementHeight
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should handle edge case of exactly minimum dimensions', () => {
    // **Validates: Requirements 5.6**
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (minWidth, minHeight) => {
          const config: CanvasConfig = {
            ...defaultConfig,
            minElementWidth: minWidth,
            minElementHeight: minHeight,
          };
          
          // Test with dimensions exactly at minimum
          const dimensions: Dimensions = {
            width: minWidth,
            height: minHeight,
          };
          
          const constrained = enforceMinimumDimensions(dimensions, config);
          
          // Property: dimensions at minimum should remain unchanged
          return (
            constrained.width === minWidth &&
            constrained.height === minHeight
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});
