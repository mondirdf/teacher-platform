import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Search,
  Filter,
  X,
  Download
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const FilesManager = () => {
  const [files, setFiles] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    lesson_id: '',
    type: 'pdf',
    size: ''
  });

  const fileTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar'];

  useEffect(() => {
    fetchFiles();
    fetchLessons();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('files')
        .select(`*, lessons(title)`)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%`);
      }

      if (selectedLesson !== 'all') {
        query = query.eq('lesson_id', selectedLesson);
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data: filesData, error } = await query;

      if (error) throw error;
      setFiles(filesData || []);

    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('فشل تحميل الملفات');
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
    
    if (!formData.name || !formData.url || !formData.lesson_id) {
      toast.error('الاسم، الرابط، والدرس مطلوبة');
      return;
    }

    try {
      if (editingFile) {
        // Update file
        const { data, error } = await supabase
          .from('files')
          .update({
            name: formData.name,
            url: formData.url,
            lesson_id: formData.lesson_id,
            type: formData.type,
            size: formData.size ? parseInt(formData.size) : 0
          })
          .eq('id', editingFile.id)
          .select(`*, lessons(title)`)
          .single();

        if (error) throw error;
        
        setFiles(files.map(file => 
          file.id === editingFile.id ? data : file
        ));
        
        toast.success('تم تحديث الملف بنجاح');
      } else {
        // Create new file
        const { data, error } = await supabase
          .from('files')
          .insert([{
            name: formData.name,
            url: formData.url,
            lesson_id: formData.lesson_id,
            type: formData.type,
            size: formData.size ? parseInt(formData.size) : 0,
            downloads: 0
          }])
          .select(`*, lessons(title)`)
          .single();

        if (error) throw error;
        
        setFiles([data, ...files]);
        toast.success('تم إضافة الملف بنجاح');
      }

      closeModal();

    } catch (error) {
      console.error('Error saving file:', error);
      toast.error('فشل حفظ الملف');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      
      setFiles(files.filter(file => file.id !== fileId));
      toast.success('تم حذف الملف بنجاح');

    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('فشل حذف الملف');
    }
  };

  const openModal = (file = null) => {
    if (file) {
      setEditingFile(file);
      setFormData({
        name: file.name,
        url: file.url,
        lesson_id: file.lesson_id,
        type: file.type,
        size: file.size || ''
      });
    } else {
      setEditingFile(null);
      setFormData({
        name: '',
        url: '',
        lesson_id: '',
        type: 'pdf',
        size: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFile(null);
    setFormData({
      name: '',
      url: '',
      lesson_id: '',
      type: 'pdf',
      size: ''
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'zip':
      case 'rar':
        return <FileText className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الملفات</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          إضافة ملف
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
                placeholder="ابحث عن ملف..."
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
          <div className="flex items-center space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input"
            >
              <option value="all">جميع الأنواع</option>
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <button onClick={fetchFiles} className="btn-secondary">
            بحث
          </button>
        </div>
      </div>

      {/* Files Table */}
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
                    الملف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدرس
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحجم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التحميلات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.length > 0 ? (
                  files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(file.created_at).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {file.lessons?.title || 'غير مصنف'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {file.type?.toUpperCase() || 'FILE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.downloads?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(file)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleFileDownload(file.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">لا توجد ملفات</p>
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
                {editingFile ? 'تعديل الملف' : 'إضافة ملف'}
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
                  اسم الملف *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الملف *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="form-input"
                  placeholder="https://drive.google.com/file/..."
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
                  النوع
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input"
                >
                  {fileTypes.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحجم (بالبايت)
                </label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="form-input"
                  placeholder="1048576"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingFile ? 'تحديث' : 'إضافة'}
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

export default FilesManager;