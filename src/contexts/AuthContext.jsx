// src/contexts/AuthContext.jsx
import { createContext, useContext, useReducer } from "react";
const SERVER_URL = "http://localhost:9000";

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return {
        user: action.payload.user,
        error: null,
      };
    case "register":
      return {
        user: action.payload.user,
        error: null,
      };
    case "logout":
      return {
        user: null,
        error: null,
      };
    case "error":
      return {
        ...state,
        error: action.payload,
      };
    default:
      throw new Error("Unknown action");
  }
}

export default function AuthProvider({ children }) {
  const [{ user, error }, dispatch] = useReducer(reducer, initialState);

  async function authRequest(endpoint, body, errorMessage) {
    const res = await fetch(`${SERVER_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || errorMessage);
    }

    return data;
  }

  async function login(email, password) {
    try {
      const data = await authRequest(
        "login",
        { email, password },
        "Login failed"
      );

      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "login",
        payload: { user: data.user },
      });
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
      throw err;
    }
  }

  async function register(username, email, password) {
    try {
      const data = await authRequest(
        "register",
        { username, email, password },
        "Registration failed"
      );

      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "register",
        payload: { user: data.user },
      });
    } catch (err) {
      dispatch({ type: "error", payload: err.message });
      throw err;
    }
  }

  async function logout() {
    localStorage.removeItem("user");
    await fetch(`${SERVER_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}
