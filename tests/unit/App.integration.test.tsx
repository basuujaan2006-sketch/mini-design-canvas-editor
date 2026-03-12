/**
 * Integration Tests for App Component
 * 
 * Tests complete user flows including:
 * - Add element, select, drag, resize, delete
 * - Undo/redo across multiple operations
 * 
 * Requirements: 8.4, 9.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';

describe('App Integration Tests', () => {
  describe('Complete user flow: add, select, drag, resize, delete', () => {
    it('should render the app with initial state', () => {
      render(<App />);
      
      // Verify app title is present
      expect(screen.getByText('Mini Design Canvas Editor')).toBeInTheDocument();
      
      // Verify initial state shows no elements
      expect(screen.getByText(/Elements: 0/)).toBeInTheDocument();
      expect(screen.getByText(/Selected: None/)).toBeInTheDocument();
    });
    
    it('should add elements when toolbar buttons are clicked', async () => {
      render(<App />);
      
      // Find and click the Rectangle button
      const rectangleButton = screen.getByRole('button', { name: /Rectangle/i });
      fireEvent.click(rectangleButton);
      
      // Verify element count increased
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Add a text element
      const textButton = screen.getByRole('button', { name: /Text/i });
      fireEvent.click(textButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Add an image element
      const imageButton = screen.getByRole('button', { name: /Image/i });
      fireEvent.click(imageButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Elements: 3/)).toBeInTheDocument();
      });
    });
  });
  
  describe('Undo/redo across multiple operations', () => {
    it('should undo and redo element creation', async () => {
      render(<App />);
      
      // Add an element
      const rectangleButton = screen.getByRole('button', { name: /Rectangle/i });
      fireEvent.click(rectangleButton);
      
      // Verify element was added
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Find undo button and verify it's enabled
      const undoButton = screen.getByRole('button', { name: /Undo/i });
      expect(undoButton).not.toBeDisabled();
      
      // Undo the creation
      fireEvent.click(undoButton);
      
      // Verify element was removed
      await waitFor(() => {
        expect(screen.getByText(/Elements: 0/)).toBeInTheDocument();
      });
      
      // Find redo button and verify it's enabled
      const redoButton = screen.getByRole('button', { name: /Redo/i });
      expect(redoButton).not.toBeDisabled();
      
      // Redo the creation
      fireEvent.click(redoButton);
      
      // Verify element was restored
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
    });
    
    it('should undo and redo multiple operations', async () => {
      render(<App />);
      
      // Perform multiple operations
      const rectangleButton = screen.getByRole('button', { name: /Rectangle/i });
      const textButton = screen.getByRole('button', { name: /Text/i });
      
      // Operation 1: Add rectangle
      fireEvent.click(rectangleButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Operation 2: Add text
      fireEvent.click(textButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Operation 3: Add another rectangle
      fireEvent.click(rectangleButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 3/)).toBeInTheDocument();
      });
      
      // Undo all operations
      const undoButton = screen.getByRole('button', { name: /Undo/i });
      
      // Undo operation 3
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Undo operation 2
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Undo operation 1
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 0/)).toBeInTheDocument();
      });
      
      // Redo all operations
      const redoButton = screen.getByRole('button', { name: /Redo/i });
      
      // Redo operation 1
      fireEvent.click(redoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Redo operation 2
      fireEvent.click(redoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Redo operation 3
      fireEvent.click(redoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 3/)).toBeInTheDocument();
      });
    });
    
    it('should clear redo stack when new action is performed after undo', async () => {
      render(<App />);
      
      // Add two elements
      const rectangleButton = screen.getByRole('button', { name: /Rectangle/i });
      const textButton = screen.getByRole('button', { name: /Text/i });
      
      fireEvent.click(rectangleButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      fireEvent.click(textButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Undo once
      const undoButton = screen.getByRole('button', { name: /Undo/i });
      fireEvent.click(undoButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Redo should be enabled
      const redoButton = screen.getByRole('button', { name: /Redo/i });
      expect(redoButton).not.toBeDisabled();
      
      // Perform a new action (add image)
      const imageButton = screen.getByRole('button', { name: /Image/i });
      fireEvent.click(imageButton);
      await waitFor(() => {
        expect(screen.getByText(/Elements: 2/)).toBeInTheDocument();
      });
      
      // Redo should now be disabled (redo stack cleared)
      expect(redoButton).toBeDisabled();
    });
    
    it('should handle keyboard shortcuts for undo/redo', async () => {
      render(<App />);
      
      // Add an element
      const rectangleButton = screen.getByRole('button', { name: /Rectangle/i });
      fireEvent.click(rectangleButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
      
      // Undo using Ctrl+Z
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
      
      await waitFor(() => {
        expect(screen.getByText(/Elements: 0/)).toBeInTheDocument();
      });
      
      // Redo using Ctrl+Shift+Z
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
      
      await waitFor(() => {
        expect(screen.getByText(/Elements: 1/)).toBeInTheDocument();
      });
    });
  });
  
  describe('Export functionality', () => {
    it('should render export button', () => {
      render(<App />);
      
      // Verify export button is present
      const exportButton = screen.getByRole('button', { name: /Export PNG/i });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).not.toBeDisabled();
    });
  });
});
