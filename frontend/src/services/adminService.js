import api from './api';

const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response;
  },

  async getAnalytics(period = '30d') {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response;
  },

  async getAllVendors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/vendors?${queryString}`);
    return response;
  },

  async approveVendor(id) {
    const response = await api.put(`/admin/vendors/${id}/approve`);
    return response;
  },

  async rejectVendor(id, reason) {
    const response = await api.put(`/admin/vendors/${id}/reject`, { reason });
    return response;
  },
};

export default adminService;