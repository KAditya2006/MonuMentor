const mongoose = require('mongoose')

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  capital: { type: String },
  monumentCount: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('State', stateSchema)
