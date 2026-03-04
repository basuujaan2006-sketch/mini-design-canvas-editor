/**
 * SelectionOverlay Component
 * 
 * Renders a visual overlay around the selected element, including:
 * - Border highlight around the element
 * - Resize handles at corners and edges
 * - Interactive resize functionality
 * 
 * The overlay is positioned absolutely based on the selected element's
 * position and dimensions. Resize handles are interactive and allow
 * users to resize the element by dragging.
 * 
 * Requirements: 3.2, 3.3, 5.1
 */

import { useState, useEffect } from 'react';
import type { Element, ResizeHandle, ResizeState, Position, CanvasConfig } from '../types/canvas';
import { handleResizeStart, handleResizeMove, handleResizeEnd } from '../utils/resizeHandler';
import './SelectionOverlay.css';

export interface SelectionOverlayProps {
  element: Element;
  config: CanvasConfig;
  onElementUpdate: (id: string, updates: Partial<Element>) => void;
}

const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export function SelectionOverlay({ element, config, onElementUpdate }: SelectionOverlayProps) {
  const { position, dimensions } = element;
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  /**
   * Handle mouse down on a resize handle to start resizing
   * Requirements: 5.1
   */
  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    // Prevent default to avoid text selection during resize
    e.preventDefault();
    e.stopPropagation();

    // Get mouse position relative to the page
    const mousePosition: Position = {
      x: e.clientX,
      y: e.clientY,
    };

    // Start resize operation
    const newResizeState = handleResizeStart(element.id, element, handle, mousePosition);
    setResizeState(newResizeState);
  };

  /**
   * Handle mouse move to update element dimensions during resize
   * Requirements: 5.1
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState || !resizeState.isResizing) return;

      const mousePosition: Position = {
        x: e.clientX,
        y: e.clientY,
      };

      const { dimensions: newDimensions, position: newPosition } = handleResizeMove(
        resizeState,
        mousePosition,
        element,
        config
      );

      // Update element dimensions and position in real-time
      onElementUpdate(element.id, {
        dimensions: newDimensions,
        position: newPosition,
      });
    };

    const handleMouseUp = () => {
      if (!resizeState || !resizeState.isResizing) return;

      // End resize operation
      const finalResizeState = handleResizeEnd(resizeState);
      setResizeState(finalResizeState);
    };

    // Add global event listeners for mouse move and up
    if (resizeState?.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, element, config, onElementUpdate]);

  return (
    <div
      className="selection-overlay"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Border highlight */}
      <div className="selection-border" />

      {/* Resize handles */}
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle}
          className={`resize-handle resize-handle-${handle}`}
          style={{
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => handleMouseDown(e, handle)}
        />
      ))}
    </div>
  );
}
