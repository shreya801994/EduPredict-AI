const API_BASE_URL = import.meta.env.VITE_API_URL;

export const authAPI = {
  /**
   * Registers a brand new student account into the system database
   */
  register: async (email, password, full_name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        full_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }

    return response.json();
  },

  /**
   * Logs a student into the system
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    return response.json();
  },

  /**
   * Submit student profile
   */
  submitProfile: async (profileData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/profile/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to update profile metrics."
      );
    }

    return response.json();
  },

  /**
   * AI Tutor
   */
  sendChatMessage: async (messageText) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/chat/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Chat request failed");
    }

    return response.json();
  },

  /**
   * Fetch logged-in user profile
   */
  getProfile: async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Profile not found");
    }

    return response.json();
  },

  /**
   * Fetch ML analytics
   */
  fetchAnalytics: async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/predict/analyze`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to compile predictive analytics."
      );
    }

    return response.json();
  },
};