/**
 * Unit tests for element factory functions
 * 
 * These tests verify that factory functions correctly create elements with
 * proper initialization of all required properties.
 */

import { describe, it, expect } from 'vitest';
import { createRectangle, createTextBlock, createImagePlaceholder } from '../../src/utils/elementFactory';
import type { Element } from '../../src/types/canvas';

describe('Element Factory Functions', () => {
  describe('createRectangle', () => {
    it('should create a rectangle with unique ID', () => {
      const rect1 = createRectangle([]);
      const rect2 = createRectangle([]);
      
      expect(rect1.id).toBeDefined();
      expect(rect2.id).toBeDefined();
      expect(rect1.id).not.toBe(rect2.id);
    });

    it('should create a rectangle with type "rectangle"', () => {
      const rect = createRectangle([]);
      expect(rect.type).toBe('rectangle');
    });

    it('should create a rectangle with default position and dimensions', () => {
      const rect = createRectangle([]);
      
      expect(rect.position.x).toBe(100);
      expect(rect.position.y).toBe(100);
      expect(rect.dimensions.width).toBe(150);
      expect(rect.dimensions.height).toBe(100);
    });

    it('should create a rectangle with z-index 1 when no elements exist', () => {
      const rect = createRectangle([]);
      expect(rect.zIndex).toBe(1);
    });

    it('should create a rectangle with z-index higher than existing elements', () => {
      const existingElements: Element[] = [
        { id: '1', type: 'rectangle', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 5 },
        { id: '2', type: 'text', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 3 },
      ];
      
      const rect = createRectangle(existingElements);
      expect(rect.zIndex).toBe(6);
    });

    it('should create a rectangle with a default color', () => {
      const rect = createRectangle([]);
      expect(rect.color).toBeDefined();
      expect(typeof rect.color).toBe('string');
    });
  });

  describe('createTextBlock', () => {
    it('should create a text block with unique ID', () => {
      const text1 = createTextBlock([]);
      const text2 = createTextBlock([]);
      
      expect(text1.id).toBeDefined();
      expect(text2.id).toBeDefined();
      expect(text1.id).not.toBe(text2.id);
    });

    it('should create a text block with type "text"', () => {
      const text = createTextBlock([]);
      expect(text.type).toBe('text');
    });

    it('should create a text block with default position and dimensions', () => {
      const text = createTextBlock([]);
      
      expect(text.position.x).toBe(100);
      expect(text.position.y).toBe(100);
      expect(text.dimensions.width).toBe(150);
      expect(text.dimensions.height).toBe(100);
    });

    it('should create a text block with z-index 1 when no elements exist', () => {
      const text = createTextBlock([]);
      expect(text.zIndex).toBe(1);
    });

    it('should create a text block with z-index higher than existing elements', () => {
      const existingElements: Element[] = [
        { id: '1', type: 'rectangle', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 2 },
        { id: '2', type: 'text', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 7 },
      ];
      
      const text = createTextBlock(existingElements);
      expect(text.zIndex).toBe(8);
    });

    it('should create a text block with default text content', () => {
      const text = createTextBlock([]);
      expect(text.text).toBeDefined();
      expect(typeof text.text).toBe('string');
      expect(text.text).toBeTruthy();
      if (text.text) {
        expect(text.text.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createImagePlaceholder', () => {
    it('should create an image placeholder with unique ID', () => {
      const img1 = createImagePlaceholder([]);
      const img2 = createImagePlaceholder([]);
      
      expect(img1.id).toBeDefined();
      expect(img2.id).toBeDefined();
      expect(img1.id).not.toBe(img2.id);
    });

    it('should create an image placeholder with type "image"', () => {
      const img = createImagePlaceholder([]);
      expect(img.type).toBe('image');
    });

    it('should create an image placeholder with default position and dimensions', () => {
      const img = createImagePlaceholder([]);
      
      expect(img.position.x).toBe(100);
      expect(img.position.y).toBe(100);
      expect(img.dimensions.width).toBe(150);
      expect(img.dimensions.height).toBe(100);
    });

    it('should create an image placeholder with z-index 1 when no elements exist', () => {
      const img = createImagePlaceholder([]);
      expect(img.zIndex).toBe(1);
    });

    it('should create an image placeholder with z-index higher than existing elements', () => {
      const existingElements: Element[] = [
        { id: '1', type: 'rectangle', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 10 },
        { id: '2', type: 'image', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 4 },
      ];
      
      const img = createImagePlaceholder(existingElements);
      expect(img.zIndex).toBe(11);
    });

    it('should create an image placeholder with undefined imageUrl', () => {
      const img = createImagePlaceholder([]);
      expect(img.imageUrl).toBeUndefined();
    });
  });

  describe('Z-index consistency across all factory functions', () => {
    it('should assign consistent z-index across different element types', () => {
      const existingElements: Element[] = [
        { id: '1', type: 'rectangle', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 100 }, zIndex: 3 },
      ];
      
      const rect = createRectangle(existingElements);
      const text = createTextBlock(existingElements);
      const img = createImagePlaceholder(existingElements);
      
      expect(rect.zIndex).toBe(4);
      expect(text.zIndex).toBe(4);
      expect(img.zIndex).toBe(4);
    });
  });
});
