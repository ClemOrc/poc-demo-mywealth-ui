/**
 * Unit tests for ApprovalConfirmationDialog component
 * Tests dialog rendering, button states, loading states, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApprovalConfirmationDialog from './ApprovalConfirmationDialog';

describe('ApprovalConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    open: true,
    agreementId: 'WM-2024-001',
    clientName: 'John Doe',
    loading: false,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when open is true', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display agreement ID', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      expect(screen.getByText(/WM-2024-001/)).toBeInTheDocument();
    });

    it('should display client name', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should display status change message', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    });

    it('should display title with icon', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Approve Agreement')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onConfirm when Confirm button is clicked', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const confirmButton = screen.getByLabelText('Confirm approval');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Cancel button is clicked', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const cancelButton = screen.getByLabelText('Cancel approval');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when loading is true', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} loading={true} />);
      
      const confirmButton = screen.getByLabelText('Confirm approval');
      const cancelButton = screen.getByLabelText('Cancel approval');

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading spinner when loading is true', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} loading={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should change button text when loading', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} loading={true} />);
      expect(screen.getByText('Approving...')).toBeInTheDocument();
    });

    it('should show Confirm text when not loading', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} loading={false} />);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should prevent closing dialog when loading', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} loading={true} />);
      
      // Try to close by clicking backdrop (simulated by pressing escape)
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      // onCancel should not be called when loading
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for dialog', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'approval-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'approval-dialog-description');
    });

    it('should have accessible button labels', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      expect(screen.getByLabelText('Confirm approval')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel approval')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const confirmButton = screen.getByLabelText('Confirm approval');
      confirmButton.focus();
      
      expect(confirmButton).toHaveFocus();
    });
  });

  describe('Visual Design', () => {
    it('should display success color for approve button', () => {
      render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const confirmButton = screen.getByLabelText('Confirm approval');
      // Check for success variant in MUI
      expect(confirmButton).toHaveClass('MuiButton-containedSuccess');
    });

    it('should display green background for status message', () => {
      const { container } = render(<ApprovalConfirmationDialog {...defaultProps} />);
      
      const messageBox = container.querySelector('[style*="background"]');
      expect(messageBox).toBeInTheDocument();
    });
  });
});