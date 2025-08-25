import api from './api';

const productService = {
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response;
  },

  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response;
  },

  async getCategories() {
    const response = await api.get('/products/categories');
    return response;
  },

  async createProduct(productData) {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key === 'images' && Array.isArray(productData[key])) {
        productData[key].forEach(image => {
          formData.append('images', image);
        });
      } else if (key === 'specifications' && Array.isArray(productData[key])) {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'tags' && Array.isArray(productData[key])) {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'inventory' && typeof productData[key] === 'object') {
        Object.keys(productData[key]).forEach(invKey => {
          formData.append(`inventory.${invKey}`, productData[key][invKey]);
        });
      } else if (productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async updateProduct(id, productData) {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key === 'images' && Array.isArray(productData[key])) {
        productData[key].forEach(image => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'specifications' && Array.isArray(productData[key])) {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'tags' && Array.isArray(productData[key])) {
        formData.append(key, JSON.stringify(productData[key]));
      } else if (key === 'inventory' && typeof productData[key] === 'object') {
        Object.keys(productData[key]).forEach(invKey => {
          formData.append(`inventory.${invKey}`, productData[key][invKey]);
        });
      } else if (productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response;
  },

  async getVendorProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products/vendor/my-products?${queryString}`);
    return response;
  },
};

export default productService;
export const getAllProducts = productService.getProducts;