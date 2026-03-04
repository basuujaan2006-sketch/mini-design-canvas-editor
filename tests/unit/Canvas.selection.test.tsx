/**
 * Integration tests for Canvas selection logic
 * 
 * Tests task 9.1: Add selection logic to Canvas component
 * - Handle element click to update selectedId in state
 * - Pass selection state to Element components
 * 
 * Requirements: 3.1, 3.6
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '../../src/components/Canvas';
import { useCanvasState } from '../../src/hooks/useCanvasState';
import type { Element, CanvasConfig } from '../../src/types/canvas';

const mockConfig: CanvasConfig = {
  width: 800,
  height: 600,
  gridSize: 10,
  minElementWidth: 50,
  minElementHeight: 50,
};

/**
 * Test wrapper component that integrates Canvas with state management
 */
function TestCanvasWithState({ elements }: { elements: Element[] }) {
  const [state, dispatch, _historyControls] = useCanvasState();
  const initializedRef = React.useRef(false);

  // Initialize elements using useEffect to avoid dispatching during render
  React.useEffect(() => {
    if (!initializedRef.current && elements.length > 0) {
      initializedRef.current = true;
      elements.forEach(element => {
        dispatch({ type: 'ADD_ELEMENT', element });
      });
    }
  }, [elements, dispatch]);

  const handleElementSelect = (id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', id });
  };

  const handleBackgroundClick = () => {
    dispatch({ type: 'SELECT_ELEMENT', id: null });
  };

  const handleElementUpdate = (id: string, updates: Partial<Element>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, updates });
  };

  return (
    <Canvas
      elements={state.elements}
      selectedId={state.selectedId}
      config={mockConfig}
      onElementSelect={handleElementSelect}
      onElementUpdate={handleElementUpdate}
      onBackgroundClick={handleBackgroundClick}
    />
  );
}

describe('Canvas Selection Logic (Task 9.1)', () => {
  it('handles element click to update selectedId in state', () => {
    const elements: Element[] = [
      {
        id: 'element-1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(<TestCanvasWithState elements={elements} />);

    // Initially no element is selected
    const element = container.querySelector('.canvas-element');
    expect(element).not.toHaveClass('selected');

    // Click the element
    fireEvent.click(element!);

    // Element should now be selected
    expect(element).toHaveClass('selected');
  });

  it('passes selection state to Element components correctly', async () => {
    const elements: Element[] = [
      {
        id: 'element-1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: 'element-2',
        type: 'rectangle',
        position: { x: 150, y: 150 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
    ];

    const { container } = render(<TestCanvasWithState elements={elements} />);

    // Wait for elements to be rendered
    await waitFor(() => {
      const canvasElements = container.querySelectorAll('.canvas-element');
      expect(canvasElements.length).toBe(2);
    });

    const canvasElements = container.querySelectorAll('.canvas-element');
    
    // Initially no elements are selected
    expect(canvasElements[0]).not.toHaveClass('selected');
    expect(canvasElements[1]).not.toHaveClass('selected');

    // Click first element
    fireEvent.click(canvasElements[0]);

    // First element should be selected, second should not
    expect(canvasElements[0]).toHaveClass('selected');
    expect(canvasElements[1]).not.toHaveClass('selected');

    // Click second element
    fireEvent.click(canvasElements[1]);

    // Second element should be selected, first should not (Requirement 3.6)
    expect(canvasElements[0]).not.toHaveClass('selected');
    expect(canvasElements[1]).toHaveClass('selected');
  });

  it('deselects element when clicking canvas background', () => {
    const elements: Element[] = [
      {
        id: 'element-1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
    ];

    const { container } = render(<TestCanvasWithState elements={elements} />);

    const element = container.querySelector('.canvas-element');
    const canvas = container.querySelector('.canvas');

    // Click element to select it
    fireEvent.click(element!);
    expect(element).toHaveClass('selected');

    // Click canvas background to deselect
    fireEvent.click(canvas!);
    expect(element).not.toHaveClass('selected');
  });

  it('maintains single selection when clicking multiple elements', async () => {
    const elements: Element[] = [
      {
        id: 'element-1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 100, height: 100 },
        zIndex: 1,
        color: '#ff0000',
      },
      {
        id: 'element-2',
        type: 'rectangle',
        position: { x: 150, y: 150 },
        dimensions: { width: 100, height: 100 },
        zIndex: 2,
        color: '#00ff00',
      },
      {
        id: 'element-3',
        type: 'rectangle',
        position: { x: 300, y: 300 },
        dimensions: { width: 100, height: 100 },
        zIndex: 3,
        color: '#0000ff',
      },
    ];

    const { container } = render(<TestCanvasWithState elements={elements} />);

    // Wait for elements to be rendered
    await waitFor(() => {
      const canvasElements = container.querySelectorAll('.canvas-element');
      expect(canvasElements.length).toBe(3);
    });

    const canvasElements = container.querySelectorAll('.canvas-element');

    // Click through all elements
    fireEvent.click(canvasElements[0]);
    expect(canvasElements[0]).toHaveClass('selected');
    expect(canvasElements[1]).not.toHaveClass('selected');
    expect(canvasElements[2]).not.toHaveClass('selected');

    fireEvent.click(canvasElements[1]);
    expect(canvasElements[0]).not.toHaveClass('selected');
    expect(canvasElements[1]).toHaveClass('selected');
    expect(canvasElements[2]).not.toHaveClass('selected');

    fireEvent.click(canvasElements[2]);
    expect(canvasElements[0]).not.toHaveClass('selected');
    expect(canvasElements[1]).not.toHaveClass('selected');
    expect(canvasElements[2]).toHaveClass('selected');
  });
});
