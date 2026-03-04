/**
 * Rectangle Component
 * 
 * Renders a colored rectangle element with configurable background color.
 * 
 * Requirements: 2.1
 */

import type { Element } from '../types/canvas';

export interface RectangleProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function Rectangle({ element, isSelected, onSelect, onMouseDown }: RectangleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-rectangle ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
        backgroundColor: element.color || '#3b82f6',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    />
  );
}
