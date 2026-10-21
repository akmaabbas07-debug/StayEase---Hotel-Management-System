/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Database Seeding Script (hotelDB Initial Master Data)
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Database Creation, Collections & Seed Documents)
   ========================================================================== */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database');

const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const { Service } = require('../models/Service');
const { Package, PackageItem } = require('../models/Package');
const BreakfastOption = require('../models/BreakfastOption');
const { Voucher } = require('../models/Voucher');

async function seedDatabase() {
  console.log('[StayEase Seed] Starting database initialization...');
  await connectDB();

  try {
    // 1. Seed Room Types
    await RoomType.deleteMany({});
    const roomTypes = await RoomType.insertMany([
      { name: 'Standard', basePrice: 3000, capacity: 2, description: 'Comfortable queen room with city views.', amenities: ['Queen Bed', 'Free Wi-Fi', 'AC', 'TV'] },
      { name: 'Deluxe', basePrice: 4500, capacity: 3, description: 'Spacious deluxe room with twin beds and garden view.', amenities: ['Twin Double Beds', 'Pool View', 'Bathtub', 'Mini-Bar'] },
      { name: 'Executive', basePrice: 6000, capacity: 3, description: 'Executive club room with king bed, workspace, and lounge privileges.', amenities: ['King Bed', 'Club Lounge Access', 'Espresso Machine', 'Work Desk'] },
      { name: 'Suite', basePrice: 10000, capacity: 4, description: 'Luxury presidential suite with master bedroom and private living salon.', amenities: ['Master Bedroom + Living Room', 'Jacuzzi', 'Panoramic Balcony', 'Butler Service'] }
    ]);
    console.log(`[Seed] Seeded ${roomTypes.length} Room Types`);

    // 2. Seed Rooms
    await Room.deleteMany({});
    const rooms = await Room.insertMany([
      { roomNumber: 101, floor: 1, type: 'Standard', capacity: 2, pricePerNight: 3000, status: 'AVAILABLE', amenities: ['Queen Bed', 'Wi-Fi'] },
      { roomNumber: 102, floor: 1, type: 'Standard', capacity: 2, pricePerNight: 3000, status: 'AVAILABLE', amenities: ['Queen Bed', 'Wi-Fi'] },
      { roomNumber: 201, floor: 2, type: 'Deluxe', capacity: 3, pricePerNight: 4500, status: 'AVAILABLE', amenities: ['Twin Beds', 'Bathtub'] },
      { roomNumber: 205, floor: 2, type: 'Executive', capacity: 3, pricePerNight: 6000, status: 'AVAILABLE', amenities: ['King Bed', 'Club Lounge', 'Work Desk'] },
      { roomNumber: 302, floor: 3, type: 'Deluxe', capacity: 3, pricePerNight: 4500, status: 'RESERVED', amenities: ['Double Bed', 'Pool View'] },
      { roomNumber: 401, floor: 4, type: 'Suite', capacity: 4, pricePerNight: 10000, status: 'AVAILABLE', amenities: ['Jacuzzi', 'Living Salon', 'Butler'] }
    ]);
    console.log(`[Seed] Seeded ${rooms.length} Rooms`);

    // 3. Seed Services Catalogue (Section 11)
    await Service.deleteMany({});
    const services = await Service.insertMany([
      { name: 'Room Service', category: 'FOOD', unitPrice: 300, description: 'In-room food & beverage dining tray service.', isAvailable: true },
      { name: 'Laundry', category: 'HOUSEKEEPING', unitPrice: 150, description: 'Express washing, ironing, and garment pressing.', isAvailable: true },
      { name: 'Airport Pickup', category: 'TRANSPORT', unitPrice: 1200, description: 'Chauffeur airport transfer.', isAvailable: true },
      { name: 'Spa', category: 'WELLNESS', unitPrice: 2000, description: '60-minute relaxing body therapy & wellness spa.', isAvailable: true },
      { name: 'Swimming Pool', category: 'WELLNESS', unitPrice: 500, description: 'Day pass for heated infinity swimming pool.', isAvailable: true },
      { name: 'Extra Bed', category: 'HOUSEKEEPING', unitPrice: 1000, description: 'Extra rollaway single bed with fresh linens.', isAvailable: true },
      { name: 'Mini Bar', category: 'FOOD', unitPrice: 800, description: 'Assorted beverages and gourmet snacks.', isAvailable: true },
      { name: 'Late Checkout', category: 'MISC', unitPrice: 1500, description: 'Extended checkout privileges up to 4:00 PM.', isAvailable: true }
    ]);
    console.log(`[Seed] Seeded ${services.length} Hotel Services`);

    // 4. Seed Breakfast Options (Section 9)
    await BreakfastOption.deleteMany({});
    const breakfast = await BreakfastOption.insertMany([
      { code: 'NONE', name: 'No Breakfast', pricePerPersonPerDay: 0, description: 'Room only accommodation.' },
      { code: 'CONTINENTAL', name: 'Continental Breakfast', pricePerPersonPerDay: 400, description: 'Pastries, fresh fruits, artisan coffee, and juices.' },
      { code: 'BUFFET', name: 'Buffet Breakfast', pricePerPersonPerDay: 650, description: 'Hot and cold buffet counter with live egg station.' },
      { code: 'PREMIUM', name: 'Premium Breakfast', pricePerPersonPerDay: 900, description: 'In-room served gourmet dining with sparkling beverage.' }
    ]);
    console.log(`[Seed] Seeded ${breakfast.length} Breakfast Plans`);

    // 5. Seed Packages (Section 10)
    await Package.deleteMany({});
    await PackageItem.deleteMany({});
    
    const pkgBusiness = await Package.create({
      name: 'Business Package',
      price: 2500,
      description: 'Includes Breakfast, Wi-Fi, 2 laundry items, Airport transfer',
      isActive: true
    });
    await PackageItem.insertMany([
      { packageId: pkgBusiness._id, benefitName: 'Breakfast', quantityIncluded: 1 },
      { packageId: pkgBusiness._id, benefitName: 'High-speed Wi-Fi', quantityIncluded: 1 },
      { packageId: pkgBusiness._id, benefitName: '2 laundry items', quantityIncluded: 2 },
      { packageId: pkgBusiness._id, benefitName: 'Airport transfer', quantityIncluded: 1 }
    ]);

    const pkgFamily = await Package.create({
      name: 'Family Package',
      price: 4000,
      description: 'Includes Breakfast, Kids meal, Swimming pool, Late checkout',
      isActive: true
    });
    await PackageItem.insertMany([
      { packageId: pkgFamily._id, benefitName: 'Breakfast', quantityIncluded: 1 },
      { packageId: pkgFamily._id, benefitName: 'Kids meal', quantityIncluded: 1 },
      { packageId: pkgFamily._id, benefitName: 'Swimming pool', quantityIncluded: 1 },
      { packageId: pkgFamily._id, benefitName: 'Late checkout', quantityIncluded: 1 }
    ]);

    const pkgPremium = await Package.create({
      name: 'Premium Package',
      price: 7000,
      description: 'Includes Premium breakfast, Spa session, Airport transfer, Mini-bar credit',
      isActive: true
    });
    await PackageItem.insertMany([
      { packageId: pkgPremium._id, benefitName: 'Premium breakfast', quantityIncluded: 1 },
      { packageId: pkgPremium._id, benefitName: 'Spa session', quantityIncluded: 1 },
      { packageId: pkgPremium._id, benefitName: 'Airport transfer', quantityIncluded: 1 },
      { packageId: pkgPremium._id, benefitName: 'Mini-bar credit', quantityIncluded: 1 }
    ]);
    console.log('[Seed] Seeded 3 Hotel Packages with PackageItems relationships');

    // 6. Seed Vouchers (Section 12)
    await Voucher.deleteMany({});
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 86400000);
    const pastDate = new Date('2025-01-01');

    await Voucher.insertMany([
      {
        code: 'STAY10',
        description: '10% discount on total stay',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minBillAmount: 10000,
        maxDiscount: 4000,
        validFrom: new Date('2026-01-01'),
        validUntil: oneYearLater,
        usageLimit: 100,
        timesUsed: 12,
        perUserLimit: 1,
        isActive: true
      },
      {
        code: 'WELCOME500',
        description: '₹500 flat discount for first-time guests',
        discountType: 'FIXED',
        discountValue: 500,
        minBillAmount: 5000,
        validFrom: new Date('2026-01-01'),
        validUntil: oneYearLater,
        usageLimit: 100,
        timesUsed: 4,
        perUserLimit: 1,
        isActive: true
      },
      {
        code: 'EXECUTIVE20',
        description: '20% discount on Executive and Suite bookings',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minBillAmount: 15000,
        maxDiscount: 5000,
        validFrom: new Date('2026-01-01'),
        validUntil: oneYearLater,
        usageLimit: 50,
        timesUsed: 2,
        perUserLimit: 1,
        applicableRoomTypes: ['Executive', 'Suite'],
        isActive: true
      },
      {
        code: 'EXPIRED50',
        description: 'Expired test voucher (Demonstrates Rule 3 rejection)',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minBillAmount: 1000,
        validFrom: new Date('2024-01-01'),
        validUntil: pastDate,
        usageLimit: 10,
        timesUsed: 0,
        perUserLimit: 1,
        isActive: true
      },
      {
        code: 'LIMITOVER',
        description: 'Exhausted voucher (Demonstrates Rule 4 rejection)',
        discountType: 'FIXED',
        discountValue: 1000,
        minBillAmount: 5000,
        validFrom: new Date('2026-01-01'),
        validUntil: oneYearLater,
        usageLimit: 100,
        timesUsed: 100, // Exhausted
        perUserLimit: 1,
        isActive: true
      }
    ]);
    console.log('[Seed] Seeded Promotional Vouchers (including active and negative test cases)');

    console.log('[Seed] Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
