/**
 * Star Component
 * 
 * Renders a 5-pointed star element with configurable color and opacity.
 */

import type { Element } from '../types/canvas';

export interface StarProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Star({ element, isSelected, onSelect, onMouseDown }: StarProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  // Generate star points (5-pointed star)
  const generateStarPoints = (width: number, height: number): string => {
    const cx = width / 2;
    const cy = height / 2;
    const outerRadiusX = width / 2;
    const outerRadiusY = height / 2;
    const innerRadiusX = outerRadiusX * 0.4;
    const innerRadiusY = outerRadiusY * 0.4;
    const points: string[] = [];

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const radiusX = i % 2 === 0 ? outerRadiusX : innerRadiusX;
      const radiusY = i % 2 === 0 ? outerRadiusY : innerRadiusY;
      const x = cx + radiusX * Math.cos(angle);
      const y = cy + radiusY * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  const opacity = element.opacity ?? 1;

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-star ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
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
      >
        <polygon
          points={generateStarPoints(element.dimensions.width, element.dimensions.height)}
          fill={element.color || '#f59e0b'}
          style={{ pointerEvents: 'none' }}
        />
      </svg>
    </div>
  );
}
