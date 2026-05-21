import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock React Native primitives ──
vi.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    ScrollView: ({ children, ...props }) => <div {...props}>{children}</div>,
    TouchableOpacity: ({ children, onPress, disabled, ...props }) => (
      <button onClick={disabled ? undefined : onPress} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    TextInput: ({ value, onChangeText, placeholder, ...props }) => (
      <input
        value={value || ''}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    ),
    Modal: ({ visible, children, transparent }) =>
      visible ? <div data-testid="modal">{children}</div> : null,
    Alert: { alert: vi.fn() },
  };
});

vi.mock('lucide-react-native', () => ({
  X: () => null,
  DollarSign: () => null,
  FileText: () => null,
  Send: () => null,
  AlertTriangle: () => null,
}));

// ── Helpers ──
const defaultProps = {
  visible: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  isSubmitting: false,
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

async function renderModal(propOverrides = {}) {
  const mod = await import('./src/app/BorrowModal.jsx');
  const { BorrowModal } = mod;
  return render(<BorrowModal {...defaultProps} {...propOverrides} />);
}

describe('BorrowModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onClose = vi.fn();
    defaultProps.onSubmit = vi.fn();
  });

  // ── Visibility ──
  test('renders modal content when visible is true', async () => {
    await renderModal();
    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByText('Request a Loan')).toBeTruthy();
  });

  test('does not render when visible is false', async () => {
    await renderModal({ visible: false });
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  // ── Title ──
  test('displays "Request a Loan" title', async () => {
    await renderModal();
    expect(screen.getByText('Request a Loan')).toBeTruthy();
  });

  // ── Amount input ──
  test('renders amount input section with Amount label', async () => {
    await renderModal();
    expect(screen.getByText('Amount')).toBeTruthy();
  });

  test('renders amount input with placeholder "0"', async () => {
    await renderModal();
    expect(screen.getByPlaceholderText('0')).toBeTruthy();
  });

  test('renders dollar sign symbol', async () => {
    await renderModal();
    expect(screen.getByText('$')).toBeTruthy();
  });

  // ── Reason input ──
  test('renders reason input section with Reason label', async () => {
    await renderModal();
    expect(screen.getByText('Reason')).toBeTruthy();
  });

  test('renders reason input with placeholder', async () => {
    await renderModal();
    expect(
      screen.getByPlaceholderText('Why do you need this loan?')
    ).toBeTruthy();
  });

  // ── Submit button ──
  test('renders "Post Request" button', async () => {
    await renderModal();
    expect(screen.getByText('Post Request')).toBeTruthy();
  });

  test('shows "Posting..." when isSubmitting is true', async () => {
    await renderModal({ isSubmitting: true });
    expect(screen.getByText('Posting...')).toBeTruthy();
    expect(screen.queryByText('Post Request')).toBeNull();
  });

  // ── Close button ──
  test('calls onClose when close button is pressed', async () => {
    const onClose = vi.fn();
    await renderModal({ onClose });
    // The X close button is the first close control - find the wrapping button
    // We identify via the fact that clicking it calls onClose
    // The close button area is on the header row
    const buttons = screen.getAllByRole('button');
    // Click the X button (first button in the header area)
    for (const btn of buttons) {
      fireEvent.click(btn);
      if (onClose.mock.calls.length > 0) break;
    }
    expect(onClose).toHaveBeenCalled();
  });

  // ── Safety note ──
  test('displays late repayment warning', async () => {
    await renderModal();
    expect(
      screen.getByText(/Late repayment will lower your trust score/)
    ).toBeTruthy();
    expect(screen.getByText(/75 points/)).toBeTruthy();
  });

  // ── Validation: empty amount ──
  test('shows alert when submitting with empty amount', async () => {
    const { Alert } = await import('react-native');
    await renderModal();
    fireEvent.click(screen.getByText('Post Request'));
    expect(Alert.alert).toHaveBeenCalledWith('Invalid', 'Enter a valid amount.');
  });

  // ── Validation: missing reason ──
  test('shows alert when submitting with amount but no reason', async () => {
    const { Alert } = await import('react-native');
    await renderModal();
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(screen.getByText('Post Request'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Missing',
      'Add a reason for your request.'
    );
  });

  // ── Successful submission ──
  test('calls onSubmit with parsed amount and trimmed reason on valid input', async () => {
    const onSubmit = vi.fn();
    await renderModal({ onSubmit });
    const amountInput = screen.getByPlaceholderText('0');
    const reasonInput = screen.getByPlaceholderText('Why do you need this loan?');
    fireEvent.change(amountInput, { target: { value: '250' } });
    fireEvent.change(reasonInput, { target: { value: '  Rent payment  ' } });
    fireEvent.click(screen.getByText('Post Request'));
    expect(onSubmit).toHaveBeenCalledWith({
      amount: 250,
      reason: 'Rent payment',
    });
  });

  // ── Interest calculator ──
  test('shows estimated repayment when valid amount is entered', async () => {
    await renderModal();
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '200' } });
    expect(screen.getByText('Estimated Repayment')).toBeTruthy();
    expect(screen.getByText('$200.00')).toBeTruthy();
    expect(screen.getByText('+$20.00')).toBeTruthy();
    expect(screen.getByText('$220.00')).toBeTruthy();
    expect(screen.getByText('Total to repay')).toBeTruthy();
  });

  test('shows interest rate label (~10%)', async () => {
    await renderModal();
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(screen.getByText('Interest (~10%)')).toBeTruthy();
  });

  test('shows lender rate disclaimer', async () => {
    await renderModal();
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '100' } });
    expect(
      screen.getByText('Final rate depends on the lender who funds your request')
    ).toBeTruthy();
  });

  test('does not show estimated repayment when amount is empty', async () => {
    await renderModal();
    expect(screen.queryByText('Estimated Repayment')).toBeNull();
  });

  // ── Named export check ──
  test('exports BorrowModal as a named export', async () => {
    const mod = await import('./src/app/BorrowModal.jsx');
    expect(mod.BorrowModal).toBeDefined();
    expect(typeof mod.BorrowModal).toBe('function');
  });

  // ── Loan amount label ──
  test('shows "Loan amount" in the calculator', async () => {
    await renderModal();
    const amountInput = screen.getByPlaceholderText('0');
    fireEvent.change(amountInput, { target: { value: '50' } });
    expect(screen.getByText('Loan amount')).toBeTruthy();
  });

  // ── Re-render stability ──
  test('can be re-rendered without errors', async () => {
    const mod = await import('./src/app/BorrowModal.jsx');
    const { BorrowModal } = mod;
    const { rerender } = render(<BorrowModal {...defaultProps} />);
    expect(() => rerender(<BorrowModal {...defaultProps} />)).not.toThrow();
  });
});
