import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  FileText, 
  ArrowLeft, 
  Download,
  Eye,
  Clock,
  Star,
  Share2,
  Heart
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const LessonDetails = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    fetchLessonDetails();
  }, [id]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!lesson) {
        toast.error('الدرس غير موجود');
        return;
      }

      // Get videos for this lesson
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: true });

      // Get files for this lesson
      const { data: files } = await supabase
        .from('files')
        .select('*')
        .eq('lesson_id', id)
        .order('created_at', { ascending: true });

      setLesson({
        ...lesson,
        videos: videos || [],
        files: files || []
      });

    } catch (error) {
      console.error('Error fetching lesson details:', error);
      toast.error('فشل تحميل تفاصيل الدرس');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoView = async (videoId) => {
    try {
      await supabase
        .from('videos')
        .update({ views: lesson.videos.find(v => v.id === videoId).views + 1 })
        .eq('id', videoId);
    } catch (error) {
      console.error('Error updating video views:', error);
    }
  };

  const handleFileDownload = async (fileId) => {
    try {
      await supabase
        .from('files')
        .update({ downloads: lesson.files.find(f => f.id === fileId).downloads + 1 })
        .eq('id', fileId);
    } catch (error) {
      console.error('Error updating file downloads:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">الدرس غير موجود</h2>
          <Link to="/lessons" className="btn-primary">
            العودة إلى الدروس
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/lessons" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة إلى الدروس
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                {lesson.level}
              </span>
              <div className="flex items-center ml-4 text-sm">
                <Clock className="w-4 h-4 ml-1" />
                <span>آخر تحديث: {new Date(lesson.updated_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-xl opacity-90 leading-relaxed">{lesson.description}</p>
            
            <div className="flex items-center space-x-6 mt-8">
              <div className="flex items-center">
                <Play className="w-5 h-5 ml-2" />
                <span>{lesson.video_count || 0} فيديو</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 ml-2" />
                <span>{lesson.file_count || 0} ملف</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-5 h-5 ml-2" />
                <span>1,234 مشاهدة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'videos'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Play className="w-4 h-4 ml-2" />
                    الفيديوهات ({lesson.videos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'files'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    الملفات ({lesson.files.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'videos' && (
                  <div className="space-y-4">
                    {lesson.videos.length > 0 ? (
                      lesson.videos.map((video, index) => (
                        <motion.div 
                          key={video.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 ml-1" />
                                  {video.views || 0} مشاهدة
                                </span>
                                {video.duration && (
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 ml-1" />
                                    {video.duration} دقيقة
                                  </span>
                                )}
                              </div>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleVideoView(video.id)}
                                className="btn-primary"
                              >
                                مشاهدة الفيديو
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد فيديوهات لهذا الدرس</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-4">
                    {lesson.files.length > 0 ? (
                      lesson.files.map((file, index) => (
                        <motion.div 
                          key={file.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <Download className="w-4 h-4 ml-1" />
                                  {file.downloads || 0} تحميل
                                </span>
                                {file.size && (
                                  <span>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                              </div>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleFileDownload(file.id)}
                                className="btn-outline"
                              >
                                تحميل الملف
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد ملفات لهذا الدرس</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدرس</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المستوى:</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {lesson.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">عدد الفيديوهات:</span>
                  <span className="font-medium">{lesson.videos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">عدد الملفات:</span>
                  <span className="font-medium">{lesson.files.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium">
                    {new Date(lesson.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">شارك الدرس</h3>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                  Facebook
                </button>
                <button className="flex-1 bg-blue-400 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-200">
                  Twitter
                </button>
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200">
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Related Lessons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">دروس ذات صلة</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Link
                    key={i}
                    to={`/lessons/${i}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">درس {i}</h4>
                    <p className="text-sm text-gray-600">وصف مختصر للدرس</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetails;