# ⚡ Rating System - Quick Reference Card

## 🎯 1-Minute Overview

**What**: Bidirectional rating system for funeral services  
**Who**: Customers rate providers, providers rate customers  
**When**: After service completion, within 30 days  
**Where**: `/customer-ratings` and `/provider-ratings` pages

---

## 🚀 Deploy in 3 Steps

### 1. Database (2 min)
```bash
mysql -u root -p
USE smart_funeral_system;
SOURCE rating_system_enhancement.sql;
```

### 2. Frontend (1 min)
```bash
cd frontend/my-app
npm run dev
```

### 3. Test (2 min)
- Login as provider → Complete a service
- Check both rating pages

---

## 📁 Files Quick List

### Created:
- `rating_system_enhancement.sql` - Database
- `backend/submitRating.php` - Submit API
- `backend/getPendingRatings.php` - Get API
- `src/pages/CustomerRatings.jsx` - Customer UI
- `src/pages/ProviderRatings.jsx` - Provider UI

### Modified:
- `src/pages/ProviderBookings.jsx` - Complete button
- `src/App.jsx` - Routes
- `src/components/Navbar.jsx` - Links
- `src/pages/ServiceProviderDashboard.jsx` - Tab

---

## 🎨 UI Locations

### Customer:
**Navbar** → "Rate Services" → View/rate completed services

### Provider:
**Dashboard** → "Manage Bookings" → "Complete Service" button  
**Dashboard** → "Customer Ratings" → Rate customers

---

## 🗄️ Database Quick View

```sql
-- New tables
provider_reviews    (customer → provider ratings)
customer_reviews    (provider → customer ratings)

-- New bookings fields
completed_at        (completion time)
rating_deadline     (30 days after)
customer_rating_submitted
provider_rating_submitted
```

---

## 🔄 Workflow

```
1. Provider confirms booking
2. Service delivered
3. Provider clicks "Complete Service" ⭐
4. 30-day rating window opens
5. Both parties rate each other
6. Status: pending → completed/expired
```

---

## ⚠️ Important Rules

✅ Service must be "completed" first  
✅ 30-day deadline enforced  
✅ One rating per booking per user  
✅ Star rating required (1-5)  
✅ Review text optional (500 chars max)

---

## 🎯 Testing Quick Check

- [ ] Database migration done?
- [ ] Frontend running?
- [ ] Complete Service button works?
- [ ] Rating pages load?
- [ ] Can submit ratings?
- [ ] Statistics update?

---

## 🔗 Quick URLs (localhost:5173)

- `/customer-ratings` - Customer rating page
- `/provider-ratings` - Provider rating page
- `/provider-bookings` - Complete Service button
- `/service-provider-dashboard` - Provider nav

---

## 📊 Status Colors

🟡 **Pending** - Within 30 days, not rated  
🟢 **Completed** - Successfully rated  
🔴 **Expired** - Past 30 days without rating

---

## 🔧 Quick Troubleshooting

**No data showing?**  
→ Need at least 1 completed booking

**Can't submit rating?**  
→ Check star rating is selected

**Complete button missing?**  
→ Booking must be "confirmed" status

**API errors?**  
→ Check backend files in `/backend/`

---

## 📖 Full Documentation

1. **RATING_SYSTEM_COMPLETE.md** - Complete technical docs
2. **RATING_SYSTEM_QUICK_START.md** - Detailed deployment
3. **RATING_SYSTEM_VISUAL_GUIDE.md** - Visual diagrams
4. **RATING_SYSTEM_IMPLEMENTATION_SUMMARY.md** - This summary

---

## 🎊 Features at a Glance

✅ Bidirectional ratings  
✅ 30-day auto deadline  
✅ Complete Service trigger  
✅ Print receipts  
✅ Statistics dashboards  
✅ Professional UI  
✅ Role-based security  
✅ Deadline tracking

---

## ⭐ Star Rating Guide

⭐ = Needs Improvement  
⭐⭐ = Fair  
⭐⭐⭐ = Good  
⭐⭐⭐⭐ = Very Good  
⭐⭐⭐⭐⭐ = Excellent

---

## 📞 Need Help?

1. Check browser console (F12)
2. Verify database migration
3. Check API responses in Network tab
4. Review documentation files
5. Ensure XAMPP services running

---

**🎉 System Ready! Start Testing!**

*Keep this card handy for quick reference*
