/**
 * Unit tests for ImagePlaceholder component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePlaceholder } from '../../src/components/ImagePlaceholder';
import type { Element } from '../../src/types/canvas';

describe('ImagePlaceholder', () => {
  const mockElement: Element = {
    id: 'img-1',
    type: 'image',
    position: { x: 100, y: 100 },
    dimensions: { width: 200, height: 150 },
    zIndex: 1,
  };

  it('renders image placeholder with correct positioning', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ImagePlaceholder element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toBeDefined();
    expect(placeholder.style.left).toBe('100px');
    expect(placeholder.style.top).toBe('100px');
    expect(placeholder.style.width).toBe('200px');
    expect(placeholder.style.height).toBe('150px');
  });

  it('displays image indicator text', () => {
    const onSelect = vi.fn();
    render(
      <ImagePlaceholder element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    expect(screen.getByText('Double-click to upload')).toBeDefined();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ImagePlaceholder element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const placeholder = container.firstChild as HTMLElement;
    fireEvent.click(placeholder);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('applies selected class when isSelected is true', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ImagePlaceholder element={mockElement} isSelected={true} onSelect={onSelect} />
    );

    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.className).toContain('selected');
  });

  it('does not apply selected class when isSelected is false', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ImagePlaceholder element={mockElement} isSelected={false} onSelect={onSelect} />
    );

    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.className).not.toContain('selected');
  });

  it('stops event propagation on click', () => {
    const onSelect = vi.fn();
    const onParentClick = vi.fn();
    const { container } = render(
      <div onClick={onParentClick}>
        <ImagePlaceholder element={mockElement} isSelected={false} onSelect={onSelect} />
      </div>
    );

    const placeholder = container.querySelector('.canvas-image') as HTMLElement;
    fireEvent.click(placeholder);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
