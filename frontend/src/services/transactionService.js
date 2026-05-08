import apiClient from './apiClient';

const transactionService = {
  // Fetch all transactions with pagination and filters
  getTransactions: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = {
        page,
        limit,
        ...filters,
      };
      
      const response = await apiClient.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },

  // Create new transaction
  createTransaction: async (transaction) => {
    try {
      const response = await apiClient.post('/transactions', {
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        categoryId: parseInt(transaction.categoryId),
        description: transaction.description,
        transactionDate: transaction.transactionDate,
      });
      return response.data;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (transactionId, updates) => {
    try {
      const response = await apiClient.put(`/transactions/${transactionId}`, {
        ...(updates.type && { type: updates.type }),
        ...(updates.amount && { amount: parseFloat(updates.amount) }),
        ...(updates.categoryId && { categoryId: parseInt(updates.categoryId) }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.transactionDate && { transactionDate: updates.transactionDate }),
      });
      return response.data;
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (transactionId) => {
    try {
      const response = await apiClient.delete(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  },
};

export default transactionService;
