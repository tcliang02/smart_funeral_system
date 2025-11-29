# CORRECTED PROJECT GANTT CHART (14-WEEK RAD TIMELINE)

**Project:** Smart Funeral Management System  
**Methodology:** Rapid Application Development (RAD)  
**Total Duration:** 14 Weeks  
**Key Change:** Testing occurs CONTINUOUSLY during development (not at the end)  
**DFD Alignment:** All 8 Level 1 DFD processes mapped to testing iterations

---

## 📊 DFD PROCESS TO ITERATION MAPPING

This Gantt chart aligns with your **Level 1 DFD (8 processes)** and **Chapter 6 Testing (159 unit tests)**:

| DFD Process | Description | Iteration | Chapter 6 Tests | Test Count |
|------------|-------------|-----------|----------------|------------|
| **Foundation** | User Authentication & Role Management | Iteration 1 (Weeks 1-2) | 6.2.1 | 12 tests |
| **1.0** | Manage Memorial Tributes | Iteration 2 (Weeks 3-5) | 6.2.8 | 14 tests |
| **2.0** | Manage Tribute Wall & Interactions | Iteration 2 (Weeks 3-5) | 6.2.6, 6.2.7 | 11 tests |
| **4.0** | Manage Service Packages & Features | Iteration 3 (Weeks 6-9) | 6.2.2 | 10 tests |
| **6.0** | Manage Funeral Service Bookings | Iteration 3 (Weeks 6-9) | 6.2.3 | 36 tests |
| **5.0** | Manage Add-on Catalog & Provider Add-ons | Iteration 3 & 4 (Weeks 6-12) | 6.2.4 | 8 tests |
| **7.0** | Manage Payments & Refunds | Iteration 3 (Weeks 6-9) | 6.2.5 | 6 tests |
| **3.0** | Manage Service Providers & Reviews | Iteration 4 (Weeks 10-12) | 6.2.10-6.2.14 | 62 tests |
| **8.0** | Manage AI Voice Memorial | Iteration 5 (Weeks 13-14) | 6.2.9 | 7 tests |
| **Integration** | End-to-end testing | Iteration 5 (Week 13-14) | 10 scenarios | Integration |
| **SUS** | Usability evaluation | Iteration 5 (Week 14) | 20 participants | Usability |

**Total: 8 DFD Processes → 5 RAD Iterations → 159 Unit Tests + 10 Integration Tests + SUS Evaluation**

---

## Gantt Chart (RAD with Iterative Testing)

| No | Deliverables / Project Activities | Week |||||||||||||
|----|----------------------------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
|    |                                  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  | 13  | 14  |
|----|----------------------------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **1** | **Selection of Project Title** | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |     |
| **2** | **Requirements Planning Phase** |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Preliminary Research Work        | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Problem Identification           | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Literature Review Research       |     | 🟦  | 🟦  | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |
| **3** | **User Design Phase**            |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Design Proposed System Architecture |  |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |     |     |
|    | Initial User Interface           |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  | 🟦  |     |     |
|    | Refined User Interface (based on feedback) | | |   |     |     |     |     |     |     |     | 🟦  | 🟦  | 🟦  | 🟦  |
|    | Develop System Documentation / Report | |   |     |     | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  | 🟦  |
| **4** | **ITERATION 1: Authentication & Foundation (Weeks 1-2)** | | | | | | | | | | | | | | |
|    | **DFD Process:** Supporting foundation for all processes | | | | | | | | | | | | | | |
|    | Design User Registration & Login Module | 🟦 |  |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Code & Test "Authentication" Function | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |
|    | **Test: 6.2.1 User Authentication (12 tests)** | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |
|    | **Prototype Review (Week 2)** |     | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Fix Bugs & Refine (2 bugs fixed) |     | 🟦  |     |     |     |     |     |     |     |     |     |     |     |     |
| **5** | **ITERATION 2: Memorial & Tribute System (Weeks 3-5)** | | | | | | | | | | | | | | |
|    | **DFD Process 1.0:** Manage Memorial Tributes | | | | | | | | | | | | | | |
|    | Design Memorial & Tribute Page Module |  |     | 🟦  |     |     |     |     |     |     |     |     |     |     |     |
|    | Code & Test "Memorial & Tribute" Function | |    | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |     |
|    | **Test: 6.2.8 Tribute Management (14 tests)** |     |     | 🟦  | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |
|    | **DFD Process 2.0:** Manage Tribute Wall & Interactions | | | | | | | | | | | | | | |
|    | Design Virtual Offerings Module  |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |     |
|    | Code & Test "Virtual Offerings" Function | |   |     | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |
|    | **Test: 6.2.6 Virtual Offerings (5 tests)** | |     |     | 🟦  | 🟦  |     |     |     |     |     |     |     |     |     |
|    | Design Guest RSVP Module         |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |
|    | Code & Test "RSVP" Function      |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |
|    | **Test: 6.2.7 Guest RSVP (6 tests)** |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |
|    | **Prototype Review (Week 5)** |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |
|    | Fix Bugs & Refine (4 bugs fixed) |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |     |
| **6** | **ITERATION 3: Booking & Commerce System (Weeks 6-9)** | | | | | | | | | | | | | | |
|    | **DFD Process 4.0:** Manage Service Packages & Features | | | | | | | | | | | | | | |
|    | Design Package Management Module |     |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |
|    | Code & Test "Package Management" |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |     |     |
|    | **Test: 6.2.2 Package Management (10 tests)** | |    |     |     |     | 🟦  | 🟦  |     |     |     |     |     |     |     |
|    | **DFD Process 6.0:** Manage Funeral Service Bookings | | | | | | | | | | | | | | |
|    | Design Funeral Service Booking Module | |     |     |     |     | 🟦  |     |     |     |     |     |     |     |     |
|    | Code & Test "Booking Flow" Function |   |     |     |     |     | 🟦  | 🟦  | 🟦  |     |     |     |     |     |     |
|    | **Test: 6.2.3 Booking Management (36 tests)** | | |     |     |     | 🟦  | 🟦  | 🟦  | 🟦  |     |     |     |     |     |
|    | **DFD Process 5.0:** Manage Add-on Catalog & Provider Add-ons | | | | | | | | | | | | | | |
|    | Design Add-ons Module            |     |     |     |     |     |     | 🟦  |     |     |     |     |     |     |     |
|    | Code & Test "Add-ons Selection"  |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |     |
|    | **Test: 6.2.4 Add-on Management (8 tests)** |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |     |
|    | **DFD Process 7.0:** Manage Payments & Refunds | | | | | | | | | | | | | | |
|    | Design Payment & Donation Module |     |     |     |     |     |     |     | 🟦  |     |     |     |     |     |     |
|    | Code & Test "Payment Integration" |    |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |
|    | **Test: 6.2.5 Payment Integration (6 tests)** |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |
|    | **Prototype Review (Week 8)** |     |     |     |     |     |     |     | 🟦  |     |     |     |     |     |     |
|    | Fix Bugs & Refine (8 bugs fixed) |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |     |     |
| **7** | **ITERATION 4: Provider Management System (Weeks 10-12)** | | | | | | | | | | | | | | |
|    | **DFD Process 3.0:** Manage Service Providers & Reviews | | | | | | | | | | | | | | |
|    | Refine Package Management (Bug Fix) | |     |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | Design Provider Booking Management |  |     |     |     |     |     |     |     |     | 🟦  |     |     |     |     |
|    | Code & Test "Provider Bookings" | |   |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | **Test: 6.2.11 Provider Booking Mgmt (15 tests)** | | |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | Design Provider Availability Calendar | |    |     |     |     |     |     |     |     |     | 🟦  |     |     |     |
|    | Code & Test "Availability Calendar" | | |     |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |
|    | **Test: 6.2.12 Provider Availability (10 tests)** | | |     |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |
|    | Design Provider Dashboard Analytics | |     |     |     |     |     |     |     |     |     | 🟦  |     |     |     |
|    | Code & Test "Dashboard Analytics" | | |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | **Test: 6.2.13 Dashboard Analytics (11 tests)** | | |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | Design Reviews & Ratings Module  |     |     |     |     |     |     |     |     |     | 🟦  |     |     |     |     |
|    | Code & Test "Reviews" Function | |   |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | **Test: 6.2.10 Provider Reviews (8 tests)** | |  |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | Design Profile Settings Module   |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |     |
|    | Code & Test "Profile Settings" | |  |     |     |     |     |     |     |     |     |     | 🟦  |     |     |
|    | **Test: 6.2.14 Profile Settings (10 tests)** | | |     |     |     |     |     |     |     |     |     | 🟦  |     |     |
|    | Complete Provider Add-on Management |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | **Test: 6.2.4 Add-on Mgmt - Provider (8 tests)** | | |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |     |
|    | **Prototype Review (Week 11)** |     |     |     |     |     |     |     |     |     |     | 🟦  |     |     |     |
|    | Fix Critical Bug (Toggle Auth) |     |     |     |     |     |     |     |     |     |     | 🟦  |     |     |     |
|    | Refine & Retest (6 bugs fixed) |     |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  |     |     |
| **8** | **ITERATION 5: AI Enhancement & Final Testing (Weeks 13-14)** | | | | | | | | | | | | | | |
|    | **DFD Process 8.0:** Manage AI Voice Memorial | | | | | | | | | | | | | | |
|    | Design AI Voice Memorialization Module | |    |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | Code & Test "AI Voice Memorial" | |  |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | **Test: 6.2.9 AI Grief Support (7 tests)** |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | Design AI Chatbot (Grief Support) |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | Code & Test "AI Chatbot" Function |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | **Prototype Review (Week 13)** |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
|    | Fix & Refine AI Responses (2 bugs) |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |     |
| **9** | **Integration & System Testing** |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Test Full System & Simulate User Interactions | | |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  | 🟦  |
|    | **Integration Testing (10 scenarios)** |     |     |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  | 🟦  |
|    | Test System in Live/Demo Environment |  |     |     |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  |
| **10** | **System Usability Scale (SUS) Evaluation** | | | | | | | | | | | | | | |
|    | Conduct SUS Testing (20 participants) |     |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |
|    | Analyze SUS Results (Score: 78.5) |     |     |     |     |     |     |     |     |     |     |     |     |     | 🟦  |
| **11** | **Final Documentation & Submission** |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
|    | Prepare Final Documentation and User Manual | | |     |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  |
|    | Submit Final Project Report and Presentation | | |     |     |     |     |     |     |     |     |     |     | 🟦  | 🟦  |

---

## Legend:
- 🟦 = Planning/Design Phase (Light Blue)
- 🟥 = Development Phase (Red - coding)
- 🟩 = Testing Phase (Green - testing happens alongside development)
- 🟧 = Review & Refinement (Orange)

---

## KEY DIFFERENCES FROM OLD GANTT CHART:

### 1. **OLD CHART PROBLEM:**
- Testing happened at the END (Weeks 11-13) ❌
- All modules designed in Weeks 2-4 ❌
- Development Weeks 3-10, Testing Weeks 11-13 (Waterfall approach) ❌

### 2. **NEW CHART (RAD Methodology):**
- Testing happens CONTINUOUSLY during development ✅
- 5 iterations, each with immediate testing ✅
- Each iteration: Design → Code → Test → Review → Refine ✅

### 3. **MODULE NAME UPDATES:**

| DFD Process (Level 1) | Chapter 6 Test Module | Old Gantt Name | Iteration |
|----------------------|----------------------|----------------|-----------|
| **Supporting Foundation** | 6.2.1 User Authentication and Role Management | Design User Registration & Login Module | 1 (Weeks 1-2) |
| **1.0 Manage Memorial Tributes** | 6.2.8 Tribute Management | Design Memorial & Tribute Page Module | 2 (Weeks 3-5) |
| **2.0 Manage Tribute Wall & Interactions** | 6.2.6 Virtual Offering System<br>6.2.7 Guest Management and RSVP | Design Live Streaming & Virtual Funeral Module | 2 (Weeks 3-5) |
| **3.0 Manage Service Providers & Reviews** | 6.2.10 Provider Reviews and Ratings<br>6.2.11 Provider Booking Management<br>6.2.12 Provider Availability Management<br>6.2.13 Provider Dashboard Analytics<br>6.2.14 Profile Settings Management | ❌ NOT IN OLD CHART | 4 (Weeks 10-12) |
| **4.0 Manage Service Packages & Features** | 6.2.2 Package Management (Service Provider) | ❌ NOT IN OLD CHART | 3 & 4 (Weeks 6-12) |
| **5.0 Manage Add-on Catalog & Provider Add-ons** | 6.2.4 Add-on Management | ❌ NOT IN OLD CHART | 3 & 4 (Weeks 6-12) |
| **6.0 Manage Funeral Service Bookings** | 6.2.3 Booking Management (Family Members) | Design Funeral Service Booking Module | 3 (Weeks 6-9) |
| **7.0 Manage Payments & Refunds** | 6.2.5 Payment Integration | Design Payment & Donation Module | 3 (Weeks 6-9) |
| **8.0 Manage AI Voice Memorial** | 6.2.9 AI Grief Support Features | Design AI Voice Memorialization Module<br>Design AI Chatbot & FAQ Support Module | 5 (Weeks 13-14) |
| ❌ REMOVED | N/A | Design Cemetery & Grave Locator Module | N/A |

---

## SUMMARY OF CHANGES NEEDED:

### ✅ **Change 1: Adopt RAD Iterative Structure**
- Split development into 5 iterations (not linear phases)
- Each iteration includes: Design → Code → Test → Review → Refine

### ✅ **Change 2: Continuous Testing**
- Move testing activities INSIDE each iteration (not at the end)
- Show testing happening in Weeks 1-2, 3-5, 6-9, 10-12, 13-14

### ✅ **Change 3: Add Missing Modules**
- Add "Package Management" module
- Add "Add-on Management" module
- Add "Provider Dashboard" module
- Add "Provider Booking Management" module
- Add "Provider Availability" module
- Add "Reviews & Ratings" module
- Add "Guest RSVP" module
- Add "Profile Settings" module

### ✅ **Change 4: Remove/Rename Modules**
- Remove "Cemetery & Grave Locator" (not tested in Chapter 6)
- Rename "Live Streaming & Virtual Funeral" → "Virtual Offering System"

### ✅ **Change 5: Add Prototype Review Sessions**
- Add prototype review at end of each iteration (Weeks 2, 5, 8, 11, 13)
- Show bug fixes happening within same iteration

### ✅ **Change 6: Add SUS Testing**
- Add "System Usability Scale (SUS) Evaluation" in Week 14
- Show 20 participants testing

---

## VISUAL REPRESENTATION (Simplified):

```
ITERATION 1 (Week 1-2):   [Design] → [Code] → [Test 12 cases] → [Review] → [Fix 2 bugs]
ITERATION 2 (Week 3-5):   [Design] → [Code] → [Test 25 cases] → [Review] → [Fix 4 bugs]
ITERATION 3 (Week 6-9):   [Design] → [Code] → [Test 50 cases] → [Review] → [Fix 8 bugs]
ITERATION 4 (Week 10-12): [Design] → [Code] → [Test 51 cases] → [Review] → [Fix 6 bugs]
ITERATION 5 (Week 13-14): [Design] → [Code] → [Test 21 cases] → [Review] → [Fix 2 bugs] → [SUS]
```

---

**This corrected Gantt chart now matches your Chapter 6 RAD testing methodology perfectly!**
