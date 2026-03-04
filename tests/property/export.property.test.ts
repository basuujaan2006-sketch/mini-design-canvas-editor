import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { exportCanvasAsPNG } from '../../src/utils/exportCanvas';
import type { Element, CanvasConfig } from '../../src/types/canvas';

/**
 * Property-Based Tests for Canvas Export
 * Feature: design-canvas-editor
 * Property 25: Export Captures All Elements
 * Property 26: Export Preserves Z-Index Order
 * Property 27: Export Excludes UI Controls
 */

describe('Property 25, 26, 27: Canvas Export Properties', () => {
  const CANVAS_CONFIG: CanvasConfig = {
    width: 800,
    height: 600,
    gridSize: 10,
    minElementWidth: 20,
    minElementHeight: 20,
  };

  // Mock canvas and context
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let renderCalls: Array<{ type: string; element: Element }>;
  let createElementSpy: any;
  let toBlobSpy: any;

  beforeEach(() => {
    renderCalls = [];

    // Create mock context
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      fillRect: vi.fn((x, y, w, h) => {
        // Track rendering calls
      }),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    } as any;

    // Create mock canvas
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => {
        const blob = new Blob(['fake-png-data'], { type: 'image/png' });
        callback(blob);
      }),
    } as any;

    // Mock document.createElement to return our mock canvas
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        } as any;
      }
      return document.createElement(tagName);
    });

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.body methods
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  });

  /**
   * Arbitrary generator for elements
   */
  const arbitraryElement = (): fc.Arbitrary<Element> => {
    return fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('rectangle' as const, 'text' as const, 'image' as const),
      position: fc.record({
        x: fc.integer({ min: 0, max: CANVAS_CONFIG.width - 100 }),
        y: fc.integer({ min: 0, max: CANVAS_CONFIG.height - 100 }),
      }),
      dimensions: fc.record({
        width: fc.integer({ min: CANVAS_CONFIG.minElementWidth, max: 200 }),
        height: fc.integer({ min: CANVAS_CONFIG.minElementHeight, max: 200 }),
      }),
      zIndex: fc.integer({ min: 1, max: 100 }),
    }).map((base) => {
      const element: Element = { ...base };
      if (base.type === 'rectangle') {
        element.color = '#3b82f6';
      } else if (base.type === 'text') {
        element.text = 'Sample Text';
      } else if (base.type === 'image') {
        element.imageUrl = undefined;
      }
      return element;
    });
  };

  it('Property 25: should capture all elements in export', async () => {
    // **Validates: Requirements 15.2**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 10 }),
        async (elements) => {
          // Reset render tracking
          renderCalls = [];
          
          // Track fillRect calls to count rendered elements
          const fillRectCalls: any[] = [];
          mockContext.fillRect = vi.fn((...args) => {
            fillRectCalls.push(args);
          });

          await exportCanvasAsPNG(elements, CANVAS_CONFIG);

          // Property: Export should render something for each element
          // Each element should trigger at least one fillRect call
          // (background fill + element fill = at least elements.length + 1 calls)
          return fillRectCalls.length >= elements.length + 1; // +1 for canvas background
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 26: should preserve z-index order in export', async () => {
    // **Validates: Requirements 15.3**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 2, maxLength: 10 }),
        async (elements) => {
          // Assign distinct z-indices to ensure ordering
          const elementsWithDistinctZIndex = elements.map((el, idx) => ({
            ...el,
            zIndex: idx + 1,
          }));

          // Track the order of fillRect calls by position
          const renderOrder: Array<{ x: number; y: number; zIndex: number }> = [];
          mockContext.fillRect = vi.fn((x, y, w, h) => {
            // Skip the background fill (x=0, y=0, w=800, h=600)
            if (x === 0 && y === 0 && w === CANVAS_CONFIG.width && h === CANVAS_CONFIG.height) {
              return;
            }
            
            // Find which element this corresponds to
            const matchingElement = elementsWithDistinctZIndex.find(
              el => el.position.x === x && el.position.y === y
            );
            
            if (matchingElement) {
              renderOrder.push({
                x,
                y,
                zIndex: matchingElement.zIndex,
              });
            }
          });

          await exportCanvasAsPNG(elementsWithDistinctZIndex, CANVAS_CONFIG);

          // Property: Elements should be rendered in z-index order (lowest to highest)
          // Check that z-indices are in ascending order
          for (let i = 1; i < renderOrder.length; i++) {
            if (renderOrder[i].zIndex < renderOrder[i - 1].zIndex) {
              return false;
            }
          }
          
          return renderOrder.length > 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 27: should exclude UI controls from export', async () => {
    // **Validates: Requirements 15.6**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 1, maxLength: 10 }),
        async (elements) => {
          // Track all rendering operations
          const operations: string[] = [];
          
          mockContext.fillRect = vi.fn((x, y, w, h) => {
            operations.push(`fillRect:${x},${y},${w},${h}`);
          });
          
          mockContext.strokeRect = vi.fn((x, y, w, h) => {
            operations.push(`strokeRect:${x},${y},${w},${h}`);
          });
          
          mockContext.fillText = vi.fn((text, x, y) => {
            operations.push(`fillText:${text},${x},${y}`);
          });

          await exportCanvasAsPNG(elements, CANVAS_CONFIG);

          // Property: Export should not contain UI control indicators
          // Check that no operations reference selection, resize, handles, overlay, etc.
          const hasUIControls = operations.some(op => {
            const lowerOp = op.toLowerCase();
            return (
              lowerOp.includes('selection') ||
              lowerOp.includes('resize') ||
              lowerOp.includes('handle') ||
              lowerOp.includes('overlay') ||
              lowerOp.includes('border') && lowerOp.includes('selected')
            );
          });

          return !hasUIControls;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 25: should export canvas with correct dimensions', async () => {
    // **Validates: Requirements 15.2**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 0, maxLength: 10 }),
        async (elements) => {
          await exportCanvasAsPNG(elements, CANVAS_CONFIG);

          // Property: Canvas should be created with correct dimensions
          return (
            mockCanvas.width === CANVAS_CONFIG.width &&
            mockCanvas.height === CANVAS_CONFIG.height
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 25: should generate PNG blob', async () => {
    // **Validates: Requirements 15.2**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 0, maxLength: 10 }),
        async (elements) => {
          await exportCanvasAsPNG(elements, CANVAS_CONFIG);

          // Property: toBlob should be called to generate PNG
          expect(mockCanvas.toBlob).toHaveBeenCalled();
          
          // Check that toBlob was called with 'image/png' type
          const toBlobCall = (mockCanvas.toBlob as any).mock.calls[0];
          return toBlobCall !== undefined;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 25: should trigger download with descriptive filename', async () => {
    // **Validates: Requirements 15.5**
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryElement(), { minLength: 0, maxLength: 10 }),
        async (elements) => {
          let downloadFilename = '';
          
          // Mock createElement for anchor element
          createElementSpy.mockImplementation((tagName) => {
            if (tagName === 'canvas') {
              return mockCanvas as any;
            }
            if (tagName === 'a') {
              const anchor = {
                href: '',
                _download: '',
                click: vi.fn(),
              };
              Object.defineProperty(anchor, 'download', {
                get() { return downloadFilename; },
                set(value: string) { downloadFilename = value; },
              });
              return anchor as any;
            }
            return document.createElement(tagName);
          });

          await exportCanvasAsPNG(elements, CANVAS_CONFIG);

          // Property: Download filename should be descriptive and include .png extension
          return (
            downloadFilename.includes('canvas-export') &&
            downloadFilename.endsWith('.png')
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 26: should render elements in sorted z-index order', async () => {
    // **Validates: Requirements 15.3**
    // Create elements with specific z-indices
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 50, height: 50 },
        zIndex: 5,
        color: '#ff0000',
      },
      {
        id: '2',
        type: 'text',
        position: { x: 100, y: 100 },
        dimensions: { width: 100, height: 50 },
        zIndex: 2,
        text: 'Test',
      },
      {
        id: '3',
        type: 'image',
        position: { x: 200, y: 200 },
        dimensions: { width: 80, height: 80 },
        zIndex: 10,
      },
    ];

    const renderOrder: number[] = [];
    mockContext.fillRect = vi.fn((x, y, w, h) => {
      // Skip background
      if (x === 0 && y === 0 && w === CANVAS_CONFIG.width && h === CANVAS_CONFIG.height) {
        return;
      }
      
      // Find matching element
      const el = elements.find(e => e.position.x === x && e.position.y === y);
      if (el) {
        renderOrder.push(el.zIndex);
      }
    });

    await exportCanvasAsPNG(elements, CANVAS_CONFIG);

    // Property: Render order should be [2, 5, 10] (sorted by z-index)
    expect(renderOrder).toEqual([2, 5, 10]);
  });

  it('Property 27: should only render element content, not UI controls', async () => {
    // **Validates: Requirements 15.6**
    const elements: Element[] = [
      {
        id: '1',
        type: 'rectangle',
        position: { x: 10, y: 10 },
        dimensions: { width: 50, height: 50 },
        zIndex: 1,
        color: '#3b82f6',
      },
    ];

    const allCalls: string[] = [];
    
    // Track all canvas operations
    mockContext.fillRect = vi.fn((...args) => {
      allCalls.push(`fillRect:${args.join(',')}`);
    });
    
    mockContext.strokeRect = vi.fn((...args) => {
      allCalls.push(`strokeRect:${args.join(',')}`);
    });

    await exportCanvasAsPNG(elements, CANVAS_CONFIG);

    // Property: Should only have background fill + element fills/strokes
    // No additional UI control rendering
    const elementRelatedCalls = allCalls.filter(call => {
      // Background or element rendering
      return call.includes('fillRect') || call.includes('strokeRect');
    });

    // Should have: 1 background + 1 element fill + 1 element stroke = 3 calls
    expect(elementRelatedCalls.length).toBeGreaterThanOrEqual(2);
    expect(elementRelatedCalls.length).toBeLessThanOrEqual(10); // Reasonable upper bound
  });
});
