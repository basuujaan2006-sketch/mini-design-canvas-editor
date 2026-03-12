/**
 * ImagePlaceholder Component
 * 
 * Renders an image element that supports real image uploads and display.
 * Users can click to upload an image or see a placeholder.
 * 
 * Requirements: 2.3
 */

import { useRef } from 'react';
import type { Element } from '../types/canvas';

export interface ImagePlaceholderProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void;
  onImageUpload?: (elementId: string, imageUrl: string) => void;
}

export function ImagePlaceholder({ 
  element, 
  isSelected, 
  onSelect, 
  onMouseDown,
  onImageUpload 
}: ImagePlaceholderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (onMouseDown) {
      onMouseDown(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!element.imageUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageUrl && onImageUpload) {
          onImageUpload(element.id, imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const rotation = element.rotation || 0;

  return (
    <>
      <div
        data-testid={`element-${element.id}`}
        className={`canvas-element canvas-image ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.dimensions.width}px`,
          height: `${element.dimensions.height}px`,
          cursor: element.imageUrl ? 'pointer' : 'pointer',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={element.imageUrl ? 'Image' : 'Double-click to upload image'}
      >
        {element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Uploaded"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '32px' }}>🖼️</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Double-click to upload</div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
