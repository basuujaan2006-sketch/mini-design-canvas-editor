import { describe, it, expect } from 'vitest';
import {
  handleDragStart,
  handleDragMove,
  handleDragEnd,
} from '../../src/utils/dragHandler';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Unit Tests for Drag Handler Functions
 * Feature: design-canvas-editor
 * Requirements: 4.1, 4.3, 4.4
 */

describe('Drag Handler Functions', () => {
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

  describe('handleDragStart', () => {
    it('should initialize drag state with correct offset', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };

      const dragState = handleDragStart('test-element', element, mousePosition);

      expect(dragState.isDragging).toBe(true);
      expect(dragState.elementId).toBe('test-element');
      expect(dragState.startPosition).toEqual({ x: 100, y: 150 });
      expect(dragState.offset).toEqual({ x: 20, y: 20 });
    });

    it('should handle mouse at element top-left corner', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 100, y: 150 };

      const dragState = handleDragStart('test-element', element, mousePosition);

      expect(dragState.offset).toEqual({ x: 0, y: 0 });
    });

    it('should handle mouse at element center', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 200, y: 200 }; // center of element

      const dragState = handleDragStart('test-element', element, mousePosition);

      expect(dragState.offset).toEqual({ x: 100, y: 50 });
    });

    it('should preserve element position in startPosition', () => {
      const element = createTestElement(250, 300, 150, 80);
      const mousePosition = { x: 300, y: 350 };

      const dragState = handleDragStart('test-element', element, mousePosition);

      expect(dragState.startPosition).toEqual({ x: 250, y: 300 });
      expect(dragState.startPosition).not.toBe(element.position); // should be a copy
    });
  });

  describe('handleDragMove', () => {
    it('should calculate new position based on mouse movement', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Move mouse to new position
      const newMousePosition = { x: 150, y: 200 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // New position should be: mouse - offset = (150, 200) - (20, 20) = (130, 180)
      expect(newPosition).toEqual({ x: 130, y: 180 });
    });

    it('should maintain offset during drag', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 200, y: 200 }; // center of element
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Move mouse
      const newMousePosition = { x: 300, y: 250 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // New position should be: (300, 250) - (100, 50) = (200, 200)
      expect(newPosition).toEqual({ x: 200, y: 200 });
    });

    it('should constrain position to prevent negative x', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Try to move element to negative x
      const newMousePosition = { x: 10, y: 170 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // x should be clamped to 0
      expect(newPosition.x).toBe(0);
      expect(newPosition.y).toBe(150); // y: 170 - 20 = 150
    });

    it('should constrain position to prevent negative y', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Try to move element to negative y
      const newMousePosition = { x: 120, y: 10 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // y should be clamped to 0
      expect(newPosition.x).toBe(100); // x: 120 - 20 = 100
      expect(newPosition.y).toBe(0);
    });

    it('should constrain position to prevent element extending beyond right edge', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Try to move element beyond right edge
      const newMousePosition = { x: 750, y: 170 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // x should be clamped to 800 - 200 = 600
      expect(newPosition.x).toBe(600);
      expect(newPosition.y).toBe(150);
    });

    it('should constrain position to prevent element extending beyond bottom edge', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Try to move element beyond bottom edge
      const newMousePosition = { x: 120, y: 550 };
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      // y should be clamped to 600 - 100 = 500
      expect(newPosition.x).toBe(100);
      expect(newPosition.y).toBe(500);
    });

    it('should allow element to be positioned at exact canvas boundary', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      // Move to exact boundary: x + width = 800, y + height = 600
      const newMousePosition = { x: 620, y: 520 }; // offset by (20, 20)
      const newPosition = handleDragMove(
        dragState,
        newMousePosition,
        element.dimensions,
        defaultConfig
      );

      expect(newPosition).toEqual({ x: 600, y: 500 });
    });
  });

  describe('handleDragEnd', () => {
    it('should set isDragging to false', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      const endState = handleDragEnd(dragState);

      expect(endState.isDragging).toBe(false);
    });

    it('should preserve other drag state properties', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      const dragState = handleDragStart('test-element', element, mousePosition);

      const endState = handleDragEnd(dragState);

      expect(endState.elementId).toBe(dragState.elementId);
      expect(endState.startPosition).toEqual(dragState.startPosition);
      expect(endState.offset).toEqual(dragState.offset);
    });

    it('should work with drag state that has been updated during drag', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 120, y: 170 };
      let dragState = handleDragStart('test-element', element, mousePosition);

      // Simulate drag move (though handleDragMove doesn't modify dragState)
      const newMousePosition = { x: 150, y: 200 };
      handleDragMove(dragState, newMousePosition, element.dimensions, defaultConfig);

      const endState = handleDragEnd(dragState);

      expect(endState.isDragging).toBe(false);
      expect(endState.elementId).toBe('test-element');
    });
  });
});
