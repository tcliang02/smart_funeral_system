# DFD Process to Chapter 6 Testing Module Mapping

**Purpose:** Map Level 1 DFD processes (1.0-8.0) to Chapter 6 unit testing modules  
**Principle:** DFD shows WHAT the system does, Chapter 6 shows HOW we tested it

---

## ✅ COMPLETE MAPPING TABLE

| DFD Process (Level 1) | Chapter 6 Test Modules | Iteration | Tests | Notes |
|----------------------|----------------------|-----------|-------|-------|
| **1.0 Manage Memorial Tributes** | 6.2.8 Tribute Management | Iteration 2 (Weeks 3-5) | 14 tests | Create, edit, delete tributes, photo gallery, privacy settings |
| **2.0 Manage Tribute Wall & Interactions** | 6.2.6 Virtual Offering System<br>6.2.7 Guest Management and RSVP | Iteration 2 (Weeks 3-5) | 5 tests<br>6 tests | Virtual flowers, candles, condolence messages<br>RSVP, guest invitations |
| **3.0 Manage Service Providers & Reviews** | 6.2.1 User Authentication (Provider part)<br>6.2.10 Provider Reviews and Ratings<br>6.2.11 Provider Booking Management<br>6.2.12 Provider Availability Management<br>6.2.13 Provider Dashboard Analytics<br>6.2.14 Profile Settings Management | Iteration 1 (Weeks 1-2) for auth<br>Iteration 4 (Weeks 10-12) for management | 12 tests (auth)<br>8 tests (reviews)<br>15 tests (bookings)<br>10 tests (availability)<br>11 tests (dashboard)<br>10 tests (profile)<br>= 66 tests total | Largest DFD process, covers entire provider ecosystem |
| **4.0 Manage Service Packages & Features** | 6.2.2 Package Management (Service Provider) | Iteration 3 (Weeks 6-9)<br>Iteration 4 (Weeks 10-12) refinement | 10 tests | CRUD operations, toggle active/featured status |
| **5.0 Manage Add-on Catalog & Provider Add-ons** | 6.2.4 Add-on Management | Iteration 3 (Weeks 6-9)<br>Iteration 4 (Weeks 10-12) | 8 tests | Template adoption, category filtering, provider add-ons |
| **6.0 Manage Funeral Service Bookings** | 6.2.3 Booking Management (Family Members) | Iteration 3 (Weeks 6-9) | 36 tests | Date selection, package selection, add-ons, checkout, document upload |
| **7.0 Manage Payments & Refunds** | 6.2.5 Payment Integration | Iteration 3 (Weeks 6-9) | 6 tests | Payment gateway, success/failure handling, refund processing |
| **8.0 Manage AI Voice Memorial** | 6.2.9 AI Grief Support Features | Iteration 5 (Weeks 13-14) | 7 tests | Voice cloning, personality setup, memory database, voice chat |
| **SUPPORTING: User Authentication** | 6.2.1 User Authentication and Role Management | Iteration 1 (Weeks 1-2) | 12 tests | Foundation for all processes, role-based access |

**Total: 8 DFD Processes → 14 Test Modules → 159 Unit Tests**

---

## 📊 LOGICAL GROUPING FOR GANTT CHART

### Iteration 1 (Weeks 1-2): Foundation - Authentication
- **Process:** Supporting foundation for all DFD processes
- **Tests:** 6.2.1 User Authentication (12 tests)
- **Why First:** All other processes require user login

### Iteration 2 (Weeks 3-5): Memorial & Tribute System
- **DFD Process 1.0:** Manage Memorial Tributes
  - Tests: 6.2.8 Tribute Management (14 tests)
- **DFD Process 2.0:** Manage Tribute Wall & Interactions
  - Tests: 6.2.6 Virtual Offering System (5 tests)
  - Tests: 6.2.7 Guest RSVP (6 tests)
- **Total:** 25 tests
- **Why Second:** Core family-facing feature, independent of booking

### Iteration 3 (Weeks 6-9): Booking & Commerce
- **DFD Process 4.0:** Manage Service Packages & Features
  - Tests: 6.2.2 Package Management (10 tests) - basic CRUD
- **DFD Process 6.0:** Manage Funeral Service Bookings
  - Tests: 6.2.3 Booking Management (36 tests)
- **DFD Process 5.0:** Manage Add-on Catalog & Provider Add-ons
  - Tests: 6.2.4 Add-on Management (8 tests) - customer side
- **DFD Process 7.0:** Manage Payments & Refunds
  - Tests: 6.2.5 Payment Integration (6 tests)
- **Total:** 60 tests
- **Why Third:** Booking needs packages to exist; payment needs booking to exist

### Iteration 4 (Weeks 10-12): Provider Management
- **DFD Process 3.0:** Manage Service Providers & Reviews
  - Tests: 6.2.2 Package Management refinement (retest 10)
  - Tests: 6.2.4 Add-on Management - provider side (8 tests)
  - Tests: 6.2.10 Provider Reviews (8 tests)
  - Tests: 6.2.11 Provider Booking Management (15 tests)
  - Tests: 6.2.12 Provider Availability (10 tests)
  - Tests: 6.2.13 Provider Dashboard (11 tests)
  - Tests: 6.2.14 Profile Settings (10 tests)
- **Total:** 51 tests (62 with retests)
- **Why Fourth:** Provider features need customer bookings to exist first

### Iteration 5 (Weeks 13-14): AI Enhancement & Final Testing
- **DFD Process 8.0:** Manage AI Voice Memorial
  - Tests: 6.2.9 AI Grief Support (7 tests)
- **Integration Testing:** 10 scenarios
- **SUS Evaluation:** 20 participants
- **Total:** 21 tests + integration + SUS
- **Why Last:** AI is optional enhancement; integration needs all features complete

---

## ✅ VALIDATION: Is This Logical?

### Dependency Check:
1. ✅ Authentication before all processes (foundation)
2. ✅ Tributes independent of booking (can develop parallel)
3. ✅ Packages before booking (can't book without packages)
4. ✅ Booking before payment (can't pay without booking)
5. ✅ Booking before provider management (providers manage existing bookings)
6. ✅ Reviews after booking completion (can't review without completed service)
7. ✅ AI last (optional enhancement, doesn't block core features)

### Timeline Check:
- Iteration 1: 2 weeks for authentication ✅ (simple, foundational)
- Iteration 2: 3 weeks for tributes + interactions ✅ (moderate complexity)
- Iteration 3: 4 weeks for booking flow ✅ (most complex, highest test count)
- Iteration 4: 3 weeks for provider features ✅ (many modules, but parallel)
- Iteration 5: 2 weeks for AI + final ✅ (AI + integration + SUS)

### Test Distribution:
- Total: 159 unit tests across 14 weeks = 11.4 tests/week average ✅
- Iteration 3 has 60 tests in 4 weeks = 15 tests/week ✅ (acceptable for complex feature)

---

## 🎯 CONCLUSION

**The mapping is logical because:**
1. ✅ DFD processes map to test modules correctly
2. ✅ Dependencies are respected (foundation → features → enhancements)
3. ✅ Timeline allocates more time to complex processes
4. ✅ RAD principle maintained: test immediately after development
5. ✅ All 8 DFD processes covered across 5 iterations

**Ready to update Gantt chart and Chapter 6 with this mapping!**
