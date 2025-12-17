# 🌾 Farmers Market Platform - Signup Page Guide

**Last Updated**: December 15, 2025  
**Status**: ✅ Fully Functional

---

## 📋 Overview

The signup page allows new users to create accounts for the Farmers Market Platform. The page includes comprehensive validation, password strength checking, and two distinct user account types.

---

## 🎯 Account Type Options

### The signup page provides TWO account type options:

### **Option 1: Buy Products (CONSUMER Account)** 🛒
- **Icon**: Shopping cart emoji 🛒
- **Label**: "Buy Products"
- **User Type**: CONSUMER
- **Purpose**: For customers who want to purchase farm products
- **Access**: Browse farms, view products, place orders, manage cart

### **Option 2: Sell Products (FARMER Account)** 🌾
- **Icon**: Wheat emoji 🌾
- **Label**: "Sell Products"
- **User Type**: FARMER
- **Purpose**: For farmers who want to sell their products
- **Access**: Create farm profiles, list products, manage inventory, view orders

---

## 🖥️ Signup Page Layout

### **Visual Structure:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🌾 Farmers Market                          │
│                                                         │
│              Create Account                             │
│         Join our agricultural community today           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Full Name                                             │
│  ┌───────────────────────────────────────────────┐    │
│  │ John Doe                                      │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Email Address                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │ you@example.com                               │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Password                                              │
│  ┌───────────────────────────────────────────────┐    │
│  │ ••••••••                                      │    │
│  └───────────────────────────────────────────────┘    │
│  [Password Strength Bar: Weak/Fair/Good/Strong]       │
│                                                         │
│  Confirm Password                                      │
│  ┌───────────────────────────────────────────────┐    │
│  │ ••••••••                                      │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  I want to:                                            │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │       🛒            │  │       🌾            │    │
│  │   Buy Products      │  │   Sell Products     │    │
│  └─────────────────────┘  └─────────────────────┘    │
│  ✓ Selected option highlighted in green               │
│                                                         │
│  ☐ I agree to the Terms of Service and Privacy Policy │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Create Account                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│         ─────── Already have an account? ───────      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │          Sign In Instead                        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│              ← Back to Home                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Form Fields Explained

### 1. **Full Name**
- **Required**: Yes
- **Min Length**: 2 characters
- **Max Length**: 50 characters
- **Example**: "John Doe"
- **Note**: Will be automatically split into firstName and lastName in database

### 2. **Email Address**
- **Required**: Yes
- **Format**: Valid email format
- **Example**: "john.doe@example.com"
- **Validation**: Must be unique (no duplicate accounts)

### 3. **Password**
- **Required**: Yes
- **Min Length**: 8 characters
- **Requirements**: 
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
- **Strength Indicator**: Shows password strength as you type
  - Weak (Red)
  - Fair (Orange)
  - Good (Yellow)
  - Strong (Green)
  - Very Strong (Emerald)

### 4. **Confirm Password**
- **Required**: Yes
- **Validation**: Must exactly match the password field

### 5. **Account Type Selection**
- **Required**: Yes
- **Options**: 
  - **CONSUMER** (Buy Products) 🛒
  - **FARMER** (Sell Products) 🌾
- **Visual Feedback**: Selected option is highlighted with:
  - Green border (agricultural-600 color)
  - Light green background (agricultural-50 color)
  - Checkmark icon in top-right corner ✓

### 6. **Terms Agreement**
- **Required**: Yes
- **Type**: Checkbox
- **Links**: 
  - Terms of Service: `/terms`
  - Privacy Policy: `/privacy`

---

## 🎨 Visual States

### **Account Type Selection Visual Feedback:**

#### **CONSUMER Selected (Default):**
```
┌──────────────────────┐  ┌──────────────────────┐
│  ✓                   │  │                      │
│       🛒             │  │       🌾             │
│   Buy Products       │  │   Sell Products      │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘
  Green Border/BG           Gray Border
```

#### **FARMER Selected:**
```
┌──────────────────────┐  ┌──────────────────────┐
│                      │  │  ✓                   │
│       🛒             │  │       🌾             │
│   Buy Products       │  │   Sell Products      │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘
  Gray Border               Green Border/BG
```

---

## ✅ How to Use the Signup Page

### **Step-by-Step Process:**

1. **Open the signup page**: http://localhost:3001/signup

2. **Fill in your full name**:
   - Example: "Jane Smith"
   - Will be stored as firstName: "Jane", lastName: "Smith"

3. **Enter your email address**:
   - Must be a valid email format
   - Must be unique (not already registered)

4. **Create a strong password**:
   - At least 8 characters
   - Include uppercase, lowercase, and numbers
   - Watch the strength indicator change as you type

5. **Confirm your password**:
   - Type the same password again
   - Must match exactly

6. **Choose your account type** (THIS IS THE IMPORTANT PART!):
   - **Click on the "Buy Products" card** if you want to be a customer 🛒
   - **Click on the "Sell Products" card** if you're a farmer 🌾
   - The selected card will turn green with a checkmark ✓

7. **Agree to terms**:
   - Check the "I agree to the Terms of Service and Privacy Policy" box

8. **Click "Create Account"**:
   - Button will show a loading spinner while processing
   - If successful, you'll be redirected to the login page
   - If there's an error, a red error message will appear at the top

---

## 🚨 Common Issues & Solutions

### **Issue 1: "No account type options visible"**

**Possible Causes:**
- CSS not loading properly
- JavaScript not executing
- Page not fully loaded

**Solutions:**
1. **Hard refresh the page**: Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache**: Settings → Clear browsing data
3. **Try a different browser**: Chrome, Firefox, Edge, Safari
4. **Check browser console**: Press `F12` → Console tab → Look for errors
5. **Ensure server is running**: Should see server running on port 3001

### **Issue 2: "Account type cards are gray/not clickable"**

**Solution:**
- The cards ARE clickable! Even if they look gray initially
- Click directly on the card area
- You should see it turn green when selected
- Look for the checkmark icon (✓) in the top-right corner

### **Issue 3: "Form validation errors"**

**Common Validation Errors:**
- ❌ "Name must be at least 2 characters"
- ❌ "Please enter a valid email address"
- ❌ "Password must be at least 8 characters"
- ❌ "Password must contain uppercase, lowercase, and number"
- ❌ "Passwords don't match"
- ❌ "Please select account type"
- ❌ "You must agree to the terms"

**Solution:**
- Read the error message carefully
- Fix the indicated field
- All fields must be valid before submission

### **Issue 4: "An account with this email already exists"**

**Solution:**
- The email is already registered
- Try logging in instead: http://localhost:3001/login
- Or use a different email address
- Use the "Forgot Password" feature if you don't remember your password

### **Issue 5: "Failed to create account"**

**Possible Causes:**
- Database connection issue
- Server error
- Network problem

**Solutions:**
1. **Check server is running**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check database is running**:
   ```bash
   netstat -an | findstr ":5433"
   ```

3. **Check browser console** (F12 → Console) for error details

4. **Check server logs** for error messages

---

## 🔍 How to Verify Account Type Selection

### **Before Submitting:**

1. **Visual Confirmation**:
   - Selected card has a **green border**
   - Selected card has a **light green background**
   - Selected card has a **checkmark (✓)** in the top-right corner

2. **Console Verification** (Developer Tools):
   - Open browser console (F12)
   - Submit the form
   - Look for the signup request payload
   - Should show `"userType": "CONSUMER"` or `"userType": "FARMER"`

### **After Account Creation:**

The account type determines:
- **CONSUMER**: Redirected to product browsing/shopping features
- **FARMER**: Redirected to farm management/product listing features

---

## 🌐 Browser Compatibility

The signup page works on:

✅ **Chrome** (Recommended)  
✅ **Firefox**  
✅ **Edge**  
✅ **Safari**  
✅ **Brave**  
✅ **Opera**

**Minimum Requirements:**
- JavaScript enabled
- Cookies enabled
- Modern browser (released within last 2 years)

---

## 📱 Mobile Responsive

The signup page is fully responsive:

- **Desktop**: Full two-column layout for account types
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Single column, touch-optimized buttons

---

## 🔐 Security Features

- ✅ **Password hashing**: Uses bcrypt with 12 rounds
- ✅ **HTTPS required** (in production)
- ✅ **CSRF protection**: Built into Next.js
- ✅ **XSS prevention**: React's built-in sanitization
- ✅ **Rate limiting**: Prevents brute force attacks
- ✅ **Email validation**: Prevents invalid emails
- ✅ **Duplicate prevention**: Checks existing accounts

---

## 📊 Password Strength Guide

### **Strength Levels:**

| Strength | Requirements | Color | Example |
|----------|-------------|-------|---------|
| **Weak** | < 8 chars | 🔴 Red | `pass123` |
| **Fair** | 8+ chars, basic mix | 🟠 Orange | `Password1` |
| **Good** | 12+ chars, good mix | 🟡 Yellow | `MyPass123!` |
| **Strong** | 12+ chars, all types | 🟢 Green | `MyStr0ng!Pass` |
| **Very Strong** | 12+ chars, complex | 🟢 Emerald | `MyV3ry$tr0ng!P@ss` |

### **Tips for Strong Passwords:**
- Use at least 12 characters
- Mix uppercase and lowercase
- Include numbers and symbols
- Avoid dictionary words
- Don't use personal information
- Use a password manager

---

## 🛠️ Testing the Signup

### **Test Account 1: Consumer**
```
Name: Test Consumer
Email: consumer@test.com
Password: TestPass123!
Account Type: Buy Products (CONSUMER)
```

### **Test Account 2: Farmer**
```
Name: Test Farmer
Email: farmer@test.com
Password: FarmPass123!
Account Type: Sell Products (FARMER)
```

### **Verification Steps:**
1. Fill in the form with test data
2. **Click on either "Buy Products" or "Sell Products" card**
3. Verify the card turns green with checkmark
4. Check the "I agree to terms" box
5. Click "Create Account"
6. Should redirect to login page with success message
7. Login with the credentials
8. Verify correct role/permissions based on account type

---

## 📞 Support

If you still don't see the account type options:

1. **Check server is running**: http://localhost:3001
2. **Check health endpoint**: http://localhost:3001/api/health
3. **Clear browser cache**: Ctrl+Shift+Delete
4. **Try incognito/private window**: Eliminates cache/extension issues
5. **Check browser console**: F12 → Console → Look for JavaScript errors
6. **Verify database connection**: Ensure PostgreSQL is running

---

## 🎯 Quick Checklist

Before creating an account, verify:

- [ ] ✅ Server is running on port 3001
- [ ] ✅ Database is accessible
- [ ] ✅ You can access http://localhost:3001/signup
- [ ] ✅ Page fully loads (no spinning/loading indicators)
- [ ] ✅ You can see the form fields
- [ ] ✅ You can see TWO cards for account types
- [ ] ✅ Cards are clickable and change appearance when clicked
- [ ] ✅ Browser console shows no errors (F12)

---

## 🎉 Success Indicators

You'll know the signup worked when:

1. ✅ Form submits without errors
2. ✅ Redirected to `/login?registered=true`
3. ✅ Login page shows "Registration successful" message
4. ✅ You can login with your new credentials
5. ✅ Dashboard shows appropriate role (Consumer or Farmer)

---

**The account type options ARE there! They're the two large clickable cards with emojis (🛒 and 🌾). If you still don't see them, please check the troubleshooting section above.**

---

**Last Updated**: December 15, 2025  
**Version**: 1.0  
**Status**: ✅ **FULLY FUNCTIONAL**