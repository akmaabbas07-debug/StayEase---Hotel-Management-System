# StayEase — Hotel Management, Check-In, Services & Dynamic Billing System
### Complete Full-Stack Hotel Web Application (Units 1–5 Academic Mini-Project)

---

## 1. Project Overview

**StayEase** is a production-grade, interconnected hotel management platform handling the complete, end-to-end guest lifecycle:

$$\text{Guest Registration} \longrightarrow \text{Room Search} \longrightarrow \text{Availability Check} \longrightarrow \text{Booking} \longrightarrow \text{Check-In} \longrightarrow \text{Package Selection} \longrightarrow \text{Room Upgrade} \longrightarrow \text{Breakfast Plan} \longrightarrow \text{Additional Services} \longrightarrow \text{Voucher Application} \longrightarrow \text{Dynamic Billing} \longrightarrow \text{Payment} \longrightarrow \text{Receipt Generation} \longrightarrow \text{Check-Out} \longrightarrow \text{Room Cleaning} \longrightarrow \text{Room Available}$$

Every module connects dynamically to the rest of the application. No isolated demo pages exist:
- Selecting an available room reserves inventory and locks conflicting dates.
- Room upgrades immediately release original rooms to `AVAILABLE` and update billing line items.
- Adding services records locked purchase prices in `bookingServices` to protect historical invoices.
- Voucher discounts are recalculated strictly on the server against a 7-step validation pipeline.
- Checking out moves rooms to `CLEANING` for a configured 2-hour window before automatically restoring them to `AVAILABLE`.

---

## 2. Team Members & Domain Allocation

| Member Name | Roll Number | Primary Domain | Core Responsibilities & Assigned Modules |
|---|---|---|---|
| **Akmal Abbas** | `25070122028` | **Backend, Booking & System Integration** | Node.js Express backend, HTTP routing, guest registration, booking lifecycle, date-overlap availability algorithm, check-in, check-out, room upgrades, Node.js `EventEmitter`, overall system integration. |
| **Adarsh Bimal** | `25070122016` | **Frontend & UI/UX** | 10 Semantic HTML5 pages, CSS3 responsive grid & flexbox design system, client-side DOM manipulation, real-time estimate previews, interactive billing table, status badges. |
| **Ahasas Singh** | `25070122026` | **Database & Billing/Voucher System** | MongoDB database (`hotelDB`), Mongoose models (1:1, 1:N, N:M), seed script, compound indexes, multi-stage aggregation pipelines, dynamic billing engine, 7-step voucher validation engine. |
| **Akul Agarwal** | `25070122030` | **DevOps, Security & Supporting Services** | Git repository management, Jenkins declarative pipeline (`Jenkinsfile`), Apache Tomcat demo servlet (`StayEaseServlet`), regex validation & sanitization, multer file upload security, File System logging (`hotel.log`), receipt generation, Nodemailer email alerts. |

---

## 3. Syllabus Mapping (Units 1–5)

### Unit 1: HTML5
- **Semantic Architecture:** Structured with `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- **Accessible Forms & Input Validation:** 10 dedicated pages with native attributes: `required`, `pattern`, `type="date"`, `type="email"`, `type="tel"`, `min`, `max`, `step`.

### Unit 2: CSS
- **Design System:** Custom CSS variables for luxury hotel aesthetic without external frameworks.
- **Flexbox & CSS Grid:** Flexible navigation, multi-column dashboard, 4-tier room grid (`grid-template-columns`), itemized billing breakdown.
- **Responsive Media Queries:** Breakpoints for Desktop ($>1024\text{px}$), Tablet ($768\text{px}$–$1024\text{px}$), and Mobile ($<480\text{px}$).

### Unit 3: Advanced JavaScript & Node.js
- **Client DOM:** Real-time billing recalculation without reload, dynamic room cards, modal triggers.
- **Server Architecture:** Express HTTP server, Node.js `url` query string parsing (`/rooms?type=Deluxe&status=AVAILABLE`).
- **File System (`fs`):** Append-only audit logger (`/backend/logs/hotel.log`) and formatted payment receipts (`/backend/receipts/REC-*.txt`).
- **Events (`EventEmitter`):** Custom event bus for `guestCheckedIn`, `roomUpgraded`, `serviceAdded`, `paymentCompleted`, `guestCheckedOut`.
- **Security & Uploads:** Server-side regex validation, input sanitization, safe multipart document upload via `multer` (5MB limit, MIME guard).
- **Email:** Transactional email notifications via `nodemailer`.

### Unit 4: MongoDB
- **Database:** `hotelDB` running on port 27017.
- **Relationships:**
  - `1:1`: Booking $\leftrightarrow$ Invoice, Booking $\leftrightarrow$ Payment.
  - `1:N`: Guest $\rightarrow$ Bookings, RoomType $\rightarrow$ Rooms.
  - `N:M`: Bookings $\leftrightarrow$ Services (via `bookingServices` with locked purchase price), Packages $\leftrightarrow$ Services (via `packageItems`), Guests $\leftrightarrow$ Vouchers (via `voucherUsages`).
- **Indexes:** Compound index on `{ roomId: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 }`, single indexes on `roomNumber`, `voucherCode`, `guestId`.
- **Aggregations:** Multi-stage pipelines using `$match`, `$group`, `$facet`, `$sort`, and `$project` for executive KPI dashboards.

### Unit 5: DevOps
- **Git Version Control:** Clean semantic commit history reflecting incremental module development.
- **Jenkins CI Pipeline:** Declarative `Jenkinsfile` automating Checkout $\rightarrow$ Install $\rightarrow$ Lint $\rightarrow$ Unit Tests $\rightarrow$ Integration Tests $\rightarrow$ Build Report.
- **Apache Tomcat:** Standalone Java Servlet component (`StayEaseServlet.java` with `web.xml` and `pom.xml`) demonstrating Tomcat execution.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017`
- Git

### 1. Clone & Install Dependencies
```bash
cd stayease
npm install
```

### 2. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env
```
Default `.env` contents:
```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/hotelDB
TAX_RATE_GST=0.18
CLEANING_DURATION_HOURS=2
MAX_FILE_SIZE_BYTES=5242880
ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png
```

### 3. Seed Database with Master Catalog
Run the database seeder to populate room categories, inventory, services, breakfast plans, packages, and vouchers:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Execute the full unit and integration test suite:
```bash
npm test
```

### 5. Launch Application Server
Start the Express server:
```bash
npm start
```
Open your browser and navigate to:
- **Guest Portal:** `http://localhost:3000`
- **Room Catalog:** `http://localhost:3000/rooms.html`
- **Reservation Desk:** `http://localhost:3000/booking.html`
- **Reception Check-In:** `http://localhost:3000/checkin.html`
- **Services Catalog:** `http://localhost:3000/services.html`
- **Packages & Meals:** `http://localhost:3000/packages.html`
- **Voucher Terminal:** `http://localhost:3000/vouchers.html`
- **Billing Folio:** `http://localhost:3000/billing.html`
- **Payment & Checkout:** `http://localhost:3000/payment.html`
- **Admin Analytics:** `http://localhost:3000/admin.html`

---

## 5. Live Demonstration Workflow (Akmal Abbas Customer Story)

Follow this exact sequence to demonstrate the entire connected system to examiners:

1. **Register Guest "Akmal Abbas":**
   - Navigate to `booking.html`.
   - Enter Full Name: `Akmal Abbas`, Phone: `9876543210`, Email: `akmal@example.com`, ID: `Aadhar (1234-5678-9012)`.
   - Upload sample identity proof (PDF/PNG).
2. **Search Rooms:**
   - Choose stay dates: `2026-10-21` to `2026-10-24` (3 nights) for 2 guests.
   - Choose Room 205 (Executive Club @ ₹6,000/night).
3. **Select Breakfast & Package:**
   - Breakfast: Buffet Breakfast (₹650/person/day).
   - Package: Business Package (₹2,500).
   - Observe live estimate calculation in sidebar updating dynamically via DOM events.
   - Submit booking $\to$ Generates `SE-2026-00101`.
4. **Reception Check-In:**
   - Navigate to `checkin.html`, look up `SE-2026-00101`.
   - Click **Confirm Guest Check-In** $\to$ Booking transitions to `CHECKED_IN`, Room 205 becomes `OCCUPIED`.
5. **Add Services:**
   - Navigate to `services.html`.
   - Add Room Service $\times$ 3 (@ ₹300 = ₹900).
   - Add Laundry $\times$ 4 (@ ₹150 = ₹600).
   - Add Spa $\times$ 1 (@ ₹2,000 = ₹2,000). Total services: ₹3,500.
6. **Room Upgrade (Mid-Stay):**
   - Navigate to `billing.html`.
   - Click **Upgrade Room** $\to$ Upgrade from Executive (Room 205) to Presidential Suite (Room 401 @ ₹10,000/night).
   - Notice Room 205 immediately frees up to `AVAILABLE`, and invoice recalculates with new room charges.
7. **Apply Promotional Voucher:**
   - Apply `WELCOME500` $\to$ Flat ₹500 discount applied.
   - Remove `WELCOME500` $\to$ Total immediately increases.
   - Apply `STAY10` $\to$ 10% discount (-₹3,990) applied.
   - Bill breakdown reflects:
     - Room: 3 nights $\times$ ₹10,000 = ₹30,000
     - Breakfast: 2 guests $\times$ 3 days $\times$ ₹650 = ₹3,900
     - Package: Business Package = ₹2,500
     - Additional Services: ₹3,500
     - Subtotal = ₹39,900
     - Discount (`STAY10`) = -₹3,990
     - Tax (18% GST) = ₹6,463.80
     - Grand Total = ₹42,373.80
8. **Simulate UPI Payment:**
   - Navigate to `payment.html`.
   - Select UPI, enter VPA `akmal@okhdfcbank`, click **Confirm & Process**.
   - Status updates to `PAID`. `paymentCompleted` event emitted.
9. **Demonstrate Post-Payment Security Lock:**
   - Show that adding new services is now **BLOCKED (Rule 9)**.
   - Show that room upgrade is now **BLOCKED (Rule 10)**.
   - Show that vouchers are **LOCKED (Rule 11)**.
10. **Guest Check-Out & Auto-Sanitization:**
    - Click **Execute Guest Check-Out**.
    - Booking status changes to `CHECKED_OUT`.
    - Room status changes to `CLEANING` with a stored timestamp: `cleaningAvailableAfter = now + 2 hours`.
    - Click **Fast-Forward 2 Hours** to demonstrate automatic transition back to `AVAILABLE`.
11. **Download Receipt File:**
    - Click **Download Receipt (fs)** $\to$ downloads formatted text receipt generated via Node.js `fs`.
12. **Showcase MongoDB Aggregations:**
    - Navigate to `admin.html`.
    - Click **Refresh Aggregations** to show live MongoDB `$facet`, `$group`, and `$sort` metrics.
    - Show live log streamer displaying `/backend/logs/hotel.log`.
13. **DevOps Showcase:**
    - Show Git commit log (`git log --oneline`).
    - Show `Jenkinsfile` declarative pipeline.
    - Show `tomcat-demo/src/StayEaseServlet.java` for Apache Tomcat.

---

## 6. Directory Structure

```
stayease/
├── .env.example
├── .gitignore
├── Jenkinsfile
├── README.md
├── TEAM_ALLOCATION.md
├── package.json
│
├── public/                       # UNIT 1 & 2: Frontend Client (Adarsh Bimal)
│   ├── index.html                # Home Landing Portal
│   ├── rooms.html                # Room Search & Overlap Filter
│   ├── booking.html              # Guest Registration & Booking Form
│   ├── checkin.html              # Receptionist Check-in Terminal
│   ├── services.html             # Additional Services Catalogue
│   ├── packages.html             # Packages & Breakfast Plans
│   ├── vouchers.html             # Promotional Coupon Validator
│   ├── billing.html              # Dynamic Invoice Breakdown & Room Upgrade
│   ├── payment.html              # Payment Gateway Simulation & Checkout
│   ├── admin.html                # Aggregation Analytics & Master CRUD
│   ├── css/
│   │   ├── style.css             # Unified Hotel Design System
│   │   └── responsive.css        # Media Queries for Mobile/Tablet/Desktop
│   └── js/
│       ├── api.js                # REST Client (Shared: Adarsh & Akmal)
│       ├── validation.js         # Client-side Regex Validator (Akul & Adarsh)
│       ├── dom.js                # DOM Helpers & Modal Library (Adarsh)
│       └── app.js                # Client State Orchestrator (Adarsh & Akmal)
│
├── backend/                      # UNIT 3 & 4: Backend & Database
│   ├── server.js                 # Express Application Bootstrap (Akmal)
│   ├── config/
│   │   ├── database.js           # Mongoose Connection Pool (Ahasas)
│   │   ├── constants.js          # Business Constants (Akmal & Ahasas)
│   │   └── seed.js               # Database Catalog Seeder (Ahasas)
│   ├── models/                   # Mongoose Schemas (Ahasas Singh)
│   │   ├── Guest.js
│   │   ├── Room.js
│   │   ├── RoomType.js
│   │   ├── Booking.js
│   │   ├── Service.js
│   │   ├── BookingService.js     # N:M with purchase price lock
│   │   ├── Package.js
│   │   ├── PackageItem.js        # N:M with included benefits
│   │   ├── BreakfastOption.js
│   │   ├── Voucher.js
│   │   ├── VoucherUsage.js       # Per-user redemption limit tracking
│   │   ├── Invoice.js            # 1:1 with final booking
│   │   ├── Payment.js
│   │   ├── Document.js           # Multer file upload metadata (Akul)
│   │   └── AuditLog.js           # Upgrade and lifecycle audit log (Akul)
│   ├── routes/                   # REST Routes (Akmal & Ahasas)
│   ├── controllers/              # Business Controllers (Akmal & Ahasas)
│   ├── services/                 # Core Single-Source-of-Truth Services
│   │   ├── availabilityService.js # Date overlap algorithm (Akmal)
│   │   ├── billingService.js     # Dynamic bill breakdown (Ahasas)
│   │   ├── voucherService.js     # 7-step voucher pipeline (Ahasas)
│   │   └── emailService.js       # Nodemailer alerts (Akul)
│   ├── events/
│   │   └── hotelEvents.js        # Node.js EventEmitter (Akmal)
│   ├── utils/
│   │   ├── logger.js             # File System logger /logs/hotel.log (Akul)
│   │   ├── receiptGenerator.js   # File System receipt generator (Akul)
│   │   └── validator.js          # Server regex & sanitization (Akul)
│   ├── logs/                     # Application logs (Unit 3 File System)
│   ├── receipts/                 # Itemized text receipts (Unit 3 File System)
│   └── uploads/                  # Safe uploaded guest documents (Unit 3 Multer)
│
├── tomcat-demo/                  # UNIT 5: Apache Tomcat Component (Akul Agarwal)
│   ├── pom.xml                   # Maven WAR build descriptor
│   ├── WEB-INF/web.xml           # Servlet 3.1 deployment descriptor
│   └── src/StayEaseServlet.java  # Java Servlet demonstrating Tomcat
│
└── tests/                        # Automated CI Test Suite
    ├── unit/
    │   ├── availability.test.js
    │   ├── billing.test.js
    │   └── voucher.test.js
    └── integration/
        └── customerJourney.test.js # Complete 34-step customer story test
```

---

## 7. License & Academic Attribution
Developed for University Mini-Project Examination by Team StayEase:
- **Akmal Abbas** (`25070122028`)
- **Adarsh Bimal** (`25070122016`)
- **Ahasas Singh** (`25070122026`)
- **Akul Agarwal** (`25070122030`)
