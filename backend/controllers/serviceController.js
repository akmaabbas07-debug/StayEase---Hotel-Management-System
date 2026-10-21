/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Service Catalogue Controller & CRUD
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB CRUD), Unit 3 (URL Query Handling)
   ========================================================================== */

const { Service } = require('../models/Service');

const ServiceController = {
  // READ services with URL category query parameter: /services?category=FOOD
  async getServices(req, res) {
    try {
      const { category } = req.query;
      const query = { isAvailable: true };
      if (category) query.category = category;

      const services = await Service.find(query).sort({ category: 1, name: 1 });
      res.json({ success: true, count: services.length, data: services });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getServiceById(req, res) {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE Service (Admin CRUD)
  async createService(req, res) {
    try {
      const { name, category, unitPrice, description } = req.body;
      const service = await Service.create({
        name,
        category,
        unitPrice,
        description
      });
      res.status(201).json({ success: true, data: service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE Service
  async updateService(req, res) {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE Service
  async deleteService(req, res) {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, { isAvailable: false }, { new: true });
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, message: `Service ${service.name} deactivated.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = ServiceController;
