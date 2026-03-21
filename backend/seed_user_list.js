const mongoose = require('mongoose')
require('dotenv').config()

const Monument = require('./models/Monument')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roots-wings'

const rawText = `Major Monuments of Bihar
Buddhist Monuments
Mahabodhi Temple
Nalanda Mahavihara Ruins
Vishwa Shanti Stupa Rajgir
Kesariya Stupa
Vikramshila University Ruins
Lauriya Nandangarh Stupa
Buddha Smriti Park
Barabar Caves – oldest surviving rock-cut caves from the Mauryan period.
Hindu Temples
Vishnupad Temple
Mundeshwari Temple
Mahavir Mandir Patna
Hareshwar Nath Temple
Koncheswar Mahadev Temple
Thawe Mandir
Pataleshwar Nath Temple
Islamic Monuments & Tombs
Sher Shah Suri Tomb
Tomb of Hasan Khan Suri
Tomb of Bakhtiyar Khan
Sher Shah Suri Mosque
Maner Sharif Dargah
Colonial & Modern Monuments
Golghar – a granary built in 1786 during British rule.
Sabhyata Dwar – a 32 m tall monument celebrating the heritage of ancient Pataliputra.
Patna Museum
Bihar Museum
Shaheed Smarak
Other Historic Sites
Rohtasgarh Fort
Rajgir Cyclopean Wall
Agam Kuan
Kumhrar Archaeological Site
Kamaldah Jain Temple

Major Monuments of Uttar Pradesh
Agra
Taj Mahal
Agra Fort
Fatehpur Sikri
Itmad-ud-Daulah's Tomb
Akbar's Tomb
Jama Masjid Agra
Mehtab Bagh
Lucknow
Bara Imambara
Chota Imambara
Rumi Darwaza
Clock Tower Lucknow
Residency Lucknow
Dilkusha Kothi
Varanasi
Kashi Vishwanath Temple
Ramnagar Fort
Dashashwamedh Ghat
Sarnath Stupa
Chaukhandi Stupa
Prayagraj
Allahabad Fort
Anand Bhavan
Khusro Bagh
All Saints Cathedral
Jhansi
Jhansi Fort
Rani Mahal Jhansi
Mathura & Vrindavan
Krishna Janmabhoomi Temple
Dwarkadhish Temple Mathura
Banke Bihari Temple
Prem Mandir
Ayodhya
Ram Mandir Ayodhya
Hanuman Garhi
Kanak Bhawan
Other Important Monuments
Chunar Fort
Deogarh Dashavatara Temple
Shahi Bridge
Atala Masjid
Bhitargaon Temple
Suraj Kund Temple

Major Monuments of Delhi
Mughal & Sultanate Monuments
Red Fort
Qutub Minar
Humayun's Tomb
Purana Qila
Tughlaqabad Fort
Adilabad Fort
Feroz Shah Kotla
Hauz Khas Complex
Alai Darwaza
Jamali Kamali Mosque and Tomb
Safdarjung Tomb
Isa Khan's Tomb
Khan-i-Khanan Tomb
Agrasen Ki Baoli
Begumpur Mosque
Khirki Mosque
Colonial Era Monuments
India Gate
Rashtrapati Bhavan
Parliament House
Teen Murti Memorial
Modern Monuments & Memorials
Lotus Temple
Akshardham Temple
Raj Ghat
Shanti Van
Vijay Ghat
Shakti Sthal
National War Memorial
Temples & Religious Monuments
Birla Mandir Delhi
Gurudwara Bangla Sahib
Jama Masjid Delhi

Major Monuments of Andhra Pradesh
Temples
Tirupati Balaji Temple
Lepakshi Temple
Kanaka Durga Temple
Simhachalam Temple
Srikalahasteeswara Temple
Draksharamam Temple
Ahobilam Temple
Forts & Palaces
Chandragiri Fort
Gandikota Fort
Kondapalli Fort
Udayagiri Fort
Caves & Archaeological Sites
Undavalli Caves
Belum Caves
Borra Caves
Buddhist Monuments
Amaravati Stupa
Thotlakonda Buddhist Complex
Bavikonda Buddhist Complex
Salihundam Buddhist Site
Other Historic Sites
Rajahmundry Godavari Bridge
Sri Venkateswara Museum
Araku Tribal Museum

Major Monuments of Arunachal Pradesh
Monasteries (Buddhist Heritage)
Tawang Monastery – the largest monastery in India.
Bomdila Monastery
Urgyelling Monastery
Taktsang Monastery
Gorsam Chorten
Rigyaling Monastery
Forts & Ancient Structures
Ita Fort – historic brick fort from the 14–15th century.
Bhalukpong Fort
Tawang War Memorial
Archaeological & Historical Sites
Malinithan Temple Ruins
Parshuram Kund
Bhismaknagar Fort Ruins
Cultural & Memorial Sites
Jawaharlal Nehru State Museum
Indira Gandhi Park Itanagar

Major Monuments of Assam
Ahom Dynasty Monuments (Sivasagar)
Rang Ghar – ancient royal sports pavilion of the Ahom kings.
Talatal Ghar – seven-storey palace complex.
Kareng Ghar – royal palace of Ahom rulers.
Sivasagar Tank and Temples
Temples
Kamakhya Temple – one of the most important Shakti Peeths in India.
Umananda Temple
Navagraha Temple
Hayagriva Madhava Temple
Sukreswar Temple
Archaeological Sites
Da Parbatia Temple Ruins – oldest temple ruins in Assam.
Bamuni Hills Ruins
Charaideo Maidams – burial mounds of Ahom kings.
Historic Structures & Memorials
Saraighat Bridge Memorial
Dighali Pukhuri
Guwahati War Cemetery
Other Cultural Heritage Sites
Srimanta Sankardev Kalakshetra
Hajo Powa Mecca

Major Monuments of Chhattisgarh
Temples
Bhoramdeo Temple – often called the “Khajuraho of Chhattisgarh”.
Laxman Temple Sirpur
Rajiv Lochan Temple
Danteshwari Temple
Mahamaya Temple
Chandrakhuri Temple
Forts & Palaces
Ratanpur Fort
Kanker Palace
Bastar Palace
Archaeological & Buddhist Sites
Sirpur Temple Complex
Tevar Temple Ruins
Caves & Rock Art Sites
Kutumsar Cave
Kanger Caves
Singhanpur Rock Paintings
Memorials & Cultural Sites
Shaheed Veer Narayan Singh Memorial
Purkhouti Muktangan

Major Monuments of Goa
Churches & Cathedrals (Old Goa – UNESCO Heritage Area)
Basilica of Bom Jesus
Se Cathedral
Church of St. Cajetan
Church of St. Francis of Assisi
Our Lady of the Rosary Church
Church of St. Augustine Ruins
Forts
Fort Aguada
Chapora Fort
Reis Magos Fort
Cabo de Rama Fort
Tiracol Fort
Corjuem Fort
Temples
Shri Mangeshi Temple
Shri Shantadurga Temple
Mahalasa Narayani Temple
Mangueshi Temple
Other Historic Sites
Adil Shah Palace
Fontainhas Latin Quarter
Aguada Lighthouse
Azad Maidan Memorial

Major Monuments of Gujarat
Temples
Somnath Temple
Dwarkadhish Temple
Sun Temple Modhera
Akshardham Temple Gandhinagar
Ambaji Temple
Stepwells (Vavs)
Rani Ki Vav – UNESCO World Heritage stepwell.
Adalaj Stepwell
Dada Harir Stepwell
Forts & Palaces
Uparkot Fort
Lakhota Palace
Prag Mahal
Aina Mahal
Laxmi Vilas Palace
Mosques & Islamic Monuments
Jama Masjid Ahmedabad
Sidi Saiyyed Mosque – famous for its stone lattice windows.
Rani Sipri Mosque
Archaeological & Historic Sites
Champaner-Pavagadh Archaeological Park – UNESCO heritage site.
Lothal Archaeological Site – ancient Indus Valley port city.
Dholavira Archaeological Site – Indus Valley civilization site.
Memorials & Other Monuments
Statue of Unity – world’s tallest statue of Sardar Vallabhbhai Patel.
Kirti Mandir Porbandar – Mahatma Gandhi birthplace memorial.
Sabarmati Ashram

Major Monuments of Haryana
Forts & Palaces
Raja Nahar Singh Palace
Asigarh Fort
Firoz Shah Palace Complex
Sheesh Mahal Faridabad
Historical & Archaeological Sites
Rakhigarhi Archaeological Site – one of the largest Indus Valley Civilization sites.
Banawali Archaeological Site
Agroha Dham – ancient site related to Maharaja Agrasen.
Religious Monuments
Brahma Sarovar
Jyotisar Temple
Sthaneshwar Mahadev Temple
Sheetla Mata Temple
Memorials & Other Heritage Sites
Kurukshetra Panorama and Science Centre
Kalpana Chawla Memorial Planetarium
Sultanpur Bird Sanctuary Watch Tower

Major Monuments of Himachal Pradesh
Forts
Kangra Fort – one of the oldest forts in India.
Nurpur Fort
Kamru Fort
Arki Fort
Temples
Hidimba Devi Temple
Baijnath Temple
Jwalamukhi Temple
Naina Devi Temple
Chintpurni Temple
Hadimba Temple
Monasteries (Buddhist Heritage)
Key Monastery
Tabo Monastery
Dhankar Monastery
Namgyal Monastery
Palaces & Historic Buildings
Padam Palace Rampur
Viceregal Lodge
Other Historic Sites
Masroor Rock Cut Temples – rock-cut temples similar to Ellora style.
Triloknath Temple

Major Monuments of Jharkhand
Temples
Baidyanath Dham Temple – one of the 12 Jyotirlingas of Lord Shiva.
Rajrappa Temple – temple of Goddess Chhinnamasta.
Jagannath Temple Ranchi – similar style to the Puri Jagannath Temple.
Parasnath Hill Jain Temples – sacred Jain pilgrimage site.
Forts & Palaces
Palamu Fort – historic fort in Betla National Park.
Navratangarh Fort – palace of Nagvanshi rulers.
Archaeological & Historical Sites
Benisagar Archaeological Site – ancient temple and sculpture remains.
Isko Rock Art Site – prehistoric cave paintings.
Memorials & Cultural Sites
Birsa Munda Samadhi Sthal – memorial of tribal freedom fighter Birsa Munda.
Tagore Hill Monument – associated with Rabindranath Tagore.
Other Historic Sites
Rock Garden Ranchi
Hundru Falls View Point Monument

Major Monuments of Karnataka
Hampi (UNESCO World Heritage Site)
Hampi Group of Monuments
Virupaksha Temple
Vittala Temple
Stone Chariot Hampi
Lotus Mahal
Temples
Belur Chennakesava Temple
Hoysaleswara Temple
Murudeshwar Temple
Badami Cave Temples
Durga Temple Aihole
Forts
Chitradurga Fort
Bangalore Fort
Bidar Fort
Gulbarga Fort
Palaces
Mysore Palace
Bangalore Palace
Lalitha Mahal Palace
Tombs & Islamic Monuments
Gol Gumbaz
Ibrahim Rauza
Jain Monuments
Shravanabelagola Gommateshwara Statue
Archaeological Sites
Pattadakal Group of Monuments
Aihole Temples Complex

Major Monuments of Kerala
Temples
Padmanabhaswamy Temple
Guruvayur Temple
Sabarimala Temple
Ettumanoor Mahadeva Temple
Vadakkunnathan Temple
Forts
Bekal Fort
St. Angelo Fort
Palakkad Fort
Palaces
Mattancherry Palace
Padmanabhapuram Palace
Hill Palace
Churches
St. Francis Church Kochi
Santa Cruz Cathedral Basilica
Malayattoor Church
Mosques
Cheraman Juma Mosque – believed to be the oldest mosque in India.
Historic Sites & Memorials
Jewish Synagogue Kochi
Anchuthengu Fort
Krishnapuram Palace

Major Monuments of Madhya Pradesh
UNESCO World Heritage Monuments
Khajuraho Group of Monuments
Sanchi Stupa
Bhimbetka Rock Shelters
Temples
Mahakaleshwar Temple
Omkareshwar Temple
Chausath Yogini Temple
Bhojeshwar Temple
Kal Bhairav Temple
Forts
Gwalior Fort
Mandu Fort
Asirgarh Fort
Palaces
Jai Vilas Palace
Rajwada Palace
Lal Bagh Palace
Tombs & Islamic Monuments
Taj-ul-Masajid
Jama Masjid Bhopal
Hoshang Shah Tomb
Other Historic Sites
Rani Durgavati Museum
Udayagiri Caves
Bharat Bhavan

Major Monuments of Maharashtra
UNESCO World Heritage Monuments
Ajanta Caves
Ellora Caves
Elephanta Caves
Chhatrapati Shivaji Terminus
Famous Forts (Maratha Era)
Raigad Fort
Sinhagad Fort
Pratapgad Fort
Rajgad Fort
Shivneri Fort
Daulatabad Fort
Temples
Shirdi Sai Baba Temple
Trimbakeshwar Temple
Grishneshwar Temple
Siddhivinayak Temple
Palaces & Historic Buildings
Shaniwar Wada
Bibi Ka Maqbara
Gateway of India
Other Historic Sites
Pandavleni Caves
Kanheri Caves
Rajabai Clock Tower

Major Monuments of Manipur
Palaces & Royal Structures
Kangla Fort – ancient seat of the Meitei kings.
Kangla Palace Complex
Old Palace of Manipur
Temples
Shri Govindajee Temple
Mahabali Temple – also known as Hanuman Temple.
War Memorials
INA Memorial Moirang – dedicated to the Indian National Army.
Imphal War Cemetery – World War II memorial cemetery.
Archaeological & Historic Sites
Andro Heritage Complex – traditional cultural heritage site.
Sekta Archaeological Living Museum
Cultural Monuments & Sites
Ima Keithel Women's Market – historic all-women marketplace.
Loktak Lake Floating Islands – famous for the floating phumdis.

Major Monuments of Meghalaya
Churches
Cathedral of Mary Help of Christians – one of the largest churches in Northeast India.
All Saints Cathedral Shillong
Presbyterian Church Shillong
Colonial & Historic Structures
Shillong Clock Tower
Raj Bhavan Shillong
Cultural & Memorial Sites
Don Bosco Museum – museum dedicated to Northeast culture.
Capt. Williamson Sangma Memorial
Natural Heritage Monuments
Living Root Bridges – unique bio-engineered bridges made from tree roots.
Nartiang Monoliths – one of the largest monolith sites in India.
Archaeological & Historic Sites
Mawphlang Sacred Grove
Siju Cave

Major Monuments of Mizoram
Churches
Solomon's Temple Aizawl – one of the largest churches in Mizoram.
Aizawl Baptist Church
Presbyterian Church Mizoram
Memorials & Cultural Monuments
Mizo Hlakungpui Mual – historic site related to Mizo cultural heritage.
Lalthanhawla Memorial
Chhingpui Memorial – monument related to Mizo folklore.
Archaeological & Historic Sites
Lamsial Puk Cave
Khuangchera Puk Cave
Museums & Heritage Sites
Mizoram State Museum
Reiek Heritage Village
Natural Heritage Monuments
Phawngpui National Park Monument Area

Major Monuments of Nagaland
War Memorials
Kohima War Cemetery – World War II memorial for soldiers who died in the Battle of Kohima.
Orchid Memorial Stone
Churches
Mary Help of Christians Cathedral – one of the largest churches in Northeast India.
Sumi Baptist Church
Heritage Villages & Cultural Monuments
Kisama Heritage Village – venue of the famous Hornbill Festival.
Khonoma Village Fortifications – historic village with traditional defense structures.
Historic & Cultural Sites
Nagaland State Museum
Triple Falls Monument Area
Archaeological & Natural Heritage Sites
Kachari Ruins – ancient ruins of the Dimasa Kachari kingdom.
Dzükou Valley Heritage Area

Major Monuments of Odisha
UNESCO World Heritage Monument
Konark Sun Temple – 13th-century temple dedicated to the Sun God.
Temples
Jagannath Temple
Lingaraj Temple
Mukteshwar Temple
Rajarani Temple
Ananta Vasudeva Temple
Brahmeswara Temple
Tara Tarini Temple
Samaleswari Temple
Biraja Temple
Buddhist Monuments
Ratnagiri Buddhist Monastery
Udayagiri Buddhist Complex
Lalitgiri Buddhist Complex
Dhauli Shanti Stupa
Caves & Archaeological Sites
Udayagiri and Khandagiri Caves
Badaghagara Cave Temple
Forts
Barabati Fort
Sisupalgarh Fort
Raibania Fort
Historic & Cultural Sites
Jagannath Ballav Garden
Odisha State Museum
Netaji Birthplace Museum

Major Monuments of Punjab
Gurudwaras (Sikh Heritage)
Golden Temple – holiest shrine of Sikhism.
Akal Takht
Durgiana Temple
Gurudwara Tarn Taran Sahib
Gurudwara Fatehgarh Sahib
Historic Forts
Gobindgarh Fort
Phillaur Fort
Bathinda Fort
Memorials & Historic Sites
Jallianwala Bagh – memorial of the 1919 massacre.
Wagah Border Memorial
Shaheed Bhagat Singh Memorial
Palaces & Historic Buildings
Sheesh Mahal Patiala
Qila Mubarak Patiala
Moti Bagh Palace
Archaeological Sites
Harike Wetland Watch Tower
Ropar Archaeological Museum
Other Historic Sites
Punjab State War Heroes Memorial
Rock Garden Chandigarh

Major Monuments of Rajasthan
UNESCO World Heritage Hill Forts
Amer Fort
Chittorgarh Fort
Kumbhalgarh Fort
Jaisalmer Fort
Ranthambore Fort
Gagron Fort
Famous Forts
Mehrangarh Fort
Jaigarh Fort
Nahargarh Fort
Junagarh Fort
Taragarh Fort
Palaces
City Palace Jaipur
City Palace Udaipur
Hawa Mahal
Jal Mahal
Umaid Bhawan Palace
Lake Palace
Temples
Dilwara Temples
Brahma Temple Pushkar
Eklingji Temple
Ranakpur Jain Temple
Stepwells & Historic Structures
Chand Baori Stepwell
Panna Meena Ka Kund
Other Historic Sites
Jantar Mantar Jaipur
Albert Hall Museum
Patwon Ki Haveli

Major Monuments of Sikkim
Monasteries (Buddhist Heritage)
Rumtek Monastery – one of the largest monasteries in Sikkim.
Pemayangtse Monastery
Tashiding Monastery
Enchey Monastery
Phodong Monastery
Ralang Monastery
Temples
Kirateshwar Mahadev Temple
Hanuman Tok
Ganesh Tok
Cultural & Historic Monuments
Namgyal Institute of Tibetology – important research institute for Tibetan culture.
Rabdentse Ruins – ruins of the former capital of Sikkim.
Memorials
Tashi View Point Monument Area
War Memorial Gangtok
Cultural Heritage Sites
Yuksom Coronation Throne – place where the first king of Sikkim was crowned.

Major Monuments of Tamil Nadu
UNESCO World Heritage Sites
Brihadeeswarar Temple
Gangaikonda Cholapuram Temple
Airavatesvara Temple
Mahabalipuram Group of Monuments
Famous Temples
Meenakshi Amman Temple
Ramanathaswamy Temple
Chidambaram Nataraja Temple
Ekambareswarar Temple
Kapaleeshwarar Temple
Forts
Fort St. George
Gingee Fort
Vellore Fort
Palaces
Thirumalai Nayakkar Palace
Chettinad Palace
Churches & Religious Monuments
San Thome Basilica
Velankanni Church
Other Historic Sites
Rock Fort Temple
Kallanai Dam – one of the oldest water dams in the world.

Major Monuments of Telangana
Famous Forts
Golconda Fort
Warangal Fort
Bhongir Fort
Medak Fort
Khammam Fort
Mosques & Islamic Monuments
Charminar – iconic monument of Hyderabad.
Mecca Masjid
Qutb Shahi Tombs
Taramati Baradari
Temples
Thousand Pillar Temple
Yadadri Temple
Ramappa Temple – UNESCO World Heritage Site.
Palaces & Historic Buildings
Chowmahalla Palace
Falaknuma Palace
Other Historic Sites
Kakatiya Kala Thoranam
Paigah Tombs

Major Monuments of Tripura
Palaces
Ujjayanta Palace – former royal palace of the Tripura kings.
Neermahal Palace – water palace built in the middle of Rudrasagar Lake.
Temples
Tripura Sundari Temple – one of the 51 Shakti Peeths.
Chaturdasha Temple
Archaeological & Rock Cut Monuments
Unakoti Rock Carvings – famous ancient rock sculptures.
Pilak Archaeological Site – Buddhist and Hindu archaeological remains.
Devtamura Rock Sculptures
Historic & Cultural Sites
Kunjaban Palace
Heritage Park Agartala
Memorials & Museums
Tripura State Museum

Major Monuments of Uttarakhand
Temples (Pilgrimage Sites)
Badrinath Temple – one of the Char Dham pilgrimage sites.
Kedarnath Temple
Hemkund Sahib – Sikh pilgrimage site.
Gangotri Temple
Yamunotri Temple
Jageshwar Temples – group of ancient temples.
Baijnath Temple
Forts & Historic Structures
Chandpur Fort
Binsar Fort
Lohaghat Fort
Archaeological & Cultural Sites
Haridwar Temples and Ghats
Rishikesh Temples and Ghats
Nanda Devi National Park Monuments – natural and heritage site.
Museums & Memorials
Doon School Heritage Buildings
Forest Research Institute Heritage Buildings

Major Monuments of West Bengal
UNESCO World Heritage Sites
Sundarbans National Park – natural heritage site.
Bishnupur Terracotta Temples
Temples & Religious Sites
Dakshineswar Kali Temple
Kalighat Kali Temple
Tarapith Temple
Belur Math – headquarters of Ramakrishna Mission.
Forts & Colonial Monuments
Fort William
Maidan Heritage Structures
Victoria Memorial
Indian Museum
Rajbari Bishnupur
Archaeological & Cultural Sites
Jorasanko Thakur Bari – ancestral home of Rabindranath Tagore.
Cooch Behar Palace
Hingalganj Heritage Sites
Other Historic Monuments
St. Paul’s Cathedral
Marble Palace
Nimati Ghat Temples

Major Monuments of Andaman & Nicobar Islands
Historic & Colonial Monuments
Cellular Jail – infamous colonial-era prison.
Ross Island Ruins – former British administrative center.
Viper Island Jail – historic penal colony.
Chatham Saw Mill Heritage Site – one of the oldest saw mills in Asia.
Lighthouses & Coastal Monuments
Barren Island Lighthouse
Havelock Island Lighthouse
Ross Island Lighthouse Ruins
Archaeological & Cultural Sites
Indira Point Monument – southernmost point of India.
Japanese Bunkers – WWII Japanese installations.
Anthropological Museum – showcases indigenous tribes’ culture.
Other Historic Sites
Chidiya Tapu Viewpoint Monuments
Ross Island Cemetery

Major Monuments of Chandigarh
Modernist & Architectural Monuments
Capitol Complex – includes the Secretariat, High Court, and Legislative Assembly.
Open Hand Monument – iconic symbol of the city.
Governer’s Palace (Raj Bhavan)
Le Corbusier Centre – museum and research center.
Museums & Cultural Monuments
Chandigarh Architecture Museum
Government Museum and Art Gallery
Punjab University Heritage Buildings
Gardens & Landscaped Heritage Sites
Rock Garden of Chandigarh – sculptural garden created by Nek Chand.
Rose Garden (Zakir Hussain Rose Garden) – Asia’s largest rose garden.
Sukhna Lake Monument Area – includes embankments and recreational heritage structures.
Other Historic & Cultural Sites
Terraced Garden Chandigarh
Elante Mall Heritage Facade Area – modern commercial heritage architecture.

Major Monuments of Dadra and Nagar Haveli
Temples & Religious Sites
Shri Tana Bhagat Mandir – important tribal and religious site.
Shri Somnath Mahadev Mandir
Mothughad Temple
Forts & Colonial Structures
Fort Silvassa (Heritage Site) – colonial-era fort structure.
Cultural & Tribal Heritage Sites
Vanganga Lake Tribal Museum – showcases tribal artifacts and culture.
Dudhni Lake Viewpoint Heritage Site
Natural Heritage Monuments
Hirli Tribal Forest Heritage Area
Don Bosco Tribal Heritage Center

Major Monuments of Jammu & Kashmir
Forts & Palaces
Jammu Fort
Bahu Fort
Amar Mahal Palace
Nishat Bagh Heritage Area
Shalimar Bagh
Temples
Raghunath Temple
Vaishno Devi Temple – one of the most visited pilgrimage sites in India.
Shankaracharya Temple
Mosques & Islamic Monuments
Jamia Masjid
Hazratbal Shrine
Buddhist Monuments
Thiksey Monastery
Hemis Monastery
Shey Palace and Monastery
Gardens & Cultural Sites
Chashme Shahi Garden
Nigeen Lake Heritage Area
Mughal Road Historic Sites

Major Monuments of Ladakh
Buddhist Monasteries (Gompas)
Hemis Monastery – one of the largest and wealthiest monasteries in Ladakh.
Thiksey Monastery – famous for its resemblance to Potala Palace of Tibet.
Spituk Monastery
Shey Monastery and Palace – former summer palace of Ladakhi kings.
Stakna Monastery
Diskit Monastery – famous in Nubra Valley.
Alchi Monastery – known for ancient murals and paintings.
Lamayuru Monastery – “Moonland Monastery” with centuries-old heritage.
Forts & Palaces
Leh Palace – 17th-century palace with panoramic view of Leh.
Basgo Fort – historic fort and monastery complex.
Namgyal Tsemo Gompa & Fort
Other Cultural & Heritage Sites
Shanti Stupa – modern Buddhist monument with panoramic views.
Hemis National Park Cultural Monuments – includes tribal and monastery sites.
Magnetic Hill Heritage Area – famous optical illusion site with historical context.

Major Monuments of Lakshadweep
Mosques & Religious Sites
Ujra Mosque – one of the oldest mosques in Lakshadweep.
Juma Masjid – main congregational mosque of Kavaratti.
Bangaram Island Mosque
Colonial & Historic Sites
Minicoy Lighthouse Heritage Site – built during the British era.
Kavaratti Lighthouse
Natural & Cultural Monuments
Bangaram Island Heritage Area – includes traditional settlements and coral structures.
Agatti Island Cultural Monuments – traditional island architecture.
Kalpeni Island Heritage Structures

Major Monuments of Puducherry
Colonial & French Heritage Sites
French Quarter (White Town) – historic French-style streets and buildings.
Raj Nivas (Governor’s House) – former residence of French governors.
Puducherry Museum – showcases colonial-era artifacts and heritage.
Arikamedu Archaeological Site – ancient Roman trading port ruins.
Churches
Basilica of the Sacred Heart of Jesus
Immaculate Conception Cathedral
Temples & Religious Sites
Manakula Vinayagar Temple
Vedapureeswarar Temple
Other Heritage Sites
Promenade Beach Heritage Area – includes colonial-era statues and structures along the seaside.
Botanical Garden Heritage Section`

const stateCoords = {
  'Andaman and Nicobar Islands': { lat: 11.6670, lng: 92.7359 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
  Assam: { lat: 26.2006, lng: 92.9376 },
  Bihar: { lat: 25.0961, lng: 85.3131 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Chhattisgarh: { lat: 21.2787, lng: 81.8661 },
  'Dadra and Nagar Haveli': { lat: 20.1809, lng: 73.0169 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Goa: { lat: 15.2993, lng: 74.1240 },
  Gujarat: { lat: 22.2587, lng: 71.1924 },
  Haryana: { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1666 },
  'Jammu & Kashmir': { lat: 33.7782, lng: 76.5762 },
  Jharkhand: { lat: 23.6102, lng: 85.2799 },
  Karnataka: { lat: 15.3173, lng: 75.7139 },
  Kerala: { lat: 10.8505, lng: 76.2711 },
  Ladakh: { lat: 34.1526, lng: 77.5771 },
  Lakshadweep: { lat: 10.5667, lng: 72.6417 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  Maharashtra: { lat: 19.7515, lng: 75.7139 },
  Manipur: { lat: 24.6637, lng: 93.9063 },
  Meghalaya: { lat: 25.4670, lng: 91.3662 },
  Mizoram: { lat: 23.1645, lng: 92.9376 },
  Nagaland: { lat: 26.1584, lng: 94.5624 },
  Odisha: { lat: 20.9517, lng: 85.0985 },
  Puducherry: { lat: 11.9416, lng: 79.8083 },
  Punjab: { lat: 31.1471, lng: 75.3412 },
  Rajasthan: { lat: 27.0238, lng: 74.2179 },
  Sikkim: { lat: 27.5330, lng: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  Telangana: { lat: 18.1124, lng: 79.0193 },
  Tripura: { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  Uttarakhand: { lat: 30.0668, lng: 79.0193 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 }
}

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0)

const parsedMonuments = []
let curState = ''
let curCategory = 'Monuments'

for (const line of lines) {
  if (line.startsWith('Major Monuments of ')) {
    curState = line.replace('Major Monuments of ', '').trim()
  } else if (!line.includes(' – ') && !line.includes(' - ') &&
             (line.includes('Monuments') || line.includes('Sites') || line.includes('Temples') ||
              line.includes('Forts') || line.includes('Palaces') || line.includes('Churches') ||
              line.includes('Mosques') || line.includes('Museums') || line.includes('Structure') ||
              line.includes('Caves') || line.includes('Vavs') || line.includes('Ruins') ||
              line.includes('Agra') || line.includes('Lucknow') || line.includes('Delhi') ||
              line.includes('Varanasi') || line.includes('Prayagraj') || line.includes('Jhansi') ||
              line.includes('Mathura') || line.includes('Ayodhya') || line.includes('Structures'))) {
    const t = line.toLowerCase()
    if (t.includes('temple') || t.includes('gurudwara')) curCategory = 'Temples'
    else if (t.includes('fort')) curCategory = 'Forts'
    else if (t.includes('palace')) curCategory = 'Palaces'
    else if (t.includes('cave')) curCategory = 'Caves'
    else if (t.includes('heritage') || t.includes('unesco')) curCategory = 'UNESCO Sites'
    else curCategory = 'Monuments'

    // exceptions
    if (line === 'Hampi (UNESCO World Heritage Site)') {
      curCategory = 'UNESCO Sites'
    }
  } else {
    // Monument name and optional desc
    let name = line
    let desc = ''
    if (line.includes(' – ')) {
      const parts = line.split(' – ')
      name = parts[0].trim()
      desc = parts[1].trim()
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ')
      name = parts[0].trim()
      desc = parts[1].trim()
    }

    if (curState === 'Andaman & Nicobar Islands') curState = 'Andaman and Nicobar Islands'

    parsedMonuments.push({ name, state: curState, category: curCategory, description: desc })
  }
}

console.log(`Parsed ${parsedMonuments.length} unique monuments. Starting Wikipedia fetch...`)

async function fetchWikiInfo (title) {
  try {
    const cleanTitle = title.split(' (')[0]
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`)
    const data = await res.json()
    return {
      desc: data.extract,
      img: data.thumbnail ? data.thumbnail.source : null,
      coords: data.coordinates ? { lat: data.coordinates.lat, lng: data.coordinates.lon } : null
    }
  } catch (err) {
    return null
  }
}

const batchSize = 10
const delay = ms => new Promise(res => setTimeout(res, ms))

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Wiping old data...')
    await Monument.deleteMany({})

    let totalProcessed = 0
    const finalMonuments = []

    for (let i = 0; i < parsedMonuments.length; i += batchSize) {
      const batch = parsedMonuments.slice(i, i + batchSize)

      const batchResults = await Promise.all(batch.map(async (m) => {
        const wikiInfo = await fetchWikiInfo(m.name)
        const fallbackLat = stateCoords[m.state] ? stateCoords[m.state].lat + (Math.random() - 0.5) * 0.1 : 20.0 + Math.random()
        const fallbackLng = stateCoords[m.state] ? stateCoords[m.state].lng + (Math.random() - 0.5) * 0.1 : 78.0 + Math.random()

        const modelUrl = 'https://sketchfab.com/models/placeholder'

        const finalData = {
          name: m.name,
          state: m.state,
          city: m.state + ' Area',
          category: m.category,
          description: m.description || (wikiInfo ? wikiInfo.desc : 'A significant historical monument.'),
          images: wikiInfo && wikiInfo.img ? [wikiInfo.img] : ['https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg'],
          coordinates: wikiInfo && wikiInfo.coords ? wikiInfo.coords : { lat: fallbackLat, lng: fallbackLng }
        }

        return finalData
      }))

      finalMonuments.push(...batchResults)
      totalProcessed += batch.length
      console.log(`Fetched ${totalProcessed} / ${parsedMonuments.length}`)
      await delay(200)
    }

    await Monument.insertMany(finalMonuments)
    console.log('Successfully completed massive seed operation!')
    process.exit()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
