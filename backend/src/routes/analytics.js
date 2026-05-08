import express from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyticsLimiter } from '../middleware/rateLimitMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// GET /api/analytics/monthly - Monthly spending overview (cached for 15 minutes)
router.get(
  '/monthly',
  authMiddleware,
  analyticsLimiter,
  cacheMiddleware(15 * 60),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          type,
          SUM(amount) as total
        FROM transactions
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('month', transaction_date), type
        ORDER BY month DESC
        LIMIT 12`,
        [userId]
      );

      // Format the data
      const monthlyData = {};
      result.rows.forEach((row) => {
        const monthKey = new Date(row.month).toISOString().split('T')[0];
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }
        monthlyData[monthKey][row.type] = parseFloat(row.total);
      });

      const data = Object.values(monthlyData).sort((a, b) =>
        new Date(a.month) - new Date(b.month)
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Monthly analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly analytics',
        error: error.message,
      });
    }
  }
);

// GET /api/analytics/category - Category-wise expense breakdown (cached for 1 hour)
router.get(
  '/category',
  authMiddleware,
  analyticsLimiter,
  cacheMiddleware(60 * 60),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT 
          c.name,
          SUM(t.amount) as total,
          COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 AND t.type = 'expense'
        GROUP BY c.name
        ORDER BY total DESC`,
        [userId]
      );

      const data = result.rows.map((row) => ({
        name: row.name,
        value: parseFloat(row.total),
        count: parseInt(row.count),
      }));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Category analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category analytics',
        error: error.message,
      });
    }
  }
);

// GET /api/analytics/income-vs-expense - Income vs Expense trends (cached for 15 minutes)
router.get(
  '/income-vs-expense',
  authMiddleware,
  analyticsLimiter,
  cacheMiddleware(15 * 60),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          type,
          SUM(amount) as total
        FROM transactions
        WHERE user_id = $1 AND transaction_date >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', transaction_date), type
        ORDER BY month DESC`,
        [userId]
      );

      // Format data for chart
      const trendData = {};
      result.rows.forEach((row) => {
        const monthKey = new Date(row.month).toISOString().substring(0, 7); // YYYY-MM
        if (!trendData[monthKey]) {
          trendData[monthKey] = {
            month: monthKey,
            income: 0,
            expense: 0,
            net: 0,
          };
        }
        trendData[monthKey][row.type] = parseFloat(row.total);
      });

      // Calculate net for each month
      Object.keys(trendData).forEach((key) => {
        trendData[key].net = trendData[key].income - trendData[key].expense;
      });

      const data = Object.values(trendData).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Income vs expense analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch income vs expense analytics',
        error: error.message,
      });
    }
  }
);

// GET /api/analytics/summary - Summary stats (no caching, real-time)
router.get('/summary', authMiddleware, analyticsLimiter, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(DISTINCT DATE(transaction_date)) as transaction_days
      FROM transactions
      WHERE user_id = $1`,
      [userId]
    );

    const row = result.rows[0];
    const totalIncome = parseFloat(row.total_income) || 0;
    const totalExpense = parseFloat(row.total_expense) || 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionDays: parseInt(row.transaction_days) || 0,
      },
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary analytics',
      error: error.message,
    });
  }
});

export default router;
