import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import analyticsService from '../services/analyticsService';
import Loading from '../components/Loading';
import './Pages.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await analyticsService.getSummary();
        if (result.success) {
          setSummary(result.data);
        } else {
          setError('Failed to load summary');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.email}! 👋</p>
        </div>

        {error && <div className="error">{error}</div>}

        {summary && (
          <div className="stats-grid">
            <div className="stat-card income">
              <div className="stat-label">Total Income</div>
              <div className="stat-value">
                ${summary.totalIncome.toFixed(2)}
              </div>
              <div className="stat-subtitle">All time</div>
            </div>

            <div className="stat-card expense">
              <div className="stat-label">Total Expense</div>
              <div className="stat-value">
                ${summary.totalExpense.toFixed(2)}
              </div>
              <div className="stat-subtitle">All time</div>
            </div>

            <div className="stat-card balance">
              <div className="stat-label">Net Balance</div>
              <div className="stat-value">
                ${summary.netBalance.toFixed(2)}
              </div>
              <div className="stat-subtitle">Income - Expense</div>
            </div>

            <div className="stat-card days">
              <div className="stat-label">Transaction Days</div>
              <div className="stat-value">{summary.transactionDays}</div>
              <div className="stat-subtitle">Days with transactions</div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <p>Go to Transactions to add, edit, or view your transactions.</p>
          <p>Go to Analytics to see detailed charts and reports.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
