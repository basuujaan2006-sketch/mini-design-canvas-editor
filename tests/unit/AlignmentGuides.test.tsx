import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AlignmentGuides } from '../../src/components/AlignmentGuides';
import type { AlignmentGuide } from '../../src/types/canvas';

/**
 * Unit Tests for AlignmentGuides Component
 * Feature: design-canvas-editor
 * Requirements: 12.2, 12.3
 */

describe('AlignmentGuides Component', () => {
  const canvasWidth = 800;
  const canvasHeight = 600;

  it('should render nothing when guides array is empty', () => {
    const { container } = render(
      <AlignmentGuides guides={[]} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const guides = container.querySelectorAll('.alignment-guide');
    expect(guides).toHaveLength(0);
  });

  it('should render a vertical guide at the correct position', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem1'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuides = container.querySelectorAll('.alignment-guide-vertical');
    expect(verticalGuides).toHaveLength(1);

    const guide = verticalGuides[0] as HTMLElement;
    expect(guide.style.left).toBe('100px');
    expect(guide.style.top).toBe('0px');
    expect(guide.style.height).toBe('600px');
  });

  it('should render a horizontal guide at the correct position', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'horizontal',
        position: 200,
        matchedElements: ['elem1'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const horizontalGuides = container.querySelectorAll('.alignment-guide-horizontal');
    expect(horizontalGuides).toHaveLength(1);

    const guide = horizontalGuides[0] as HTMLElement;
    expect(guide.style.left).toBe('0px');
    expect(guide.style.top).toBe('200px');
    expect(guide.style.width).toBe('800px');
  });

  it('should render multiple guides of different types', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: 200,
        matchedElements: ['elem2'],
      },
      {
        type: 'vertical',
        position: 300,
        matchedElements: ['elem3'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuides = container.querySelectorAll('.alignment-guide-vertical');
    const horizontalGuides = container.querySelectorAll('.alignment-guide-horizontal');

    expect(verticalGuides).toHaveLength(2);
    expect(horizontalGuides).toHaveLength(1);
  });

  it('should render guides with correct canvas dimensions', () => {
    const customWidth = 1000;
    const customHeight = 800;

    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 50,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: 100,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={customWidth} canvasHeight={customHeight} />
    );

    const verticalGuide = container.querySelector('.alignment-guide-vertical') as HTMLElement;
    const horizontalGuide = container.querySelector('.alignment-guide-horizontal') as HTMLElement;

    expect(verticalGuide.style.height).toBe('800px');
    expect(horizontalGuide.style.width).toBe('1000px');
  });

  it('should render guides at position 0', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 0,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: 0,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuide = container.querySelector('.alignment-guide-vertical') as HTMLElement;
    const horizontalGuide = container.querySelector('.alignment-guide-horizontal') as HTMLElement;

    expect(verticalGuide.style.left).toBe('0px');
    expect(horizontalGuide.style.top).toBe('0px');
  });

  it('should render guides at canvas boundaries', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: canvasWidth,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: canvasHeight,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuide = container.querySelector('.alignment-guide-vertical') as HTMLElement;
    const horizontalGuide = container.querySelector('.alignment-guide-horizontal') as HTMLElement;

    expect(verticalGuide.style.left).toBe('800px');
    expect(horizontalGuide.style.top).toBe('600px');
  });

  it('should render guides with fractional positions', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 123.456,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: 234.567,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuide = container.querySelector('.alignment-guide-vertical') as HTMLElement;
    const horizontalGuide = container.querySelector('.alignment-guide-horizontal') as HTMLElement;

    expect(verticalGuide.style.left).toBe('123.456px');
    expect(horizontalGuide.style.top).toBe('234.567px');
  });

  it('should handle guides with multiple matched elements', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem1', 'elem2', 'elem3'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    // Should still render a single guide even with multiple matched elements
    const verticalGuides = container.querySelectorAll('.alignment-guide-vertical');
    expect(verticalGuides).toHaveLength(1);
  });

  it('should apply correct CSS classes', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem1'],
      },
      {
        type: 'horizontal',
        position: 200,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    const verticalGuide = container.querySelector('.alignment-guide-vertical');
    const horizontalGuide = container.querySelector('.alignment-guide-horizontal');

    expect(verticalGuide?.classList.contains('alignment-guide')).toBe(true);
    expect(verticalGuide?.classList.contains('alignment-guide-vertical')).toBe(true);
    expect(horizontalGuide?.classList.contains('alignment-guide')).toBe(true);
    expect(horizontalGuide?.classList.contains('alignment-guide-horizontal')).toBe(true);
  });

  it('should generate unique keys for guides', () => {
    const guides: AlignmentGuide[] = [
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem1'],
      },
      {
        type: 'vertical',
        position: 100,
        matchedElements: ['elem2'],
      },
    ];

    const { container } = render(
      <AlignmentGuides guides={guides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    );

    // Should render both guides even with same position (different keys due to index)
    const verticalGuides = container.querySelectorAll('.alignment-guide-vertical');
    expect(verticalGuides).toHaveLength(2);
  });
});
