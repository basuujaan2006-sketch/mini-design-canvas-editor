import { useState, useEffect } from 'react';
import type { Element, CanvasConfig } from '../types/canvas';
import './PropertiesPanel.css';

export interface PropertiesPanelProps {
  element: Element | null;
  config: CanvasConfig;
  onUpdate: (id: string, updates: Partial<Element>) => void;
}

interface PropertyErrors {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
}

export function PropertiesPanel({ element, config, onUpdate }: PropertiesPanelProps) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [rotation, setRotation] = useState('0');
  const [errors, setErrors] = useState<PropertyErrors>({});

  useEffect(() => {
    if (element) {
      setX(element.position.x.toString());
      setY(element.position.y.toString());
      setWidth(element.dimensions.width.toString());
      setHeight(element.dimensions.height.toString());
      setRotation((element.rotation || 0).toFixed(0));
      setErrors({});
    }
  }, [element]);

  if (!element) {
    return (
      <div className="properties-panel">
        <h3>Properties</h3>
        <p className="no-selection">No element selected</p>
      </div>
    );
  }

  const validateAndUpdate = (field: 'x' | 'y' | 'width' | 'height', value: string) => {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      setErrors({ ...errors, [field]: 'Must be a valid number' });
      return;
    }

    let error: string | undefined;
    let isValid = true;

    if (field === 'x') {
      if (num < 0) {
        error = 'Must be positive';
        isValid = false;
      } else if (num > config.width - element.dimensions.width) {
        error = `Must be ≤ ${config.width - element.dimensions.width}`;
        isValid = false;
      } else {
        onUpdate(element.id, { position: { ...element.position, x: num } });
      }
    } else if (field === 'y') {
      if (num < 0) {
        error = 'Must be positive';
        isValid = false;
      } else if (num > config.height - element.dimensions.height) {
        error = `Must be ≤ ${config.height - element.dimensions.height}`;
        isValid = false;
      } else {
        onUpdate(element.id, { position: { ...element.position, y: num } });
      }
    } else if (field === 'width') {
      if (num < config.minElementWidth) {
        error = `Must be ≥ ${config.minElementWidth}`;
        isValid = false;
      } else if (num > config.width - element.position.x) {
        error = `Must be ≤ ${config.width - element.position.x}`;
        isValid = false;
      } else {
        onUpdate(element.id, { dimensions: { ...element.dimensions, width: num } });
      }
    } else if (field === 'height') {
      if (num < config.minElementHeight) {
        error = `Must be ≥ ${config.minElementHeight}`;
        isValid = false;
      } else if (num > config.height - element.position.y) {
        error = `Must be ≤ ${config.height - element.position.y}`;
        isValid = false;
      } else {
        onUpdate(element.id, { dimensions: { ...element.dimensions, height: num } });
      }
    }

    if (isValid) {
      setErrors({ ...errors, [field]: undefined });
    } else {
      setErrors({ ...errors, [field]: error });
    }
  };

  return (
    <div className="properties-panel">
      <h3>Properties</h3>

      <div className="property-group">
        <label htmlFor="prop-x">X:</label>
        <input
          id="prop-x"
          type="text"
          value={x}
          onChange={(e) => setX(e.target.value)}
          onBlur={() => validateAndUpdate('x', x)}
          className={errors.x ? 'error' : ''}
        />
        {errors.x && <span className="error-message">{errors.x}</span>}
      </div>

      <div className="property-group">
        <label htmlFor="prop-y">Y:</label>
        <input
          id="prop-y"
          type="text"
          value={y}
          onChange={(e) => setY(e.target.value)}
          onBlur={() => validateAndUpdate('y', y)}
          className={errors.y ? 'error' : ''}
        />
        {errors.y && <span className="error-message">{errors.y}</span>}
      </div>

      <div className="property-group">
        <label htmlFor="prop-width">Width:</label>
        <input
          id="prop-width"
          type="text"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onBlur={() => validateAndUpdate('width', width)}
          className={errors.width ? 'error' : ''}
        />
        {errors.width && <span className="error-message">{errors.width}</span>}
      </div>

      <div className="property-group">
        <label htmlFor="prop-height">Height:</label>
        <input
          id="prop-height"
          type="text"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onBlur={() => validateAndUpdate('height', height)}
          className={errors.height ? 'error' : ''}
        />
        {errors.height && <span className="error-message">{errors.height}</span>}
      </div>

      <div className="property-group">
        <label htmlFor="prop-rotation">Rotation:</label>
        <input
          id="prop-rotation"
          type="range"
          min="0"
          max="360"
          value={rotation}
          onChange={(e) => {
            const value = e.target.value;
            setRotation(value);
            onUpdate(element.id, { rotation: parseFloat(value) });
          }}
          className="rotation-slider"
        />
        <span className="rotation-value">{rotation}°</span>
      </div>
    </div>
  );
}