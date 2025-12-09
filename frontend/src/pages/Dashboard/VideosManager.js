import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Search,
  Filter,
  X,
  Upload
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const VideosManager = () => {
  const [videos, setVideos] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    lesson_id: '',
    platform: 'youtube',
    duration: ''
  });

  const platforms = ['youtube', 'vimeo', 'drive', 'other'];

  useEffect(() => {
    fetchVideos();
    fetchLessons();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('videos')
        .select(`*, lessons(title)`)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%`);
      }

      if (selectedLesson !== 'all') {
        query = query.eq('lesson_id', selectedLesson);
      }

      const { data: videosData, error } = await query;

      if (error) throw error;
      setVideos(videosData || []);

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
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      setLessons(lessonsData || []);

    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('فشل تحميل الدروس');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url || !formData.lesson_id) {
      toast.error('العنوان، الرابط، والدرس مطلوبة');
      return;
    }

    try {
      if (editingVideo) {
        // Update video
        const { data, error } = await supabase
          .from('videos')
          .update({
            title: formData.title,
            url: formData.url,
            lesson_id: formData.lesson_id,
            platform: formData.platform,
            duration: formData.duration ? parseInt(formData.duration) : null
          })
          .eq('id', editingVideo.id)
          .select(`*, lessons(title)`)
          .single();

        if (error) throw error;
        
        setVideos(videos.map(video => 
          video.id === editingVideo.id ? data : video
        ));
        
        toast.success('تم تحديث الفيديو بنجاح');
      } else {
        // Create new video
        const { data, error } = await supabase
          .from('videos')
          .insert([{
            title: formData.title,
            url: formData.url,
            lesson_id: formData.lesson_id,
            platform: formData.platform,
            duration: formData.duration ? parseInt(formData.duration) : null,
            views: 0
          }])
          .select(`*, lessons(title)`)
          .single();

        if (error) throw error;
        
        setVideos([data, ...videos]);
        toast.success('تم إضافة الفيديو بنجاح');
      }

      closeModal();

    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('فشل حفظ الفيديو');
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success('تم حذف الفيديو بنجاح');

    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('فشل حذف الفيديو');
    }
  };

  const openModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        url: video.url,
        lesson_id: video.lesson_id,
        platform: video.platform,
        duration: video.duration || ''
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        url: '',
        lesson_id: '',
        platform: 'youtube',
        duration: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      lesson_id: '',
      platform: 'youtube',
      duration: ''
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الفيديوهات</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          إضافة فيديو
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
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
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </div>
          <button onClick={fetchVideos} className="btn-secondary">
            بحث
          </button>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفيديو
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنصة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المشاهدات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{video.title}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(video.created_at).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {video.lessons?.title || 'غير مصنف'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {video.platform === 'youtube' ? 'YouTube' : 
                           video.platform === 'vimeo' ? 'Vimeo' : 
                           video.platform === 'drive' ? 'Google Drive' : 'أخرى'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {video.views?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(video.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(video)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">لا توجد فيديوهات</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الفيديو *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الفيديو *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="form-input"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدرس *
                </label>
                <select
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({...formData, lesson_id: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">اختر الدرس</option>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصة
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="form-input"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform === 'youtube' ? 'YouTube' :
                       platform === 'vimeo' ? 'Vimeo' :
                       platform === 'drive' ? 'Google Drive' : 'أخرى'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدة (بالثواني)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="form-input"
                  placeholder="300"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingVideo ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-outline"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideosManager;