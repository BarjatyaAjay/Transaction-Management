import { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import Loading from '../components/Loading';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import MonthlyLineChart from '../components/Charts/MonthlyLineChart';
import CategoryBarChart from '../components/Charts/CategoryBarChart';
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
          <MonthlyLineChart data={data.monthly} loading={loading} />
        </div>

        <div className="analytics-section">
          <h3>Category Breakdown</h3>
          <CategoryPieChart data={data.category} loading={loading} />
        </div>

        <div className="analytics-section">
          <h3>Income vs Expense Trends</h3>
          <CategoryBarChart data={data.trends} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
