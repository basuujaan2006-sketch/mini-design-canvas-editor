/**
 * Toolbar Component
 * 
 * Provides buttons for adding elements, undo/redo operations, and exporting the canvas.
 * The toolbar is the primary interface for creating new elements and managing canvas history.
 * 
 * Requirements: 2.1, 2.2, 2.3, 13.1, 13.2, 15.1
 */

import type { ElementType } from '../types/canvas';
import './Toolbar.css';

export interface ToolbarProps {
  onAddElement: (type: ElementType) => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Toolbar component that provides buttons for canvas operations
 * 
 * Features:
 * - Add Rectangle button (Requirement 2.1)
 * - Add Text Block button (Requirement 2.2)
 * - Add Image Placeholder button (Requirement 2.3)
 * - Undo button with enabled/disabled state (Requirement 13.1)
 * - Redo button with enabled/disabled state (Requirement 13.2)
 * - Export button (Requirement 15.1)
 * 
 * @param props - Toolbar properties including action handlers and state
 */
export function Toolbar({
  onAddElement,
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={() => onAddElement('rectangle')}
          title="Add Rectangle"
        >
          <span style={{ fontSize: '18px' }}>◼️</span> Rectangle
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('text')}
          title="Add Text Block"
        >
          <span style={{ fontSize: '18px' }}>📝</span> Text
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('image')}
          title="Add Image Placeholder"
        >
          <span style={{ fontSize: '18px' }}>🖼️</span> Image
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span style={{ fontSize: '18px' }}>↶</span> Undo
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <span style={{ fontSize: '18px' }}>↷</span> Redo
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button
          className="toolbar-button toolbar-button-primary"
          onClick={onExport}
          title="Export Canvas as PNG"
        >
          <span style={{ fontSize: '18px' }}>💾</span> Export PNG
        </button>
      </div>
    </div>
  );
}
