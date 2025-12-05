/**
 * Unit tests for AgreementActionsMenu component
 * Tests context menu visibility, keyboard accessibility, and action callbacks
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgreementActionsMenu from './AgreementActionsMenu';
import { AgreementStatus } from '../../../types';

describe('AgreementActionsMenu', () => {
  const mockOnApprove = jest.fn();
  const mockOnDecline = jest.fn();

  const defaultProps = {
    agreementId: 'WM-2024-001',
    agreementStatus: AgreementStatus.PENDING_APPROVAL,
    clientName: 'John Doe',
    onApprove: mockOnApprove,
    onDecline: mockOnDecline,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility Logic', () => {
    it('should render menu button for PENDING_APPROVAL status', () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      expect(screen.getByLabelText('agreement actions')).toBeInTheDocument();
    });

    it('should NOT render menu button for ACTIVE status', () => {
      render(
        <AgreementActionsMenu
          {...defaultProps}
          agreementStatus={AgreementStatus.ACTIVE}
        />
      );
      expect(screen.queryByLabelText('agreement actions')).not.toBeInTheDocument();
    });

    it('should NOT render menu button for DRAFT status', () => {
      render(
        <AgreementActionsMenu
          {...defaultProps}
          agreementStatus={AgreementStatus.DRAFT}
        />
      );
      expect(screen.queryByLabelText('agreement actions')).not.toBeInTheDocument();
    });

    it('should NOT render menu button for EXPIRED status', () => {
      render(
        <AgreementActionsMenu
          {...defaultProps}
          agreementStatus={AgreementStatus.EXPIRED}
        />
      );
      expect(screen.queryByLabelText('agreement actions')).not.toBeInTheDocument();
    });
  });

  describe('Menu Interaction', () => {
    it('should open menu when button is clicked', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Decline')).toBeInTheDocument();
      });
    });

    it('should close menu when clicking outside', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });

      // Click outside (on backdrop)
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      });
    });
  });

  describe('Approve Action', () => {
    it('should call onApprove with correct parameters when Approve is clicked', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });

      const approveMenuItem = screen.getByLabelText('Approve agreement');
      fireEvent.click(approveMenuItem);

      expect(mockOnApprove).toHaveBeenCalledTimes(1);
      expect(mockOnApprove).toHaveBeenCalledWith('WM-2024-001', 'John Doe');
    });

    it('should close menu after approving', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });

      const approveMenuItem = screen.getByLabelText('Approve agreement');
      fireEvent.click(approveMenuItem);

      await waitFor(() => {
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      });
    });
  });

  describe('Decline Action', () => {
    it('should call onDecline with correct parameters when Decline is clicked', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Decline')).toBeInTheDocument();
      });

      const declineMenuItem = screen.getByLabelText('Decline agreement');
      fireEvent.click(declineMenuItem);

      expect(mockOnDecline).toHaveBeenCalledTimes(1);
      expect(mockOnDecline).toHaveBeenCalledWith('WM-2024-001', 'John Doe');
    });

    it('should close menu after declining', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Decline')).toBeInTheDocument();
      });

      const declineMenuItem = screen.getByLabelText('Decline agreement');
      fireEvent.click(declineMenuItem);

      await waitFor(() => {
        expect(screen.queryByText('Decline')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when menu opens', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have labels on menu items for screen readers', async () => {
      render(<AgreementActionsMenu {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Approve agreement')).toBeInTheDocument();
        expect(screen.getByLabelText('Decline agreement')).toBeInTheDocument();
      });
    });
  });

  describe('Event Propagation', () => {
    it('should stop propagation when menu button is clicked', () => {
      const handleRowClick = jest.fn();
      const { container } = render(
        <div onClick={handleRowClick}>
          <AgreementActionsMenu {...defaultProps} />
        </div>
      );
      
      const menuButton = screen.getByLabelText('agreement actions');
      fireEvent.click(menuButton);

      // Row click should not be called because of stopPropagation
      expect(handleRowClick).not.toHaveBeenCalled();
    });
  });
});