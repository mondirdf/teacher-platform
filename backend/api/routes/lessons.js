import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/lessons - Get all lessons
router.get('/', async (req, res) => {
  try {
    const { level, search, page = 1, limit = 12 } = req.query;
    
    let query = supabase
      .from('lessons')
      .select('*', { count: 'exact' });
    
    // Filter by level
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    
    // Search by title or description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data: lessons, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      lessons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lessons/:id - Get single lesson
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    
    // Get videos for this lesson
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: true });
    
    // Get files for this lesson
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('lesson_id', id)
      .order('created_at', { ascending: true });
    
    res.json({
      ...lesson,
      videos: videos || [],
      files: files || []
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lessons - Create new lesson (protected)
router.post('/', async (req, res) => {
  try {
    const { title, description, level, thumbnail } = req.body;
    
    if (!title || !level) {
      return res.status(400).json({ error: 'Title and level are required' });
    }
    
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert([{
        title,
        description,
        level,
        thumbnail,
        video_count: 0,
        file_count: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lessons/:id - Update lesson (protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level, thumbnail } = req.body;
    
    const { data: lesson, error } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        level,
        thumbnail,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    
    res.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lessons/:id - Delete lesson (protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete related videos and files first
    await supabase.from('videos').delete().eq('lesson_id', id);
    await supabase.from('files').delete().eq('lesson_id', id);
    
    // Delete lesson
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;