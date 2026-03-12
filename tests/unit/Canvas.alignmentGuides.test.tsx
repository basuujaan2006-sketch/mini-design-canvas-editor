/**
 * Unit tests for Canvas component alignment guide integration
 * 
 * Tests that alignment guides are displayed during drag operations
 * and cleared when drag ends.
 * 
 * Requirements: 12.1, 12.4
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

describe('Canvas Alignment Guides Integration', () => {
  test('displays alignment guides during drag when elements align', () => {
    // Create two elements that can align
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'rectangle',
        position: { x: 300, y: 100 }, // Same y position - will align horizontally
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
      />
    );

    // Get the first element
    const element1 = screen.getByTestId('element-1');

    // Start dragging element 1
    fireEvent.mouseDown(element1, { clientX: 150, clientY: 150 });

    // Move mouse to a position where element 1 would align with element 2
    // Element 2 is at y: 100, so moving element 1 to around y: 100 should trigger alignment
    fireEvent.mouseMove(window, { clientX: 250, clientY: 150 });

    // Check if alignment guides are rendered
    const guides = container.querySelectorAll('.alignment-guide');
    expect(guides.length).toBeGreaterThan(0);
  });

  test('clears alignment guides when drag ends', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'rectangle',
        position: { x: 300, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
      />
    );

    const element1 = screen.getByTestId('element-1');

    // Start dragging
    fireEvent.mouseDown(element1, { clientX: 150, clientY: 150 });

    // Move to trigger alignment
    fireEvent.mouseMove(window, { clientX: 250, clientY: 150 });

    // Verify guides are present
    let guides = container.querySelectorAll('.alignment-guide');
    expect(guides.length).toBeGreaterThan(0);

    // End drag
    fireEvent.mouseUp(window);

    // Verify guides are cleared
    guides = container.querySelectorAll('.alignment-guide');
    expect(guides.length).toBe(0);
  });

  test('does not display alignment guides when not dragging', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'rectangle',
        position: { x: 300, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
      />
    );

    // No drag operation - guides should not be present
    const guides = container.querySelectorAll('.alignment-guide');
    expect(guides.length).toBe(0);
  });

  test('updates alignment guides as element moves during drag', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'rectangle',
        position: { x: 300, y: 100 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
      />
    );

    const element1 = screen.getByTestId('element-1');

    // Start dragging
    fireEvent.mouseDown(element1, { clientX: 150, clientY: 150 });

    // Move to a position that doesn't align
    fireEvent.mouseMove(window, { clientX: 150, clientY: 250 });

    // Move to a position that aligns
    fireEvent.mouseMove(window, { clientX: 250, clientY: 150 });

    // Guides should be present after moving to aligned position
    const guides = container.querySelectorAll('.alignment-guide');
    expect(guides.length).toBeGreaterThan(0);
  });
});
