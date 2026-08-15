import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

const SAMPLE_LISTINGS = [
  {
    title: 'Apple MacBook Pro 14" (M3 Pro, 18GB RAM, 512GB SSD)',
    category: 'Electronics',
    price: 1849,
    condition: 'Like New',
    description: 'Space Black MacBook Pro 14-inch with M3 Pro chip. Immaculate condition, only 22 battery cycles. Comes with original MagSafe 3 cable, 70W USB-C power adapter, and retail packaging.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Apple',
      Model: 'MacBook Pro 14 (2023)',
      Processor: 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      Memory: '18 GB Unified Memory',
      Storage: '512 GB NVMe SSD',
      Screen: '14.2" Liquid Retina XDR (3024x1964, 120Hz)',
    },
    daysAgo: 1,
  },
  {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    category: 'Electronics',
    price: 289,
    condition: 'New',
    description: 'Brand new, sealed in box Sony WH-1000XM5 wireless headphones in Silver. Industry-leading active noise cancelling with dual processors and 8 microphones. Up to 30 hours battery life.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Sony',
      Model: 'WH-1000XM5',
      Color: 'Silver',
      Connectivity: 'Bluetooth 5.2, 3.5mm Aux',
      'Battery Life': 'Up to 30 hours with ANC',
      Weight: '250g',
    },
    daysAgo: 3,
  },
  {
    title: 'Apple iPhone 15 Pro - 256GB - Natural Titanium',
    category: 'Electronics',
    price: 899,
    condition: 'Good',
    description: 'Factory unlocked iPhone 15 Pro in Natural Titanium. 100% functional, 96% battery health. Minor micro-scratches on side rail barely noticeable in case. Screen is flawless.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Apple',
      Model: 'iPhone 15 Pro',
      Storage: '256 GB',
      Color: 'Natural Titanium',
      Chip: 'A17 Pro',
      'Battery Health': '96%',
    },
    daysAgo: 4,
  },
  {
    title: 'Samsung 55" QN90C Neo QLED 4K Smart TV',
    category: 'Electronics',
    price: 749,
    condition: 'Like New',
    description: 'Stunning 55-inch Neo QLED 4K display with Mini LEDs, Quantum HDR 32X, and 120Hz native refresh rate for gaming. Includes SolarCell remote and original stand.',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Samsung',
      Model: 'QN55QN90CAFXZA',
      'Screen Size': '55 inches',
      Resolution: '4K Ultra HD (3840 x 2160)',
      'Refresh Rate': '120Hz / FreeSync Premium Pro',
      'HDMI Ports': '4x HDMI 2.1',
    },
    daysAgo: 6,
  },
  {
    title: 'Canon EOS R6 Mark II Mirrorless Camera (Body Only)',
    category: 'Electronics',
    price: 1999,
    condition: 'Like New',
    description: 'Canon EOS R6 II full-frame mirrorless camera body. Low shutter count (~2,400 actuations). Dual SD card slots, 24.2 MP sensor, up to 40 fps electronic shutter. Includes 2 LP-E6NH batteries.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Canon',
      Model: 'EOS R6 Mark II',
      Sensor: '24.2MP Full-Frame CMOS',
      Mount: 'Canon RF',
      Video: '6K oversampled 4K 60p 10-bit',
      Stabilization: 'In-Body 5-Axis (up to 8 stops)',
    },
    daysAgo: 8,
  },
  {
    title: 'Apple iPad Air 11" (M2, 128GB, Wi-Fi, Starlight)',
    category: 'Electronics',
    price: 529,
    condition: 'New',
    description: 'Brand new 11-inch iPad Air with powerful Apple M2 chip. Liquid Retina display with True Tone. Unopened box with 1 year Apple official warranty.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Apple',
      Model: 'iPad Air 11-inch (M2)',
      Storage: '128 GB',
      Color: 'Starlight',
      Display: '11" Liquid Retina (2360x1640)',
      Connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
    },
    daysAgo: 10,
  },
  {
    title: 'Keychron Q1 Pro Custom Mechanical Keyboard (Wireless)',
    category: 'Electronics',
    price: 145,
    condition: 'Like New',
    description: '75% layout QMK/VIA full CNC aluminum wireless mechanical keyboard. Hot-swappable Keychron K Pro Banana tactile switches, PBT double-shot keycaps, and RGB backlighting.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Keychron',
      Model: 'Q1 Pro',
      Layout: '75% Exploded',
      Switches: 'K Pro Banana Tactile (Hot-swap)',
      Material: 'Full CNC Anodized Aluminum',
      Connectivity: 'Bluetooth 5.1 & Type-C Wired',
    },
    daysAgo: 12,
  },
  {
    title: 'Herman Miller Aeron Chair - Size B (Fully Loaded)',
    category: 'Furniture',
    price: 799,
    condition: 'Good',
    description: 'Authentic Herman Miller Aeron ergonomic desk chair in Graphite. Size B (Medium). Equipped with PostureFit SL dual lumbar support, fully adjustable vinyl arms, and forward tilt limiter.',
    image: 'https://images.unsplash.com/photo-1580481077190-7361356a15fa?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Herman Miller',
      Model: 'Aeron Size B',
      Color: 'Graphite',
      Support: 'PostureFit SL Dual Lumbar',
      Adjustments: 'Seat Height, Tilt Tension, Forward Tilt, 3D Arms',
      Material: '8Z Pellicle Elastomeric Mesh',
    },
    daysAgo: 2,
  },
  {
    title: 'Solid European Oak 6-Seater Dining Table',
    category: 'Furniture',
    price: 650,
    condition: 'Good',
    description: 'Sturdy Scandinavian-style dining table crafted from solid natural oak with matte protective lacquer. Dimensions: 180cm x 90cm x 75cm. Minor signs of normal use.',
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Material: 'Solid European White Oak',
      Seating: '6-8 Persons',
      Dimensions: '180cm (L) x 90cm (W) x 75cm (H)',
      Finish: 'Matte Natural Polyurethane',
      Weight: '48 kg',
    },
    daysAgo: 5,
  },
  {
    title: 'Solid Walnut Queen Platform Bed Frame',
    category: 'Furniture',
    price: 420,
    condition: 'Like New',
    description: 'Mid-century modern queen-size platform bed frame with tapered legs and integrated slatted wooden base. No box spring needed. Easy toolless assembly.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Size: 'Queen (60" x 80" mattress fit)',
      Wood: 'Solid American Walnut',
      Style: 'Mid-Century Modern',
      'Weight Capacity': '800 lbs',
      Headboard: 'Integrated Slat Panel',
    },
    daysAgo: 7,
  },
  {
    title: 'Industrial 5-Tier Bookshelf - Rustic Oak & Steel',
    category: 'Furniture',
    price: 135,
    condition: 'Like New',
    description: 'Tall open-back freestanding 5-shelf storage bookcase. Heavy-duty black powder-coated steel frame with rustic oak engineered wood shelving. Includes wall anchor safety kit.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Tiers: '5 Levels',
      Dimensions: '175cm (H) x 80cm (W) x 32cm (D)',
      Frame: '1.2mm Tubular Steel',
      'Shelf Capacity': '25 kg per shelf',
    },
    daysAgo: 9,
  },
  {
    title: 'Top-Grain Italian Leather Recliner Armchair',
    category: 'Furniture',
    price: 580,
    condition: 'Good',
    description: 'Plush cognac brown top-grain leather armchair with smooth manual push-back reclining mechanism and padded headrest. Supremely comfortable for reading or home cinema.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Material: '100% Top-Grain Italian Leather',
      Color: 'Cognac Saddle Brown',
      Recline: '3-Position Push-back',
      Cushion: 'High-Resiliency Foam + Pocket Springs',
    },
    daysAgo: 13,
  },
  {
    title: 'Jarvis Dual-Motor Electric Standing Desk (140x70cm Bamboo)',
    category: 'Furniture',
    price: 360,
    condition: 'Like New',
    description: 'Ergonomic motorized height adjustable sit-to-stand desk. Natural sustainable bamboo tabletop with programmable 4-preset digital memory handset and cable management tray.',
    image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Motors: 'Dual Electric Heavy Duty',
      'Height Range': '62cm to 128cm',
      Tabletop: '140cm x 70cm Natural Bamboo',
      'Lifting Capacity': '125 kg',
      Handset: 'OLED Display with 4 Memory Presets',
    },
    daysAgo: 14,
  },
  {
    title: '2019 Toyota Corolla SE Sedan (Automatic, 48k miles)',
    category: 'Vehicles',
    price: 15400,
    condition: 'Good',
    description: 'Clean title 2019 Toyota Corolla SE in Super White. 48,200 verified miles. Fully inspected with fresh oil change and new Michelin tires. Apple CarPlay, Toyota Safety Sense 2.0, backup camera.',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Make: 'Toyota',
      Model: 'Corolla SE',
      Year: '2019',
      Mileage: '48,200 miles',
      Engine: '2.0L 4-Cylinder (169 hp)',
      Transmission: 'Dynamic-Shift CVT',
      Drivetrain: 'Front-Wheel Drive',
      Fuel: 'Petrol (34 MPG combined)',
    },
    daysAgo: 3,
  },
  {
    title: 'Honda CB500F ABS Naked Motorcycle (2021, Low Miles)',
    category: 'Vehicles',
    price: 4950,
    condition: 'Like New',
    description: '2021 Honda CB500F with ABS in Grand Prix Red. Only 3,800 miles. Garage kept, never dropped. Perfect commuter or A2-friendly naked bike with LED lighting and digital LCD dash.',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Make: 'Honda',
      Model: 'CB500F ABS',
      Year: '2021',
      Engine: '471cc Liquid-Cooled Parallel-Twin',
      Power: '47 hp @ 8,600 rpm',
      Brakes: 'Dual-Channel ABS with Nissin Calipers',
      'Wet Weight': '189 kg',
    },
    daysAgo: 7,
  },
  {
    title: 'Trek Marlin 7 Mountain Bike (Gen 3, Large Frame, Teal)',
    category: 'Vehicles',
    price: 590,
    condition: 'Good',
    description: 'Trek Marlin 7 cross-country hardtail MTB. RockShox Judy fork with lockout, Shimano Deore 1x10 drivetrain, and Shimano hydraulic disc brakes. 29" tubeless-ready wheels.',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Trek',
      Model: 'Marlin 7 Gen 3',
      'Frame Size': 'Large (Rider 5\'10" to 6\'2")',
      Fork: 'RockShox Judy 100mm with TurnKey Lockout',
      Drivetrain: 'Shimano Deore M4100 1x10-speed',
      Brakes: 'Shimano MT200 Hydraulic Disc',
    },
    daysAgo: 11,
  },
  {
    title: 'Xiaomi Pro 2 Electric Commuter Scooter (300W, 45km Range)',
    category: 'Vehicles',
    price: 340,
    condition: 'Good',
    description: 'Foldable adult electric scooter with 600W max motor power, kinetic energy recovery, 8.5-inch pneumatic shock-absorbing tires, and front headlight. Includes charger and spare tire.',
    image: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Xiaomi',
      Model: 'Mi Electric Scooter Pro 2',
      'Max Speed': '25 km/h (15.5 mph)',
      Range: 'Up to 45 km per charge',
      'Max Load': '100 kg',
      Weight: '14.2 kg',
    },
    daysAgo: 15,
  },
  {
    title: 'Vintage Men\'s Schott NYC Leather Biker Jacket (Size M)',
    category: 'Fashion',
    price: 240,
    condition: 'Good',
    description: 'Classic Schott Perfecto style asymmetrical leather motorcycle jacket in supple black cowhide. Heavy-duty Talon zippers, quilted thermal lining, and authentic belted waist.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Schott NYC Style',
      Size: 'Men\'s Medium (38-40)',
      Material: '100% Genuine Full-Grain Cowhide Leather',
      Hardware: 'Antiqued Nickel / Heavy Duty Zippers',
      Lining: 'Insulated Diamond Quilted Satin',
    },
    daysAgo: 4,
  },
  {
    title: 'Designer Leather Crossbody Handbag - Forest Green',
    category: 'Fashion',
    price: 195,
    condition: 'Like New',
    description: 'Handcrafted Italian pebble-grain leather crossbody bag with brushed gold hardware, adjustable shoulder strap, and suede interior lining with zip pocket. Includes dust bag.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Material: 'Pebbled Italian Calfskin',
      Color: 'Forest Green',
      Dimensions: '24cm (W) x 18cm (H) x 8cm (D)',
      Closure: 'Magnetic Flap with Lock',
    },
    daysAgo: 8,
  },
  {
    title: 'Nike Air Zoom Pegasus 40 Running Shoes (Size US 10.5)',
    category: 'Fashion',
    price: 75,
    condition: 'Like New',
    description: 'Worn only twice on treadmill. Nike Pegasus 40 road running sneakers in Black/White. React foam midsole with dual Zoom Air units. Clean soles and original box.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Nike',
      Model: 'Air Zoom Pegasus 40',
      'Size (US)': '10.5 (EU 44.5)',
      Color: 'Black / Metallic Silver / White',
      Type: 'Neutral Daily Road Running',
      Drop: '10mm',
    },
    daysAgo: 10,
  },
  {
    title: 'Tailored 100% Merino Wool Winter Overcoat (Camel, Size 40R)',
    category: 'Fashion',
    price: 180,
    condition: 'New',
    description: 'Unworn premium camel single-breasted wool overcoat with tags attached. Notched lapel, horn buttons, dual front flap pockets, and silky viscose lining. Elegant winter wardrobe staple.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Material: '100% Merino Wool (420 gsm)',
      Color: 'Camel Brown',
      Size: '40 Regular (Chest 40")',
      Fit: 'Tailored Modern Slim',
    },
    daysAgo: 16,
  },
  {
    title: 'Garmin Forerunner 965 GPS Fitness Smartwatch (Titanium Bezel)',
    category: 'Fashion',
    price: 460,
    condition: 'Like New',
    description: 'Garmin Forerunner 965 premium running watch with 1.4" AMOLED touchscreen display, titanium bezel, preloaded full-color mapping, and up to 23 days battery life in smartwatch mode.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Garmin',
      Model: 'Forerunner 965',
      Display: '1.4" AMOLED Touchscreen (454x454)',
      Bezel: 'Titanium with DLC Coating',
      Sensors: 'Multi-Band GPS, Wrist HR, Pulse Ox, Compass',
      'Battery Life': 'Up to 23 days (31 hours in GPS mode)',
    },
    daysAgo: 5,
  },
  {
    title: 'Honda HRX217 Petrol Self-Propelled Lawn Mower',
    category: 'Home & Garden',
    price: 390,
    condition: 'Good',
    description: 'Honda HRX 21-inch lawn mower with GCV200 four-stroke engine and MicroCut twin-blade system. NeXite rust-free deck, variable speed hydrostatic drive, and 4-in-1 Versamow system.',
    image: 'https://images.unsplash.com/photo-1589824783837-6169889fa20f?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Honda Power Equipment',
      Model: 'HRX217VKA',
      Engine: 'Honda GCV200 (201cc 4-Stroke)',
      'Cutting Width': '21 Inches (53 cm)',
      Deck: 'NeXite Polymer (Rust Proof)',
      Drive: 'Self-Propelled Variable Select Drive',
    },
    daysAgo: 8,
  },
  {
    title: 'Outdoor All-Weather Rattan 4-Piece Patio Lounge Set',
    category: 'Home & Garden',
    price: 420,
    condition: 'Good',
    description: 'UV-resistant synthetic wicker patio conversation set: 1 two-seater loveseat sofa, 2 deep club armchairs, and 1 tempered glass coffee table. Includes thick waterproof off-white cushions.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Pieces: '4-Piece Set (Loveseat, 2 Chairs, Table)',
      Material: 'Hand-woven PE Synthetic Rattan & Aluminum',
      Cushions: 'Olefin Water-Repellent Fabric (Removable)',
      Table: 'Tempered Safety Glass Top',
    },
    daysAgo: 12,
  },
  {
    title: 'Rare Botanical Indoor Houseplant Collection (5 Established Pots)',
    category: 'Home & Garden',
    price: 65,
    condition: 'New',
    description: 'Healthy, pest-free collection of 5 thriving houseplants in ceramic pots with drainage saucers: Monstera Deliciosa, Fiddle Leaf Fig, Sansevieria (Snake Plant), Golden Pothos, and ZZ Plant.',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Quantity: '5 Healthy Potted Plants',
      Species: 'Monstera, Ficus Lyrata, Sansevieria, Pothos, Zamioculcas',
      Pots: 'White Glazed Terracotta with Saucers (6-8 inch)',
      Care: 'Low to Bright Indirect Light, Easy Maintenance',
    },
    daysAgo: 1,
  },
  {
    title: 'Weber Spirit II E-310 3-Burner Liquid Propane Gas BBQ Grill',
    category: 'Home & Garden',
    price: 349,
    condition: 'Like New',
    description: 'Weber GS4 grilling system 3-burner gas BBQ. Porcelain-enameled cast-iron cooking grates, iGrill 3 app-compatible thermometer slot, folding side table, and grease management system.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Weber',
      Model: 'Spirit II E-310',
      Burners: '3 Stainless Steel (30,000 BTU/hr)',
      'Primary Cooking Area': '424 sq inches',
      Grates: 'Porcelain-Enameled Cast Iron',
      Fuel: 'Liquid Propane (Tank not included)',
    },
    daysAgo: 14,
  },
  {
    title: 'DeWalt 20V MAX Brushless Cordless Drill & Driver 2-Tool Kit',
    category: 'Home & Garden',
    price: 135,
    condition: 'Like New',
    description: 'DeWalt DCK280C2 brushless cordless drill/driver and 1/4" impact driver kit. Includes two 20V MAX 2.0Ah lithium-ion batteries, fast charger, belt hooks, and heavy-duty ballistic nylon carry bag.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'DeWalt',
      Model: 'DCK280C2 Brushless Combo',
      Voltage: '20V MAX Lithium-Ion',
      Tools: 'DCD777 Compact Drill + DCF787 Impact Driver',
      Batteries: '2x 20V 2.0Ah XR Battery Packs',
    },
    daysAgo: 9,
  },
  {
    title: 'NordicTrack T Series Folding Treadmill (3.0 CHP Motor)',
    category: 'Sports',
    price: 490,
    condition: 'Good',
    description: 'SpaceSaver easy-fold running treadmill with 10% OneTouch incline, 0-10 MPH speed range, SMART-Response motor, FlexSelect deck cushioning, and auxiliary audio speakers.',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'NordicTrack',
      Model: 'T 6.5 S',
      Motor: '3.0 CHP Commercial Motor',
      Incline: '0 to 10% Digital OneTouch',
      'Running Belt': '20" x 55" Commercial Tread Belt',
      'Max User Weight': '300 lbs (136 kg)',
    },
    daysAgo: 6,
  },
  {
    title: 'Manduka PRO Yoga Mat (6mm High Density) & Cork Blocks Set',
    category: 'Sports',
    price: 55,
    condition: 'Like New',
    description: 'Manduka PRO 71-inch non-slip yoga mat in Black Sage with dense 6mm cushioning for joint protection. Includes 2 sustainable Manduka natural cork yoga blocks and a cotton carrying strap.',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Manduka',
      Model: 'PRO Mat 71"',
      Thickness: '6.0 mm High Density Closed-Cell',
      Dimensions: '71" (180cm) x 26" (66cm)',
      Accessories: '2x Natural Cork Blocks + Carrying Strap',
    },
    daysAgo: 13,
  },
  {
    title: 'Wilson Pro Staff 97 v14 Tennis Racket (4 3/8 Grip)',
    category: 'Sports',
    price: 155,
    condition: 'Like New',
    description: 'Wilson Pro Staff 97 v14 precision racket. Braid 45 construction for enhanced pocketing feel and stability. Freshly re-strung with Luxilon ALU Power 125 at 52 lbs. Clean bumper guard.',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Wilson',
      Model: 'Pro Staff 97 v14',
      'Head Size': '97 sq in / 626 sq cm',
      Weight: '315g Unstrung (11.1 oz)',
      'Grip Size': '4 3/8" (Size 3)',
      'String Pattern': '16x19',
    },
    daysAgo: 15,
  },
  {
    title: 'Bose QuietComfort Ultra Noise-Cancelling Wireless Earbuds',
    category: 'Electronics',
    price: 219,
    condition: 'Like New',
    description: 'Black Bose QC Ultra wireless earbuds with spatial audio (Immersive Audio), CustomTune sound calibration, IPX4 sweat resistance, and Qi wireless charging case.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Bose',
      Model: 'QuietComfort Ultra Earbuds',
      Audio: 'Bose Immersive Spatial Audio',
      'Noise Cancelling': 'Active CustomTune ANC',
      'Battery Life': '6 hours + 18 hours charging case',
    },
    daysAgo: 3,
  },
  {
    title: 'Franklin Sports Portable Heavy-Duty Soccer Goal Post (12x6 ft)',
    category: 'Sports',
    price: 85,
    condition: 'Good',
    description: 'Weatherproof powder-coated steel soccer goal net for garden or training ground. Quick-lock assembly with precision-fit locking pins, heavy-duty all-weather net, and ground stakes.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    specifications: {
      Brand: 'Franklin Sports',
      Dimensions: '12 ft (W) x 6 ft (H) x 4 ft (D)',
      Frame: '1.25" Galvanized Steel Tubing',
      Net: 'Heavy Duty 4-inch Weatherproof Mesh',
    },
    daysAgo: 17,
  },
];

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function seedDatabase() {
  const db = getDb();

  console.log('Seeding SQLite database...');

  // Reset existing tables
  db.exec('DELETE FROM listings');
  db.exec('DELETE FROM users');

  const insertListing = db.prepare(`
    INSERT INTO listings (id, title, category, price, condition, description, image, specifications, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedTransaction = db.transaction((listings) => {
    listings.forEach((item, index) => {
      insertListing.run(
        index + 1,
        item.title,
        item.category,
        item.price,
        item.condition,
        item.description,
        item.image,
        JSON.stringify(item.specifications || {}),
        daysAgoIso(item.daysAgo || Math.floor(Math.random() * 30))
      );
    });
  });

  seedTransaction(SAMPLE_LISTINGS);

  // Seed standard demo user: demo / demo1234
  const demoPasswordHash = await bcrypt.hash('demo1234', 10);
  db.prepare(`
    INSERT INTO users (username, passwordHash)
    VALUES (?, ?)
  `).run('demo', demoPasswordHash);

  const count = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
  console.log(`Seeded ${count} sample listings.`);
  console.log('Seeded demo account (username: demo / password: demo1234)');
}

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database seed error:', err);
    process.exit(1);
  });
