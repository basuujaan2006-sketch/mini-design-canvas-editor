/**
 * TextBlock Component
 * 
 * Renders a text element with basic styling.
 * 
 * Requirements: 2.2
 */

import type { Element } from '../types/canvas';

export interface TextBlockProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function TextBlock({ element, isSelected, onSelect, onMouseDown }: TextBlockProps) {
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
      className={`canvas-element canvas-text ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
        cursor: 'pointer',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2937',
        padding: '8px',
        overflow: 'hidden',
        wordWrap: 'break-word',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {element.text || 'Text'}
    </div>
  );
}
