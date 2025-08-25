import api from './api';

const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response;
  },

  async updateProfile(profileData) {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (key === 'address' && typeof profileData[key] === 'object') {
        Object.keys(profileData[key]).forEach(addressKey => {
          formData.append(`address.${addressKey}`, profileData[key][addressKey]);
        });
      } else if (profileData[key] !== undefined && profileData[key] !== null) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async changePassword(passwordData) {
    const response = await api.put('/auth/password', passwordData);
    return response;
  },
};

export default authService;