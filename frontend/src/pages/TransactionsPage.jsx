import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import transactionService from '../services/transactionService';
import { CATEGORIES } from '../services/categoryService';
import { canEditTransaction } from '../utils/roleChecks';
import Loading from '../components/Loading';
import './Pages.css';

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  const canEdit = useMemo(() => canEditTransaction(user?.role), [user?.role]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transactionService.getTransactions(
        currentPage,
        10,
        filters
      );
      if (result.success) {
        setTransactions(result.data);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1>Transactions</h1>
          <p>Manage your income and expenses</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters-grid">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Start Date"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="transactions-section">
          <h3>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="no-data">No transactions found. Create one to get started!</p>
          ) : (
            <div className="table-responsive">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {canEdit && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className={`type-${tx.type}`}>
                      <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                      <td>{tx.category}</td>
                      <td>{tx.description || '-'}</td>
                      <td>
                        <span className={`badge badge-${tx.type}`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className={tx.type === 'income' ? 'positive' : 'negative'}>
                        ${tx.amount}
                      </td>
                      {canEdit && (
                        <td>
                          <button className="btn-small btn-edit">Edit</button>
                          <button className="btn-small btn-delete">Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="info-box">
          <p>💡 <strong>Note:</strong> Read-only users can only view transactions. To add, edit, or delete transactions, contact an administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
