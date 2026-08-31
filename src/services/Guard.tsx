import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

interface RouteProps {
  element: React.ReactElement;
}

// Protects authenticated routes
export const ProtectedRoute = ({ element }: RouteProps) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// Protects authenticated routes
export const DreamTeamLeaderRoute = ({ element }: RouteProps) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// Protects admin routes
export const AdminRoute = ({ element }: RouteProps) => {
  const location = useLocation();
  return ApiService.isAdmin() ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};
