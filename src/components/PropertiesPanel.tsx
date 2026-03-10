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
  const [color, setColor] = useState('#3b82f6');
  const [opacity, setOpacity] = useState('1');
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [errors, setErrors] = useState<PropertyErrors>({});

  useEffect(() => {
    if (element) {
      setX(element.position.x.toString());
      setY(element.position.y.toString());
      setWidth(element.dimensions.width.toString());
      setHeight(element.dimensions.height.toString());
      setRotation((element.rotation || 0).toFixed(0));
      // Ensure color is always a valid hex value
      const elementColor = element.color || '#3b82f6';
      setColor(elementColor);
      setOpacity((element.opacity ?? 1).toString());
      setText(element.text || '');
      setTextColor(element.textColor || '#000000');
      setBackgroundColor(element.backgroundColor || '#ffffff');
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
      
      <div className="property-section">
        <h4 className="section-title">Transform</h4>

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

      {/* Color control for shapes */}
      {(element.type === 'rectangle' || element.type === 'circle' || element.type === 'triangle' || 
        element.type === 'star' || element.type === 'hexagon' || element.type === 'arrow' || element.type === 'line') && (
        <div className="property-section">
          <h4 className="section-title">Appearance</h4>
          
          <div className="property-group">
            <label htmlFor="prop-color">Color:</label>
            <div className="color-input-wrapper">
              <input
                id="prop-color"
                type="color"
                value={color}
                onChange={(e) => {
                  const value = e.target.value;
                  setColor(value);
                  onUpdate(element.id, { color: value });
                }}
                className="color-picker"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const value = e.target.value;
                  setColor(value);
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onUpdate(element.id, { color: value });
                  }
                }}
                className="color-text"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="property-group">
            <label htmlFor="prop-opacity">Opacity:</label>
            <input
              id="prop-opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => {
                const value = e.target.value;
                setOpacity(value);
                onUpdate(element.id, { opacity: parseFloat(value) });
              }}
              className="opacity-slider"
            />
            <span className="opacity-value">{Math.round(parseFloat(opacity) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Text control for text elements */}
      {element.type === 'text' && (
        <div className="property-section">
          <h4 className="section-title">Text</h4>
          
          <div className="property-group">
            <label htmlFor="prop-text">Content:</label>
            <textarea
              id="prop-text"
              value={text}
              onChange={(e) => {
                const value = e.target.value;
                setText(value);
                onUpdate(element.id, { text: value });
              }}
              className="text-input"
              rows={3}
            />
          </div>

          <div className="property-group">
            <label htmlFor="prop-text-color">Text Color:</label>
            <div className="color-input-wrapper">
              <input
                id="prop-text-color"
                type="color"
                value={textColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setTextColor(value);
                  onUpdate(element.id, { textColor: value });
                }}
                className="color-picker"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setTextColor(value);
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onUpdate(element.id, { textColor: value });
                  }
                }}
                className="color-text"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="property-group">
            <label htmlFor="prop-bg-color">Background:</label>
            <div className="color-input-wrapper">
              <input
                id="prop-bg-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setBackgroundColor(value);
                  onUpdate(element.id, { backgroundColor: value });
                }}
                className="color-picker"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  setBackgroundColor(value);
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onUpdate(element.id, { backgroundColor: value });
                  }
                }}
                className="color-text"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="property-group">
            <label htmlFor="prop-text-opacity">Opacity:</label>
            <input
              id="prop-text-opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => {
                const value = e.target.value;
                setOpacity(value);
                onUpdate(element.id, { opacity: parseFloat(value) });
              }}
              className="opacity-slider"
            />
            <span className="opacity-value">{Math.round(parseFloat(opacity) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Element type badge */}
      <div className="element-info">
        <span className="element-type">{element.type}</span>
        <span className="element-id">ID: {element.id.slice(0, 8)}</span>
      </div>
    </div>
  );
}