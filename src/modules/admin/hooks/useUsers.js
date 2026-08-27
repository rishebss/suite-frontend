/**
 * Custom hook for user management
 */

import { useState, useCallback, useEffect } from "react";
import UserService from "../services/userService";

/**
 * useUsers hook - Manages users list with filtering and pagination
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20,
  });

  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await UserService.getUsers({
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setUsers(result.results || []);
        setPagination((prev) => ({
          ...prev,
          count: result.count,
          next: result.next,
          previous: result.previous,
        }));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  const createUser = useCallback(
    async (userData, fetchParams = {}) => {
      setError(null);
      try {
        const result = await UserService.createUser(userData);
        // Refresh list
        await fetchUsers(fetchParams);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (userId, userData, fetchParams = {}) => {
      console.log("useUsers.updateUser: userId =", userId, "userData =", userData, "fetchParams =", fetchParams);
      setError(null);
      try {
        const result = await UserService.updateUser(userId, userData);
        console.log("useUsers.updateUser: API result =", result);
        // Refresh list
        await fetchUsers(fetchParams);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (userId, fetchParams = {}) => {
      setError(null);
      try {
        const result = await UserService.deleteUser(userId);
        // Update local state immediately instead of re-fetching
        setUsers(prev => prev.filter(user => user.id !== userId));
        setPagination(prev => ({
          ...prev,
          count: prev.count - 1
        }));
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [],
  );

  const bulkUpdateUsers = useCallback(
    async (userIds, updates, fetchParams = {}) => {
      setError(null);
      try {
        const result = await UserService.bulkUpdateUsers(userIds, updates);
        // Update local state if we have updated users data
        if (result.updated_users) {
          setUsers(prev => prev.map(user => {
            const updated = result.updated_users.find(u => u.id === user.id);
            return updated || user;
          }));
        } else {
          // Fallback to re-fetching if no updated users data
          await fetchUsers(fetchParams);
        }
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchUsers],
  );

  const bulkDeleteUsers = useCallback(
    async (userIds, fetchParams = {}) => {
      setError(null);
      try {
        const result = await UserService.bulkDeleteUsers(userIds);
        // Update local state immediately instead of re-fetching
        setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
        setPagination(prev => ({
          ...prev,
          count: prev.count - (result.deleted_count || userIds.length)
        }));
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [],
  );

  return {
    users,
    loading,
    error,
    pagination,
    setPagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
  };
};

/**
 * useAuditLog hook - Manages audit log viewing
 */
export const useAuditLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20,
  });

  const fetchUserActivities = useCallback(
    async (userId, params = {}) => {
      setLoading(true);
      setActivities([]); // Clear immediately so stale data doesn't linger
      setError(null);
      try {
        const result = await UserService.getUserActivities(userId, {
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setActivities(result.results || result.data || []);
        if (result.results) {
          setPagination((prev) => ({
            ...prev,
            count: result.count,
            next: result.next,
            previous: result.previous,
          }));
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  const fetchAllActivities = useCallback(
    async (params = {}) => {
      setLoading(true);
      setActivities([]); // Clear immediately so stale data doesn't linger
      setError(null);
      try {
        const result = await UserService.getAllActivities({
          page: pagination.page,
          page_size: pagination.pageSize,
          ...params,
        });

        setActivities(result.results || []);
        setPagination((prev) => ({
          ...prev,
          count: result.count,
          next: result.next,
          previous: result.previous,
        }));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  return {
    activities,
    loading,
    error,
    pagination,
    setPagination,
    fetchUserActivities,
    fetchAllActivities,
  };
};

/**
 * useUserDetail hook - Get single user with activities
 */
export const useUserDetail = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await UserService.getUserById(userId);
      setUser(result.data || result);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [userId, fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};
/**
 * useDepartments hook - Manages department list
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeletingDepartment, setIsDeletingDepartment] = useState(null);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await UserService.getDepartments({ page_size: 100 });
      const data = result.results || result.data || (Array.isArray(result) ? result : []);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = useCallback(async (departmentData) => {
    setIsCreatingDepartment(true);
    setError(null);
    try {
      const result = await UserService.createDepartment(departmentData);
      // Refresh the list
      await fetchDepartments();
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error creating department:", err);
      throw err;
    } finally {
      setIsCreatingDepartment(false);
    }
  }, [fetchDepartments]);

  const deleteDepartment = useCallback(async (departmentId) => {
    setIsDeletingDepartment(departmentId);
    setError(null);
    try {
      const result = await UserService.deleteDepartment(departmentId);
      // Update local state immediately
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
      return result;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting department:", err);
      throw err;
    } finally {
      setIsDeletingDepartment(null);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    deleteDepartment,
    isDeletingDepartment,
    isCreatingDepartment,
  };
};
