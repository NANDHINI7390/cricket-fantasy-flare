
import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Brain, Bell, TrendingUp, Users, Trophy, Home, User, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdvancedNavigation: React.FC = () => {
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/analytics", icon: BarChart3, label: "Analytics", badge: "AVP" },
    { path: "/ai-optimizer", icon: Brain, label: "AI Optimizer", badge: "New" },
    { path: "/contests", icon: Trophy, label: "Contests" },
    { path: "/my-teams", icon: Users, label: "My Teams" },
    { path: "/leaderboard", icon: TrendingUp, label: "Leaderboard" },
    { path: "/wallet", icon: Wallet, label: "Wallet" },
    { path: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems.map(({ path, icon: Icon, label, badge }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs ml-1">
              {badge}
            </Badge>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdvancedNavigation;
