import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  Youtube
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">منصة الأستاذ</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة تعليمية متكاملة تقدم أفضل الدروس والمحتوى التعليمي بطريقة مبتكرة وفعالة.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">روابط سريعة</h3>
            <div className="space-y-2">
              <Link to="/lessons" className="block text-gray-300 hover:text-white transition-colors duration-200">
                الدروس
              </Link>
              <Link to="/videos" className="block text-gray-300 hover:text-white transition-colors duration-200">
                الفيديوهات
              </Link>
              <Link to="/files" className="block text-gray-300 hover:text-white transition-colors duration-200">
                الملفات
              </Link>
              <Link to="/reviews" className="block text-gray-300 hover:text-white transition-colors duration-200">
                التقييمات
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المحتوى</h3>
            <div className="space-y-2">
              <Link to="/lessons?level=مبتدئ" className="block text-gray-300 hover:text-white transition-colors duration-200">
                مستوى مبتدئ
              </Link>
              <Link to="/lessons?level=متوسط" className="block text-gray-300 hover:text-white transition-colors duration-200">
                مستوى متوسط
              </Link>
              <Link to="/lessons?level=متقدم" className="block text-gray-300 hover:text-white transition-colors duration-200">
                مستوى متقدم
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors duration-200">
                عن الأستاذ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <a href="mailto:info@teacher-platform.com" className="text-gray-300 hover:text-white transition-colors duration-200">
                  info@teacher-platform.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <a href="tel:+966500000000" className="text-gray-300 hover:text-white transition-colors duration-200">
                  +966 5 0000 0000
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-1" />
                <span className="text-gray-300">
                  المملكة العربية السعودية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} منصة الأستاذ. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;