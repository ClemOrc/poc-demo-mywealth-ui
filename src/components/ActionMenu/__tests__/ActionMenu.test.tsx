import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionMenu from '../ActionMenu';
import { Agreement, AgreementStatus } from '../../../types';

// Mock agreement data
const mockPendingAgreement: Agreement = {
  id: 'AGR001',
  agreementNumber: 'WM-2024-001',
  clientName: 'John Doe',
  clientId: 'C001',
  agreementType: 'Wealth Management',
  status: AgreementStatus.PENDING_APPROVAL,
  startDate: '2024-01-01',
  totalAmount: 100000,
  currency: 'CAD',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user@example.com',
};

const mockActiveAgreement: Agreement = {
  ...mockPendingAgreement,
  id: 'AGR002',
  status: AgreementStatus.ACTIVE,
};

const mockDraftAgreement: Agreement = {
  ...mockPendingAgreement,
  id: 'AGR003',
  status: AgreementStatus.DRAFT,
};

describe('ActionMenu', () => {
  const mockOnApprove = jest.fn();
  const mockOnDecline = jest.fn();
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the action menu button', () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onApprove={mockOnApprove}
        onDecline={mockOnDecline}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    expect(menuButton).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onApprove={mockOnApprove}
        onDecline={mockOnDecline}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
  });

  it('shows approve and decline options for pending approval agreements', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onApprove={mockOnApprove}
        onDecline={mockOnDecline}
        onView={mockOnView}
        onEdit={mockOnEdit}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });
  });

  it('does not show approve/decline options for active agreements', async () => {
    render(
      <ActionMenu
        agreement={mockActiveAgreement}
        onView={mockOnView}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('Decline')).not.toBeInTheDocument();
    });
  });

  it('shows edit option for draft and pending agreements', async () => {
    const { rerender } = render(
      <ActionMenu
        agreement={mockDraftAgreement}
        onEdit={mockOnEdit}
        onView={mockOnView}
      />
    );

    let menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    // Close menu
    fireEvent.keyDown(document.body, { key: 'Escape' });

    // Test with pending approval
    rerender(
      <ActionMenu
        agreement={mockPendingAgreement}
        onEdit={mockOnEdit}
        onView={mockOnView}
      />
    );

    menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('calls onView when view details is clicked', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onView={mockOnView}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      const viewButton = screen.getByText('View Details');
      fireEvent.click(viewButton);
    });

    expect(mockOnView).toHaveBeenCalledWith(mockPendingAgreement.id);
  });

  it('opens approve confirmation dialog', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onApprove={mockOnApprove}
      />
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    await waitFor(() => {
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Approve Agreement')).toBeInTheDocument();
      expect(screen.getByText(/WM-2024-001/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
  });

  it('calls onApprove when approval is confirmed', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onApprove={mockOnApprove}
      />
    );

    // Open menu
    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    // Click approve
    await waitFor(() => {
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);
    });

    // Confirm approval
    await waitFor(() => {
      const confirmButton = screen.getAllByText('Approve').find(btn => 
        btn.closest('button')?.getAttribute('type') !== 'button'
      );
      if (confirmButton) {
        fireEvent.click(confirmButton);
      }
    });

    expect(mockOnApprove).toHaveBeenCalledWith(mockPendingAgreement.id);
  });

  it('opens decline dialog and requires reason', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onDecline={mockOnDecline}
      />
    );

    // Open menu
    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    // Click decline
    await waitFor(() => {
      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);
    });

    // Check dialog appears
    await waitFor(() => {
      expect(screen.getByText('Decline Agreement')).toBeInTheDocument();
      expect(screen.getByLabelText('Reason for Declining')).toBeInTheDocument();
    });

    // Decline button should be disabled without reason
    const declineConfirmButton = screen.getAllByText('Decline').find(btn =>
      btn.closest('button')?.hasAttribute('disabled')
    );
    expect(declineConfirmButton).toBeDefined();
  });

  it('calls onDecline with reason when decline is confirmed', async () => {
    render(
      <ActionMenu
        agreement={mockPendingAgreement}
        onDecline={mockOnDecline}
      />
    );

    // Open menu
    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    // Click decline
    await waitFor(() => {
      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);
    });

    // Enter reason
    await waitFor(() => {
      const reasonInput = screen.getByLabelText('Reason for Declining');
      fireEvent.change(reasonInput, { target: { value: 'Incomplete documentation' } });
    });

    // Confirm decline
    const declineButtons = screen.getAllByText('Decline');
    const confirmButton = declineButtons[declineButtons.length - 1];
    fireEvent.click(confirmButton);

    expect(mockOnDecline).toHaveBeenCalledWith(mockPendingAgreement.id, 'Incomplete documentation');
  });

  it('prevents event propagation when menu button is clicked', () => {
    const mockRowClick = jest.fn();
    const { container } = render(
      <div onClick={mockRowClick}>
        <ActionMenu
          agreement={mockPendingAgreement}
          onView={mockOnView}
        />
      </div>
    );

    const menuButton = screen.getByLabelText('more actions');
    fireEvent.click(menuButton);

    // Row click should not be triggered
    expect(mockRowClick).not.toHaveBeenCalled();
  });
});