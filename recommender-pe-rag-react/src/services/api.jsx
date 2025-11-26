import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  // GET /ai/health - Retorna HealthStatusDTO
  async getHealth() {
    const response = await api.get('/ai/health');
    return response.data;
  },

  // GET /ai/history - Retorna PageChatConversationDTO
  // Swagger Parameters: page (int), size (int), sort (array)
  async getHistory(page = 0, size = 10) {
    const response = await api.get('/ai/history', {
      params: { 
        page, 
        size, 
        sort: 'localData,desc' // Swagger indica ordenação
      }
    });
    return response.data;
  },

  // GET /ai/chat/{model} - Streaming via EventSource
  createEventSource(model, message) {
    const encodedMessage = encodeURIComponent(message);
    const url = `${API_BASE_URL}/ai/chat/${model}?message=${encodedMessage}`;
    return new EventSource(url);
  },
};