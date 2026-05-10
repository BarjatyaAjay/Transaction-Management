import { useState, useCallback, useMemo } from 'react';
import { CATEGORIES } from '../services/categoryService';
import transactionService from '../services/transactionService';
import './TransactionForm.css';

const TransactionForm = ({ onSuccess, onCancel, editingTransaction = null }) => {
  const [formData, setFormData] = useState({
    type: editingTransaction?.type || 'expense',
    amount: editingTransaction?.amount || '',
    categoryId: editingTransaction?.category_id || '',
    description: editingTransaction?.description || '',
    transactionDate: editingTransaction?.transaction_date || new Date().toISOString().split('T')[0],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const incomeCategories = useMemo(
    () => CATEGORIES.filter((c) => ['Salary', 'Freelance', 'Investments', 'Gifts'].includes(c.name)),
    []
  );

  const expenseCategories = useMemo(
    () => CATEGORIES.filter((c) => !['Salary', 'Freelance', 'Investments', 'Gifts'].includes(c.name)),
    []
  );

  const availableCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset category when type changes
      if (name === 'type') {
        updated.categoryId = '';
      }
      return updated;
    });
    setError('');
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.type || !formData.amount || !formData.categoryId || !formData.transactionDate) {
      setError('All fields are required');
      return false;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      try {
        if (editingTransaction) {
          await transactionService.updateTransaction(editingTransaction.id, formData);
        } else {
          await transactionService.createTransaction(formData);
        }

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(err.message || 'Transaction failed');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, editingTransaction, validateForm, onSuccess]
  );

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            <option value="">Select a category</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="transactionDate">Date</label>
          <input
            type="date"
            id="transactionDate"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes about this transaction..."
          disabled={isLoading}
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading
            ? editingTransaction
              ? 'Updating...'
              : 'Creating...'
            : editingTransaction
            ? 'Update Transaction'
            : 'Add Transaction'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;
