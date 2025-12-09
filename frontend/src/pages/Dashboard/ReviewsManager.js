import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Trash2, 
  Eye,
  Search,
  Filter,
  X,
  MessageCircle,
  User
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchReviews();
  }, [pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false });

      if (searchTerm) {
        query = query.or(`student_name.ilike.%${searchTerm}%,comment.ilike.%${searchTerm}%`);
      }

      if (selectedRating !== 'all') {
        query = query.eq('rating', parseInt(selectedRating));
      }

      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data: reviewsData, error, count } = await query;

      if (error) throw error;

      setReviews(reviewsData || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        pages: Math.ceil(count / pagination.limit)
      });

    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('فشل تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      setReviews(reviews.filter(review => review.id !== reviewId));
      toast.success('تم حذف التقييم بنجاح');

    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('فشل حذف التقييم');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة التقييمات</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Star className="w-4 h-4" />
          <span>{pagination.total} تقييم</span>
        </div>
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
                placeholder="ابحث عن تقييم..."
                className="form-input pl-12"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="form-input"
            >
              <option value="all">جميع التقييمات</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>{rating} نجوم</option>
              ))}
            </select>
          </div>
          <button onClick={fetchReviews} className="btn-secondary">
            بحث
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التقييم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التعليق
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{review.student_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StarRating rating={review.rating} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2">
                          <MessageCircle className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-900 max-w-xs">{review.comment}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(review.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">لا توجد تقييمات</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
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
    </div>
  );
};

export default ReviewsManager;