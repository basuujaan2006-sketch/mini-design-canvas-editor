/**
 * App Component
 * 
 * Root component for the Mini Design Canvas Editor.
 * Manages global state and coordinates child components.
 * 
 * Requirements: 1.1, 1.2, 8.4, 13.1, 13.2
 */

import { useEffect, useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useCanvasState } from './hooks/useCanvasState';
import { createRectangle, createTextBlock, createImagePlaceholder } from './utils/elementFactory';
import { exportCanvasAsPNG } from './utils/exportCanvas';
import type { CanvasConfig, ElementType } from './types/canvas';
import './App.css';

const canvasConfig: CanvasConfig = {
  width: 800,
  height: 600,
  gridSize: 10,
  minElementWidth: 20,
  minElementHeight: 20,
};

function App() {
  const [state, dispatch, { undo, redo, canUndo, canRedo }] = useCanvasState();
  const [exportError, setExportError] = useState<string | null>(null);

  const handleElementSelect = (id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', id });
  };

  const handleElementUpdate = (id: string, updates: Partial<any>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, updates });
  };

  const handleBackgroundClick = () => {
    dispatch({ type: 'SELECT_ELEMENT', id: null });
  };

  const handleElementDelete = (id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', id });
  };

  const handleElementDuplicate = (id: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENT', id });
  };

  const handleAddElement = (type: ElementType) => {
    let element;
    switch (type) {
      case 'rectangle':
        element = createRectangle(state.elements);
        break;
      case 'text':
        element = createTextBlock(state.elements);
        break;
      case 'image':
        element = createImagePlaceholder(state.elements);
        break;
    }
    dispatch({ type: 'ADD_ELEMENT', element });
  };

  /**
   * Handle canvas export as PNG
   * Requirements: 15.1, 15.4
   */
  const handleExport = async () => {
    try {
      setExportError(null);
      await exportCanvasAsPNG(state.elements, canvasConfig);
    } catch (error) {
      // Handle export errors gracefully (Requirement 15.4)
      const errorMessage = error instanceof Error ? error.message : 'Failed to export canvas';
      setExportError(errorMessage);
      console.error('Export error:', error);
    }
  };

  /**
   * Handle keyboard shortcuts for undo/redo
   * Requirements: 13.1, 13.2
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) for undo
      // Requirements: 13.1
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault(); // Prevent default browser behavior
          undo();
        }
      }
      
      // Check for Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac) for redo
      // Requirements: 13.2
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        if (canRedo) {
          e.preventDefault(); // Prevent default browser behavior
          redo();
        }
      }
    };

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  const selectedElement = state.selectedId 
    ? state.elements.find(el => el.id === state.selectedId) || null
    : null;

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Mini Design Canvas Editor</h1>
      </div>
      
      <Toolbar
        onAddElement={handleAddElement}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="app-workspace">
        <Canvas
          elements={state.elements}
          selectedId={state.selectedId}
          config={canvasConfig}
          onElementSelect={handleElementSelect}
          onElementUpdate={handleElementUpdate}
          onBackgroundClick={handleBackgroundClick}
          onElementDelete={handleElementDelete}
          onElementDuplicate={handleElementDuplicate}
        />

        <PropertiesPanel
          element={selectedElement}
          config={canvasConfig}
          onUpdate={handleElementUpdate}
        />
      </div>

      <div className="app-info">
        <p>Elements: {state.elements.length} | Selected: {state.selectedId || 'None'}</p>
        <p>Click elements to select • Drag to move • Use resize handles to resize</p>
        {exportError && (
          <p className="error-message">
            Export Error: {exportError}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
