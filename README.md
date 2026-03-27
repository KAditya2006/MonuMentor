# Roots & Wings AR Platform (MonuMentor)

An augmented reality cultural heritage platform for exploring monuments and cultural heritage through interactive 3D models and quizzes.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)

### MongoDB Setup

Choose ONE option:

#### Option 1: Local MongoDB (Windows)
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB:
   ```powershell
   mongod
   ```
   MongoDB will run on `mongodb://127.0.0.1:27017`

#### Option 2: MongoDB Atlas (Cloud - Recommended)
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create M0 free tier cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/roots-wings`)
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roots-wings
   ```

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` if needed
   - Update `MONGODB_URI` in `.env` file to match your MongoDB setup

3. **Start the server:**
   ```bash
   npm start
   ```
   - Server will start on `http://localhost:5000`
   - Browser will open automatically
   - If MongoDB is not running, you'll see clear error messages

## 🔧 Troubleshooting

### Error: "Operation users.findOne() buffering timed out after 10000ms"

**Cause:** MongoDB is not running or not accessible

**Solution:**
1. **If using local MongoDB:**
   ```powershell
   # Open a new PowerShell window and run:
   mongod
   ```

2. **If using MongoDB Atlas:**
   - Verify connection string in `.env` file
   - Check MongoDB Atlas dashboard for IP whitelist
   - Ensure cluster is running (may need to wake up free tier)

3. **After starting MongoDB, refresh the browser**

## 📁 Project Structure

```
roots-wings-ar-platform/
├── backend/
│   ├── routes/          # API routes (auth, monuments, quiz, etc.)
│   ├── models/          # MongoDB schemas
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server
├── frontend/
│   ├── js/              # Client-side JavaScript
│   ├── css/             # Styling
│   └── *.html           # Page templates
├── .env                 # Environment configuration
└── package.json         # Dependencies
```

## 📝 Environment Variables

See `.env.example` for all available options:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FAST2SMS_API_KEY` - Optional SMS service key

## 🎯 Features

- 3D AR Monument Explorer
- Interactive Cultural Heritage Quizzes
- User Dashboard
- Chatbot for Cultural Information
- User Authentication & Profiles
- Real-time Leaderboards

## 📚 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/monuments` - List monuments
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/user/profile` - User profile

## 🐛 Issues & Support

If you encounter issues:
1. Check the terminal output for error messages
2. Ensure MongoDB is running
3. Check `.env` configuration
4. Clear browser cache and localStorage