
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, User, Settings, List, Wallet, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while signing out");
    }
  };

  return (
    <nav className="bg-[#1A1F2C] text-white border-b border-[#2A2F3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              Fantasy Cricket Elite
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-[#9b87f5] transition-colors">
              Home
            </Link>
            <Link to="/leagues" className="hover:text-[#9b87f5] transition-colors">
              Leagues
            </Link>
            <Link to="/matches" className="hover:text-[#9b87f5] transition-colors">
              Matches
            </Link>
            <Link to="/about" className="hover:text-[#9b87f5] transition-colors">
              About
            </Link>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-[#2A2F3C]">
                    <User className="h-5 w-5" />
                    <span className="ml-2">{session.user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#2A2F3C] text-white border-[#3A3F4C]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#3A3F4C]" />
                  <DropdownMenuItem className="hover:bg-[#3A3F4C] cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3A3F4C] cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3A3F4C] cursor-pointer">
                    <List className="mr-2 h-4 w-4" />
                    <span>My Leagues</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#3A3F4C] cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet & Transactions</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#3A3F4C]" />
                  <DropdownMenuItem 
                    className="hover:bg-[#3A3F4C] cursor-pointer text-red-400"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-[#9b87f5] hover:bg-[#8b77e5]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-[#9b87f5] hover:bg-[#2A2F3C] transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md hover:text-[#9b87f5] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/leagues"
                className="block px-3 py-2 rounded-md hover:text-[#9b87f5] transition-colors"
              >
                Leagues
              </Link>
              <Link
                to="/matches"
                className="block px-3 py-2 rounded-md hover:text-[#9b87f5] transition-colors"
              >
                Matches
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md hover:text-[#9b87f5] transition-colors"
              >
                About
              </Link>
              
              {session ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 hover:text-[#9b87f5] transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 hover:text-[#9b87f5] transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <Link
                    to="/my-leagues"
                    className="flex items-center px-3 py-2 hover:text-[#9b87f5] transition-colors"
                  >
                    <List className="h-4 w-4 mr-2" />
                    My Leagues
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex items-center px-3 py-2 hover:text-[#9b87f5] transition-colors"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet & Transactions
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="block px-3 py-2">
                  <Button variant="default" className="w-full bg-[#9b87f5] hover:bg-[#8b77e5]">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
