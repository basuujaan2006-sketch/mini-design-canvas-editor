import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { detectAlignments } from '../../src/utils/alignmentGuides';
import type { Element } from '../../src/types/canvas';

/**
 * Property-Based Tests for Alignment Guide Detection
 * Feature: design-canvas-editor
 * Property 16: Alignment Detection Accuracy
 */

describe('Property 16: Alignment Detection Accuracy', () => {
  /**
   * Helper to create an element with given properties
   */
  const createElement = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Element => ({
    id,
    type: 'rectangle',
    position: { x, y },
    dimensions: { width, height },
    zIndex: 1,
    color: '#ff0000',
  });

  /**
   * Calculate edge and center positions for an element
   */
  const getElementPositions = (element: Element) => ({
    left: element.position.x,
    right: element.position.x + element.dimensions.width,
    top: element.position.y,
    bottom: element.position.y + element.dimensions.height,
    centerX: element.position.x + element.dimensions.width / 2,
    centerY: element.position.y + element.dimensions.height / 2,
  });

  /**
   * Check if two values are within threshold
   */
  const withinThreshold = (a: number, b: number, threshold: number): boolean => {
    return Math.abs(a - b) <= threshold;
  };

  it('should detect alignment when edges align within threshold', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        // Generate moving element
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        // Generate other element
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        fc.integer({ min: 1, max: 10 }), // threshold
        (movingProps, otherProps, threshold) => {
          const movingElement = createElement(
            'moving',
            movingProps.x,
            movingProps.y,
            movingProps.width,
            movingProps.height
          );
          const otherElement = createElement(
            'other',
            otherProps.x,
            otherProps.y,
            otherProps.width,
            otherProps.height
          );

          const guides = detectAlignments(movingElement, [otherElement], threshold);

          const movingPos = getElementPositions(movingElement);
          const otherPos = getElementPositions(otherElement);

          // Check if any alignment should be detected
          const shouldHaveVerticalAlignment =
            withinThreshold(movingPos.left, otherPos.left, threshold) ||
            withinThreshold(movingPos.centerX, otherPos.centerX, threshold) ||
            withinThreshold(movingPos.right, otherPos.right, threshold);

          const shouldHaveHorizontalAlignment =
            withinThreshold(movingPos.top, otherPos.top, threshold) ||
            withinThreshold(movingPos.centerY, otherPos.centerY, threshold) ||
            withinThreshold(movingPos.bottom, otherPos.bottom, threshold);

          // Property: if alignment exists within threshold, it should be detected
          if (shouldHaveVerticalAlignment) {
            const hasVerticalGuide = guides.some(g => g.type === 'vertical');
            if (!hasVerticalGuide) return false;
          }

          if (shouldHaveHorizontalAlignment) {
            const hasHorizontalGuide = guides.some(g => g.type === 'horizontal');
            if (!hasHorizontalGuide) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not detect alignment when no edges align within threshold', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        // Generate elements that are far apart
        fc.record({
          x: fc.integer({ min: 0, max: 200 }),
          y: fc.integer({ min: 0, max: 200 }),
          width: fc.integer({ min: 50, max: 100 }),
          height: fc.integer({ min: 50, max: 100 }),
        }),
        fc.integer({ min: 1, max: 5 }), // threshold
        (movingProps, threshold) => {
          const movingElement = createElement(
            'moving',
            movingProps.x,
            movingProps.y,
            movingProps.width,
            movingProps.height
          );

          // Create element far away (no alignment possible)
          const otherElement = createElement(
            'other',
            movingProps.x + 500,
            movingProps.y + 500,
            movingProps.width,
            movingProps.height
          );

          const guides = detectAlignments(movingElement, [otherElement], threshold);

          // Property: no guides should be detected when elements are far apart
          return guides.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always skip the moving element itself', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        fc.integer({ min: 1, max: 10 }),
        (props, threshold) => {
          const movingElement = createElement(
            'moving',
            props.x,
            props.y,
            props.width,
            props.height
          );

          // Include moving element in the array
          const guides = detectAlignments(movingElement, [movingElement], threshold);

          // Property: should never detect alignment with itself
          return guides.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect all six alignment types when elements perfectly overlap', () => {
    // **Validates: Requirements 12.1, 12.5, 12.6**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        (props) => {
          const movingElement = createElement(
            'moving',
            props.x,
            props.y,
            props.width,
            props.height
          );

          // Create element at exact same position and size
          const otherElement = createElement(
            'other',
            props.x,
            props.y,
            props.width,
            props.height
          );

          const guides = detectAlignments(movingElement, [otherElement], 5);

          // Property: should detect all 6 alignments (left, center-x, right, top, center-y, bottom)
          const verticalGuides = guides.filter(g => g.type === 'vertical');
          const horizontalGuides = guides.filter(g => g.type === 'horizontal');

          return verticalGuides.length === 3 && horizontalGuides.length === 3;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should combine multiple elements at same alignment position', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 700 }),
        fc.integer({ min: 50, max: 200 }),
        fc.integer({ min: 50, max: 200 }),
        (alignX, width, height) => {
          const movingElement = createElement('moving', alignX, 100, width, height);

          // Create multiple elements with same left edge
          const element1 = createElement('elem1', alignX, 300, width + 50, height);
          const element2 = createElement('elem2', alignX, 400, width - 20, height + 30);

          const guides = detectAlignments(movingElement, [element1, element2], 5);

          // Property: should have a single guide for the shared alignment
          const leftGuide = guides.find(
            g => g.type === 'vertical' && g.position === alignX
          );

          return (
            leftGuide !== undefined &&
            leftGuide.matchedElements.length === 2 &&
            leftGuide.matchedElements.includes('elem1') &&
            leftGuide.matchedElements.includes('elem2')
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should respect threshold boundaries precisely', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 600 }),
        fc.integer({ min: 100, max: 500 }),
        fc.integer({ min: 50, max: 150 }),
        fc.integer({ min: 50, max: 150 }),
        fc.integer({ min: 1, max: 10 }),
        (x, y, width, height, threshold) => {
          const movingElement = createElement('moving', x, y, width, height);

          // Create element exactly at threshold distance
          const otherAtThreshold = createElement(
            'at-threshold',
            x + threshold,
            y + 200,
            width,
            height
          );

          // Create element just beyond threshold
          const otherBeyondThreshold = createElement(
            'beyond-threshold',
            x + threshold + 1,
            y + 300,
            width,
            height
          );

          const guidesAt = detectAlignments(movingElement, [otherAtThreshold], threshold);
          const guidesBeyond = detectAlignments(
            movingElement,
            [otherBeyondThreshold],
            threshold
          );

          // Property: element at threshold should be detected, beyond should not
          const hasAlignmentAt = guidesAt.some(
            g => g.matchedElements.includes('at-threshold')
          );
          const hasAlignmentBeyond = guidesBeyond.some(
            g => g.matchedElements.includes('beyond-threshold')
          );

          return hasAlignmentAt && !hasAlignmentBeyond;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle elements with various sizes correctly', () => {
    // **Validates: Requirements 12.1, 12.5, 12.6**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 600 }),
          y: fc.integer({ min: 0, max: 400 }),
          width: fc.integer({ min: 20, max: 300 }),
          height: fc.integer({ min: 20, max: 300 }),
        }),
        fc.record({
          x: fc.integer({ min: 0, max: 600 }),
          y: fc.integer({ min: 0, max: 400 }),
          width: fc.integer({ min: 20, max: 300 }),
          height: fc.integer({ min: 20, max: 300 }),
        }),
        (movingProps, otherProps) => {
          const movingElement = createElement(
            'moving',
            movingProps.x,
            movingProps.y,
            movingProps.width,
            movingProps.height
          );
          const otherElement = createElement(
            'other',
            otherProps.x,
            otherProps.y,
            otherProps.width,
            otherProps.height
          );

          const guides = detectAlignments(movingElement, [otherElement], 5);

          // Property: all guides should be valid
          return guides.every(guide => {
            return (
              (guide.type === 'vertical' || guide.type === 'horizontal') &&
              typeof guide.position === 'number' &&
              Array.isArray(guide.matchedElements) &&
              guide.matchedElements.length > 0
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return consistent results for same inputs', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        fc.integer({ min: 1, max: 10 }),
        (movingProps, otherProps, threshold) => {
          const movingElement = createElement(
            'moving',
            movingProps.x,
            movingProps.y,
            movingProps.width,
            movingProps.height
          );
          const otherElement = createElement(
            'other',
            otherProps.x,
            otherProps.y,
            otherProps.width,
            otherProps.height
          );

          // Call twice with same inputs
          const guides1 = detectAlignments(movingElement, [otherElement], threshold);
          const guides2 = detectAlignments(movingElement, [otherElement], threshold);

          // Property: should return same results
          return (
            guides1.length === guides2.length &&
            guides1.every((g1, i) => {
              const g2 = guides2[i];
              return (
                g1.type === g2.type &&
                g1.position === g2.position &&
                g1.matchedElements.length === g2.matchedElements.length
              );
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty other elements array', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.integer({ min: 0, max: 700 }),
          y: fc.integer({ min: 0, max: 500 }),
          width: fc.integer({ min: 50, max: 200 }),
          height: fc.integer({ min: 50, max: 200 }),
        }),
        (props) => {
          const movingElement = createElement(
            'moving',
            props.x,
            props.y,
            props.width,
            props.height
          );

          const guides = detectAlignments(movingElement, [], 5);

          // Property: should return empty array when no other elements
          return guides.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle fractional positions and dimensions', () => {
    // **Validates: Requirements 12.1**
    fc.assert(
      fc.property(
        fc.record({
          x: fc.double({ min: 0, max: 700, noNaN: true }),
          y: fc.double({ min: 0, max: 500, noNaN: true }),
          width: fc.double({ min: 50, max: 200, noNaN: true }),
          height: fc.double({ min: 50, max: 200, noNaN: true }),
        }),
        fc.record({
          x: fc.double({ min: 0, max: 700, noNaN: true }),
          y: fc.double({ min: 0, max: 500, noNaN: true }),
          width: fc.double({ min: 50, max: 200, noNaN: true }),
          height: fc.double({ min: 50, max: 200, noNaN: true }),
        }),
        (movingProps, otherProps) => {
          const movingElement = createElement(
            'moving',
            movingProps.x,
            movingProps.y,
            movingProps.width,
            movingProps.height
          );
          const otherElement = createElement(
            'other',
            otherProps.x,
            otherProps.y,
            otherProps.width,
            otherProps.height
          );

          const guides = detectAlignments(movingElement, [otherElement], 5);

          // Property: should handle fractional values without errors
          return Array.isArray(guides) && guides.every(g => !isNaN(g.position));
        }
      ),
      { numRuns: 100 }
    );
  });
});
