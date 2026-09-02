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

// Protects admin and dream team leader routes
export const LeaderRoute = ({ element }: RouteProps) => {
  const location = useLocation();
  if (ApiService.canViewGroupRoster()) return element;
  if (ApiService.isAuthenticated()) return <Navigate to="/profile" replace />;
  return <Navigate to="/login" replace state={{ from: location }} />;
};

export const DreamTeamLeaderRoute = LeaderRoute;

// Protects admin routes
export const AdminRoute = ({ element }: RouteProps) => {
  const location = useLocation();
  if (ApiService.isAdmin()) return element;
  if (ApiService.isAuthenticated()) return <Navigate to="/groups" replace />;
  return <Navigate to="/login" replace state={{ from: location }} />;
};
