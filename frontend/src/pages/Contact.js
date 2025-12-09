import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    phone: '',
    email: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.student_name || !formData.content) {
      toast.error('الاسم والرسالة مطلوبان');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);
      setFormData({
        student_name: '',
        phone: '',
        email: '',
        content: ''
      });
      
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل إرسال الرسالة، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      content: 'info@teacher-platform.com',
      description: 'نرد خلال 24 ساعة'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      content: '+966 5 0000 0000',
      description: 'متاح من 9 ص إلى 5 م'
    },
    {
      icon: MapPin,
      title: 'العنوان',
      content: 'الرياض، المملكة العربية السعودية',
      description: 'التواصل عن بعد متاح'
    },
    {
      icon: Clock,
      title: 'أوقات العمل',
      content: 'الأحد - الخميس',
      description: '9 صباحاً - 5 مساءً'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تواصل معنا</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن هنا للإجابة على جميع أسئلتك واستفساراتك
          </p>
        </motion.div>

        {/* Success Message */}
        {submitted && (
          <motion.div 
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 ml-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">تم إرسال الرسالة بنجاح!</h3>
                <p className="text-green-700">شكراً لتواصلك معنا. سنتواصل معك قريباً.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-6">
              <MessageCircle className="w-6 h-6 text-primary-600 ml-3" />
              <h2 className="text-2xl font-semibold text-gray-900">أرسل رسالة</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  id="student_name"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-textarea"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الرسالة
                  </div>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">معلومات التواصل</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-gray-600 mb-1">{info.content}</p>
                        <p className="text-sm text-gray-500">{info.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">الأسئلة الشائعة</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">كم وقت الرد على الرسائل؟</h3>
                  <p className="text-gray-600">نرد على جميع الرسائل خلال 24 ساعة في أيام العمل.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">هل تقدم دروس خصوصية؟</h3>
                  <p className="text-gray-600">نعم، يمكن ترتيب دروس خصوصية حسب الطلب والجدول الزمني.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">كيف يمكنني الاشتراك في الدورات؟</h3>
                  <p className="text-gray-600">يمكنك التسجيل من خلال صفحة الدروس والاختيار من الدورات المتاحة.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div 
          className="mt-12 bg-white rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">موقعنا</h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">الرياض، المملكة العربية السعودية</p>
              <p className="text-sm text-gray-500 mt-2">الخدمات متاحة عن بعد</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;