# StayEase Hotel Management System — Team Allocation & Code Ownership Matrix

This document defines the clear division of responsibilities, assigned modules, file ownership, and shared code boundaries for the StayEase University Mini-Project (Units 1–5).

---

## 1. Team Directory & Domain Allocation

| Member Name | Roll Number | Primary Domain | Core Syllabus Focus |
|---|---|---|---|
| **Akmal Abbas** | `25070122028` | **Backend, Booking & System Integration** | Unit 3 (Node.js, HTTP, URL, Events) & Core Hotel Lifecycle |
| **Adarsh Bimal** | `25070122016` | **Frontend & UI/UX** | Unit 1 (HTML5 Semantic) & Unit 2 (CSS3 Flexbox, Grid, Responsive) |
| **Ahasas Singh** | `25070122026` | **Database & Billing/Voucher System** | Unit 4 (MongoDB CRUD, Relations, Aggregations, Indexes) & Commercial Logic |
| **Akul Agarwal** | `25070122030` | **DevOps, Security & Supporting Services** | Unit 5 (Git, Jenkins, Tomcat) & Unit 3 (Security, File System, Uploads, Nodemailer) |

---

## 2. File-by-File Code Ownership Matrix

### 👤 Member 1: Akmal Abbas (Roll No. 25070122028)
**Role:** Backend Architect & Lead System Integrator
**Responsibilities:** Node.js Express server, HTTP routes, guest registration lifecycle, room search & date overlap availability algorithm, booking creation, check-in, check-out, room upgrades, EventEmitter event orchestration, and system integration.

* **Dedicated Owned Files:**
  - `backend/server.js` (Express bootstrap, middleware assembly, server startup)
  - `backend/routes/guestRoutes.js`
  - `backend/routes/roomRoutes.js`
  - `backend/routes/bookingRoutes.js`
  - `backend/controllers/guestController.js`
  - `backend/controllers/roomController.js`
  - `backend/controllers/bookingController.js`
  - `backend/services/availabilityService.js` (Overlap logic: `reqIn < bookOut && reqOut > bookIn` & cleaning expiry)
  - `backend/events/hotelEvents.js` (Node.js EventEmitter publishing and subscription bus)
  - `tests/unit/availability.test.js`
  - `tests/integration/customerJourney.test.js`

---

### 🎨 Member 2: Adarsh Bimal (Roll No. 25070122016)
**Role:** Frontend & UI/UX Lead
**Responsibilities:** 10 Semantic HTML5 pages, CSS3 responsive grid & flexbox design system, interactive DOM manipulation, client-side input validation, dynamic invoice breakdown UI, and status badges.

* **Dedicated Owned Files:**
  - `public/index.html` (Landing portal & quick navigation)
  - `public/rooms.html` (Room directory & date search form)
  - `public/booking.html` (Guest registration & booking interface)
  - `public/checkin.html` (Receptionist check-in terminal)
  - `public/services.html` (Service catalog & live order sheet)
  - `public/packages.html` (Packages & breakfast selection)
  - `public/vouchers.html` (Voucher promo code interface)
  - `public/billing.html` (Interactive invoice preview & room upgrade trigger)
  - `public/payment.html` (Simulated payment checkout)
  - `public/admin.html` (Admin analytics dashboard UI)
  - `public/css/style.css` (Luxury hotel aesthetic, variables, Flexbox/Grid)
  - `public/css/responsive.css` (Media queries for mobile, tablet, and desktop)
  - `public/js/dom.js` (DOM manipulation helpers, badge renderers, toasts)
  - `public/js/app.js` (Frontend orchestration and UI event bindings)

---

### 🗄️ Member 3: Ahasas Singh (Roll No. 25070122026)
**Role:** Database Architect & Commercial Logic Lead
**Responsibilities:** MongoDB database configuration, schema definitions (1:1, 1:N, N:M), indexes, aggregation pipelines, dynamic billing calculation engine, tax computation, and 7-step voucher validation pipeline.

* **Dedicated Owned Files:**
  - `backend/config/database.js` (Mongoose connection & pool config)
  - `backend/config/seed.js` (Initial catalog seeding: rooms, services, packages, vouchers)
  - `backend/models/Guest.js`
  - `backend/models/Room.js`
  - `backend/models/RoomType.js`
  - `backend/models/Booking.js`
  - `backend/models/Service.js`
  - `backend/models/BookingService.js` (N:M junction with purchase price lock)
  - `backend/models/Package.js`
  - `backend/models/PackageItem.js` (N:M junction with included benefits)
  - `backend/models/BreakfastOption.js`
  - `backend/models/Voucher.js`
  - `backend/models/VoucherUsage.js` (Per-user redemption tracking)
  - `backend/models/Invoice.js` (1:1 with final booking)
  - `backend/models/Payment.js`
  - `backend/models/AuditLog.js`
  - `backend/routes/voucherRoutes.js`
  - `backend/routes/billingRoutes.js`
  - `backend/routes/reportRoutes.js`
  - `backend/controllers/voucherController.js`
  - `backend/controllers/billingController.js`
  - `backend/controllers/reportController.js` (MongoDB Aggregation queries)
  - `backend/services/billingService.js` (Dynamic invoice calculation)
  - `backend/services/voucherService.js` (7-step validation pipeline)
  - `tests/unit/billing.test.js`
  - `tests/unit/voucher.test.js`

---

### 🛡️ Member 4: Akul Agarwal (Roll No. 25070122030)
**Role:** DevOps, Security & Supporting Infrastructure Lead
**Responsibilities:** Git repository structure, Jenkins CI pipeline (`Jenkinsfile`), Apache Tomcat demonstration servlet, server-side regex validation, input sanitization, multipart document upload security, File System logging (`fs`), receipt text generation, and Nodemailer transactional emails.

* **Dedicated Owned Files:**
  - `Jenkinsfile` (Declarative CI pipeline: Checkout $\to$ Install $\to$ Lint $\to$ Test $\to$ Build)
  - `tomcat-demo/pom.xml` & `tomcat-demo/WEB-INF/web.xml`
  - `tomcat-demo/src/StayEaseServlet.java` (Java Servlet demonstrating Unit 5 Tomcat)
  - `backend/utils/validator.js` (Server-side input sanitization & Regex guards)
  - `backend/utils/logger.js` (Node.js File System append-only logger `/logs/hotel.log`)
  - `backend/utils/receiptGenerator.js` (Node.js File System text receipt generator)
  - `backend/services/emailService.js` (Nodemailer email dispatcher)
  - `backend/routes/uploadRoutes.js` (Multipart upload with multer, MIME check, size guard)
  - `backend/models/Document.js` (Uploaded file metadata model)
  - `.gitignore` & `.env.example`
  - `README.md` (Setup instructions, course syllabus mapping)

---

## 3. Shared & Cross-Cutting Code

The following modules represent interface boundaries shared across members:

| File / Module | Co-Owners | Shared Purpose |
|---|---|---|
| `public/js/api.js` | Adarsh Bimal & Akmal Abbas | Centralized REST client connecting UI actions to Backend API endpoints. |
| `backend/config/constants.js` | Akmal Abbas & Ahasas Singh | Shared business constants (tax rates, cleaning durations, upload limits). |
| `package.json` | All Members | Root project metadata, build scripts, and shared dependencies. |
| `tests/integration/customerJourney.test.js` | All Members | Complete end-to-end integration test validating the unified Akmal Abbas customer story. |

---

## 4. Header Standardization Rule

Every source file must include a file header identifying ownership:

```javascript
/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: [Module Name, e.g., Room Availability Engine]
   Primary Owner: [Member Name] ([Roll Number]) - [Domain Role]
   Co-owners / Shared: [Names or None]
   Course Unit Mapping: [Unit 1/2/3/4/5]
   ========================================================================== */
```
