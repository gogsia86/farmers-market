# 🌾 Swagger UI - Quick Reference Card

**Access URL:** http://localhost:3001/api-docs  
**API Spec:** http://localhost:3001/api/openapi.json  
**Version:** 1.0.0

---

## 🚀 Quick Start (30 Seconds)

1. Start server: `npm run dev`
2. Open: http://localhost:3001/api-docs
3. Browse endpoints, click "Try it out", execute requests

---

## 🔐 Authentication Setup (1 Minute)

### Option 1: Quick Test Token
```bash
# Sign in via API
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"password123"}'

# Copy token from response
# Paste into "JWT Authentication Token" field at top of page
```

### Option 2: Use Session Token
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('next-auth'))
// Copy token value
```

---

## 📖 Common Tasks

### Browse All Endpoints
- **Scroll** through the page
- **Click tags** to expand/collapse categories
- **Use filter** to search (top of page)

### Test Public Endpoint
```
1. Navigate to GET /api/health
2. Click "Try it out"
3. Click "Execute"
4. View response
```

### Test Protected Endpoint
```
1. Add JWT token (see Authentication above)
2. Navigate to GET /api/user/profile
3. Click "Try it out"
4. Click "Execute"
5. Token auto-injected → Response returns
```

### Create Resource
```
1. Navigate to POST /api/farms
2. Click "Try it out"
3. Fill request body (use example as template)
4. Click "Execute"
5. Check 201 Created response
```

### Filter Endpoints
```
Enter in filter box:
- "farm" → shows farm-related endpoints only
- "product" → shows product endpoints
- "order" → shows order endpoints
```

---

## 🎯 Navigation

### Quick Links (Top Bar)
- **Authentication** → Sign in/session endpoints
- **Farms** → Farm CRUD operations
- **Products** → Product catalog
- **Orders** → Order management
- **Cart** → Shopping cart
- **Schemas** → Type definitions

### URL Anchors
```
#tag/Farms           → Jump to Farms section
#tag/Products        → Jump to Products
#/components/schemas → Jump to Schemas
```

---

## 🐛 Troubleshooting (30-Second Fixes)

### Swagger UI Won't Load
```bash
# Hard refresh
Ctrl+Shift+R  (Windows/Linux)
Cmd+Shift+R   (Mac)

# Or restart server
npm run dev
```

### 401 Unauthorized
```
1. Click "Clear" button next to token field
2. Get fresh token via POST /api/auth/signin
3. Paste new token
4. Try again
```

### Can't See Response Body
```
1. Check response status (should be 200/201)
2. Click response section to expand
3. Check browser console for errors
4. Verify endpoint is working: curl http://localhost:3001/api/health
```

### Schemas Not Showing
```bash
# Validate OpenAPI spec
npx @apidevtools/swagger-cli validate docs/api/openapi.yaml

# Check for syntax errors in YAML
cat docs/api/openapi.yaml | head -n 50
```

---

## 📊 Endpoint Categories (32+)

| Category       | Endpoints | Auth Required |
|----------------|-----------|---------------|
| Health         | 2         | No            |
| Authentication | 2         | No            |
| Farms          | 5         | Mixed         |
| Products       | 5         | Mixed         |
| Orders         | 4         | Yes           |
| Cart           | 3         | Yes           |
| Checkout       | 1         | Yes           |
| Search         | 1         | No            |
| Favorites      | 3         | Yes           |
| Notifications  | 2         | Yes           |
| User Profile   | 2         | Yes           |
| Admin          | 2         | Yes (Admin)   |

---

## 🔑 HTTP Methods & Colors

- 🔵 **GET** (Blue) - Retrieve data
- 🟢 **POST** (Green) - Create resource
- 🟠 **PUT** (Orange) - Update resource
- 🔴 **DELETE** (Red) - Delete resource
- 🟣 **PATCH** (Purple) - Partial update

---

## 📝 Request Examples

### GET with Query Params
```http
GET /api/farms?page=1&pageSize=20&search=organic
```

### POST with Body
```json
POST /api/products
{
  "name": "Organic Tomatoes",
  "price": 4.99,
  "unit": "LB",
  "stock": 100,
  "farmId": "farm_abc123"
}
```

### PUT with Path Param
```http
PUT /api/farms/farm_abc123
{
  "name": "Updated Farm Name"
}
```

### DELETE with Auth
```http
DELETE /api/products/prod_xyz789
Authorization: Bearer eyJhbGc...
```

---

## 🎨 UI Features

### Buttons
- **Try it out** - Enable editing
- **Execute** - Send request
- **Cancel** - Disable editing
- **Clear** - Remove token

### Sections
- **Parameters** - Query/path/header params
- **Request body** - JSON payload
- **Responses** - Status codes & schemas
- **Curl** - Copy cURL command

### Response Display
- **Status code** (green = success, red = error)
- **Headers** (click to expand)
- **Body** (syntax highlighted JSON)
- **Duration** (request time in ms)

---

## 🔧 Configuration

### Swagger UI Options (SwaggerUI.tsx)
```typescript
docExpansion: "list"           // "none" | "list" | "full"
defaultModelsExpandDepth: 1    // Schema nesting depth
displayRequestDuration: true   // Show timing
filter: true                   // Enable search
tryItOutEnabled: true          // Enable testing
persistAuthorization: true     // Remember auth
```

### Caching (route.ts)
```typescript
Cache-Control: "public, max-age=3600"  // 1 hour
revalidate: 3600                       // ISR revalidation
```

---

## 📚 Documentation Links

| Resource                    | Location                           |
|----------------------------|------------------------------------|
| Full Swagger UI Guide      | `/docs/api/SWAGGER_UI.md`         |
| API Overview               | `/docs/api/README.md`              |
| Error Codes                | `/docs/api/ERROR_CODES.md`         |
| OpenAPI Spec (YAML)        | `/docs/api/openapi.yaml`           |
| Implementation Summary     | `/docs/SWAGGER_UI_INTEGRATION_COMPLETE.md` |

---

## 🎯 Keyboard Shortcuts

| Action              | Shortcut          |
|---------------------|-------------------|
| Search filter       | Click filter box  |
| Expand/collapse tag | Click tag name    |
| Expand endpoint     | Click endpoint    |
| Copy cURL           | Click "Copy"      |
| Hard refresh page   | Ctrl+Shift+R      |

---

## 💡 Pro Tips

1. **Use Filter** - Type "farm" to see only farm endpoints
2. **Copy cURL** - Use in Postman or terminal
3. **Save Token** - Persists in localStorage automatically
4. **Direct Links** - Share URLs with #tag/CategoryName
5. **Check Examples** - Each schema has example values
6. **Read Descriptions** - Hover for more details
7. **Test Errors** - Try invalid data to see error responses

---

## 🚀 Production Access

### Local
```
http://localhost:3001/api-docs
```

### Staging
```
https://staging.farmersmarket.com/api-docs
```

### Production
```
https://farmersmarket.com/api-docs
```

**Note:** Production access may be restricted (IP whitelist/auth)

---

## 📊 Status Codes

| Code | Meaning           | Example                  |
|------|-------------------|--------------------------|
| 200  | OK                | Successful GET           |
| 201  | Created           | Successful POST          |
| 204  | No Content        | Successful DELETE        |
| 400  | Bad Request       | Validation error         |
| 401  | Unauthorized      | Missing/invalid token    |
| 403  | Forbidden         | Insufficient permissions |
| 404  | Not Found         | Resource doesn't exist   |
| 500  | Internal Error    | Server error             |

---

## 🔄 Common Workflows

### Workflow 1: Explore API
```
1. Open /api-docs
2. Browse endpoint categories
3. Click endpoints to see details
4. Read request/response schemas
5. Note required parameters
```

### Workflow 2: Test Integration
```
1. Sign in via POST /api/auth/signin
2. Copy JWT token
3. Paste into auth field
4. Test protected endpoints
5. Verify responses match expectations
```

### Workflow 3: Debug Issue
```
1. Reproduce issue via Swagger UI
2. Check request payload
3. Verify response status/body
4. Copy cURL command
5. Test in terminal/Postman
6. Check server logs
```

### Workflow 4: Generate Client
```
1. Download spec: /api/openapi.json
2. Use OpenAPI Generator:
   npx @openapitools/openapi-generator-cli generate \
     -i openapi.json \
     -g typescript-fetch \
     -o ./client
3. Use generated client in app
```

---

## 🎓 Learning Resources

### Swagger UI
- Official Docs: https://swagger.io/docs/
- GitHub: https://github.com/swagger-api/swagger-ui

### OpenAPI
- Specification: https://spec.openapis.org/oas/v3.0.3
- Guide: https://oai.github.io/Documentation/

### Next.js
- Docs: https://nextjs.org/docs
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 📞 Support

### Need Help?
1. Read `/docs/api/SWAGGER_UI.md` (troubleshooting section)
2. Check GitHub Issues
3. Contact: api@farmersmarket.com

### Found a Bug?
1. Check console for errors (F12)
2. Note browser & version
3. Document steps to reproduce
4. Create GitHub issue

---

**Last Updated:** January 10, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

**🌾 Happy API Exploring!**