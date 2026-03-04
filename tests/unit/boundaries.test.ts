import { describe, it, expect } from 'vitest';
import {
  constrainToCanvas,
  isWithinBounds,
  constrainPosition,
  constrainDimensions,
} from '../../src/utils/boundaries';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Unit Tests for Boundary Constraint Functions
 * Feature: design-canvas-editor
 * Requirements: 1.3, 2.8, 4.4, 5.4
 */

describe('Boundary Constraint Functions', () => {
  const defaultConfig: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  const createTestElement = (
    x: number,
    y: number,
    width: number,
    height: number
  ): Element => ({
    id: 'test-element',
    type: 'rectangle',
    position: { x, y },
    dimensions: { width, height },
    zIndex: 1,
    color: '#ff0000',
  });

  describe('constrainToCanvas', () => {
    it('should not modify element already within bounds', () => {
      const element = createTestElement(100, 100, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      expect(constrained.position.x).toBe(100);
      expect(constrained.position.y).toBe(100);
      expect(constrained.dimensions.width).toBe(200);
      expect(constrained.dimensions.height).toBe(150);
    });

    it('should clamp negative x position to 0', () => {
      const element = createTestElement(-50, 100, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      expect(constrained.position.x).toBe(0);
      expect(constrained.position.y).toBe(100);
    });

    it('should clamp negative y position to 0', () => {
      const element = createTestElement(100, -50, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      expect(constrained.position.x).toBe(100);
      expect(constrained.position.y).toBe(0);
    });

    it('should clamp position when element extends beyond right edge', () => {
      const element = createTestElement(700, 100, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      // x should be clamped to 800 - 200 = 600
      expect(constrained.position.x).toBe(600);
      expect(constrained.position.y).toBe(100);
    });

    it('should clamp position when element extends beyond bottom edge', () => {
      const element = createTestElement(100, 500, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      // y should be clamped to 600 - 150 = 450
      expect(constrained.position.x).toBe(100);
      expect(constrained.position.y).toBe(450);
    });

    it('should handle element larger than canvas width', () => {
      const element = createTestElement(100, 100, 1000, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      // Width should be clamped to canvas width
      expect(constrained.dimensions.width).toBe(800);
      // Position should be adjusted to 0 since element now fits
      expect(constrained.position.x).toBe(0);
    });

    it('should handle element larger than canvas height', () => {
      const element = createTestElement(100, 100, 200, 800);
      const constrained = constrainToCanvas(element, defaultConfig);

      // Height should be clamped to canvas height
      expect(constrained.dimensions.height).toBe(600);
      // Position should be adjusted to 0 since element now fits
      expect(constrained.position.y).toBe(0);
    });

    it('should handle element larger than canvas in both dimensions', () => {
      const element = createTestElement(100, 100, 1000, 800);
      const constrained = constrainToCanvas(element, defaultConfig);

      expect(constrained.dimensions.width).toBe(800);
      expect(constrained.dimensions.height).toBe(600);
      expect(constrained.position.x).toBe(0);
      expect(constrained.position.y).toBe(0);
    });

    it('should handle element at exact canvas boundary', () => {
      const element = createTestElement(600, 450, 200, 150);
      const constrained = constrainToCanvas(element, defaultConfig);

      // Element exactly fits: x + width = 800, y + height = 600
      expect(constrained.position.x).toBe(600);
      expect(constrained.position.y).toBe(450);
      expect(constrained.dimensions.width).toBe(200);
      expect(constrained.dimensions.height).toBe(150);
    });
  });

  describe('isWithinBounds', () => {
    it('should return true for element within bounds', () => {
      const element = createTestElement(100, 100, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(true);
    });

    it('should return false for element with negative x', () => {
      const element = createTestElement(-10, 100, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(false);
    });

    it('should return false for element with negative y', () => {
      const element = createTestElement(100, -10, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(false);
    });

    it('should return false for element extending beyond right edge', () => {
      const element = createTestElement(700, 100, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(false);
    });

    it('should return false for element extending beyond bottom edge', () => {
      const element = createTestElement(100, 500, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(false);
    });

    it('should return true for element at exact canvas boundary', () => {
      const element = createTestElement(600, 450, 200, 150);
      expect(isWithinBounds(element, defaultConfig)).toBe(true);
    });

    it('should return false for element larger than canvas', () => {
      const element = createTestElement(0, 0, 1000, 800);
      expect(isWithinBounds(element, defaultConfig)).toBe(false);
    });
  });

  describe('constrainPosition', () => {
    it('should not modify position within bounds', () => {
      const position = { x: 100, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const constrained = constrainPosition(position, dimensions, defaultConfig);

      expect(constrained.x).toBe(100);
      expect(constrained.y).toBe(100);
    });

    it('should clamp negative x to 0', () => {
      const position = { x: -50, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const constrained = constrainPosition(position, dimensions, defaultConfig);

      expect(constrained.x).toBe(0);
      expect(constrained.y).toBe(100);
    });

    it('should clamp x when element would extend beyond right edge', () => {
      const position = { x: 700, y: 100 };
      const dimensions = { width: 200, height: 150 };
      const constrained = constrainPosition(position, dimensions, defaultConfig);

      expect(constrained.x).toBe(600); // 800 - 200
      expect(constrained.y).toBe(100);
    });

    it('should clamp y when element would extend beyond bottom edge', () => {
      const position = { x: 100, y: 500 };
      const dimensions = { width: 200, height: 150 };
      const constrained = constrainPosition(position, dimensions, defaultConfig);

      expect(constrained.x).toBe(100);
      expect(constrained.y).toBe(450); // 600 - 150
    });
  });

  describe('constrainDimensions', () => {
    it('should not modify dimensions within bounds and above minimum', () => {
      const dimensions = { width: 200, height: 150 };
      const position = { x: 100, y: 100 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      expect(constrained.width).toBe(200);
      expect(constrained.height).toBe(150);
    });

    it('should enforce minimum width', () => {
      const dimensions = { width: 10, height: 150 };
      const position = { x: 100, y: 100 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      expect(constrained.width).toBe(20); // minElementWidth
      expect(constrained.height).toBe(150);
    });

    it('should enforce minimum height', () => {
      const dimensions = { width: 200, height: 10 };
      const position = { x: 100, y: 100 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      expect(constrained.width).toBe(200);
      expect(constrained.height).toBe(20); // minElementHeight
    });

    it('should clamp width when it would extend beyond canvas', () => {
      const dimensions = { width: 800, height: 150 };
      const position = { x: 100, y: 100 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      expect(constrained.width).toBe(700); // 800 - 100
      expect(constrained.height).toBe(150);
    });

    it('should clamp height when it would extend beyond canvas', () => {
      const dimensions = { width: 200, height: 600 };
      const position = { x: 100, y: 100 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      expect(constrained.width).toBe(200);
      expect(constrained.height).toBe(500); // 600 - 100
    });

    it('should prioritize minimum dimensions over canvas bounds', () => {
      // Position near edge where minimum dimensions would extend beyond canvas
      const dimensions = { width: 10, height: 10 };
      const position = { x: 790, y: 590 };
      const constrained = constrainDimensions(dimensions, position, defaultConfig);

      // Should enforce minimum even though it extends beyond canvas
      expect(constrained.width).toBe(20); // minElementWidth
      expect(constrained.height).toBe(20); // minElementHeight
    });
  });
});
