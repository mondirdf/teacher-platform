import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/files - Get all files
router.get('/', async (req, res) => {
  try {
    const { lesson_id, page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('files')
      .select('*', { count: 'exact' });
    
    if (lesson_id) {
      query = query.eq('lesson_id', lesson_id);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data: files, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/files/:id - Get single file
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    res.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files - Create new file (protected)
router.post('/', async (req, res) => {
  try {
    const { lesson_id, name, url, size, type } = req.body;
    
    if (!lesson_id || !name || !url) {
      return res.status(400).json({ error: 'Lesson ID, name, and URL are required' });
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
    
    const { data: file, error } = await supabase
      .from('files')
      .insert([{
        lesson_id,
        name,
        url,
        size: size || 0,
        type: type || 'pdf',
        downloads: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update lesson file count
    const { data: files } = await supabase
      .from('files')
      .select('id')
      .eq('lesson_id', lesson_id);
    
    await supabase
      .from('lessons')
      .update({ file_count: files.length })
      .eq('id', lesson_id);
    
    res.status(201).json(file);
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/files/:id - Update file (protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, size, type } = req.body;
    
    const { data: file, error } = await supabase
      .from('files')
      .update({
        name,
        url,
        size,
        type
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    res.json(file);
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:id - Delete file (protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file to update lesson count
    const { data: file } = await supabase
      .from('files')
      .select('lesson_id')
      .eq('id', id)
      .single();
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete file
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update lesson file count
    const { data: files } = await supabase
      .from('files')
      .select('id')
      .eq('lesson_id', file.lesson_id);
    
    await supabase
      .from('lessons')
      .update({ file_count: files ? files.length : 0 })
      .eq('id', file.lesson_id);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/files/:id/download - Increment file downloads
router.put('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: file, error } = await supabase
      .from('files')
      .select('downloads')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    const { error: updateError } = await supabase
      .from('files')
      .update({ downloads: file.downloads + 1 })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'Download count updated' });
  } catch (error) {
    console.error('Error updating file downloads:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;