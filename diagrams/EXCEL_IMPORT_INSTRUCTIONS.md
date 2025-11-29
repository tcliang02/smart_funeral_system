# GANTT CHART EXCEL IMPORT INSTRUCTIONS

## File Created: GANTT_CHART_RAD_EXCEL.csv

### How to Import into Excel:

1. **Open the CSV file in Excel:**
   - Right-click `GANTT_CHART_RAD_EXCEL.csv`
   - Select "Open with" → "Microsoft Excel"

2. **Apply Color Formatting:**
   - **CYAN cells** = Fill with Light Blue (#00BCD4) - Design Phase
   - **RED cells** = Fill with Red (#F44336) - Development/Coding Phase
   - **GREEN cells** = Fill with Green (#4CAF50) - Testing Phase

3. **Format the table:**
   - Bold the header row (Row 1)
   - Bold the iteration section headers (Rows 5, 6, 7, 8, 9, 10)
   - Add borders to all cells
   - Center-align week columns (D to Q)

4. **Adjust column widths:**
   - Column A (No): 50 pixels
   - Column B (Deliverables): 100 pixels
   - Column C (Project Activities): 300 pixels
   - Columns D-Q (Weeks): 40 pixels each

### Quick Excel Formula for Color Fill:

You can use Find & Replace with formatting:
1. Press `Ctrl+H`
2. Find: `CYAN` → Replace with: (empty) + Format: Fill Light Blue
3. Find: `RED` → Replace with: (empty) + Format: Fill Red
4. Find: `GREEN` → Replace with: (empty) + Format: Fill Green

---

## Key Changes from Your Old Gantt Chart:

### ✅ CORRECT (New RAD Chart):
- Testing happens WITHIN each iteration (continuous testing)
- 5 clear iterations with week ranges
- DFD process labels (1.0-8.0) included
- Design → Code → Test happens together (RAD approach)

### ❌ WRONG (Your Old Chart):
- Testing only at end (Weeks 12-14)
- No iteration structure
- Waterfall approach (Design → Code → Test in sequence)
- Missing DFD process alignment

---

## Color Legend:
- 🟦 **CYAN (Light Blue #00BCD4)** = Design/Planning Phase
- 🟥 **RED (#F44336)** = Development/Coding Phase
- 🟩 **GREEN (#4CAF50)** = Testing Phase

---

## Iteration Breakdown:

| Iteration | Weeks | Focus | DFD Processes |
|-----------|-------|-------|---------------|
| **1** | 1-2 | Authentication | Foundation |
| **2** | 3-5 | Memorial & Tribute | 1.0, 2.0 |
| **3** | 6-9 | Booking & Commerce | 4.0, 5.0, 6.0, 7.0 |
| **4** | 10-12 | Provider Management | 3.0 |
| **5** | 13-14 | AI & Final Testing | 8.0 + Integration + SUS |

**Total: 159 Unit Tests + 10 Integration Tests + SUS Evaluation**

---

## Important Notes:

1. **This matches your Chapter 6 Testing exactly**
2. **All 8 DFD processes are covered**
3. **RAD methodology correctly implemented**
4. **No more Waterfall approach**
5. **Ready for supervisor approval**

Replace your old Excel Gantt chart with this corrected version!
