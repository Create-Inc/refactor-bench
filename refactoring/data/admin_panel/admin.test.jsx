import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ---- Mocks ----

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

vi.mock('expo-status-bar', () => ({
  StatusBar: () => <div data-testid="status-bar" />,
}));

vi.mock('lucide-react-native', () => ({
  Package: () => <span>PackageIcon</span>,
  Users: () => <span>UsersIcon</span>,
  ArrowLeftRight: () => <span>ArrowLeftRightIcon</span>,
}));

// Alert mock
const mockAlert = vi.fn();
vi.mock('react-native', async () => {
  const rn = await vi.importActual('react-native');
  return {
    ...rn,
    Alert: {
      alert: (...args) => mockAlert(...args),
    },
  };
});

// Products hook
const mockLoadProducts = vi.fn();
const mockDeleteProduct = vi.fn();
let productsState = { products: [], loading: false };

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: productsState.products,
    loading: productsState.loading,
    loadProducts: mockLoadProducts,
    deleteProduct: mockDeleteProduct,
  }),
}));

// Clients hook
const mockLoadClients = vi.fn();
const mockUpdateClientStatus = vi.fn();
const mockDeleteClient = vi.fn();
let clientsState = { clients: [], loading: false };

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    clients: clientsState.clients,
    loading: clientsState.loading,
    loadClients: mockLoadClients,
    updateClientStatus: mockUpdateClientStatus,
    deleteClient: mockDeleteClient,
  }),
}));

// Transactions hook
const mockLoadTransactions = vi.fn();
const mockUpdateTransactionStatus = vi.fn();
let transactionsState = { transactions: [], loading: false };

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: () => ({
    transactions: transactionsState.transactions,
    loading: transactionsState.loading,
    loadTransactions: mockLoadTransactions,
    updateTransactionStatus: mockUpdateTransactionStatus,
  }),
}));

// Child component stubs
vi.mock('@/components/Admin/AdminHeader', () => ({
  AdminHeader: ({ activeTab, onAddProduct, tabs, onTabChange }) => (
    <div data-testid="admin-header">
      <span data-testid="active-tab">{activeTab}</span>
      <button data-testid="add-product-btn" onClick={onAddProduct}>
        Add Product
      </button>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/Admin/ProductItem', () => ({
  ProductItem: ({ product, onEdit, onDelete }) => (
    <div data-testid={`product-${product.id}`}>
      <span>{product.name}</span>
      <button data-testid={`edit-product-${product.id}`} onClick={() => onEdit(product)}>
        Edit
      </button>
      <button data-testid={`delete-product-${product.id}`} onClick={() => onDelete(product)}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('@/components/Admin/ProductForm', () => ({
  ProductForm: ({ product, onSave, onCancel }) => (
    <div data-testid="product-form">
      <span data-testid="editing-product">
        {product ? product.name : 'new'}
      </span>
      <button data-testid="save-product" onClick={onSave}>
        Save
      </button>
      <button data-testid="cancel-product" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

vi.mock('@/components/Admin/ClientItem', () => ({
  ClientItem: ({ client, onEdit, onToggleStatus, onDelete }) => (
    <div data-testid={`client-${client.id}`}>
      <span>{client.name}</span>
      <button
        data-testid={`edit-client-${client.id}`}
        onClick={() => onEdit(client)}
      >
        Edit
      </button>
      <button
        data-testid={`toggle-client-${client.id}`}
        onClick={() => onToggleStatus(client)}
      >
        Toggle
      </button>
      <button
        data-testid={`delete-client-${client.id}`}
        onClick={() => onDelete(client)}
      >
        Delete
      </button>
    </div>
  ),
}));

vi.mock('@/components/Admin/ClientEditModal', () => ({
  ClientEditModal: ({ client, visible, onClose, onSave }) => (
    <div data-testid="client-edit-modal" data-visible={String(visible)}>
      {client && <span data-testid="modal-client-name">{client.name}</span>}
      <button data-testid="modal-close" onClick={onClose}>
        Close
      </button>
      <button data-testid="modal-save" onClick={onSave}>
        Save
      </button>
    </div>
  ),
}));

vi.mock('@/components/Admin/TransactionItem', () => ({
  TransactionItem: ({ transaction, onApprove, onReject }) => (
    <div data-testid={`transaction-${transaction.id}`}>
      <span>{transaction.client_name}</span>
      <span data-testid={`tx-amount-${transaction.id}`}>
        ${transaction.amount}
      </span>
      <button
        data-testid={`approve-tx-${transaction.id}`}
        onClick={() => onApprove(transaction)}
      >
        Approve
      </button>
      <button
        data-testid={`reject-tx-${transaction.id}`}
        onClick={() => onReject(transaction)}
      >
        Reject
      </button>
    </div>
  ),
}));

vi.mock('@/components/Admin/EmptyState', () => ({
  EmptyState: ({ message }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

// ---- Test data ----

const sampleProducts = [
  { id: 'p1', name: 'Widget A', price: 10 },
  { id: 'p2', name: 'Widget B', price: 20 },
];

const sampleClients = [
  { id: 'c1', name: 'Alice', status: 'active', balance: 100 },
  { id: 'c2', name: 'Bob', status: 'suspended', balance: 50 },
];

const sampleTransactions = [
  {
    id: 't1',
    type: 'deposit',
    amount: 200,
    client_name: 'Alice',
    status: 'pending',
  },
  {
    id: 't2',
    type: 'withdrawal',
    amount: 75,
    client_name: 'Bob',
    status: 'pending',
  },
];

// ---- Tests ----

describe('Admin Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsState = { products: sampleProducts, loading: false };
    clientsState = { clients: sampleClients, loading: false };
    transactionsState = {
      transactions: sampleTransactions,
      loading: false,
    };
  });

  async function renderAdmin() {
    const mod = await import('./src/app/admin.jsx');
    const Admin = mod.default;
    return render(<Admin />);
  }

  // ---- Basic rendering ----

  test('exports a default function component', async () => {
    const mod = await import('./src/app/admin.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('renders admin header', async () => {
    await renderAdmin();
    expect(screen.getByTestId('admin-header')).toBeTruthy();
  });

  test('starts on the products tab', async () => {
    await renderAdmin();
    expect(screen.getByTestId('active-tab').textContent).toBe('products');
  });

  test('defines three tabs: Produits, Clients, Transactions', async () => {
    await renderAdmin();
    expect(screen.getByTestId('tab-products')).toBeTruthy();
    expect(screen.getByTestId('tab-clients')).toBeTruthy();
    expect(screen.getByTestId('tab-transactions')).toBeTruthy();
    expect(screen.getByText('Produits')).toBeTruthy();
    expect(screen.getByText('Clients')).toBeTruthy();
    expect(screen.getByText('Transactions')).toBeTruthy();
  });

  // ---- Products tab ----

  test('loads products on initial render', async () => {
    await renderAdmin();
    expect(mockLoadProducts).toHaveBeenCalled();
  });

  test('renders product list', async () => {
    await renderAdmin();
    expect(screen.getByText('Widget A')).toBeTruthy();
    expect(screen.getByText('Widget B')).toBeTruthy();
  });

  test('shows empty state when no products', async () => {
    productsState = { products: [], loading: false };
    await renderAdmin();
    expect(screen.getByTestId('empty-state')).toBeTruthy();
    expect(screen.getByText('Aucun produit')).toBeTruthy();
  });

  test('opens product form when add button is clicked', async () => {
    await renderAdmin();
    expect(screen.queryByTestId('product-form')).toBeNull();
    fireEvent.click(screen.getByTestId('add-product-btn'));
    expect(screen.getByTestId('product-form')).toBeTruthy();
    expect(screen.getByTestId('editing-product').textContent).toBe('new');
  });

  test('opens product form in edit mode when edit is clicked', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('edit-product-p1'));
    expect(screen.getByTestId('product-form')).toBeTruthy();
    expect(screen.getByTestId('editing-product').textContent).toBe('Widget A');
  });

  test('shows delete confirmation alert for product', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('delete-product-p1'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Supprimer le produit',
      expect.stringContaining('Widget A'),
      expect.any(Array)
    );
  });

  test('delete confirmation calls deleteProduct on confirm', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('delete-product-p1'));
    // Simulate pressing the destructive "Supprimer" button
    const alertArgs = mockAlert.mock.calls[0];
    const buttons = alertArgs[2];
    const deleteBtn = buttons.find((b) => b.style === 'destructive');
    deleteBtn.onPress();
    expect(mockDeleteProduct).toHaveBeenCalledWith('p1');
  });

  test('closing product form resets editing state', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('edit-product-p1'));
    expect(screen.getByTestId('product-form')).toBeTruthy();
    fireEvent.click(screen.getByTestId('cancel-product'));
    expect(screen.queryByTestId('product-form')).toBeNull();
  });

  test('saving product form hides form and reloads products', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('add-product-btn'));
    mockLoadProducts.mockClear();
    fireEvent.click(screen.getByTestId('save-product'));
    expect(screen.queryByTestId('product-form')).toBeNull();
    expect(mockLoadProducts).toHaveBeenCalled();
  });

  // ---- Clients tab ----

  test('switches to clients tab and loads clients', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(mockLoadClients).toHaveBeenCalled();
    });
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  test('shows empty state when no clients', async () => {
    clientsState = { clients: [], loading: false };
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Aucun client')).toBeTruthy();
    });
  });

  test('opens client edit modal when edit is clicked', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('edit-client-c1'));
    expect(
      screen.getByTestId('client-edit-modal').getAttribute('data-visible')
    ).toBe('true');
    expect(screen.getByTestId('modal-client-name').textContent).toBe('Alice');
  });

  test('toggle client status shows confirmation alert', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('toggle-client-c1'));
    // Alice is active, so action should be "suspendre"
    expect(mockAlert).toHaveBeenCalledWith(
      expect.stringContaining('Suspendre'),
      expect.stringContaining('Alice'),
      expect.any(Array)
    );
  });

  test('toggle status confirmation calls updateClientStatus', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('toggle-client-c1'));
    const alertArgs = mockAlert.mock.calls[0];
    const buttons = alertArgs[2];
    const actionBtn = buttons.find((b) => b.text !== 'Annuler');
    actionBtn.onPress();
    expect(mockUpdateClientStatus).toHaveBeenCalledWith('c1', 'suspended');
  });

  test('delete client shows confirmation alert', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('delete-client-c2'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Supprimer le client',
      expect.stringContaining('Bob'),
      expect.any(Array)
    );
  });

  // ---- Transactions tab ----

  test('switches to transactions tab and loads transactions', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-transactions'));
    await waitFor(() => {
      expect(mockLoadTransactions).toHaveBeenCalled();
    });
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  test('shows empty state when no transactions', async () => {
    transactionsState = { transactions: [], loading: false };
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-transactions'));
    await waitFor(() => {
      expect(screen.getByText('Aucune transaction')).toBeTruthy();
    });
  });

  test('approve transaction shows confirmation alert', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-transactions'));
    await waitFor(() => {
      expect(screen.getByTestId('approve-tx-t1')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('approve-tx-t1'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Approuver la transaction',
      expect.stringContaining('$200'),
      expect.any(Array)
    );
  });

  test('approve confirmation calls updateTransactionStatus with completed', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-transactions'));
    await waitFor(() => {
      expect(screen.getByTestId('approve-tx-t1')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('approve-tx-t1'));
    const alertArgs = mockAlert.mock.calls[0];
    const buttons = alertArgs[2];
    const approveBtn = buttons.find((b) => b.text === 'Approuver');
    approveBtn.onPress();
    expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('t1', 'completed');
  });

  test('reject transaction shows confirmation and calls status update', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-transactions'));
    await waitFor(() => {
      expect(screen.getByTestId('reject-tx-t2')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('reject-tx-t2'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Rejeter la transaction',
      expect.stringContaining('$75'),
      expect.any(Array)
    );
    const alertArgs = mockAlert.mock.calls[0];
    const buttons = alertArgs[2];
    const rejectBtn = buttons.find((b) => b.style === 'destructive');
    rejectBtn.onPress();
    expect(mockUpdateTransactionStatus).toHaveBeenCalledWith('t2', 'rejected');
  });

  // ---- Modal behavior ----

  test('client edit modal is hidden by default', async () => {
    await renderAdmin();
    expect(
      screen.getByTestId('client-edit-modal').getAttribute('data-visible')
    ).toBe('false');
  });

  test('closing client modal resets editing client', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('edit-client-c1'));
    expect(
      screen.getByTestId('client-edit-modal').getAttribute('data-visible')
    ).toBe('true');
    fireEvent.click(screen.getByTestId('modal-close'));
    expect(
      screen.getByTestId('client-edit-modal').getAttribute('data-visible')
    ).toBe('false');
  });

  test('saving client edit modal closes modal and reloads clients', async () => {
    await renderAdmin();
    fireEvent.click(screen.getByTestId('tab-clients'));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('edit-client-c1'));
    mockLoadClients.mockClear();
    fireEvent.click(screen.getByTestId('modal-save'));
    expect(
      screen.getByTestId('client-edit-modal').getAttribute('data-visible')
    ).toBe('false');
    expect(mockLoadClients).toHaveBeenCalled();
  });
});
