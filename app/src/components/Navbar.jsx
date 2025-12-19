import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Menu, X, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Helper to handle scrolling if we are already on the home page
  const handleScrollToFeatures = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('features');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl transition-transform group-hover:scale-110">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">VoiceBox</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition">About Us</Link>
            
            {/* FIXED: Works from any page */}
            {location.pathname === '/' ? (
              <button onClick={handleScrollToFeatures} className="text-gray-600 hover:text-blue-600 font-medium transition">Features</button>
            ) : (
              <a href="/#features" className="text-gray-600 hover:text-blue-600 font-medium transition">Features</a>
            )}

            <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-gray-900 font-bold hover:text-blue-600 transition">
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-black text-white px-5 py-2.5 rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-lg shadow-gray-200"
            >
              Get Started <ChevronRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" className="block py-3 text-gray-600 font-medium border-b border-gray-50">Home</Link>
            <Link to="/about" className="block py-3 text-gray-600 font-medium border-b border-gray-50">About</Link>
            <a href="/#features" className="block py-3 text-gray-600 font-medium border-b border-gray-50">Features</a>
            <Link to="/contact" className="block py-3 text-gray-600 font-medium border-b border-gray-50">Contact</Link>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-3 font-bold text-gray-700 border border-gray-200 rounded-lg">Login</Link>
              <Link to="/signup" className="w-full text-center py-3 bg-blue-600 text-white rounded-lg font-bold">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;