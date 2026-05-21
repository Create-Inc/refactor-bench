import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountCodesTab } from './src/app/AccountCodesTab.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: (props) => <svg data-testid="plus-icon" {...props} />,
}));

// Mock LoadingSpinner
vi.mock('./src/app/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock fetch
global.fetch = vi.fn();

const mockAccountCodes = [
  {
    id: 1,
    code: 'GL-1001-ENG',
    name: 'Engineering Operations',
    department: 'Engineering',
    description: 'Costs for engineering team',
    is_active: true,
  },
  {
    id: 2,
    code: 'GL-2001-MKT',
    name: 'Marketing Budget',
    department: 'Marketing',
    description: 'Marketing expenses',
    is_active: false,
  },
  {
    id: 3,
    code: 'GL-3001-HR',
    name: 'HR Payroll',
    department: '',
    description: '',
    is_active: true,
  },
];

describe('AccountCodesTab Component', () => {
  let onRefresh;
  let setSaveMessage;
  let setError;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    onRefresh = vi.fn();
    setSaveMessage = vi.fn();
    setError = vi.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderComponent(props = {}) {
    return render(
      <AccountCodesTab
        accountCodes={mockAccountCodes}
        loading={false}
        onRefresh={onRefresh}
        setSaveMessage={setSaveMessage}
        setError={setError}
        {...props}
      />
    );
  }

  describe('Rendering', () => {
    test('renders the heading and description', () => {
      renderComponent();
      expect(screen.getByText('Account Codes')).toBeInTheDocument();
      expect(
        screen.getByText('Manage GL account codes for cost allocation')
      ).toBeInTheDocument();
    });

    test('renders the Add Account Code button', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: /Add Account Code/i })
      ).toBeInTheDocument();
    });

    test('renders table column headers', () => {
      renderComponent();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('renders each account code row', () => {
      renderComponent();
      expect(screen.getByText('GL-1001-ENG')).toBeInTheDocument();
      expect(screen.getByText('Engineering Operations')).toBeInTheDocument();
      expect(screen.getByText('GL-2001-MKT')).toBeInTheDocument();
      expect(screen.getByText('Marketing Budget')).toBeInTheDocument();
      expect(screen.getByText('GL-3001-HR')).toBeInTheDocument();
    });

    test('shows loading spinner when loading is true', () => {
      renderComponent({ loading: true });
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('displays Active status for active codes', () => {
      renderComponent();
      const activeStatuses = screen.getAllByText('Active');
      expect(activeStatuses.length).toBe(2);
    });

    test('displays Inactive status for inactive codes', () => {
      renderComponent();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    test('shows em dash for empty department and description', () => {
      renderComponent();
      // GL-3001-HR has no department and no description
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });

    test('renders Deactivate button for active codes and Activate for inactive codes', () => {
      renderComponent();
      const deactivateButtons = screen.getAllByText('Deactivate');
      expect(deactivateButtons.length).toBe(2);
      const activateButtons = screen.getAllByText('Activate');
      expect(activateButtons.length).toBe(1);
    });
  });

  describe('Add Modal', () => {
    test('opens add modal when clicking Add Account Code button', () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );
      // The modal has a heading "Add Account Code" (h3)
      expect(
        screen.getByRole('heading', { name: 'Add Account Code' })
      ).toBeInTheDocument();
    });

    test('modal displays form fields with correct labels', () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );
      expect(screen.getByText('Code *')).toBeInTheDocument();
      expect(screen.getByText('Name *')).toBeInTheDocument();
      expect(screen.getAllByText('Department')).toHaveLength(2);
      expect(screen.getAllByText('Description')).toHaveLength(2);
    });

    test('closes modal when Cancel is clicked', () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );
      expect(
        screen.getByRole('heading', { name: 'Add Account Code' })
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(
        screen.queryByRole('heading', { name: 'Add Account Code' })
      ).not.toBeInTheDocument();
    });

    test('closes modal when clicking the backdrop overlay', () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );

      // Click the backdrop (the first div with fixed inset-0)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black');
      fireEvent.click(backdrop);

      expect(
        screen.queryByRole('heading', { name: 'Add Account Code' })
      ).not.toBeInTheDocument();
    });

    test('submits form data via POST and calls onRefresh on success', async () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );

      fireEvent.change(screen.getByPlaceholderText('e.g., GL-1001-ENG'), {
        target: { value: 'GL-9999-NEW' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Engineering Operations'),
        {
          target: { value: 'New Code' },
        }
      );

      // Click the submit button (the second "Add Account Code" button inside the modal)
      const buttons = screen.getAllByRole('button', {
        name: /Add Account Code/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/account-codes',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
        expect(setSaveMessage).toHaveBeenCalledWith(
          'Account code added successfully!'
        );
      });
    });

    test('sets error when API returns non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Duplicate code' }),
      });

      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );

      fireEvent.change(screen.getByPlaceholderText('e.g., GL-1001-ENG'), {
        target: { value: 'GL-DUP' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Engineering Operations'),
        {
          target: { value: 'Dup' },
        }
      );

      const buttons = screen.getAllByRole('button', {
        name: /Add Account Code/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith('Duplicate code');
      });
    });

    test('sets fallback error when API returns non-ok with no error field', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );

      fireEvent.change(screen.getByPlaceholderText('e.g., GL-1001-ENG'), {
        target: { value: 'GL-X' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Engineering Operations'),
        {
          target: { value: 'X' },
        }
      );

      const buttons = screen.getAllByRole('button', {
        name: /Add Account Code/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith('Failed to add account code');
      });
    });

    test('sets error when fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();
      fireEvent.click(
        screen.getByRole('button', { name: /Add Account Code/i })
      );

      fireEvent.change(screen.getByPlaceholderText('e.g., GL-1001-ENG'), {
        target: { value: 'GL-ERR' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Engineering Operations'),
        {
          target: { value: 'Error' },
        }
      );

      const buttons = screen.getAllByRole('button', {
        name: /Add Account Code/i,
      });
      fireEvent.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith('Failed to add account code');
      });
    });
  });

  describe('Toggle Active/Inactive', () => {
    test('calls PATCH to deactivate an active code', async () => {
      renderComponent();
      const deactivateButtons = screen.getAllByText('Deactivate');
      fireEvent.click(deactivateButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/account-codes/1',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ is_active: false }),
          })
        );
      });

      await waitFor(() => {
        expect(setSaveMessage).toHaveBeenCalledWith('Account code deactivated');
        expect(onRefresh).toHaveBeenCalled();
      });
    });

    test('calls PATCH to activate an inactive code', async () => {
      renderComponent();
      fireEvent.click(screen.getByText('Activate'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/account-codes/2',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ is_active: true }),
          })
        );
      });

      await waitFor(() => {
        expect(setSaveMessage).toHaveBeenCalledWith('Account code activated');
      });
    });

    test('sets error when toggle API call fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      renderComponent();
      fireEvent.click(screen.getByText('Activate'));

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith('Failed to update account code');
      });
    });

    test('sets error when toggle fetch throws', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();
      fireEvent.click(screen.getByText('Activate'));

      await waitFor(() => {
        expect(setError).toHaveBeenCalledWith('Failed to update account code');
      });
    });

    test('clears save message after timeout', async () => {
      renderComponent();
      fireEvent.click(screen.getByText('Activate'));

      await waitFor(() => {
        expect(setSaveMessage).toHaveBeenCalledWith('Account code activated');
      });

      vi.advanceTimersByTime(3000);
      expect(setSaveMessage).toHaveBeenCalledWith('');
    });
  });
});
