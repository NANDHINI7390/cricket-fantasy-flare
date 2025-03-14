
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Trophy, UserCircle, Users, LogIn, ChevronDown, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Menu items
  const menuItems = [
    { label: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { label: "Contests", path: "/contests", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { label: "Leaderboard", path: "/leaderboard", icon: <Users className="h-4 w-4 mr-2" /> },
    { label: "My Teams", path: "/my-teams", icon: <UserCircle className="h-4 w-4 mr-2" /> },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <span className="text-white">Cricket</span>
            <span className="text-purple-200">Fantasy</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-white/10 text-white"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Account
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/auth" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Login / Sign Up</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-white hover:text-gray-200 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-purple-800 to-indigo-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <Link
              to="/auth"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login / Sign Up
            </Link>
            <button
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
