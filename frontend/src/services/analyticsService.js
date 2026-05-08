import apiClient from './apiClient';

const analyticsService = {
  // Get monthly spending overview
  getMonthly: async () => {
    try {
      const response = await apiClient.get('/analytics/monthly');
      return response.data;
    } catch (error) {
      console.error('Get monthly analytics error:', error);
      throw error;
    }
  },

  // Get category breakdown
  getCategory: async () => {
    try {
      const response = await apiClient.get('/analytics/category');
      return response.data;
    } catch (error) {
      console.error('Get category analytics error:', error);
      throw error;
    }
  },

  // Get income vs expense trends
  getIncomeVsExpense: async () => {
    try {
      const response = await apiClient.get('/analytics/income-vs-expense');
      return response.data;
    } catch (error) {
      console.error('Get income vs expense analytics error:', error);
      throw error;
    }
  },

  // Get summary stats (real-time)
  getSummary: async () => {
    try {
      const response = await apiClient.get('/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Get summary analytics error:', error);
      throw error;
    }
  },
};

export default analyticsService;
