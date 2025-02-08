
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-secondary text-white">
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
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/leagues" className="hover:text-primary transition-colors">
              Leagues
            </Link>
            <Link to="/matches" className="hover:text-primary transition-colors">
              Matches
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/auth">
              <Button variant="default" className="ml-4">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-primary hover:bg-secondary/80 transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/leagues"
                className="block px-3 py-2 rounded-md hover:text-primary transition-colors"
              >
                Leagues
              </Link>
              <Link
                to="/matches"
                className="block px-3 py-2 rounded-md hover:text-primary transition-colors"
              >
                Matches
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link to="/auth" className="block px-3 py-2">
                <Button variant="default" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
