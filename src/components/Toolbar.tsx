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
        <h4 className="toolbar-section-title">Shapes</h4>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('rectangle')}
          title="Add Rectangle (R)"
        >
          <span className="toolbar-icon">◼️</span>
          <span className="toolbar-label">Rectangle</span>
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('circle')}
          title="Add Circle (C)"
        >
          <span className="toolbar-icon">⭕</span>
          <span className="toolbar-label">Circle</span>
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('line')}
          title="Add Line (L)"
        >
          <span className="toolbar-icon">➖</span>
          <span className="toolbar-label">Line</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <h4 className="toolbar-section-title">Content</h4>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('text')}
          title="Add Text (T)"
        >
          <span className="toolbar-icon">📝</span>
          <span className="toolbar-label">Text</span>
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAddElement('image')}
          title="Add Image (I)"
        >
          <span className="toolbar-icon">🖼️</span>
          <span className="toolbar-label">Image</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <h4 className="toolbar-section-title">History</h4>
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span className="toolbar-icon">↶</span>
          <span className="toolbar-label">Undo</span>
        </button>
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <span className="toolbar-icon">↷</span>
          <span className="toolbar-label">Redo</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button
          className="toolbar-button toolbar-button-primary"
          onClick={onExport}
          title="Export Canvas as PNG"
        >
          <span className="toolbar-icon">💾</span>
          <span className="toolbar-label">Export PNG</span>
        </button>
      </div>
    </div>
  );
}
