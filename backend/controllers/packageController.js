/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Package & Breakfast Controller
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB CRUD & Relational Populates)
   ========================================================================== */

const { Package, PackageItem } = require('../models/Package');
const BreakfastOption = require('../models/BreakfastOption');

const PackageController = {
  // READ all packages with their included packageItems (Section 10 & 26)
  async getPackages(req, res) {
    try {
      const packages = await Package.find({ isActive: true });
      const results = [];

      for (const pkg of packages) {
        const items = await PackageItem.find({ packageId: pkg._id });
        results.push({
          ...pkg.toObject(),
          includedBenefits: items
        });
      }

      res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // READ all breakfast options (Section 9)
  async getBreakfastOptions(req, res) {
    try {
      const options = await BreakfastOption.find();
      res.json({ success: true, data: options });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE Package
  async createPackage(req, res) {
    try {
      const { name, price, description, items } = req.body;
      const pkg = await Package.create({ name, price, description });

      if (items && Array.isArray(items)) {
        const packageItems = items.map(item => ({
          packageId: pkg._id,
          benefitName: item.benefitName || item,
          quantityIncluded: item.quantityIncluded || 1
        }));
        await PackageItem.insertMany(packageItems);
      }

      res.status(201).json({ success: true, data: pkg });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = PackageController;
