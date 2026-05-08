import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, checkMutationRole } from '../middleware/authMiddleware.js';
import { transactionLimiter } from '../middleware/rateLimitMiddleware.js';
import { invalidateUserCache } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// GET /api/transactions - Get all transactions for authenticated user
router.get('/', authMiddleware, transactionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT 
        t.id, 
        t.user_id, 
        t.type, 
        t.amount, 
        t.category_id, 
        c.name as category,
        t.description, 
        t.transaction_date, 
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    let params = [userId];
    let paramCount = 1;

    // Filter by category
    if (category) {
      paramCount++;
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    // Filter by start date
    if (startDate) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(startDate);
    }

    // Filter by end date
    if (endDate) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY t.transaction_date DESC`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    let countParams = [userId];

    if (category) {
      countQuery += ` AND c.name = $2`;
      countParams.push(category);
    }
    if (startDate) {
      countQuery += ` AND t.transaction_date >= $${countParams.length + 1}`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND t.transaction_date <= $${countParams.length + 1}`;
      countParams.push(endDate);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transactions',
      error: error.message 
    });
  }
});

// POST /api/transactions - Create new transaction (admin and user only)
router.post('/', authMiddleware, checkMutationRole, transactionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, categoryId, description, transactionDate } = req.body;

    // Validation
    if (!type || !amount || !categoryId || !transactionDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, amount, categoryId, and transactionDate are required' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be "income" or "expense"' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Check if category exists
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1',
      [categoryId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Insert transaction
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, category_id, description, transaction_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, user_id, type, amount, category_id, description, transaction_date, created_at`,
      [userId, type, amount, categoryId, description || null, transactionDate]
    );

    // Invalidate cache
    await invalidateUserCache(userId);

    const transaction = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create transaction',
      error: error.message 
    });
  }
});

// PUT /api/transactions/:id - Update transaction (admin and user only)
router.put('/:id', authMiddleware, checkMutationRole, transactionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { type, amount, categoryId, description, transactionDate } = req.body;

    // Check if transaction exists and belongs to user
    const check = await pool.query(
      'SELECT user_id FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    if (check.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own transactions' 
      });
    }

    // Validation
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be "income" or "expense"' 
      });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (type) {
      updates.push(`type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }
    if (amount) {
      updates.push(`amount = $${paramCount}`);
      values.push(amount);
      paramCount++;
    }
    if (categoryId) {
      updates.push(`category_id = $${paramCount}`);
      values.push(categoryId);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description || null);
      paramCount++;
    }
    if (transactionDate) {
      updates.push(`transaction_date = $${paramCount}`);
      values.push(transactionDate);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(transactionId);

    const query = `UPDATE transactions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    // Invalidate cache
    await invalidateUserCache(userId);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update transaction',
      error: error.message 
    });
  }
});

// DELETE /api/transactions/:id - Delete transaction (admin and user only)
router.delete('/:id', authMiddleware, checkMutationRole, transactionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // Check if transaction exists and belongs to user
    const check = await pool.query(
      'SELECT user_id FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    if (check.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own transactions' 
      });
    }

    // Delete transaction
    await pool.query('DELETE FROM transactions WHERE id = $1', [transactionId]);

    // Invalidate cache
    await invalidateUserCache(userId);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete transaction',
      error: error.message 
    });
  }
});

export default router;
