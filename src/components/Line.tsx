/**
 * Line Component
 * 
 * Renders a line element with configurable color, stroke width, and opacity.
 */

import type { Element } from '../types/canvas';

export interface LineProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Line({ element, isSelected, onSelect, onMouseDown }: LineProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const strokeWidth = element.strokeWidth || 3;

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-line ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
        cursor: 'pointer',
        boxSizing: 'border-box',
        opacity: element.opacity ?? 1,
        transform: `rotate(${element.rotation || 0}deg)`,
        pointerEvents: element.locked ? 'none' : 'auto',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <svg
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke={element.color || '#14b8a6'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
