const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const fallbackImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'

const getWikiImage = async (title) => {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    const data = await res.json()
    return data.thumbnail ? data.thumbnail.source : null
  } catch (e) {
    return null
  }
}

const monuments = [
  // Andhra Pradesh
  { name: 'Borra Caves', state: 'Andhra Pradesh', city: 'Visakhapatnam', category: 'Caves', coordinates: { lat: 18.2810, lng: 83.0381 } },
  { name: 'Tirumala Venkateswara Temple', state: 'Andhra Pradesh', city: 'Tirupati', category: 'Temples', coordinates: { lat: 13.6288, lng: 79.4192 } },

  // Arunachal Pradesh
  { name: 'Tawang Monastery', state: 'Arunachal Pradesh', city: 'Tawang', category: 'Temples', coordinates: { lat: 27.5855, lng: 91.8596 } },

  // Assam
  { name: 'Kamakhya Temple', state: 'Assam', city: 'Guwahati', category: 'Temples', coordinates: { lat: 26.1673, lng: 91.7051 } },

  // Bihar
  { name: 'Mahabodhi Temple', state: 'Bihar', city: 'Bodh Gaya', category: 'UNESCO Sites', coordinates: { lat: 24.6951, lng: 84.9913 } },
  { name: 'Nalanda', state: 'Bihar', city: 'Nalanda', category: 'UNESCO Sites', coordinates: { lat: 25.1362, lng: 85.4430 } },

  // Chhattisgarh
  { name: 'Bhoramdeo Temple', state: 'Chhattisgarh', city: 'Kawardha', category: 'Temples', coordinates: { lat: 22.1009, lng: 81.1627 } },

  // Goa
  { name: 'Basilica of Bom Jesus', state: 'Goa', city: 'Old Goa', category: 'UNESCO Sites', coordinates: { lat: 15.5009, lng: 73.9116 } },

  // Gujarat
  { name: 'Sun Temple, Modhera', state: 'Gujarat', city: 'Modhera', category: 'Temples', coordinates: { lat: 23.5838, lng: 71.9965 } },
  { name: 'Rani Ki Vav', state: 'Gujarat', city: 'Patan', category: 'UNESCO Sites', coordinates: { lat: 23.8587, lng: 72.1017 } },

  // Haryana
  { name: "Sheikh Chilli's Tomb", state: 'Haryana', city: 'Thanesar', category: 'Palaces', coordinates: { lat: 29.9675, lng: 76.8197 } },

  // Himachal Pradesh
  { name: 'Hidimba Devi Temple', state: 'Himachal Pradesh', city: 'Manali', category: 'Temples', coordinates: { lat: 32.2476, lng: 77.1824 } },

  // Jharkhand
  { name: 'Jagannath Temple, Ranchi', state: 'Jharkhand', city: 'Ranchi', category: 'Temples', coordinates: { lat: 23.3138, lng: 85.2891 } },

  // Karnataka
  { name: 'Group of Monuments at Hampi', state: 'Karnataka', city: 'Hampi', category: 'UNESCO Sites', coordinates: { lat: 15.3350, lng: 76.4600 } },
  { name: 'Mysore Palace', state: 'Karnataka', city: 'Mysuru', category: 'Palaces', coordinates: { lat: 12.3051, lng: 76.6551 } },

  // Kerala
  { name: 'Padmanabhaswamy Temple', state: 'Kerala', city: 'Thiruvananthapuram', category: 'Temples', coordinates: { lat: 8.4830, lng: 76.9436 } },
  { name: 'Bekal Fort', state: 'Kerala', city: 'Kasaragod', category: 'Forts', coordinates: { lat: 12.3927, lng: 75.0210 } },

  // Madhya Pradesh
  { name: 'Sanchi', state: 'Madhya Pradesh', city: 'Sanchi', category: 'UNESCO Sites', coordinates: { lat: 23.4792, lng: 77.7397 } },
  { name: 'Khajuraho Group of Monuments', state: 'Madhya Pradesh', city: 'Khajuraho', category: 'Temples', coordinates: { lat: 24.8318, lng: 79.9230 } },
  { name: 'Gwalior Fort', state: 'Madhya Pradesh', city: 'Gwalior', category: 'Forts', coordinates: { lat: 26.2299, lng: 78.1695 } },

  // Maharashtra
  { name: 'Gateway of India', state: 'Maharashtra', city: 'Mumbai', category: 'UNESCO Sites', coordinates: { lat: 18.9220, lng: 72.8347 } },
  { name: 'Ajanta Caves', state: 'Maharashtra', city: 'Aurangabad', category: 'Caves', coordinates: { lat: 20.5519, lng: 75.7033 } },
  { name: 'Ellora Caves', state: 'Maharashtra', city: 'Aurangabad', category: 'Caves', coordinates: { lat: 20.0269, lng: 75.1771 } },

  // Manipur
  { name: 'Kangla Palace', state: 'Manipur', city: 'Imphal', category: 'Forts', coordinates: { lat: 24.8143, lng: 93.9456 } },

  // Meghalaya
  { name: 'Nartiang Monoliths', state: 'Meghalaya', city: 'Nartiang', category: 'Monuments', coordinates: { lat: 25.5902, lng: 92.2155 } },

  // Mizoram
  { name: "Solomon's Temple, Aizawl", state: 'Mizoram', city: 'Aizawl', category: 'Temples', coordinates: { lat: 23.7501, lng: 92.7095 } },

  // Nagaland
  { name: 'Kachari Ruins', state: 'Nagaland', city: 'Dimapur', category: 'Monuments', coordinates: { lat: 25.9082, lng: 93.7263 } },

  // Odisha
  { name: 'Konark Sun Temple', state: 'Odisha', city: 'Konark', category: 'Temples', coordinates: { lat: 19.8876, lng: 86.0945 } },
  { name: 'Jagannath Temple, Puri', state: 'Odisha', city: 'Puri', category: 'Temples', coordinates: { lat: 19.8049, lng: 85.8179 } },

  // Punjab
  { name: 'Golden Temple', state: 'Punjab', city: 'Amritsar', category: 'Temples', coordinates: { lat: 31.6200, lng: 74.8765 } },

  // Rajasthan
  { name: 'Hawa Mahal', state: 'Rajasthan', city: 'Jaipur', category: 'Palaces', coordinates: { lat: 26.9239, lng: 75.8267 } },
  { name: 'Amer Fort', state: 'Rajasthan', city: 'Jaipur', category: 'Forts', coordinates: { lat: 26.9855, lng: 75.8513 } },

  // Sikkim
  { name: 'Rumtek Monastery', state: 'Sikkim', city: 'Gangtok', category: 'Temples', coordinates: { lat: 27.3009, lng: 88.5255 } },

  // Tamil Nadu
  { name: 'Brihadisvara Temple, Thanjavur', state: 'Tamil Nadu', city: 'Thanjavur', category: 'Temples', coordinates: { lat: 10.7828, lng: 79.1318 } },
  { name: 'Meenakshi Temple', state: 'Tamil Nadu', city: 'Madurai', category: 'Temples', coordinates: { lat: 9.9195, lng: 78.1193 } },

  // Telangana
  { name: 'Charminar', state: 'Telangana', city: 'Hyderabad', category: 'UNESCO Sites', coordinates: { lat: 17.3616, lng: 78.4747 } },

  // Tripura
  { name: 'Ujjayanta Palace', state: 'Tripura', city: 'Agartala', category: 'Palaces', coordinates: { lat: 23.8342, lng: 91.2842 } },

  // Uttar Pradesh
  { name: 'Taj Mahal', state: 'Uttar Pradesh', city: 'Agra', category: 'UNESCO Sites', coordinates: { lat: 27.1751, lng: 78.0421 } },
  { name: 'Fatehpur Sikri', state: 'Uttar Pradesh', city: 'Agra', category: 'UNESCO Sites', coordinates: { lat: 27.0945, lng: 77.6679 } },

  // Uttarakhand
  { name: 'Kedarnath Temple', state: 'Uttarakhand', city: 'Kedarnath', category: 'Temples', coordinates: { lat: 30.7352, lng: 79.0669 } },

  // West Bengal
  { name: 'Victoria Memorial, Kolkata', state: 'West Bengal', city: 'Kolkata', category: 'Palaces', coordinates: { lat: 22.5448, lng: 88.3426 } },

  // Andaman and Nicobar Islands
  { name: 'Cellular Jail', state: 'Andaman and Nicobar Islands', city: 'Port Blair', category: 'Forts', coordinates: { lat: 11.6738, lng: 92.7480 } },

  // Chandigarh
  { name: 'Chandigarh Capitol Complex', state: 'Chandigarh', city: 'Chandigarh', category: 'UNESCO Sites', coordinates: { lat: 30.7588, lng: 76.8041 } },

  // Dadra and Nagar Haveli and Daman and Diu
  { name: 'Diu Fort', state: 'Dadra and Nagar Haveli and Daman and Diu', city: 'Diu', category: 'Forts', coordinates: { lat: 20.7145, lng: 70.9972 } },

  // Delhi
  { name: 'Red Fort', state: 'Delhi', city: 'New Delhi', category: 'Forts', coordinates: { lat: 28.6562, lng: 77.2410 } },

  // Jammu and Kashmir
  { name: 'Martand Sun Temple', state: 'Jammu and Kashmir', city: 'Anantnag', category: 'Temples', coordinates: { lat: 33.7431, lng: 75.2229 } },

  // Ladakh
  { name: 'Thikse Monastery', state: 'Ladakh', city: 'Leh', category: 'Temples', coordinates: { lat: 34.0560, lng: 77.6676 } },

  // Lakshadweep
  { name: 'Minicoy Island Lighthouse', state: 'Lakshadweep', city: 'Minicoy', category: 'Monuments', coordinates: { lat: 8.2711, lng: 73.0489 } },

  // Puducherry
  { name: 'Matrimandir', state: 'Puducherry', city: 'Auroville', category: 'Monuments', coordinates: { lat: 12.0069, lng: 79.8105 } }
]

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB')
    console.log('Clearing old monuments...')
    await Monument.deleteMany({})

    console.log(`Fetching real images from Wikipedia for ${monuments.length} monuments...`)

    const monumentsWithImages = await Promise.all(monuments.map(async (mon) => {
      const originalName = mon.name
      const img = await getWikiImage(originalName)

      return {
        ...mon,
        images: [img || fallbackImg]
      }
    }))

    await Monument.insertMany(monumentsWithImages)
    console.log('Successfully seeded database with real Wikipedia images!')
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
