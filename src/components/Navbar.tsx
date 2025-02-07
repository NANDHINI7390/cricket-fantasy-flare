import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Home, Info, QuestionMarkCircle } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", icon: <Home className="w-5 h-5" />, path: "/" },
    { label: "Features", path: "/features" },
    { label: "Leagues", path: "/leagues" },
    { label: "About", icon: <Info className="w-5 h-5" />, path: "/about" },
    { label: "FAQ", icon: <QuestionMarkCircle className="w-5 h-5" />, path: "/faq" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
    hover: { scale: 1.1, rotate: 2, transition: { type: "spring", stiffness: 500 } },
  };

  // Animation variants for the mobile menu container
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.4 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 to-blue-900 backdrop-blur-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name with animation on hover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }}
            whileHover={{ scale: 1.1, rotate: -2 }}
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Cricket Fantasy Elite"
              className="h-10 w-auto rounded-full shadow-md"
            />
            <span className="ml-3 text-2xl font-extrabold text-white">
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
                className="text-white px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-all"
              >
                {item.icon && item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={toggleMenu}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
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
            className="md:hidden bg-gradient-to-b from-purple-900 to-blue-900"
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
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white transition-all flex items-center space-x-2 w-full text-left"
                >
                  {item.icon && item.icon}
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
