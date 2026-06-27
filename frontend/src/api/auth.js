const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

export const authAPI = {
  /**
   * Registers a brand new student account into the system database
   */
  register: async (email, password, full_name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password , full_name}),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }
    return response.json();
  },

  /**
   * Logs a student into the system, returning their secure JWT token card
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }
    return response.json();
  },

  /**
   * Transmits general lifestyle metrics and raw subject marks to the backend data layer
   */
  submitProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/profile/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update profile metrics.");
    }
    return response.json();
  },

  /**
   * Forwards user input messages to the AI Tutor Core system endpoint
   */
  sendChatMessage: async (messageText) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/query`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message: messageText }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Chat request failed");
    }
    return response.json();
  },
  /*profile-- me*/
  async getProfile() {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "http://127.0.0.1:8000/api/v1/profile/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Profile not found");
    }
    return await response.json();
  },

  /**
   * NEW: Fetches real-time predictive GPA and optimization recommendations from the ML layer
   */
  fetchAnalytics: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/predict/analyze`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to compile predictive analytics.");
    }
    return response.json();
  }
};