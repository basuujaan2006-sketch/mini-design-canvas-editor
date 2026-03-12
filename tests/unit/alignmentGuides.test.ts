import { describe, it, expect } from 'vitest';
import { detectAlignments } from '../../src/utils/alignmentGuides';
import type { Element } from '../../src/types/canvas';

/**
 * Unit Tests for Alignment Guide Detection
 * Feature: design-canvas-editor
 * Requirements: 12.1, 12.5, 12.6
 */

describe('Alignment Guide Detection', () => {
  const createTestElement = (
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

  describe('detectAlignments', () => {
    it('should return empty array when no other elements exist', () => {
      const movingElement = createTestElement('moving', 100, 100, 100, 100);
      const guides = detectAlignments(movingElement, [], 5);

      expect(guides).toEqual([]);
    });

    it('should detect left edge alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 100, 300, 150, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      expect(guides).toHaveLength(1);
      expect(guides[0].type).toBe('vertical');
      expect(guides[0].position).toBe(100);
      expect(guides[0].matchedElements).toContain('other');
    });

    it('should detect right edge alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 50, 300, 150, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      expect(guides).toHaveLength(1);
      expect(guides[0].type).toBe('vertical');
      expect(guides[0].position).toBe(200); // 50 + 150
      expect(guides[0].matchedElements).toContain('other');
    });

    it('should detect center-x alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      // Other element center-x: 100 + 50 = 150, same as moving element
      const otherElement = createTestElement('other', 100, 300, 100, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      // Should detect left edge, center-x, and right edge (all align)
      expect(guides.length).toBeGreaterThanOrEqual(2);
      const centerGuide = guides.find(g => g.position === 150);
      expect(centerGuide).toBeDefined();
      expect(centerGuide?.type).toBe('vertical');
    });

    it('should detect top edge alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 300, 150, 150, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      expect(guides).toHaveLength(1);
      expect(guides[0].type).toBe('horizontal');
      expect(guides[0].position).toBe(150);
      expect(guides[0].matchedElements).toContain('other');
    });

    it('should detect bottom edge alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 300, 170, 150, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      expect(guides).toHaveLength(1);
      expect(guides[0].type).toBe('horizontal');
      expect(guides[0].position).toBe(250); // 170 + 80
      expect(guides[0].matchedElements).toContain('other');
    });

    it('should detect center-y alignment', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      // Moving center-y: 150 + 50 = 200
      // Other center-y: 150 + 50 = 200
      const otherElement = createTestElement('other', 300, 150, 150, 100);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      // Should detect top edge, center-y, and bottom edge (all align)
      expect(guides.length).toBeGreaterThanOrEqual(2);
      const centerGuide = guides.find(g => g.position === 200);
      expect(centerGuide).toBeDefined();
      expect(centerGuide?.type).toBe('horizontal');
    });

    it('should respect alignment threshold', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 107, 300, 150, 80);
      
      // With threshold 5, should not detect (difference is 7)
      const guidesStrict = detectAlignments(movingElement, [otherElement], 5);
      expect(guidesStrict).toHaveLength(0);

      // With threshold 10, should detect (difference is 7)
      const guidesLoose = detectAlignments(movingElement, [otherElement], 10);
      expect(guidesLoose.length).toBeGreaterThan(0);
    });

    it('should use default threshold of 5 pixels', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const otherElement = createTestElement('other', 103, 300, 150, 80);
      
      // Difference is 3, should detect with default threshold
      const guides = detectAlignments(movingElement, [otherElement]);
      expect(guides.length).toBeGreaterThan(0);
    });

    it('should skip the moving element itself', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      
      // Include moving element in the array
      const guides = detectAlignments(movingElement, [movingElement], 5);
      
      expect(guides).toHaveLength(0);
    });

    it('should detect multiple alignments with same element', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      // Same position and size - should align on all edges
      const otherElement = createTestElement('other', 100, 150, 100, 100);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      // Should detect: left, center-x, right, top, center-y, bottom
      expect(guides.length).toBeGreaterThanOrEqual(6);
    });

    it('should detect alignments with multiple elements', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const element1 = createTestElement('elem1', 100, 300, 150, 80);
      const element2 = createTestElement('elem2', 300, 150, 80, 120);
      
      const guides = detectAlignments(movingElement, [element1, element2], 5);

      // Should detect alignments with both elements
      expect(guides.length).toBeGreaterThan(0);
      
      // Check that both elements are referenced
      const allMatchedElements = guides.flatMap(g => g.matchedElements);
      expect(allMatchedElements).toContain('elem1');
      expect(allMatchedElements).toContain('elem2');
    });

    it('should combine guides at same position', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const element1 = createTestElement('elem1', 100, 300, 150, 80);
      const element2 = createTestElement('elem2', 100, 400, 120, 60);
      
      const guides = detectAlignments(movingElement, [element1, element2], 5);

      // Both elements align on left edge (x=100)
      const leftGuide = guides.find(g => g.type === 'vertical' && g.position === 100);
      expect(leftGuide).toBeDefined();
      expect(leftGuide?.matchedElements).toHaveLength(2);
      expect(leftGuide?.matchedElements).toContain('elem1');
      expect(leftGuide?.matchedElements).toContain('elem2');
    });

    it('should handle elements with different sizes', () => {
      const movingElement = createTestElement('moving', 100, 150, 50, 30);
      const largeElement = createTestElement('large', 50, 100, 200, 150);
      
      const guides = detectAlignments(movingElement, [largeElement], 5);

      // Should still detect alignments based on edges and centers
      expect(guides).toBeDefined();
      expect(Array.isArray(guides)).toBe(true);
    });

    it('should handle zero threshold', () => {
      const movingElement = createTestElement('moving', 100, 150, 100, 100);
      const exactElement = createTestElement('exact', 100, 300, 150, 80);
      const offsetElement = createTestElement('offset', 101, 400, 150, 80);
      
      const guides = detectAlignments(movingElement, [exactElement, offsetElement], 0);

      // Should only detect exact alignment
      expect(guides.length).toBeGreaterThan(0);
      const matchedIds = guides.flatMap(g => g.matchedElements);
      expect(matchedIds).toContain('exact');
      expect(matchedIds).not.toContain('offset');
    });

    it('should handle elements at canvas origin', () => {
      const movingElement = createTestElement('moving', 0, 0, 100, 100);
      const otherElement = createTestElement('other', 0, 150, 100, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 5);

      expect(guides.length).toBeGreaterThan(0);
      // Should detect left edge and center-x alignments
      const verticalGuides = guides.filter(g => g.type === 'vertical');
      expect(verticalGuides.length).toBeGreaterThan(0);
    });

    it('should handle fractional positions and dimensions', () => {
      const movingElement = createTestElement('moving', 100.5, 150.3, 100.7, 100.2);
      const otherElement = createTestElement('other', 100.2, 300, 150, 80);
      
      const guides = detectAlignments(movingElement, [otherElement], 1);

      // Should detect alignment within threshold
      expect(guides.length).toBeGreaterThan(0);
    });
  });
});
