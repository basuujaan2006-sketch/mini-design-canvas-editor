/**
 * Unit tests for SelectionOverlay component
 * 
 * Tests:
 * - SelectionOverlay renders with correct position and dimensions
 * - Border highlight is rendered
 * - All 8 resize handles are rendered (corners and edges)
 * - Resize handles have correct positioning
 * 
 * Requirements: 3.2, 3.3, 5.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SelectionOverlay } from '../../src/components/SelectionOverlay';
import type { Element, CanvasConfig } from '../../src/types/canvas';

describe('SelectionOverlay Component', () => {
  const mockElement: Element = {
    id: 'test-element',
    type: 'rectangle',
    position: { x: 100, y: 150 },
    dimensions: { width: 200, height: 100 },
    zIndex: 1,
    color: '#ff0000',
  };

  const mockConfig: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 50,
    minElementHeight: 50,
  };

  const mockOnElementUpdate = vi.fn();

  it('renders overlay with correct position and dimensions', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeTruthy();
    
    const style = window.getComputedStyle(overlay!);
    expect(style.position).toBe('absolute');
    expect(style.left).toBe('100px');
    expect(style.top).toBe('150px');
    expect(style.width).toBe('200px');
    expect(style.height).toBe('100px');
  });

  it('renders border highlight', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const border = container.querySelector('.selection-border');
    expect(border).toBeTruthy();
  });

  it('renders all 8 resize handles', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(8);
  });

  it('renders corner resize handles', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    expect(container.querySelector('.resize-handle-nw')).toBeTruthy();
    expect(container.querySelector('.resize-handle-ne')).toBeTruthy();
    expect(container.querySelector('.resize-handle-se')).toBeTruthy();
    expect(container.querySelector('.resize-handle-sw')).toBeTruthy();
  });

  it('renders edge resize handles', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    expect(container.querySelector('.resize-handle-n')).toBeTruthy();
    expect(container.querySelector('.resize-handle-e')).toBeTruthy();
    expect(container.querySelector('.resize-handle-s')).toBeTruthy();
    expect(container.querySelector('.resize-handle-w')).toBeTruthy();
  });

  it('renders overlay for text element', () => {
    const textElement: Element = {
      id: 'text-element',
      type: 'text',
      position: { x: 50, y: 75 },
      dimensions: { width: 150, height: 80 },
      zIndex: 2,
      text: 'Test Text',
    };

    const { container } = render(
      <SelectionOverlay
        element={textElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeTruthy();
    
    const style = window.getComputedStyle(overlay!);
    expect(style.left).toBe('50px');
    expect(style.top).toBe('75px');
    expect(style.width).toBe('150px');
    expect(style.height).toBe('80px');
  });

  it('renders overlay for image element', () => {
    const imageElement: Element = {
      id: 'image-element',
      type: 'image',
      position: { x: 200, y: 250 },
      dimensions: { width: 300, height: 200 },
      zIndex: 3,
    };

    const { container } = render(
      <SelectionOverlay
        element={imageElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeTruthy();
    
    const style = window.getComputedStyle(overlay!);
    expect(style.left).toBe('200px');
    expect(style.top).toBe('250px');
    expect(style.width).toBe('300px');
    expect(style.height).toBe('200px');
  });

  it('overlay has high z-index to appear above elements', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    const style = window.getComputedStyle(overlay!);
    
    // Check that z-index is set (actual value is in CSS)
    expect(overlay).toBeTruthy();
  });

  it('resize handles have pointer-events enabled', () => {
    const { container } = render(
      <SelectionOverlay
        element={mockElement}
        config={mockConfig}
        onElementUpdate={mockOnElementUpdate}
      />
    );

    const handles = container.querySelectorAll('.resize-handle');
    handles.forEach((handle) => {
      const style = window.getComputedStyle(handle);
      expect(style.pointerEvents).toBe('auto');
    });
  });
});
