import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  FileText, 
  Star, 
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardHome from './DashboardHome';
import LessonsManager from './LessonsManager';
import VideosManager from './VideosManager';
import FilesManager from './FilesManager';
import ReviewsManager from './ReviewsManager';
import MessagesManager from './MessagesManager';
import SettingsManager from './SettingsManager';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { path: '/dashboard/lessons', label: 'الدروس', icon: BookOpen },
    { path: '/dashboard/videos', label: 'الفيديوهات', icon: Video },
    { path: '/dashboard/files', label: 'الملفات', icon: FileText },
    { path: '/dashboard/reviews', label: 'التقييمات', icon: Star },
    { path: '/dashboard/messages', label: 'الرسائل', icon: MessageSquare },
    { path: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">لوحة التحكم</h2>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 ${
                  isActive(item.path) ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 ml-3" />
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 mt-4"
          >
            <LogOut className="w-5 h-5 ml-3" />
            تسجيل الخروج
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Home className="w-5 h-5 ml-1" />
                <span>الموقع</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/lessons" element={<LessonsManager />} />
            <Route path="/videos" element={<VideosManager />} />
            <Route path="/files" element={<FilesManager />} />
            <Route path="/reviews" element={<ReviewsManager />} />
            <Route path="/messages" element={<MessagesManager />} />
            <Route path="/settings" element={<SettingsManager />} />
          </Routes>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;