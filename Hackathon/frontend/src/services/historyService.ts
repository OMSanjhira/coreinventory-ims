import api from './api';

export const historyService = {
  async list(params?: {
    start_date?: string;
    end_date?: string;
    move_type?: string;
    product_id?: string;
    warehouse_id?: string;
    done_by?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get('/ledger', { params });
    const data = res.data.data;
    return data?.items || data?.entries || (Array.isArray(data) ? data : []);
  },

  async exportCSV(params?: any) {
    const res = await api.get('/reports/stock-moves-csv', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};
