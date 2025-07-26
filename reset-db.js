const mongoose = require('mongoose');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/notesDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Delete all notes
    const result = await mongoose.connection.db.collection('notes').deleteMany({});
    console.log(`Deleted ${result.deletedCount} notes`);
    
    // Close connection
    await mongoose.disconnect();
    console.log('Database reset complete!');
  } catch (error) {
    console.error('Reset failed:', error);
  }
}

resetDatabase();