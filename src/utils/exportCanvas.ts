/**
 * Export Canvas Utility
 * 
 * Provides functionality to export the canvas as a PNG image.
 * Uses the Canvas API to render all elements in z-index order,
 * excluding UI controls like selection overlays and resize handles.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.5, 15.6
 */

import type { Element, CanvasConfig } from '../types/canvas';

/**
 * Exports the canvas as a PNG image
 * 
 * This function:
 * 1. Creates an offscreen canvas element
 * 2. Renders all elements in z-index order (Requirement 15.3)
 * 3. Excludes UI controls (selection overlays, resize handles) (Requirement 15.6)
 * 4. Generates a PNG blob (Requirement 15.2)
 * 5. Triggers a download with a descriptive filename (Requirement 15.5)
 * 
 * @param elements - Array of elements to render
 * @param config - Canvas configuration (dimensions)
 * @returns Promise that resolves when export is complete
 */
export async function exportCanvasAsPNG(
  elements: Element[],
  config: CanvasConfig
): Promise<void> {
  // Create an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Fill background with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, config.width, config.height);

  // Sort elements by z-index (lowest to highest) to render in correct order
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Render each element
  for (const element of sortedElements) {
    renderElement(ctx, element);
  }

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob'));
      }
    }, 'image/png');
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `canvas-export-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Renders a single element to the canvas context
 * 
 * @param ctx - Canvas 2D rendering context
 * @param element - Element to render
 */
function renderElement(ctx: CanvasRenderingContext2D, element: Element): void {
  switch (element.type) {
    case 'rectangle':
      renderRectangle(ctx, element);
      break;
    case 'text':
      renderTextBlock(ctx, element);
      break;
    case 'image':
      renderImagePlaceholder(ctx, element);
      break;
  }
}

/**
 * Renders a rectangle element
 */
function renderRectangle(ctx: CanvasRenderingContext2D, element: Element): void {
  const { position, dimensions, color } = element;
  
  ctx.fillStyle = color || '#3b82f6';
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);
  
  // Add border
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}

/**
 * Renders a text block element
 */
function renderTextBlock(ctx: CanvasRenderingContext2D, element: Element): void {
  const { position, dimensions, text } = element;
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);
  
  // Border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
  
  // Text
  ctx.fillStyle = '#000000';
  ctx.font = '16px sans-serif';
  ctx.textBaseline = 'top';
  
  const textContent = text || 'Text Block';
  const padding = 8;
  
  // Simple text wrapping
  const words = textContent.split(' ');
  let line = '';
  let y = position.y + padding;
  const lineHeight = 20;
  const maxWidth = dimensions.width - padding * 2;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, position.x + padding, y);
      line = word + ' ';
      y += lineHeight;
      
      // Stop if we exceed element height
      if (y + lineHeight > position.y + dimensions.height - padding) {
        break;
      }
    } else {
      line = testLine;
    }
  }
  
  // Render remaining text
  if (line && y + lineHeight <= position.y + dimensions.height) {
    ctx.fillText(line, position.x + padding, y);
  }
}

/**
 * Renders an image placeholder element
 */
function renderImagePlaceholder(ctx: CanvasRenderingContext2D, element: Element): void {
  const { position, dimensions } = element;
  
  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);
  
  // Border
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
  
  // Icon/text
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const centerX = position.x + dimensions.width / 2;
  const centerY = position.y + dimensions.height / 2;
  
  ctx.fillText('🖼', centerX, centerY - 15);
  ctx.font = '14px sans-serif';
  ctx.fillText('Image Placeholder', centerX, centerY + 15);
}
