import api from './api';

export const dashboardService = {
  async getManagerStats() {
    try {
      const res = await api.get('/dashboard/kpis');
      return res.data.data;
    } catch {
      return null;
    }
  },

  async getStaffStats() {
    try {
      const res = await api.get('/dashboard/kpis'); // Use KPIs for now
      return res.data.data;
    } catch {
      return null;
    }
  },

  async getLowStockAlerts() {
    return []; // Handled within KPIs in the new backend
  },

  async getRecentActivity(limit = 10) {
    try {
      const res = await api.get('/dashboard/recent', { params: { limit } });
      return res.data.data;
    } catch {
      return [];
    }
  },
};
