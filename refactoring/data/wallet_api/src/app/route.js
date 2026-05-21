import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get wallet balance and transaction history
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Handle auth_users ID to users UUID mapping
    let actualUserId = userId;
    if (userId === session.user.id && session.user.email) {
      // Look up the UUID in users table by email
      const [userRecord] = await sql`
        SELECT id FROM users WHERE email = ${session.user.email}
      `;

      if (!userRecord) {
        // Create user record if it doesn't exist
        const [newUser] = await sql`
          INSERT INTO users (email, username, full_name, wallet_balance, trust_score)
          VALUES (${session.user.email}, ${session.user.email.split("@")[0]}, ${session.user.name || "User"}, 500.00, 70)
          RETURNING id
        `;
        actualUserId = newUser.id;
      } else {
        actualUserId = userRecord.id;
      }
    }

    // Get current wallet balance
    const [user] = await sql`
      SELECT wallet_balance FROM users WHERE id = ${actualUserId}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get transaction history
    const transactions = await sql`
      SELECT 
        t.id,
        t.transaction_type,
        t.amount,
        t.direction,
        t.status,
        t.description,
        t.created_at,
        t.completed_at
      FROM transactions t
      WHERE t.user_id = ${actualUserId}
      ORDER BY t.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const [countResult] = await sql`
      SELECT COUNT(*) as total FROM transactions WHERE user_id = ${actualUserId}
    `;

    return Response.json({
      balance: parseFloat(user.wallet_balance),
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.transaction_type,
        amount: parseFloat(t.amount),
        direction: t.direction,
        status: t.status,
        description: t.description,
        createdAt: t.created_at,
        completedAt: t.completed_at,
      })),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.total),
        hasMore: offset + limit < parseInt(countResult.total),
      },
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Deposit money to wallet from bank account
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      action,
      amount,
      bankAccountId,
      idempotencyKey,
      fromUserId,
      toUserId,
      note,
    } = await request.json();

    // Handle auth_users ID to users UUID mapping
    let actualUserId = session.user.id;
    if (session.user.email) {
      // Look up the UUID in users table by email
      const [userRecord] = await sql`
        SELECT id FROM users WHERE email = ${session.user.email}
      `;

      if (!userRecord) {
        // Create user record if it doesn't exist
        const [newUser] = await sql`
          INSERT INTO users (email, username, full_name, wallet_balance, trust_score)
          VALUES (${session.user.email}, ${session.user.email.split("@")[0]}, ${session.user.name || "User"}, 500.00, 70)
          RETURNING id
        `;
        actualUserId = newUser.id;
      } else {
        actualUserId = userRecord.id;
      }
    }

    if (action === "deposit") {
      return await handleDeposit(
        actualUserId,
        amount,
        bankAccountId,
        idempotencyKey,
      );
    } else if (action === "withdraw") {
      return await handleWithdrawal(
        actualUserId,
        amount,
        bankAccountId,
        idempotencyKey,
      );
    } else if (action === "transfer") {
      return await handleP2PTransfer(
        fromUserId,
        toUserId,
        amount,
        note,
        idempotencyKey,
      );
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Wallet POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleDeposit(userId, amount, bankAccountId, idempotencyKey) {
  if (!amount || amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (!bankAccountId) {
    return Response.json(
      { error: "Bank account ID required" },
      { status: 400 },
    );
  }

  // Generate idempotency key if not provided
  const iKey =
    idempotencyKey || `deposit_${userId}_${Date.now()}_${Math.random()}`;

  try {
    // Check if transaction already exists
    const [existing] = await sql`
      SELECT id FROM transactions WHERE idempotency_key = ${iKey}
    `;

    if (existing) {
      return Response.json({ error: "Duplicate transaction" }, { status: 409 });
    }

    // Verify bank account belongs to user
    const [bankAccount] = await sql`
      SELECT id, bank_name, last_four, verification_status 
      FROM bank_accounts 
      WHERE id = ${bankAccountId} AND user_id = ${userId}
    `;

    if (!bankAccount) {
      return Response.json(
        { error: "Bank account not found" },
        { status: 404 },
      );
    }

    if (bankAccount.verification_status !== "verified") {
      return Response.json(
        { error: "Bank account not verified" },
        { status: 400 },
      );
    }

    // Start transaction
    const result = await sql.transaction([
      // Create transaction record
      sql`
        INSERT INTO transactions (
          user_id, transaction_type, amount, direction, status, description, idempotency_key
        ) VALUES (
          ${userId}, 'deposit', ${amount}, 'credit', 'pending', 
          ${"Deposit from " + bankAccount.bank_name + " ****" + bankAccount.last_four}, 
          ${iKey}
        ) RETURNING id
      `,
      // Create transfer request
      sql`
        INSERT INTO transfer_requests (
          user_id, bank_account_id, transaction_id, transfer_type, amount
        ) VALUES (
          ${userId}, ${bankAccountId}, 
          (SELECT id FROM transactions WHERE idempotency_key = ${iKey}), 
          'deposit', ${amount}
        ) RETURNING id
      `,
    ]);

    const transactionId = result[0][0].id;
    const transferId = result[1][0].id;

    // TODO: Integrate with actual payment processor (Stripe, Plaid, etc.)
    // For now, simulate successful deposit after 2 seconds
    // Complete the deposit immediately for demo
    // In production, this would be handled by webhooks from payment processor
    await completeDeposit(userId, transactionId, transferId, amount);

    return Response.json({
      transactionId,
      transferId,
      status: "completed",
      message: "Deposit completed successfully",
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return Response.json({ error: "Deposit failed" }, { status: 500 });
  }
}

async function handleWithdrawal(userId, amount, bankAccountId, idempotencyKey) {
  if (!amount || amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (!bankAccountId) {
    return Response.json(
      { error: "Bank account ID required" },
      { status: 400 },
    );
  }

  // Generate idempotency key if not provided
  const iKey =
    idempotencyKey || `withdraw_${userId}_${Date.now()}_${Math.random()}`;

  try {
    // Check if transaction already exists
    const [existing] = await sql`
      SELECT id FROM transactions WHERE idempotency_key = ${iKey}
    `;

    if (existing) {
      return Response.json({ error: "Duplicate transaction" }, { status: 409 });
    }

    // Get current balance and verify sufficient funds
    const [user] = await sql`
      SELECT wallet_balance FROM users WHERE id = ${userId}
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (parseFloat(user.wallet_balance) < amount) {
      return Response.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // Verify bank account belongs to user
    const [bankAccount] = await sql`
      SELECT id, bank_name, last_four, verification_status 
      FROM bank_accounts 
      WHERE id = ${bankAccountId} AND user_id = ${userId}
    `;

    if (!bankAccount) {
      return Response.json(
        { error: "Bank account not found" },
        { status: 404 },
      );
    }

    if (bankAccount.verification_status !== "verified") {
      return Response.json(
        { error: "Bank account not verified" },
        { status: 400 },
      );
    }

    // Start transaction
    const result = await sql.transaction([
      // Deduct from wallet balance immediately
      sql`
        UPDATE users 
        SET wallet_balance = wallet_balance - ${amount}
        WHERE id = ${userId}
        RETURNING wallet_balance as new_balance
      `,
      // Create transaction record
      sql`
        INSERT INTO transactions (
          user_id, transaction_type, amount, direction, status, description, idempotency_key
        ) VALUES (
          ${userId}, 'withdrawal', ${amount}, 'debit', 'pending', 
          ${"Withdrawal to " + bankAccount.bank_name + " ****" + bankAccount.last_four}, 
          ${iKey}
        ) RETURNING id
      `,
      // Log wallet balance change
      sql`
        INSERT INTO wallet_balance_changes (
          user_id, transaction_id, amount_change, balance_before, balance_after, reason
        ) VALUES (
          ${userId}, 
          (SELECT id FROM transactions WHERE idempotency_key = ${iKey}),
          ${-amount}, 
          ${parseFloat(user.wallet_balance)}, 
          ${parseFloat(user.wallet_balance) - amount}, 
          'Withdrawal initiated'
        )
      `,
      // Create transfer request
      sql`
        INSERT INTO transfer_requests (
          user_id, bank_account_id, transaction_id, transfer_type, amount
        ) VALUES (
          ${userId}, ${bankAccountId}, 
          (SELECT id FROM transactions WHERE idempotency_key = ${iKey}), 
          'withdrawal', ${amount}
        ) RETURNING id
      `,
    ]);

    const transactionId = result[1][0].id;
    const transferId = result[3][0].id;

    // TODO: Integrate with actual payment processor
    // For now, simulate successful withdrawal after 3 seconds
    // Complete the withdrawal immediately for demo
    // In production, this would be handled by webhooks from payment processor
    await completeWithdrawal(transactionId, transferId);

    return Response.json({
      transactionId,
      transferId,
      status: "completed",
      message: "Withdrawal completed successfully",
      newBalance: parseFloat(user.wallet_balance) - amount,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return Response.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}

async function handleP2PTransfer(
  fromUserId,
  toUserId,
  amount,
  note,
  idempotencyKey,
) {
  if (!amount || amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (!fromUserId || !toUserId) {
    return Response.json(
      { error: "Both sender and receiver required" },
      { status: 400 },
    );
  }

  if (fromUserId === toUserId) {
    return Response.json(
      { error: "Cannot transfer to yourself" },
      { status: 400 },
    );
  }

  // Generate idempotency key if not provided
  const iKey =
    idempotencyKey ||
    `transfer_${fromUserId}_${toUserId}_${Date.now()}_${Math.random()}`;

  try {
    // Check if transaction already exists - check both debit and credit keys
    const [existingDebit] = await sql`
      SELECT id FROM transactions WHERE idempotency_key = ${iKey + "_debit"}
    `;
    const [existingCredit] = await sql`
      SELECT id FROM transactions WHERE idempotency_key = ${iKey + "_credit"}
    `;

    if (existingDebit || existingCredit) {
      return Response.json({ error: "Duplicate transaction" }, { status: 409 });
    }

    // Get sender's current balance and verify sufficient funds
    const [sender] = await sql`
      SELECT wallet_balance, username FROM users WHERE id = ${fromUserId}
    `;

    if (!sender) {
      return Response.json({ error: "Sender not found" }, { status: 404 });
    }

    if (parseFloat(sender.wallet_balance) < amount) {
      return Response.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // Verify receiver exists
    const [receiver] = await sql`
      SELECT wallet_balance, username FROM users WHERE id = ${toUserId}
    `;

    if (!receiver) {
      return Response.json({ error: "Receiver not found" }, { status: 404 });
    }

    const senderBalanceBefore = parseFloat(sender.wallet_balance);
    const receiverBalanceBefore = parseFloat(receiver.wallet_balance);

    // Execute transfer transaction
    const result = await sql.transaction([
      // Deduct from sender
      sql`
        UPDATE users 
        SET wallet_balance = wallet_balance - ${amount}
        WHERE id = ${fromUserId}
        RETURNING wallet_balance as new_balance
      `,
      // Add to receiver
      sql`
        UPDATE users 
        SET wallet_balance = wallet_balance + ${amount}
        WHERE id = ${toUserId}
        RETURNING wallet_balance as new_balance
      `,
      // Create debit transaction for sender
      sql`
        INSERT INTO transactions (
          user_id, counterparty_user_id, transaction_type, amount, direction, status, description, idempotency_key
        ) VALUES (
          ${fromUserId}, ${toUserId}, 'p2p_transfer', ${amount}, 'debit', 'completed', 
          ${note || `Sent to @${receiver.username}`}, 
          ${iKey + "_debit"}
        ) RETURNING id
      `,
      // Create credit transaction for receiver
      sql`
        INSERT INTO transactions (
          user_id, counterparty_user_id, transaction_type, amount, direction, status, description, idempotency_key
        ) VALUES (
          ${toUserId}, ${fromUserId}, 'p2p_transfer', ${amount}, 'credit', 'completed', 
          ${note || `Received from @${sender.username}`}, 
          ${iKey + "_credit"}
        ) RETURNING id
      `,
      // Log sender balance change
      sql`
        INSERT INTO wallet_balance_changes (
          user_id, transaction_id, amount_change, balance_before, balance_after, reason
        ) VALUES (
          ${fromUserId}, 
          (SELECT id FROM transactions WHERE idempotency_key = ${iKey + "_debit"}),
          ${-amount}, 
          ${senderBalanceBefore}, 
          ${senderBalanceBefore - amount}, 
          ${"P2P transfer sent to @" + receiver.username}
        )
      `,
      // Log receiver balance change
      sql`
        INSERT INTO wallet_balance_changes (
          user_id, transaction_id, amount_change, balance_before, balance_after, reason
        ) VALUES (
          ${toUserId}, 
          (SELECT id FROM transactions WHERE idempotency_key = ${iKey + "_credit"}),
          ${amount}, 
          ${receiverBalanceBefore}, 
          ${receiverBalanceBefore + amount}, 
          ${"P2P transfer received from @" + sender.username}
        )
      `,
    ]);

    const senderTransactionId = result[2][0].id;
    const receiverTransactionId = result[3][0].id;

    return Response.json({
      senderTransactionId,
      receiverTransactionId,
      status: "completed",
      message: "Transfer completed successfully",
      senderNewBalance: senderBalanceBefore - amount,
      receiverNewBalance: receiverBalanceBefore + amount,
    });
  } catch (error) {
    console.error("P2P Transfer error:", error);
    return Response.json({ error: "Transfer failed" }, { status: 500 });
  }
}

async function completeDeposit(userId, transactionId, transferId, amount) {
  const [user] =
    await sql`SELECT wallet_balance FROM users WHERE id = ${userId}`;
  const balanceBefore = parseFloat(user.wallet_balance);

  await sql.transaction([
    // Update transaction status
    sql`
      UPDATE transactions 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${transactionId}
    `,
    // Update transfer request
    sql`
      UPDATE transfer_requests 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${transferId}
    `,
    // Add to wallet balance
    sql`
      UPDATE users 
      SET wallet_balance = wallet_balance + ${amount}
      WHERE id = ${userId}
    `,
    // Log wallet balance change
    sql`
      INSERT INTO wallet_balance_changes (
        user_id, transaction_id, amount_change, balance_before, balance_after, reason
      ) VALUES (
        ${userId}, ${transactionId}, ${amount}, ${balanceBefore}, ${balanceBefore + amount}, 'Deposit completed'
      )
    `,
  ]);
}

async function completeWithdrawal(transactionId, transferId) {
  await sql.transaction([
    // Update transaction status
    sql`
      UPDATE transactions 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${transactionId}
    `,
    // Update transfer request
    sql`
      UPDATE transfer_requests 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${transferId}
    `,
  ]);
}

async function failTransaction(transactionId, reason) {
  await sql`
    UPDATE transactions 
    SET status = 'failed'
    WHERE id = ${transactionId}
  `;
}

async function failWithdrawal(userId, transactionId, transferId, amount) {
  await sql.transaction([
    // Mark transaction as failed
    sql`
      UPDATE transactions 
      SET status = 'failed'
      WHERE id = ${transactionId}
    `,
    // Mark transfer as failed
    sql`
      UPDATE transfer_requests 
      SET status = 'failed', failure_reason = 'Processing error'
      WHERE id = ${transferId}
    `,
    // Refund wallet balance
    sql`
      UPDATE users 
      SET wallet_balance = wallet_balance + ${amount}
      WHERE id = ${userId}
    `,
  ]);
}
