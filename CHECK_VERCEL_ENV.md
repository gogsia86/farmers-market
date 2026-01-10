# 🔍 Quick Check: Is SENTRY_AUTH_TOKEN on Vercel?

**Time**: 2 minutes  
**Task**: Verify if Sentry auth token is configured

---

## 🎯 Step-by-Step Verification

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Log in if needed

### **Step 2: Select Your Project**
- Look for: **Farmers Market Platform** (or similar name)
- Click on the project

### **Step 3: Open Environment Variables**
1. Click **"Settings"** in the top navigation
2. Click **"Environment Variables"** in the left sidebar

### **Step 4: Search for SENTRY_AUTH_TOKEN**
- Use browser search (Ctrl+F or Cmd+F)
- Search for: `SENTRY_AUTH_TOKEN`

---

## ✅ What You're Looking For

### **SCENARIO A: Token EXISTS** ✅
You'll see:
```
Name: SENTRY_AUTH_TOKEN
Value: sntrys_******************************** (hidden)
Environment: Production, Preview, Development
```

**✅ Result: Token is configured!**
→ Skip to deployment: Just commit and push your changes

---

### **SCENARIO B: Token MISSING** ❌
You won't find `SENTRY_AUTH_TOKEN` in the list.

**❌ Result: Need to add token**
→ Continue with Step 5 below

---

## 🔧 Step 5: Add Token (If Missing)

### **5.1: Get Token from Sentry**
1. Open: https://sentry.io/settings/medicis-gang/auth-tokens/
2. Click **"Create New Token"**
3. Name: `Vercel Production Deployment`
4. **Required Scopes** (check all):
   - ✅ `project:read`
   - ✅ `project:write`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click **"Create Token"**
6. **COPY THE TOKEN** (starts with `sntrys_`)
   ⚠️ You can only see it once!

### **5.2: Add to Vercel**
Back in Vercel Environment Variables page:

1. Click **"Add New"** button
2. Fill in:
   ```
   Name:  SENTRY_AUTH_TOKEN
   Value: (paste your token here)
   ```
3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Click **"Save"**

---

## ✅ Quick Verification Checklist

While you're in Vercel Environment Variables, verify these also exist:

- [ ] `SENTRY_AUTH_TOKEN` = `sntrys_***` (all environments)
- [ ] `SENTRY_ORG` = `medicis-gang` (all environments)
- [ ] `SENTRY_PROJECT` = `farmers-market-prod` (all environments)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` = `https://***` (all environments)
- [ ] `SENTRY_DSN` = `https://***` (all environments)

**If any are missing**, add them now using the same process.

---

## 🎯 What To Do After Checking

### **If Token EXISTS:**
```bash
# You're ready to deploy immediately!
git add next.config.mjs
git commit -m "fix: enable Sentry source maps for production error tracking"
git push origin main
```

### **If Token MISSING:**
1. Add token to Vercel (see Step 5 above)
2. Then deploy:
```bash
git add next.config.mjs
git commit -m "fix: enable Sentry source maps for production error tracking"
git push origin main
```

---

## 📊 Expected Vercel Build Output

After deployment, watch for these logs:

✅ **SUCCESS:**
```
✓ Compiled successfully
Sentry: Creating release...
Sentry: Uploading source maps...
✓ Source maps uploaded to Sentry
```

❌ **IF TOKEN MISSING:**
```
Error: SENTRY_AUTH_TOKEN is not set
```
→ Go back and add the token

❌ **IF TOKEN INVALID:**
```
401 Unauthorized
```
→ Regenerate token with correct scopes

---

## 🆘 Troubleshooting

### Can't find Environment Variables page?
- Make sure you selected the correct project
- Look for "Settings" tab in top navigation
- Then "Environment Variables" in left sidebar

### Don't have access to Vercel dashboard?
- Ask your team lead for access
- Or ask them to verify if `SENTRY_AUTH_TOKEN` exists

### Can't access Sentry dashboard?
- Ask for access to medicis-gang organization
- Or ask someone with access to create the token

---

## ⏱️ Time Estimate

- **Token exists**: 0 minutes (you're ready!)
- **Token missing**: 7 minutes (create + add)

---

## 📞 Need Help?

- **Detailed deployment guide**: See `DEPLOY_SENTRY_FIX.md`
- **Sentry token setup**: See `VERCEL_ENV_CHECKLIST.md`
- **Full analysis**: See `OPTIMIZATION_EXECUTIVE_SUMMARY.md`

---

**Status**: Quick check guide ready ✅  
**Next**: Verify token in Vercel, then deploy!