const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Note', NoteSchema);