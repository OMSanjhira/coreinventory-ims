import api from './api';

// ─── Receipts ────────────────────────────────────────────────────────────────
export const receiptService = {
  async list(params?: any) { return (await api.get('/receipts', { params })).data.data; },
  async get(id: string) { return (await api.get(`/receipts/${id}`)).data.data; },
  async create(data: any) { return (await api.post('/receipts', data)).data.data; },
  async update(id: string, data: any) { return (await api.put(`/receipts/${id}`, data)).data.data; },
  async transition(id: string, action: string) { return (await api.post(`/receipts/${id}/${action}`)).data.data; },
};

// ─── Deliveries ──────────────────────────────────────────────────────────────
export const deliveryService = {
  async list(params?: any) { return (await api.get('/deliveries', { params })).data.data; },
  async get(id: string) { return (await api.get(`/deliveries/${id}`)).data.data; },
  async create(data: any) { return (await api.post('/deliveries', data)).data.data; },
  async update(id: string, data: any) { return (await api.put(`/deliveries/${id}`, data)).data.data; },
  async transition(id: string, action: string) { return (await api.post(`/deliveries/${id}/${action}`)).data.data; },
};

// ─── Transfers ───────────────────────────────────────────────────────────────
export const transferService = {
  async list(params?: any) { return (await api.get('/transfers', { params })).data.data; },
  async get(id: string) { return (await api.get(`/transfers/${id}`)).data.data; },
  async create(data: any) { return (await api.post('/transfers', data)).data.data; },
  async update(id: string, data: any) { return (await api.put(`/transfers/${id}`, data)).data.data; },
  async transition(id: string, action: string) { return (await api.post(`/transfers/${id}/${action}`)).data.data; },
};

// ─── Adjustments ─────────────────────────────────────────────────────────────
export const adjustmentService = {
  async list(params?: any) { return (await api.get('/adjustments', { params })).data.data; },
  async get(id: string) { return (await api.get(`/adjustments/${id}`)).data.data; },
  async create(data: any) { return (await api.post('/adjustments', data)).data.data; },
  async update(id: string, data: any) { return (await api.put(`/adjustments/${id}`, data)).data.data; },
  async transition(id: string, action: string) { return (await api.post(`/adjustments/${id}/${action}`)).data.data; },
};
