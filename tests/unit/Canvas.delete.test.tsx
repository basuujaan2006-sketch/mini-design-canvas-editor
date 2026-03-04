/**
 * Unit tests for Canvas component - Delete key functionality
 * 
 * Tests:
 * - Delete key deletes selected element
 * - Delete key is ignored when no element is selected
 * - Backspace key also works for deletion
 * 
 * Requirements: 7.1, 7.5, 10.1
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

describe('Canvas Component - Delete Key', () => {
  it('calls onElementDelete when Delete key is pressed with selected element', () => {
    const onElementDelete = vi.fn();
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

    render(
      <Canvas
        elements={elements}
        selectedId="element-1"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={onElementDelete}
      />
    );

    // Simulate Delete key press
    fireEvent.keyDown(window, { key: 'Delete' });

    expect(onElementDelete).toHaveBeenCalledTimes(1);
    expect(onElementDelete).toHaveBeenCalledWith('element-1');
  });

  it('calls onElementDelete when Backspace key is pressed with selected element', () => {
    const onElementDelete = vi.fn();
    const elements: Element[] = [
      {
        id: 'element-2',
        type: 'text',
        position: { x: 50, y: 50 },
        dimensions: { width: 150, height: 75 },
        zIndex: 1,
        text: 'Test Text',
      },
    ];

    render(
      <Canvas
        elements={elements}
        selectedId="element-2"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={onElementDelete}
      />
    );

    // Simulate Backspace key press
    fireEvent.keyDown(window, { key: 'Backspace' });

    expect(onElementDelete).toHaveBeenCalledTimes(1);
    expect(onElementDelete).toHaveBeenCalledWith('element-2');
  });

  it('does not call onElementDelete when Delete key is pressed with no selection', () => {
    const onElementDelete = vi.fn();
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

    render(
      <Canvas
        elements={elements}
        selectedId={null}
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={onElementDelete}
      />
    );

    // Simulate Delete key press with no selection
    fireEvent.keyDown(window, { key: 'Delete' });

    // Should not be called when no element is selected
    // Requirements: 7.5
    expect(onElementDelete).not.toHaveBeenCalled();
  });

  it('does not call onElementDelete when other keys are pressed', () => {
    const onElementDelete = vi.fn();
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

    render(
      <Canvas
        elements={elements}
        selectedId="element-1"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={onElementDelete}
      />
    );

    // Simulate various other key presses
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.keyDown(window, { key: 'a' });

    // Should not be called for non-delete keys
    expect(onElementDelete).not.toHaveBeenCalled();
  });

  it('prevents default browser behavior when Delete key is pressed', () => {
    const onElementDelete = vi.fn();
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

    render(
      <Canvas
        elements={elements}
        selectedId="element-1"
        config={mockConfig}
        onElementSelect={vi.fn()}
        onElementUpdate={vi.fn()}
        onBackgroundClick={vi.fn()}
        onElementDelete={onElementDelete}
      />
    );

    // Create a mock event with preventDefault
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    fireEvent(window, event);

    // Verify preventDefault was called to avoid browser navigation
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
