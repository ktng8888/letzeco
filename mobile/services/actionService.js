import api from './api';
import { createImageUploadFile } from '../utils/imageUpload';

const actionService = {

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/actions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/actions/${id}`);
    return response.data;
  },

  getByCategory: async (categoryId) => {
    const response = await api.get(`/actions/category/${categoryId}`);
    return response.data;
  },

  getPopular: async () => {
    const response = await api.get('/actions/popular');
    return response.data;
  },

  getRecommended: async () => {
    const response = await api.get('/actions/recommended');
    return response.data;
  },

  getFavourites: async () => {
    const response = await api.get('/favourites');
    return response.data;
  },

  addFavourite: async (actionId) => {
    const response = await api.post(`/favourites/${actionId}`);
    return response.data;
  },

  removeFavourite: async (actionId) => {
    const response = await api.delete(`/favourites/${actionId}`);
    return response.data;
  },

  // User actions
  getTodayActions: async () => {
    const response = await api.get('/user-actions/today');
    return response.data;
  },

  startAction: async (actionId) => {
    const response = await api.post(`/user-actions/start/${actionId}`);
    return response.data;
  },

  completeAction: async (userActionId, proofData = {}) => {
    const response = await api.put(`/user-actions/complete/${userActionId}`, proofData);
    return response.data;
  },

  cancelAction: async (userActionId) => {
    const response = await api.put(`/user-actions/cancel/${userActionId}`);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/user-actions/history');
    return response.data;
  },

  getHistoryById: async (id) => {
    const response = await api.get(`/user-actions/history/${id}`);
    return response.data;
  },

  // Proof
  getProofByAction: async (actionId) => {
    const response = await api.get(`/proofs/action/${actionId}`);
    return response.data;
  },

  uploadProof: async (userActionId, imageAsset) => {
    const formData = new FormData();
    formData.append(
      'image',
      createImageUploadFile(imageAsset, `proof_${userActionId}.jpg`)
    );
    const response = await api.post(
      `/proofs/upload/${userActionId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      }
    );
    return response.data;
  },

  validateProof: async (userActionId, imagePath) => {
    const response = await api.post(
      `/proofs/validate/${userActionId}`,
      { imagePath },
      { timeout: 30000 }
    );
    return response.data;
  },

  deleteProof: async (userActionId, imagePath = null) => {
    const response = await api.delete(`/proofs/delete/${userActionId}`, {
      data: imagePath ? { imagePath } : {},
    });
    return response.data;
  },

};

export default actionService;
