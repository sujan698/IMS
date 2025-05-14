"use client";

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { App as AntApp } from "antd";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import Users from "./pages/users";
import Items from "./pages/items";
import Sales from "./pages/sales";
import Purchases from "./pages/purchases";
import CustomerVendors from "./pages/customers-vendors";
import Layout from "./components/layout";
import ProtectedRoute from "./components/protected-route";
import type { RootState } from "./app/store";
import { refreshToken } from "./features/auth/authSlice";
import websocketService from "./services/websockets";
import type { AppDispatch } from "./app/store";

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Try to refresh token on app load
    dispatch(refreshToken());
  }, [dispatch]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      websocketService.connect();
    } else {
      websocketService.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <AntApp>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/items" element={<Items />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route
              path="/customers"
              element={<Navigate to="/customer-vendors?type=customers" />}
            />
            <Route
              path="/vendors"
              element={<Navigate to="/customer-vendors?type=vendors" />}
            />
            <Route path="/customer-vendors" element={<CustomerVendors />} />
          </Route>
        </Route>
      </Routes>
    </AntApp>
  );
}

export default App;
