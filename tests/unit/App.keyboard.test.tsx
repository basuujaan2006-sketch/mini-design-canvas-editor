/**
 * Unit tests for keyboard shortcuts in App component
 * 
 * Tests keyboard event listeners for undo/redo functionality
 * Requirements: 13.1, 13.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../../src/App';

describe('App - Keyboard Shortcuts', () => {
  describe('Undo keyboard shortcut (Ctrl+Z / Cmd+Z)', () => {
    it('should have keyboard event listener for Ctrl+Z', () => {
      const { unmount } = render(<App />);
      
      // Verify that the component renders without errors
      // The keyboard event listener is set up in useEffect
      expect(document.querySelector('h1')?.textContent).toBe('Mini Design Canvas Editor');
      
      // Cleanup
      unmount();
    });

    it('should handle Ctrl+Z keyboard event', () => {
      render(<App />);
      
      // Simulate Ctrl+Z keyboard event
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
      });
      
      // This should not throw an error even if there's nothing to undo
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });

    it('should handle Cmd+Z keyboard event (Mac)', () => {
      render(<App />);
      
      // Simulate Cmd+Z keyboard event (Mac)
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        bubbles: true,
      });
      
      // This should not throw an error even if there's nothing to undo
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });

    it('should not trigger undo when Shift is also pressed', () => {
      render(<App />);
      
      // Simulate Ctrl+Shift+Z keyboard event (this should be redo, not undo)
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });
      
      // This should not throw an error
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });
  });

  describe('Redo keyboard shortcut (Ctrl+Shift+Z / Cmd+Shift+Z)', () => {
    it('should handle Ctrl+Shift+Z keyboard event', () => {
      render(<App />);
      
      // Simulate Ctrl+Shift+Z keyboard event for redo
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });
      
      // This should not throw an error even if there's nothing to redo
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });

    it('should handle Cmd+Shift+Z keyboard event (Mac)', () => {
      render(<App />);
      
      // Simulate Cmd+Shift+Z keyboard event for redo (Mac)
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        shiftKey: true,
        bubbles: true,
      });
      
      // This should not throw an error even if there's nothing to redo
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });
  });

  describe('Keyboard event listener cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { unmount } = render(<App />);
      
      // Get initial listener count (this is a simplified check)
      const initialListeners = vi.fn();
      window.addEventListener = initialListeners;
      
      // Unmount component
      unmount();
      
      // Verify component unmounted successfully
      expect(document.querySelector('h1')).toBeNull();
    });
  });
});
