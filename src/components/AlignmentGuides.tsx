/**
 * AlignmentGuides Component
 * 
 * Renders visual guide lines when elements align with other elements during drag operations.
 * 
 * Responsibilities:
 * - Render vertical and horizontal guide lines
 * - Position guides based on detected alignments
 * - Display guides as thin, colored lines spanning the canvas
 * 
 * Requirements: 12.2, 12.3
 */

import type { AlignmentGuide } from '../types/canvas';
import './AlignmentGuides.css';

export interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

export function AlignmentGuides({ guides, canvasWidth, canvasHeight }: AlignmentGuidesProps) {
  return (
    <>
      {guides.map((guide, index) => {
        if (guide.type === 'vertical') {
          // Vertical guide: spans full canvas height at the specified x position
          return (
            <div
              key={`${guide.type}-${guide.position}-${index}`}
              className="alignment-guide alignment-guide-vertical"
              style={{
                left: `${guide.position}px`,
                top: 0,
                height: `${canvasHeight}px`,
              }}
            />
          );
        } else {
          // Horizontal guide: spans full canvas width at the specified y position
          return (
            <div
              key={`${guide.type}-${guide.position}-${index}`}
              className="alignment-guide alignment-guide-horizontal"
              style={{
                left: 0,
                top: `${guide.position}px`,
                width: `${canvasWidth}px`,
              }}
            />
          );
        }
      })}
    </>
  );
}
