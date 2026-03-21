const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./backend/models/User');

async function dropUsers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings';
    await mongoose.connect(uri);
    await User.deleteMany({});
    
    // Also drop indexes so they can be rebuilt correctly with the new schema constraints
    try {
      await User.collection.dropIndexes();
      console.log("Indexes dropped successfully for fresh rebuild.");
    } catch(e) {
      console.log("No indexes to drop or index drop failed:", e.message);
    }
    
    await User.syncIndexes();
    console.log("Legacy User Collection Flushed & strict OTP Schema Re-Synced successfully!");
  } catch (err) {
    console.error("Migration Error:", err.message);
  } finally {
    process.exit();
  }
}
dropUsers();
