/**
 * Unit tests for TextBlock component
 * 
 * Tests the TextBlock component rendering and interaction behavior.
 * Requirements: 2.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TextBlock } from '../../src/components/TextBlock';
import type { Element } from '../../src/types/canvas';

describe('TextBlock Component', () => {
  const mockElement: Element = {
    id: 'text-1',
    type: 'text',
    position: { x: 100, y: 100 },
    dimensions: { width: 200, height: 150 },
    zIndex: 1,
    text: 'Hello World',
  };

  it('renders text block with correct position and dimensions', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock).toBeDefined();
    expect(textBlock.style.left).toBe('100px');
    expect(textBlock.style.top).toBe('100px');
    expect(textBlock.style.width).toBe('200px');
    expect(textBlock.style.height).toBe('150px');
  });

  it('renders text content correctly', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock.textContent).toBe('Hello World');
  });

  it('uses default text when text is not specified', () => {
    const elementWithoutText: Element = {
      ...mockElement,
      text: undefined,
    };
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={elementWithoutText} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock.textContent).toBe('Text');
  });

  it('applies selected class when isSelected is true', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={true} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock.className).toContain('selected');
  });

  it('does not apply selected class when isSelected is false', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock.className).not.toContain('selected');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    fireEvent.click(textBlock);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation on click', () => {
    const onSelect = vi.fn();
    const parentClick = vi.fn();
    
    const { container } = render(
      <div onClick={parentClick}>
        <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
      </div>
    );

    const textBlock = container.querySelector('.canvas-text') as HTMLElement;
    fireEvent.click(textBlock);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('applies text styling correctly', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TextBlock element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const textBlock = container.firstChild as HTMLElement;
    expect(textBlock.style.fontSize).toBe('16px');
    expect(textBlock.style.fontFamily).toContain('Arial');
    expect(textBlock.style.display).toBe('flex');
    expect(textBlock.style.alignItems).toBe('center');
    expect(textBlock.style.justifyContent).toBe('center');
  });
});
