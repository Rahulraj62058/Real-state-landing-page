import User from './models/User.js';
import Property from './models/Property.js';
import Inquiry from './models/Inquiry.js';

export async function seedDatabase() {
  await Promise.all([User.deleteMany(), Property.deleteMany(), Inquiry.deleteMany()]);

  const admin = await User.create({ name: 'Admin', email: 'admin@portal.test', password: 'admin123', role: 'admin' });
  const owner = await User.create({ name: 'Riya Sharma', email: 'owner@portal.test', password: 'owner123', role: 'owner' });
  await User.create({ name: 'Aman Verma', email: 'user@portal.test', password: 'user123', role: 'user' });

  const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
  const photos = {
    apartment: ['photo-1545324418-cc1a3fa10c00', 'photo-1502672260266-1c1ef2d93688', 'photo-1560448204-e02f11c3d0e2'],
    house: ['photo-1568605114967-8130f3a36994', 'photo-1564013799919-ab600027ffc6', 'photo-1570129477492-45c003edd2be'],
    villa: ['photo-1512917774080-9991f1c4c750', 'photo-1613490493576-7fde63acd811', 'photo-1580587771525-78b9dba3b914'],
    plot: ['photo-1500382017468-9049fed747ef', 'photo-1470071459604-3b5ec3a7fe05'],
    commercial: ['photo-1497366216548-37526070297c', 'photo-1486406146926-c627a92ad1ab', 'photo-1497366811353-6870744d04b2'],
  };
  const amenityPool = {
    apartment: ['Lift', 'Parking', 'Power backup', 'Security', 'Gym'],
    house: ['Parking', 'Garden', 'Power backup', '24x7 water', 'Terrace'],
    villa: ['Swimming pool', 'Private garden', 'Parking', 'Security', 'Club house'],
    plot: ['Gated colony', 'Road access', 'Water connection', 'Electricity nearby'],
    commercial: ['Parking', 'Power backup', 'Lift', 'CCTV', 'High-speed internet'],
  };

  // [title, propertyType, listingType, price, bedrooms, bathrooms, areaSqft, city, address]
  const base = [
    // Apartments
    ['3 BHK apartment near metro', 'apartment', 'sale', 8500000, 3, 2, 1450, 'Noida', 'Sector 62'],
    ['Furnished 2 BHK for rent', 'apartment', 'rent', 32000, 2, 2, 980, 'Bengaluru', 'Indiranagar'],
    ['1 BHK studio for rent', 'apartment', 'rent', 16000, 1, 1, 520, 'Pune', 'Kharadi'],
    ['Cozy 2 BHK with balcony', 'apartment', 'rent', 24000, 2, 2, 900, 'Noida', 'Sector 137'],
    ['Luxury 4 BHK sky apartment', 'apartment', 'sale', 32000000, 4, 4, 2800, 'Mumbai', 'Worli'],
    ['2 BHK flat with park view', 'apartment', 'sale', 6200000, 2, 2, 1050, 'Pune', 'Wakad'],
    ['Budget 1 BHK for rent', 'apartment', 'rent', 12000, 1, 1, 450, 'Lucknow', 'Alambagh'],
    // Houses
    ['Independent house with garden', 'house', 'sale', 14500000, 4, 3, 2400, 'Lucknow', 'Gomti Nagar'],
    ['4 BHK builder floor', 'house', 'sale', 21000000, 4, 4, 2100, 'Gurugram', 'Sector 49'],
    ['Duplex house with terrace', 'house', 'sale', 18500000, 4, 4, 2600, 'Jaipur', 'Malviya Nagar'],
    ['Family bungalow near school', 'house', 'rent', 45000, 3, 3, 2000, 'Chandigarh', 'Sector 21'],
    ['2 BHK independent house', 'house', 'sale', 5400000, 2, 2, 1200, 'Indore', 'Vijay Nagar'],
    // Villas
    ['Sea-facing luxury villa', 'villa', 'sale', 65000000, 5, 5, 5200, 'Goa', 'Candolim'],
    ['Gated community villa with pool', 'villa', 'sale', 42000000, 4, 5, 4200, 'Hyderabad', 'Gachibowli'],
    ['Hillside holiday villa', 'villa', 'rent', 95000, 3, 3, 3000, 'Dehradun', 'Rajpur Road'],
    ['Modern 3 BHK villa', 'villa', 'sale', 23500000, 3, 3, 2800, 'Ahmedabad', 'Bopal'],
    ['Farmhouse villa with lawn', 'villa', 'sale', 31000000, 5, 4, 6000, 'Gurugram', 'Sohna Road'],
    // Plots
    ['Corner residential plot', 'plot', 'sale', 4200000, 0, 0, 1800, 'Jaipur', 'Vaishali Nagar'],
    ['Residential plot in new township', 'plot', 'sale', 2800000, 0, 0, 1200, 'Lucknow', 'Sultanpur Road'],
    ['Farm land, 2 acres', 'plot', 'sale', 9500000, 0, 0, 87120, 'Nashik', 'Igatpuri Road'],
    ['East-facing plot near highway', 'plot', 'sale', 5100000, 0, 0, 2400, 'Noida', 'Sector 150'],
    ['Gated colony plot', 'plot', 'sale', 3600000, 0, 0, 1500, 'Bengaluru', 'Devanahalli'],
    // Commercial
    ['Office space in tech park', 'commercial', 'rent', 120000, 0, 2, 2500, 'Bengaluru', 'Whitefield'],
    ['Showroom on main road', 'commercial', 'sale', 38000000, 0, 2, 3200, 'Pune', 'FC Road'],
    ['Co-working floor, fully furnished', 'commercial', 'rent', 210000, 0, 4, 5000, 'Gurugram', 'Cyber City'],
    ['Warehouse with loading bay', 'commercial', 'rent', 85000, 0, 1, 8000, 'Noida', 'Sector 63'],
    ['Ground-floor shop in market', 'commercial', 'rent', 55000, 0, 1, 700, 'Delhi', 'Lajpat Nagar'],
  ];

  const PENDING_DEMO = 'Ground-floor shop in market'; // stays "pending" so the admin has something to approve
  const ADMIN_OWNED = 'Cozy 2 BHK with balcony';
  const counters = {};

  await Property.insertMany(
    base.map(([title, propertyType, listingType, price, bedrooms, bathrooms, areaSqft, city, address]) => {
      const n = (counters[propertyType] = (counters[propertyType] || 0) + 1);
      const pool = photos[propertyType];
      const amenities = amenityPool[propertyType];
      return {
        title, propertyType, listingType, price, bedrooms, bathrooms, areaSqft, city, address,
        description: `${title} in ${address}, ${city}. Well maintained and close to schools, markets and public transport. Site visits available on weekends.`,
        images: pool.map((_, k) => img(pool[(n + k) % pool.length])),
        amenities: amenities.slice(0, 3 + (n % 2)),
        owner: title === ADMIN_OWNED ? admin._id : owner._id,
        status: title === PENDING_DEMO ? 'pending' : 'approved',
      };
    })
  );

  console.log(`Seeded ${base.length} properties. Logins: admin@portal.test/admin123, owner@portal.test/owner123, user@portal.test/user123`);
}
