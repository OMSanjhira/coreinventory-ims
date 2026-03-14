import api from './api';

export const productService = {
  async list(params?: { category_id?: string; search?: string }) {
    const res = await api.get('/products', { params });
    return res.data.data;
  },

  async get(id: string) {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },

  async create(data: any) {
    const res = await api.post('/products', data);
    return res.data.data;
  },

  async update(id: string, data: any) {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  async getStock(id: string) {
    const res = await api.get(`/products/${id}/stock`);
    return res.data.data;
  },

  async listCategories() {
    const res = await api.get('/products/categories');
    return res.data.data;
  },

  async createCategory(name: string) {
    const res = await api.post('/products/categories', { name });
    return res.data.data;
  },
};
