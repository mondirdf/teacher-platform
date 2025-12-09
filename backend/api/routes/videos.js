import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/videos - Get all videos
router.get('/', async (req, res) => {
  try {
    const { lesson_id, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' });
    
    if (lesson_id) {
      query = query.eq('lesson_id', lesson_id);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data: videos, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/videos/:id - Get single video
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/videos - Create new video (protected)
router.post('/', async (req, res) => {
  try {
    const { lesson_id, title, url, platform, duration } = req.body;
    
    if (!lesson_id || !title || !url) {
      return res.status(400).json({ error: 'Lesson ID, title, and URL are required' });
    }
    
    // Validate lesson exists
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lesson_id)
      .single();
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const { data: video, error } = await supabase
      .from('videos')
      .insert([{
        lesson_id,
        title,
        url,
        platform: platform || 'youtube',
        duration,
        views: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update lesson video count
    const { data: videos } = await supabase
      .from('videos')
      .select('id')
      .eq('lesson_id', lesson_id);
    
    await supabase
      .from('lessons')
      .update({ video_count: videos.length })
      .eq('id', lesson_id);
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/videos/:id - Update video (protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, platform, duration } = req.body;
    
    const { data: video, error } = await supabase
      .from('videos')
      .update({
        title,
        url,
        platform,
        duration
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/videos/:id - Delete video (protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get video to update lesson count
    const { data: video } = await supabase
      .from('videos')
      .select('lesson_id')
      .eq('id', id)
      .single();
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Delete video
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update lesson video count
    const { data: videos } = await supabase
      .from('videos')
      .select('id')
      .eq('lesson_id', video.lesson_id);
    
    await supabase
      .from('lessons')
      .update({ video_count: videos.length })
      .eq('id', video.lesson_id);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/videos/:id/view - Increment video views
router.put('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: video, error } = await supabase
      .from('videos')
      .select('views')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    const { error: updateError } = await supabase
      .from('videos')
      .update({ views: video.views + 1 })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating video views:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;