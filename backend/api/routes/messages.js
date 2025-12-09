import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/messages - Get all messages (protected)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read } = req.query;
    
    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' });
    
    // Filter by read status
    if (is_read !== undefined) {
      query = query.eq('is_read', is_read === 'true');
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data: messages, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      messages: messages || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/:id - Get single message (protected)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: message, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!message) return res.status(404).json({ error: 'Message not found' });
    
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages - Create new message (public)
router.post('/', async (req, res) => {
  try {
    const { student_name, phone, email, content } = req.body;
    
    if (!student_name || !content) {
      return res.status(400).json({ error: 'Student name and content are required' });
    }
    
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        student_name,
        phone,
        email,
        content,
        is_read: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/messages/:id/read - Mark message as read (protected)
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: message, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!message) return res.status(404).json({ error: 'Message not found' });
    
    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/messages/:id - Delete message (protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default router;