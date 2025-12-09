import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Award, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const About = () => {
  const [teacherInfo, setTeacherInfo] = useState({
    name: '',
    subject: '',
    bio: '',
    photo_url: '',
    experience: '',
    email: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      setLoading(true);
      
      // Get teacher info from settings
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      // Get first user (teacher) info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single();

      setTeacherInfo({
        name: settings?.teacher_name || user?.name || 'الأستاذ',
        subject: settings?.teacher_subject || 'معلم متخصص',
        bio: user?.bio || settings?.hero_description || 'معلم متخصص في تقديم محتوى تعليمي عالي الجودة',
        photo_url: settings?.teacher_photo || user?.photo_url || '',
        experience: '10 سنوات',
        email: user?.email || 'teacher@example.com',
        phone: '+966 5 0000 0000',
        location: 'الرياض، المملكة العربية السعودية'
      });

    } catch (error) {
      console.error('Error fetching teacher info:', error);
      toast.error('فشل تحميل معلومات الأستاذ');
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { icon: Award, title: 'أفضل معلم', year: '2023' },
    { icon: BookOpen, title: '100+ درس', year: '2024' },
    { icon: Users, title: '1000+ طالب', year: '2024' },
    { icon: Star, title: '4.9 تقييم', year: '2024' }
  ];

  const experiences = [
    {
      title: 'معلم رياضيات متخصص',
      school: 'مدارس التميز',
      period: '2020 - الحالي',
      description: 'تدريس الرياضيات للمراحل المتوسطة والثانوية مع التركيز على الفهم العميق والتطبيق العملي.'
    },
    {
      title: 'معلم مساعد',
      school: 'مدارس النور',
      period: '2018 - 2020',
      description: 'مساعدة في تطوير المناهج الدراسية وإعداد المواد التعليمية.'
    },
    {
      title: 'مدرس خصوصي',
      school: 'مستقل',
      period: '2015 - 2018',
      description: 'تقديم دروس خصوصية في الرياضيات والفيزياء للطلاب على مختلف المستويات.'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">من أنا</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تعرف على الأستاذ وخبراته التعليمية
          </p>
        </motion.div>

        {/* Teacher Profile */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="md:flex">
            {/* Photo */}
            <div className="md:w-1/3 p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
              <div className="text-center">
                {teacherInfo.photo_url ? (
                  <img
                    src={teacherInfo.photo_url}
                    alt={teacherInfo.name}
                    className="w-48 h-48 rounded-full mx-auto mb-6 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <User className="w-24 h-24 text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{teacherInfo.name}</h2>
                <p className="text-lg text-primary-600 mb-4">{teacherInfo.subject}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 ml-1" />
                    <span>{teacherInfo.experience} خبرة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="md:w-2/3 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">نبذة عني</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {teacherInfo.bio}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">معلومات التواصل</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 ml-2" />
                      <span>{teacherInfo.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 ml-2" />
                      <span>{teacherInfo.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 ml-2" />
                      <span>{teacherInfo.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">التخصصات</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      الرياضيات
                    </span>
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                      الفيزياء
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      الكيمياء
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">الإنجازات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600">{achievement.year}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">الخبرات التعليمية</h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{exp.title}</h3>
                    <p className="text-primary-600 font-medium mb-2">{exp.school}</p>
                    <p className="text-sm text-gray-500 mb-3">{exp.period}</p>
                    <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Teaching Philosophy */}
        <motion.div 
          className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">فلسفتي التعليمية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">التعلم النشط</h3>
              <p className="text-gray-600 leading-relaxed">
                أؤمن أن التعلم الفعال يحدث عندما يشارك الطلاب بشكل نشط في العملية التعليمية، 
                من خلال الأسئلة، النقاشات، والتطبيقات العملية.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">التعلم المخصص</h3>
              <p className="text-gray-600 leading-relaxed">
                كل طالب فريد، لذا أعمل على تكييف أساليب التدريس لتناسب احتياجات 
                ومستويات الطلاب المختلفة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;