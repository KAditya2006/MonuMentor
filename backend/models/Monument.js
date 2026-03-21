const mongoose = require('mongoose')

const monumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  category: { type: String, required: true },
  yearBuilt: { type: String },
  architectureStyle: { type: String },
  history: { type: String },
  description: { type: String },
  UNESCOstatus: { type: Boolean, default: false },
  modelUrl: { type: String }, // Path to GLB/GLTF model
  images: [{ type: String }],
  audioGuide: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true })

module.exports = mongoose.model('Monument', monumentSchema)
