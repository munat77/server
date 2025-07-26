const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Note Schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Work', 'Ideas', 'Shopping', 'Personal'],
    default: 'Personal'
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const Note = mongoose.model('Note', noteSchema);

// MongoDB Connection with startup cleanup
mongoose.connect('mongodb://localhost:27017/notesDB')
  .then(async () => {
    console.log('MongoDB connected');
    
    // DEVELOPMENT-ONLY: Clear all notes on server start
    if (process.env.NODE_ENV === 'development') {
      try {
        const result = await Note.deleteMany({});
        console.log(`Deleted ${result.deletedCount} notes on startup`);
      } catch (error) {
        console.error('Startup cleanup error:', error);
      }
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API Endpoints

// Create a new note
app.post('/notes', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const newNote = new Note({
      title: title || '',
      content,
      category: category || 'Personal'
    });
    
    const savedNote = await newNote.save();
    console.log(`New note created: "${title || 'Untitled Note'}"`);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get all active notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find({ archived: false });
    console.log(`Returning ${notes.length} active notes`);
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get archived notes
app.get('/notes/archived', async (req, res) => {
  try {
    const notes = await Note.find({ archived: true });
    console.log(`Returning ${notes.length} archived notes`);
    res.json(notes);
  } catch (error) {
    console.error('Get archived notes error:', error);
    res.status(500).json({ error: 'Failed to fetch archived notes' });
  }
});

// Update a note
app.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, content, category },
      { new: true, runValidators: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note updated: "${title || 'Untitled Note'}"`);
    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Archive/unarchive a note
app.put('/notes/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { archived },
      { new: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note ${archived ? 'archived' : 'unarchived'}: "${updatedNote.title || 'Untitled Note'}"`);
    res.json(updatedNote);
  } catch (error) {
    console.error('Archive note error:', error);
    res.status(500).json({ error: 'Failed to update note status' });
  }
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    console.log(`Note deleted: "${deletedNote.title || 'Untitled Note'}"`);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Debug endpoint to view all notes
app.get('/debug', async (req, res) => {
  try {
    const notes = await Note.find({});
    res.send(`
      <h1>Database Contents</h1>
      <pre>${JSON.stringify(notes, null, 2)}</pre>
    `);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));