import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { user_id, full_name, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.role !== "patient") {
      throw new Error(
        "This app is for patients only. Please use the doctor or admin website to log in."
      );
    }
    await AsyncStorage.setItem("token", data.access_token);
    const userObj = {
      user_id: data.user_id,
      full_name: data.full_name,
      role: data.role,
    };
    await AsyncStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (full_name, email, phone, password) => {
    const { data } = await api.post("/auth/register", {
      full_name,
      email,
      phone,
      password,
      role: "patient",
    });
    await AsyncStorage.setItem("token", data.access_token);
    const userObj = {
      user_id: data.user_id,
      full_name: data.full_name,
      role: data.role,
    };
    await AsyncStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
