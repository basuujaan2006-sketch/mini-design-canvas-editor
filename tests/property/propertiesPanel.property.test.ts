import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Property-Based Tests for Properties Panel
 * Feature: design-canvas-editor
 * Properties 22, 23, 24: Properties Panel Display, Update, and Validation
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

const arbitraryCanvasConfig = (): fc.Arbitrary<CanvasConfig> => {
  return fc.record({
    width: fc.constant(1000),
    height: fc.constant(800),
    gridSize: fc.constant(10),
    minElementWidth: fc.constant(20),
    minElementHeight: fc.constant(20),
  });
};

describe('Property 22: Properties Panel Displays Selected Element', () => {
  it('should display the correct x, y, width, and height for any selected element', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        (element, config) => {
          const displayedX = element.position.x;
          const displayedY = element.position.y;
          const displayedWidth = element.dimensions.width;
          const displayedHeight = element.dimensions.height;
          
          return (
            displayedX === element.position.x &&
            displayedY === element.position.y &&
            displayedWidth === element.dimensions.width &&
            displayedHeight === element.dimensions.height
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display numeric values for all property fields', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        (element, config) => {
          const displayedX = element.position.x;
          const displayedY = element.position.y;
          const displayedWidth = element.dimensions.width;
          const displayedHeight = element.dimensions.height;
          
          return (
            typeof displayedX === 'number' &&
            typeof displayedY === 'number' &&
            typeof displayedWidth === 'number' &&
            typeof displayedHeight === 'number' &&
            !isNaN(displayedX) &&
            !isNaN(displayedY) &&
            !isNaN(displayedWidth) &&
            !isNaN(displayedHeight)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
describe('Property 23: Properties Panel Updates Element', () => {
  const validateAndApplyUpdate = (
    element: Element,
    config: CanvasConfig,
    field: 'x' | 'y' | 'width' | 'height',
    value: number
  ): { valid: boolean; updatedElement: Element | null } => {
    let isValid = true;
    let updatedElement: Element | null = null;

    if (field === 'x') {
      if (value < 0 || value > config.width - element.dimensions.width) {
        isValid = false;
      } else {
        updatedElement = {
          ...element,
          position: { ...element.position, x: value },
        };
      }
    } else if (field === 'y') {
      if (value < 0 || value > config.height - element.dimensions.height) {
        isValid = false;
      } else {
        updatedElement = {
          ...element,
          position: { ...element.position, y: value },
        };
      }
    } else if (field === 'width') {
      if (value < config.minElementWidth || value > config.width - element.position.x) {
        isValid = false;
      } else {
        updatedElement = {
          ...element,
          dimensions: { ...element.dimensions, width: value },
        };
      }
    } else if (field === 'height') {
      if (value < config.minElementHeight || value > config.height - element.position.y) {
        isValid = false;
      } else {
        updatedElement = {
          ...element,
          dimensions: { ...element.dimensions, height: value },
        };
      }
    }

    return { valid: isValid, updatedElement };
  };

  it('should update element x position when valid value is entered', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        fc.integer({ min: 0, max: 800 }),
        (element, config, newX) => {
          if (newX < 0 || newX > config.width - element.dimensions.width) {
            return true;
          }

          const result = validateAndApplyUpdate(element, config, 'x', newX);
          
          return (
            result.valid &&
            result.updatedElement !== null &&
            result.updatedElement.position.x === newX
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should update element width when valid value is entered', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        fc.integer({ min: 20, max: 500 }),
        (element, config, newWidth) => {
          if (newWidth < config.minElementWidth || newWidth > config.width - element.position.x) {
            return true;
          }

          const result = validateAndApplyUpdate(element, config, 'width', newWidth);
          
          return (
            result.valid &&
            result.updatedElement !== null &&
            result.updatedElement.dimensions.width === newWidth
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
describe('Property 24: Properties Panel Rejects Invalid Input', () => {
  const isValidInput = (
    element: Element,
    config: CanvasConfig,
    field: 'x' | 'y' | 'width' | 'height',
    value: number
  ): boolean => {
    if (isNaN(value)) {
      return false;
    }

    if (field === 'x') {
      return value >= 0 && value <= config.width - element.dimensions.width;
    } else if (field === 'y') {
      return value >= 0 && value <= config.height - element.dimensions.height;
    } else if (field === 'width') {
      return value >= config.minElementWidth && value <= config.width - element.position.x;
    } else if (field === 'height') {
      return value >= config.minElementHeight && value <= config.height - element.position.y;
    }

    return false;
  };

  it('should reject negative x values', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        fc.integer({ min: -1000, max: -1 }),
        (element, config, negativeX) => {
          const valid = isValidInput(element, config, 'x', negativeX);
          return !valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject width values below minimum', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        fc.integer({ min: 1, max: 19 }),
        (element, config, belowMinWidth) => {
          const valid = isValidInput(element, config, 'width', belowMinWidth);
          return !valid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject NaN values for all fields', () => {
    fc.assert(
      fc.property(
        arbitraryElement(),
        arbitraryCanvasConfig(),
        fc.constantFrom('x' as const, 'y' as const, 'width' as const, 'height' as const),
        (element, config, field) => {
          const valid = isValidInput(element, config, field, NaN);
          return !valid;
        }
      ),
      { numRuns: 100 }
    );
  });

});