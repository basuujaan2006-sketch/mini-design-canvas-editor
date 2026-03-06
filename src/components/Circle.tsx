/**
 * Circle Component
 * 
 * Renders a circular/elliptical element with configurable color and opacity.
 */

import type { Element } from '../types/canvas';

export interface CircleProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Circle({ element, isSelected, onSelect, onMouseDown }: CircleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-circle ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
        backgroundColor: element.color || '#ec4899',
        cursor: 'pointer',
        boxSizing: 'border-box',
        borderRadius: '50%',
        opacity: element.opacity ?? 1,
        transform: `rotate(${element.rotation || 0}deg)`,
        pointerEvents: element.locked ? 'none' : 'auto',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    />
  );
}
