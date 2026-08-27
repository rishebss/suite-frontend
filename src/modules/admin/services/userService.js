/**
 * User Management API Service
 * Handles all API calls for user management operations
 */

import axios from "axios";

const BASE = "/api/auth";

class UserService {
  /**
   * Get list of users with pagination and filters
   */
  static async getUsers(params = {}) {
    try {
      const response = await axios.get(`${BASE}/users/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get single user details
   */
  static async getUserById(userId) {
    try {
      const response = await axios.get(`${BASE}/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    try {
      const response = await axios.post(`${BASE}/users/`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId, userData) {
    try {
      const response = await axios.patch(`${BASE}/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete (deactivate) user
   */
  static async deleteUser(userId) {
    try {
      const response = await axios.delete(`${BASE}/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activities/audit log
   */
  static async getUserActivities(userId, params = {}) {
    try {
      const response = await axios.get(`${BASE}/users/${userId}/activities/`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(userIds, updates) {
    try {
      const response = await axios.patch(`${BASE}/users/bulk_update/`, {
        user_ids: userIds,
        updates,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk delete users
   */
  static async bulkDeleteUsers(userIds) {
    try {
      const response = await axios.post(`${BASE}/users/bulk-delete`, {
        user_ids: userIds,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all activities (global audit log)
   */
  static async getAllActivities(params = {}) {
    try {
      const response = await axios.get(`${BASE}/activities/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific activity details
   */
  static async getActivityById(activityId) {
    try {
      const response = await axios.get(`${BASE}/activities/${activityId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all departments
   */
  static async getDepartments(params = {}) {
    try {
      const response = await axios.get(`${BASE}/departments/`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create department
   */
  static async createDepartment(departmentData) {
    try {
      const response = await axios.post(`${BASE}/departments/`, departmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete department
   */
  static async deleteDepartment(departmentId) {
    try {
      const response = await axios.delete(`${BASE}/departments/${departmentId}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  static handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      let message = data?.message || data?.detail;
      if (!message && data && typeof data === "object") {
        message = Object.entries(data)
          .map(([field, errors]) => {
            const msgs = Array.isArray(errors) ? errors.join(", ") : String(errors);
            return `${field}: ${msgs}`;
          })
          .join(" | ");
      }
      return new Error(`${status} - ${message || "An error occurred"}`);
    }
    return error;
  }
}

export default UserService;
