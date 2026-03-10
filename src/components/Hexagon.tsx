/**
 * Hexagon Component
 * 
 * Renders a hexagon element with configurable color and opacity.
 */

import type { Element } from '../types/canvas';

export interface HexagonProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function Hexagon({ element, isSelected, onSelect, onMouseDown }: HexagonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  // Generate hexagon points
  const generateHexagonPoints = (width: number, height: number): string => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2;
    const points: string[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  const opacity = element.opacity ?? 1;

  return (
    <div
      data-testid={`element-${element.id}`}
      className={`canvas-element canvas-hexagon ${isSelected ? 'selected' : ''}`}
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
          points={generateHexagonPoints(element.dimensions.width, element.dimensions.height)}
          fill={element.color || '#8b5cf6'}
          style={{ pointerEvents: 'none' }}
        />
      </svg>
    </div>
  );
}
