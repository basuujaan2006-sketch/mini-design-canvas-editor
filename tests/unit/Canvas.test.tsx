/**
 * Unit tests for Canvas component
 * 
 * Tests:
 * - Canvas renders with correct dimensions
 * - Elements are rendered in z-index order
 * - Background click deselects elements
 * - Element click triggers selection
 * - Visual styling is applied correctly
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 3.4, 6.2
 */

import { describe, it, expect, vi } from 'vitest';
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

describe('Canvas Component', () => {
  it('renders canvas with correct dimensions', () => {
    const { container } = render(
      <Canvas
        elements={[]}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={vi.fn()}
      />
    );

    const canvas = container.querySelector('.canvas');
    expect(canvas).toBeTruthy();
    expect(canvas).toHaveStyle({
      width: '800px',
      height: '600px',
    });
  });

  it('renders multiple elements', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'text',
        position: { x: 150, y: 150 },
        dimensions: { width: 100, height: 50 },
        zIndex: 2,
        text: 'Hello',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const canvasElements = container.querySelectorAll('.canvas-element');
    expect(canvasElements).toHaveLength(2);
  });

  it('renders elements in z-index order', () => {
    const elements: Element[] = [
      {
        id: 'high',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        dimensions: { width: 100, height: 100 },
        zIndex: 10,
        color: '#ff0000',
      },
      {
        id: 'low',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#00ff00',
      },
      {
        id: 'mid',
        type: 'rectangle',
        position: { x: 0, y: 0 },
        dimensions: { width: 100, height: 100 },
        zIndex: 5,
        color: '#0000ff',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const canvasElements = container.querySelectorAll('.canvas-element');
    // Elements should be rendered in z-index order: low (1), mid (5), high (10)
    expect(canvasElements[0]).toHaveStyle({ backgroundColor: '#00ff00' });
    expect(canvasElements[1]).toHaveStyle({ backgroundColor: '#0000ff' });
    expect(canvasElements[2]).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('calls onBackgroundClick when clicking canvas background', () => {
    const onBackgroundClick = vi.fn();
    const { container } = render(
      <Canvas
        elements={[]}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={onBackgroundClick}
      />
    );

    const canvas = container.querySelector('.canvas');
    fireEvent.click(canvas!);

    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onBackgroundClick when clicking an element', () => {
    const onBackgroundClick = vi.fn();
    const onElementSelect = vi.fn();
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
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
        onElementUpdate={vi.fn()}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-element');
    fireEvent.click(element!);

    expect(onElementSelect).toHaveBeenCalledTimes(1);
    expect(onElementSelect).toHaveBeenCalledWith('1');
    expect(onBackgroundClick).not.toHaveBeenCalled();
  });

  it('applies selected class to selected element', () => {
    const elements: Element[] = [
      {
        id: 'selected',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: 'not-selected',
        type: 'rectangle',
        position: { x: 150, y: 150 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="selected"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const canvasElements = container.querySelectorAll('.canvas-element');
    expect(canvasElements[0]).toHaveClass('selected');
    expect(canvasElements[1]).not.toHaveClass('selected');
  });

  it('renders rectangle element with correct color', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff5733',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-rectangle');
    expect(element).toHaveStyle({ backgroundColor: '#ff5733' });
  });

  it('renders text element with correct content', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'text',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 50 },
        zIndex: 1,
        text: 'Test Text',
      },
    ];

    render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    expect(screen.getByText('Test Text')).toBeTruthy();
  });

  it('renders image placeholder when no imageUrl is provided', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'image',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
      },
    ];

    render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    expect(screen.getByText('Double-click to upload')).toBeTruthy();
  });

  it('positions elements correctly', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 50, y: 75 },
        dimensions: { width: 120, height: 80 },
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
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const element = container.querySelector('.canvas-element');
    expect(element).toHaveStyle({
      left: '50px',
      top: '75px',
      width: '120px',
      height: '80px',
    });
  });

  it('renders SelectionOverlay when element is selected', () => {
    const elements: Element[] = [
      {
        id: 'selected',
        type: 'rectangle',
        position: { x: 100, y: 150 },
        dimensions: { width: 200, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(
      <Canvas
        elements={elements}
        selectedId="selected"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeTruthy();
    
    const border = container.querySelector('.selection-border');
    expect(border).toBeTruthy();
    
    const handles = container.querySelectorAll('.resize-handle');
    expect(handles).toHaveLength(8);
  });

  it('does not render SelectionOverlay when no element is selected', () => {
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 100, y: 150 },
        dimensions: { width: 200, height: 100 },
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
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
      />
    );

    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeFalsy();
  });
});
