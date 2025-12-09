import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  X,
  User,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.page]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`student_name.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('is_read', selectedStatus === 'read');
      }

      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

      const { data: messagesData, error, count } = await query;

      if (error) throw error;

      setMessages(messagesData || []);
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        pages: Math.ceil(count / pagination.limit)
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      
      setMessages(messages.map(message => 
        message.id === messageId ? data : message
      ));
      
      toast.success('تم تحديد الرسالة كمقروءة');

    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('فشل تحديث حالة الرسالة');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(messages.filter(message => message.id !== messageId));
      toast.success('تم حذف الرسالة بنجاح');

    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('فشل حذف الرسالة');
    }
  };

  const openModal = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">إدارة الرسائل</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>{pagination.total} رسالة</span>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <span>{unreadCount} رسالة جديدة</span>
            </div>
          )}
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
                placeholder="ابحث عن رسالة..."
                className="form-input pl-12"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">جميع الرسائل</option>
              <option value="unread">غير مقروءة</option>
              <option value="read">مقروءة</option>
            </select>
          </div>
          <button onClick={fetchMessages} className="btn-secondary">
            بحث
          </button>
        </div>
      </div>

      {/* Messages Table */}
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
                    المرسل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
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
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <tr key={message.id} className={`hover:bg-gray-50 transition-colors duration-200 ${
                      !message.is_read ? 'bg-blue-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">{message.student_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 ml-2" />
                          <span className="text-sm text-gray-900">{message.phone || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 ml-2" />
                          <span className="text-sm text-gray-900">{message.email || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          message.is_read 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {message.is_read ? 'مقروءة' : 'جديدة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(message.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(message)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!message.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(message.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">لا توجد رسائل</p>
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

      {/* Message Details Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                تفاصيل الرسالة
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">الاسم</label>
                    <p className="text-gray-900">{selectedMessage.student_name}</p>
                  </div>
                </div>
                
                {selectedMessage.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الهاتف</label>
                      <p className="text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  </div>
                )}
                
                {selectedMessage.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">البريد</label>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">الحالة</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedMessage.is_read 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMessage.is_read ? 'مقروءة' : 'جديدة'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الإرسال
                </label>
                <p className="text-gray-900">
                  {new Date(selectedMessage.created_at).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محتوى الرسالة
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed">{selectedMessage.content}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessage.content);
                  toast.success('تم نسخ الرسالة');
                }}
                className="btn-outline"
              >
                نسخ الرسالة
              </button>
              <button
                onClick={closeModal}
                className="btn-primary"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MessagesManager;