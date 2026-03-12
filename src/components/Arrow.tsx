/**
 * Arrow Component
 * 
 * Renders an arrow element with configurable color and opacity.
 */

import type { Element } from '../types/canvas';

export interface ArrowProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Arrow({ element, isSelected, onSelect, onMouseDown }: ArrowProps) {
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
  const strokeWidth = element.strokeWidth || 3;
  const arrowHeadWidth = Math.min(width * 0.3, 40);

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-arrow ${isSelected ? 'selected' : ''}`}
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
        {/* Arrow shaft */}
        <line
          x1="0"
          y1={height / 2}
          x2={width - arrowHeadWidth}
          y2={height / 2}
          stroke={element.color || '#ef4444'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <polygon
          points={`${width - arrowHeadWidth},${height * 0.2} ${width},${height / 2} ${width - arrowHeadWidth},${height * 0.8}`}
          fill={element.color || '#ef4444'}
        />
      </svg>
    </div>
  );
}
