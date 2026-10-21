/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: MongoDB Aggregation Pipelines & Analytics Controller
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Multi-Stage MongoDB Aggregations: $match, $group, $facet, $sort)
   ========================================================================== */

const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { BookingService } = require('../models/Service');
const { VoucherUsage } = require('../models/Voucher');

const ReportController = {
  // EXECUTIVE ANALYTICS DASHBOARD (Section 28 & 31)
  async getDashboardAnalytics(req, res) {
    try {
      // 1. Room Status Aggregation Pipeline
      const roomStatusAggregation = await Room.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const roomCounts = {
        total: 0,
        AVAILABLE: 0,
        OCCUPIED: 0,
        RESERVED: 0,
        CLEANING: 0,
        MAINTENANCE: 0
      };

      roomStatusAggregation.forEach(item => {
        roomCounts[item._id] = item.count;
        roomCounts.total += item.count;
      });

      // 2. Revenue Aggregation Pipeline (Today vs Month)
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const revenueAggregation = await Invoice.aggregate([
        {
          $facet: {
            todayRevenue: [
              { $match: { status: 'PAID', paidAt: { $gte: startOfToday } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$grandTotal' },
                  roomRev: { $sum: '$roomCharges.total' },
                  bfRev: { $sum: '$breakfastCharges.total' },
                  pkgRev: { $sum: '$packageCharges.price' },
                  discounts: { $sum: '$voucher.discount' }
                }
              }
            ],
            monthRevenue: [
              { $match: { status: 'PAID', paidAt: { $gte: startOfMonth } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$grandTotal' },
                  roomRev: { $sum: '$roomCharges.total' },
                  bfRev: { $sum: '$breakfastCharges.total' },
                  pkgRev: { $sum: '$packageCharges.price' },
                  discounts: { $sum: '$voucher.discount' }
                }
              }
            ],
            allTimeStreams: [
              { $match: { status: 'PAID' } },
              {
                $group: {
                  _id: null,
                  roomRevenue: { $sum: '$roomCharges.total' },
                  breakfastRevenue: { $sum: '$breakfastCharges.total' },
                  packageRevenue: { $sum: '$packageCharges.price' },
                  serviceRevenue: { $sum: { $sum: '$serviceCharges.total' } },
                  totalDiscount: { $sum: '$voucher.discount' },
                  totalTax: { $sum: '$taxAmount' },
                  grandTotal: { $sum: '$grandTotal' }
                }
              }
            ]
          }
        }
      ]);

      // 3. Most Popular Services Aggregation Pipeline
      const popularServicesAggregation = await BookingService.aggregate([
        {
          $group: {
            _id: '$serviceName',
            totalOrders: { $sum: '$quantity' },
            totalRevenue: { $sum: '$total' }
          }
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 5 }
      ]);

      // 4. Most Popular Vouchers Aggregation Pipeline
      const popularVouchersAggregation = await VoucherUsage.aggregate([
        {
          $group: {
            _id: '$voucherCode',
            timesUsed: { $sum: 1 },
            totalSavings: { $sum: '$discountApplied' }
          }
        },
        { $sort: { timesUsed: -1 } },
        { $limit: 5 }
      ]);

      // 5. Booking Activity Metrics
      const activeBookingsCount = await Booking.countDocuments({
        bookingStatus: { $in: ['RESERVED', 'CHECKED_IN', 'OCCUPIED', 'CHECKOUT_PENDING'] }
      });
      const completedBookingsCount = await Booking.countDocuments({
        bookingStatus: 'CHECKED_OUT'
      });

      const todayRevData = revenueAggregation[0]?.todayRevenue[0] || { total: 0, discounts: 0 };
      const monthRevData = revenueAggregation[0]?.monthRevenue[0] || { total: 0, discounts: 0 };
      const streams = revenueAggregation[0]?.allTimeStreams[0] || {
        roomRevenue: 0,
        breakfastRevenue: 0,
        packageRevenue: 0,
        serviceRevenue: 0,
        grandTotal: 0
      };

      // Occupancy calculation
      const activeRooms = roomCounts.OCCUPIED + roomCounts.RESERVED;
      const totalInventory = Math.max(1, roomCounts.total);
      const occupancyPercentage = Math.round((activeRooms / totalInventory) * 100);

      res.json({
        success: true,
        data: {
          rooms: roomCounts,
          occupancy: {
            activeOccupiedRooms: activeRooms,
            totalInventory,
            percentage: occupancyPercentage
          },
          revenue: {
            today: todayRevData.total,
            thisMonth: monthRevData.total,
            streams
          },
          popularServices: popularServicesAggregation,
          popularVouchers: popularVouchersAggregation,
          bookings: {
            active: activeBookingsCount,
            completed: completedBookingsCount
          }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = ReportController;
