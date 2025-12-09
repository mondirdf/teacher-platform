import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get counts for all tables
    const [
      lessonsCount,
      videosCount,
      filesCount,
      reviewsCount,
      messagesCount,
      unreadMessagesCount
    ] = await Promise.all([
      supabase.from('lessons').select('id', { count: 'exact' }),
      supabase.from('videos').select('id', { count: 'exact' }),
      supabase.from('files').select('id', { count: 'exact' }),
      supabase.from('reviews').select('id', { count: 'exact' }),
      supabase.from('messages').select('id', { count: 'exact' }),
      supabase.from('messages').select('id', { count: 'exact' }).eq('is_read', false)
    ]);

    // Get total views and downloads
    const { data: videos } = await supabase.from('videos').select('views');
    const { data: files } = await supabase.from('files').select('downloads');

    const totalViews = videos?.reduce((sum, video) => sum + (video.views || 0), 0) || 0;
    const totalDownloads = files?.reduce((sum, file) => sum + (file.downloads || 0), 0) || 0;

    // Calculate average rating
    const { data: reviews } = await supabase.from('reviews').select('rating');
    const averageRating = reviews?.length > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      lessons: lessonsCount.count || 0,
      videos: videosCount.count || 0,
      files: filesCount.count || 0,
      reviews: reviewsCount.count || 0,
      messages: messagesCount.count || 0,
      unreadMessages: unreadMessagesCount.count || 0,
      totalViews,
      totalDownloads,
      averageRating: parseFloat(averageRating)
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/recent-messages - Get recent messages
router.get('/recent-messages', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(messages || []);

  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/recent-reviews - Get recent reviews
router.get('/recent-reviews', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(reviews || []);

  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/popular-lessons - Get popular lessons
router.get('/popular-lessons', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get lessons with video count
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .order('video_count', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(lessons || []);

  } catch (error) {
    console.error('Error fetching popular lessons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/popular-videos - Get popular videos
router.get('/popular-videos', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('views', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(videos || []);

  } catch (error) {
    console.error('Error fetching popular videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '1d':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get lessons created in period
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('created_at')
      .gte('created_at', dateFilter.toISOString());

    // Get videos created in period
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('created_at')
      .gte('created_at', dateFilter.toISOString());

    // Get messages created in period
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', dateFilter.toISOString());

    if (lessonsError) throw lessonsError;
    if (videosError) throw videosError;
    if (messagesError) throw messagesError;

    // Process data for charts
    const processDataByDay = (data) => {
      const days = {};
      const daysArray = [];
      
      // Initialize all days with 0
      for (let i = 0; i < (period === '1d' ? 24 : 7); i++) {
        const key = period === '1d' ? `${i}:00` : `Day ${i + 1}`;
        days[key] = 0;
      }

      // Count items per day
      data.forEach(item => {
        const date = new Date(item.created_at);
        let key;
        
        if (period === '1d') {
          key = `${date.getHours()}:00`;
        } else {
          const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
          key = `Day ${7 - daysDiff}`;
        }
        
        if (days[key] !== undefined) {
          days[key]++;
        }
      });

      // Convert to array
      Object.keys(days).forEach(key => {
        daysArray.push({ date: key, count: days[key] });
      });

      return daysArray;
    };

    res.json({
      period,
      lessons: processDataByDay(lessonsData || []),
      videos: processDataByDay(videosData || []),
      messages: processDataByDay(messagesData || []),
      totalLessons: (lessonsData || []).length,
      totalVideos: (videosData || []).length,
      totalMessages: (messagesData || []).length
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/settings - Get platform settings
router.get('/settings', async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) throw error;

    res.json(settings || {});

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/dashboard/settings - Update platform settings
router.put('/settings', async (req, res) => {
  try {
    const {
      primary_color,
      secondary_color,
      hero_title,
      hero_description,
      teacher_name,
      teacher_subject,
      teacher_photo
    } = req.body;

    const { data: settings, error } = await supabase
      .from('settings')
      .update({
        primary_color,
        secondary_color,
        hero_title,
        hero_description,
        teacher_name,
        teacher_subject,
        teacher_photo,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1) // Assuming single settings record
      .select()
      .single();

    if (error) throw error;

    res.json(settings);

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;