/**
 * Canvas Component
 * 
 * The main workspace component that renders all elements and handles user interactions.
 * 
 * Responsibilities:
 * - Render canvas container with defined dimensions
 * - Render all elements in z-index order
 * - Handle background click to deselect elements
 * - Apply visual styling to distinguish canvas from surrounding UI
 * - Handle drag operations for moving elements
 * - Display alignment guides during drag operations
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 3.4, 4.1, 4.5, 6.2, 12.1, 12.4
 */

import { useState, useRef, useEffect } from 'react';
import type { Element, CanvasConfig, DragState, Position, AlignmentGuide } from '../types/canvas';
import { Rectangle } from './Rectangle';
import { TextBlock } from './TextBlock';
import { ImagePlaceholder } from './ImagePlaceholder';
import { SelectionOverlay } from './SelectionOverlay';
import { AlignmentGuides } from './AlignmentGuides';
import { handleDragStart, handleDragMove, handleDragEnd } from '../utils/dragHandler';
import { detectAlignments } from '../utils/alignmentGuides';
import './Canvas.css';

export interface CanvasProps {
  elements: Element[];
  selectedId: string | null;
  config: CanvasConfig;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<Element>) => void;
  onBackgroundClick: () => void;
  onElementDelete: (id: string) => void;
  onElementDuplicate: (id: string) => void;
}

export function Canvas({
  elements,
  selectedId,
  config,
  onElementSelect,
  onElementUpdate,
  onBackgroundClick,
  onElementDelete,
  onElementDuplicate,
}: CanvasProps) {
  // State for tracking drag operations
  const [dragState, setDragState] = useState<DragState | null>(null);
  // State for tracking alignment guides
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  /**
   * Get mouse position relative to canvas
   */
  const getMousePosition = (e: MouseEvent): Position => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  /**
   * Handle mouse down on an element to start dragging
   * Requirements: 4.1
   */
  const handleMouseDown = (e: React.MouseEvent, element: Element) => {
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();

    // Select the element
    onElementSelect(element.id);

    // Start drag operation
    const mousePosition = getMousePosition(e.nativeEvent);
    const newDragState = handleDragStart(element.id, element, mousePosition);
    setDragState(newDragState);
  };

  /**
   * Handle mouse move to update element position during drag
   * Requirements: 4.1, 4.5, 12.1
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !dragState.isDragging) return;

      const element = elements.find((el) => el.id === dragState.elementId);
      if (!element) return;

      const mousePosition = getMousePosition(e);
      const newPosition = handleDragMove(
        dragState,
        mousePosition,
        element.dimensions,
        config
      );

      // Update element position in real-time
      onElementUpdate(element.id, { position: newPosition });

      // Detect alignments with other elements
      // Create a temporary element with the new position for alignment detection
      const movingElement: Element = {
        ...element,
        position: newPosition,
      };
      const otherElements = elements.filter((el) => el.id !== element.id);
      const guides = detectAlignments(movingElement, otherElements);
      setAlignmentGuides(guides);
    };

    const handleMouseUp = () => {
      if (!dragState || !dragState.isDragging) return;

      // End drag operation
      const finalDragState = handleDragEnd(dragState);
      setDragState(finalDragState);

      // Clear alignment guides when drag ends
      // Requirements: 12.4
      setAlignmentGuides([]);
    };

    // Add global event listeners for mouse move and up
    if (dragState?.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, elements, config, onElementUpdate]);

  /**
   * Handle keyboard events for Delete key and Ctrl+D / Cmd+D
   * Requirements: 7.1, 7.5, 10.1, 10.2
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete or Backspace key is pressed
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if an element is selected
        // Requirements: 7.5
        if (selectedId) {
          e.preventDefault(); // Prevent default browser behavior
          onElementDelete(selectedId);
        }
      }
      
      // Check if Ctrl+D (Windows/Linux) or Cmd+D (Mac) is pressed
      // Requirements: 10.2
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        // Only duplicate if an element is selected
        if (selectedId) {
          e.preventDefault(); // Prevent default browser behavior (bookmark dialog)
          onElementDuplicate(selectedId);
        }
      }
    };

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, onElementDelete, onElementDuplicate]);

  /**
   * Handle clicks on the canvas background to deselect elements
   * Requirements: 3.4
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      onBackgroundClick();
    }
  };

  /**
   * Sort elements by z-index for proper rendering order
   * Elements with higher z-index appear above elements with lower z-index
   * Requirements: 6.2
   */
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  /**
   * Find the selected element for the overlay
   */
  const selectedElement = selectedId ? elements.find((el) => el.id === selectedId) : null;

  /**
   * Handle image upload for image elements
   */
  const handleImageUpload = (elementId: string, imageUrl: string) => {
    onElementUpdate(elementId, { imageUrl });
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        cursor: dragState?.isDragging ? 'grabbing' : 'default',
      }}
      onClick={handleCanvasClick}
    >
      {sortedElements.map((element) => (
        <CanvasElement
          key={element.id}
          element={element}
          isSelected={element.id === selectedId}
          onSelect={() => onElementSelect(element.id)}
          onMouseDown={(e) => handleMouseDown(e, element)}
          onImageUpload={handleImageUpload}
        />
      ))}
      
      {/* Render selection overlay on top of selected element */}
      {selectedElement && (
        <SelectionOverlay
          element={selectedElement}
          config={config}
          onElementUpdate={onElementUpdate}
        />
      )}

      {/* Render alignment guides during drag operations */}
      {alignmentGuides.length > 0 && (
        <AlignmentGuides
          guides={alignmentGuides}
          canvasWidth={config.width}
          canvasHeight={config.height}
        />
      )}
    </div>
  );
}

/**
 * CanvasElement Component
 * 
 * Renders an individual element on the canvas based on its type.
 * Handles element selection on click and drag initiation.
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 4.1
 */
interface CanvasElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onImageUpload?: (elementId: string, imageUrl: string) => void;
}

function CanvasElement({ element, isSelected, onSelect, onMouseDown, onImageUpload }: CanvasElementProps) {
  // Render based on element type
  switch (element.type) {
    case 'rectangle':
      return (
        <Rectangle
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
        />
      );

    case 'text':
      return (
        <TextBlock
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
        />
      );

    case 'image':
      return (
        <ImagePlaceholder
          element={element}
          isSelected={isSelected}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
          onImageUpload={onImageUpload}
        />
      );

    default:
      return null;
  }
}
