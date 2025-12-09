import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Users, 
  Star, 
  ArrowLeft,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const Home = () => {
  const [stats, setStats] = useState({
    lessons: 0,
    videos: 0,
    files: 0,
    reviews: 0
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const [lessonsCount, videosCount, filesCount, reviewsCount] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact' }),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('files').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' })
      ]);

      setStats({
        lessons: lessonsCount.count || 0,
        videos: videosCount.count || 0,
        files: filesCount.count || 0,
        reviews: reviewsCount.count || 0
      });

      // Fetch recent lessons
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentLessons(lessons || []);

    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, number, label, color }) => (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {loading ? '...' : number.toLocaleString()}
      </div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              مرحباً بكم في منصتي التعليمية
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              اكتشف عالم المعرفة مع أفضل الدروس والمحتوى التعليمي المصمم خصيصاً لتطوير مهاراتك وتحقيق أهدافك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lessons" className="btn-primary text-lg px-8 py-4">
                <BookOpen className="w-5 h-5" />
                استكشف الدروس
              </Link>
              <Link to="/about" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
                تعرف على الأستاذ
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="section-title">إحصائيات المنصة</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نفتخر بتقديم محتوى تعليمي عالي الجودة لطلابنا
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              icon={BookOpen} 
              number={stats.lessons} 
              label="درس متاح" 
              color="bg-blue-500"
            />
            <StatCard 
              icon={Play} 
              number={stats.videos} 
              label="فيديو تعليمي" 
              color="bg-green-500"
            />
            <StatCard 
              icon={FileText} 
              number={stats.files} 
              label="ملف PDF" 
              color="bg-purple-500"
            />
            <StatCard 
              icon={Star} 
              number={stats.reviews} 
              label="تقييم طالب" 
              color="bg-yellow-500"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">لماذا تختار منصتنا؟</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">محتوى عالي الجودة</h3>
              <p className="text-gray-600">
                محتوى تعليمي متميز ومختار بعناية من قبل خبراء في المجال
              </p>
            </motion.div>

            <motion.div 
              className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">تعلم في أي وقت</h3>
              <p className="text-gray-600">
                وصول 24/7 إلى جميع المواد التعليمية من أي مكان في العالم
              </p>
            </motion.div>

            <motion.div 
              className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">تطور مستمر</h3>
              <p className="text-gray-600">
                محتوى يتم تحديثه باستمرار لمواكبة أحدث التطورات في المجال
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Lessons Section */}
      {recentLessons.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="section-title !text-right !text-start">أحدث الدروس</h2>
              <Link to="/lessons" className="btn-primary">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {lesson.level}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Play className="w-4 h-4 ml-1" />
                        {lesson.video_count || 0}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.description || 'وصف الدرس'}
                    </p>
                    <Link 
                      to={`/lessons/${lesson.id}`} 
                      className="btn-primary w-full text-center"
                    >
                      مشاهدة الدرس
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              مستعد لبدء رحلتك التعليمية؟
            </h2>
            <p className="text-xl mb-8 opacity-90">
              انضم إلى آلاف الطلاب الذين يتعلمون معنا وحققوا أهدافهم الدراسية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lessons" className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100">
                ابدأ التعلم الآن
              </Link>
              <Link to="/contact" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
                تواصل معنا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;