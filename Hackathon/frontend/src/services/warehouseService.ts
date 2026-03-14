import api from './api';

export const warehouseService = {
  async list() {
    const res = await api.get('/warehouses');
    return res.data.data;
  },

  async get(id: string) {
    const res = await api.get(`/warehouses/${id}`);
    return res.data.data;
  },

  async create(data: any) {
    const res = await api.post('/warehouses', data);
    return res.data.data;
  },

  async update(id: string, data: any) {
    const res = await api.put(`/warehouses/${id}`, data);
    return res.data.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/warehouses/${id}`);
    return res.data;
  },

  async getLocations(warehouseId: string) {
    const res = await api.get(`/warehouses/${warehouseId}/locations`);
    return res.data.data;
  },
};
