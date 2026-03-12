/**
 * Unit tests for snap-to-grid utilities
 * 
 * Tests the snapPositionToGrid and snapDimensionsToGrid functions
 * with specific examples and edge cases.
 */

import { describe, it, expect } from 'vitest';
import { snapPositionToGrid, snapDimensionsToGrid } from '../../src/utils/snapToGrid';
import type { CanvasConfig } from '../../src/types/canvas';

describe('snapToGrid utilities', () => {
  const config: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  describe('snapPositionToGrid', () => {
    it('should snap position to nearest grid point', () => {
      const position = { x: 23, y: 47 };
      const snapped = snapPositionToGrid(position, config);
      
      expect(snapped.x).toBe(20);
      expect(snapped.y).toBe(50);
    });

    it('should handle positions already on grid', () => {
      const position = { x: 20, y: 50 };
      const snapped = snapPositionToGrid(position, config);
      
      expect(snapped.x).toBe(20);
      expect(snapped.y).toBe(50);
    });

    it('should handle origin position', () => {
      const position = { x: 0, y: 0 };
      const snapped = snapPositionToGrid(position, config);
      
      expect(snapped.x).toBe(0);
      expect(snapped.y).toBe(0);
    });

    it('should round to nearest grid point (not floor)', () => {
      const position = { x: 5, y: 5 };
      const snapped = snapPositionToGrid(position, config);
      
      // 5 is exactly halfway, should round to 10
      expect(snapped.x).toBe(10);
      expect(snapped.y).toBe(10);
    });

    it('should handle large coordinates', () => {
      const position = { x: 234, y: 567 };
      const snapped = snapPositionToGrid(position, config);
      
      expect(snapped.x).toBe(230);
      expect(snapped.y).toBe(570);
    });

    it('should work with different grid sizes', () => {
      const config20: CanvasConfig = { ...config, gridSize: 20 };
      const position = { x: 35, y: 45 };
      const snapped = snapPositionToGrid(position, config20);
      
      expect(snapped.x).toBe(40);
      expect(snapped.y).toBe(40);
    });
  });

  describe('snapDimensionsToGrid', () => {
    it('should snap dimensions to grid increments', () => {
      const dimensions = { width: 123, height: 247 };
      const snapped = snapDimensionsToGrid(dimensions, config);
      
      expect(snapped.width).toBe(120);
      expect(snapped.height).toBe(250);
    });

    it('should handle dimensions already on grid', () => {
      const dimensions = { width: 100, height: 200 };
      const snapped = snapDimensionsToGrid(dimensions, config);
      
      expect(snapped.width).toBe(100);
      expect(snapped.height).toBe(200);
    });

    it('should round to nearest grid increment', () => {
      const dimensions = { width: 25, height: 35 };
      const snapped = snapDimensionsToGrid(dimensions, config);
      
      // 25 rounds to 30, 35 rounds to 40
      expect(snapped.width).toBe(30);
      expect(snapped.height).toBe(40);
    });

    it('should handle minimum dimensions', () => {
      const dimensions = { width: 5, height: 5 };
      const snapped = snapDimensionsToGrid(dimensions, config);
      
      // 5 rounds to 10 (note: minimum constraint should be applied separately)
      expect(snapped.width).toBe(10);
      expect(snapped.height).toBe(10);
    });

    it('should work with different grid sizes', () => {
      const config20: CanvasConfig = { ...config, gridSize: 20 };
      const dimensions = { width: 135, height: 245 };
      const snapped = snapDimensionsToGrid(dimensions, config20);
      
      expect(snapped.width).toBe(140);
      expect(snapped.height).toBe(240);
    });
  });
});
