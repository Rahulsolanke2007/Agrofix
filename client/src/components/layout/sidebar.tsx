import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Store, ShoppingBag, Heart, User, Settings, LogOut, LayoutDashboard, Package, Users } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const getLinkClass = (path: string) => {
    const isActive = location === path || (path !== "/" && location.startsWith(path));
    return `sidebar-item ${isActive ? "active" : ""}`;
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-sidebar z-20 transform transition-transform duration-300 ease-in-out ${
        isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-primary">
          <h1 className="text-2xl font-bold text-white font-poppins">GreenGrocer</h1>
        </div>

        {/* User Profile */}
        <div className="flex items-center px-4 py-5 border-b border-sidebar-border">
          <Avatar className="w-10 h-10 border-2 border-sidebar-border">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} />
            ) : (
              <AvatarFallback className="bg-sidebar-primary text-sidebar-background">
                {user?.fullName?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.fullName || "Guest"}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role || "Not logged in"}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {user?.role === "customer" && (
            <>
              <div className={getLinkClass("/")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/";
                }}>
                  <Store className="sidebar-icon" />
                  <span>Shop</span>
                </div>
              <div className={getLinkClass("/orders")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/orders";
                }}>
                  <ShoppingBag className="sidebar-icon" />
                  <span>My Orders</span>
                </div>
              <div className={getLinkClass("/favorites")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/favorites";
                }}>
                  <Heart className="sidebar-icon" />
                  <span>Favorites</span>
                </div>
              <div className={getLinkClass("/profile")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/profile";
                }}>
                  <User className="sidebar-icon" />
                  <span>Profile</span>
                </div>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <div className={getLinkClass("/admin")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/admin";
                }}>
                  <LayoutDashboard className="sidebar-icon" />
                  <span>Dashboard</span>
                </div>
              <div className={getLinkClass("/admin/orders")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/admin/orders";
                }}>
                  <ShoppingBag className="sidebar-icon" />
                  <span>Orders</span>
                </div>
              <div className={getLinkClass("/admin/products")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/admin/products";
                }}>
                  <Package className="sidebar-icon" />
                  <span>Products</span>
                </div>
              <div className={getLinkClass("/admin/customers")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/admin/customers";
                }}>
                  <Users className="sidebar-icon" />
                  <span>Customers</span>
                </div>
              <div className={getLinkClass("/admin/settings")} onClick={() => {
                  handleLinkClick();
                  window.location.href = "/admin/settings";
                }}>
                  <Settings className="sidebar-icon" />
                  <span>Settings</span>
                </div>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="flex w-full items-center px-4 py-3 text-sidebar-foreground hover:bg-white/10 rounded-lg"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="sidebar-icon" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
