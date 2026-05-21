import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// -- Mock hooks --

const mockPayments = [
  { id: 'p1', amount: 500, status: 'completed', from_user_id: 'user-1', to_user_id: 'user-2' },
  { id: 'p2', amount: 300, status: 'pending', from_user_id: 'user-2', to_user_id: 'user-1' },
];

const mockRecurring = [
  { id: 'r1', label: 'Monthly Fee', amount: 100, frequency: 'monthly', day_of_period: 1, is_active: true, notes: '' },
];

const mockOverdue = [
  { id: 'o1', label: 'Overdue Fee', amount: 200, toUserId: 'user-2', paymentType: 'franchise_fee', frequency: 'monthly' },
];

const mockUpcoming = [
  { id: 'u1', label: 'Next Payment', amount: 150, toUserId: 'user-2', paymentType: 'payroll', frequency: 'weekly' },
];

vi.mock('@/hooks/usePaymentsData', () => ({
  usePaymentsData: () => ({
    payments: mockPayments,
    recurring: mockRecurring,
    overduePayments: mockOverdue,
    upcomingPayments: mockUpcoming,
    isLoading: false,
  }),
}));

const mockTotals = { totalPaid: 500, totalReceived: 300, netBalance: 200 };
vi.mock('@/hooks/usePaymentTotals', () => ({
  usePaymentTotals: () => mockTotals,
}));

const mockCreatePaymentMutate = vi.fn();
const mockUpdatePaymentStatusMutate = vi.fn();
const mockDeletePaymentMutate = vi.fn();
const mockSendRemindersMutate = vi.fn();

vi.mock('@/hooks/usePaymentMutations', () => ({
  usePaymentMutations: () => ({
    createPaymentMutation: { mutate: mockCreatePaymentMutate, isPending: false },
    updatePaymentStatusMutation: { mutate: mockUpdatePaymentStatusMutate, isPending: false },
    deletePaymentMutation: { mutate: mockDeletePaymentMutate, isPending: false },
    sendRemindersMutation: { mutate: mockSendRemindersMutate, isPending: false },
  }),
}));

const mockCreateRecurringMutate = vi.fn();
const mockUpdateRecurringMutate = vi.fn();
const mockDeleteRecurringMutate = vi.fn();

vi.mock('@/hooks/useRecurringMutations', () => ({
  useRecurringMutations: () => ({
    createRecurringMutation: { mutate: mockCreateRecurringMutate, isPending: false },
    updateRecurringMutation: { mutate: mockUpdateRecurringMutate, isPending: false },
    deleteRecurringMutation: { mutate: mockDeleteRecurringMutate, isPending: false },
  }),
}));

// -- Mock child components --

vi.mock('./src/app/PaymentsHub/PaymentsHeader', () => ({
  PaymentsHeader: ({ onMakePayment, onSetupRecurring, onSendReminders, onExport }) => (
    <div data-testid="payments-header">
      <button data-testid="make-payment-btn" onClick={onMakePayment}>Make Payment</button>
      <button data-testid="setup-recurring-btn" onClick={onSetupRecurring}>Setup Recurring</button>
      <button data-testid="send-reminders-btn" onClick={onSendReminders}>Send Reminders</button>
      <button data-testid="export-btn" onClick={onExport}>Export</button>
    </div>
  ),
}));

vi.mock('./src/app/PaymentsHub/AlertBanner', () => ({
  AlertBanner: ({ type, message, onClose }) =>
    message ? (
      <div data-testid={`alert-${type}`}>
        <span>{message}</span>
        {onClose && <button data-testid={`close-alert-${type}`} onClick={onClose}>Close</button>}
      </div>
    ) : null,
}));

vi.mock('./src/app/PaymentsHub/SummaryCards', () => ({
  SummaryCards: ({ totals, isLoading }) => (
    <div data-testid="summary-cards">
      <span data-testid="total-paid">{totals.totalPaid}</span>
      <span data-testid="total-received">{totals.totalReceived}</span>
      <span data-testid="net-balance">{totals.netBalance}</span>
    </div>
  ),
}));

vi.mock('./src/app/PaymentsHub/OverdueSection', () => ({
  OverdueSection: ({ overduePayments, upcomingPayments, onPayNow, onSendReminders }) => (
    <div data-testid="overdue-section">
      <span data-testid="overdue-count">{overduePayments.length}</span>
      <span data-testid="upcoming-count">{upcomingPayments.length}</span>
      {overduePayments.map((item) => (
        <button key={item.id} data-testid={`pay-now-${item.id}`} onClick={() => onPayNow(item)}>
          Pay Now {item.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('./src/app/PaymentsHub/RecurringPaymentsSection', () => ({
  RecurringPaymentsSection: ({ recurring, showSection, onToggleSection, onEdit, onDelete }) => (
    <div data-testid="recurring-section">
      <button data-testid="toggle-recurring" onClick={onToggleSection}>Toggle</button>
      <span data-testid="recurring-visible">{String(showSection)}</span>
      {recurring.map((item) => (
        <div key={item.id} data-testid={`recurring-${item.id}`}>
          <span>{item.label}</span>
          <button data-testid={`edit-recurring-${item.id}`} onClick={() => onEdit(item)}>Edit</button>
          <button data-testid={`delete-recurring-${item.id}`} onClick={() => onDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./src/app/PaymentsHub/PaymentHistorySection', () => ({
  PaymentHistorySection: ({ payments, statusFilter, onStatusFilterChange, onUpdateStatus, onDelete }) => (
    <div data-testid="payment-history">
      <span data-testid="payment-count">{payments.length}</span>
      <span data-testid="status-filter">{statusFilter}</span>
      <button data-testid="filter-pending" onClick={() => onStatusFilterChange('pending')}>Filter Pending</button>
      {payments.map((p) => (
        <div key={p.id} data-testid={`payment-${p.id}`}>
          <button data-testid={`delete-payment-${p.id}`} onClick={() => onDelete(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./src/app/PaymentsHub/OneOffPaymentModal', () => ({
  OneOffPaymentModal: ({ open, onClose, formData, onFormChange, onSubmit }) =>
    open ? (
      <div data-testid="one-off-modal">
        <span data-testid="one-off-amount">{formData.amount}</span>
        <span data-testid="one-off-type">{formData.paymentType}</span>
        <button data-testid="one-off-submit" onClick={onSubmit}>Submit</button>
        <button data-testid="one-off-close" onClick={onClose}>Close</button>
        <button data-testid="one-off-change-amount" onClick={() => onFormChange('amount', '999')}>Set Amount</button>
      </div>
    ) : null,
}));

vi.mock('./src/app/PaymentsHub/RecurringPaymentModal', () => ({
  RecurringPaymentModal: ({ open, onClose, formData, onSubmit }) =>
    open ? (
      <div data-testid="recurring-modal">
        <span data-testid="recurring-form-frequency">{formData.frequency}</span>
        <button data-testid="recurring-submit" onClick={onSubmit}>Submit</button>
        <button data-testid="recurring-close" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('./src/app/PaymentsHub/EditRecurringModal', () => ({
  EditRecurringModal: ({ open, onClose, formData, onSubmit }) =>
    open ? (
      <div data-testid="edit-recurring-modal">
        <span data-testid="edit-recurring-label">{formData?.label}</span>
        <button data-testid="edit-recurring-submit" onClick={onSubmit}>Save</button>
        <button data-testid="edit-recurring-close" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('./src/app/PaymentsHub/ExportModal', () => ({
  ExportModal: ({ open, onClose }) =>
    open ? (
      <div data-testid="export-modal">
        <button data-testid="export-close" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

import PaymentsHub from './src/app/PaymentsHub.jsx';

const defaultProps = {
  instructors: [
    { id: 'user-2', name: 'Instructor A' },
    { id: 'user-3', name: 'Instructor B' },
  ],
  currentUserId: 'user-1',
  isOwner: true,
};

describe('PaymentsHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Initial render --

  test('renders payments header', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('payments-header')).toBeTruthy();
  });

  test('renders summary cards with totals', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('summary-cards')).toBeTruthy();
    expect(screen.getByTestId('total-paid').textContent).toBe('500');
    expect(screen.getByTestId('net-balance').textContent).toBe('200');
  });

  test('renders overdue section with overdue and upcoming counts', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('overdue-count').textContent).toBe('1');
    expect(screen.getByTestId('upcoming-count').textContent).toBe('1');
  });

  test('renders recurring payments section visible by default', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('recurring-visible').textContent).toBe('true');
  });

  test('renders payment history section with all status filter', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('status-filter').textContent).toBe('all');
    expect(screen.getByTestId('payment-count').textContent).toBe('2');
  });

  // -- Modal opening --

  test('opens one-off payment modal when Make Payment is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.queryByTestId('one-off-modal')).toBeNull();
    fireEvent.click(screen.getByTestId('make-payment-btn'));
    expect(screen.getByTestId('one-off-modal')).toBeTruthy();
    // Default form values
    expect(screen.getByTestId('one-off-type').textContent).toBe('payroll');
  });

  test('opens recurring payment modal when Setup Recurring is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.queryByTestId('recurring-modal')).toBeNull();
    fireEvent.click(screen.getByTestId('setup-recurring-btn'));
    expect(screen.getByTestId('recurring-modal')).toBeTruthy();
    expect(screen.getByTestId('recurring-form-frequency').textContent).toBe('monthly');
  });

  test('opens export modal when Export is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.queryByTestId('export-modal')).toBeNull();
    fireEvent.click(screen.getByTestId('export-btn'));
    expect(screen.getByTestId('export-modal')).toBeTruthy();
  });

  test('closes one-off modal when close is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('make-payment-btn'));
    expect(screen.getByTestId('one-off-modal')).toBeTruthy();
    fireEvent.click(screen.getByTestId('one-off-close'));
    expect(screen.queryByTestId('one-off-modal')).toBeNull();
  });

  // -- Pay Now pre-fills form --

  test('clicking Pay Now on overdue item opens one-off modal pre-filled', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('pay-now-o1'));
    expect(screen.getByTestId('one-off-modal')).toBeTruthy();
    expect(screen.getByTestId('one-off-amount').textContent).toBe('200');
    expect(screen.getByTestId('one-off-type').textContent).toBe('franchise_fee');
  });

  // -- Edit recurring --

  test('opens edit recurring modal with correct data when Edit is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('edit-recurring-r1'));
    expect(screen.getByTestId('edit-recurring-modal')).toBeTruthy();
    expect(screen.getByTestId('edit-recurring-label').textContent).toBe('Monthly Fee');
  });

  // -- Mutation calls --

  test('calls send reminders mutation when Send Reminders is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('send-reminders-btn'));
    expect(mockSendRemindersMutate).toHaveBeenCalled();
  });

  test('calls delete recurring mutation when Delete is clicked', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('delete-recurring-r1'));
    expect(mockDeleteRecurringMutate).toHaveBeenCalledWith('r1');
  });

  test('calls delete payment mutation when Delete is clicked in history', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('delete-payment-p1'));
    expect(mockDeletePaymentMutate).toHaveBeenCalledWith('p1');
  });

  // -- Toggle recurring section --

  test('toggles recurring section visibility', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.getByTestId('recurring-visible').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('toggle-recurring'));
    expect(screen.getByTestId('recurring-visible').textContent).toBe('false');
  });

  // -- Form changes --

  test('updates one-off form fields', () => {
    render(<PaymentsHub {...defaultProps} />);
    fireEvent.click(screen.getByTestId('make-payment-btn'));
    fireEvent.click(screen.getByTestId('one-off-change-amount'));
    expect(screen.getByTestId('one-off-amount').textContent).toBe('999');
  });

  // -- No alerts initially --

  test('does not show alert banners initially', () => {
    render(<PaymentsHub {...defaultProps} />);
    expect(screen.queryByTestId('alert-error')).toBeNull();
    expect(screen.queryByTestId('alert-success')).toBeNull();
  });

  // -- Component export --

  test('exports a default function component', () => {
    expect(PaymentsHub).toBeDefined();
    expect(typeof PaymentsHub).toBe('function');
  });
});
