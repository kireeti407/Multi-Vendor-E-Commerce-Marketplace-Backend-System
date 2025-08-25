import api from './api';

const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response;
  },

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders/my-orders?${queryString}`);
    return response;
  },

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`);
    return response;
  },

  async cancelOrder(id, reason) {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response;
  },

  async getVendorOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders/vendor/orders?${queryString}`);
    return response;
  },

  async updateOrderStatus(id, statusData) {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response;
  },

  // Admin functions
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/orders?${queryString}`);
    return response;
  },
};

export default orderService;