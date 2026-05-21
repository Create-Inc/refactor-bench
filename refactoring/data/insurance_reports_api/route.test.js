import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/app/api/utils/sql', () => {
  const sqlFn = vi.fn();
  return { default: sqlFn };
});

vi.mock('@/app/api/utils/rbac', () => ({
  requireAccess: vi.fn(),
}));

import { GET } from './src/app/route.js';
import sql from '@/app/api/utils/sql';
import { requireAccess } from '@/app/api/utils/rbac';

function makeRequest(params = {}) {
  const url = new URL('http://localhost/api/insurance/reports');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString(), { method: 'GET' });
}

// Default mock data
const emptyPolicySummary = [{
  total_policies: '0',
  active_policies: '0',
  expired_policies: '0',
  cancelled_policies: '0',
  overdue_renewals: '0',
  expiring_soon: '0',
  active_premium_total: '0',
}];

const emptyQuoteSummary = [{
  total_quotes: '0',
  draft_quotes: '0',
  sent_quotes: '0',
  accepted_quotes: '0',
  declined_quotes: '0',
  total_quoted_value: '0',
  accepted_value: '0',
}];

const emptyClaimsSummary = [{
  total_claims: '0',
  registered_claims: '0',
  in_assessment: '0',
  assessed_claims: '0',
  settled_claims: '0',
  rejected_claims: '0',
  total_estimated: '0',
  total_approved: '0',
}];

function setupDefaultSqlMocks() {
  // The function makes 7 sql calls in order:
  // 1. policySummary (via sql() with string)
  // 2. quoteSummary
  // 3. claimsSummary
  // 4. assessorPerformance (via tagged template sql`...`)
  // 5. monthlyPolicies
  // 6. monthlyClaims
  // 7. quotesByType
  sql
    .mockResolvedValueOnce(emptyPolicySummary)       // 1
    .mockResolvedValueOnce(emptyQuoteSummary)         // 2
    .mockResolvedValueOnce(emptyClaimsSummary)        // 3
    .mockResolvedValueOnce([])                        // 4 assessors
    .mockResolvedValueOnce([])                        // 5 monthly policies
    .mockResolvedValueOnce([])                        // 6 monthly claims
    .mockResolvedValueOnce([]);                       // 7 quotes by type
}

describe('Insurance Reports API — GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAccess.mockResolvedValue({ errorResponse: null });
  });

  test('should return error response when access is denied', async () => {
    const errorResponse = Response.json({ error: 'Forbidden' }, { status: 403 });
    requireAccess.mockResolvedValue({ errorResponse });

    const res = await GET(makeRequest({ customer_id: 'c1' }));
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  test('should require customer_id parameter', async () => {
    const res = await GET(makeRequest({}));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('customer_id is required');
  });

  test('should return full report structure on success', async () => {
    setupDefaultSqlMocks();

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('policies');
    expect(data).toHaveProperty('quotes');
    expect(data).toHaveProperty('claims');
    expect(data).toHaveProperty('assessors');
    expect(data).toHaveProperty('quotesByType');
    expect(data).toHaveProperty('trends');
    expect(data).toHaveProperty('filters');
    expect(data.trends).toHaveProperty('policies');
    expect(data.trends).toHaveProperty('claims');
  });

  test('should include conversion_rate in quotes response', async () => {
    setupDefaultSqlMocks();

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(data.quotes.conversion_rate).toBe('0.0');
  });

  test('should calculate correct conversion rate when quotes exist', async () => {
    sql
      .mockResolvedValueOnce(emptyPolicySummary)
      .mockResolvedValueOnce([{
        ...emptyQuoteSummary[0],
        total_quotes: '10',
        accepted_quotes: '3',
      }])
      .mockResolvedValueOnce(emptyClaimsSummary)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(data.quotes.conversion_rate).toBe('30.0');
  });

  test('should pass filters through to response', async () => {
    setupDefaultSqlMocks();

    const res = await GET(makeRequest({
      customer_id: 'cust-1',
      cover_type: 'motor',
      date_from: '2024-01-01',
      date_to: '2024-06-30',
      created_by_user_id: 'user-5',
    }));
    const data = await res.json();

    expect(data.filters).toEqual({
      customerId: 'cust-1',
      coverType: 'motor',
      dateFrom: '2024-01-01',
      dateTo: '2024-06-30',
      createdByUserId: 'user-5',
    });
  });

  test('should pass customer_id to all SQL queries', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-42' }));

    // All parameterized calls (first 3 and last 3) should have customer_id as first param
    // Call 0: policySummary
    expect(sql.mock.calls[0][1][0]).toBe('cust-42');
    // Call 1: quoteSummary
    expect(sql.mock.calls[1][1][0]).toBe('cust-42');
    // Call 2: claimsSummary
    expect(sql.mock.calls[2][1][0]).toBe('cust-42');
  });

  test('should include date_from filter in query params when provided', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-1', date_from: '2024-03-01' }));

    // policySummary params should include date_from
    const policySummaryParams = sql.mock.calls[0][1];
    expect(policySummaryParams).toContain('2024-03-01');
  });

  test('should include date_to filter in query params when provided', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-1', date_to: '2024-06-30' }));

    const policySummaryParams = sql.mock.calls[0][1];
    expect(policySummaryParams).toContain('2024-06-30');
  });

  test('should include cover_type filter in quote query params', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-1', cover_type: 'fire' }));

    // quoteSummary is the second call
    const quoteParams = sql.mock.calls[1][1];
    expect(quoteParams).toContain('%fire%');
  });

  test('should include cover_type filter in claims query params', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-1', cover_type: 'motor' }));

    // claimsSummary is the third call
    const claimParams = sql.mock.calls[2][1];
    expect(claimParams).toContain('%motor%');
  });

  test('should include created_by_user_id in policy query params when provided', async () => {
    setupDefaultSqlMocks();

    await GET(makeRequest({ customer_id: 'cust-1', created_by_user_id: 'user-7' }));

    const policyParams = sql.mock.calls[0][1];
    expect(policyParams).toContain('user-7');
  });

  test('should return assessor data from database', async () => {
    sql
      .mockResolvedValueOnce(emptyPolicySummary)
      .mockResolvedValueOnce(emptyQuoteSummary)
      .mockResolvedValueOnce(emptyClaimsSummary)
      .mockResolvedValueOnce([
        { id: 'a1', full_name: 'John Doe', specialty: 'Motor', region: 'North', total_assigned: 5, total_completed: 3, active_cases: 2 },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(data.assessors).toHaveLength(1);
    expect(data.assessors[0].full_name).toBe('John Doe');
  });

  test('should return monthly trend data', async () => {
    sql
      .mockResolvedValueOnce(emptyPolicySummary)
      .mockResolvedValueOnce(emptyQuoteSummary)
      .mockResolvedValueOnce(emptyClaimsSummary)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { month_key: '2024-01', month_label: 'Jan 2024', policies_created: 5, premium_total: 1000 },
      ])
      .mockResolvedValueOnce([
        { month_key: '2024-01', month_label: 'Jan 2024', claims_created: 2, claim_total: 500 },
      ])
      .mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(data.trends.policies).toHaveLength(1);
    expect(data.trends.claims).toHaveLength(1);
  });

  test('should return quotes by type breakdown', async () => {
    sql
      .mockResolvedValueOnce(emptyPolicySummary)
      .mockResolvedValueOnce(emptyQuoteSummary)
      .mockResolvedValueOnce(emptyClaimsSummary)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { cover_type: 'Motor', quote_count: 10, total_value: 5000 },
        { cover_type: 'Fire', quote_count: 3, total_value: 1500 },
      ]);

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(data.quotesByType).toHaveLength(2);
    expect(data.quotesByType[0].cover_type).toBe('Motor');
  });

  test('should return 500 when database query fails', async () => {
    sql.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('Failed to fetch reports');
  });

  test('should call requireAccess with minRole user', async () => {
    setupDefaultSqlMocks();

    const req = makeRequest({ customer_id: 'cust-1' });
    await GET(req);

    expect(requireAccess).toHaveBeenCalledWith({ minRole: 'user' }, req);
  });

  test('should handle empty policy/quote/claim summaries gracefully', async () => {
    sql
      .mockResolvedValueOnce([])  // empty policy summary
      .mockResolvedValueOnce([])  // empty quote summary
      .mockResolvedValueOnce([])  // empty claims summary
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ customer_id: 'cust-1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.policies).toEqual({});
    expect(data.quotes.conversion_rate).toBe('0.0');
  });
});
