# StayEase: Integrated Hotel Operations, Dynamic Billing & Guest Management
## Comprehensive Mini-Project Technical Report (Units 1–5)

**Course:** Web Technologies & DevOps Mini-Project  
**Institution:** University Faculty of Engineering & Technology  
**Academic Year:** 2026–2027  

**Project Team Members:**
- **Akmal Abbas** (Roll No: `25070122028`) — *Lead Backend Architect & System Integrator*
- **Adarsh Bimal** (Roll No: `25070122016`) — *Lead Frontend & UI/UX Engineer*
- **Ahasas Singh** (Roll No: `25070122026`) — *Lead Database Architect & Commercial Logic Lead*
- **Akul Agarwal** (Roll No: `25070122030`) — *Lead DevOps Engineer, Security & Supporting Infrastructure*

---

### Abstract
Modern hospitality platforms suffer from siloed systems where room booking, dining, auxiliary services, promotional discounts, and room sanitation operate on disconnected databases. **StayEase** is a full-stack, event-driven web application designed to demonstrate the complete, interconnected guest lifecycle:
$$\text{Registration} \to \text{Search} \to \text{Booking} \to \text{Check-In} \to \text{Packages} \to \text{Services} \to \text{Upgrades} \to \text{Vouchers} \to \text{Dynamic Billing} \to \text{Payment} \to \text{Receipt} \to \text{Checkout} \to \text{Sanitization} \to \text{Availability}$$

The system rigorously implements and demonstrates all five syllabus units:
1. **Unit 1:** Semantic HTML5 structure, accessible forms, native validations, and multipart document uploads.
2. **Unit 2:** Responsive CSS3 typography, CSS Grid, Flexbox, and media queries without reliance on third-party frameworks.
3. **Unit 3:** Advanced client-side JavaScript, DOM event engines, Node.js HTTP/Express routing, native `url` query handling, `fs` file-based logging and receipt generation, `EventEmitter` event architecture, `multer` upload guards, and `nodemailer` automated confirmations.
4. **Unit 4:** MongoDB database modeling (`hotelDB`) featuring 1:1, 1:N, and N:M junction relationships, compound indexes for date overlap detection, historical price locks, and multi-stage aggregation pipelines for real-time executive KPI reporting.
5. **Unit 5:** Enterprise DevOps with Git version control, declarative Jenkins CI automation (`Jenkinsfile`), and an Apache Tomcat Java Servlet demonstration (`StayEaseServlet.java`).

---

### 1. System Architecture & Component Interconnectivity

StayEase enforces the **Core Design Principle**: *every module connects directly to the backend single source of truth; no isolated demo pages exist.*

- **Frontend Tier (Adarsh Bimal):** 10 HTML5 semantic pages communicating asynchronously via a centralized `API` fetch client. Client-side input validation (`Validator`) provides instant user feedback using regular expressions, while the live estimate sidebar dynamically recalculates stay costs through DOM events.
- **Backend API & Event Tier (Akmal Abbas):** Express HTTP server parsing URL parameters using the native Node.js `url` module. When high-level actions occur (e.g. check-in, payment, upgrade), a custom `EventEmitter` (`hotelEvents`) dispatches side-effects to the logger, receipt generator, and email service asynchronously without blocking HTTP response times.
- **Database & Commercial Tier (Ahasas Singh):** MongoDB `hotelDB` housing 15 collections. All financial computations (room rates, breakfast plans, package additions, services, voucher discounts, and 18% GST) are computed exclusively on the server to prevent client-side tampering.
- **Security & DevOps Infrastructure (Akul Agarwal):** Centralized input sanitization, file-extension guards, append-only disk logging to `/logs/hotel.log`, text receipt generation in `/receipts/`, declarative Jenkins pipeline validation, and an Apache Tomcat demonstration servlet.

---

### 2. Core Business Algorithms & Database Design

#### 2.1. Date-Interval Overlap Algorithm (Section 30)
To eliminate double-booking across date spans, StayEase does not rely on a static `room.status === 'AVAILABLE'` flag. The backend queries MongoDB for active bookings that satisfy the mathematical interval intersection:
$$\text{requestedCheckIn} < \text{existingCheckOut} \quad \text{AND} \quad \text{requestedCheckOut} > \text{existingCheckIn}$$
Conflicting statuses (`RESERVED`, `CHECKED_IN`, `OCCUPIED`, `CHECKOUT_PENDING`, `PAID`) block inventory, while terminal statuses (`CANCELLED`, `CHECKED_OUT`) release inventory. Furthermore, rooms in `CLEANING` status undergo timestamp verification:
$$\text{now} \ge \text{cleaningAvailableAfter} \implies \text{status auto-restored to 'AVAILABLE'}$$

#### 2.2. Seven-Step Server Voucher Validation Pipeline (Section 12 & 13)
Voucher discounts are calculated via a strict 7-stage server validation pipeline:
1. **Existence:** Voucher code exists in `vouchers` collection.
2. **Active Flag:** `isActive === true`.
3. **Temporal Validity:** $\text{validFrom} \le \text{now} \le \text{validUntil}$.
4. **Global Usage Ceiling:** $\text{timesUsed} < \text{usageLimit}$.
5. **Personal User Quota:** $\text{count}(\text{voucherUsages for guestId}) < \text{perUserLimit}$.
6. **Minimum Spend:** $\text{subtotal} \ge \text{minBillAmount}$.
7. **Applicability Constraint:** Matches room type (e.g., Executive/Suite) or package restrictions.

#### 2.3. Historical Price Protection (Rule 16)
When additional services (Room Service, Laundry, Spa) are added to an active booking, the Many-to-Many junction collection `bookingServices` captures and locks `unitPriceAtPurchase`. If the hotel later updates service menu prices in the `services` catalog, existing guest folios and historical invoices remain unaltered.

#### 2.4. Post-Payment & Post-Checkout Immutability (Rules 9, 10, 11, 14, 15)
Upon payment confirmation, the booking and invoice transition to `PAID`. The backend strictly rejects subsequent attempts to add services, modify meal plans, apply vouchers, or request upgrades. Check-out transitions the room to `CLEANING` for a configurable 2-hour sanitation window.

---

### 3. Course Syllabus Mapping & Verification Matrix

| Course Unit | Technical Requirement | StayEase Implementation Verification |
|---|---|---|
| **Unit 1: HTML5** | Semantic tags, native validation, accessible forms, file uploads | 10 accessible HTML5 pages (`booking.html`, `rooms.html`, `billing.html`, etc.) with `required`, `pattern`, `type="date"`, and multipart file input. |
| **Unit 2: CSS** | Flexbox, CSS Grid, mobile-first design, media queries | Responsive 4-card room catalog, live billing table, and analytics KPI grid styled with pure CSS3 variables and breakpoints. |
| **Unit 3: Advanced JS & Node.js** | DOM manipulation, RegExp, Express, File System (`fs`), Events, Multer, Nodemailer | Real-time bill recalculation without reload, `/logs/hotel.log` disk logger, `hotelEvents` EventEmitter, receipt generation, Multer 5MB upload guard, Nodemailer dispatch. |
| **Unit 4: MongoDB** | 1:1, 1:N, N:M schemas, CRUD, Aggregations, Indexes | 15 Mongoose schemas (`hotelDB`), compound index on `{ roomId, checkInDate, checkOutDate, bookingStatus }`, and `$facet` aggregation pipelines. |
| **Unit 5: DevOps** | Git, Jenkins CI, Apache Tomcat | Semantic Git commit history, declarative `Jenkinsfile` running automated unit & E2E tests, and `StayEaseServlet.java` deployed to Tomcat. |

---

### 4. Verification & Testing Summary

StayEase includes an automated test suite executed via Node.js native test runner:
- `tests/unit/availability.test.js`: Validates check-in/out date ordering (Rule 2) and interval overlap detection.
- `tests/unit/voucher.test.js`: Validates percentage discounts, fixed discounts, maximum caps, expiry dates, and usage limits.
- `tests/unit/billing.test.js`: Validates dynamic line-item calculation, GST 18%, and mid-stay upgrade differentials.
- `tests/integration/customerJourney.test.js`: Validates the complete 34-step customer story of guest **Akmal Abbas** (Registration $\to$ 3-Night Stay $\to$ Check-in $\to$ Services $\to$ Suite Upgrade $\to$ STAY10 Voucher $\to$ UPI Settlement $\to$ Immutability Guards $\to$ Checkout $\to$ 2h Cleaning $\to$ File System Receipt Generation).

**Test Execution Result:** `7 passed, 0 failed, 100% test pass rate`.

---

### 5. Conclusion
StayEase fulfills every core objective and academic criterion outlined in the course syllabus. By avoiding isolated mockups and architecting a cohesive, event-driven web application, the project delivers an authentic enterprise-grade hotel management platform that highlights the technical expertise of all four team members.
