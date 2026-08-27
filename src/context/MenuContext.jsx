/**
 * Menu Context
 * Manages dynamic menu loading based on user role, organization, and product purchases.
 * Menus are 100% driven by the database — run `python manage.py seed_menus`
 * on a fresh DB to populate default system menus.
 *
 * Usage:
 *   const { menus, sections, loading, error, refreshMenus } = useMenu();
 */
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

export const MenuContext = createContext({
  menus: [],
  sections: {},
  loading: true,
  error: null,
  refreshMenus: async () => {},
});

/**
 * MenuProvider Component
 * Wraps the application and provides menu data to all child components
 */
// Increment this when menu data structure changes to auto-bust stale caches
const CACHE_VERSION = "v2";

export function MenuProvider({ children }) {
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshMenus = useCallback(
    async (force = false) => {
      if (!user) {
        setMenus([]);
        setSections({});
        setLoading(false);
        return;
      }

      // Use cached data if available and not forcing refresh
      const cacheKey = `menus_${CACHE_VERSION}_${user.id || user.username}`;
      if (!force) {
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const { data, ts } = JSON.parse(cached);
            // Cache valid for 30 seconds to avoid stale menu assignments
            if (Date.now() - ts < 30 * 1000) {
              setMenus(data.all_menus || []);
              setSections(data.sections || {});
              setLoading(false);
              return;
            }
          }
        } catch (_) {}
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/menus/my_menus/");

        if (response.data?.success) {
          const data = response.data.data;
          const allMenus = data.all_menus || [];
          const sectionData = data.sections || {};

          // Warn developer if no menus returned — likely unseeded DB
          if (allMenus.length === 0) {
            console.warn(
              "[MenuContext] No menus returned from API. " +
                "Run `python manage.py seed_menus` on the backend to populate default menus.",
            );
          }

          setMenus(allMenus);
          setSections(sectionData);

          // Cache the result in sessionStorage (per-user, per-tab, 5-min TTL)
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: { all_menus: allMenus, sections: sectionData },
                ts: Date.now(),
              }),
            );
          } catch (_) {}
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("[MenuContext] Failed to load menus:", err);
        }
        setError(
          err.response?.data?.error || err.message || "Failed to load menus",
        );
        setMenus([]);
        setSections({});
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Re-fetch menus when the logged-in user changes (login / logout / switch account)
  useEffect(() => {
    refreshMenus();
  }, [user, refreshMenus]);

  const value = {
    menus,
    sections,
    loading,
    error,
    refreshMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/**
 * useMenu Hook
 * Use this hook to access menu data in any component.
 *
 * @returns {Object} { menus[], sections{}, loading, error, refreshMenus }
 * @throws {Error} If used outside MenuProvider
 */
export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
}
