/**
 * Canvas Component - Resize Integration Tests
 * 
 * Tests the integration of resize functionality in the Canvas component,
 * verifying that resize handles work correctly and update element dimensions.
 * 
 * Requirements: 5.1
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '../../src/components/Canvas';
import type { Element, CanvasConfig } from '../../src/types/canvas';

const mockConfig: CanvasConfig = {
  width: 800,
  height: 600,
  gridSize: 10,
  minElementWidth: 50,
  minElementHeight: 50,
};

describe('Canvas Component - Resize Integration', () => {
  test('should render resize handles when element is selected', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Verify resize handles are rendered
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(8);

    // Verify all handle types are present
    const handleTypes = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handleTypes.forEach((type) => {
      const handle = container.querySelector(`.resize-handle-${type}`);
      expect(handle).toBeTruthy();
    });
  });

  test('should not render resize handles when no element is selected', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId={null}
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Verify no resize handles are rendered
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(0);
  });

  test('should call onElementUpdate when resize handle is dragged', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Get the southeast resize handle
    const seHandle = container.querySelector('.resize-handle-se');
    expect(seHandle).toBeTruthy();

    // Simulate mousedown on the handle
    fireEvent.mouseDown(seHandle!, { clientX: 300, clientY: 250 });

    // Simulate mousemove to resize
    fireEvent.mouseMove(window, { clientX: 350, clientY: 300 });

    // Verify onElementUpdate was called with new dimensions
    expect(mockOnElementUpdate).toHaveBeenCalled();
    
    // Get the last call to verify dimensions were updated
    const lastCall = mockOnElementUpdate.mock.calls[mockOnElementUpdate.mock.calls.length - 1];
    expect(lastCall[0]).toBe('test-1');
    expect(lastCall[1]).toHaveProperty('dimensions');
    expect(lastCall[1]).toHaveProperty('position');
  });

  test('should update element dimensions in real-time during resize', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Get the east resize handle (right edge)
    const eHandle = container.querySelector('.resize-handle-e');
    expect(eHandle).toBeTruthy();

    // Simulate mousedown on the handle
    fireEvent.mouseDown(eHandle!, { clientX: 300, clientY: 175 });

    // Simulate multiple mousemove events to verify real-time updates
    fireEvent.mouseMove(window, { clientX: 320, clientY: 175 });
    fireEvent.mouseMove(window, { clientX: 340, clientY: 175 });
    fireEvent.mouseMove(window, { clientX: 360, clientY: 175 });

    // Verify onElementUpdate was called multiple times (real-time updates)
    expect(mockOnElementUpdate.mock.calls.length).toBeGreaterThan(1);
  });

  test('should stop resizing when mouse is released', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Get the southeast resize handle
    const seHandle = container.querySelector('.resize-handle-se');
    expect(seHandle).toBeTruthy();

    // Simulate resize operation
    fireEvent.mouseDown(seHandle!, { clientX: 300, clientY: 250 });
    fireEvent.mouseMove(window, { clientX: 350, clientY: 300 });
    
    // Clear the mock to track calls after mouseup
    mockOnElementUpdate.mockClear();
    
    // Release mouse
    fireEvent.mouseUp(window);

    // Move mouse again - should not trigger updates anymore
    fireEvent.mouseMove(window, { clientX: 400, clientY: 350 });

    // Verify no additional updates after mouseup
    expect(mockOnElementUpdate).not.toHaveBeenCalled();
  });

  test('should handle resize with different handle types', () => {
    const element: Element = {
      id: 'test-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Test north handle (should only affect height and y position)
    const nHandle = container.querySelector('.resize-handle-n');
    expect(nHandle).toBeTruthy();

    fireEvent.mouseDown(nHandle!, { clientX: 200, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 80 });

    // Verify update was called
    expect(mockOnElementUpdate).toHaveBeenCalled();
    
    // Verify both dimensions and position were updated (north handle affects both)
    const lastCall = mockOnElementUpdate.mock.calls[mockOnElementUpdate.mock.calls.length - 1];
    expect(lastCall[1]).toHaveProperty('dimensions');
    expect(lastCall[1]).toHaveProperty('position');
  });

  test('should work with text elements', () => {
    const element: Element = {
      id: 'test-1',
      type: 'text',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 100 },
      zIndex: 1,
      text: 'Test Text',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Verify resize handles are rendered for text elements
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(8);

    // Test resize works
    const seHandle = container.querySelector('.resize-handle-se');
    fireEvent.mouseDown(seHandle!, { clientX: 300, clientY: 200 });
    fireEvent.mouseMove(window, { clientX: 350, clientY: 250 });

    expect(mockOnElementUpdate).toHaveBeenCalled();
  });

  test('should work with image elements', () => {
    const element: Element = {
      id: 'test-1',
      type: 'image',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 200 },
      zIndex: 1,
      imageUrl: 'https://example.com/image.jpg',
    };

    const mockOnElementSelect = vi.fn();
    const mockOnElementUpdate = vi.fn();
    const mockOnBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={[element]}
        selectedId="test-1"
        config={mockConfig}
        onElementSelect={mockOnElementSelect}
        onElementUpdate={mockOnElementUpdate}
        onBackgroundClick={mockOnBackgroundClick}
      />
    );

    // Verify resize handles are rendered for image elements
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(8);

    // Test resize works
    const seHandle = container.querySelector('.resize-handle-se');
    fireEvent.mouseDown(seHandle!, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(window, { clientX: 350, clientY: 350 });

    expect(mockOnElementUpdate).toHaveBeenCalled();
  });
});
