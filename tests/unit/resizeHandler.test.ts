import { describe, it, expect } from 'vitest';
import {
  handleResizeStart,
  handleResizeMove,
  handleResizeEnd,
} from '../../src/utils/resizeHandler';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Unit Tests for Resize Handler Functions
 * Feature: design-canvas-editor
 * Requirements: 5.1, 5.4, 5.5, 5.6
 */

describe('Resize Handler Functions', () => {
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

  describe('handleResizeStart', () => {
    it('should initialize resize state with correct properties', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 250 }; // at southeast corner
      const handle = 'se';

      const resizeState = handleResizeStart('test-element', element, handle, mousePosition);

      expect(resizeState.isResizing).toBe(true);
      expect(resizeState.elementId).toBe('test-element');
      expect(resizeState.handle).toBe('se');
      expect(resizeState.startPosition).toEqual({ x: 300, y: 250 });
      expect(resizeState.startDimensions).toEqual({ width: 200, height: 100 });
    });

    it('should preserve element dimensions in startDimensions', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 100, y: 150 };
      const handle = 'nw';

      const resizeState = handleResizeStart('test-element', element, handle, mousePosition);

      expect(resizeState.startDimensions).toEqual({ width: 200, height: 100 });
      expect(resizeState.startDimensions).not.toBe(element.dimensions); // should be a copy
    });

    it('should work with different handle types', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 200, y: 150 };

      const handles: Array<'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'> = 
        ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

      handles.forEach(handle => {
        const resizeState = handleResizeStart('test-element', element, handle, mousePosition);
        expect(resizeState.handle).toBe(handle);
      });
    });
  });

  describe('handleResizeMove - Southeast handle', () => {
    it('should increase width and height when dragging southeast', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 250 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      // Drag 50px right and 30px down
      const newMousePosition = { x: 350, y: 280 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 250, height: 130 });
      expect(result.position).toEqual({ x: 100, y: 150 }); // position unchanged
    });

    it('should enforce minimum dimensions when resizing southeast', () => {
      const element = createTestElement(100, 150, 50, 50);
      const mousePosition = { x: 150, y: 200 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      // Try to resize smaller than minimum
      const newMousePosition = { x: 110, y: 160 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions.width).toBe(20); // minimum width
      expect(result.dimensions.height).toBe(20); // minimum height
    });
  });

  describe('handleResizeMove - Northwest handle', () => {
    it('should resize from top-left corner', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 100, y: 150 };
      const resizeState = handleResizeStart('test-element', element, 'nw', mousePosition);

      // Drag 20px left and 30px up (increases size)
      const newMousePosition = { x: 80, y: 120 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 220, height: 130 });
      expect(result.position).toEqual({ x: 80, y: 120 }); // position moves with handle
    });

    it('should enforce minimum dimensions when resizing northwest', () => {
      const element = createTestElement(100, 150, 50, 50);
      const mousePosition = { x: 100, y: 150 };
      const resizeState = handleResizeStart('test-element', element, 'nw', mousePosition);

      // Try to resize smaller than minimum by dragging right and down
      const newMousePosition = { x: 140, y: 190 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions.width).toBe(20); // minimum width
      expect(result.dimensions.height).toBe(20); // minimum height
      // Position should adjust to maintain right/bottom edges
      expect(result.position.x).toBe(130); // 100 + (50 - 20)
      expect(result.position.y).toBe(180); // 150 + (50 - 20)
    });
  });

  describe('handleResizeMove - Edge handles', () => {
    it('should resize only width when dragging east handle', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 200 };
      const resizeState = handleResizeStart('test-element', element, 'e', mousePosition);

      const newMousePosition = { x: 350, y: 200 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 250, height: 100 }); // only width changes
      expect(result.position).toEqual({ x: 100, y: 150 }); // position unchanged
    });

    it('should resize only height when dragging south handle', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 200, y: 250 };
      const resizeState = handleResizeStart('test-element', element, 's', mousePosition);

      const newMousePosition = { x: 200, y: 300 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 200, height: 150 }); // only height changes
      expect(result.position).toEqual({ x: 100, y: 150 }); // position unchanged
    });

    it('should resize width and move position when dragging west handle', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 100, y: 200 };
      const resizeState = handleResizeStart('test-element', element, 'w', mousePosition);

      const newMousePosition = { x: 80, y: 200 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 220, height: 100 }); // width increases
      expect(result.position).toEqual({ x: 80, y: 150 }); // x position moves
    });

    it('should resize height and move position when dragging north handle', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 200, y: 150 };
      const resizeState = handleResizeStart('test-element', element, 'n', mousePosition);

      const newMousePosition = { x: 200, y: 120 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 200, height: 130 }); // height increases
      expect(result.position).toEqual({ x: 100, y: 120 }); // y position moves
    });
  });

  describe('handleResizeMove - Boundary constraints', () => {
    it('should prevent element from extending beyond right edge', () => {
      const element = createTestElement(600, 150, 100, 100);
      const mousePosition = { x: 700, y: 200 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      // Try to resize beyond canvas width
      const newMousePosition = { x: 900, y: 200 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions.width).toBe(200); // clamped to 800 - 600
      expect(result.position.x).toBe(600);
    });

    it('should prevent element from extending beyond bottom edge', () => {
      const element = createTestElement(100, 450, 100, 100);
      const mousePosition = { x: 200, y: 550 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      // Try to resize beyond canvas height
      const newMousePosition = { x: 200, y: 700 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions.height).toBe(150); // clamped to 600 - 450
      expect(result.position.y).toBe(450);
    });

    it('should prevent position from going negative when resizing northwest', () => {
      const element = createTestElement(50, 50, 100, 100);
      const mousePosition = { x: 50, y: 50 };
      const resizeState = handleResizeStart('test-element', element, 'nw', mousePosition);

      // Try to drag beyond canvas top-left
      const newMousePosition = { x: -50, y: -50 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.position.x).toBe(0); // clamped to 0
      expect(result.position.y).toBe(0); // clamped to 0
    });
  });

  describe('handleResizeMove - All corner handles', () => {
    it('should handle northeast corner resize', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 150 };
      const resizeState = handleResizeStart('test-element', element, 'ne', mousePosition);

      const newMousePosition = { x: 350, y: 120 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 250, height: 130 });
      expect(result.position).toEqual({ x: 100, y: 120 }); // only y changes
    });

    it('should handle southwest corner resize', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 100, y: 250 };
      const resizeState = handleResizeStart('test-element', element, 'sw', mousePosition);

      const newMousePosition = { x: 80, y: 280 };
      const result = handleResizeMove(resizeState, newMousePosition, element, defaultConfig);

      expect(result.dimensions).toEqual({ width: 220, height: 130 });
      expect(result.position).toEqual({ x: 80, y: 150 }); // only x changes
    });
  });

  describe('handleResizeEnd', () => {
    it('should set isResizing to false', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 250 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      const endState = handleResizeEnd(resizeState);

      expect(endState.isResizing).toBe(false);
    });

    it('should preserve other resize state properties', () => {
      const element = createTestElement(100, 150, 200, 100);
      const mousePosition = { x: 300, y: 250 };
      const resizeState = handleResizeStart('test-element', element, 'se', mousePosition);

      const endState = handleResizeEnd(resizeState);

      expect(endState.elementId).toBe(resizeState.elementId);
      expect(endState.handle).toBe(resizeState.handle);
      expect(endState.startPosition).toEqual(resizeState.startPosition);
      expect(endState.startDimensions).toEqual(resizeState.startDimensions);
    });
  });
});
