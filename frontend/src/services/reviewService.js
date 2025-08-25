import api from './api';

const reviewService = {
  async createReview(reviewData) {
    const formData = new FormData();
    
    Object.keys(reviewData).forEach(key => {
      if (key === 'images' && Array.isArray(reviewData[key])) {
        reviewData[key].forEach(image => {
          formData.append('images', image);
        });
      } else if (reviewData[key] !== undefined && reviewData[key] !== null) {
        formData.append(key, reviewData[key]);
      }
    });

    const response = await api.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async getProductReviews(productId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/reviews/product/${productId}?${queryString}`);
    return response;
  },

  async getVendorReviews(vendorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/reviews/vendor/${vendorId}?${queryString}`);
    return response;
  },

  async updateReview(id, reviewData) {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response;
  },

  async deleteReview(id) {
    const response = await api.delete(`/reviews/${id}`);
    return response;
  },

  async respondToReview(id, message) {
    const response = await api.post(`/reviews/${id}/respond`, { message });
    return response;
  },

  // Admin functions
  async getAllReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/reviews?${queryString}`);
    return response;
  },

  async moderateReview(id, action, reason) {
    const response = await api.put(`/admin/reviews/${id}/moderate`, { action, reason });
    return response;
  },
};

export default reviewService;