import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    rating: 5,
    comment: ''
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchReviews();
  }, [pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data: reviewsData, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

      if (error) throw error;

      setReviews(reviewsData || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        pages: Math.ceil(count / pagination.limit)
      });

      // Calculate average rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating');

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
        setTotalReviews(allReviews.length);
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('فشل تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.student_name || !formData.comment) {
      toast.error('الاسم والتعليق مطلوبان');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setReviews([data, ...reviews]);
      setFormData({ student_name: '', rating: 5, comment: '' });
      setShowForm(false);
      
      toast.success('تم إرسال تقييمك بنجاح! شكراً لك');
      
      // Recalculate average
      fetchReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('فشل إرسال التقييم');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const StarRating = ({ rating, size = 'w-5 h-5' }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تقييمات الطلاب</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            شاهد ما يقوله طلابنا عن تجربتهم التعليمية
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <StarRating rating={Math.round(averageRating)} size="w-8 h-8" />
                <span className="text-4xl font-bold text-gray-900 mr-4">{averageRating}</span>
              </div>
              <p className="text-lg text-gray-600">متوسط التقييم من {totalReviews} تقييم</p>
            </div>
            <div className="flex justify-center md:justify-end">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                <Send className="w-5 h-5" />
                أضف تقييمك
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add Review Form */}
        {showForm && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">أضف تقييمك</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسمك
                </label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                  className="form-input"
                  placeholder="أدخل اسمك"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعليقك
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="form-textarea"
                  rows={4}
                  placeholder="شاركنا تجربتك..."
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                  إرسال التقييم
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-200"></div>
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
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <motion.div 
                    key={review.id}
                    className="bg-white rounded-xl shadow-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{review.student_name}</h3>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span>{new Date(review.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد تقييمات</h3>
                <p className="text-gray-500">كن أول من يقيم تجربته التعليمية</p>
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

export default Reviews;