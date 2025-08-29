const API_BASE_URL = 'http://localhost:3001/api';

class TrainingSessionsAPI {
  // Get all training sessions
  async getAllSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // Get training session by ID
  async getSessionById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Training session not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  // Create new training session
  async createSession(sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Update training session
  async updateSession(id, sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Training session not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // Delete training session
  async deleteSession(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Training session not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}

export default new TrainingSessionsAPI();
