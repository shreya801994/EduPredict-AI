import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

export const quizAnalyticsService = {
  getAnalytics: async (studentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}/analytics`
    );
    return response.data;
  },

  getTopics: async (studentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}/topics`
    );
    return response.data;
  },

  getRecommendations: async (studentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}/recommendations`
    );
    return response.data;
  },

  getHistory: async (studentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}`
    );
    return response.data;
  },
};