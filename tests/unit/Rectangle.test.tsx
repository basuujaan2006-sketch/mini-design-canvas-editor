/**
 * Unit tests for Rectangle component
 * 
 * Tests the Rectangle component rendering and interaction behavior.
 * Requirements: 2.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Rectangle } from '../../src/components/Rectangle';
import type { Element } from '../../src/types/canvas';

describe('Rectangle Component', () => {
  const mockElement: Element = {
    id: 'rect-1',
    type: 'rectangle',
    position: { x: 100, y: 100 },
    dimensions: { width: 200, height: 150 },
    zIndex: 1,
    color: '#ff0000',
  };

  it('renders rectangle with correct position and dimensions', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    expect(rect).toBeDefined();
    expect(rect.style.left).toBe('100px');
    expect(rect.style.top).toBe('100px');
    expect(rect.style.width).toBe('200px');
    expect(rect.style.height).toBe('150px');
  });

  it('renders rectangle with correct background color', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    expect(rect.style.backgroundColor).toBe('rgb(255, 0, 0)'); // #ff0000 in RGB
  });

  it('uses default color when color is not specified', () => {
    const elementWithoutColor: Element = {
      ...mockElement,
      color: undefined,
    };
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={elementWithoutColor} isSelected={false} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    expect(rect.style.backgroundColor).toBe('rgb(59, 130, 246)'); // #3b82f6 in RGB
  });

  it('applies selected class when isSelected is true', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={mockElement} isSelected={true} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    expect(rect.className).toContain('selected');
  });

  it('does not apply selected class when isSelected is false', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    expect(rect.className).not.toContain('selected');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Rectangle element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const rect = container.firstChild as HTMLElement;
    fireEvent.click(rect);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation on click', () => {
    const onSelect = vi.fn();
    const parentClick = vi.fn();
    
    const { container } = render(
      <div onClick={parentClick}>
        <Rectangle element={mockElement} isSelected={false} onSelect={onSelect} />
      </div>
    );

    const rect = container.querySelector('.canvas-rectangle') as HTMLElement;
    fireEvent.click(rect);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
