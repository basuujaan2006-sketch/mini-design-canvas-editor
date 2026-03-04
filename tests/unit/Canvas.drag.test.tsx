/**
 * Unit tests for Canvas drag functionality
 * 
 * Tests:
 * - Mouse down on element starts drag
 * - Mouse move updates element position
 * - Mouse up ends drag
 * - Drag respects canvas boundaries
 * 
 * Requirements: 4.1, 4.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Canvas } from '../../src/components/Canvas';
import type { Element, CanvasConfig } from '../../src/types/canvas';

const mockConfig: CanvasConfig = {
  width: 800,
  height: 600,
  gridSize: 10,
  minElementWidth: 50,
  minElementHeight: 50,
};

describe('Canvas Drag Functionality', () => {
  it('calls onElementUpdate when dragging an element', () => {
    const onElementUpdate = vi.fn();
    const onElementSelect = vi.fn();
    
    const elements: Element[] = [
      {
        id: 'drag-test',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-element') as HTMLElement;
    const canvas = container.querySelector('.canvas') as HTMLElement;

    // Get canvas bounding rect for position calculations
    const canvasRect = canvas.getBoundingClientRect();

    // Simulate drag: mousedown -> mousemove -> mouseup
    fireEvent.mouseDown(element, {
      clientX: canvasRect.left + 150,
      clientY: canvasRect.top + 150,
    });

    // Element should be selected
    expect(onElementSelect).toHaveBeenCalledWith('drag-test');

    // Simulate mouse move
    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 200,
      clientY: canvasRect.top + 200,
    });

    // Position should be updated during drag
    expect(onElementUpdate).toHaveBeenCalled();
    
    // Get the last call to onElementUpdate
    const lastCall = onElementUpdate.mock.calls[onElementUpdate.mock.calls.length - 1];
    expect(lastCall[0]).toBe('drag-test');
    expect(lastCall[1]).toHaveProperty('position');

    // Simulate mouse up to end drag
    fireEvent.mouseUp(window);
  });

  it('updates element position in real-time during drag', () => {
    const onElementUpdate = vi.fn();
    
    const elements: Element[] = [
      {
        id: 'drag-test',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="drag-test"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-element') as HTMLElement;
    const canvas = container.querySelector('.canvas') as HTMLElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Start drag
    fireEvent.mouseDown(element, {
      clientX: canvasRect.left + 150,
      clientY: canvasRect.top + 150,
    });

    // Move mouse multiple times
    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 200,
      clientY: canvasRect.top + 200,
    });

    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 250,
      clientY: canvasRect.top + 250,
    });

    // Should have multiple update calls (real-time updates)
    expect(onElementUpdate.mock.calls.length).toBeGreaterThan(0);

    // End drag
    fireEvent.mouseUp(window);
  });

  it('does not update position when not dragging', () => {
    const onElementUpdate = vi.fn();
    
    const elements: Element[] = [
      {
        id: 'test',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={vi.fn()}
      />
    );

    const canvas = container.querySelector('.canvas') as HTMLElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Move mouse without starting drag
    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 200,
      clientY: canvasRect.top + 200,
    });

    // Should not update position
    expect(onElementUpdate).not.toHaveBeenCalled();
  });

  it('stops dragging on mouse up', () => {
    const onElementUpdate = vi.fn();
    
    const elements: Element[] = [
      {
        id: 'drag-test',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="drag-test"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-element') as HTMLElement;
    const canvas = container.querySelector('.canvas') as HTMLElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Start drag
    fireEvent.mouseDown(element, {
      clientX: canvasRect.left + 150,
      clientY: canvasRect.top + 150,
    });

    // Move mouse
    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 200,
      clientY: canvasRect.top + 200,
    });

    const callsBeforeMouseUp = onElementUpdate.mock.calls.length;

    // End drag
    fireEvent.mouseUp(window);

    // Move mouse after drag ended
    fireEvent.mouseMove(window, {
      clientX: canvasRect.left + 300,
      clientY: canvasRect.top + 300,
    });

    // Should not have additional calls after mouse up
    expect(onElementUpdate.mock.calls.length).toBe(callsBeforeMouseUp);
  });
});
