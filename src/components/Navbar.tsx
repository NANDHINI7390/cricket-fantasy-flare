
import { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Trophy,
  UserCircle,
  Users,
  LogIn,
  ChevronDown,
  Home,
  LogOut,
  CircleUser,
  CreditCard,
  ListChecks,
  Wallet,
  BarChart3,
  Crown,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationSystem from "./NotificationSystem";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Menu items
  const mainMenuItems = [
    { label: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { label: "Leagues", path: "/leagues", icon: <ListChecks className="h-4 w-4 mr-2" /> },
    { label: "Contests", path: "/contests", icon: <Trophy className="h-4 w-4 mr-2" /> },
    { label: "Player Analysis", path: "/player-analysis", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { label: "Leaderboard", path: "/leaderboard", icon: <Users className="h-4 w-4 mr-2" /> },
    { label: "My Teams", path: "/my-teams", icon: <UserCircle className="h-4 w-4 mr-2" /> },
    { label: "Subscription", path: "/subscription", icon: <Crown className="h-4 w-4 mr-2" /> },
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
    <nav className="bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-800 text-white shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center space-x-3 text-xl font-bold hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-black">🏏</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white text-lg leading-none">Cricket AI</span>
                <span className="text-purple-200 text-xs leading-none">Fantasy Elite</span>
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {mainMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                  ${isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                    }`
                }
              >{item.icon}{item.label}</NavLink>
            ))}

            {isLoading ? null : user ? (
              <>
                <NotificationSystem />
                <NavLink
                  to={"/wallet"}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                    ${isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                      }`
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="ml-1">
                    Wallet
                  </span>
                </NavLink>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <CircleUser className="h-4 w-4 mr-2" />
                      Account
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <CircleUser className="h-4 w-4 mr-2" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/auth" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login / Sign Up
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-gray-200 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainMenuItems.map((item) => (
              <Link
                to={item.path}
                key={item.label}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors
                  ${isActive(item.path)
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {user && (
                <Link
                  to="/wallet"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive("/wallet")
                      ? "bg-white/10 text-white"
                      : "text-gray-300  hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Link>
              )}

           

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CircleUser className="h-4 w-4 mr-2" />
                  My Profile
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
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
