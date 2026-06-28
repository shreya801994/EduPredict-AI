import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

export const remediationService = {
  async getWeakAreas(studentId) {
    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}/topics`
    );

    return response.data;
  },
};