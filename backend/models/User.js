const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  favoriteMonuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Monument' }],
  visitedMonuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Monument' }],
  totalQuizScore: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
