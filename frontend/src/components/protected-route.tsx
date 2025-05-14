import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import type { RootState } from "../app/store";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) =>
      state.auth as { isAuthenticated: boolean; isLoading: boolean }
  );

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
