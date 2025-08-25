import api from './api';

const vendorService = {
  async getVendors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors?${queryString}`);
    return response;
  },

  async getVendor(id) {
    const response = await api.get(`/vendors/${id}`);
    return response;
  },

  async updateVendorProfile(profileData) {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (key === 'storeLogo' || key === 'storeBanner') {
        if (profileData[key] instanceof File) {
          formData.append(key, profileData[key]);
        }
      } else if (key === 'bankDetails' && typeof profileData[key] === 'object') {
        Object.keys(profileData[key]).forEach(bankKey => {
          formData.append(`bankDetails.${bankKey}`, profileData[key][bankKey]);
        });
      } else if (key === 'storeSettings' && typeof profileData[key] === 'object') {
        Object.keys(profileData[key]).forEach(settingKey => {
          formData.append(`storeSettings.${settingKey}`, profileData[key][settingKey]);
        });
      } else if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await api.put('/vendors/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async getDashboardStats() {
    const response = await api.get('/vendors/dashboard/stats');
    return response;
  },

  async getAnalytics(period = '30d') {
    const response = await api.get(`/vendors/analytics/overview?period=${period}`);
    return response;
  },
};

export default vendorService;