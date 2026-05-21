import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/app/api/utils/sql', () => {
  const sqlFn = vi.fn();
  sqlFn.transaction = vi.fn();
  return { default: sqlFn };
});

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { GET, POST } from './src/app/route.js';
import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

// Helper to build a Request object
function makeGetRequest(url = 'http://localhost/api/wallet') {
  return new Request(url, { method: 'GET' });
}

function makePostRequest(body) {
  return new Request('http://localhost/api/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Wallet API — GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 when not authenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  test('should return 401 when session has no user id', async () => {
    auth.mockResolvedValue({ user: {} });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  test('should return 404 when user not found in database', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });

    // First call: look up user by email => found
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    // Second call: get wallet_balance => not found
    sql.mockResolvedValueOnce([]);

    const res = await GET(makeGetRequest());
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  test('should return balance, transactions, and pagination on success', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });

    // Look up user by email
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    // Get wallet balance
    sql.mockResolvedValueOnce([{ wallet_balance: '150.50' }]);
    // Get transactions
    sql.mockResolvedValueOnce([
      {
        id: 't1',
        transaction_type: 'deposit',
        amount: '100.00',
        direction: 'credit',
        status: 'completed',
        description: 'Test deposit',
        created_at: '2024-01-01',
        completed_at: '2024-01-01',
      },
    ]);
    // Get count
    sql.mockResolvedValueOnce([{ total: '5' }]);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.balance).toBe(150.50);
    expect(data.transactions).toHaveLength(1);
    expect(data.transactions[0].type).toBe('deposit');
    expect(data.transactions[0].amount).toBe(100);
    expect(data.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 5,
      hasMore: false,
    });
  });

  test('should create new user record if not found by email', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'new@example.com', name: 'New User' } });

    // Look up user by email => not found
    sql.mockResolvedValueOnce([undefined]);
    // Create new user => returns id
    sql.mockResolvedValueOnce([{ id: 'new-uuid' }]);
    // Get wallet balance
    sql.mockResolvedValueOnce([{ wallet_balance: '500.00' }]);
    // Get transactions
    sql.mockResolvedValueOnce([]);
    // Get count
    sql.mockResolvedValueOnce([{ total: '0' }]);

    const res = await GET(makeGetRequest());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.balance).toBe(500);
  });

  test('should respect page and limit query params', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    sql.mockResolvedValueOnce([{ wallet_balance: '100' }]);
    sql.mockResolvedValueOnce([]);
    sql.mockResolvedValueOnce([{ total: '50' }]);

    const req = makeGetRequest('http://localhost/api/wallet?page=3&limit=10');
    const res = await GET(req);
    const data = await res.json();

    expect(data.pagination.page).toBe(3);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.hasMore).toBe(true); // offset 20 + 10 < 50
  });

  test('should return 500 on unexpected error', async () => {
    auth.mockRejectedValue(new Error('Auth service down'));

    const res = await GET(makeGetRequest());
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});

describe('Wallet API — POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 when not authenticated', async () => {
    auth.mockResolvedValue(null);

    const res = await POST(makePostRequest({ action: 'deposit', amount: 50 }));
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  test('should return 400 for invalid action', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]); // user lookup

    const res = await POST(makePostRequest({ action: 'refund', amount: 50 }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid action');
  });

  // ── Deposit ──

  test('should return 400 for deposit with invalid amount', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);

    const res = await POST(makePostRequest({ action: 'deposit', amount: -10, bankAccountId: 'ba-1' }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid amount');
  });

  test('should return 400 for deposit without bank account', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);

    const res = await POST(makePostRequest({ action: 'deposit', amount: 100 }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Bank account ID required');
  });

  test('should return 409 for duplicate deposit (idempotency key)', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]); // user lookup
    sql.mockResolvedValueOnce([{ id: 'existing-tx' }]); // duplicate check

    const res = await POST(makePostRequest({
      action: 'deposit',
      amount: 100,
      bankAccountId: 'ba-1',
      idempotencyKey: 'dup-key',
    }));
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toBe('Duplicate transaction');
  });

  test('should return 404 for deposit with non-existent bank account', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]); // user lookup
    sql.mockResolvedValueOnce([]); // no duplicate
    sql.mockResolvedValueOnce([]); // bank account not found

    const res = await POST(makePostRequest({ action: 'deposit', amount: 100, bankAccountId: 'ba-999' }));
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe('Bank account not found');
  });

  test('should return 400 for deposit with unverified bank account', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    sql.mockResolvedValueOnce([]); // no duplicate
    sql.mockResolvedValueOnce([{ id: 'ba-1', bank_name: 'Chase', last_four: '1234', verification_status: 'pending' }]);

    const res = await POST(makePostRequest({ action: 'deposit', amount: 100, bankAccountId: 'ba-1' }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Bank account not verified');
  });

  // ── Withdrawal ──

  test('should return 400 for withdrawal with insufficient funds', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]); // user lookup
    sql.mockResolvedValueOnce([]); // no duplicate
    sql.mockResolvedValueOnce([{ wallet_balance: '50.00' }]); // user balance

    const res = await POST(makePostRequest({ action: 'withdraw', amount: 100, bankAccountId: 'ba-1' }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Insufficient funds');
  });

  // ── P2P Transfer ──

  test('should return 400 for transfer without sender or receiver', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);

    const res = await POST(makePostRequest({ action: 'transfer', amount: 50 }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Both sender and receiver required');
  });

  test('should return 400 for transfer to yourself', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);

    const res = await POST(makePostRequest({
      action: 'transfer',
      amount: 50,
      fromUserId: 'uuid-1',
      toUserId: 'uuid-1',
    }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Cannot transfer to yourself');
  });

  test('should return 404 when transfer sender not found', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]); // user lookup
    sql.mockResolvedValueOnce([]); // no debit duplicate
    sql.mockResolvedValueOnce([]); // no credit duplicate
    sql.mockResolvedValueOnce([]); // sender not found

    const res = await POST(makePostRequest({
      action: 'transfer',
      amount: 50,
      fromUserId: 'from-1',
      toUserId: 'to-1',
    }));
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe('Sender not found');
  });

  test('should return 400 when sender has insufficient funds for transfer', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    sql.mockResolvedValueOnce([]); // no debit dup
    sql.mockResolvedValueOnce([]); // no credit dup
    sql.mockResolvedValueOnce([{ wallet_balance: '20.00', username: 'sender' }]); // sender

    const res = await POST(makePostRequest({
      action: 'transfer',
      amount: 100,
      fromUserId: 'from-1',
      toUserId: 'to-1',
    }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Insufficient funds');
  });

  test('should return 404 when receiver not found for transfer', async () => {
    auth.mockResolvedValue({ user: { id: 'auth-1', email: 'test@example.com' } });
    sql.mockResolvedValueOnce([{ id: 'uuid-1' }]);
    sql.mockResolvedValueOnce([]); // no debit dup
    sql.mockResolvedValueOnce([]); // no credit dup
    sql.mockResolvedValueOnce([{ wallet_balance: '500.00', username: 'sender' }]);
    sql.mockResolvedValueOnce([]); // receiver not found

    const res = await POST(makePostRequest({
      action: 'transfer',
      amount: 50,
      fromUserId: 'from-1',
      toUserId: 'to-1',
    }));
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toBe('Receiver not found');
  });

  test('should return 500 on unexpected POST error', async () => {
    auth.mockRejectedValue(new Error('Service down'));

    const res = await POST(makePostRequest({ action: 'deposit', amount: 50 }));
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
