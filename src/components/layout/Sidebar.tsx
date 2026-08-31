import { Link, useLocation } from "react-router-dom";
import ApiService from "@/services/ApiService";
import { 
  LayoutDashboard, 
  LogOut,
  Leaf,
  User
} from "lucide-react";

const Sidebar = () => {
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const location = useLocation();

  const logout = () => {
    ApiService.logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: isAuth },
    { path: "/profile", label: "Profile", icon: User, show: isAuth },
    { path: "/register", label: "Register User", icon: User, show: isAdmin }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Leaf className="w-8 h-8" />
        </div>
        <div className="sidebar-brand">
          <h1>99 Lawn Care</h1>
          <span>Inventory System</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-links">
          {navItems.map((item) => 
            item.show && (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={isActive(item.path) ? "active" : ""}
                >
                  <item.icon className="nav-icon" />
                  {item.label}
                </Link>
              </li>
            )
          )}
          
          {isAuth && (
            <li>
              <Link onClick={logout} to="/login" className="logout-link">
                <LogOut className="nav-icon" />
                Logout
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
