# Buddhist Add-On System - Complete Testing Guide

## 🎉 System Complete! Ready to Test

Your Buddhist funeral add-on system is now fully implemented. Here's how to test everything.

---

## 📋 Pre-Test Checklist

✅ Database setup completed (9 categories, 49 templates)  
✅ Backend APIs created (7 files)  
✅ Customer view updated (PackageDetails.jsx)  
✅ Provider dashboard created (ManageAddons.jsx)  
✅ Routes configured in App.jsx  

---

## 🧪 Testing Workflow

### **Phase 1: Provider Setup (Service Provider Account)**

#### Step 1: Login as Service Provider
```
URL: http://localhost:5174/login
Username: user8 (or your provider account)
Password: [your password]
```

#### Step 2: Access Provider Dashboard
```
Should auto-redirect to: http://localhost:5174/service-provider-dashboard
```

#### Step 3: Navigate to Manage Add-ons
Click **"🪷 Manage Buddhist Add-ons"** button in Quick Actions section

#### Step 4: Browse Templates
1. Click **"🪷 Browse Templates"** tab
2. You should see 9 categories in the left sidebar:
   - Buddhist Rituals & Ceremonies
   - Altars & Religious Items
   - Flowers & Offerings
   - Urns & Caskets
   - Monks & Chanting Services
   - Memorial Items
   - Transportation
   - Cremation Services
   - Food & Refreshments

#### Step 5: Add Services from Templates
1. Click any category (e.g., "Buddhist Rituals & Ceremonies")
2. You should see templates like:
   - **7-Day Buddhist Prayer Ceremony** (RM 2,500)
   - **49-Day Memorial Service** (RM 5,000)
   - **Three-Day Wake Ceremony** (RM 1,800)
3. Click **"➕ Add Service"** on any template
4. Modal opens showing:
   - Template name and description
   - Suggested price
   - Input to set your custom price
5. Adjust price if needed (e.g., change RM 2,500 to RM 2,800)
6. Click **"✅ Add to My Services"**
7. Success message: "✅ Add-on service added successfully!"

**Expected Result:** Template now shows "✓ Already Added" badge

#### Step 6: Create Custom Service
1. Click **"➕ Create Custom Service"** tab
2. Fill in the form:
   - **Service Name:** "Special Taoist-Buddhist Ceremony"
   - **Category:** Buddhist Rituals & Ceremonies
   - **Description:** "Combined traditional Taoist and Buddhist funeral ceremony with special prayers"
   - **Price:** 3500.00
3. Click **"✨ Create Custom Service"**
4. Success message: "✅ Custom add-on created successfully!"
5. Automatically switches to "My Add-ons" tab

**Expected Result:** New custom service appears with purple "Custom" badge

#### Step 7: Manage Your Add-ons
1. Click **"📋 My Add-ons"** tab
2. You should see your added services grouped by category
3. Test these actions:

**Toggle Active/Inactive:**
- Click **"🔴 Disable"** on any service
- Status changes to "Inactive" with gray badge
- Click **"🟢 Enable"** to reactivate
- Active services have amber background

**Edit Service:**
- Click **"✏️ Edit"** on any service
- Form appears with editable fields
- Change price (e.g., RM 2,800 → RM 3,000)
- Click **"✅ Save Changes"**
- Price updates successfully

**Delete Service:**
- Click **"🗑️ Delete"** on any service
- Confirmation popup appears
- Click OK to delete
- Service disappears from list

**Expected Behavior:** All CRUD operations work smoothly

---

### **Phase 2: Customer View (Family Member Account)**

#### Step 1: Logout and Login as Family Member
```
Logout from provider account
Login with: user1 (family member)
```

#### Step 2: Browse Packages
```
Navigate to: http://localhost:5174/order-services
```
You should see service providers with package counts

#### Step 3: Select a Package
1. Click **"View Packages"** on Provider 1 (who added add-ons)
2. Click **"Select Package"** on any package (e.g., "happy")
3. Navigate to Package Details page

#### Step 4: View Buddhist Add-ons
Scroll down to **"🪷 Buddhist Ceremony Add-ons"** section

**If Provider Added Add-ons:**
You should see services organized by category, like:

```
🪷 Buddhist Rituals & Ceremonies
  ✓ 7-Day Buddhist Prayer Ceremony
    Traditional 7-day prayer ceremony conducted by monks...
    RM 2,800.00
    [Add Service] button
    
  ✓ Three-Day Wake Ceremony
    Three consecutive days of Buddhist wake...
    RM 1,800.00
    [Add Service] button

🪷 Monks & Chanting Services
  ✓ 3-Monk Chanting Ceremony
    Three monks performing traditional...
    RM 1,200.00
    [Add Service] button
```

**If Provider Hasn't Added Add-ons:**
```
"No add-ons available from this provider yet."
"The provider can add Buddhist ceremony services from their dashboard."
```

#### Step 5: Select Add-ons
1. Click **"Add Service"** button on any add-on
2. Card gets amber border and amber background
3. Checkmark (✓) appears
4. Button changes to **"Remove"** in red

**Order Summary Updates:**
```
Order Summary
─────────────────────
Base Package        RM 2,000.00

Selected Add-ons:
7-Day Prayer Ceremony    RM 2,800.00
3-Monk Chanting         RM 1,200.00
─────────────────────
Total              RM 6,000.00

3 add-on service(s) selected
```

#### Step 6: Remove Add-on
1. Click **"Remove"** button on selected add-on
2. Border returns to gray
3. Total price decreases
4. Button changes back to **"Add Service"**

#### Step 7: Proceed to Checkout
1. Add some add-ons
2. Click **"Book This Package"**
3. Navigate to checkout with:
   - Package details
   - Selected add-ons
   - Total price

**Expected Result:** All data passes correctly to checkout

---

## 🔍 Detailed Feature Testing

### **Provider Dashboard Features**

✅ **My Add-ons Tab:**
- Shows count in tab badge
- Groups by category
- Shows active/inactive status
- Shows custom badge
- Edit inline functionality
- Toggle active/inactive
- Delete with confirmation

✅ **Browse Templates Tab:**
- Shows 9 categories
- Category sidebar with template counts
- Popular badge (⭐)
- Already Added badge (✓)
- Suggested prices
- Add button disabled if already added

✅ **Create Custom Tab:**
- Form validation
- Category dropdown
- Rich text description
- Price input (decimal)
- Success redirect to My Add-ons

### **Customer View Features**

✅ **Package Details:**
- Buddhist theme (lotus icons 🪷, amber colors)
- Grouped by category
- Custom service badge
- Service descriptions
- Click to add/remove
- Real-time total calculation
- Order summary updates

---

## 🐛 Common Issues & Solutions

### Issue 1: "No add-ons available"
**Cause:** Provider hasn't added any services yet  
**Solution:** Login as provider and add some services first

### Issue 2: Provider can't see templates
**Cause:** Database not set up properly  
**Solution:** Re-run `buddhist_addon_system.sql`

### Issue 3: API returns error 500
**Cause:** Database connection or table missing  
**Solution:** Check `db_connect.php` and verify tables exist

### Issue 4: Price not updating
**Cause:** Form not submitting or validation error  
**Solution:** Check browser console for errors

### Issue 5: Add-ons not showing for customers
**Cause:** Add-ons are set to inactive  
**Solution:** Provider must toggle to "🟢 Enable"

---

## 📊 Test Data Examples

### Recommended Test Scenario:

**As Provider (user8):**
1. Add "7-Day Prayer Ceremony" at RM 2,800
2. Add "3-Monk Chanting" at RM 1,200  
3. Add "White Lotus Arrangement" at RM 450
4. Add "Vegetarian Buffet (50 pax)" at RM 1,000
5. Create custom: "Special Night Vigil" at RM 1,500

**As Customer (user1):**
1. Select package "happy" (RM 2,000)
2. Add "7-Day Prayer Ceremony" (RM 2,800)
3. Add "White Lotus Arrangement" (RM 450)
4. **Expected Total:** RM 5,250.00
5. Proceed to checkout

---

## ✅ Success Criteria

### Provider Side:
- [  ] Can browse 49 Buddhist service templates across 9 categories
- [  ] Can add template services with custom prices
- [  ] Can create completely custom services
- [  ] Can edit service names, descriptions, and prices
- [  ] Can toggle services active/inactive
- [  ] Can delete services
- [  ] Services grouped by category with badges
- [  ] UI is Buddhist-themed (amber colors, lotus icons)

### Customer Side:
- [  ] Package details show add-ons section
- [  ] Add-ons organized by category
- [  ] Can see service descriptions and prices
- [  ] Can add/remove add-ons with visual feedback
- [  ] Order summary updates in real-time
- [  ] Total price calculates correctly
- [  ] Custom services show purple badge
- [  ] Buddhist theme consistent (amber colors, lotus icons)
- [  ] Data passes correctly to checkout

### Database:
- [  ] 9 categories exist
- [  ] 49 templates exist
- [  ] Provider add-ons save correctly
- [  ] Active/inactive status works
- [  ] Custom flag works
- [  ] Prices save as decimal
- [  ] Foreign keys maintain integrity

---

## 🎯 Next Steps After Testing

1. **Test with Multiple Providers**
   - Create add-ons for Provider 3
   - Verify customers only see that provider's add-ons

2. **Test Edge Cases**
   - Delete a package with add-ons
   - Add same template twice (should show error)
   - Set price to 0 or negative (should validate)

3. **Performance Testing**
   - Add 20+ services
   - Check load times
   - Test category filtering

4. **Mobile Testing**
   - Test on phone/tablet
   - Check responsive design
   - Verify touch interactions

---

## 📝 Testing Checklist

Print this and check off as you test:

**Provider Dashboard:**
- [  ] Login as provider works
- [  ] Dashboard loads without errors
- [  ] Manage Add-ons button appears
- [  ] Templates tab shows all 9 categories
- [  ] Can add service from template
- [  ] Custom price modal works
- [  ] Can create custom service
- [  ] My Add-ons tab shows services
- [  ] Can edit service
- [  ] Can toggle active/inactive
- [  ] Can delete service
- [  ] Categories group correctly
- [  ] Badges display properly

**Customer View:**
- [  ] Login as family member works
- [  ] Order Services page works
- [  ] Package Details loads
- [  ] Add-ons section appears
- [  ] Services grouped by category
- [  ] Can select add-on
- [  ] Visual feedback works (amber border)
- [  ] Total price updates
- [  ] Can deselect add-on
- [  ] Order summary accurate
- [  ] Checkout receives correct data

**Database:**
- [  ] All tables created
- [  ] Sample data inserted
- [  ] APIs return correct JSON
- [  ] CRUD operations work
- [  ] No SQL errors in logs

---

🪷 **Your Buddhist Funeral Add-On System is Ready!** 🪷

Start testing from the provider dashboard and work your way through the customer journey. Report any issues you find!
