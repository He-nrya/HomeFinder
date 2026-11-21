require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const img = (...ids) => ids.map((id) => ({ url: U(id), publicId: '' }));
const H = ['photo-1600585154340-be6161a56a0c', 'photo-1600607687920-4e2a09cf159d', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600607688969-a5bfcd646154'];
const loc = (address, lat, lng) => ({ address, city: 'Abuja', lat, lng });
const sale = (title, area, price, bed, lat, lng, i, desc) => ({
  title, category: 'sale', type: title.includes('Apartment') ? 'Apartment' : title.includes('Bungalow') ? 'Bungalow' : title.includes('Terrace') ? 'Terrace House' : 'Duplex',
  price, bedrooms: bed, bathrooms: bed, parking: 2, location: loc(`${area}, Abuja, FCT`, lat, lng), description: desc,
  nearby: `${area}. Close to major roads, shopping centers, schools and recreational facilities.`,
  features: ['Fitted kitchen', 'Parking space', '24/7 security', 'Modern finishing'], images: img(H[i], H[(i + 1) % 4], H[(i + 2) % 4]),
  contactPhone: '+2348000000000', verified: true, featured: i < 2, status: 'approved',
});
const stu = (title, uni, type, price, area, lat, lng, dist, i) => ({
  title, category: 'student', type, university: uni, price, bedrooms: type === '2 Bedroom' ? 2 : 1, bathrooms: 1, parking: 0, distanceToCampus: dist,
  location: loc(area, lat, lng), description: `Safe, affordable ${type.toLowerCase()} for students of ${uni}, with steady water, reliable power and a quiet study-friendly environment.`,
  nearby: `${dist} from campus. Close to transport, markets and eateries.`, features: ['Water supply', 'Fenced compound', 'Study area', 'Wi-Fi ready'],
  images: img(H[i % 4], H[(i + 1) % 4]), contactPhone: '+2348000000000', verified: true, featured: i === 0, status: 'approved',
});
const rent = (title, type, price, bed, area, lat, lng, i) => ({
  title, category: 'rent', type, price, bedrooms: bed, bathrooms: bed, parking: 1, location: loc(area, lat, lng),
  description: `Well-finished ${type.toLowerCase()} for rent in a calm, accessible neighbourhood with good road network and security.`,
  nearby: `${area}. Near shops, schools and public transport.`, features: ['Prepaid meter', 'Borehole', 'Security', 'Tiled floors'],
  images: img(H[i % 4], H[(i + 2) % 4]), contactPhone: '+2348000000000', verified: true, status: 'approved',
});

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) admin = await User.create({ name: 'HomeFinder Admin', email: process.env.ADMIN_EMAIL, phone: '+2348000000000', accountType: 'Landlord', role: 'admin', emailVerified: true, password: process.env.ADMIN_PASSWORD });
  if (!admin.emailVerified) { admin.emailVerified = true; await admin.save(); }
  const list = [
    sale('Modern 4 Bedroom Duplex', 'Jabi District', 85000000, 4, 9.0707, 7.4233, 0, 'Beautiful and spacious four-bedroom duplex in a secure, peaceful neighborhood with modern finishing, fitted kitchen and well-designed compound.'),
    sale('Luxunpm ry 3 Bedroom Apartment', 'Wuse 2', 62000000, 3, 9.0765, 7.4698, 1, 'Contemporary three-bedroom apartment for comfortable family living with spacious bedrooms, modern bathrooms and excellent security.'),
    sale('Spacious 3 Bedroom Bungalow', 'Kubwa', 45000000, 3, 9.155, 7.327, 2, 'Well-maintained three-bedroom bungalow with a spacious compound, modern interior and excellent access to the main road.'),
    sale('Premium 4 Bedroom Terrace', 'Gwarinpa', 70000000, 4, 9.1117, 7.4031, 3, 'Stylish four-bedroom terrace with modern architecture, quality fittings, fitted kitchen and private parking.'),
    rent('Cozy 2 Bedroom Flat', 'Apartment', 2500000, 2, 'Lugbe, Abuja, FCT', 8.9696, 7.3777, 1),
    rent('Neat Self Contained', 'Self Contain', 900000, 1, 'Kubwa, Abuja, FCT', 9.1559, 7.3281, 2),
    rent('3 Bedroom Family Duplex', 'Duplex', 6500000, 3, 'Maitama, Abuja, FCT', 9.0873, 7.4936, 0),
    stu('Modern Student Studio', 'University of Abuja', 'Self Contain', 350000, 'Gwagwalada, Abuja', 8.95, 7.07, '5 min walk', 0),
    stu('Jabi Student Residence', 'Nile University', 'Shared Apartment', 500000, 'Jabi, Abuja', 9.0159, 7.3905, '10 min drive', 1),
    stu('Baze Student Lodge', 'Baze University', 'Hostel', 450000, 'Jabi, Abuja', 9.0015, 7.43, '8 min walk', 2),
    stu('Akoka Smart Residence', 'University of Lagos', 'Self Contain', 700000, 'Akoka, Lagos', 6.5158, 3.3897, '6 min walk', 3),
    stu('Samaru Student Room', 'Ahmadu Bello University', 'Single Room', 250000, 'Samaru, Zaria', 11.1517, 7.6489, '4 min walk', 0),
  ].map((p) => ({ ...p, owner: admin._id }));
  list.forEach((p) => { if (p.location.address.includes('Lagos')) p.location.city = 'Lagos'; if (p.location.address.includes('Zaria')) p.location.city = 'Zaria'; });
  await Property.insertMany(list);
  console.log(`Seeded ${list.length} properties. Admin: ${process.env.ADMIN_EMAIL}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
