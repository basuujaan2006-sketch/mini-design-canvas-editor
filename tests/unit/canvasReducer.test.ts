/**
 * Unit tests for canvas state reducer
 * 
 * Tests each action type with specific examples and validates initial state creation.
 * Requirements: 8.1, 8.2
 */

import { describe, it, expect } from 'vitest';
import { canvasReducer, createInitialState } from '../../src/hooks/useCanvasState';
import type { CanvasState, Element } from '../../src/types/canvas';

describe('createInitialState', () => {
  it('should create initial state with default grid size', () => {
    const state = createInitialState();
    
    expect(state.elements).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.gridSize).toBe(10);
  });

  it('should create initial state with custom grid size', () => {
    const state = createInitialState(20);
    
    expect(state.gridSize).toBe(20);
    expect(state.elements).toEqual([]);
  });
});

describe('canvasReducer - ADD_ELEMENT', () => {
  it('should add a rectangle element to empty canvas', () => {
    const initialState = createInitialState();
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };

    const newState = canvasReducer(initialState, {
      type: 'ADD_ELEMENT',
      element,
    });

    expect(newState.elements).toHaveLength(1);
    expect(newState.elements[0]).toEqual(element);
    expect(newState.selectedId).toBeNull();
  });

  it('should add multiple elements maintaining order', () => {
    const initialState = createInitialState();
    const element1: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const element2: Element = {
      id: 'text-1',
      type: 'text',
      position: { x: 50, y: 50 },
      dimensions: { width: 150, height: 50 },
      zIndex: 2,
      text: 'Hello',
    };

    let state = canvasReducer(initialState, { type: 'ADD_ELEMENT', element: element1 });
    state = canvasReducer(state, { type: 'ADD_ELEMENT', element: element2 });

    expect(state.elements).toHaveLength(2);
    expect(state.elements[0].id).toBe('rect-1');
    expect(state.elements[1].id).toBe('text-1');
  });
});

describe('canvasReducer - DELETE_ELEMENT', () => {
  it('should delete an element by id', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DELETE_ELEMENT',
      id: 'rect-1',
    });

    expect(newState.elements).toHaveLength(0);
  });

  it('should clear selection when deleting selected element', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
      selectedId: 'rect-1',
    };

    const newState = canvasReducer(initialState, {
      type: 'DELETE_ELEMENT',
      id: 'rect-1',
    });

    expect(newState.elements).toHaveLength(0);
    expect(newState.selectedId).toBeNull();
  });

  it('should preserve selection when deleting different element', () => {
    const element1: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const element2: Element = {
      id: 'rect-2',
      type: 'rectangle',
      position: { x: 150, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 2,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element1, element2],
      selectedId: 'rect-1',
    };

    const newState = canvasReducer(initialState, {
      type: 'DELETE_ELEMENT',
      id: 'rect-2',
    });

    expect(newState.elements).toHaveLength(1);
    expect(newState.selectedId).toBe('rect-1');
  });

  it('should handle deleting non-existent element gracefully', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DELETE_ELEMENT',
      id: 'non-existent',
    });

    expect(newState.elements).toHaveLength(1);
    expect(newState.elements[0].id).toBe('rect-1');
  });
});

describe('canvasReducer - UPDATE_ELEMENT', () => {
  it('should update element position', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'rect-1',
      updates: { position: { x: 50, y: 75 } },
    });

    expect(newState.elements[0].position).toEqual({ x: 50, y: 75 });
    expect(newState.elements[0].dimensions).toEqual({ width: 100, height: 100 });
  });

  it('should update element dimensions', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'rect-1',
      updates: { dimensions: { width: 200, height: 150 } },
    });

    expect(newState.elements[0].dimensions).toEqual({ width: 200, height: 150 });
    expect(newState.elements[0].position).toEqual({ x: 0, y: 0 });
  });

  it('should update multiple properties at once', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
      color: '#ff0000',
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'rect-1',
      updates: {
        position: { x: 50, y: 50 },
        dimensions: { width: 150, height: 150 },
        color: '#00ff00',
      },
    });

    expect(newState.elements[0].position).toEqual({ x: 50, y: 50 });
    expect(newState.elements[0].dimensions).toEqual({ width: 150, height: 150 });
    expect(newState.elements[0].color).toBe('#00ff00');
  });

  it('should only update the specified element', () => {
    const element1: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const element2: Element = {
      id: 'rect-2',
      type: 'rectangle',
      position: { x: 150, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 2,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element1, element2],
    };

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'rect-1',
      updates: { position: { x: 50, y: 50 } },
    });

    expect(newState.elements[0].position).toEqual({ x: 50, y: 50 });
    expect(newState.elements[1].position).toEqual({ x: 150, y: 0 });
  });

  it('should handle updating non-existent element gracefully', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'non-existent',
      updates: { position: { x: 50, y: 50 } },
    });

    expect(newState.elements[0].position).toEqual({ x: 0, y: 0 });
  });
});

describe('canvasReducer - SELECT_ELEMENT', () => {
  it('should select an element', () => {
    const initialState = createInitialState();

    const newState = canvasReducer(initialState, {
      type: 'SELECT_ELEMENT',
      id: 'rect-1',
    });

    expect(newState.selectedId).toBe('rect-1');
  });

  it('should deselect by passing null', () => {
    const initialState: CanvasState = {
      ...createInitialState(),
      selectedId: 'rect-1',
    };

    const newState = canvasReducer(initialState, {
      type: 'SELECT_ELEMENT',
      id: null,
    });

    expect(newState.selectedId).toBeNull();
  });

  it('should change selection from one element to another', () => {
    const initialState: CanvasState = {
      ...createInitialState(),
      selectedId: 'rect-1',
    };

    const newState = canvasReducer(initialState, {
      type: 'SELECT_ELEMENT',
      id: 'rect-2',
    });

    expect(newState.selectedId).toBe('rect-2');
  });
});

describe('canvasReducer - immutability', () => {
  it('should not mutate original state when adding element', () => {
    const initialState = createInitialState();
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };

    const newState = canvasReducer(initialState, {
      type: 'ADD_ELEMENT',
      element,
    });

    expect(initialState.elements).toHaveLength(0);
    expect(newState.elements).toHaveLength(1);
    expect(newState).not.toBe(initialState);
  });

  it('should not mutate original elements array when updating', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };
    const originalElements = initialState.elements;

    const newState = canvasReducer(initialState, {
      type: 'UPDATE_ELEMENT',
      id: 'rect-1',
      updates: { position: { x: 50, y: 50 } },
    });

    expect(newState.elements).not.toBe(originalElements);
    expect(originalElements[0].position).toEqual({ x: 0, y: 0 });
    expect(newState.elements[0].position).toEqual({ x: 50, y: 50 });
  });
});

describe('canvasReducer - DUPLICATE_ELEMENT', () => {
  it('should duplicate an element with offset position', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      dimensions: { width: 200, height: 150 },
      zIndex: 1,
      color: '#ff0000',
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'rect-1',
    });

    expect(newState.elements).toHaveLength(2);
    expect(newState.elements[0]).toEqual(element);
    
    const duplicated = newState.elements[1];
    expect(duplicated.id).not.toBe('rect-1');
    expect(duplicated.type).toBe('rectangle');
    expect(duplicated.position).toEqual({ x: 120, y: 120 });
    expect(duplicated.dimensions).toEqual({ width: 200, height: 150 });
    expect(duplicated.color).toBe('#ff0000');
  });

  it('should assign higher z-index to duplicated element', () => {
    const element1: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 5,
    };
    const element2: Element = {
      id: 'rect-2',
      type: 'rectangle',
      position: { x: 150, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 3,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element1, element2],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'rect-2',
    });

    expect(newState.elements).toHaveLength(3);
    const duplicated = newState.elements[2];
    expect(duplicated.zIndex).toBe(6); // Higher than max z-index (5)
  });

  it('should duplicate text element with text property', () => {
    const element: Element = {
      id: 'text-1',
      type: 'text',
      position: { x: 50, y: 50 },
      dimensions: { width: 150, height: 50 },
      zIndex: 1,
      text: 'Hello World',
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'text-1',
    });

    expect(newState.elements).toHaveLength(2);
    const duplicated = newState.elements[1];
    expect(duplicated.type).toBe('text');
    expect(duplicated.text).toBe('Hello World');
    expect(duplicated.position).toEqual({ x: 70, y: 70 });
  });

  it('should duplicate image element with imageUrl property', () => {
    const element: Element = {
      id: 'img-1',
      type: 'image',
      position: { x: 200, y: 200 },
      dimensions: { width: 300, height: 200 },
      zIndex: 2,
      imageUrl: 'https://example.com/image.png',
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'img-1',
    });

    expect(newState.elements).toHaveLength(2);
    const duplicated = newState.elements[1];
    expect(duplicated.type).toBe('image');
    expect(duplicated.imageUrl).toBe('https://example.com/image.png');
    expect(duplicated.position).toEqual({ x: 220, y: 220 });
  });

  it('should handle duplicating non-existent element gracefully', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'non-existent',
    });

    expect(newState.elements).toHaveLength(1);
    expect(newState).toBe(initialState);
  });

  it('should generate unique ID for duplicated element', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'rect-1',
    });

    const duplicated = newState.elements[1];
    expect(duplicated.id).not.toBe('rect-1');
    expect(duplicated.id).toBeTruthy();
    expect(typeof duplicated.id).toBe('string');
  });

  it('should not mutate original state when duplicating', () => {
    const element: Element = {
      id: 'rect-1',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      dimensions: { width: 100, height: 100 },
      zIndex: 1,
    };
    const initialState: CanvasState = {
      ...createInitialState(),
      elements: [element],
    };
    const originalElements = initialState.elements;

    const newState = canvasReducer(initialState, {
      type: 'DUPLICATE_ELEMENT',
      id: 'rect-1',
    });

    expect(newState.elements).not.toBe(originalElements);
    expect(originalElements).toHaveLength(1);
    expect(newState.elements).toHaveLength(2);
  });
});
