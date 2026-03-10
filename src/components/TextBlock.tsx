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

  // Sync editText with element.text when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditText(element.text || 'Text');
    }
  }, [element.text, isEditing]);

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
    setEditText(element.text || 'Text');
    setIsEditing(true);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing && onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Always update, even if text is empty or same
    if (onTextChange) {
      // If text is empty, set it to a default value
      const finalText = editText.trim() === '' ? 'Text' : editText;
      onTextChange(element.id, finalText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(element.text || 'Text');
    }
    // Prevent event from bubbling up when editing
    e.stopPropagation();
  };

  const rotation = element.rotation || 0;
  const textColor = element.textColor || '#000000';
  const backgroundColor = element.backgroundColor || '#ffffff';
  const opacity = element.opacity ?? 1;

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
        backgroundColor: backgroundColor,
        opacity: opacity,
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
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: textColor,
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
          color: textColor,
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        }}>
          {element.text || 'Text'}
        </div>
      )}
    </div>
  );
}
