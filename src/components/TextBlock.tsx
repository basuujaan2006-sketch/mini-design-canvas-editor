/**
 * TextBlock Component
 * 
 * Renders a text element with editable text content.
 * 
 * Requirements: 2.2
 */

import { useState, useRef, useEffect } from 'react';
import type { Element } from '../types/canvas';

export interface TextBlockProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onTextChange?: (elementId: string, text: string) => void;
}

export function TextBlock({ element, isSelected, onSelect, onMouseDown, onTextChange }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(element.text || 'Text');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing && onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onTextChange && editText !== element.text) {
      onTextChange(element.id, editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(element.text || 'Text');
    }
  };

  const rotation = element.rotation || 0;

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
        cursor: isEditing ? 'text' : 'pointer',
        boxSizing: 'border-box',
        padding: '8px',
        overflow: 'hidden',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      title={isEditing ? '' : 'Double-click to edit text'}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: 'var(--color-text-primary)',
            padding: 0,
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: 'var(--color-text-primary)',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}>
          {element.text || 'Text'}
        </div>
      )}
    </div>
  );
}
