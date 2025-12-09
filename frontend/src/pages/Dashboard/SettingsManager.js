import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save,
  Palette,
  User,
  Image,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    primary_color: '#2196f3',
    secondary_color: '#9c27b0',
    hero_title: 'مرحباً بكم في منصتي التعليمية',
    hero_description: 'اكتشف عالم المعرفة مع أفضل الدروس والمحتوى التعليمي',
    teacher_name: 'الأستاذ',
    teacher_subject: 'معلم متخصص',
    teacher_photo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      
      if (settingsData) {
        setSettings(settingsData);
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('settings')
        .update({
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          hero_title: settings.hero_title,
          hero_description: settings.hero_description,
          teacher_name: settings.teacher_name,
          teacher_subject: settings.teacher_subject,
          teacher_photo: settings.teacher_photo,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      toast.success('تم تحديث الإعدادات بنجاح');

    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const colorPresets = [
    { primary: '#2196f3', secondary: '#9c27b0', name: 'افتراضي' },
    { primary: '#4f46e5', secondary: '#7c3aed', name: 'أزرق بنفسجي' },
    { primary: '#059669', secondary: '#0891b2', name: 'أخضر تركواز' },
    { primary: '#dc2626', secondary: '#ea580c', name: 'أحمر برتقالي' },
    { primary: '#7c2d12', secondary: '#92400e', name: 'بني داكن' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إعدادات المنصة</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-outline"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'إخفاء المعاينة' : 'معاينة'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="w-5 h-5 ml-2" />
            الإعدادات العامة
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Palette className="w-4 h-4 ml-2" />
                الألوان
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللون الأساسي
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="primary_color"
                      value={settings.primary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="primary_color"
                      value={settings.primary_color}
                      onChange={handleChange}
                      className="form-input flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللون الثانوي
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="secondary_color"
                      value={settings.secondary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      name="secondary_color"
                      value={settings.secondary_color}
                      onChange={handleChange}
                      className="form-input flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نماذج الألوان الجاهزة
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary
                      }))}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: preset.primary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: preset.secondary }}
                        ></div>
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">الصفحة الرئيسية</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الصفحة الرئيسية
                </label>
                <input
                  type="text"
                  name="hero_title"
                  value={settings.hero_title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="مرحباً بكم في منصتي التعليمية"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الصفحة الرئيسية
                </label>
                <textarea
                  name="hero_description"
                  value={settings.hero_description}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="اكتشف عالم المعرفة مع أفضل الدروس والمحتوى التعليمي"
                />
              </div>
            </div>

            {/* Teacher Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-4 h-4 ml-2" />
                معلومات الأستاذ
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الأستاذ
                </label>
                <input
                  type="text"
                  name="teacher_name"
                  value={settings.teacher_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="الأستاذ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التخصص
                </label>
                <input
                  type="text"
                  name="teacher_subject"
                  value={settings.teacher_subject}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="معلم متخصص"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة الشخصية
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    name="teacher_photo"
                    value={settings.teacher_photo}
                    onChange={handleChange}
                    className="form-input flex-1"
                    placeholder="https://example.com/photo.jpg"
                  />
                  {settings.teacher_photo && (
                    <img 
                      src={settings.teacher_photo} 
                      alt="Teacher" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    جاري الحفظ...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-4 h-4" />
                    حفظ الإعدادات
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {previewMode && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">معاينة الموقع</h2>
            
            {/* Header Preview */}
            <div 
              className="rounded-lg p-6 mb-6 text-white"
              style={{ 
                background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{settings.teacher_name}</h1>
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg"></div>
              </div>
              <p className="text-lg opacity-90">{settings.teacher_subject}</p>
            </div>

            {/* Hero Preview */}
            <div 
              className="rounded-lg p-8 mb-6 text-white text-center"
              style={{ 
                background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` 
              }}
            >
              <h2 className="text-3xl font-bold mb-4">{settings.hero_title}</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">{settings.hero_description}</p>
              <div className="mt-6">
                <button 
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                  style={{ color: settings.primary_color }}
                >
                  ابدأ التعلم
                </button>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'الدروس', value: '25', icon: '📚' },
                { title: 'الفيديوهات', value: '100', icon: '🎥' },
                { title: 'الطلاب', value: '500', icon: '👨‍🎓' },
                { title: 'التقييم', value: '4.9', icon: '⭐' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg text-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` 
                  }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManager;