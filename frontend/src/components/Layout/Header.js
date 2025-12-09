import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Star, 
  User, 
  MessageSquare, 
  Menu, 
  X,
  LogOut,
  Settings
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: BookOpen },
    { path: '/lessons', label: 'الدروس', icon: FileText },
    { path: '/videos', label: 'الفيديوهات', icon: Video },
    { path: '/files', label: 'الملفات', icon: FileText },
    { path: '/reviews', label: 'التقييمات', icon: Star },
    { path: '/about', label: 'من أنا', icon: User },
    { path: '/contact', label: 'تواصل', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header 
      className="bg-white shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">منصة الأستاذ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span>لوحة التحكم</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden py-4 border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>لوحة التحكم</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-right"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;