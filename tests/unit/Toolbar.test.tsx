/**
 * Unit tests for Toolbar component
 * 
 * Tests:
 * - Toolbar renders all buttons correctly
 * - Add element buttons trigger correct callbacks
 * - Undo/redo buttons have correct enabled/disabled states
 * - Undo/redo buttons trigger correct callbacks
 * - Export button triggers correct callback
 * 
 * Requirements: 2.1, 2.2, 2.3, 13.1, 13.2, 15.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../src/components/Toolbar';

describe('Toolbar Component', () => {
  it('renders all element creation buttons', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    // Requirement 2.1: Add Rectangle button
    expect(screen.getByText(/Rectangle/i)).toBeTruthy();
    
    // Requirement 2.2: Add Text Block button
    expect(screen.getByText(/Text/i)).toBeTruthy();
    
    // Requirement 2.3: Add Image Placeholder button
    expect(screen.getByText(/Image/i)).toBeTruthy();
  });

  it('renders undo/redo buttons', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    // Requirement 13.1: Undo button
    expect(screen.getByText(/Undo/i)).toBeTruthy();
    
    // Requirement 13.2: Redo button
    expect(screen.getByText(/Redo/i)).toBeTruthy();
  });

  it('renders export button', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    // Requirement 15.1: Export button
    expect(screen.getByText(/Export PNG/i)).toBeTruthy();
  });

  it('calls onAddElement with "rectangle" when Rectangle button is clicked', () => {
    const onAddElement = vi.fn();
    render(
      <Toolbar
        onAddElement={onAddElement}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const rectangleButton = screen.getByText(/Rectangle/i);
    fireEvent.click(rectangleButton);

    expect(onAddElement).toHaveBeenCalledTimes(1);
    expect(onAddElement).toHaveBeenCalledWith('rectangle');
  });

  it('calls onAddElement with "text" when Text button is clicked', () => {
    const onAddElement = vi.fn();
    render(
      <Toolbar
        onAddElement={onAddElement}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const textButton = screen.getByText(/Text/i);
    fireEvent.click(textButton);

    expect(onAddElement).toHaveBeenCalledTimes(1);
    expect(onAddElement).toHaveBeenCalledWith('text');
  });

  it('calls onAddElement with "image" when Image button is clicked', () => {
    const onAddElement = vi.fn();
    render(
      <Toolbar
        onAddElement={onAddElement}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const imageButton = screen.getByText(/Image/i);
    fireEvent.click(imageButton);

    expect(onAddElement).toHaveBeenCalledTimes(1);
    expect(onAddElement).toHaveBeenCalledWith('image');
  });

  it('calls onUndo when Undo button is clicked and canUndo is true', () => {
    const onUndo = vi.fn();
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={true}
        canRedo={false}
        onUndo={onUndo}
        onRedo={vi.fn()}
      />
    );

    const undoButton = screen.getByText(/Undo/i);
    fireEvent.click(undoButton);

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onRedo when Redo button is clicked and canRedo is true', () => {
    const onRedo = vi.fn();
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={true}
        onUndo={vi.fn()}
        onRedo={onRedo}
      />
    );

    const redoButton = screen.getByText(/Redo/i);
    fireEvent.click(redoButton);

    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when Export button is clicked', () => {
    const onExport = vi.fn();
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={onExport}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const exportButton = screen.getByText(/Export PNG/i);
    fireEvent.click(exportButton);

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('disables Undo button when canUndo is false', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const undoButton = screen.getByTitle(/Undo/i);
    expect(undoButton).toBeDisabled();
  });

  it('enables Undo button when canUndo is true', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={true}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const undoButton = screen.getByText(/Undo/i);
    expect(undoButton).not.toBeDisabled();
  });

  it('disables Redo button when canRedo is false', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const redoButton = screen.getByTitle(/Redo/i);
    expect(redoButton).toBeDisabled();
  });

  it('enables Redo button when canRedo is true', () => {
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={true}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const redoButton = screen.getByText(/Redo/i);
    expect(redoButton).not.toBeDisabled();
  });

  it('does not call onUndo when Undo button is clicked and disabled', () => {
    const onUndo = vi.fn();
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={onUndo}
        onRedo={vi.fn()}
      />
    );

    const undoButton = screen.getByText(/Undo/i);
    fireEvent.click(undoButton);

    // Disabled buttons should not trigger callbacks
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('does not call onRedo when Redo button is clicked and disabled', () => {
    const onRedo = vi.fn();
    render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={onRedo}
      />
    );

    const redoButton = screen.getByText(/Redo/i);
    fireEvent.click(redoButton);

    // Disabled buttons should not trigger callbacks
    expect(onRedo).not.toHaveBeenCalled();
  });

  it('renders toolbar with correct structure', () => {
    const { container } = render(
      <Toolbar
        onAddElement={vi.fn()}
        onExport={vi.fn()}
        canUndo={false}
        canRedo={false}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />
    );

    const toolbar = container.querySelector('.toolbar');
    expect(toolbar).toBeTruthy();

    const sections = container.querySelectorAll('.toolbar-section');
    expect(sections).toHaveLength(4); // Shapes, Content, History, Export

    const dividers = container.querySelectorAll('.toolbar-divider');
    expect(dividers).toHaveLength(2); // Two dividers between three sections
  });
});
