const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User'); // Mongoose user schema

async function viewUsers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings';
    await mongoose.connect(uri);
    
    // Fetch all users without displaying their encrypted passwords
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    console.log(`\n======================================================`);
    console.log(`👤 REGISTERED USERS FOUND: ${users.length}`);
    console.log(`======================================================\n`);
    
    if (users.length === 0) {
      console.log("No users have registered on your website yet. Try creating an account on the frontend!");
    } else {
      const formattedData = users.map(user => ({
        ID: user._id.toString(),
        Username: user.username,
        Email: user.email,
        QuizScore: user.score || 0,
        Registered: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'
      }));
      console.table(formattedData);
    }
  } catch (error) {
    console.error("Error accessing MongoDB Database:", error);
  } finally {
    process.exit();
  }
}

viewUsers();
