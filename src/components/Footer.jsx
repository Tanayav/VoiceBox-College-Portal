import React from 'react';
import { MessageSquare, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">VoiceBox</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Empowering students to voice their concerns securely and transparently. 
              Bridging the gap between campus administration and student life.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
              <li><a href="/about" className="hover:text-blue-400 transition">About Us</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition">Login</a></li>
              <li><a href="/signup" className="hover:text-blue-400 transition">Sign Up</a></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>help@voicebox.edu</li>
              <li>+91 98765 43210</li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="hover:text-blue-400"><Twitter size={20} /></a>
                <a href="#" className="hover:text-blue-400"><Linkedin size={20} /></a>
                <a href="#" className="hover:text-blue-400"><Instagram size={20} /></a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} VoiceBox Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;