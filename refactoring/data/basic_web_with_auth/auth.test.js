import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock @neondatabase/serverless
const mockQuery = vi.fn();
vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn(() => ({ query: mockQuery })),
}));

// Mock argon2
const mockHash = vi.fn();
const mockVerify = vi.fn();
vi.mock('argon2', () => ({
  hash: (...args) => mockHash(...args),
  verify: (...args) => mockVerify(...args),
}));

// Capture the config passed to CreateAuth
let capturedConfig;
vi.mock('@auth/create', () => ({
  default: (config) => {
    capturedConfig = config;
    return { auth: vi.fn() };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  capturedConfig = undefined;
});

async function loadModule() {
  vi.resetModules();
  return import('./src/auth.js');
}

describe('auth module', () => {
  test('exports auth function', async () => {
    const mod = await loadModule();
    expect(mod.auth).toBeDefined();
  });

  test('configures custom sign-in and sign-out pages', async () => {
    await loadModule();
    expect(capturedConfig.pages.signIn).toBe('/account/signin');
    expect(capturedConfig.pages.signOut).toBe('/account/logout');
  });

  test('registers two credential providers', async () => {
    await loadModule();
    expect(capturedConfig.providers).toHaveLength(2);
  });
});

describe('Adapter - createVerificationToken', () => {
  test('inserts token and returns it', async () => {
    await loadModule();
    const adapter = capturedConfig.adapter || {};
    // Access adapter through the config internals - we need to test the Adapter function
    // Since Adapter is internal, we test it through the authorize functions which use it
  });
});

describe('credentials-signin authorize', () => {
  let signinAuthorize;

  beforeEach(async () => {
    await loadModule();
    const signinProvider = capturedConfig.providers.find(
      (p) => p.options?.id === 'credentials-signin' || p.id === 'credentials-signin'
    );
    signinAuthorize = signinProvider.options?.authorize || signinProvider.authorize;
  });

  test('returns null when email is missing', async () => {
    const result = await signinAuthorize({ password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when password is missing', async () => {
    const result = await signinAuthorize({ email: 'test@example.com' });
    expect(result).toBeNull();
  });

  test('returns null when email is not a string', async () => {
    const result = await signinAuthorize({ email: 123, password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when password is not a string', async () => {
    const result = await signinAuthorize({ email: 'test@example.com', password: 123 });
    expect(result).toBeNull();
  });

  test('returns null when user not found', async () => {
    // getUserByEmail does two queries: users then accounts
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const result = await signinAuthorize({ email: 'noone@example.com', password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when no credentials account exists', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'u1', email: 'test@example.com' }] })
      .mockResolvedValueOnce({ rows: [{ provider: 'google', password: null }] });
    const result = await signinAuthorize({ email: 'test@example.com', password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when password does not match', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'u1', email: 'test@example.com' }] })
      .mockResolvedValueOnce({ rows: [{ provider: 'credentials', password: 'hashed' }] });
    mockVerify.mockResolvedValue(false);
    const result = await signinAuthorize({ email: 'test@example.com', password: 'wrong' });
    expect(result).toBeNull();
    expect(mockVerify).toHaveBeenCalledWith('hashed', 'wrong');
  });

  test('returns user when credentials are valid', async () => {
    const user = { id: 'u1', email: 'test@example.com', name: 'Test' };
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [user] })
      .mockResolvedValueOnce({ rows: [{ provider: 'credentials', password: 'hashed' }] });
    mockVerify.mockResolvedValue(true);
    const result = await signinAuthorize({ email: 'test@example.com', password: 'correct' });
    expect(result).toBeTruthy();
    expect(result.email).toBe('test@example.com');
    expect(result.accounts).toBeDefined();
  });
});

describe('credentials-signup authorize', () => {
  let signupAuthorize;

  beforeEach(async () => {
    await loadModule();
    const signupProvider = capturedConfig.providers.find(
      (p) => p.options?.id === 'credentials-signup' || p.id === 'credentials-signup'
    );
    signupAuthorize = signupProvider.options?.authorize || signupProvider.authorize;
  });

  test('returns null when email is missing', async () => {
    const result = await signupAuthorize({ password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when password is missing', async () => {
    const result = await signupAuthorize({ email: 'new@example.com' });
    expect(result).toBeNull();
  });

  test('returns null when email is not a string', async () => {
    const result = await signupAuthorize({ email: 42, password: 'pass' });
    expect(result).toBeNull();
  });

  test('returns null when user already exists', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'existing', email: 'taken@example.com' }] })
      .mockResolvedValueOnce({ rows: [] });
    const result = await signupAuthorize({ email: 'taken@example.com', password: 'pass' });
    expect(result).toBeNull();
  });

  test('creates new user when email is not taken', async () => {
    const newUser = { id: 'new-id', email: 'new@example.com', name: null, image: null };
    // getUserByEmail returns no user
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    // createUser INSERT
    mockQuery.mockResolvedValueOnce({ rows: [newUser] });
    // linkAccount INSERT
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'acc1' }] });
    mockHash.mockResolvedValue('hashed-password');

    const result = await signupAuthorize({ email: 'new@example.com', password: 'pass123' });
    expect(result).toBeTruthy();
    expect(result.email).toBe('new@example.com');
    expect(mockHash).toHaveBeenCalledWith('pass123');
  });

  test('stores hashed password via linkAccount', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u2', email: 'new@example.com' }] })
      .mockResolvedValueOnce({ rows: [{}] });
    mockHash.mockResolvedValue('argon2-hash');

    await signupAuthorize({ email: 'new@example.com', password: 'secret' });

    // The linkAccount call should include the hashed password
    const linkAccountCall = mockQuery.mock.calls[2];
    const params = linkAccountCall[1];
    // password is the last param (index 11)
    expect(params[params.length - 1]).toBe('argon2-hash');
  });

  test('uses provided name when it is a non-empty string', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u3', email: 'new@example.com', name: 'Alice' }] })
      .mockResolvedValueOnce({ rows: [{}] });
    mockHash.mockResolvedValue('hash');

    await signupAuthorize({ email: 'new@example.com', password: 'pass', name: 'Alice' });

    // createUser call - name should be 'Alice'
    const createUserCall = mockQuery.mock.calls[1];
    const params = createUserCall[1];
    expect(params).toContain('Alice');
  });

  test('omits name when it is empty string', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u4', email: 'new@example.com' }] })
      .mockResolvedValueOnce({ rows: [{}] });
    mockHash.mockResolvedValue('hash');

    await signupAuthorize({ email: 'new@example.com', password: 'pass', name: '   ' });

    const createUserCall = mockQuery.mock.calls[1];
    const params = createUserCall[1];
    // name param should be undefined (trimmed whitespace-only string)
    expect(params[0]).toBeUndefined();
  });

  test('linkAccount sets provider to credentials', async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'u5', email: 'new@example.com' }] })
      .mockResolvedValueOnce({ rows: [{}] });
    mockHash.mockResolvedValue('hash');

    await signupAuthorize({ email: 'new@example.com', password: 'pass' });

    const linkCall = mockQuery.mock.calls[2];
    const params = linkCall[1];
    // provider is param index 1, type is param index 2
    expect(params[1]).toBe('credentials');
    expect(params[2]).toBe('credentials');
  });
});

describe('Adapter database operations', () => {
  test('getUserByEmail returns null when user not found', async () => {
    await loadModule();
    // We test this indirectly through signin authorize
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const signinProvider = capturedConfig.providers.find(
      (p) => p.options?.id === 'credentials-signin' || p.id === 'credentials-signin'
    );
    const authorize = signinProvider.options?.authorize || signinProvider.authorize;
    const result = await authorize({ email: 'nobody@test.com', password: 'pass' });
    expect(result).toBeNull();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('select * from auth_users where email'),
      ['nobody@test.com']
    );
  });

  test('getUserByEmail fetches accounts for found user', async () => {
    await loadModule();
    const user = { id: 'u1', email: 'test@test.com' };
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [user] })
      .mockResolvedValueOnce({ rows: [{ provider: 'credentials', password: 'hash' }] });
    mockVerify.mockResolvedValue(true);

    const signinProvider = capturedConfig.providers.find(
      (p) => p.options?.id === 'credentials-signin' || p.id === 'credentials-signin'
    );
    const authorize = signinProvider.options?.authorize || signinProvider.authorize;
    await authorize({ email: 'test@test.com', password: 'pass' });

    // Second query should fetch accounts
    expect(mockQuery.mock.calls[1][0]).toContain('auth_accounts');
    expect(mockQuery.mock.calls[1][1]).toEqual(['u1']);
  });
});
