/**
 * Triangle Component
 * 
 * Renders a triangle element with configurable color and opacity.
 */

import type { Element } from '../types/canvas';

export interface TriangleProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Triangle({ element, isSelected, onSelect, onMouseDown }: TriangleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const opacity = element.opacity ?? 1;
  const width = element.dimensions.width;
  const height = element.dimensions.height;

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-triangle ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: 'pointer',
        boxSizing: 'border-box',
        opacity: opacity,
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
        viewBox={`0 0 ${width} ${height}`}
      >
        <polygon
          points={`${width/2},0 ${width},${height} 0,${height}`}
          fill={element.color || '#10b981'}
        />
      </svg>
    </div>
  );
}
