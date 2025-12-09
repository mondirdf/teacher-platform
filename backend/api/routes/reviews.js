import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// GET /api/reviews - Get all reviews
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' });
    
    // Filter by rating
    if (rating) {
      query = query.eq('rating', rating);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('date', { ascending: false });
    
    const { data: reviews, error, count } = await query;
    
    if (error) throw error;
    
    // Calculate average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating');
    
    const averageRating = allReviews?.length > 0 
      ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length).toFixed(1)
      : 0;
    
    res.json({
      reviews: reviews || [],
      averageRating: parseFloat(averageRating),
      totalReviews: count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reviews/:id - Get single review
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: review, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reviews - Create new review
router.post('/', async (req, res) => {
  try {
    const { student_name, rating, comment } = req.body;
    
    if (!student_name || !rating || !comment) {
      return res.status(400).json({ error: 'Student name, rating, and comment are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        student_name,
        rating,
        comment
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reviews/:id - Update review (protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, rating, comment } = req.body;
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        student_name,
        rating,
        comment
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reviews/:id - Delete review (protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;