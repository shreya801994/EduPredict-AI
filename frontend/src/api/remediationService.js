import axios from "axios";

const API_BASE_URL =
  "http://127.0.0.1:8000/api/v1";

export const remediationService = {

  async getWeakAreas(studentId) {

    const response = await axios.get(
      `${API_BASE_URL}/attempts/student/${studentId}/topics`
    );

    return response.data;
  }
};