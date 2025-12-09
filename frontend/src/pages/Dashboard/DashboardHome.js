import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Star, 
  MessageSquare,
  TrendingUp,
  Eye,
  Download,
  Users,
  Activity
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    lessons: 0,
    videos: 0,
    files: 0,
    reviews: 0,
    messages: 0,
    totalViews: 0,
    totalDownloads: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics
      const [
        lessonsCount,
        videosCount,
        filesCount,
        reviewsCount,
        messagesCount,
        totalViews,
        totalDownloads
      ] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact' }),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('files').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' }),
        supabase.from('videos').select('views'),
        supabase.from('files').select('downloads')
      ]);

      const totalViewsCount = totalViews.data?.reduce((sum, video) => sum + (video.views || 0), 0) || 0;
      const totalDownloadsCount = totalDownloads.data?.reduce((sum, file) => sum + (file.downloads || 0), 0) || 0;

      setStats({
        lessons: lessonsCount.count || 0,
        videos: videosCount.count || 0,
        files: filesCount.count || 0,
        reviews: reviewsCount.count || 0,
        messages: messagesCount.count || 0,
        totalViews: totalViewsCount,
        totalDownloads: totalDownloadsCount
      });

      // Fetch recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentMessages(messagesData || []);

      // Fetch recent reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

      setRecentReviews(reviewsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 ml-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <p className="text-gray-600">{title}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={BookOpen} 
          title="عدد الدروس" 
          value={stats.lessons} 
          color="bg-blue-500" 
          trend={12}
        />
        <StatCard 
          icon={Video} 
          title="عدد الفيديوهات" 
          value={stats.videos} 
          color="bg-green-500" 
          trend={8}
        />
        <StatCard 
          icon={FileText} 
          title="عدد الملفات" 
          value={stats.files} 
          color="bg-purple-500" 
          trend={15}
        />
        <StatCard 
          icon={Star} 
          title="عدد التقييمات" 
          value={stats.reviews} 
          color="bg-yellow-500" 
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Eye} 
          title="إجمالي المشاهدات" 
          value={stats.totalViews} 
          color="bg-indigo-500" 
        />
        <StatCard 
          icon={Download} 
          title="إجمالي التحميلات" 
          value={stats.totalDownloads} 
          color="bg-red-500" 
        />
        <StatCard 
          icon={MessageSquare} 
          title="الرسائل الجديدة" 
          value={stats.messages} 
          color="bg-pink-500" 
        />
        <StatCard 
          icon={Users} 
          title="متوسط التقييم" 
          value="4.8/5" 
          color="bg-orange-500" 
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">آخر الرسائل</h2>
            <span className="text-sm text-gray-500">{recentMessages.length} رسالة</span>
          </div>
          <div className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {message.student_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{message.student_name}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                    {!message.is_read && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        جديد
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد رسائل جديدة</p>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">آخر التقييمات</h2>
            <span className="text-sm text-gray-500">{recentReviews.length} تقييم</span>
          </div>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{review.student_name}</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(review.date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد تقييمات جديدة</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <BookOpen className="w-5 h-5 ml-2" />
            إضافة درس جديد
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <Video className="w-5 h-5 ml-2" />
            رفع فيديو
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <FileText className="w-5 h-5 ml-2" />
            رفع ملف PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;