/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Package & PackageItem Mongoose Models (N:M Junction)
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Many-to-Many Modeling: Packages <-> Benefits)
   ========================================================================== */

const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const Package = mongoose.model('Package', packageSchema);

// Junction table: Package <-> PackageItems (Section 10 & 26)
const packageItemSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true,
    index: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  benefitName: {
    type: String,
    required: true
  },
  quantityIncluded: {
    type: Number,
    default: 1
  }
});

const PackageItem = mongoose.model('PackageItem', packageItemSchema);

module.exports = {
  Package,
  PackageItem
};
