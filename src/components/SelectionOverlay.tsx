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
  const { position, dimensions, rotation = 0 } = element;
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({ angle: 0, mouseAngle: 0 });

  /**
   * Handle mouse/touch down on a resize handle to start resizing
   * Requirements: 5.1
   */
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
    // Prevent default to avoid text selection during resize
    e.preventDefault();
    e.stopPropagation();

    // Get mouse/touch position relative to the page
    const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
    const clientX = 'touches' in nativeEvent ? (nativeEvent.touches[0]?.clientX ?? 0) : nativeEvent.clientX;
    const clientY = 'touches' in nativeEvent ? (nativeEvent.touches[0]?.clientY ?? 0) : nativeEvent.clientY;
    
    const mousePosition: Position = {
      x: clientX ?? 0,
      y: clientY ?? 0,
    };

    // Start resize operation
    const newResizeState = handleResizeStart(element.id, element, handle, mousePosition);
    setResizeState(newResizeState);
  };

  /**
   * Handle rotation handle mouse down
   */
  const handleRotationMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
    const clientX = 'touches' in nativeEvent ? (nativeEvent.touches[0]?.clientX ?? 0) : nativeEvent.clientX;
    const clientY = 'touches' in nativeEvent ? (nativeEvent.touches[0]?.clientY ?? 0) : nativeEvent.clientY;

    // Calculate center of element
    const centerX = position.x + dimensions.width / 2;
    const centerY = position.y + dimensions.height / 2;

    // Calculate initial angle
    const mouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    setIsRotating(true);
    setRotationStart({ angle: rotation, mouseAngle });
  };

  /**
   * Handle mouse/touch move to update element dimensions during resize
   * Requirements: 5.1
   */
  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth updates
      rafId = requestAnimationFrame(() => {
        // Handle resize
        if (resizeState && resizeState.isResizing) {
          const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
          const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

          const mousePosition: Position = {
            x: clientX ?? 0,
            y: clientY ?? 0,
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
        }

        // Handle rotation
        if (isRotating) {
          const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
          const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

          // Calculate center of element
          const centerX = position.x + dimensions.width / 2;
          const centerY = position.y + dimensions.height / 2;

          // Calculate current angle
          const currentMouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
          
          // Calculate rotation delta
          const angleDelta = currentMouseAngle - rotationStart.mouseAngle;
          let newRotation = rotationStart.angle + angleDelta;

          // Normalize to 0-360
          newRotation = ((newRotation % 360) + 360) % 360;

          onElementUpdate(element.id, { rotation: newRotation });
        }
      });
    };

    const handleMouseUp = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (resizeState && resizeState.isResizing) {
        // End resize operation
        const finalResizeState = handleResizeEnd(resizeState);
        setResizeState(finalResizeState);
      }

      if (isRotating) {
        setIsRotating(false);
      }
    };

    // Add global event listeners for mouse/touch move and up
    if (resizeState?.isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    // Cleanup
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [resizeState, isRotating, element, config, onElementUpdate, position, dimensions, rotationStart]);

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
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
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
          onTouchStart={(e) => handleMouseDown(e, handle)}
        />
      ))}

      {/* Rotation handle */}
      <div
        className="rotation-handle"
        style={{
          pointerEvents: 'auto',
        }}
        onMouseDown={handleRotationMouseDown}
        onTouchStart={handleRotationMouseDown}
        title="Rotate"
      >
        <div className="rotation-handle-icon">↻</div>
      </div>
    </div>
  );
}
