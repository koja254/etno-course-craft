import { useCallback, useEffect, useState } from "react";
import type { UserRole } from "@/lib/roles";

const USER_ROLE_STORAGE_KEY = "etno:user-type";

const defaultRole: UserRole = "program-manager";

const readStoredRole = (): UserRole => {
  if (typeof window === "undefined") {
    return defaultRole;
  }

  const stored = window.localStorage.getItem(USER_ROLE_STORAGE_KEY);
  if (!stored) return defaultRole;

  if (stored === "program-manager" || stored === "course-creator" || stored === "mentor") {
    return stored;
  }

  return defaultRole;
};

export const useUserRole = () => {
  const [role, setRoleState] = useState<UserRole>(readStoredRole);

  useEffect(() => {
    setRoleState(readStoredRole());
  }, []);

  const setRole = useCallback((nextRole: UserRole) => {
    setRoleState(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_ROLE_STORAGE_KEY, nextRole);
    }
  }, []);

  const clearRole = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_ROLE_STORAGE_KEY);
    }
    setRoleState(defaultRole);
  }, []);

  return { role, setRole, clearRole };
};

