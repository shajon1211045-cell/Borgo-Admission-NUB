import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import apiClient, { LoginRequest, getDemoCredentials } from "../lib/api";
import type { User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  userType: "public" | "applicant" | "admin";
  role: string | null; // e.g., admin, admission_officer, finance_officer
  permissions: string[]; // list of granted permissions
  setRole: (role: string | null) => void;
  setPermissions: (perms: string[]) => void;
  isAllowed: (perm: string) => boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Demo helper to simulate signing in as a specific role (frontend-only)
  signInAs: (role: string) => void;
}

interface LoginCredentials {
  identifier: string; // Email for admin, University ID for applicant
  password: string;
  type: "applicant" | "admin";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Role & permissions (frontend-only mock storage)
  const [role, setRoleState] = useState<string | null>(null);
  const [permissions, setPermissionsState] = useState<string[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("nu_token");
        if (token) {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            // Load role/permissions from localStorage if present (frontend-only)
            const storedRole = localStorage.getItem("nu_user_role");
            const storedPerms = localStorage.getItem("nu_user_perms");
            if (storedRole) setRoleState(storedRole);
            if (storedPerms) setPermissionsState(JSON.parse(storedPerms));
          } else {
            // Clear invalid token
            localStorage.removeItem("nu_token");
            apiClient.clearToken();
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem("nu_token");
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);

    try {
      const loginRequest: LoginRequest = {
        identifier: credentials.identifier,
        password: credentials.password,
        type: credentials.type,
      };

      const response = await apiClient.login(loginRequest);

      if (response.success && response.data) {
        setUser(response.data.user);
        // default role mapping: admin type -> admin role
        const defaultRole =
          response.data.user.type === "admin" ? "admin" : "applicant";
        setRoleState(defaultRole);
        localStorage.setItem("nu_user_role", defaultRole);
        // default permissions for admin
        const defaultPerms = response.data.user.type === "admin" ? ["all"] : [];
        setPermissionsState(defaultPerms);
        localStorage.setItem("nu_user_perms", JSON.stringify(defaultPerms));

        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("nu_token");
      apiClient.clearToken();
      setRoleState(null);
      setPermissionsState([]);
      localStorage.removeItem("nu_user_role");
      localStorage.removeItem("nu_user_perms");
    }
  };

  const setRole = (r: string | null) => {
    setRoleState(r);
    if (r) localStorage.setItem("nu_user_role", r);
    else localStorage.removeItem("nu_user_role");
  };

  const setPermissions = (perms: string[]) => {
    setPermissionsState(perms);
    localStorage.setItem("nu_user_perms", JSON.stringify(perms));
  };

  const isAllowed = (perm: string) => {
    if (permissions.includes("all")) return true;
    return permissions.includes(perm);
  };

  const userType = user?.type || "public";
  const isAuthenticated = !!user;

  // Demo helper to sign in as a specific role without real backend auth
  const signInAs = (r: string) => {
    // create a mock admin user in session
    const demoUser: User = {
      id: 9999,
      name:
        r === "admission_officer"
          ? "Admission Officer (Demo)"
          : r === "finance_officer"
            ? "Finance Officer (Demo)"
            : r === "offline_officer"
              ? "Offline Admission Staff (Demo)"
              : "Admin (Demo)",
      email: r + "@nu.demo",
      type: "admin",
      department: r === "finance_officer" ? "Finance" : "Admissions",
    } as User;

    setUser(demoUser);
    localStorage.setItem("nu_token", "demo-token");
    // Set role and default permissions per role
    setRole(r);
    if (r === "admin") setPermissions(["all"]);
    else if (r === "admission_officer")
      setPermissions([
        "applications:view",
        "applications:approve",
        "waivers:manage",
      ]);
    else if (r === "finance_officer")
      setPermissions(["finance:view", "finance:billing"]);
    else if (r === "offline_officer") setPermissions([]);
    else setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        role,
        permissions,
        setRole,
        setPermissions,
        isAllowed,
        login,
        logout,
        isLoading,
        isAuthenticated,
        signInAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn(
      "useAuth called outside AuthProvider — returning fallback values",
    );
    // Provide safe defaults to prevent app crash during demo/partial mounting
    return {
      user: null,
      userType: "public",
      role: null,
      permissions: [],
      setRole: () => {},
      setPermissions: () => {},
      isAllowed: () => false,
      login: async () => false,
      logout: () => {},
      isLoading: false,
      isAuthenticated: false,
      signInAs: () => {},
    } as AuthContextType;
  }
  return context;
}

// Export demo credentials for easy access
export { getDemoCredentials };
