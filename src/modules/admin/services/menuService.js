/**
 * Menu Management API Service
 * Handles all API calls for menu management operations from the admin panel
 */

import axios from "axios";

const BASE = "/api/menus";

class MenuService {
  /**
   * Get all menus (admin list)
   */
  static async getAllMenus(params = {}) {
    try {
      const response = await axios.get(`${BASE}/`, { params });
      if (Array.isArray(response.data)) return response.data;
      return response.data?.results || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /api/menus/user-assignments/?user_id={userId}
   * Returns list of menu IDs directly assigned to a user
   */
  static async getUserDirectAssignments(userId) {
    try {
      const response = await axios.get(`${BASE}/user-assignments/`, {
        params: { user_id: userId },
      });
      return response.data?.data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET /api/menus/user-effective-menus/?user_id={userId}
   * Returns all menus with role_based, direct_assigned, effective flags
   */
  static async getUserEffectiveMenus(userId) {
    try {
      const response = await axios.get(`${BASE}/user-effective-menus/`, {
        params: { user_id: userId },
      });
      return response.data?.data || null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /api/menus/user-assignments/
   * Bulk-replace the direct menu assignments for a user
   * @param {string} userId
   * @param {string[]} menuIds - full set of menu IDs to assign directly
   */
  static async bulkAssignMenusToUser(userId, menuIds) {
    try {
      const response = await axios.post(`${BASE}/user-assignments/`, {
        user_id: userId,
        menu_ids: menuIds,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /api/menus/{menuId}/assign-role/
   */
  static async assignMenuToRole(menuId, role, organizationId = null) {
    try {
      const response = await axios.post(`${BASE}/${menuId}/assign-role/`, {
        role,
        organization: organizationId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST /api/menus/{menuId}/remove-role/
   */
  static async removeMenuFromRole(menuId, role, organizationId = null) {
    try {
      const response = await axios.post(`${BASE}/${menuId}/remove-role/`, {
        role,
        organization: organizationId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  static handleError(error) {
    if (error.response) {
      const { data } = error.response;
      const message =
        data?.error || data?.detail || data?.message || "An error occurred";
      return new Error(message);
    }
    return error;
  }
}

export default MenuService;
