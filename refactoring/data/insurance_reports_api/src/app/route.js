import sql from "@/app/api/utils/sql";
import { requireAccess } from "@/app/api/utils/rbac";

export async function GET(request) {
  const { errorResponse } = await requireAccess({ minRole: "user" }, request);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customer_id");
    const coverType = url.searchParams.get("cover_type") || "";
    const dateFrom = url.searchParams.get("date_from") || "";
    const dateTo = url.searchParams.get("date_to") || "";
    const createdByUserId = url.searchParams.get("created_by_user_id") || "";

    if (!customerId) {
      return Response.json(
        { error: "customer_id is required" },
        { status: 400 },
      );
    }

    // Build dynamic WHERE fragments for policies
    let policyWhere = "WHERE p.customer_id = $1";
    let policyParams = [customerId];
    let pIdx = 2;

    if (dateFrom) {
      policyWhere += ` AND p.created_at >= $${pIdx}`;
      policyParams.push(dateFrom);
      pIdx++;
    }
    if (dateTo) {
      policyWhere += ` AND p.created_at <= ($${pIdx}::date + interval '1 day')`;
      policyParams.push(dateTo);
      pIdx++;
    }
    if (createdByUserId) {
      policyWhere += ` AND p.created_by_user_id = $${pIdx}`;
      policyParams.push(createdByUserId);
      pIdx++;
    }

    // Build dynamic WHERE fragments for quotes
    let quoteWhere = "WHERE q.customer_id = $1";
    let quoteParams = [customerId];
    let qIdx = 2;

    if (coverType) {
      quoteWhere += ` AND LOWER(q.cover_type) LIKE LOWER($${qIdx})`;
      quoteParams.push(`%${coverType}%`);
      qIdx++;
    }
    if (dateFrom) {
      quoteWhere += ` AND q.created_at >= $${qIdx}`;
      quoteParams.push(dateFrom);
      qIdx++;
    }
    if (dateTo) {
      quoteWhere += ` AND q.created_at <= ($${qIdx}::date + interval '1 day')`;
      quoteParams.push(dateTo);
      qIdx++;
    }
    if (createdByUserId) {
      quoteWhere += ` AND q.created_by_user_id = $${qIdx}`;
      quoteParams.push(createdByUserId);
      qIdx++;
    }

    // Build dynamic WHERE fragments for claims
    let claimWhere = "WHERE c.customer_id = $1";
    let claimParams = [customerId];
    let cIdx = 2;

    if (coverType) {
      claimWhere += ` AND LOWER(c.claim_type) LIKE LOWER($${cIdx})`;
      claimParams.push(`%${coverType}%`);
      cIdx++;
    }
    if (dateFrom) {
      claimWhere += ` AND c.created_at >= $${cIdx}`;
      claimParams.push(dateFrom);
      cIdx++;
    }
    if (dateTo) {
      claimWhere += ` AND c.created_at <= ($${cIdx}::date + interval '1 day')`;
      claimParams.push(dateTo);
      cIdx++;
    }
    if (createdByUserId) {
      claimWhere += ` AND c.created_by_user_id = $${cIdx}`;
      claimParams.push(createdByUserId);
      cIdx++;
    }

    // 1) Policy summary
    const policySummary = await sql(
      `SELECT
        COUNT(*) as total_policies,
        COUNT(*) FILTER (WHERE p.status = 'active') as active_policies,
        COUNT(*) FILTER (WHERE p.status = 'expired') as expired_policies,
        COUNT(*) FILTER (WHERE p.status = 'cancelled') as cancelled_policies,
        COUNT(*) FILTER (WHERE p.status = 'active' AND p.end_date IS NOT NULL AND p.end_date < CURRENT_DATE) as overdue_renewals,
        COUNT(*) FILTER (WHERE p.status = 'active' AND p.end_date IS NOT NULL AND p.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30) as expiring_soon,
        COALESCE(SUM(p.total_amount) FILTER (WHERE p.status = 'active'), 0) as active_premium_total
      FROM ins_policies p
      ${policyWhere}`,
      policyParams,
    );

    // 2) Quote summary
    const quoteSummary = await sql(
      `SELECT
        COUNT(*) as total_quotes,
        COUNT(*) FILTER (WHERE q.status = 'draft') as draft_quotes,
        COUNT(*) FILTER (WHERE q.status = 'sent') as sent_quotes,
        COUNT(*) FILTER (WHERE q.status = 'accepted') as accepted_quotes,
        COUNT(*) FILTER (WHERE q.status = 'declined') as declined_quotes,
        COALESCE(SUM(q.total_amount), 0) as total_quoted_value,
        COALESCE(SUM(q.total_amount) FILTER (WHERE q.status = 'accepted'), 0) as accepted_value
      FROM ins_quotes q
      ${quoteWhere}`,
      quoteParams,
    );

    // 3) Claims summary
    const claimsSummary = await sql(
      `SELECT
        COUNT(*) as total_claims,
        COUNT(*) FILTER (WHERE c.status = 'registered') as registered_claims,
        COUNT(*) FILTER (WHERE c.status = 'assessment') as in_assessment,
        COUNT(*) FILTER (WHERE c.status = 'assessed') as assessed_claims,
        COUNT(*) FILTER (WHERE c.status = 'settled') as settled_claims,
        COUNT(*) FILTER (WHERE c.status = 'rejected') as rejected_claims,
        COALESCE(SUM(c.estimated_amount), 0) as total_estimated,
        COALESCE(SUM(c.approved_amount) FILTER (WHERE c.status IN ('settled','closed')), 0) as total_approved
      FROM ins_claims c
      ${claimWhere}`,
      claimParams,
    );

    // 4) Assessor performance (no date filter — always all)
    const assessorPerformance = await sql`
      SELECT
        a.id, a.full_name, a.specialty, a.region,
        COUNT(c.id) as total_assigned,
        COUNT(c.id) FILTER (WHERE c.status IN ('assessed','settled','closed')) as total_completed,
        COUNT(c.id) FILTER (WHERE c.status IN ('registered','assessment')) as active_cases
      FROM ins_assessors a
      LEFT JOIN ins_claims c ON c.assessor_id = a.id
      WHERE a.customer_id = ${customerId} AND a.active = true
      GROUP BY a.id, a.full_name, a.specialty, a.region
      ORDER BY total_assigned DESC
    `;

    // 5) Monthly trends (last 6 months, but respect date filters)
    let trendFrom = "CURRENT_DATE - INTERVAL '6 months'";
    let trendPolicyParams = [customerId];
    let trendClaimParams = [customerId];
    let tpIdx = 2;
    let tcIdx = 2;

    let trendPolicyWhere = "WHERE p.customer_id = $1";
    let trendClaimWhere = "WHERE c.customer_id = $1";

    if (dateFrom) {
      trendPolicyWhere += ` AND p.created_at >= $${tpIdx}`;
      trendPolicyParams.push(dateFrom);
      tpIdx++;
      trendClaimWhere += ` AND c.created_at >= $${tcIdx}`;
      trendClaimParams.push(dateFrom);
      tcIdx++;
    } else {
      trendPolicyWhere += ` AND p.created_at >= CURRENT_DATE - INTERVAL '6 months'`;
      trendClaimWhere += ` AND c.created_at >= CURRENT_DATE - INTERVAL '6 months'`;
    }
    if (dateTo) {
      trendPolicyWhere += ` AND p.created_at <= ($${tpIdx}::date + interval '1 day')`;
      trendPolicyParams.push(dateTo);
      tpIdx++;
      trendClaimWhere += ` AND c.created_at <= ($${tcIdx}::date + interval '1 day')`;
      trendClaimParams.push(dateTo);
      tcIdx++;
    }

    const monthlyPolicies = await sql(
      `SELECT
        TO_CHAR(p.created_at, 'YYYY-MM') as month_key,
        TO_CHAR(p.created_at, 'Mon YYYY') as month_label,
        COUNT(*) as policies_created,
        COALESCE(SUM(p.total_amount), 0) as premium_total
      FROM ins_policies p
      ${trendPolicyWhere}
      GROUP BY TO_CHAR(p.created_at, 'YYYY-MM'), TO_CHAR(p.created_at, 'Mon YYYY')
      ORDER BY month_key ASC`,
      trendPolicyParams,
    );

    const monthlyClaims = await sql(
      `SELECT
        TO_CHAR(c.created_at, 'YYYY-MM') as month_key,
        TO_CHAR(c.created_at, 'Mon YYYY') as month_label,
        COUNT(*) as claims_created,
        COALESCE(SUM(c.estimated_amount), 0) as claim_total
      FROM ins_claims c
      ${trendClaimWhere}
      GROUP BY TO_CHAR(c.created_at, 'YYYY-MM'), TO_CHAR(c.created_at, 'Mon YYYY')
      ORDER BY month_key ASC`,
      trendClaimParams,
    );

    // 6) Quotes by cover_type breakdown
    let coverBreakdownWhere = "WHERE q.customer_id = $1";
    let coverBreakdownParams = [customerId];
    let cbIdx = 2;
    if (dateFrom) {
      coverBreakdownWhere += ` AND q.created_at >= $${cbIdx}`;
      coverBreakdownParams.push(dateFrom);
      cbIdx++;
    }
    if (dateTo) {
      coverBreakdownWhere += ` AND q.created_at <= ($${cbIdx}::date + interval '1 day')`;
      coverBreakdownParams.push(dateTo);
      cbIdx++;
    }

    const quotesByType = await sql(
      `SELECT
        COALESCE(q.cover_type, 'Unknown') as cover_type,
        COUNT(*) as quote_count,
        COALESCE(SUM(q.total_amount), 0) as total_value
      FROM ins_quotes q
      ${coverBreakdownWhere}
      GROUP BY q.cover_type
      ORDER BY quote_count DESC`,
      coverBreakdownParams,
    );

    // 7) Quote conversion rate
    const totalQuotes = parseInt(quoteSummary[0]?.total_quotes || "0", 10);
    const acceptedQuotes = parseInt(
      quoteSummary[0]?.accepted_quotes || "0",
      10,
    );
    const conversionRate =
      totalQuotes > 0
        ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1)
        : "0.0";

    return Response.json({
      policies: policySummary[0] || {},
      quotes: { ...(quoteSummary[0] || {}), conversion_rate: conversionRate },
      claims: claimsSummary[0] || {},
      assessors: assessorPerformance,
      quotesByType,
      trends: {
        policies: monthlyPolicies,
        claims: monthlyClaims,
      },
      filters: { customerId, coverType, dateFrom, dateTo, createdByUserId },
    });
  } catch (err) {
    console.error("GET /api/insurance/reports error:", err);
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
