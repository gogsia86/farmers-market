# 🚀 PHASE 3 QUICK START GUIDE

## Marketplace Discovery & Farm Profile Enhancement

**Last Updated**: January 2025  
**Phase**: 3 of 6  
**Estimated Setup Time**: 10 minutes

---

## 📋 QUICK OVERVIEW

Phase 3 introduces powerful marketplace discovery features:

- 🔍 Advanced product filtering (8+ filter types)
- 🌾 Enhanced farm profiles with tabs
- 🛒 Grid/List product views
- 📍 Location-based discovery (ready for maps)
- ⭐ Reviews and ratings display

---

## 🎯 WHAT'S NEW IN PHASE 3

### 1. Products Marketplace with Advanced Filtering

**Route**: `/marketplace/products`

**Features**:

- Category filters (Fruits, Vegetables, Dairy, etc.)
- Price range slider
- Distance/location filter
- Dietary filters (Organic, Vegan, Gluten-free, etc.)
- Certification filters
- Search by name/farm
- Sort by price, rating, distance, newest
- Grid/List view toggle
- Add to cart & favorites

### 2. Enhanced Farm Profiles with Tabs

**Route**: `/marketplace/farms/[slug]`

**Features**:

- **Products Tab**: Browse farm's products with category filters
- **About Tab**: Farm story, certifications, farming practices
- **Reviews Tab**: Customer reviews and ratings summary
- **Location Tab**: Map placeholder, address, hours, contact info

### 3. API Endpoints

- `GET /api/marketplace/products` - Filter & search products
- `GET /api/marketplace/farms/[slug]` - Farm profile data
- `OPTIONS /api/marketplace/products` - Categories list

---

## 🚀 GETTING STARTED

### Step 1: Start Development Environment

```bash
# Terminal 1: Start Docker services (PostgreSQL + Redis)
cd "Farmers Market Platform web and app"
docker compose -f docker/compose/docker-compose.dev.yml up -d

# Terminal 2: Start Next.js dev server
npm run dev:omen
```

**Wait for**:

- ✅ Docker containers running
- ✅ Next.js compiled successfully
- ✅ Server listening on http://localhost:3001

### Step 2: Open Marketplace Pages

**Products Marketplace**:

```
http://localhost:3001/marketplace/products
```

**Farm Profiles** (test data):

```
http://localhost:3001/marketplace/farms/green-valley-farm
http://localhost:3001/marketplace/farms/sunny-acres-orchard
```

### Step 3: Test API Endpoints

```bash
# Get all products
curl http://localhost:3001/api/marketplace/products

# Filter by category
curl "http://localhost:3001/api/marketplace/products?category=vegetables"

# Filter by price range
curl "http://localhost:3001/api/marketplace/products?minPrice=5&maxPrice=10"

# Filter organic products only
curl "http://localhost:3001/api/marketplace/products?organic=true"

# Search products
curl "http://localhost:3001/api/marketplace/products?search=tomato"

# Get farm profile
curl http://localhost:3001/api/marketplace/farms/green-valley-farm

# Get categories
curl -X OPTIONS http://localhost:3001/api/marketplace/products
```

---

## 🧪 TESTING GUIDE

### Test Scenario 1: Product Filtering

1. **Open Products Marketplace**

   ```
   http://localhost:3001/marketplace/products
   ```

2. **Test Category Filter**
   - Click on "Vegetables" category card
   - Verify: Only vegetable products show
   - Click "Fruits" as well
   - Verify: Both categories show
   - Active filter count badge shows "2"

3. **Test Price Range**
   - Drag price slider to $5-$15 range
   - Verify: Products outside range disappear
   - Check product count updates

4. **Test Distance Filter**
   - Drag distance slider to 30 miles
   - Verify: Products beyond 30mi hidden
   - Set to "Any distance" (100)
   - Verify: All products return

5. **Test Dietary Filters**
   - Check "Organic" checkbox
   - Verify: Only organic products show
   - Check "Vegan" as well
   - Verify: Products must match both

6. **Test Search**
   - Type "tomato" in search box
   - Verify: Results filter in real-time
   - Clear search
   - Verify: All products return

7. **Test Sort Options**
   - Select "Price: Low to High"
   - Verify: Products sorted by price ascending
   - Select "Highest Rated"
   - Verify: Products sorted by rating

8. **Test Reset**
   - Apply multiple filters
   - Click "Reset" button
   - Verify: All filters cleared

9. **Test View Toggle**
   - Click List view icon
   - Verify: Products display in list layout
   - Click Grid view icon
   - Verify: Products display in grid layout

### Test Scenario 2: Farm Profile

1. **Open Farm Profile**

   ```
   http://localhost:3001/marketplace/farms/green-valley-farm
   ```

2. **Verify Hero Section**
   - Farm name displays: "Green Valley Farm"
   - Tagline shows
   - Rating and review count visible
   - Location displays: "Portland, OR"
   - Delivery radius shows
   - Certifications badges present

3. **Test Products Tab** (default)
   - Products grid displays
   - Click category filter buttons
   - Verify: Products filter by category
   - Click "Add to Cart" button
   - Verify: Console logs product ID
   - Check organic badges on products

4. **Test About Tab**
   - Click "About" tab
   - Verify: Farm story displays
   - Farm details card shows:
     - Farm Type
     - Farm Size
     - Established year
     - Delivery radius
   - Meet the Farmer section visible
   - Certifications list displays
   - Farming practices list shows
   - Specialties badges present

5. **Test Reviews Tab**
   - Click "Reviews" tab
   - Verify: Average rating displayed (large number)
   - Star visualization shows
   - Review count accurate
   - Reviews list displays:
     - Customer name
     - Star rating
     - Review text
     - Date posted
     - "Verified Purchase" badge
     - Product name (if applicable)

6. **Test Location Tab**
   - Click "Location" tab
   - Verify: Map placeholder shows
   - Address & Contact card displays:
     - Full address
     - Phone number (clickable tel: link)
     - Email (clickable mailto: link)
     - Website link
   - Operating Hours card shows:
     - All 7 days listed
     - Hours for each day
     - "Closed" days highlighted in red
   - Delivery Information card visible
   - "Get Directions" button present

7. **Test Action Buttons**
   - Click "Save" button (heart icon)
   - Verify: Button state toggles
   - Icon fills with red when saved
   - Click "Share" button
   - Verify: Button is clickable

### Test Scenario 3: Interactive Features

1. **Favorites Toggle**
   - On products page, click heart icon on product card
   - Verify: Heart fills with red
   - Click again
   - Verify: Heart empties

2. **Add to Cart**
   - Click "Add to Cart" button
   - Open browser console (F12)
   - Verify: Console logs "Added to cart: [productId]"

3. **Mobile Responsive**
   - Open products page
   - Resize browser to mobile width (<768px)
   - Verify: Filter sidebar collapses
   - Click filter icon
   - Verify: Filters expand
   - Farm profile tabs should wrap

4. **Empty State**
   - Apply filters with no matches
   - Verify: "No products found" message
   - "Reset Filters" button shows
   - Click reset
   - Verify: Products return

### Test Scenario 4: API Testing

```bash
# Test product filtering
curl "http://localhost:3001/api/marketplace/products?category=vegetables&organic=true&inStock=true&sortBy=price-asc&page=1&limit=10"

# Expected: JSON response with filtered products

# Test pagination
curl "http://localhost:3001/api/marketplace/products?page=2&limit=5"

# Expected: Second page of results

# Test farm profile
curl http://localhost:3001/api/marketplace/farms/green-valley-farm

# Expected: Complete farm data with products and reviews

# Test invalid farm slug
curl http://localhost:3001/api/marketplace/farms/invalid-farm-slug

# Expected: 404 error with proper message

# Test categories
curl -X OPTIONS http://localhost:3001/api/marketplace/products

# Expected: List of categories with counts
```

---

## 🗃️ DATABASE VERIFICATION

### Using Prisma Studio

1. **Start Prisma Studio**:

```bash
npm run db:studio
```

2. **Open in Browser**:

```
http://localhost:5555
```

3. **Verify Data**:

**Products Table**:

- At least 5-10 products exist
- Status = "ACTIVE"
- Price values are set
- Category values present
- StockQuantity > 0 for in-stock items

**Farms Table**:

- At least 2-3 farms exist
- Status = "ACTIVE"
- VerificationStatus = "VERIFIED"
- Slug values match test URLs
- City, State fields populated

**Reviews Table**:

- Some reviews exist
- Status = "APPROVED"
- Rating values 1-5
- ReviewText present

**FarmCertification Table**:

- Some certifications exist
- Status = "APPROVED"
- Type values match filters

---

## 🐛 TROUBLESHOOTING

### Issue: "No products found"

**Cause**: Database has no products or they're not ACTIVE

**Solution**:

```bash
# Run seed script (if available)
npm run db:seed

# Or manually add products in Prisma Studio
```

### Issue: Farm profile returns 404

**Cause**: Farm slug doesn't exist or farm not verified

**Solution**:

1. Open Prisma Studio
2. Check `Farm` table
3. Ensure slug = "green-valley-farm" exists
4. Set `status` = "ACTIVE"
5. Set `verificationStatus` = "VERIFIED"

### Issue: Filters not working

**Cause**: API endpoint not returning data

**Solution**:

1. Check terminal for errors
2. Verify DATABASE_URL is set
3. Test API endpoint directly:
   ```bash
   curl http://localhost:3001/api/marketplace/products
   ```
4. Check response for errors

### Issue: Images not showing

**Cause**: Image paths are placeholders

**Solution**:

- Images use placeholder paths
- Real images need to be uploaded
- For now, alt text and placeholders display

### Issue: TypeScript errors

**Solution**:

```bash
# Rebuild TypeScript
npm run build

# Check for specific errors
npx tsc --noEmit
```

---

## 📊 DEMO DATA

### Sample Products (Mock Data in Component)

```typescript
{
  id: "1",
  name: "Organic Heirloom Tomatoes",
  price: 5.99,
  category: "vegetables",
  farmName: "Green Valley Farm",
  distance: 12,
  organic: true,
  inStock: true
}
```

### Sample Farms (Mock Data in Page)

```typescript
{
  slug: "green-valley-farm",
  name: "Green Valley Farm",
  city: "Portland",
  state: "OR",
  rating: 4.8,
  reviewCount: 124,
  products: [...],
  reviews: [...]
}
```

---

## 🎨 UI COMPONENTS DEMO

### Filter Sidebar Features

**Test these interactions**:

- ✅ Collapsible sections
- ✅ Active filter badge count
- ✅ Reset button (only shows when filters active)
- ✅ Smooth transitions
- ✅ Responsive collapse on mobile

### Product Card Features

**Test these elements**:

- ✅ Hover effects (scale, shadow)
- ✅ Favorite heart toggle
- ✅ Add to cart button
- ✅ Organic badge
- ✅ Stock status overlay
- ✅ Rating stars
- ✅ Price display

### Tab Navigation Features

**Test these behaviors**:

- ✅ Active tab highlight
- ✅ Icon display
- ✅ Count badges
- ✅ Smooth tab switching
- ✅ URL doesn't change (client-side only)

---

## 🔗 QUICK LINKS

### Pages

- Products Marketplace: http://localhost:3001/marketplace/products
- Farm Profile 1: http://localhost:3001/marketplace/farms/green-valley-farm
- Farm Profile 2: http://localhost:3001/marketplace/farms/sunny-acres-orchard

### API Endpoints

- Products: http://localhost:3001/api/marketplace/products
- Farm Profile: http://localhost:3001/api/marketplace/farms/green-valley-farm
- Categories: http://localhost:3001/api/marketplace/products (OPTIONS)

### Tools

- Prisma Studio: http://localhost:5555
- Next.js Dev: http://localhost:3001

---

## 📈 PERFORMANCE EXPECTATIONS

### Page Load Times

- Products page: < 1 second
- Farm profile page: < 1 second
- API response: < 200ms

### Filter Response

- Filter update: < 100ms
- Search typing: Real-time (debounced)
- Sort change: Instant

### Mobile Performance

- Lighthouse score target: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

---

## ✅ VERIFICATION CHECKLIST

Before proceeding to Phase 4, verify:

- [ ] Products marketplace page loads
- [ ] Filters work correctly
- [ ] Grid/List view toggle works
- [ ] Farm profile page loads
- [ ] All 4 tabs switch properly
- [ ] Products display in tabs
- [ ] Reviews show correctly
- [ ] API endpoints return data
- [ ] Mobile responsive works
- [ ] No console errors (except expected logs)

---

## 🎯 NEXT STEPS

### After Testing Phase 3

1. **Review Implementation**
   - Read `IMPLEMENTATION_COMPLETE_PHASE3.md`
   - Check `WIREFRAME_IMPLEMENTATION_PROGRESS.md` updates

2. **Report Issues**
   - Document any bugs found
   - Note UX improvements needed
   - List missing features

3. **Prepare for Phase 4**
   - Review farmer dashboard current state
   - Plan enhancements needed
   - Prioritize features

---

## 💡 TIPS & TRICKS

### Quick Test Commands

```bash
# Clear Next.js cache
rm -rf .next

# Restart development server
npm run dev:omen

# View all routes
npm run dev:omen -- --debug

# Check database connection
npx prisma db execute --stdin <<< "SELECT 1"
```

### Browser DevTools

**Console Tab**:

- Watch for "Added to cart" logs
- Check for any error messages

**Network Tab**:

- Monitor API calls to `/api/marketplace/*`
- Check response times
- Verify data structure

**Elements Tab**:

- Inspect filter components
- Check responsive breakpoints
- Verify accessibility

---

## 📞 SUPPORT

### Common Questions

**Q: Where are the images?**  
A: Currently using placeholder paths. Real images need to be uploaded to `/public/images/`.

**Q: Can I add my own products?**  
A: Yes! Use Prisma Studio or the farmer dashboard (when available).

**Q: How do I seed test data?**  
A: Run `npm run db:seed` (if seed script exists) or manually add via Prisma Studio.

**Q: Filter isn't working?**  
A: Check that products have the required fields (category, price, etc.) in the database.

---

## 🏆 SUCCESS CRITERIA

Phase 3 is successful if:

- ✅ All filters work correctly
- ✅ Farm profile tabs display data
- ✅ API endpoints return proper responses
- ✅ Mobile responsive works
- ✅ No critical bugs

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Phase**: Farmer Dashboard Polish (Phase 4)

_"Discover local farms with divine precision."_ 🌾🔍
