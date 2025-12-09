import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Eye, Clock, Filter, Search, BookOpen } from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchVideos();
    fetchLessons();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('videos')
        .select('*', { count: 'exact' })
        .order('views', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%`);
      }

      if (selectedLesson !== 'all') {
        query = query.eq('lesson_id', selectedLesson);
      }

      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data: videosData, error, count } = await query;

      if (error) throw error;

      setVideos(videosData || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        pages: Math.ceil(count / pagination.limit)
      });

    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('فشل تحميل الفيديوهات');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('id, title');

      if (error) throw error;

      const lessonsMap = {};
      lessonsData.forEach(lesson => {
        lessonsMap[lesson.id] = lesson.title;
      });
      setLessons(lessonsMap);

    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchVideos();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    fetchVideos();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoView = async (videoId) => {
    try {
      const video = videos.find(v => v.id === videoId);
      await supabase
        .from('videos')
        .update({ views: video.views + 1 })
        .eq('id', videoId);

      // Update local state
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, views: v.views + 1 } : v
      ));
    } catch (error) {
      console.error('Error updating video views:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مكتبة الفيديوهات</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            شاهد مجموعة متنوعة من الفيديوهات التعليمية عالية الجودة
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن فيديو..."
                  className="form-input pl-12"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="form-input"
              >
                <option value="all">جميع الدروس</option>
                {Object.entries(lessons).map(([id, title]) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary">
              بحث
            </button>
          </form>
        </motion.div>

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video, index) => (
                  <motion.div 
                    key={video.id}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white" />
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {lessons[video.lesson_id] || 'غير مصنف'}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 ml-1" />
                            <span>{video.views || 0}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {video.platform === 'youtube' ? 'YouTube' : 'منصة أخرى'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleVideoView(video.id)}
                          className="flex-1 btn-primary text-center"
                        >
                          <Play className="w-4 h-4" />
                          مشاهدة
                        </a>
                        <Link 
                          to={`/lessons/${video.lesson_id}`}
                          className="flex-1 btn-outline text-center"
                        >
                          <BookOpen className="w-4 h-4" />
                          الدرس
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد فيديوهات</h3>
                <p className="text-gray-500">لم يتم العثور على فيديوهات مطابقة لبحثك</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Videos;