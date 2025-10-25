# 🎯 SERVER START - FINAL SOLUTION

## ⚡ THE REAL PROBLEM

There are **TWO** project roots:

1. `V:\Projects\Farmers-Market` ← CORRECT (version 1.0.0)
2. `V:\Projects\Farmers-Market\Farmers-Market` ← NESTED/OLD (version 0.1.0)

The nested one has old config that's causing errors!

## ✅ SOLUTION: Use Absolute Path

Run this command from ANY directory:

```powershell
cd V:\Projects\Farmers-Market; npm run dev
```

This ensures you're always in the CORRECT directory!

## 🚀 QUICK START (Copy & Paste)

```powershell
# Kill all Node, navigate to correct dir, start server
taskkill /F /IM node.exe 2>$null; cd V:\Projects\Farmers-Market; npm run dev
```

## ✅ Verification

Server should start with:

```
✓ Ready in 2.3s
- Local: http://localhost:3001
```

NO errors about "ERR_INVALID_ARG_TYPE"!

---

**Just run the command above and you're good to go!** 🎉
