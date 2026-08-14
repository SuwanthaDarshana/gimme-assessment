import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const PRODUCTS = [
  { title: 'MacBook Pro 14" M3', category: 'Electronics', basePrice: 1899 },
  { title: 'Sony WH-1000XM5 Headphones', category: 'Electronics', basePrice: 349 },
  { title: 'iPhone 15 Pro', category: 'Electronics', basePrice: 999 },
  { title: 'Samsung 55" QLED TV', category: 'Electronics', basePrice: 799 },
  { title: 'Canon EOS R6 Camera', category: 'Electronics', basePrice: 2199 },
  { title: 'iPad Air 5th Gen', category: 'Electronics', basePrice: 549 },
  { title: 'Mechanical Keyboard (Hot-swap)', category: 'Electronics', basePrice: 89 },
  { title: 'Ergonomic Office Chair', category: 'Furniture', basePrice: 249 },
  { title: 'Oak Dining Table (6-seater)', category: 'Furniture', basePrice: 599 },
  { title: 'Queen Size Bed Frame', category: 'Furniture', basePrice: 399 },
  { title: 'Bookshelf - 5 Tier Walnut', category: 'Furniture', basePrice: 129 },
  { title: 'Leather Recliner Sofa', category: 'Furniture', basePrice: 899 },
  { title: 'Standing Desk (Electric)', category: 'Furniture', basePrice: 349 },
  { title: 'Toyota Corolla 2019', category: 'Vehicles', basePrice: 15500 },
  { title: 'Honda CB500F Motorcycle', category: 'Vehicles', basePrice: 5200 },
  { title: 'Trek Marlin 7 Mountain Bike', category: 'Vehicles', basePrice: 649 },
  { title: 'Electric Scooter (Xiaomi Pro 2)', category: 'Vehicles', basePrice: 399 },
  { title: 'Leather Jacket - Men\'s Medium', category: 'Fashion', basePrice: 149 },
  { title: 'Designer Handbag', category: 'Fashion', basePrice: 229 },
  { title: 'Running Shoes - Nike Pegasus', category: 'Fashion', basePrice: 99 },
  { title: 'Wool Winter Coat', category: 'Fashion', basePrice: 179 },
  { title: 'Smart Watch - Fitness Edition', category: 'Fashion', basePrice: 199 },
  { title: 'Garden Lawn Mower (Petrol)', category: 'Home & Garden', basePrice: 259 },
  { title: 'Patio Furniture Set (4pc)', category: 'Home & Garden', basePrice: 449 },
  { title: 'Indoor Plant Collection (5 pots)', category: 'Home & Garden', basePrice: 65 },
  { title: 'BBQ Grill - 3 Burner Gas', category: 'Home & Garden', basePrice: 219 },
  { title: 'Power Drill Set (Cordless)', category: 'Home & Garden', basePrice: 89 },
  { title: 'Treadmill - Foldable', category: 'Sports', basePrice: 549 },
  { title: 'Yoga Mat + Accessories Kit', category: 'Sports', basePrice: 39 },
  { title: 'Tennis Racket - Wilson Pro', category: 'Sports', basePrice: 129 },
  { title: 'Football Goal Post Set', category: 'Sports', basePrice: 89 },
];

function randomCondition() {
  return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function seed() {
  const db = getDb();

  // Clear existing records
  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');

  const insertListing = db.prepare(`
    INSERT INTO listings (id, title, category, price, condition, description, image, specifications, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedListings = db.transaction((products) => {
    products.forEach((p, index) => {
      insertListing.run(
        index + 1,
        p.title,
        p.category,
        p.basePrice,
        randomCondition(),
        `${p.title} in good working condition. ${p.category} item, well maintained, sold as-is. Contact seller for more details or to arrange inspection.`,
        null,
        JSON.stringify({ brandCategory: p.category }),
        daysAgoIso(Math.floor(Math.random() * 60))
      );
    });
  });

  seedListings(PRODUCTS);

  // Seed one demo user: demo / demo1234
  const passwordHash = await bcrypt.hash('demo1234', 10);
  db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run('demo', passwordHash);

  const count = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
  console.log(`Seeded ${count} listings and 1 demo user (demo / demo1234).`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
