const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection using Railway's DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test database connection and create table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database connected and table ready!');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

initDatabase();

// Routes

// GET - Homepage
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Railway Quotes API! 🚂',
    endpoints: {
      'GET /quotes': 'Get all quotes',
      'GET /quotes/:id': 'Get a specific quote',
      'POST /quotes': 'Add a new quote (body: { text, author })',
      'DELETE /quotes/:id': 'Delete a quote'
    }
  });
});

// GET - All quotes
app.get('/quotes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json({ success: true, count: result.rows.length, quotes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Single quote
app.get('/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Quote not found' });
    }
    
    res.json({ success: true, quote: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Add new quote
app.post('/quotes', async (req, res) => {
  try {
    const { text, author } = req.body;
    
    if (!text || !author) {
      return res.status(400).json({ success: false, error: 'Text and author are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO quotes (text, author) VALUES ($1, $2) RETURNING *',
      [text, author]
    );
    
    res.status(201).json({ success: true, quote: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Remove quote
app.delete('/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Quote not found' });
    }
    
    res.json({ success: true, message: 'Quote deleted', quote: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
