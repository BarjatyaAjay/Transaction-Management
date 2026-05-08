import { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import Loading from '../components/Loading';
import './Pages.css';

const AnalyticsPage = () => {
  const [data, setData] = useState({
    monthly: [],
    category: [],
    trends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [monthlyRes, categoryRes, trendsRes] = await Promise.all([
          analyticsService.getMonthly(),
          analyticsService.getCategory(),
          analyticsService.getIncomeVsExpense(),
        ]);

        setData({
          monthly: monthlyRes.success ? monthlyRes.data : [],
          category: categoryRes.success ? categoryRes.data : [],
          trends: trendsRes.success ? trendsRes.data : [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Analytics</h1>
          <p>View your financial reports and charts</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="analytics-section">
          <h3>Monthly Overview</h3>
          <p className="info-text">Charts will be rendered here in the next phase with Recharts</p>
          <div className="chart-placeholder">
            {data.monthly.length > 0 ? (
              <pre>{JSON.stringify(data.monthly, null, 2)}</pre>
            ) : (
              <p>No monthly data available</p>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Category Breakdown</h3>
          <p className="info-text">Pie chart will be displayed here</p>
          <div className="chart-placeholder">
            {data.category.length > 0 ? (
              <ul>
                {data.category.map((cat, idx) => (
                  <li key={idx}>
                    {cat.name}: ${cat.value} ({cat.count} transactions)
                  </li>
                ))}
              </ul>
            ) : (
              <p>No category data available</p>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Income vs Expense Trends</h3>
          <p className="info-text">Line chart will be displayed here</p>
          <div className="chart-placeholder">
            {data.trends.length > 0 ? (
              <pre>{JSON.stringify(data.trends, null, 2)}</pre>
            ) : (
              <p>No trend data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
