import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  X
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const LessonsManager = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'مبتدئ',
    thumbnail: ''
  });

  const levels = ['مبتدئ', 'متوسط', 'متقدم'];

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }

      const { data: lessonsData, error } = await query;

      if (error) throw error;
      setLessons(lessonsData || []);

    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('فشل تحميل الدروس');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('عنوان الدرس مطلوب');
      return;
    }

    try {
      if (editingLesson) {
        // Update lesson
        const { data, error } = await supabase
          .from('lessons')
          .update({
            title: formData.title,
            description: formData.description,
            level: formData.level,
            thumbnail: formData.thumbnail
          })
          .eq('id', editingLesson.id)
          .select()
          .single();

        if (error) throw error;
        
        setLessons(lessons.map(lesson => 
          lesson.id === editingLesson.id ? data : lesson
        ));
        
        toast.success('تم تحديث الدرس بنجاح');
      } else {
        // Create new lesson
        const { data, error } = await supabase
          .from('lessons')
          .insert([{
            title: formData.title,
            description: formData.description,
            level: formData.level,
            thumbnail: formData.thumbnail,
            video_count: 0,
            file_count: 0
          }])
          .select()
          .single();

        if (error) throw error;
        
        setLessons([data, ...lessons]);
        toast.success('تم إنشاء الدرس بنجاح');
      }

      closeModal();

    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('فشل حفظ الدرس');
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    try {
      // Delete related videos and files first
      await supabase.from('videos').delete().eq('lesson_id', lessonId);
      await supabase.from('files').delete().eq('lesson_id', lessonId);
      
      // Delete lesson
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      toast.success('تم حذف الدرس بنجاح');

    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('فشل حذف الدرس');
    }
  };

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        level: lesson.level,
        thumbnail: lesson.thumbnail || ''
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        description: '',
        level: 'مبتدئ',
        thumbnail: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      level: 'مبتدئ',
      thumbnail: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الدروس</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          إضافة درس جديد
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
                placeholder="ابحث عن درس..."
                className="form-input pl-12"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-input"
            >
              <option value="all">جميع المستويات</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchLessons}
            className="btn-secondary"
          >
            بحث
          </button>
        </div>
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          {lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
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
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 ml-1" />
                          <span>1,234</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.description || 'وصف الدرس'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(lesson)}
                        className="flex-1 btn-outline"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد دروس</h3>
              <p className="text-gray-500">ابدأ بإنشاء أول درس لك</p>
            </div>
          )}
        </>
      )}

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
                {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
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
                  عنوان الدرس *
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
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستوى
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="form-input"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingLesson ? 'تحديث' : 'إضافة'}
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

export default LessonsManager;