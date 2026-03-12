/**
 * Unit tests for Canvas component duplication functionality
 * 
 * Tests keyboard shortcut for duplicating elements (Ctrl+D / Cmd+D)
 * Requirements: 10.2
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '../../src/components/Canvas';
import type { Element, CanvasConfig } from '../../src/types/canvas';

const mockConfig: CanvasConfig = {
  width: 800,
  height: 600,
  gridSize: 10,
  minElementWidth: 20,
  minElementHeight: 20,
};

const mockElement: Element = {
  id: 'test-element-1',
  type: 'rectangle',
  position: { x: 100, y: 100 },
  dimensions: { width: 100, height: 100 },
  zIndex: 1,
  color: '#ff0000',
};

describe('Canvas - Duplication', () => {
  test('should call onElementDuplicate when Ctrl+D is pressed with selected element', () => {
    const onElementDuplicate = vi.fn();
    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();
    const onElementDelete = vi.fn();

    render(
      <Canvas
        elements={[mockElement]}
        selectedId="test-element-1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={onElementDelete}
        onElementDuplicate={onElementDuplicate}
      />
    );

    // Simulate Ctrl+D key press
    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

    expect(onElementDuplicate).toHaveBeenCalledWith('test-element-1');
    expect(onElementDuplicate).toHaveBeenCalledTimes(1);
  });

  test('should call onElementDuplicate when Cmd+D is pressed with selected element (Mac)', () => {
    const onElementDuplicate = vi.fn();
    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();
    const onElementDelete = vi.fn();

    render(
      <Canvas
        elements={[mockElement]}
        selectedId="test-element-1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={onElementDelete}
        onElementDuplicate={onElementDuplicate}
      />
    );

    // Simulate Cmd+D key press (metaKey for Mac)
    fireEvent.keyDown(window, { key: 'd', metaKey: true });

    expect(onElementDuplicate).toHaveBeenCalledWith('test-element-1');
    expect(onElementDuplicate).toHaveBeenCalledTimes(1);
  });

  test('should not call onElementDuplicate when Ctrl+D is pressed with no selection', () => {
    const onElementDuplicate = vi.fn();
    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();
    const onElementDelete = vi.fn();

    render(
      <Canvas
        elements={[mockElement]}
        selectedId={null}
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={onElementDelete}
        onElementDuplicate={onElementDuplicate}
      />
    );

    // Simulate Ctrl+D key press with no selection
    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

    expect(onElementDuplicate).not.toHaveBeenCalled();
  });

  test('should prevent default browser behavior when Ctrl+D is pressed', () => {
    const onElementDuplicate = vi.fn();
    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();
    const onElementDelete = vi.fn();

    render(
      <Canvas
        elements={[mockElement]}
        selectedId="test-element-1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={onElementDelete}
        onElementDuplicate={onElementDuplicate}
      />
    );

    // Create a mock event with preventDefault
    const event = new KeyboardEvent('keydown', { 
      key: 'd', 
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    // Dispatch the event
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onElementDuplicate).toHaveBeenCalledWith('test-element-1');
  });

  test('should not duplicate when only "d" key is pressed without Ctrl/Cmd', () => {
    const onElementDuplicate = vi.fn();
    const onElementSelect = vi.fn();
    const onElementUpdate = vi.fn();
    const onBackgroundClick = vi.fn();
    const onElementDelete = vi.fn();

    render(
      <Canvas
        elements={[mockElement]}
        selectedId="test-element-1"
        config={mockConfig}
        onElementSelect={onElementSelect}
        onElementUpdate={onElementUpdate}
        onBackgroundClick={onBackgroundClick}
        onElementDelete={onElementDelete}
        onElementDuplicate={onElementDuplicate}
      />
    );

    // Simulate just "d" key press without modifier
    fireEvent.keyDown(window, { key: 'd' });

    expect(onElementDuplicate).not.toHaveBeenCalled();
  });
});
