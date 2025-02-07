
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Info, HelpCircle } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", icon: <Home className="w-5 h-5" />, path: "/" },
    { label: "Features", path: "/features" },
    { label: "Leagues", path: "/leagues" },
    { label: "About", icon: <Info className="w-5 h-5" />, path: "/about" },
    { label: "FAQ", icon: <HelpCircle className="w-5 h-5" />, path: "/faq" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 500 } },
  };

  // Variants for desktop active underline on hover
  const underlineVariants = {
    hidden: { width: 0 },
    visible: { width: "100%", transition: { duration: 0.3 } },
  };

  // Animation variants for the mobile menu container
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto", 
      transition: { 
        duration: 0.4, 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      transition: { duration: 0.3 } 
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name with animation on hover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFF8qxxTwvGkH5c8LzKl1BQZKqdp2CV3QV5nUEsqSg1ygegLmqRygjOUTpWK8UgsU&s"
              alt="Cricket Fantasy Elite"
              className="h-10 w-auto rounded-full shadow-sm transition-all duration-300 group-hover:shadow-md"
            />
            <span className="ml-3 text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Fantasy Cricket Elite
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {menuItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.path)}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="relative text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-all duration-300"
              >
                {item.icon && <span className="text-primary/80">{item.icon}</span>}
                <span>{item.label}</span>
                <motion.div
                  variants={underlineVariants}
                  initial="hidden"
                  whileHover="visible"
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/20 rounded-full"
                />
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  variants={itemVariants}
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 text-left"
                >
                  {item.icon && <span className="text-primary/80">{item.icon}</span>}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
