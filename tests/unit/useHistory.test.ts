/**
 * Unit tests for useHistory hook
 * 
 * Tests the history management functionality including undo, redo, and state tracking.
 * Requirements: 13.3, 13.4, 13.5, 13.6
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../../src/hooks/useHistory';

describe('useHistory - initialization', () => {
  it('should initialize with the provided initial state', () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() => useHistory(initialState));

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should initialize with complex state object', () => {
    const initialState = {
      elements: [{ id: '1', value: 'test' }],
      selectedId: null,
    };
    const { result } = renderHook(() => useHistory(initialState));

    expect(result.current.state).toEqual(initialState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});

describe('useHistory - pushState', () => {
  it('should update state when pushing new state', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should maintain history of previous states', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.pushState({ count: 3 });
    });

    expect(result.current.state).toEqual({ count: 3 });
    expect(result.current.canUndo).toBe(true);
  });

  it('should clear future stack when pushing new state after undo', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.pushState({ count: 3 });
    });

    expect(result.current.state).toEqual({ count: 3 });
    expect(result.current.canRedo).toBe(false);
  });
});

describe('useHistory - undo', () => {
  it('should restore previous state when undoing', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  it('should restore to initial state when undoing all actions', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });

    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('should do nothing when undoing with no history', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
  });

  it('should handle multiple undo operations', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.pushState({ count: 3 });
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 2 });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 1 });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
  });
});

describe('useHistory - redo', () => {
  it('should restore next state when redoing', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 2 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should do nothing when redoing with no future', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canRedo).toBe(false);
  });

  it('should handle multiple redo operations', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.pushState({ count: 3 });
      result.current.undo();
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 0 });

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual({ count: 1 });

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual({ count: 2 });

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual({ count: 3 });
    expect(result.current.canRedo).toBe(false);
  });
});

describe('useHistory - undo/redo round trip', () => {
  it('should return to same state after undo then redo', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });

    const stateBeforeUndo = result.current.state;

    act(() => {
      result.current.undo();
      result.current.redo();
    });

    expect(result.current.state).toEqual(stateBeforeUndo);
    expect(result.current.state).toEqual({ count: 2 });
  });

  it('should handle multiple round trips', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.pushState({ count: 3 });
    });

    act(() => {
      result.current.undo();
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 1 });

    act(() => {
      result.current.redo();
      result.current.redo();
    });
    expect(result.current.state).toEqual({ count: 3 });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toEqual({ count: 2 });

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toEqual({ count: 3 });
  });
});

describe('useHistory - canUndo and canRedo flags', () => {
  it('should correctly report canUndo status', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.pushState({ count: 1 });
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(result.current.canUndo).toBe(false);
  });

  it('should correctly report canRedo status', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.pushState({ count: 1 });
    });
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });
    expect(result.current.canRedo).toBe(false);
  });

  it('should clear canRedo when pushing new state after undo', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.pushState({ count: 3 });
    });

    expect(result.current.canRedo).toBe(false);
  });
});

describe('useHistory - complex state objects', () => {
  it('should handle complex canvas-like state', () => {
    interface CanvasState {
      elements: Array<{ id: string; x: number; y: number }>;
      selectedId: string | null;
    }

    const initialState: CanvasState = {
      elements: [],
      selectedId: null,
    };

    const { result } = renderHook(() => useHistory(initialState));

    act(() => {
      result.current.pushState({
        elements: [{ id: '1', x: 10, y: 20 }],
        selectedId: '1',
      });
    });

    expect(result.current.state.elements).toHaveLength(1);
    expect(result.current.state.selectedId).toBe('1');

    act(() => {
      result.current.pushState({
        elements: [
          { id: '1', x: 10, y: 20 },
          { id: '2', x: 30, y: 40 },
        ],
        selectedId: '2',
      });
    });

    expect(result.current.state.elements).toHaveLength(2);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state.elements).toHaveLength(1);
    expect(result.current.state.selectedId).toBe('1');
  });

  it('should maintain state immutability', () => {
    const initialState = { items: [1, 2, 3] };
    const { result } = renderHook(() => useHistory(initialState));

    const firstState = result.current.state;

    act(() => {
      result.current.pushState({ items: [1, 2, 3, 4] });
    });

    const secondState = result.current.state;

    expect(firstState).not.toBe(secondState);
    expect(firstState.items).toEqual([1, 2, 3]);
    expect(secondState.items).toEqual([1, 2, 3, 4]);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual(firstState);
  });
});

describe('useHistory - edge cases', () => {
  it('should handle rapid state changes', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.pushState({ count: i });
      }
    });

    expect(result.current.state).toEqual({ count: 10 });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.undo();
      }
    });

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
  });

  it('should handle alternating undo/redo operations', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.pushState({ count: 1 });
      result.current.pushState({ count: 2 });
    });

    act(() => {
      result.current.undo();
      result.current.redo();
      result.current.undo();
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 2 });
  });

  it('should handle empty state object', () => {
    const { result } = renderHook(() => useHistory({}));

    expect(result.current.state).toEqual({});

    act(() => {
      result.current.pushState({ value: 'test' });
    });

    expect(result.current.state).toEqual({ value: 'test' });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({});
  });
});
